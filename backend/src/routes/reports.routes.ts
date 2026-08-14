import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { ReportService } from '../services/report.service.js';
import { createReportSchema } from '../validators/index.js';

const router = Router();

router.use(authenticate as any);

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.auth!.uid;
    const validated = createReportSchema.parse(req.body);
    const report = await ReportService.createReport({ reporterId: uid, ...validated });
    res.status(201).json({ data: report });
  } catch (err) {
    next(err);
  }
});

export default router;
