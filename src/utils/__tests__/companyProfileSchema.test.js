import {
  DEFAULT_COMPANY_PROFILE,
  generateAiPrompt,
  synthesizeCompanyKnowledge,
  validateAndNormalizeCompanyProfileJson,
  sanitizeUrl,
  sanitizeEmail,
} from "../companyProfileSchema";

describe("Company Profile Schema & Mapping Utilities", () => {
  test("generateAiPrompt returns valid prompt string containing schema", () => {
    const prompt = generateAiPrompt();
    expect(typeof prompt).toBe("string");
    expect(prompt).toContain("You are a company profile onboarding assistant");
    expect(prompt).toContain("Company Profile JSON schema:");
    expect(prompt).toContain("companyName");
    expect(prompt).toContain("services");
    expect(prompt).toContain("products");
    expect(prompt).toContain("portfolio");
  });

  test("validateAndNormalizeCompanyProfileJson handles valid JSON string", () => {
    const validJsonStr = JSON.stringify({
      company: {
        companyName: "TechCorp",
        industry: "IT Services",
      },
      services: [
        { name: "Cloud Migration", description: "Migrate infrastructure to cloud." },
      ],
      products: [
        { name: "CloudSync", description: "Realtime data sync tool.", features: "Auto-backup" },
      ],
      portfolio: [
        { projectName: "Bank Migration", links: "https://example.com", description: "High security migration." },
      ],
      faqs: [
        { question: "What is support time?", answer: "24/7" },
      ],
    });

    const result = validateAndNormalizeCompanyProfileJson(validJsonStr);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.normalizedData.company.companyName).toBe("TechCorp");
    expect(result.normalizedData.services[0].name).toBe("Cloud Migration");
    expect(result.normalizedData.products[0].name).toBe("CloudSync");
    expect(result.normalizedData.portfolio[0].projectName).toBe("Bank Migration");
    expect(result.normalizedData.faqs[0].question).toBe("What is support time?");
  });

  test("validateAndNormalizeCompanyProfileJson handles invalid JSON string safely", () => {
    const invalidJsonStr = "{ company: { companyName: 'Broken' ";
    const result = validateAndNormalizeCompanyProfileJson(invalidJsonStr);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain("Invalid JSON format");
    expect(result.normalizedData).toBeNull();
  });

  test("validateAndNormalizeCompanyProfileJson handles partial JSON with fallback defaults", () => {
    const partialData = {
      company: {
        companyName: "Acme",
      },
    };

    const result = validateAndNormalizeCompanyProfileJson(partialData);
    expect(result.isValid).toBe(true);
    expect(result.normalizedData.company.companyName).toBe("Acme");
    expect(result.normalizedData.services).toEqual([]);
    expect(result.normalizedData.products).toEqual([]);
    expect(result.normalizedData.portfolio).toEqual([]);
    expect(result.normalizedData.writingStyle.preferredLanguage).toBe("English");
  });

  test("validateAndNormalizeCompanyProfileJson ignores unknown fields without crashing", () => {
    const dataWithUnknowns = {
      company: {
        companyName: "Acme",
      },
      unknownField123: "should be ignored",
      randomObject: { foo: "bar" },
    };

    const result = validateAndNormalizeCompanyProfileJson(dataWithUnknowns);
    expect(result.isValid).toBe(true);
    expect(result.normalizedData.company.companyName).toBe("Acme");
    expect(result.normalizedData).not.toHaveProperty("unknownField123");
  });

  test("synthesizeCompanyKnowledge produces structured Markdown", () => {
    const profile = {
      company: {
        companyName: "Alpha Logistics",
        industry: "Freight",
        businessDescription: "Global logistics partner.",
      },
      services: [
        { name: "Air Freight", description: "Express air cargo delivery." },
      ],
      faqs: [
        { question: "How to track shipment?", answer: "Use our tracking portal." },
      ],
    };

    const markdown = synthesizeCompanyKnowledge(profile);
    expect(markdown).toContain("# Company Overview & Details");
    expect(markdown).toContain("Alpha Logistics");
    expect(markdown).toContain("# Services Offered");
    expect(markdown).toContain("Air Freight");
    expect(markdown).toContain("# Frequently Asked Questions");
    expect(markdown).toContain("How to track shipment?");
  });

  test("sanitizeUrl and sanitizeEmail strip markdown links and mailto prefixes correctly", () => {
    expect(sanitizeUrl("[https://thefodtech.com](https://thefodtech.com)")).toBe("https://thefodtech.com");
    expect(sanitizeEmail("[fold@gmail.com](mailto:fold@gmail.com)")).toBe("fold@gmail.com");
    expect(sanitizeEmail("mailto:support@example.com")).toBe("support@example.com");
    expect(sanitizeUrl("<https://example.com>")).toBe("https://example.com");
  });
});
