/**
 * Message routes
 */

import { Router } from 'express';
import * as messageController from '../controllers/message.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

// All message routes are protected
router.use(authenticate);

router.get('/', messageController.getConversations);
router.get('/:id/messages', messageController.getMessages);
router.post('/:id/read', messageController.markAsRead);
router.delete('/:id', messageController.deleteConversation);

export default router;
