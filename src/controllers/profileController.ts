import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getProfileByUsername = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const requesterId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        createdAt: true,
        lastOnlineAt: true,
        email: true,
        emailPrivacy: true,
        dateOfBirth: true,
        dobPrivacy: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (requesterId === user.id) {
      return res.json({
        success: true,
        data: user,
      });
    }

    let isFriend = false;
    if (requesterId) {
      const friendship = await prisma.friendship.findFirst({
        where: {
          userId: requesterId,
          friendId: user.id,
        },
      });
      isFriend = !!friendship;
    }

    const profile: any = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      createdAt: user.createdAt,
      lastOnlineAt: user.lastOnlineAt,
    };

    if (
      user.email &&
      (user.emailPrivacy === 'public' ||
        (user.emailPrivacy === 'friends_only' && isFriend))
    ) {
      profile.email = user.email;
    }

    if (
      user.dateOfBirth &&
      (user.dobPrivacy === 'public' ||
        (user.dobPrivacy === 'friends_only' && isFriend))
    ) {
      profile.dateOfBirth = user.dateOfBirth;
    }

    return res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};