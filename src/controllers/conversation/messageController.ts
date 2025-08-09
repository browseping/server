import { Request, Response } from "express"
import prisma from "../../utils/prisma";
import { wsClients } from "../../websocket/handler";

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { conversationId, receiverId, content } = req.body;
        const senderId = req.user.id;

        if (!content || content.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Message content is required'
            })
        }

        let conversation;
        let isNewConversation = false;

        // Existing conversation
        if (conversationId) {
            conversation = await prisma.conversation.findUnique({
                where: { id: conversationId },
                include: {
                    participants: {
                        include: {
                            user: {
                                select: { id: true, username: true, displayName: true }
                            }
                        }
                    }
                }
            });

            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    message: 'Conversation not found'
                });
            }

            // check if sender is a participant
            const senderParticipant = conversation.participants.find(p => p.userId === senderId);
            if (!senderParticipant) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not a participant in this conversation'
                });
            }

            // For group conversations, sender must be an ACCEPTED participant
            if (conversation.type === 'GROUP' && senderParticipant.status !== 'ACCEPTED') {
                return res.status(403).json({
                    success: false,
                    message: 'You must accept the group invitation to send messages'
                });
            }
        } else if (receiverId) {
            // Direct message
            const existingConversation = await prisma.conversation.findFirst({
                where: {
                    type: 'DIRECT',
                    participants: {
                        every: {
                            userId: { in: [senderId, receiverId] }
                        }
                    }
                },
                include: {
                    participants: {
                        include: {
                            user: {
                                select: { id: true, username: true, displayName: true}
                            }
                        }
                    }
                }
            });

            if (existingConversation) {
                conversation = existingConversation;
            } else {
                const friendship = await prisma.friendship.findUnique({
                    where: {
                        userId_friendId: {
                            userId: senderId,
                            friendId: receiverId
                        }
                    }
                });

                const receiverStatus = friendship ? 'ACCEPTED' : 'PENDING';

                // create a new direct conversation
                conversation = await prisma.conversation.create({
                    data: {
                        type: 'DIRECT',
                        participants: {
                            create: [
                                { userId: senderId, status: 'ACCEPTED' },
                                {userId: receiverId, status: receiverStatus }
                            ]
                        }
                    },
                    include: {
                        participants: {
                            include: {
                                user: {
                                    select: { id: true, username: true, displayName: true }
                                }
                            }
                        }
                    }
                });

                isNewConversation = true;
            }
        } else {
            return res.status(400).json({
                success: false,
                message: 'Either conversationId or receiverId is required'
            })
        }

        // create the message
        const message = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderId,
                content: content.trim(),
            },
            include: {
                sender: {
                    select: { id: true, username: true, displayName: true }
                }
            }
        })

        // update conversation's last message
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: {
                lastMessageId: message.id,
                updatedAt: new Date()
            }
        });

        // update unread count for other ACCEPTED participants
        await prisma.conversationParticipant.updateMany({
            where: {
                conversationId: conversation.id,
                userId: { not: senderId },
                status: 'ACCEPTED'
            },
            data: {
                unreadCount: { increment: 1 }
            }
        });

        conversation.participants.forEach(participant => {
            if (participant.userId != senderId) {
                const ws = wsClients[participant.userId];
                if (ws && ws.readyState === 1) {
                    ws.send(JSON.stringify({
                        type: 'NEW_MESSAGE',
                        data: { ...message, conversationId: conversation.id }
                    }));
                }
            }
        })

        return res.status(201).json({
            success: true,
            data: message,
            conversationId: conversation.id,
            isNewConversation
        });
        
    } catch (error) {
        console.error('send message error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}