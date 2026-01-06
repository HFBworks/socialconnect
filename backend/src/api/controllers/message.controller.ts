/**
 * Message controller
 * Handles HTTP requests for messaging endpoints
 */

import { Request, Response } from 'express';
import { MessageService } from '../../services/message.service';
import { asyncHandler } from '../../utils/asyncHandler';

const messageService = new MessageService();

/**
 * GET /api/conversations
 */
export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const conversations = await messageService.getUserConversations(userId);

  res.status(200).json({
    success: true,
    data: conversations,
  });
});

/**
 * GET /api/conversations/:id/messages
 */
export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;

  const messages = await messageService.getMessages(id, userId, page, limit);

  res.status(200).json({
    success: true,
    data: messages,
    pagination: {
      page,
      limit,
      hasMore: messages.length === limit,
    },
  });
});

/**
 * POST /api/conversations/:id/read
 */
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  await messageService.markAsRead(id, userId);

  res.status(200).json({
    success: true,
    message: 'Marked as read',
  });
});

/**
 * DELETE /api/conversations/:id
 */
export const deleteConversation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  const result = await messageService.deleteConversation(id, userId);

  res.status(200).json({
    success: true,
    message: 'Conversation deleted for everyone',
    data: result,
  });
});
