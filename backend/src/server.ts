/**
 * Server entry point
 * Initializes HTTP server with Socket.IO
 */

// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app';
import { config } from './config/env';
import { prisma } from './config/database';
import { initializeSocketHandlers } from './socket/handlers';

const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Initialize socket handlers
initializeSocketHandlers(io);

// Start server
const PORT = config.port;

httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 Social Media Server Running      ║
╠════════════════════════════════════════╣
║   Environment: ${config.nodeEnv.padEnd(23)} ║
║   Port: ${PORT.toString().padEnd(30)} ║
║   HTTP: http://localhost:${PORT.toString().padEnd(16)} ║
║   Socket.IO: Connected                 ║
╚════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(async () => {
    await prisma.$disconnect();
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  httpServer.close(async () => {
    await prisma.$disconnect();
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default httpServer;