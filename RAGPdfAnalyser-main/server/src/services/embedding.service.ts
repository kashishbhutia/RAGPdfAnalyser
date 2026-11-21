import { GoogleGenAI } from '@google/genai';
import { config } from '../config';

export class EmbeddingService {
  private client: GoogleGenAI;
  private model: string;

  constructor() {
    this.client = new GoogleGenAI({ apiKey: config.geminiApiKey });
    this.model = config.embedding.model;
  }


  // embedding for a single text
  async embedText(text: string): Promise<number[]> {
    const response = await this.client.models.embedContent({
      model: this.model,
      contents: text,
      config: {
        outputDimensionality: config.embedding.dimensions,
      },
    });

    return response.embeddings?.[0]?.values || [];
  }


  // embedding for multiple texts in batch
  async embedBatch(texts: string[]): Promise<number[][]> {
    const batchSize = 100;
    const allEmbeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);

      const response = await this.client.models.embedContent({
        model: this.model,
        contents: batch,
        config: {
          outputDimensionality: config.embedding.dimensions,
        },
      });

      const embeddings = (response.embeddings || []).map((e) => e.values || []);
      allEmbeddings.push(...embeddings);

      // avoiding rate limit
      if (i + batchSize < texts.length) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    return allEmbeddings;
  }
}

export const embeddingService = new EmbeddingService();
