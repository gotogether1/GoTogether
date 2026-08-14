import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import meRoutes from './routes/me.routes.js';
import ridesRoutes from './routes/rides.routes.js';
import bookingsRoutes from './routes/bookings.routes.js';
import chatsRoutes from './routes/chats.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import blocksRoutes from './routes/blocks.routes.js';
import { errorHandler } from './middleware/error-handler.js';
import { ApiError } from './utils/api-error.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (Public, Render requirement)
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Go Together API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mounted v1 API routes
app.use('/v1/me', meRoutes);
app.use('/v1/rides', ridesRoutes);
app.use('/v1/bookings', bookingsRoutes);
app.use('/v1/chats', chatsRoutes);
app.use('/v1/notifications', notificationsRoutes);
app.use('/v1/reviews', reviewsRoutes);
app.use('/v1/reports', reportsRoutes);
app.use('/v1/blocks', blocksRoutes);

// Catch-All 404 Handler for Unregistered Endpoints
app.use((_req, _res, next) => {
  next(ApiError.notFound('API endpoint not found'));
});

// Error Handler Middleware
app.use(errorHandler as any);

export default app;
