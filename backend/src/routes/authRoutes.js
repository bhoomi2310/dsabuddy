import express from "express";
import passport from "passport";

const router = express.Router();

// Start Google Login
router.get(
  "/google",
  (req, res, next) => {
    const referer = req.headers.referer || process.env.FRONTEND_URL || "http://localhost:5173";
    let origin = "http://localhost:5173";
    try {
      origin = new URL(referer).origin;
    } catch (e) {
      console.error("Failed to parse referer in OAuth setup:", e);
    }
    passport.authenticate("google", { 
      scope: ["profile", "email"],
      state: origin
    })(req, res, next);
  }
);

// Google Callback
router.get("/google/callback", (req, res, next) => {
  const state = req.query.state || process.env.FRONTEND_URL || "http://localhost:5173";
  
  passport.authenticate("google", (err, user, info) => {
    if (err || !user) {
      const errMsg = err?.message || "";
      const errCode = errMsg.includes("NSUT") ? "email_not_nsut" : "auth_failed";
      return res.redirect(`${state}/login?error=${errCode}`);
    }
    
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        return res.redirect(`${state}/login?error=auth_failed`);
      }
      
      const token = user.token;
      if (!token) {
        return res.redirect(`${state}/login?error=auth_token_missing`);
      }
      
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      
      const needsOnboarding = !user.branch || !user.year;
      const targetPath = needsOnboarding ? "/onboarding" : "/dashboard";
      return res.redirect(`${state}${targetPath}?token=${token}`);
    });
  })(req, res, next);
});

// Failed login
router.get("/fail", (req, res) => {
  const frontendUrl = req.session.frontendOrigin || process.env.FRONTEND_URL || "http://localhost:5173";
  res.redirect(`${frontendUrl}/login?error=email_not_nsut`);
});

// Logout
router.get("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    const redirectUrl = req.headers.referer || process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(redirectUrl);
  });
});



export default router;
