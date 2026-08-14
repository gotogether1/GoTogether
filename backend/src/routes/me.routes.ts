import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { UserService } from '../services/user.service.js';

const router = Router();

router.use(authenticate as any);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.auth!.uid;
    const profile = await UserService.getProfile(uid);
    res.json({ data: profile });
  } catch (err) {
    next(err);
  }
});

router.patch('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.auth!.uid;
    const updated = await UserService.updateProfile(uid, req.body);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.auth!.uid;
    await UserService.deleteProfile(uid);
    res.json({ data: { success: true, message: 'Account deleted successfully' } });
  } catch (err) {
    next(err);
  }
});

export default router;
