"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRealtimeEmitter = initRealtimeEmitter;
exports.emitToUser = emitToUser;
exports.emitToUsers = emitToUsers;
let ioInstance = null;
function initRealtimeEmitter(io) {
    ioInstance = io;
}
function emitToUser(userId, eventName, payload) {
    if (!ioInstance)
        return;
    ioInstance.to(`user:${userId}`).emit(eventName, {
        ...payload,
        occurredAt: new Date().toISOString(),
    });
}
function emitToUsers(userIds, eventName, payload) {
    if (!ioInstance)
        return;
    const uniqueUsers = Array.from(new Set(userIds));
    uniqueUsers.forEach(uid => {
        emitToUser(uid, eventName, payload);
    });
}
