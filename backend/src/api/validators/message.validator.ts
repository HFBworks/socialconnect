/**
 * Message request validation schemas
 */

import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../../utils/errors';
import { validateRequired } from '../../utils/validation';

export const validateSendMessage = (req: Request, res: Response, next: NextFunction) => {
  const { content, recipientId } = req.body;

  validateRequired({ content, recipientId });

  if (content.trim().length === 0) {
    throw new ValidationError('Message content cannot be empty');
  }

  if (content.length > 10000) {
    throw new ValidationError('Message content cannot exceed 10000 characters');
  }

  next();
};

export const validateEditMessage = (req: Request, res: Response, next: NextFunction) => {
  const { content } = req.body;

  validateRequired({ content });

  if (content.trim().length === 0) {
    throw new ValidationError('Message content cannot be empty');
  }

  if (content.length > 10000) {
    throw new ValidationError('Message content cannot exceed 10000 characters');
  }

  next();
};

export const validateAddReaction = (req: Request, res: Response, next: NextFunction) => {
  const { emoji } = req.body;

  validateRequired({ emoji });

  // Basic emoji validation (length check)
  if (emoji.length > 10) {
    throw new ValidationError('Invalid emoji');
  }

  next();
};
