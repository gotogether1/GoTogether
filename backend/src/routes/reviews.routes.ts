import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { ReviewService } from '../services/review.service.js';
import { createReviewSchema } from '../validators/index.js';

const router = Router();

router.use(authenticate as any);

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.auth!.uid;
    const { bookingId, recipientId, rating, text } = createReviewSchema.parse(req.body);
    const review = await ReviewService.createReview(uid, bookingId, recipientId, rating, text);
    res.status(201).json({ data: review });
  } catch (err) {
    next(err);
  }
});

router.get('/user/:uid', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviews = await ReviewService.getUserReviews(req.params.uid);
    res.json({ data: reviews });
  } catch (err) {
    next(err);
  }
});

export default router;
