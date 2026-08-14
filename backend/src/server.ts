import http from 'node:http';
import app from './app.js';
import { env } from './config/env.js';
import { Server as SocketIOServer } from 'socket.io';

const server = http.createServer(app);

const io = new SocketIOServer(server, {
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

const PORT = Number(process.env.PORT) || Number(env.PORT) || 10000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Go Together API server running on 0.0.0.0:${PORT} [${env.NODE_ENV}]`);
});
