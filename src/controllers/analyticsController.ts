import { Request, Response } from "express";
import prisma from "../utils/prisma";

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
