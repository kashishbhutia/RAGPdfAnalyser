import { useState } from 'react';
import type { ISource } from '../types';

interface MessageBubbleProps {
  role: 'user' | 'ai';
  content: string;
  sources?: ISource[];
}

export default function MessageBubble({ role, content, sources }: MessageBubbleProps) {
  const [showSources, setShowSources] = useState(false);

  return (
    <div className={`message ${role}`}>
      <div className="message-avatar">
        {role === 'user' ? '👤' : '🤖'}
      </div>

      <div className="message-content">
        <div className="message-text">
          {content.split('\n').map((line, i) => (
            <p key={i}>{line || '\u00A0'}</p>
          ))}
        </div>

        {sources && sources.length > 0 && (
          <div className="message-sources">
            <button
              className="sources-toggle"
              onClick={() => setShowSources(!showSources)}
            >
              📚 {showSources ? 'Hide' : 'Show'} Sources ({sources.length})
              <span style={{ fontSize: '10px' }}>{showSources ? '▲' : '▼'}</span>
            </button>

            {showSources && (
              <div className="sources-list">
                {sources.map((source, idx) => (
                  <div key={idx} className="source-item">
                    <div className="source-item-header">
                      <span>📄 Page {source.pageNumber}</span>
                      <span className="source-item-score">
                        {Math.round(source.score * 100)}% match
                      </span>
                    </div>
                    <div>{source.content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
