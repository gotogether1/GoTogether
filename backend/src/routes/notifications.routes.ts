import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { NotificationService } from '../services/notification.service.js';

const router = Router();

router.use(authenticate as any);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.auth!.uid;
    const notifications = await NotificationService.getNotifications(uid);
    res.json({ data: notifications });
  } catch (err) {
    next(err);
  }
});

router.get('/unread-count', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.auth!.uid;
    const count = await NotificationService.getUnreadCount(uid);
    res.json({ data: { unreadCount: count } });
  } catch (err) {
    next(err);
  }
});

router.post('/:notificationId/read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.auth!.uid;
    await NotificationService.markRead(uid, req.params.notificationId);
    res.json({ data: { success: true } });
  } catch (err) {
    next(err);
  }
});

router.post('/read-all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.auth!.uid;
    await NotificationService.markAllRead(uid);
    res.json({ data: { success: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
