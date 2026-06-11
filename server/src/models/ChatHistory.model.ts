import mongoose, { Schema, Document as MongoDocument } from 'mongoose';
import { IChatHistory } from '../types';

export interface IChatHistoryModel extends IChatHistory, MongoDocument {}

const sourceSchema = new Schema(
  {
    content: { type: String, required: true },
    pageNumber: { type: Number, required: true },
    score: { type: Number, required: true },
  },
  { _id: false }
);

const chatHistorySchema = new Schema<IChatHistoryModel>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
    query: { type: String, required: true },
    answer: { type: String, required: true },
    sources: [sourceSchema],
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const ChatHistoryModel = mongoose.model<IChatHistoryModel>('ChatHistory', chatHistorySchema);
