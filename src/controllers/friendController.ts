import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { isUserOnline, getActiveTabData, getLatestTabData } from '../utils/redis';

// Send a friend request
export const sendFriendRequest = async (req: Request, res: Response) => {
  try {
    const senderId = req.user.id;
    
    const { receiverId } = req.body;
    
    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID is required',
        error: 'Missing required fields'
      });
    }
    
    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send friend request to yourself',
        error: 'Invalid recipient'
      });
    }

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    });
    
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found',
        error: 'User does not exist'
      });
    }
    
    const existingRequest = await prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId,
          receiverId
        }
      }
    });
    
    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: 'Friend request already sent',
        error: 'Duplicate request'
      });
    }
    
    // Check if there's a reverse request (the receiver already sent a request to the sender)
    const reverseRequest = await prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId: receiverId,
          receiverId: senderId
        }
      }
    });
    
    if (reverseRequest) {
      // If there's a reverse request, we can automatically accept it
      if (reverseRequest.status === 'pending') {
        // Accept the reverse request
        await prisma.friendRequest.update({
          where: { id: reverseRequest.id },
          data: { status: 'accepted' }
        });
        
        // Create friendships in both directions
        await prisma.friendship.createMany({
          data: [
            { userId: senderId, friendId: receiverId },
            { userId: receiverId, friendId: senderId }
          ]
        });
        
        return res.status(200).json({
          success: true,
          message: 'Friend request automatically accepted',
          data: {
            friendshipStatus: 'friends'
          }
        });
      }
    }
    
    // Check if they are already friends
    const existingFriendship = await prisma.friendship.findUnique({
      where: {
        userId_friendId: {
          userId: senderId,
          friendId: receiverId
        }
      }
    });
    
    if (existingFriendship) {
      return res.status(409).json({
        success: false,
        message: 'Already friends with this user',
        error: 'Already friends'
      });
    }
    
    // Create a new friend request
    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId,
        receiverId,
        status: 'pending'
      }
    });
    
    return res.status(201).json({
      success: true,
      message: 'Friend request sent successfully',
      data: {
        requestId: friendRequest.id,
        status: friendRequest.status
      }
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to send friend request'
    });
  }
};

// Accept a friend request
export const acceptFriendRequest = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    // Find the friend request
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found',
      });
    }

    if (friendRequest.receiverId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this request',
      });
    }

    if (friendRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Friend request is not pending',
      });
    }

    // Update request status and create friendships
    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'accepted' },
    });

    await prisma.friendship.createMany({
      data: [
        { userId: friendRequest.senderId, friendId: friendRequest.receiverId },
        { userId: friendRequest.receiverId, friendId: friendRequest.senderId },
      ],
      skipDuplicates: true,
    });

    return res.json({
      success: true,
      message: 'Friend request accepted',
    });
  } catch (error) {
    console.error('Accept friend request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Ignore a friend request
export const ignoreFriendRequest = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found',
      });
    }

    if (friendRequest.receiverId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to ignore this request',
      });
    }

    if (friendRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Friend request is not pending',
      });
    }

    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'ignored' },
    });

    return res.json({
      success: true,
      message: 'Friend request ignored',
    });
  } catch (error) {
    console.error('Ignore friend request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get all friends for the authenticated user
export const getAllFriends = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    // Find all friendships where the user is involved
    const friendships = await prisma.friendship.findMany({
      where: { userId },
      include: {
        friend: {
          select: {
            id: true,
            username: true,
            displayName: true,
            lastOnlineAt: true,
          },
        },
      },
    });

    const friends = friendships.map(f => ({
      id: f.friend.id,
      username: f.friend.username,
      displayName: f.friend.displayName,
      lastOnlineAt: f.friend.lastOnlineAt,
    }));

    return res.json({
      success: true,
      data: friends,
    });
  } catch (error) {
    console.error('Get all friends error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get all pending friend requests for the authenticated user
export const getPendingFriendRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    // Find all pending requests where the user is the receiver
    const requests = await prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: 'pending',
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const pendingRequests = requests.map(r => ({
      requestId: r.id,
      sender: r.sender,
      createdAt: r.createdAt,
    }));

    return res.json({
      success: true,
      data: pendingRequests,
    });
  } catch (error) {
    console.error('Get pending friend requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get all pending friend requests sent by the authenticated user
export const getPendingSentFriendRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    // Find all pending requests where the user is the sender
    const requests = await prisma.friendRequest.findMany({
      where: {
        senderId: userId,
        status: 'pending',
      },
      include: {
        receiver: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const pendingRequests = requests.map(r => ({
      requestId: r.id,
      receiver: r.receiver,
      createdAt: r.createdAt,
    }));

    return res.json({
      success: true,
      data: pendingRequests,
    });
  } catch (error) {
    console.error('Get pending sent friend requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Cancel a friend request (sender can cancel their own pending request)
export const cancelFriendRequest = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found',
      });
    }

    if (friendRequest.senderId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this request',
      });
    }

    if (friendRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be cancelled',
      });
    }

    await prisma.friendRequest.delete({
      where: { id: requestId },
    });

    return res.json({
      success: true,
      message: 'Friend request cancelled',
    });
  } catch (error) {
    console.error('Cancel friend request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Remove a friend (removes friendship both ways)
export const removeFriend = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;

    // Remove both directions of the friendship
    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });

    return res.json({
      success: true,
      message: 'Friend removed',
    });
  } catch (error) {
    console.error('Remove friend error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// GET /api/friends/status?userId=...
export const getFriendshipStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { userId: otherUserId } = req.query;

    if (!otherUserId || typeof otherUserId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'userId query parameter is required.',
      });
    }

    if (userId === otherUserId) {
      return res.json({
        success: true,
        status: 'self',
      });
    }

    // Check if already friends
    const friendship = await prisma.friendship.findUnique({
      where: {
        userId_friendId: {
          userId,
          friendId: otherUserId,
        },
      },
    });

    if (friendship) {
      return res.json({
        success: true,
        status: 'friends',
      });
    }

    // Check if there is a pending request sent by current user
    const sentRequest = await prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId: userId,
          receiverId: otherUserId,
        },
      },
    });

    if (sentRequest) {
      return res.json({
        success: true,
        status: sentRequest.status === 'pending' ? 'pending_sent' : sentRequest.status,
      });
    }

    // Check if there is a pending request received by current user
    const receivedRequest = await prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId: otherUserId,
          receiverId: userId,
        },
      },
    });

    if (receivedRequest) {
      return res.json({
        success: true,
        status: receivedRequest.status === 'pending' ? 'pending_received' : receivedRequest.status,
      });
    }

    // No relationship
    return res.json({
      success: true,
      status: 'none',
    });
  } catch (error) {
    console.error('Get friendship status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// get all friends with online/offline status and Tabs data
export const getAllFriendsWithStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    const rels = await prisma.friendship.findMany({
      where: { userId },
      include: {
        friend: {
          select: {
            id: true,
            username: true,
            displayName: true,
            lastOnlineAt: true,
          },
        },
      },
    });

    const friendsWithStatus = await Promise.all(
      rels.map(async ({ friend }) => {
        const online = await isUserOnline(friend.id);
        let activeTab = null;
        let allTabs = null;
        if (online) {
          activeTab = await getActiveTabData(friend.id);
          allTabs = await getLatestTabData(friend.id);
        }
        return {
          id: friend.id,
          username: friend.username,
          displayName: friend.displayName,
          isOnline: online,
          lastSeen: friend.lastOnlineAt,
          activeTab,
          allTabs,
        };
      })
    );

    const online = friendsWithStatus
      .filter(f => f.isOnline)
      .sort((a, b) => a.username.localeCompare(b.username));

    const offline = friendsWithStatus
      .filter(f => !f.isOnline)
      .sort((a, b) => (b.lastSeen?.getTime() || 0) - (a.lastSeen?.getTime() || 0));

    return res.json({
      success: true,
      data: [...online, ...offline],
    });
  } catch (error) {
    console.error('Get all friends error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};