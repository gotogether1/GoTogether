import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { BookingService } from '../services/booking.service.js';

const router = Router();

router.use(authenticate as any);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.auth!.uid;
    const bookings = await BookingService.listUserBookings(uid);
    res.json({ data: bookings });
  } catch (err) {
    next(err);
  }
});

router.post('/:bookingId/approve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.auth!.uid;
    const booking = await BookingService.approveBooking(uid, req.params.bookingId);
    res.json({ data: booking });
  } catch (err) {
    next(err);
  }
});

router.post('/:bookingId/reject', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.auth!.uid;
    const booking = await BookingService.rejectBooking(uid, req.params.bookingId);
    res.json({ data: booking });
  } catch (err) {
    next(err);
  }
});

router.post('/:bookingId/cancel', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.auth!.uid;
    const booking = await BookingService.cancelBooking(uid, req.params.bookingId);
    res.json({ data: booking });
  } catch (err) {
    next(err);
  }
});

export default router;
