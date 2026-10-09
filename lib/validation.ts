import { z } from "zod";
import { serviceSlugs } from "@/data/catalog";

const clean = (v: string) => v.replace(/[\s-]/g, "");
const isMobile = (v: string) => /^(?:\+?91)?[6-9]\d{9}$/.test(clean(v));
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

const req = (max = 120) => z.string().trim().min(1, "required").max(max, "too_long");
const opt = (max = 200) => z.string().trim().max(max, "too_long").default("");
const mobile = z.string().trim().min(1, "required").refine(isMobile, "invalid_mobile");
const optMobile = z.string().trim().default("").refine((v) => v === "" || isMobile(v), "invalid_mobile");
const optEmail = z.string().trim().max(120, "too_long").default("").refine((v) => v === "" || isEmail(v), "invalid_email");
const service = z.string().trim().max(80).default("").refine((v) => v === "" || v === "other" || (serviceSlugs as readonly string[]).includes(v), "required");

export const quickSchema = z.object({ name: req(), mobile, email: optEmail, service, message: req(2000) });
export const projectSchema = z.object({
  name: req(), company: opt(), mobile, whatsapp: optMobile, email: optEmail, location: req(200), service,
  description: req(3000), dimensions: opt(300), material: opt(300), quantity: opt(100), additional: opt(2000),
});
export const contactSchema = z.object({ name: req(), mobile, email: optEmail, message: req(2000) });

export const schemas = { quick: quickSchema, project: projectSchema, contact: contactSchema } as const;
export type EnquiryKind = keyof typeof schemas;
