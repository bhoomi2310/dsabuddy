import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.warn('WARNING: RESEND_API_KEY is not configured. Using dummy key. Email sending will fail.');
}

const resend = new Resend(apiKey || 're_dummy_api_key_placeholder');

export default resend;
