/**
 * Message service
 * Business logic for real-time messaging
 */

import { prisma } from '../config/database';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors';
import { sanitizeString } from '../utils/validation';

export class MessageService {
  /**
   * Get or create conversation between two users
   */
  async getOrCreateConversation(user1Id: string, user2Id: string) {
    if (user1Id === user2Id) {
      throw new ValidationError('Cannot create conversation with yourself');
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: user1Id } } },
          { participants: { some: { userId: user2Id } } },
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                lastSeenAt: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (existingConversation) {
      return existingConversation;
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: user1Id }, { userId: user2Id }],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                lastSeenAt: true,
              },
            },
          },
        },
        messages: true,
      },
    });

    return conversation;
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId: string) {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                lastSeenAt: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Transform to include unread count and other user info
    const transformedConversations = conversations.map((conv) => {
      const otherParticipant = conv.participants.find((p) => p.userId !== userId);
      const currentParticipant = conv.participants.find((p) => p.userId === userId);

      return {
        id: conv.id,
        otherUser: otherParticipant?.user,
        lastMessage: conv.messages[0] || null,
        lastReadAt: currentParticipant?.lastReadAt,
        updatedAt: conv.updatedAt,
      };
    });

    return transformedConversations;
  }

  /**
   * Get messages in a conversation with pagination
   */
  async getMessages(conversationId: string, userId: string, page: number = 1, limit: number = 50) {
    // Verify user is participant
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
      },
    });

    if (!participant) {
      throw new ForbiddenError('You are not a participant in this conversation');
    }

    const skip = (page - 1) * limit;

    const messages = await prisma.message.findMany({
      where: { conversationId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Update last read timestamp
    await prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: { lastReadAt: new Date() },
    });

    return messages.reverse(); // Oldest first
  }

  /**
   * Send message
   */
  async sendMessage(senderId: string, recipientId: string, content: string) {
    // Get or create conversation
    const conversation = await this.getOrCreateConversation(senderId, recipientId);

    // Create message
    const message = await prisma.message.create({
      data: {
        content: sanitizeString(content),
        conversationId: conversation.id,
        senderId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reactions: true,
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return { message, conversationId: conversation.id };
  }

  /**
   * Edit message
   */
  async editMessage(messageId: string, userId: string, content: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenError('You can only edit your own messages');
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content: sanitizeString(content),
        isEdited: true,
        editedAt: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return updatedMessage;
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId: string, userId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          include: {
            participants: true,
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    // Check if user is sender or participant (for delete-for-everyone)
    const isParticipant = message.conversation.participants.some((p) => p.userId === userId);

    if (!isParticipant) {
      throw new ForbiddenError('You cannot delete this message');
    }

    // Delete message (cascades to reactions)
    await prisma.message.delete({
      where: { id: messageId },
    });

    return { conversationId: message.conversationId };
  }

  /**
   * Add reaction to message
   */
  async addReaction(messageId: string, userId: string, emoji: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          include: {
            participants: true,
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    // Verify user is participant
    const isParticipant = message.conversation.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new ForbiddenError('You are not a participant in this conversation');
    }

    // Check if reaction already exists
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId,
          emoji,
        },
      },
    });

    if (existingReaction) {
      // Remove reaction (toggle off)
      await prisma.reaction.delete({
        where: { id: existingReaction.id },
      });

      return { action: 'removed', reaction: existingReaction };
    }

    // Add reaction
    const reaction = await prisma.reaction.create({
      data: {
        messageId,
        userId,
        emoji,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return { action: 'added', reaction };
  }

  /**
   * Delete entire conversation (Telegram-style delete-for-everyone)
   */
  async deleteConversation(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: true,
      },
    });

    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    // Verify user is participant
    const isParticipant = conversation.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new ForbiddenError('You are not a participant in this conversation');
    }

    // Delete conversation (cascades to messages, reactions, participants)
    await prisma.conversation.delete({
      where: { id: conversationId },
    });

    // Return participant IDs for socket notification
    return {
      participantIds: conversation.participants.map((p) => p.userId),
    };
  }

  /**
   * Mark conversation as read
   */
  async markAsRead(conversationId: string, userId: string) {
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
      },
    });

    if (!participant) {
      throw new ForbiddenError('You are not a participant in this conversation');
    }

    await prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: { lastReadAt: new Date() },
    });
  }
}
