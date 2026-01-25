import { z } from 'zod';

export const signupPostRequestBodySchema = z.object({
    name: z.string(),
    userName: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
})

export const loginPostRequestBodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export const onboardingPostRequestBodySchema = z.object({
    displayName: z.string().min(1).max(50),
    avatar: z.string().url().optional().or(z.literal('')),
    leetcodeId: z.string().optional().or(z.literal('')),
    hackerrankId: z.string().optional().or(z.literal('')),
    codeforcesId: z.string().optional().or(z.literal('')),
    codechefId: z.string().optional().or(z.literal('')),
    gfgId: z.string().optional().or(z.literal('')),
})