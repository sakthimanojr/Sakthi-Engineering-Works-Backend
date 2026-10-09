/* Creates (or resets the password of) the admin account from ADMIN_EMAIL / ADMIN_PASSWORD. No default credentials exist. */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first.");
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.upsert({ where: { email }, update: { passwordHash }, create: { email, passwordHash } });
  console.log(`Admin account ready: ${email}. Remove ADMIN_PASSWORD from .env now.`);
}

main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); }).finally(() => prisma.$disconnect());
