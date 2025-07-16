import prisma from '../utils/prisma';
import { flushPresenceForUser } from '../utils/flushPresence';
import { flushTabUsageForUser } from '../utils/flushTabUsage';
import { wsClients } from '../websocket/handler';

const FLUSH_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

async function flushAllUsersAnalytics() {
  const users = await prisma.user.findMany({ select: { id: true } });

  for (const user of users) {
    const userId = user.id;
    
    let presenceSessionId = null;
    const ws = wsClients[userId];
    if (ws) {
      presenceSessionId = (ws as any).presenceSessionId;
    }
    
    await flushPresenceForUser(userId, undefined, undefined, presenceSessionId);
    await flushTabUsageForUser(userId);
  }

  console.log(`[AnalyticsWorker] Flushed analytics for ${users.length} users at ${new Date().toISOString()}`);
}

export function startAnalyticsFlushWorker() {
  setInterval(flushAllUsersAnalytics, FLUSH_INTERVAL_MS);
  flushAllUsersAnalytics();
}