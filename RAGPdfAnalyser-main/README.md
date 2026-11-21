# 📄 Smart Document Analyzer

> RAG-powered PDF Q&A system — Upload documents, ask questions, get AI-grounded answers.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-8E75B2?style=flat&logo=googlegemini&logoColor=white)

## Features

- **📤 PDF Upload** — Drag & drop PDF documents for processing
- **⚡ Auto-Processing** — Automatic text extraction, chunking, and embedding generation
- **🔍 Semantic Search** — Find relevant content using cosine similarity on embeddings
- **💬 Conversational Q&A** — Ask questions and get answers grounded in your documents
- **📚 Source Citations** — Every answer includes page-level source references
- **📜 Chat History** — Persistent conversation history per document

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| Backend | Express.js + TypeScript |
| Database | MongoDB + Mongoose |
| Vector Store | In-memory cosine similarity with JSON persistence |
| AI | Google Gemini (gemini-embedding-001 + gemini-2.0-flash) |
| PDF Processing | pdf-parse |

## Prerequisites

- **Node.js** 18+
- **MongoDB** (local or Atlas)
- **Gemini API Key**

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/Sahilagarwal623/RAGPdfAnalyser.git
cd RagAgentSummarizer
npm run install:all
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and add your:
#   - GEMINI_API_KEY
#   - MONGODB_URI (default: mongodb://localhost:27017/smart-doc-analyzer)
```

### 3. Start Development

```bash
# Start both client and server concurrently
npm run dev

# Or start individually:
npm run dev:server   # Backend on http://localhost:5000
npm run dev:client   # Frontend on http://localhost:5173
```

### 4. Use the App

1. Open http://localhost:5173
2. Click **Upload PDF** in the sidebar
3. Drop a PDF file
4. Wait for processing (extraction → chunking → embedding)
5. Ask questions about your document!

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/documents/upload` | Upload PDF (multipart/form-data) |
| `GET` | `/api/documents` | List all documents |
| `GET` | `/api/documents/:id` | Get document details |
| `DELETE` | `/api/documents/:id` | Delete document |
| `POST` | `/api/chat/query` | Ask a question |
| `GET` | `/api/chat/history/:documentId` | Get chat history |
| `GET` | `/api/health` | Health check |

## Architecture

```
PDF Upload → Text Extraction → Chunking → Embedding → Vector Store
                                                          ↓
User Query → Query Embedding → Semantic Search → Context → LLM → Answer
```

## License

MIT
