import prisma from './prisma';
import {
  getCurrentPresenceSession,
  incrementPresenceAggregate,
  getPresenceAggregate,
  clearPresenceSession,
  clearPresenceAggregate,
  isUserOnline,
  setCurrentPresenceSession,
} from './redis';

const FLUSH_INTERVAL_MS = 15 * 60 * 1000;

export async function flushPresenceForUser(userId: string, today?: string, month?: string, presenceSessionId?: string) {
  today = today || new Date().toISOString().slice(0, 10);
  month = month || today.slice(0, 7);

  const currentPresenceSession = await getCurrentPresenceSession(userId);
  if (currentPresenceSession && currentPresenceSession.startTime) {
    const duration = Math.floor((Date.now() - Number(currentPresenceSession.startTime)) / 1000);
    const maxValidSessionSeconds = FLUSH_INTERVAL_MS / 1000 + 300;
    
    if (duration > 0) console.log(`[FlushPresence] Redis session for user ${userId}: duration=${duration}s`);
    
    if (duration > 0 && duration <= maxValidSessionSeconds) {
      await incrementPresenceAggregate(userId, duration);
    } else {
      console.warn(`[FlushPresence] Skipped invalid Redis session for user ${userId}: duration=${duration}s`);
    }
    
    await clearPresenceSession(userId);
  }

  // Handle DB presence session update
  let dbSession = null;
  
  if (presenceSessionId) {
    dbSession = await prisma.presenceSession.findUnique({ 
      where: { id: presenceSessionId }
    });

    if (dbSession) {
    const endTime = new Date();
    let SessionDuration;
    if (dbSession.endTime) {
      SessionDuration = Math.floor((endTime.getTime() - dbSession.endTime.getTime()) / 1000);
    } else {
      SessionDuration = Math.floor((endTime.getTime() - dbSession.startTime.getTime()) / 1000);
    }
    const maxValidDBSessionSeconds = FLUSH_INTERVAL_MS / 1000 + 300;
    const totalDuration = Math.floor((endTime.getTime() - dbSession.startTime.getTime()) / 1000);
    if (SessionDuration > 0 && SessionDuration <= maxValidDBSessionSeconds) {
      await prisma.presenceSession.update({
        where: { id: dbSession.id },
        data: { 
          endTime, 
          duration: totalDuration 
        }
      });
      console.log(`[FlushPresence] Updated DB session ${dbSession.id} for user ${userId}: duration=${totalDuration}s`);
    } else {
      console.warn(`[FlushPresence] Skipped invalid DB session ${dbSession.id} for user ${userId}: duration=${totalDuration}s`);
    }
  }
  }

  const presenceSeconds = await getPresenceAggregate(userId, today);
  if (presenceSeconds > 0) {
    console.log(`[FlushPresence] Aggregated presence for user ${userId}: seconds=${presenceSeconds}`);
    await prisma.user.update({
      where: { id: userId },
      data: { totalOnlineSeconds: { increment: presenceSeconds } }
    });
    await prisma.monthlyLeaderboard.upsert({
      where: { userId_month: { userId, month } },
      update: { seconds: { increment: presenceSeconds } },
      create: { userId, month, seconds: presenceSeconds }
    });
  }
  await clearPresenceAggregate(userId, today);

  const online = await isUserOnline(userId);
  if (online) {
    await setCurrentPresenceSession(userId, Date.now());
  }
}