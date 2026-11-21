import { useState, useRef, useCallback } from 'react';
import { uploadDocument } from '../services/api';
import type { IDocument } from '../types';

interface DocumentUploadProps {
  onClose: () => void;
  onUploaded: (doc: IDocument) => void;
}

type UploadState = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

export default function DocumentUpload({ onClose, onUploaded }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      setErrorMsg('Only PDF files are supported');
      return;
    }
    if (selectedFile.size > 20 * 1024 * 1024) {
      setErrorMsg('File size must be under 20MB');
      return;
    }
    setFile(selectedFile);
    setErrorMsg('');
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFile(droppedFile);
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (!file) return;

    setUploadState('uploading');
    setErrorMsg('');

    try {
      setUploadState('processing');
      const result = await uploadDocument(file);
      setUploadState('done');

      if (result.document) {
        onUploaded(result.document);
      }

      setTimeout(onClose, 1200);
    } catch (err: any) {
      setUploadState('error');
      setErrorMsg(err.message || 'Upload failed');
    }
  };

  const statusMessages: Record<UploadState, string> = {
    idle: '',
    uploading: 'Uploading file...',
    processing: 'Processing PDF — extracting text, chunking, and generating embeddings...',
    done: '✅ Document uploaded and processing started!',
    error: `❌ ${errorMsg}`,
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">
          <span className="gradient-text">Upload</span> Document
        </h2>

        {!file ? (
          <div
            className={`drop-zone ${isDragging ? 'dragging' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="drop-zone-icon">📤</div>
            <div className="drop-zone-text">
              {isDragging ? 'Drop your PDF here!' : 'Drag & drop a PDF here, or click to browse'}
            </div>
            <div className="drop-zone-hint">PDF files only • Max 20MB</div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>
        ) : (
          <div className="upload-progress">
            <div className="upload-file-info">
              <span className="upload-file-icon">📄</span>
              <span className="upload-file-name">{file.name}</span>
              <span className="upload-file-size">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>

            {uploadState !== 'idle' && (
              <>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width:
                        uploadState === 'uploading'
                          ? '30%'
                          : uploadState === 'processing'
                          ? '70%'
                          : uploadState === 'done'
                          ? '100%'
                          : '0%',
                    }}
                  />
                </div>
                <div className="upload-status-text">{statusMessages[uploadState]}</div>
              </>
            )}

            {uploadState === 'idle' && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  className="upload-btn"
                  style={{ flex: 1, border: '1px solid var(--glass-border)' }}
                  onClick={() => {
                    setFile(null);
                    setErrorMsg('');
                  }}
                >
                  Change File
                </button>
                <button
                  className="chat-send-btn"
                  style={{ width: 'auto', padding: '12px 24px', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'var(--font-family)' }}
                  onClick={handleUpload}
                >
                  🚀 Upload & Process
                </button>
              </div>
            )}

            {uploadState === 'error' && (
              <div style={{ marginTop: '12px' }}>
                <button
                  className="upload-btn"
                  onClick={() => {
                    setUploadState('idle');
                    setErrorMsg('');
                  }}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}

        {errorMsg && uploadState === 'idle' && (
          <div style={{ marginTop: '12px', color: 'var(--status-error)', fontSize: '0.8125rem' }}>
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}
