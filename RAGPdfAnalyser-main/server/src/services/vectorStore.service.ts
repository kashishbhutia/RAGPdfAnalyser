import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { IEmbeddedChunk, SearchResult } from '../types';

export class VectorStoreService {
  private vectors: IEmbeddedChunk[] = [];
  private storePath: string;

  constructor() {
    this.storePath = config.vectorStorePath;
    this.ensureDirectory();
    this.loadFromDisk();
  }

  private ensureDirectory(): void {
    if (!fs.existsSync(this.storePath)) {
      fs.mkdirSync(this.storePath, { recursive: true });
    }
  }

  private getFilePath(): string {
    return path.join(this.storePath, 'vectors.json');
  }

  private loadFromDisk(): void {
    const filePath = this.getFilePath();
    if (fs.existsSync(filePath)) {
      try {
        const data = fs.readFileSync(filePath, 'utf-8');
        this.vectors = JSON.parse(data);
        console.log(`Loaded ${this.vectors.length} vectors from disk`);
      } catch (error) {
        console.error('Failed to load vector store:', error);
        this.vectors = [];
      }
    }
  }

  private saveToDisk(): void {
    const filePath = this.getFilePath();
    fs.writeFileSync(filePath, JSON.stringify(this.vectors), 'utf-8');
  }


  async addVectors(chunks: IEmbeddedChunk[]): Promise<void> {
    this.vectors.push(...chunks);
    this.saveToDisk();
    console.log(`Added ${chunks.length} vectors (total: ${this.vectors.length})`);
  }

  async search(queryEmbedding: number[], topK: number = config.retrieval.topK, documentId?: string): Promise<SearchResult[]> {
    let candidates = this.vectors;

    if (documentId) {
      candidates = candidates.filter((v) => v.metadata.documentId === documentId);
    }

    if (candidates.length === 0) {
      return [];
    }

    const scored = candidates.map((candidate) => ({
      content: candidate.content,
      metadata: candidate.metadata,
      score: this.cosineSimilarity(queryEmbedding, candidate.embedding),
    }));

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, topK);
  }

  async deleteByDocumentId(documentId: string): Promise<number> {
    const before = this.vectors.length;
    this.vectors = this.vectors.filter((v) => v.metadata.documentId !== documentId);
    const deleted = before - this.vectors.length;
    this.saveToDisk();
    console.log(`Deleted ${deleted} vectors for document ${documentId}`);
    return deleted;
  }

  getStats(): { totalVectors: number; documentIds: string[] } {
    const documentIds = [...new Set(this.vectors.map((v) => v.metadata.documentId))];
    return {
      totalVectors: this.vectors.length,
      documentIds,
    };
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }

    const denominator = Math.sqrt(magA) * Math.sqrt(magB);
    if (denominator === 0) return 0;

    return dotProduct / denominator;
  }
}

export const vectorStoreService = new VectorStoreService();
