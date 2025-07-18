import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { isUserOnline } from '../utils/redis';

export const getProfileByUsername = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const requesterId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const { password, ...userWithoutPassword } = user;

    if (requesterId === user.id) {
      const online = await isUserOnline(user.id);
      return res.json({
        success: true,
        data: {
          ...userWithoutPassword,
          isOnline: online,
          socialMedia: {
            twitter: user.twitter,
            linkedin: user.linkedin,
            instagram: user.instagram,
            github: user.github,
            website: user.website,
            telegram: user.telegram,
            snapchat: user.snapchat,
            discord: user.discord,
          }
        },
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
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      totalOnlineSeconds: user.totalOnlineSeconds,
    };

    if (user.email && 
        (user.emailPrivacy === 'public' || 
         (user.emailPrivacy === 'friends_only' && isFriend))) {
      profile.email = user.email;
    }

    if (user.dateOfBirth && 
        (user.dobPrivacy === 'public' || 
         (user.dobPrivacy === 'friends_only' && isFriend))) {
      profile.dateOfBirth = user.dateOfBirth;
    }

    if (user.lastOnlinePrivacy === 'public' || 
        (user.lastOnlinePrivacy === 'friends_only' && isFriend)) {
      profile.lastOnlineAt = user.lastOnlineAt;
    }

    if (user.onlinePrivacy === 'public' || 
        (user.onlinePrivacy === 'friends_only' && isFriend)) {
      profile.isOnline = await isUserOnline(user.id);
    }

    if (user.socialMediaPrivacy === 'public' || 
        (user.socialMediaPrivacy === 'friends_only' && isFriend)) {
      profile.socialMedia = {
        twitter: user.twitter,
        linkedin: user.linkedin,
        instagram: user.instagram,
        github: user.github,
        website: user.website,
        telegram: user.telegram,
        snapchat: user.snapchat,
        discord: user.discord,
      };
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
      socialMediaPrivacy,
      friendsListPrivacy,
    } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(onlinePrivacy && { onlinePrivacy }),
        ...(lastOnlinePrivacy && { lastOnlinePrivacy }),
        ...(tabPrivacy && { tabPrivacy }),
        ...(emailPrivacy && { emailPrivacy }),
        ...(dobPrivacy && { dobPrivacy }),
        ...(socialMediaPrivacy && { socialMediaPrivacy }),
        ...(friendsListPrivacy && { friendsListPrivacy }),
      },
      select: {
        id: true,
        onlinePrivacy: true,
        lastOnlinePrivacy: true,
        tabPrivacy: true,
        emailPrivacy: true,
        dobPrivacy: true,
        socialMediaPrivacy: true,
        friendsListPrivacy: true,
      }
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update privacy error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};