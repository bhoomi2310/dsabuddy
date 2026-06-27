import { z } from 'zod';

export const signupPostRequestBodySchema = z.object({
    name: z.string(),
    userName: z.string(),
    email: z.string().email().refine(val => val.toLowerCase().endsWith("@nsut.ac.in"), {
        message: "Only NSUT email addresses (@nsut.ac.in) are allowed."
    }),
    password: z.string().min(6),
})

export const loginPostRequestBodySchema = z.object({
    identifier: z.string().min(1, "Username or Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})
