/**
 * Post request validation schemas
 */

import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../../utils/errors';
import { validateRequired } from '../../utils/validation';

export const validateCreatePost = (req: Request, res: Response, next: NextFunction) => {
  const { content } = req.body;

  validateRequired({ content });

  if (content.trim().length === 0) {
    throw new ValidationError('Post content cannot be empty');
  }

  if (content.length > 5000) {
    throw new ValidationError('Post content cannot exceed 5000 characters');
  }

  next();
};

export const validateUpdatePost = (req: Request, res: Response, next: NextFunction) => {
  const { content } = req.body;

  if (content !== undefined) {
    if (typeof content !== 'string' || content.trim().length === 0) {
      throw new ValidationError('Post content cannot be empty');
    }

    if (content.length > 5000) {
      throw new ValidationError('Post content cannot exceed 5000 characters');
    }
  }

  next();
};

export const validateCreateComment = (req: Request, res: Response, next: NextFunction) => {
  const { content } = req.body;

  validateRequired({ content });

  if (content.trim().length === 0) {
    throw new ValidationError('Comment content cannot be empty');
  }

  if (content.length > 2000) {
    throw new ValidationError('Comment content cannot exceed 2000 characters');
  }

  next();
};
