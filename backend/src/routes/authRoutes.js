import express from "express";
import passport from "passport";

const router = express.Router();

// Start Google Login
router.get(
  "/google",
  (req, res, next) => {
    const referer = req.headers.referer;
    if (referer) {
      try {
        req.session.frontendOrigin = new URL(referer).origin;
      } catch (e) {
        console.error("Failed to parse referer in OAuth setup:", e);
      }
    }
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/api/oauth/fail" }),
  (req, res) => {
    const token = req.user?.token;
    const frontendUrl = req.session.frontendOrigin || process.env.FRONTEND_URL || "http://localhost:5173";
    if (!token) {
      return res.redirect(`${frontendUrl}/login?error=auth_token_missing`);
    }
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const needsOnboarding = !req.user?.branch || !req.user?.year;
    const targetPath = needsOnboarding ? "/onboarding" : "/dashboard";
    res.redirect(`${frontendUrl}${targetPath}?token=${token}`);
  }
);

// Failed login
router.get("/fail", (req, res) => {
  res.send("❌ Failed to authenticate");
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
