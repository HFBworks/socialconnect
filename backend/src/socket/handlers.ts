/**
 * Socket.IO event handlers for real-time messaging
 * Handles all WebSocket events with authentication
 */

import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { MessageService } from '../services/message.service';
import { PostService } from '../services/post.service';
import { prisma } from '../config/database';

const messageService = new MessageService();
const postService = new PostService();

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

// Store online users
const onlineUsers = new Map<string, string>(); // userId -> socketId

/**
 * Initialize Socket.IO handlers
 */
export const initializeSocketHandlers = (io: Server) => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const payload = verifyAccessToken(token);
      socket.userId = payload.userId;
      socket.userEmail = payload.email;

      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    console.log(`User connected: ${userId}`);

    // Add user to online users
    onlineUsers.set(userId, socket.id);

    // Emit user online status to all clients
    socket.broadcast.emit('user:online', { userId });

    /**
     * Join conversation room for real-time updates
     */
    socket.on('conversation:join', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`User ${userId} joined conversation ${conversationId}`);
    });

    /**
     * Leave conversation room
     */
    socket.on('conversation:leave', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${userId} left conversation ${conversationId}`);
    });

    /**
     * Send message
     */
    socket.on('message:send', async (data: { recipientId: string; content: string }, callback) => {
      try {
        const result = await messageService.sendMessage(userId, data.recipientId, data.content);

        // Emit to conversation room
        io.to(`conversation:${result.conversationId}`).emit('message:new', result.message);

        // Notify recipient if online
        const recipientSocketId = onlineUsers.get(data.recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('conversation:update', {
            conversationId: result.conversationId,
            lastMessage: result.message,
          });
        }

        if (callback) callback({ success: true, data: result.message });
      } catch (error: any) {
        console.error('Error sending message:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    /**
     * Edit message
     */
    socket.on('message:edit', async (data: { messageId: string; content: string }, callback) => {
      try {
        const message = await messageService.editMessage(data.messageId, userId, data.content);

        // Emit to conversation room
        io.to(`conversation:${message.conversationId}`).emit('message:edited', message);

        if (callback) callback({ success: true, data: message });
      } catch (error: any) {
        console.error('Error editing message:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    /**
     * Delete message
     */
    socket.on('message:delete', async (data: { messageId: string }, callback) => {
      try {
        const result = await messageService.deleteMessage(data.messageId, userId);

        // Emit to conversation room
        io.to(`conversation:${result.conversationId}`).emit('message:deleted', {
          messageId: data.messageId,
          conversationId: result.conversationId,
        });

        if (callback) callback({ success: true });
      } catch (error: any) {
        console.error('Error deleting message:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    /**
     * Add/remove reaction
     */
    socket.on('message:react', async (data: { messageId: string; emoji: string }, callback) => {
      try {
        const result = await messageService.addReaction(data.messageId, userId, data.emoji);

        // Get message to find conversation ID
        const message = await prisma.message.findUnique({
          where: { id: data.messageId },
          select: { conversationId: true },
        });

        if (message) {
          // Emit to conversation room
          io.to(`conversation:${message.conversationId}`).emit('message:reaction', {
            messageId: data.messageId,
            action: result.action,
            reaction: result.reaction,
          });
        }

        if (callback) callback({ success: true, data: result });
      } catch (error: any) {
        console.error('Error reacting to message:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    /**
     * Delete entire conversation (Telegram-style)
     */
    socket.on('conversation:delete', async (data: { conversationId: string }, callback) => {
      try {
        const result = await messageService.deleteConversation(data.conversationId, userId);

        // Notify all participants
        result.participantIds.forEach((participantId) => {
          const participantSocketId = onlineUsers.get(participantId);
          if (participantSocketId) {
            io.to(participantSocketId).emit('conversation:deleted', {
              conversationId: data.conversationId,
            });
          }
        });

        if (callback) callback({ success: true });
      } catch (error: any) {
        console.error('Error deleting conversation:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    /**
     * Typing indicator start
     */
    socket.on('typing:start', (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('typing:start', {
        userId,
        conversationId: data.conversationId,
      });
    });

    /**
     * Typing indicator stop
     */
    socket.on('typing:stop', (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('typing:stop', {
        userId,
        conversationId: data.conversationId,
      });
    });

    /**
     * Post like (real-time feed update)
     */
    socket.on('post:like', async (data: { postId: string }, callback) => {
      try {
        const result = await postService.toggleLike(data.postId, userId);

        // Broadcast to all connected clients
        socket.broadcast.emit('post:liked', {
          postId: data.postId,
          userId,
          liked: result.liked,
        });

        if (callback) callback({ success: true, data: result });
      } catch (error: any) {
        console.error('Error liking post:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    /**
     * New post created (real-time feed update)
     */
    socket.on('post:created', (data: { post: any }) => {
      // Broadcast new post to all connected clients
      socket.broadcast.emit('post:new', data.post);
    });

    /**
     * Post deleted (real-time feed update)
     */
    socket.on('post:deleted', (data: { postId: string }) => {
      // Broadcast post deletion to all connected clients
      socket.broadcast.emit('post:removed', { postId: data.postId });
    });

    /**
     * Disconnect handler
     */
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);

      // Remove from online users
      onlineUsers.delete(userId);

      // Emit user offline status
      socket.broadcast.emit('user:offline', { userId });
    });
  });

  return io;
};

/**
 * Get online users (for external use)
 */
export const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};
