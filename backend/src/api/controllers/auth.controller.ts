/**
 * Authentication controller
 * Handles HTTP requests for auth endpoints
 */

import { Request, Response } from 'express';
import { AuthService } from '../../services/auth.service';
import { asyncHandler } from '../../utils/asyncHandler';

const authService = new AuthService();

/**
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  const result = await authService.register(email, password, name);

  res.status(201).json({
    success: true,
    data: result,
  });
});

/**
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await authService.login(email, password);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * POST /api/auth/refresh
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const tokens = await authService.refreshToken(refreshToken);

  res.status(200).json({
    success: true,
    data: tokens,
  });
});

/**
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  await authService.logout(userId);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * GET /api/auth/me
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const user = await authService.getProfile(userId);

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * POST /api/auth/forgot-password
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const result = await authService.requestPasswordReset(email);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

/**
 * POST /api/auth/reset-password
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;

  const result = await authService.resetPassword(token, password);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});
