import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import meRoutes from './routes/me.routes.js';
import { errorHandler } from './middleware/error-handler.js';

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

// Error Handler Middleware
app.use(errorHandler as any);

export default app;
