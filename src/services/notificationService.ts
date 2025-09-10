import prisma from '../utils/prisma';
import { wsClients } from '../websocket/handler';

export const notifyFriendsUserOnline = async (userId: string) => {
  try {
    
    const onlineUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        onlinePrivacy: true
      }
    });

    if (!onlineUser) return;

    if (onlineUser.onlinePrivacy === 'private') return;

    const friendships = await prisma.friendship.findMany({
      where: { friendId: userId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          }
        }
      }
    });

    for (const friendship of friendships) {
      const friend = friendship.user;
      
      const ws = wsClients[friend.id];
      if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify({
          type: 'FRIEND_ONLINE',
          data: {
            userId: onlineUser.id,
            username: onlineUser.username,
            displayName: onlineUser.displayName,
            timestamp: new Date().toISOString()
          }
        }));
      }
    }
  } catch (error) {
    console.error('Error notifying friends about user online:', error);
  }
};

export const notifyFriendsUserOffline = async (userId: string) => {
  try {
    
    const offlineUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        onlinePrivacy: true
      }
    });

    if (!offlineUser) return;

    if (offlineUser.onlinePrivacy === 'private') return;

    const friendships = await prisma.friendship.findMany({
      where: { friendId: userId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          }
        }
      }
    });

    for (const friendship of friendships) {
      const friend = friendship.user;
      
      const ws = wsClients[friend.id];
      if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify({
          type: 'FRIEND_OFFLINE',
          data: {
            userId: offlineUser.id,
            username: offlineUser.username,
            displayName: offlineUser.displayName,
            timestamp: new Date().toISOString()
          }
        }));
      }
    }
  } catch (error) {
    console.error('Error notifying friends about user offline:', error);
  }
};

export const notifyFriendRequestReceived = async (receiverId: string, senderId: string, requestId: string) => {
  try {
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: {
        id: true,
        username: true,
        displayName: true
      }
    });

    if (!sender) return;

    const ws = wsClients[receiverId];
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({
        type: 'FRIEND_REQUEST_RECEIVED',
        data: {
          senderId: sender.id,
          senderName: sender.displayName || sender.username,
          senderUsername: sender.username,
          requestId: requestId,
          timestamp: new Date().toISOString()
        }
      }));
    }
  } catch (error) {
    console.error('Error notifying friend request received:', error);
  }
};

export const notifyFriendRequestAccepted = async (senderId: string, accepterId: string) => {
  try {
    const accepter = await prisma.user.findUnique({
      where: { id: accepterId },
      select: {
        id: true,
        username: true,
        displayName: true
      }
    });

    if (!accepter) return;

    const ws = wsClients[senderId];
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({
        type: 'FRIEND_REQUEST_ACCEPTED',
        data: {
          accepterId: accepter.id,
          accepterName: accepter.displayName || accepter.username,
          accepterUsername: accepter.username,
          timestamp: new Date().toISOString()
        }
      }));
    }
  } catch (error) {
    console.error('Error notifying friend request accepted:', error);
  }
};
