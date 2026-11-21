import { useState, useEffect, useCallback } from 'react';
import type { IDocument, IChatMessage } from '../types';
import { getDocuments, deleteDocument, getDocument, getChatHistory } from '../services/api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ChatInterface from '../components/ChatInterface';
import DocumentUpload from '../components/DocumentUpload';

export default function Home() {
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [activeDoc, setActiveDoc] = useState<IDocument | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [chatMessages, setChatMessages] = useState<Record<string, IChatMessage[]>>({});

  const fetchDocuments = useCallback(async () => {
    try {
      const result = await getDocuments();
      if (result.success) {
        setDocuments(result.documents);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Poll for processing documents
  useEffect(() => {
    const processingDocs = documents.filter((d) => d.status === 'processing');
    if (processingDocs.length === 0) return;

    const interval = setInterval(async () => {
      for (const doc of processingDocs) {
        try {
          const result = await getDocument(doc._id);
          if (result.success && result.document.status !== 'processing') {
            setDocuments((prev) =>
              prev.map((d) => (d._id === doc._id ? result.document : d))
            );
            if (activeDoc?._id === doc._id) {
              setActiveDoc(result.document);
            }
          }
        } catch (err) {
          console.error('Failed to poll document:', err);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [documents, activeDoc]);

  // loading chat history when selecting a document
  const handleSelectDoc = useCallback(async (doc: IDocument) => {
    setActiveDoc(doc);

    if (!chatMessages[doc._id]) {
      try {
        const result = await getChatHistory(doc._id);
        if (result.success && result.history.length > 0) {
          const messages: IChatMessage[] = result.history.flatMap((h) => [
            {
              id: `user-${h._id}`,
              role: 'user' as const,
              content: h.query,
              timestamp: new Date(h.createdAt),
            },
            {
              id: `ai-${h._id}`,
              role: 'ai' as const,
              content: h.answer,
              sources: h.sources,
              timestamp: new Date(h.createdAt),
            },
          ]);
          setChatMessages((prev) => ({ ...prev, [doc._id]: messages }));
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    }
  }, [chatMessages]);

  const handleDeleteDoc = useCallback(async (docId: string) => {
    if (!window.confirm('Delete this document and all its data?')) return;

    try {
      await deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d._id !== docId));
      if (activeDoc?._id === docId) {
        setActiveDoc(null);
      }
      setChatMessages((prev) => {
        const updated = { ...prev };
        delete updated[docId];
        return updated;
      });
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  }, [activeDoc]);

  const handleUploaded = useCallback((doc: IDocument) => {
    setDocuments((prev) => [doc, ...prev]);
    setActiveDoc(doc);
  }, []);

  const handleNewMessage = useCallback((docId: string, messages: IChatMessage[]) => {
    setChatMessages((prev) => ({ ...prev, [docId]: messages }));
  }, []);

  return (
    <>
      <Header />
      <div className="app-layout">
        <Sidebar
          documents={documents}
          activeDocId={activeDoc?._id || null}
          onSelectDoc={handleSelectDoc}
          onDeleteDoc={handleDeleteDoc}
          onUploadClick={() => setShowUpload(true)}
        />

        <div className="main-content">
          {activeDoc ? (
            <ChatInterface
              document={activeDoc}
              messages={chatMessages[activeDoc._id] || []}
              onNewMessage={(msgs) => handleNewMessage(activeDoc._id, msgs)}
            />
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🧠</div>
              <h1 className="empty-state-title">
                <span className="gradient-text">Smart Document</span> Analyzer
              </h1>
              <p className="empty-state-description">
                Upload a PDF document and ask questions about its content.
                Powered by RAG (Retrieval-Augmented Generation) for accurate,
                context-grounded answers.
              </p>
              <div className="empty-state-steps">
                <div className="empty-state-step">
                  <span className="empty-state-step-icon">📤</span>
                  <span className="empty-state-step-label">Upload PDF</span>
                </div>
                <div className="empty-state-step">
                  <span className="empty-state-step-icon">⚡</span>
                  <span className="empty-state-step-label">Auto-process</span>
                </div>
                <div className="empty-state-step">
                  <span className="empty-state-step-icon">💬</span>
                  <span className="empty-state-step-label">Ask questions</span>
                </div>
                <div className="empty-state-step">
                  <span className="empty-state-step-icon">🎯</span>
                  <span className="empty-state-step-label">Get answers</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {showUpload && (
          <DocumentUpload
            onClose={() => setShowUpload(false)}
            onUploaded={handleUploaded}
          />
        )}
      </div>
    </>
  );
}
