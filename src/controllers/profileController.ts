import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { isUserOnline } from '../utils/redis';

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
        lastOnlinePrivacy: true,
        onlinePrivacy: true,
        tabPrivacy: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (requesterId === user.id) {
      const online = await isUserOnline(user.id);
      return res.json({
        success: true,
        data: { ...user, isOnline: online },
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

    let showLastOnline = false;
    let showOnline = false;

    if (user.lastOnlinePrivacy === 'public') {
      showLastOnline = true;
    } else if (user.lastOnlinePrivacy === 'friends_only' && isFriend) {
      showLastOnline = true;
    }

    if (user.onlinePrivacy === 'public') {
      showOnline = true;
    } else if (user.onlinePrivacy === 'friends_only' && isFriend) {
      showOnline = true;
    }

    const profile: any = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      createdAt: user.createdAt,
    };

    if (
      user.email &&
      (user.emailPrivacy === 'public' ||
        (user.emailPrivacy === 'friends_only' && isFriend))
    ) {
      profile.email = user.email;
    }
    if (user.emailPrivacy === 'private') {
      if (requesterId === user.id) profile.email = user.email;
    }

    if (
      user.dateOfBirth &&
      (user.dobPrivacy === 'public' ||
        (user.dobPrivacy === 'friends_only' && isFriend))
    ) {
      profile.dateOfBirth = user.dateOfBirth;
    }

    if (showLastOnline) {
      profile.lastOnlineAt = user.lastOnlineAt;
    }
    if (showOnline) {
      profile.isOnline = await isUserOnline(user.id);
    }

    return res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updatePrivacySettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const {
      onlinePrivacy,
      lastOnlinePrivacy,
      tabPrivacy,
      emailPrivacy,
      dobPrivacy,
    } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(onlinePrivacy && { onlinePrivacy }),
        ...(lastOnlinePrivacy && { lastOnlinePrivacy }),
        ...(tabPrivacy && { tabPrivacy }),
        ...(emailPrivacy && { emailPrivacy }),
        ...(dobPrivacy && { dobPrivacy }),
      },
      select: {
        id: true,
        onlinePrivacy: true,
        lastOnlinePrivacy: true,
        tabPrivacy: true,
        emailPrivacy: true,
        dobPrivacy: true,
      }
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update privacy error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};