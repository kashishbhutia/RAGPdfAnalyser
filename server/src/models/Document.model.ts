import mongoose, { Schema, Document as MongoDocument } from 'mongoose';
import { IDocument } from '../types';

export interface IDocumentModel extends IDocument, MongoDocument {}

const documentSchema = new Schema<IDocumentModel>(
  {
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    pageCount: { type: Number, default: 0 },
    chunkCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['processing', 'ready', 'error'],
      default: 'processing',
    },
    errorMessage: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const DocumentModel = mongoose.model<IDocumentModel>('Document', documentSchema);
