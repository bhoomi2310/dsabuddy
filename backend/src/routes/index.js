import { Router } from "express";
import { login, logoutUser, me, signup, updatePassword, updateOnboarding } from "./user.routes.js";

import { authMiddleware, ensureAuthenticated } from "../middlewares/auth.middleware.js";


const 
router = Router();

router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', logoutUser)
router.get('/me', authMiddleware, ensureAuthenticated, me)
router.post('/update-password', authMiddleware, ensureAuthenticated, updatePassword);
router.post('/onboarding', authMiddleware, ensureAuthenticated, updateOnboarding);

export default router;
