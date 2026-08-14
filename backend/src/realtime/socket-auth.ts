import { Socket } from 'socket.io';
import { getFirebaseAuth } from '../config/firebase-admin.js';

export async function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void) {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');

  if (!token) {
    return next(new Error('Authentication error: Missing token'));
  }

  try {
    const decoded = await getFirebaseAuth().verifyIdToken(token);
    (socket as any).auth = { uid: decoded.uid };
    socket.join(`user:${decoded.uid}`);
    console.log(`🔌 Socket ${socket.id} authenticated for user:${decoded.uid}`);
    return next();
  } catch (err: any) {
    console.warn(`🔌 Socket ${socket.id} auth failed:`, err.message);
    return next(new Error('Authentication error: Invalid token'));
  }
}
