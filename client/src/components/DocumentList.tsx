import type { IDocument } from '../types';

interface DocumentListProps {
  documents: IDocument[];
  activeDocId: string | null;
  onSelect: (doc: IDocument) => void;
  onDelete: (docId: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return date.toLocaleDateString();
}

export default function DocumentList({ documents, activeDocId, onSelect, onDelete }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div style={{ padding: '24px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }}>📂</div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
          No documents yet. Upload a PDF to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="sidebar-list">
      {documents.map((doc) => (
        <div
          key={doc._id}
          className={`doc-card ${activeDocId === doc._id ? 'active' : ''}`}
          onClick={() => onSelect(doc)}
        >
          <div className="doc-card-name" title={doc.originalName}>
            📄 {doc.originalName}
          </div>
          <div className="doc-card-meta">
            <span className={`doc-card-status ${doc.status}`}>
              {doc.status === 'processing' && '⏳ '}
              {doc.status === 'ready' && '✓ '}
              {doc.status === 'error' && '✕ '}
              {doc.status}
            </span>
            <span>•</span>
            <span>{formatFileSize(doc.fileSize)}</span>
            {doc.pageCount > 0 && (
              <>
                <span>•</span>
                <span>{doc.pageCount} pages</span>
              </>
            )}
          </div>
          <div className="doc-card-meta" style={{ marginTop: '4px' }}>
            <span>{formatDate(doc.uploadedAt)}</span>
            {doc.chunkCount > 0 && (
              <>
                <span>•</span>
                <span>{doc.chunkCount} chunks</span>
              </>
            )}
          </div>
          <div className="doc-card-actions">
            <button
              className="doc-card-delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(doc._id);
              }}
            >
              🗑 Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
