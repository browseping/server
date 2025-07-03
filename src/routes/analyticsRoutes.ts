import { Router } from "express";
import { getTodayPresence, getWeeklyPresence } from "../controllers/analyticsController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/presence/today", authenticate, getTodayPresence);
router.get("/presence/weekly", authenticate, getWeeklyPresence);

export default router;