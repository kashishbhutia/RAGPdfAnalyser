import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  vectorStorePath: process.env.VECTOR_STORE_PATH || '',
  uploadPath: path.resolve(__dirname, '../../uploads'),
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '20971520', 10),
  embedding: {
    model: 'gemini-embedding-001',
    dimensions: 768,
  },
  llm: {
    model: 'gemini-2.5-flash',
    maxTokens: 1024,
    temperature: 0.2,
  },
  chunking: {
    chunkSize: 1000,
    chunkOverlap: 200,
  },
  retrieval: {
    topK: 5,
  },
} as const;
