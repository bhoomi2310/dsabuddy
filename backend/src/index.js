import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import routes from "./routes/index.js";
import session from "express-session";
import passport from "passport";
import authRoutes from "./routes/authRoutes.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import emailRoutes from "./routes/emailRoutes.js";
import uploadRoutes from "./routes/upload.js";

dotenv.config();

// Initialize express
const app = express();

// Connect to DB
connectDB();

// Middleware
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  })
);
app.use(express.json());

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Passport config
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
    (accessToken, refreshToken, profile, done) => {
      console.log("Google Profile:", profile.displayName);
      return done(null, profile);
    }
  )
);

// Routes
app.use("/api/auth", routes);
app.use("/api/oauth", authRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/upload', uploadRoutes);

// Default route
app.get("/", (req, res) => res.send("✅ Server running"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

