"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuthMiddleware = socketAuthMiddleware;
const firebase_admin_js_1 = require("../config/firebase-admin.js");
async function socketAuthMiddleware(socket, next) {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) {
        return next(new Error('Authentication error: Missing token'));
    }
    try {
        const decoded = await (0, firebase_admin_js_1.getFirebaseAuth)().verifyIdToken(token);
        socket.auth = { uid: decoded.uid };
        socket.join(`user:${decoded.uid}`);
        console.log(`🔌 Socket ${socket.id} authenticated for user:${decoded.uid}`);
        return next();
    }
    catch (err) {
        console.warn(`🔌 Socket ${socket.id} auth failed:`, err.message);
        return next(new Error('Authentication error: Invalid token'));
    }
}
