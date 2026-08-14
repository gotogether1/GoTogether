"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = __importDefault(require("node:http"));
const app_js_1 = __importDefault(require("./app.js"));
const env_js_1 = require("./config/env.js");
const socket_io_1 = require("socket.io");
const server = node_http_1.default.createServer(app_js_1.default);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
});
const PORT = Number(process.env.PORT) || Number(env_js_1.env.PORT) || 10000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Go Together API server running on 0.0.0.0:${PORT} [${env_js_1.env.NODE_ENV}]`);
});
