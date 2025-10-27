/** @format */

import { Router } from "express";
import { ussdController } from "../controllers/ussd.controller";
import { ussdLimiter } from "../../../core/middleware/rateLimit.middleware";

const router = Router();

// Africa's Talking USSD webhook
router.post("/", ussdLimiter, ussdController);

export default router;
