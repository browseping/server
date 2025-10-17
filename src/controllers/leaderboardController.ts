import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// GET /api/leaderboard/rank?month=2025-07
export const getUserRank = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { month } = req.query;
    
    const targetMonth = month ? String(month) : new Date().toISOString().slice(0, 7);
    
    const userEntry = await prisma.monthlyLeaderboard.findUnique({
      where: { userId_month: { userId, month: targetMonth } },
      select: { seconds: true }
    });
    
    if (!userEntry) {
      return res.json({
        success: true,
        data: {
          rank: null,
          totalSeconds: 0,
          totalHours: 0,
          month: targetMonth,
          totalUsers: 0
        }
      });
    }

    const usersAbove = await prisma.monthlyLeaderboard.count({
      where: {
        month: targetMonth,
        seconds: { gt: userEntry.seconds }
      }
    });
    
    // User's rank is usersAbove + 1
    const rank = usersAbove + 1;
    
    const totalUsers = await prisma.monthlyLeaderboard.count({
      where: { month: targetMonth }
    });
    
    return res.json({
      success: true,
      data: {
        rank,
        totalSeconds: userEntry.seconds,
        totalHours: +(userEntry.seconds / 3600).toFixed(2),
        month: targetMonth,
        totalUsers
      }
    });
    
  } catch (error) {
    console.error('Get user rank error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// GET /api/leaderboard/top?month=2025-07&page=1&limit=10
export const getTopUsers = async (req: Request, res: Response) => {
  try {
    const { month, page, limit } = req.query;
    
    const targetMonth = month ? String(month) : new Date().toISOString().slice(0, 7);
    
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(Math.max(1, Number(limit) || 10), 100);
    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;
    
    const totalUsers = await prisma.monthlyLeaderboard.count({
      where: { month: targetMonth }
    });
    
    const topUsers = await prisma.monthlyLeaderboard.findMany({
      where: { month: targetMonth },
      orderBy: { seconds: 'desc' },
      skip,
      take,
      include: {
        user: {
          select: {
            username: true,
            displayName: true,
            totalOnlineSeconds: true
          }
        }
      }
    });
    
    const leaderboard = topUsers.map((entry, index) => ({
      rank: skip + index + 1,
      userId: entry.userId,
      username: entry.user.username,
      displayName: entry.user.displayName,
      monthlySeconds: entry.seconds,
      monthlyHours: +(entry.seconds / 3600).toFixed(2),
      totalOnlineHours: +(entry.user.totalOnlineSeconds / 3600).toFixed(2)
    }));
    
    const totalPages = Math.ceil(totalUsers / take);
    const hasNext = skip + take < totalUsers;
    const hasPrev = skip > 0;
    
    return res.json({
      success: true,
      data: {
        month: targetMonth,
        leaderboard,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalUsers,
          hasNext,
          hasPrev,
          startRank: skip + 1,
          endRank: Math.min(skip + take, totalUsers)
        }
      }
    });
    
  } catch (error) {
    console.error('Get top users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// GET /api/leaderboard/public-top?month=2025-07
export const getPublicTopUsers = async (req: Request, res: Response) => {
  try {
    const { month } = req.query;
    
    const targetMonth = month ? String(month) : new Date().toISOString().slice(0, 7);

    const limit = 15;
    
    const totalUsers = await prisma.monthlyLeaderboard.count({
      where: { month: targetMonth }
    });
    
    const topUsers = await prisma.monthlyLeaderboard.findMany({
      where: { month: targetMonth },
      orderBy: { seconds: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            username: true,
            displayName: true,
            totalOnlineSeconds: true
          }
        }
      }
    });
    
    const leaderboard = topUsers.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      username: entry.user.username,
      displayName: entry.user.displayName,
      monthlySeconds: entry.seconds,
      monthlyHours: +(entry.seconds / 3600).toFixed(2),
      totalOnlineHours: +(entry.user.totalOnlineSeconds / 3600).toFixed(2)
    }));
    
    return res.json({
      success: true,
      data: {
        month: targetMonth,
        leaderboard,
        totalUsers: totalUsers
      }
    });
    
  } catch (error) {
    console.error('Get public top users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// GET /api/leaderboard/user-position?month=2025-07&userId=...
export const getUserPosition = async (req: Request, res: Response) => {
  try {
    const requesterId = req.user.id;
    const { month, userId } = req.query;

    const targetMonth = month ? String(month) : new Date().toISOString().slice(0, 7);
    const targetUserId = userId ? String(userId) : requesterId;
    
    const userEntry = await prisma.monthlyLeaderboard.findUnique({
      where: { userId_month: { userId: targetUserId, month: targetMonth } },
      include: {
        user: {
          select: {
            username: true,
            displayName: true,
            totalOnlineSeconds: true
          }
        }
      }
    });
    
    if (!userEntry) {
      return res.json({
        success: true,
        data: {
          user: null,
          rank: null,
          message: 'User not found in leaderboard for this month'
        }
      });
    }
    
    const usersAbove = await prisma.monthlyLeaderboard.count({
      where: {
        month: targetMonth,
        seconds: { gt: userEntry.seconds }
      }
    });
    
    const rank = usersAbove + 1;
    
    return res.json({
      success: true,
      data: {
        user: {
          userId: userEntry.userId,
          username: userEntry.user.username,
          displayName: userEntry.user.displayName,
          monthlySeconds: userEntry.seconds,
          monthlyHours: +(userEntry.seconds / 3600).toFixed(2),
          totalOnlineHours: +(userEntry.user.totalOnlineSeconds / 3600).toFixed(2)
        },
        rank,
        month: targetMonth
      }
    });
    
  } catch (error) {
    console.error('Get user position error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};