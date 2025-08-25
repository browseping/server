import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { sendMessage } from "../controllers/conversation/messageController";
import { acceptConversationInvite, getMessages, getUserConversations, rejectConversationInvite } from "../controllers/conversation/conversationController";

const router = Router();

router.post('/send', authenticate, sendMessage);
router.get('/:conversationId/messages', authenticate, getMessages);

router.post('/:conversationId/accept', authenticate, acceptConversationInvite);
router.post('/:conversationId/reject', authenticate, rejectConversationInvite);

router.get('/', authenticate, getUserConversations);

export default router;