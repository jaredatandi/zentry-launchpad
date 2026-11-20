import { describe, expect, it } from "vitest";
import { enquirySchema, leadSchema, leadStatusSchema, pageConfigSchema } from "./validation";

const validLead = {
  name: "Amina Njoroge",
  email: "amina@example.com",
  phone: "+254 701 074 998",
  business: "Riverside Dental",
  need: "A one-page holding site for my practice",
  source: "website",
};

describe("input validation", () => {
  it("accepts and trims a valid lead", () => {
    const result = leadSchema.parse({ ...validLead, name: "  Amina Njoroge  " });
    expect(result.name).toBe("Amina Njoroge");
    expect(result.source).toBe("website");
  });

  it("rejects bad emails and control characters", () => {
    expect(leadSchema.safeParse({ ...validLead, email: "not-an-email" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...validLead, need: "hello\u0000world" }).success).toBe(false);
  });

  it("requires a real message and coerces the page id on enquiries", () => {
    const good = enquirySchema.parse({
      pageId: "12",
      name: "Mary Wanjiku",
      phone: "+254700000001",
      message: "Please call me about an appointment",
    });
    expect(good.pageId).toBe(12);
    expect(
      enquirySchema.safeParse({ ...good, message: "hi" }).success,
    ).toBe(false);
  });

  it("only allows valid page configuration and statuses", () => {
    expect(
      pageConfigSchema.safeParse({
        clientId: 1,
        businessName: "Test Clinic",
        phone: "+254701074998",
        address: "12 Main Street, Nairobi",
        serviceBlurb: "Family dentistry in town",
        accentColor: "#00D6B4",
      }).success,
    ).toBe(true);
    expect(
      pageConfigSchema.safeParse({
        clientId: 1,
        businessName: "Test Clinic",
        phone: "+254701074998",
        address: "12 Main Street, Nairobi",
        serviceBlurb: "Family dentistry in town",
        accentColor: "url(javascript:alert(1))",
      }).success,
    ).toBe(false);
    expect(leadStatusSchema.safeParse({ status: "hacked" }).success).toBe(false);
  });
});
