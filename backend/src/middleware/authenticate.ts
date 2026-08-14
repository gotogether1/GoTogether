import { Request, Response, NextFunction } from 'express';
import { getFirebaseAuth } from '../config/firebase-admin.js';
import { ApiError } from '../utils/api-error.js';

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing or invalid Authorization header'));
  }

  const token = authHeader.split('Bearer ')[1];

  if (!token) {
    return next(ApiError.unauthorized('Bearer token is empty'));
  }

  try {
    const decodedToken = await getFirebaseAuth().verifyIdToken(token);
    req.auth = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      providerIds: decodedToken.firebase?.sign_in_provider ? [decodedToken.firebase.sign_in_provider] : [],
    };
    return next();
  } catch (err: any) {
    console.warn('Firebase ID token verification failed:', err.message);
    return next(ApiError.unauthorized('Invalid or expired authentication token'));
  }
}
