import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { BlockService } from '../services/block.service.js';

const router = Router();

router.use(authenticate as any);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.auth!.uid;
    const blockedIds = await BlockService.getBlockedUsers(uid);
    res.json({ data: blockedIds });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.auth!.uid;
    const { blockedId } = req.body;
    await BlockService.blockUser(uid, blockedId);
    res.status(201).json({ data: { success: true } });
  } catch (err) {
    next(err);
  }
});

router.delete('/:blockedId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.auth!.uid;
    await BlockService.unblockUser(uid, req.params.blockedId);
    res.json({ data: { success: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
