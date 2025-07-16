import Redis from 'ioredis';
import prisma from './prisma';
import { wsClients } from '../websocket/handler';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const redisSubscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export const setUserOnline = async (userId: string, ttl = 60) => {
  await redis.set(`presence:${userId}`, 'online', 'EX', ttl);
};

export const setUserOffline = async (userId: string) => {
  await redis.del(`presence:${userId}`);
};

export const isUserOnline = async (userId: string) => {
  return (await redis.get(`presence:${userId}`)) === 'online';
};

export const publishPresence = async (userId: string, status: 'online' | 'offline') => {
  await redis.publish(`presence-updates:${userId}`, status);
};

// Tabs Update Functions

export const publishAllTabsUpdtate = async (userId: string, tabData: any) => {
  await redis.publish(`all-tabs-update:${userId}`, JSON.stringify(tabData));
}

export const setLatestTabData = async (userId: string, tabData: any) => {
  await redis.set(`latest-tabs:${userId}`, JSON.stringify(tabData));
};

export const getLatestTabData = async (userId: string) => {
  const data = await redis.get(`latest-tabs:${userId}`);
  return data ? JSON.parse(data) : null;
};

export const clearLatestTabsData = async (userId: string) => {
  await redis.del(`latest-tabs:${userId}`);
};


export const publishActiveTabUpdate = async (userId: string, tabData: any) => {
  await redis.publish(`active-tab-update:${userId}`, JSON.stringify(tabData));
}

export const setActiveTabData = async (userId: string, tabData: any) => {
  await redis.set(`active-tab:${userId}`, JSON.stringify(tabData));
}

export const getActiveTabData = async (userId: string) => {
  const data = await redis.get(`active-tab:${userId}`);
  return data ? JSON.parse(data) : null;
}

export const clearActiveTabData = async (userId: string) => {
  await redis.del(`active-tab:${userId}`);
};

export const subscribeToFriendsTabUpdates = async (userId: string) => {
  const friendships = await prisma.friendship.findMany({
    where: { userId },
    include: {
      friend: {
        select: { id: true, tabPrivacy: true }
      }
    }
  });

  for (const { friendId, friend } of friendships) {
    if (!friend) continue;
    const privacy = friend.tabPrivacy;

    if (privacy === 'friends_only') {
      await redisSubscriber.subscribe(`all-tabs-update:${friendId}`);
      await redisSubscriber.subscribe(`active-tab-update:${friendId}`);
      continue;
    } else if (privacy === 'close_friends_only') {
      const closeFriendRel = await prisma.friendship.findUnique({
        where: {
          userId_friendId: {
            userId: friendId,
            friendId: userId
          }
        },
        select: { closeFriend: true }
      });
      if (closeFriendRel?.closeFriend) {
        await redisSubscriber.subscribe(`all-tabs-update:${friendId}`);
        await redisSubscriber.subscribe(`active-tab-update:${friendId}`);
        console.log(`Subscribed to all-tabs-update:${friendId} and active-tab-update:${friendId} for close_friends_only`);
        continue;
      }
    }
  }

  redisSubscriber.on('message', (channel, message) => {
    let friendId = null;
    if (channel.startsWith('all-tabs-update:')) {
      friendId = channel.replace('all-tabs-update:', '');
      if (friendId === userId) return;
      const ws = wsClients[userId];
      if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify({
          type: "friend_tab_update",
          friendId,
          data: JSON.parse(message)
        }));
      }
    }

    if (channel.startsWith('active-tab-update:')) {
      friendId = channel.replace('active-tab-update:', '');
      if (friendId === userId) return;
      const ws = wsClients[userId];
      if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify({
          type: "friend_active_tab_update",
          friendId,
          data: JSON.parse(message)
        }));
      }
    }
  });
}

// Tab Session and Aggregates Functions

export const setCurrentTabSession = async (userId: string, domain: string, startTime: number) => {
  await redis.hmset(`tab-session:${userId}`, { domain, startTime });
};

export const getCurrentTabSession = async (userId: string) => {
  const session = await redis.hgetall(`tab-session:${userId}`);
  return session && session.domain && session.startTime ? session : null;
};

export const incrementTabAggregate = async (userId: string, domain: string, seconds: number) => {
  const today = new Date().toISOString().slice(0, 10);
  await redis.hincrby(`tab-agg:${userId}:${today}`, domain, seconds);
};

export const getTabAggregates = async (userId: string, date: string) => {
  return await redis.hgetall(`tab-agg:${userId}:${date}`);
};

export const clearTabSession = async (userId: string) => {
  await redis.del(`tab-session:${userId}`);
};
export const clearTabAggregates = async (userId: string, date: string) => {
  await redis.del(`tab-agg:${userId}:${date}`);
};

// Presence Session and Aggregates Functions

export const setCurrentPresenceSession = async (userId: string, startTime: number) => {
  await redis.hmset(`presence-session:${userId}`, { startTime });
};

export const getCurrentPresenceSession = async (userId: string) => {
  const session = await redis.hgetall(`presence-session:${userId}`);
  return session && session.startTime ? session : null;
};

export const clearPresenceSession = async (userId: string) => {
  await redis.del(`presence-session:${userId}`);
};

export const incrementPresenceAggregate = async (userId: string, seconds: number) => {
  const today = new Date().toISOString().slice(0, 10);
  await redis.incrby(`presence-agg:${userId}:${today}`, seconds);
};

export const getPresenceAggregate = async (userId: string, date: string) => {
  const seconds = await redis.get(`presence-agg:${userId}:${date}`);
  return seconds ? Number(seconds) : 0;
};

export const clearPresenceAggregate = async (userId: string, date: string) => {
  await redis.del(`presence-agg:${userId}:${date}`);
};

export default redis;