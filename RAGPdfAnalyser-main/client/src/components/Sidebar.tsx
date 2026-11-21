import type { IDocument } from '../types';
import DocumentList from './DocumentList';

interface SidebarProps {
  documents: IDocument[];
  activeDocId: string | null;
  onSelectDoc: (doc: IDocument) => void;
  onDeleteDoc: (docId: string) => void;
  onUploadClick: () => void;
}

export default function Sidebar({
  documents,
  activeDocId,
  onSelectDoc,
  onDeleteDoc,
  onUploadClick,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">Your Documents</div>
        <button className="upload-btn" onClick={onUploadClick}>
          <span>📤</span>
          <span>Upload PDF</span>
        </button>
      </div>

      <DocumentList
        documents={documents}
        activeDocId={activeDocId}
        onSelect={onSelectDoc}
        onDelete={onDeleteDoc}
      />
    </aside>
  );
}
