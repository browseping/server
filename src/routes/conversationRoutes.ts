import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { sendMessage } from "../controllers/conversation/messageController";
import { getMessages, getUserConversations } from "../controllers/conversation/conversationController";

const router = Router();

router.post('/send', authenticate, sendMessage);
router.get('/:conversationId/messages', authenticate, getMessages);


router.get('/', authenticate, getUserConversations);

export default router;