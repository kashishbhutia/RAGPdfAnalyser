import { Request, Response, NextFunction } from 'express';
import { ragService } from '../services/rag.service';
import { ChatHistoryModel } from '../models/ChatHistory.model';
import { DocumentModel } from '../models/Document.model';
import mongoose from 'mongoose';

export const queryDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { documentId, query } = req.body;

    if (!documentId || !query) {
      res.status(400).json({
        success: false,
        error: 'Both documentId and query are required',
      });
      return;
    }

    const doc = await DocumentModel.findById(documentId);
    if (!doc) {
      res.status(404).json({ success: false, error: 'Document not found' });
      return;
    }
    if (doc.status !== 'ready') {
      res.status(400).json({
        success: false,
        error: `Document is not ready yet for querying. Current status: ${doc.status}`,
      });
      return;
    }

    // running RAG pipeline
    const result = await ragService.query(query, documentId);

    // saving chat history
    await ChatHistoryModel.create({
      documentId: new mongoose.Types.ObjectId(documentId),
      query,
      answer: result.answer,
      sources: result.sources,
    });

    res.json({
      success: true,
      answer: result.answer,
      sources: result.sources,
    });
  } catch (error) {
    next(error);
  }
};


export const getChatHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { documentId } = req.params;

    const history = await ChatHistoryModel.find({ documentId })
      .sort({ createdAt: 1 })
      .lean();

    res.json({ success: true, history });
  } catch (error) {
    next(error);
  }
};
