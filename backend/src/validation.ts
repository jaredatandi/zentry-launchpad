import { z } from "zod";

const NO_CONTROL = /[\u0000-\u001f\u007f]/;
const PHONE = /^\+?[0-9][0-9 ()-]{6,23}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function text(min: number, max: number) {
  return z
    .string()
    .trim()
    .min(min, `Must be at least ${min} characters`)
    .max(max, `Must be at most ${max} characters`)
    .refine((value) => !NO_CONTROL.test(value), "Control characters are not allowed");
}

function contact(min = 5) {
  return text(min, 120).refine(
    (value) => PHONE.test(value) || EMAIL.test(value),
    "Enter a valid phone number or email address",
  );
}

export const leadStatuses = [
  "new",
  "qualified",
  "quoted",
  "paid",
  "in_production",
  "delivered",
  "lost",
] as const;

export const leadSchema = z.object({
  name: text(2, 100),
  email: z.string().trim().email("Enter a valid email").max(254),
  phone: contact(7),
  business: text(2, 150),
  need: text(5, 2000),
  source: text(2, 60).default("website"),
  website: z.string().max(200).optional().default(""), // honeypot
  elapsed: z.coerce.number().min(0).max(100000).optional().default(0),
});

export const enquirySchema = z.object({
  pageId: z.coerce.number().int().positive(),
  name: text(2, 100),
  phone: contact(5),
  message: text(3, 2000),
  source: text(0, 120).optional().default(""),
  website: z.string().max(200).optional().default(""), // honeypot
  elapsed: z.coerce.number().min(0).max(100000).optional().default(0),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(200),
});

export const leadStatusSchema = z.object({ status: z.enum(leadStatuses) });

export const clientSchema = z.object({
  leadId: z.coerce.number().int().positive().optional().nullable(),
  businessName: text(2, 150),
  phone: contact(7),
  address: text(0, 250).optional().default(""),
  service: text(0, 500).optional().default(""),
  amount: z.coerce.number().finite().nonnegative().max(1000000),
  currency: z.enum(["USD", "KES"]),
  paymentStatus: z.enum(["unpaid", "paid", "refunded"]).optional().default("unpaid"),
  paymentRef: text(0, 120).optional().default(""),
});

export const pageConfigSchema = z.object({
  clientId: z.coerce.number().int().positive(),
  businessName: text(2, 150),
  phone: contact(7),
  address: text(3, 250),
  serviceBlurb: text(5, 500),
  accentColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex colour such as #00D6B4"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens")
    .min(3)
    .max(60)
    .optional(),
});

export const pageStatusSchema = z.object({
  status: z.enum(["draft", "generated", "deployed", "archived"]),
  deployedUrl: z
    .string()
    .trim()
    .max(500)
    .refine((value) => value === "" || /^https?:\/\/\S+$/i.test(value), "Use an http(s) URL or leave blank")
    .optional()
    .default(""),
});

export const invoiceCreateSchema = z.object({
  clientId: z.coerce.number().int().positive(),
});

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type LeadInput = z.infer<typeof leadSchema>;
export type EnquiryInput = z.infer<typeof enquirySchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type PageConfigInput = z.infer<typeof pageConfigSchema>;

/** Structured, user-safe error list for API responses. */
export function formatIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => `${issue.path.join(".") || "value"}: ${issue.message}`);
}
