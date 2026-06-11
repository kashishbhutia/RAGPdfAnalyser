import { useState, useRef, useEffect } from 'react';
import type { IChatMessage, IDocument } from '../types';
import { queryDocument } from '../services/api';
import MessageBubble from './MessageBubble';

interface ChatInterfaceProps {
  document: IDocument;
  messages: IChatMessage[];
  onNewMessage: (messages: IChatMessage[]) => void;
}

export default function ChatInterface({ document, messages, onNewMessage }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [document._id]);

  const handleSend = async () => {
    const query = input.trim();
    if (!query || isLoading) return;

    const userMsg: IChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMsg];
    onNewMessage(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const result = await queryDocument(document._id, query);

      const aiMsg: IChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: result.answer,
        sources: result.sources,
        timestamp: new Date(),
      };

      onNewMessage([...updatedMessages, aiMsg]);
    } catch (err: any) {
      const errorMsg: IChatMessage = {
        id: `ai-error-${Date.now()}`,
        role: 'ai',
        content: `Sorry, I encountered an error: ${err.message}. Please try again.`,
        timestamp: new Date(),
      };

      onNewMessage([...updatedMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isDocReady = document.status === 'ready';

  return (
    <div className="chat-area">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">💬</div>
            <h2 className="empty-state-title">
              <span className="gradient-text">Ask anything</span> about your document
            </h2>
            <p className="empty-state-description">
              <strong>{document.originalName}</strong> is ready for questions.
              Ask about specific topics, request summaries, or explore the content.
            </p>
            <div className="empty-state-steps">
              <div className="empty-state-step">
                <span className="empty-state-step-icon">❓</span>
                <span className="empty-state-step-label">Ask a question</span>
              </div>
              <div className="empty-state-step">
                <span className="empty-state-step-icon">🔍</span>
                <span className="empty-state-step-label">Semantic search</span>
              </div>
              <div className="empty-state-step">
                <span className="empty-state-step-icon">📊</span>
                <span className="empty-state-step-label">Get insights</span>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            sources={msg.sources}
          />
        ))}

        {isLoading && (
          <div className="typing-indicator">
            <div className="message-avatar" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)' }}>
              🤖
            </div>
            <div className="typing-dots">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder={
              isDocReady
                ? `Ask about "${document.originalName}"...`
                : 'Document is still processing...'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!isDocReady || isLoading}
            rows={1}
          />
          <button
            className="chat-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || !isDocReady || isLoading}
            title="Send message"
          >
            ➤
          </button>
        </div>
        <div className="chat-input-hint">
          Press Enter to send • Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}
