import { Router } from "express";
import { authMiddleware, ensureAuthenticated } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  incrementDailyActivityBodySchema,
  listDailyActivityQuerySchema,
} from "../validation/api.validation.js";
import {
  incrementMyDailyActivity,
  listMyDailyActivity,
  getUnifiedAnalytics,
} from "../controller/dailyActivity.controller.js";

const router = Router();

// Publicly readable analytics (can bypass auth if userName query parameter is present)
router.get("/analytics", authMiddleware, getUnifiedAnalytics);

router.use(authMiddleware, ensureAuthenticated);

router.get("/", validate({ query: listDailyActivityQuerySchema }), listMyDailyActivity);
router.post(
  "/increment",
  validate({ body: incrementDailyActivityBodySchema }),
  incrementMyDailyActivity
);

export default router;

