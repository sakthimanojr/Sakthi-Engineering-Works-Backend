import nodemailer from "nodemailer";

export function emailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.EMAIL_TO && process.env.EMAIL_FROM);
}

export async function sendNotification(subject: string, text: string, replyTo?: string): Promise<boolean> {
  if (!emailConfigured()) return false;
  const port = Number(process.env.SMTP_PORT || 587);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port, secure: port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  await transport.sendMail({ from: process.env.EMAIL_FROM, to: process.env.EMAIL_TO, replyTo, subject, text });
  return true;
}
