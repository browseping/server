import prisma from './prisma';
import {
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
} from './redis';

const FLUSH_INTERVAL_MS = 15 * 60 * 1000;

export async function flushTabUsageForUser(userId: string) {
  const today = new Date().toISOString().slice(0, 10);

  const currentTabSession = await getCurrentTabSession(userId);
  if (currentTabSession && currentTabSession.domain && currentTabSession.startTime) {
    const duration = Math.floor((Date.now() - Number(currentTabSession.startTime)) / 1000);
    const maxValidSessionSeconds = FLUSH_INTERVAL_MS / 1000 + 300;
    if (duration > 0) console.log(`[FlushTabUsage] current tab session found for user ${userId}: domain=${currentTabSession.domain}, duration=${duration}s`);
    if (duration > 0 && duration <= maxValidSessionSeconds) {
      await incrementTabAggregate(userId, currentTabSession.domain, duration);
    } else {
      console.warn(`[FlushTabUsage] Skipped invalid tab session ${currentTabSession.domain} for user ${userId}: duration=${duration}s`);
    }
  }

  const aggregates = await getTabAggregates(userId, today);
  if (Object.keys(aggregates).length > 0) console.log(`[FlushTabUsage] Aggregates for user ${userId} on ${today}:`, aggregates);
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
  if (activeTab && activeTab.url) {
    const online = await isUserOnline(userId);
    if (online) {
      await setCurrentTabSession(userId, activeTab.url, Date.now());
    } else {
      await clearActiveTabData(userId);
      await clearLatestTabsData(userId);
    }
  }
}