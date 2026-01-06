/**
 * Post routes
 */

import { Router } from 'express';
import * as postController from '../controllers/post.controller';
import { authenticate, optionalAuth } from '../middlewares/auth';
import {
  validateCreatePost,
  validateUpdatePost,
  validateCreateComment,
} from '../validators/post.validator';

const router = Router();

// Feed routes (optional auth for anonymous browsing)
router.get('/', optionalAuth, postController.getFeed);
router.get('/:id', optionalAuth, postController.getPost);

// Post CRUD (protected)
router.post('/', authenticate, validateCreatePost, postController.createPost);
router.put('/:id', authenticate, validateUpdatePost, postController.updatePost);
router.delete('/:id', authenticate, postController.deletePost);

// Like (protected)
router.post('/:id/like', authenticate, postController.toggleLike);

// Comments (protected)
router.post('/:id/comments', authenticate, validateCreateComment, postController.addComment);
router.put('/:postId/comments/:commentId', authenticate, validateCreateComment, postController.updateComment);
router.delete('/:postId/comments/:commentId', authenticate, postController.deleteComment);

export default router;
