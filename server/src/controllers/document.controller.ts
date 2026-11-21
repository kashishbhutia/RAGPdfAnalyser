import { Request, Response, NextFunction } from 'express';
import { DocumentModel } from '../models/Document.model';
import { pdfService } from '../services/pdf.service';
import { chunkingService } from '../services/chunking.service';
import { embeddingService } from '../services/embedding.service';
import { vectorStoreService } from '../services/vectorStore.service';
import { ChatHistoryModel } from '../models/ChatHistory.model';
import { IEmbeddedChunk } from '../types';
import fs from 'fs';


export const uploadDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded' });
      return;
    }

    const file = req.file;

    const doc = await DocumentModel.create({
      fileName: file.filename,
      originalName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      status: 'processing',
    });

    res.status(202).json({
      success: true,
      message: 'Document uploaded, processing started',
      document: {
        _id: doc._id,
        originalName: doc.originalName,
        fileSize: doc.fileSize,
        status: doc.status,
      },
    });

    processDocument(doc._id.toString(), file.path).catch((err) => {
      console.error(`Failed to process document ${doc._id}:`, err);
    });
  } catch (error) {
    next(error);
  }
};


async function processDocument(docId: string, filePath: string): Promise<void> {
  try {
    console.log(`\nProcessing document ${docId}...`);

    // extracting text from pdf
    console.log('  -> Extracting text...');
    const { pages, pageCount } = await pdfService.extractTextByPages(filePath);

    // chunking the text
    console.log('  -> Chunking text...');
    const chunks = chunkingService.chunkText(
      pages.join('\n'),
      docId,
      pages
    );
    console.log(`  -> Created ${chunks.length} chunks`);

    // making embeddings
    console.log('  -> Generating embeddings...');
    const texts = chunks.map((c) => c.content);
    const embeddings = await embeddingService.embedBatch(texts);

    // storing vectors in json file
    console.log('  -> Storing vectors...');
    const embeddedChunks: IEmbeddedChunk[] = chunks.map((chunk, i) => ({
      ...chunk,
      embedding: embeddings[i],
    }));
    await vectorStoreService.addVectors(embeddedChunks);

    // updating document status
    await DocumentModel.findByIdAndUpdate(docId, {
      status: 'ready',
      pageCount,
      chunkCount: chunks.length,
    });

    console.log(`Document ${docId} processed successfully!\n`);
  } catch (error: any) {
    console.error(`Error processing document ${docId}:`, error.message);
    await DocumentModel.findByIdAndUpdate(docId, {
      status: 'error',
      errorMessage: error.message,
    });
  }
}

export const getDocuments = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const documents = await DocumentModel.find().sort({ uploadedAt: -1 });
    res.json({ success: true, documents });
  } catch (error) {
    next(error);
  }
};

export const getDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await DocumentModel.findById(req.params.id);
    if (!doc) {
      res.status(404).json({ success: false, error: 'Document not found' });
      return;
    }
    res.json({ success: true, document: doc });
  } catch (error) {
    next(error);
  }
};

// deleting a document and its vectors + chat history
export const deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await DocumentModel.findById(req.params.id);
    if (!doc) {
      res.status(404).json({ success: false, error: 'Document not found' });
      return;
    }

    // deleting vectors
    await vectorStoreService.deleteByDocumentId(doc._id.toString());

    // deleting chat history
    await ChatHistoryModel.deleteMany({ documentId: doc._id });

    // deleting file from disk
    const filePath = `uploads/${doc.fileName}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // deleting document record
    await DocumentModel.findByIdAndDelete(doc._id);

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
};
