/**
 * Post service
 * Business logic for social feed operations
 */

import { prisma } from '../config/database';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { sanitizeString } from '../utils/validation';

export class PostService {
  /**
   * Create a new post
   */
  async createPost(userId: string, content: string, imageUrl?: string) {
    const post = await prisma.post.create({
      data: {
        content: sanitizeString(content),
        imageUrl,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return post;
  }

  /**
   * Get feed with pagination
   */
  async getFeed(userId: string | undefined, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        likes: userId
          ? {
              where: { userId },
              select: { id: true },
            }
          : false,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    // Transform to include isLiked flag
    const transformedPosts = posts.map((post) => ({
      ...post,
      isLiked: userId && Array.isArray(post.likes) ? post.likes.length > 0 : false,
      likes: undefined, // Remove likes array from response
    }));

    return transformedPosts;
  }

  /**
   * Get single post by ID
   */
  async getPost(postId: string, userId?: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        likes: userId
          ? {
              where: { userId },
              select: { id: true },
            }
          : false,
        comments: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    return {
      ...post,
      isLiked: userId && Array.isArray(post.likes) ? post.likes.length > 0 : false,
      likes: undefined,
    };
  }

  /**
   * Update post
   */
  async updatePost(postId: string, userId: string, content: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenError('You can only edit your own posts');
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { content: sanitizeString(content) },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return updatedPost;
  }

  /**
   * Delete post
   */
  async deletePost(postId: string, userId: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenError('You can only delete your own posts');
    }

    await prisma.post.delete({
      where: { id: postId },
    });
  }

  /**
   * Toggle like on post
   */
  async toggleLike(postId: string, userId: string) {
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      return { liked: false };
    } else {
      // Like
      await prisma.like.create({
        data: {
          postId,
          userId,
        },
      });

      return { liked: true };
    }
  }

  /**
   * Add comment to post
   */
  async addComment(postId: string, userId: string, content: string) {
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    const comment = await prisma.comment.create({
      data: {
        content: sanitizeString(content),
        postId,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return comment;
  }

  /**
   * Update comment
   */
  async updateComment(commentId: string, userId: string, content: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenError('You can only edit your own comments');
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content: sanitizeString(content) },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updatedComment;
  }

  /**
   * Delete comment
   */
  async deleteComment(commentId: string, userId: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenError('You can only delete your own comments');
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });
  }
}
