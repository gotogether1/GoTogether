import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { ChatService } from '../services/chat.service.js';

const router = Router();

router.use(authenticate as any);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.auth!.uid;
    const conversations = await ChatService.getConversations(uid);
    res.json({ data: conversations });
  } catch (err) {
    next(err);
  }
});

router.get('/:bookingId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.auth!.uid;
    const conversation = await ChatService.getConversation(uid, req.params.bookingId);
    res.json({ data: conversation });
  } catch (err) {
    next(err);
  }
});

router.get('/:bookingId/messages', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.auth!.uid;
    const messages = await ChatService.getMessages(uid, req.params.bookingId);
    res.json({ data: messages });
  } catch (err) {
    next(err);
  }
});

router.post('/:bookingId/messages', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.auth!.uid;
    const { body } = req.body;
    const message = await ChatService.sendMessage(uid, req.params.bookingId, body);
    res.status(201).json({ data: message });
  } catch (err) {
    next(err);
  }
});

export default router;
