import { Server as SocketIOServer } from 'socket.io';

let ioInstance: SocketIOServer | null = null;

export function initRealtimeEmitter(io: SocketIOServer) {
  ioInstance = io;
}

export function emitToUser(userId: string, eventName: string, payload: Record<string, any>) {
  if (!ioInstance) return;
  ioInstance.to(`user:${userId}`).emit(eventName, {
    ...payload,
    occurredAt: new Date().toISOString(),
  });
}

export function emitToUsers(userIds: string[], eventName: string, payload: Record<string, any>) {
  if (!ioInstance) return;
  const uniqueUsers = Array.from(new Set(userIds));
  uniqueUsers.forEach(uid => {
    emitToUser(uid, eventName, payload);
  });
}
