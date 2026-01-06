/**
 * Auth request validation schemas
 */

import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../../utils/errors';
import { isValidEmail, isValidPassword, validateRequired } from '../../utils/validation';

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name } = req.body;

  // Check required fields
  validateRequired({ email, password, name });

  // Validate email format
  if (!isValidEmail(email)) {
    throw new ValidationError('Invalid email format');
  }

  // Validate password strength
  if (!isValidPassword(password)) {
    throw new ValidationError(
      'Password must be at least 8 characters with uppercase, lowercase, and number'
    );
  }

  // Validate name length
  if (name.trim().length < 2) {
    throw new ValidationError('Name must be at least 2 characters');
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  validateRequired({ email, password });

  if (!isValidEmail(email)) {
    throw new ValidationError('Invalid email format');
  }

  next();
};

export const validateRefreshToken = (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ValidationError('Refresh token is required');
  }

  next();
};
