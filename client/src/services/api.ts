import type { IDocument, IChatHistoryItem } from '../types';


const API_BASE = `${import.meta.env.VITE_BASE_URL}`;

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }
  return data;
}

// documents api

export async function uploadDocument(file: File): Promise<{ success: boolean; document: IDocument; message: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse(response);
}

export async function getDocuments(): Promise<{ success: boolean; documents: IDocument[] }> {
  const response = await fetch(`${API_BASE}/documents`);
  return handleResponse(response);
}

export async function getDocument(id: string): Promise<{ success: boolean; document: IDocument }> {
  const response = await fetch(`${API_BASE}/documents/${id}`);
  return handleResponse(response);
}

export async function deleteDocument(id: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/documents/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

// chat api
export async function queryDocument(
  documentId: string,
  query: string
): Promise<{ success: boolean; answer: string; sources: Array<{ content: string; pageNumber: number; score: number }> }> {
  const response = await fetch(`${API_BASE}/chat/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId, query }),
  });

  return handleResponse(response);
}

export async function getChatHistory(
  documentId: string
): Promise<{ success: boolean; history: IChatHistoryItem[] }> {
  const response = await fetch(`${API_BASE}/chat/history/${documentId}`);
  return handleResponse(response);
}

// health

export async function checkHealth(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return handleResponse(response);
  } catch {
    return { success: false, message: 'Server unreachable' };
  }
}
