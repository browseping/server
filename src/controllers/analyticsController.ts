import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { getCurrentTabSession, incrementTabAggregate, getTabAggregates, clearTabSession, clearTabAggregates, getCurrentPresenceSession, incrementPresenceAggregate, getPresenceAggregate, clearPresenceSession, clearPresenceAggregate } from '../utils/redis';
import { flushPresenceForUser } from '../utils/flushPresence';
import { flushTabUsageForUser } from "../utils/flushTabUsage";
import { wsClients } from '../websocket/handler';

// Helper to get start/end of a day
function getDayRange(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

// GET /api/analytics/presence/today
export const getTodayPresence = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { start, end } = getDayRange(new Date());
  const sessions = await prisma.presenceSession.findMany({
    where: {
      userId,
      startTime: { gte: start, lte: end }
    }
  });
  const totalSeconds = sessions.reduce((sum, s) =>
    sum + (s.duration ?? (s.endTime ? Math.floor((s.endTime.getTime() - s.startTime.getTime()) / 1000) : 0)), 0);
  res.json({ success: true, totalSeconds });
};

// GET /api/analytics/presence/weekly
export const getWeeklyPresence = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const days: { date: string, totalSeconds: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const { start, end } = getDayRange(date);
    const sessions = await prisma.presenceSession.findMany({
      where: {
        userId,
        startTime: { gte: start, lte: end }
      }
    });
    const totalSeconds = sessions.reduce((sum, s) =>
      sum + (s.duration ?? (s.endTime ? Math.floor((s.endTime.getTime() - s.startTime.getTime()) / 1000) : 0)), 0);
    days.push({ date: start.toISOString().slice(0, 10), totalSeconds });
  }
  res.json({ success: true, days });
};

// GET /api/analytics/tab-usage/today
export const getTodayTabUsage = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { start, end } = getDayRange(new Date());
  const usages = await prisma.tabUsage.findMany({
    where: {
      userId,
      date: { gte: start, lte: end }
    }
  });

  res.json({ success: true, data: usages.map(u => ({ domain: u.domain, seconds: u.seconds })) });
};

// GET /api/analytics/tab-usage/weekly
export const getWeeklyTabUsage = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const weekData: { date: string, domains: { domain: string, seconds: number }[] }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const { start, end } = getDayRange(date);
    const usages = await prisma.tabUsage.findMany({
      where: {
        userId,
        date: { gte: start, lte: end }
      }
    });
    weekData.push({
      date: start.toISOString().slice(0, 10),
      domains: usages.map(u => ({ domain: u.domain, seconds: u.seconds }))
    });
  }
  res.json({ success: true, data: weekData });
};


// GET /api/analytics/presence/hourly?days=7
export const getHourlyPresence = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const days = Number(req.query.days) || 7;
  const now = new Date();

  const hours = Array(24).fill(0);
  let totalSeconds = 0;
  let startDate: string | null = null;
  let endDate: string | null = null;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const { start, end } = getDayRange(date);

    if (!startDate) startDate = start.toISOString().slice(0, 10);
    endDate = end.toISOString().slice(0, 10);

    const sessions = await prisma.presenceSession.findMany({
      where: {
        userId,
        startTime: { gte: start, lte: end }
      }
    });

    for (const session of sessions) {
      let s = new Date(session.startTime);
      // let e = session.endTime ? new Date(session.endTime) : new Date();
      let e = session.endTime ? new Date(session.endTime) : s;
      if (e > end) e = end;
      if (s < start) s = start;

      while (s < e) {
        const hour = s.getHours();
        const nextHour = new Date(s);
        nextHour.setHours(hour + 1, 0, 0, 0);
        const segmentEnd = nextHour < e ? nextHour : e;
        const seconds = Math.floor((segmentEnd.getTime() - s.getTime()) / 1000);
        hours[hour] += seconds;
        totalSeconds += seconds;
        s = segmentEnd;
      }
    }
  }

  res.json({
    success: true,
    hours: hours.map((seconds, hour) => ({ hour, seconds })),
    totalSeconds,
    totalHours: +(totalSeconds / 3600).toFixed(2),
    days,
    startDate,
    endDate
  });
};

export const flushAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    let presenceSessionId = null;
    const ws = wsClients[userId];
    if (ws) {
      presenceSessionId = (ws as any).presenceSessionId;
    }
    await flushPresenceForUser(userId, undefined, undefined, presenceSessionId);
    await flushTabUsageForUser(userId);

    return res.json({ success: true });
  } catch (error) {
    console.error('Flush analytics error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
