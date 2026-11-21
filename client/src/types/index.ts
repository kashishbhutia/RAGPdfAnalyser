export interface IDocument {
  _id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  pageCount: number;
  chunkCount: number;
  status: 'processing' | 'ready' | 'error';
  errorMessage?: string;
  uploadedAt: string;
}

export interface ISource {
  content: string;
  pageNumber: number;
  score: number;
}

export interface IChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  sources?: ISource[];
  timestamp: Date;
}

export interface IChatHistoryItem {
  _id: string;
  documentId: string;
  query: string;
  answer: string;
  sources: ISource[];
  createdAt: string;
}

export interface ApiResponse {
  success: boolean;
  error?: string;
  message?: string;
  [key: string]: unknown;
}
