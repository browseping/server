import { Request, Response } from "express";
import prisma from "../../utils/prisma";

export const getUserConversations = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;

        const participations = await prisma.conversationParticipant.findMany({
            where: { userId },
            include: {
                conversation: {
                    include: {
                        lastMessage: {
                            include: {
                                sender: {
                                    select: { id: true, username: true, displayName: true }
                                }
                            }
                        },
                        participants: {
                            include: {
                                user: {
                                    select: { id: true, username: true, displayName: true }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                conversation: {
                    updatedAt: 'desc'
                }
            }
        });

        return res.json({
            success: true,
            data: participations
        });
    } catch (error) {
        console.log('[ConversationController]: getUserConversations error: ', (error));
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}


export const getMessages = async (req: Request, res: Response) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;
        const { limit = 10, cursor } = req.query;

        // check if user is participiant
        const participiant = await prisma.conversationParticipant.findUnique({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId
                }
            },
            include: {
                conversation: { select: { type: true, name: true } }
            }
        });

        if (!participiant) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        const whereClause: any = {
            conversationId,
            deletedForAll: false
        }

        if (cursor) {
            whereClause.createdAt = {
                lt: new Date(cursor as string)
            };
        }

        const messages = await prisma.message.findMany({
            where: whereClause,
            include: {
                sender: {
                    select: { id: true, username: true, displayName: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: parseInt(limit as string)
        });

        return res.status(200).json({
            success: true,
            data: messages.reverse(),
            canReply: participiant.status === 'ACCEPTED'
        });
    } catch (error) {
        console.log('[ConversationController]: getMessages error: ', (error));
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

// Accept conversation/group invite
export const acceptConversationInvite = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId
        }
      }
    });

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (participant.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Invitation is not pending'
      });
    }

    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId
        }
      },
      data: {
        status: 'ACCEPTED'
      }
    });

    return res.json({
      success: true,
      message: 'Invitation accepted'
    });

  } catch (error) {
    console.error('Accept conversation invite error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const rejectConversationInvite = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId
        }
      }
    });

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (participant.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Invitation is not pending'
      });
    }

    await prisma.conversationParticipant.delete({
      where: {
        conversationId_userId: {
          conversationId,
          userId
        }
      }
    });

    return res.json({
      success: true,
      message: 'Invitation rejected'
    });

  } catch (error) {
    console.error('Reject conversation invite error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
