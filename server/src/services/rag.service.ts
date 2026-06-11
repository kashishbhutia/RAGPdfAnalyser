import { GoogleGenAI } from '@google/genai';
import { config } from '../config';
import { embeddingService } from './embedding.service';
import { vectorStoreService } from './vectorStore.service';
import { QueryResponse, SearchResult } from '../types';

export class RAGService {
  private client: GoogleGenAI;

  constructor() {
    this.client = new GoogleGenAI({ apiKey: config.geminiApiKey });
  }

  //  query → embed → retrieve → prompt → generate

  async query(userQuery: string, documentId: string): Promise<QueryResponse> {

    console.log('Embedding query...');
    const queryEmbedding = await embeddingService.embedText(userQuery);

    console.log('Retrieving relevant chunks...');
    const searchResults = await vectorStoreService.search(
      queryEmbedding,
      config.retrieval.topK,
      documentId
    );

    if (searchResults.length === 0) {
      return {
        answer: 'I could not find any relevant information in the uploaded document to answer your question. Please make sure the document has been properly processed and try rephrasing your question.',
        sources: [],
      };
    }

    // context from retrieved chunks
    const context = this.buildContext(searchResults);

    // answer using gemini LLM
    console.log('Generating answer...');
    const answer = await this.generateAnswer(userQuery, context);

    // format sources
    const sources = searchResults.map((result) => ({
      content: result.content.substring(0, 300) + '...',
      pageNumber: result.metadata.pageNumber,
      score: Math.round(result.score * 100) / 100,
    }));

    return { answer, sources };
  }


  // context string of results
  private buildContext(results: SearchResult[]): string {
    return results.map((r, i) =>
      `[Source ${i + 1} - Page ${r.metadata.pageNumber}]\n${r.content}`
    ).join('\n\n---\n\n');
  }

  // answer generation with gemini
  private async generateAnswer(query: string, context: string): Promise<string> {
    const systemPrompt = `You are an intelligent document analysis assistant. Your role is to answer questions based STRICTLY on the provided document context.

RULES:
1. Answer ONLY based on the information in the provided context.
2. If the context doesn't contain enough information to fully answer the question, say so clearly.
3. Reference specific page numbers when citing information (e.g., "According to page 3...").
4. Be concise but thorough. Use bullet points or numbered lists when appropriate.
5. Do NOT make up information or use knowledge outside the provided context.
6. If the question is ambiguous, address the most likely interpretation based on the context.`;

    const userPrompt = `DOCUMENT CONTEXT:${context}

USER QUESTION:
${query}

Please provide a detailed, accurate answer based solely on the document context above.`;

    const response = await this.client.models.generateContent({
      model: config.llm.model,
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
        },
      ],
      config: {
        maxOutputTokens: config.llm.maxTokens,
        temperature: config.llm.temperature,
      },
    });

    return response.text || 'Unable to generate a response. Please try again.';
  }
}

export const ragService = new RAGService();
