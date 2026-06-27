import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import { prisma } from "./config/prismaClient.js";
import routes from "./routes/index.js";
import session from "express-session";
import passport from "passport";
import authRoutes from "./routes/authRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "./controller/mailerController.js";
import userRoutes from "./routes/user.routes.js";
import companyRoutes from "./routes/company.routes.js";
import questionRoutes from "./routes/question.routes.js";
import tagRoutes from "./routes/tag.routes.js";
import userQuestionRoutes from "./routes/userQuestion.routes.js";
import dailyActivityRoutes from "./routes/dailyActivity.routes.js";
import platformConnectionRoutes from "./routes/platformConnection.routes.js";
import syncRoutes from "./routes/sync.routes.js";
import forumRoutes from "./routes/forum.routes.js";
import leetcodeRoutes from "./routes/leetcode.routes.js";
import uploadRoutes from "./routes/upload.js";

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = new Set([
  "https://dsabuddy.xyz",
  "https://www.dsabuddy.xyz",
  "http://localhost:4173",
  "http://localhost:5173",
  process.env.FRONTEND_URL?.replace(/\/$/, ""),
].filter(Boolean));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/oauth/google/callback`,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (!profile.emails || profile.emails.length === 0) {
          return done(new Error("No email found in Google profile"), null);
        }
        const email = profile.emails[0].value.toLowerCase();
        if (!email.endsWith("@nsut.ac.in")) {
          return done(new Error("Only NSUT email addresses (@nsut.ac.in) are allowed."), null);
        }
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName || profile.emails[0].value.split("@")[0],
              userName: `user_${profile.id}`,
              avatarUrl: profile.photos?.[0]?.value || null,
            },
          });
          // Send welcome email asynchronously
          sendWelcomeEmail(user.email, user.name).catch((error) => {
            console.error("Failed to send welcome email to", user.email, error);
          });
        }

        const token = jwt.sign(
          {
            userId: user.id,
            _id: user.id,
            email: user.email,
            userName: user.userName,
          },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES || '7d' }
        );

        return done(null, { ...user, token });
      } catch (error) {
        console.error("Google Auth Error:", error);
        return done(error, null);
      }
    }
  )
);

app.use("/api/auth", routes);
app.use("/api/oauth", authRoutes);
app.use('/api/email', emailRoutes);
app.use("/api/users", userRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/user-questions", userQuestionRoutes);
app.use("/api/daily-activity", dailyActivityRoutes);
app.use("/api/platform-connections", platformConnectionRoutes);
app.use("/api/sync", syncRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/leetcode", leetcodeRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => res.send("Server running"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

