import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { RideService } from '../services/ride.service.js';
import { BookingService } from '../services/booking.service.js';
import { createRideSchema, createBookingSchema } from '../validators/index.js';

const router = Router();

router.use(authenticate as any);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.auth!.uid;
    const { vehicleType, pickup, destination } = req.query;
    const rides = await RideService.listRides(uid, {
      vehicleType: vehicleType as string,
      pickup: pickup as string,
      destination: destination as string,
    });
    res.json({ data: rides });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.auth!.uid;
    const validated = createRideSchema.parse(req.body);
    const ride = await RideService.createRide(uid, validated as any);
    res.status(201).json({ data: ride });
  } catch (err) {
    next(err);
  }
});

router.get('/:rideId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ride = await RideService.getRide(req.params.rideId);
    res.json({ data: ride });
  } catch (err) {
    next(err);
  }
});

router.post('/:rideId/cancel', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.auth!.uid;
    const ride = await RideService.cancelRide(uid, req.params.rideId);
    res.json({ data: ride });
  } catch (err) {
    next(err);
  }
});

router.post('/:rideId/bookings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.auth!.uid;
    const { seatsRequested, riderMessage } = createBookingSchema.parse(req.body);
    const booking = await BookingService.createBooking(uid, req.params.rideId, seatsRequested, riderMessage);
    res.status(201).json({ data: booking });
  } catch (err) {
    next(err);
  }
});

export default router;
