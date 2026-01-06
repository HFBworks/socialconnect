/**
 * Post controller
 * Handles HTTP requests for post endpoints
 */

import { Request, Response } from 'express';
import { PostService } from '../../services/post.service';
import { asyncHandler } from '../../utils/asyncHandler';

const postService = new PostService();

/**
 * POST /api/posts
 */
export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { content, imageUrl } = req.body;

  const post = await postService.createPost(userId, content, imageUrl);

  res.status(201).json({
    success: true,
    data: post,
  });
});

/**
 * GET /api/posts
 */
export const getFeed = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const posts = await postService.getFeed(userId, page, limit);

  res.status(200).json({
    success: true,
    data: posts,
    pagination: {
      page,
      limit,
      hasMore: posts.length === limit,
    },
  });
});

/**
 * GET /api/posts/:id
 */
export const getPost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  const post = await postService.getPost(id, userId);

  res.status(200).json({
    success: true,
    data: post,
  });
});

/**
 * PUT /api/posts/:id
 */
export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;
  const { content } = req.body;

  const post = await postService.updatePost(id, userId, content);

  res.status(200).json({
    success: true,
    data: post,
  });
});

/**
 * DELETE /api/posts/:id
 */
export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  await postService.deletePost(id, userId);

  res.status(200).json({
    success: true,
    message: 'Post deleted successfully',
  });
});

/**
 * POST /api/posts/:id/like
 */
export const toggleLike = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  const result = await postService.toggleLike(id, userId);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * POST /api/posts/:id/comments
 */
export const addComment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;
  const { content } = req.body;

  const comment = await postService.addComment(id, userId, content);

  res.status(201).json({
    success: true,
    data: comment,
  });
});

/**
 * PUT /api/posts/:postId/comments/:commentId
 */
export const updateComment = asyncHandler(async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const userId = req.user!.userId;
  const { content } = req.body;

  const comment = await postService.updateComment(commentId, userId, content);

  res.status(200).json({
    success: true,
    data: comment,
  });
});

/**
 * DELETE /api/posts/:postId/comments/:commentId
 */
export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const userId = req.user!.userId;

  await postService.deleteComment(commentId, userId);

  res.status(200).json({
    success: true,
    message: 'Comment deleted successfully',
  });
});
