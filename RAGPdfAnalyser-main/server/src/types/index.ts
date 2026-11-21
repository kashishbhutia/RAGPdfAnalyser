import { Types } from 'mongoose';

export interface IDocument {
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  pageCount: number;
  chunkCount: number;
  status: 'processing' | 'ready' | 'error';
  errorMessage?: string;
  uploadedAt: Date;
}

export interface IChatHistory {
  documentId: Types.ObjectId;
  query: string;
  answer: string;
  sources: ISource[];
  createdAt: Date;
}

export interface ISource {
  content: string;
  pageNumber: number;
  score: number;
}

export interface IChunk {
  content: string;
  metadata: {
    documentId: string;
    pageNumber: number;
    chunkIndex: number;
  };
}

export interface IEmbeddedChunk extends IChunk {
  embedding: number[];
}

export interface SearchResult {
  content: string;
  metadata: {
    documentId: string;
    pageNumber: number;
    chunkIndex: number;
  };
  score: number;
}

export interface QueryResponse {
  answer: string;
  sources: ISource[];
}
