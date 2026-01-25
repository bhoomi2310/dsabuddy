import { Schema, model } from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    }, 
    password: {
        type: String,
        required: true,
        min: 6,
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
}, { timestamps: true });

const BlacklistedTokenSchema = new Schema({
    token: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
}, { timestamps: true });

const User = model('user', userSchema);
export default User;
export const BlacklistedToken = model('blacklistedToken', BlacklistedTokenSchema);