import { Router } from "express";
import { getTodayPresence,
    getWeeklyPresence,
    getTodayTabUsage,
    getWeeklyTabUsage,
    flushAnalytics } from "../controllers/analyticsController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/presence/today", authenticate, getTodayPresence);
router.get("/presence/weekly", authenticate, getWeeklyPresence);

router.get("/tab-usage/today", authenticate, getTodayTabUsage);
router.get("/tab-usage/weekly", authenticate, getWeeklyTabUsage);

router.post('/flush', authenticate, flushAnalytics);

export default router;