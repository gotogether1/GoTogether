"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = __importDefault(require("node:http"));
const app_js_1 = __importDefault(require("./app.js"));
const env_js_1 = require("./config/env.js");
const socket_io_1 = require("socket.io");
const socket_auth_js_1 = require("./realtime/socket-auth.js");
const realtime_emitter_js_1 = require("./realtime/realtime-emitter.js");
const server = node_http_1.default.createServer(app_js_1.default);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
io.use((socket, next) => {
    (0, socket_auth_js_1.socketAuthMiddleware)(socket, next);
});
(0, realtime_emitter_js_1.initRealtimeEmitter)(io);
io.on('connection', (socket) => {
    const uid = socket.auth?.uid;
    console.log(`🔌 Authenticated socket connected: ${socket.id} (User: ${uid})`);
    socket.on('disconnect', () => {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
});
const PORT = Number(process.env.PORT) || Number(env_js_1.env.PORT) || 10000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Go Together API server running on 0.0.0.0:${PORT} [${env_js_1.env.NODE_ENV}]`);
});
