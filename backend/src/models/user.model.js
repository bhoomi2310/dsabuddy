import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    salt: {
      type: String,
      required: true,
    },

    // Profile fields
    displayName: {
      type: String,
      trim: true,
    },

    avatar: {
      type: String,
      trim: true,
    },

    // Platform IDs
    leetcodeId: {
      type: String,
      trim: true,
    },

    hackerrankId: {
      type: String,
      trim: true,
    },

    codeforcesId: {
      type: String,
      trim: true,
    },

    codechefId: {
      type: String,
      trim: true,
    },

    gfgId: {
      type: String,
      trim: true,
    },

    // Onboarding status
    onboardingComplete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const BlacklistedTokenSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically delete expired blacklisted tokens
BlacklistedTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const User = model("user", userSchema);
const BlacklistedToken = model(
  "blacklistedToken",
  BlacklistedTokenSchema
);

export default User;
export { BlacklistedToken };