import { Router } from 'express';
import { queryDocument, getChatHistory } from '../controllers/chat.controller';

const router = Router();

router.post('/query', queryDocument);
router.get('/history/:documentId', getChatHistory);

export default router;
