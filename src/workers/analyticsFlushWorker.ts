import prisma from '../utils/prisma';
import redis, {
  getCurrentTabSession,
  incrementTabAggregate,
  getTabAggregates,
  clearTabSession,
  clearTabAggregates,
  getActiveTabData,
  setCurrentTabSession,
  isUserOnline,
  clearActiveTabData,
  clearLatestTabsData
} from '../utils/redis';

async function flushAllUsersAnalytics() {
  const today = new Date().toISOString().slice(0, 10);

  const users = await prisma.user.findMany({ select: { id: true } });

  for (const user of users) {
    const userId = user.id;

    const currentTabSession = await getCurrentTabSession(userId);
    if (currentTabSession && currentTabSession.domain && currentTabSession.startTime) {
      const duration = Math.floor((Date.now() - Number(currentTabSession.startTime)) / 1000);
      if (duration > 0) {
        await incrementTabAggregate(userId, currentTabSession.domain, duration);
      }
    }

    const aggregates = await getTabAggregates(userId, today);
    for (const [domain, seconds] of Object.entries(aggregates)) {
      await prisma.tabUsage.upsert({
        where: { userId_date_domain: { userId, date: new Date(today), domain } },
        update: { seconds: { increment: Number(seconds) } },
        create: { userId, date: new Date(today), domain, seconds: Number(seconds) }
      });
    }

    await clearTabAggregates(userId, today);
    await clearTabSession(userId);
  
    const activeTab = await getActiveTabData(userId);
    const online = await isUserOnline(userId);
    if (activeTab && activeTab.url) {
      if (online) {
        await setCurrentTabSession(userId, activeTab.url, Date.now());
      } else {
        await clearActiveTabData(userId);
        await clearLatestTabsData(userId);
      }
    }
  }

  console.log(`[AnalyticsWorker] Flushed analytics for ${users.length} users at ${new Date().toISOString()}`);
}

export function startAnalyticsFlushWorker() {
  setInterval(flushAllUsersAnalytics, 15 * 60 * 1000);  // Flush in every 15 minutes
  flushAllUsersAnalytics();
}