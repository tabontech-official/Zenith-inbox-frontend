/**
 * Company Profile Schema & Mapping Layer
 * Source of truth for profile data fields, validation, normalization, AI prompt generation,
 * and Knowledge Base Markdown synthesis.
 */

export const DEFAULT_COMPANY_PROFILE = {
  company: {
    companyName: "",
    businessDescription: "",
    industry: "",
    website: "",
    email: "",
    phone: "",
    address: "",
    socialLinks: {
      linkedin: "",
      twitter: "",
      facebook: "",
      instagram: "",
      youtube: "",
    },
  },
  services: [],
  products: [],
  portfolio: [],
  faqs: [],
  policies: {
    returnPolicy: "",
    refundPolicy: "",
    shippingPolicy: "",
    privacyPolicy: "",
    termsAndConditions: "",
    customPolicies: [],
  },
  timelines: {
    deliveryTime: "",
    projectTimeline: "",
    supportHours: "",
    businessWorkingHours: "",
  },
  writingStyle: {
    toneOfVoice: "",
    brandPersonality: "",
    communicationStyle: "",
    preferredLanguage: "English",
    wordsToAvoid: "",
    exampleResponses: "",
  },
  companyKnowledge: "",
};

/**
 * Generate complete AI onboarding interview prompt
 */
export const generateAiPrompt = () => {
  const sampleJson = {
    company: {
      companyName: "Acme Innovations Inc.",
      businessDescription: "Leading provider of AI-powered email automation and workflow solutions.",
      industry: "Software & Technology",
      website: "https://acmeinnovations.com",
      email: "support@acmeinnovations.com",
      phone: "+1 (555) 234-5678",
      address: "100 Tech Boulevard, Suite 400, San Francisco, CA",
      socialLinks: {
        linkedin: "https://linkedin.com/company/acmeinnovations",
        twitter: "https://twitter.com/acmeinnovations",
        facebook: "https://facebook.com/acmeinnovations",
        instagram: "https://instagram.com/acmeinnovations",
        youtube: "https://youtube.com/@acmeinnovations",
      },
    },
    services: [
      {
        name: "Custom Workflow Automation",
        description: "Bespoke automation setup for enterprise CRM and email integration.",
      },
    ],
    products: [
      {
        name: "Zenith Inbox Pro",
        description: "AI-assisted multi-channel inbox with automated lead routing.",
        features: "AI auto-reply, Unified Inbox, Real-time CRM Sync",
      },
    ],
    portfolio: [
      {
        projectName: "Enterprise Sync Migration",
        links: "https://acmeinnovations.com/case-studies/enterprise-sync",
        description: "Migrated 50,000 active mailboxes with zero downtime for a Fortune 500 client.",
      },
    ],
    faqs: [
      {
        question: "How long does onboarding take?",
        answer: "Standard onboarding completes within 2 to 4 business days.",
      },
    ],
    policies: {
      returnPolicy: "30-day money back guarantee for all annual subscription plans.",
      refundPolicy: "Full refund processed within 5 business days upon request.",
      shippingPolicy: "Instant digital product delivery via license key.",
      privacyPolicy: "SOC-2 Type II compliant. End-to-end data encryption.",
      termsAndConditions: "Standard Enterprise SaaS Terms apply.",
      customPolicies: [
        {
          name: "SLA Guarantee",
          details: "99.9% guaranteed uptime with 24/7 priority support.",
        },
      ],
    },
    timelines: {
      deliveryTime: "2-4 business days",
      projectTimeline: "Discovery: 1 week, Build: 2 weeks, Go-Live: 1 week",
      supportHours: "Mon-Fri 9:00 AM - 6:00 PM EST (24/7 for Enterprise)",
      businessWorkingHours: "Mon - Fri: 9:00 AM - 6:00 PM EST",
    },
    writingStyle: {
      toneOfVoice: "Professional, Helpful, Empathetic",
      brandPersonality: "Innovative, Reliable, Premium",
      communicationStyle: "Direct, Action-oriented, Concise",
      preferredLanguage: "English (US)",
      wordsToAvoid: "Cheap, guaranteed, ASAP, baseline",
      exampleResponses: "Thank you for reaching out to Acme. We have processed your request...",
    },
    companyKnowledge: "# Company Overview & History\nFounded in 2020 to revolutionize email inbox workflows...\n\n# Core Mission & Values\nCustomer-first innovation with enterprise-grade reliability.",
  };

  return `You are a company profile onboarding assistant. Your job is to collect complete and accurate company information by interviewing me.

Ask me one question at a time. Base your questions only on the company profile schema provided below. If my answer is incomplete, ask a relevant follow-up question before moving forward.

Do not invent information. If I do not know something, keep that value empty.

After collecting all required information, return only one valid JSON object that exactly follows the provided schema. Do not include Markdown, code fences, comments, introductions, summaries, or any text outside the JSON.

The JSON must be directly importable into the application.

Company Profile JSON schema:

${JSON.stringify(sampleJson, null, 2)}

For the company knowledge section, organize the information into structured categories such as:
- Company overview
- Products and services
- Target customers
- Brand positioning
- Brand voice and tone
- Key differentiators
- Frequently asked questions
- Policies
- Processes
- Contact and support information
- Additional business knowledge

Use the exact knowledge structure supported by the application.

Begin by asking the first relevant question.`;
};

/**
 * Convert structured profile object into clean, formatted Markdown for Knowledge Base
 */
export const synthesizeCompanyKnowledge = (data) => {
  const parts = [];

  // Company Overview
  if (data.company) {
    const { companyName, businessDescription, industry, website, email, phone, address, socialLinks } = data.company;
    if (companyName || businessDescription || industry) {
      parts.push(`# Company Overview & Details\n`);
      if (companyName) parts.push(`**Company Name:** ${companyName}`);
      if (industry) parts.push(`**Industry:** ${industry}`);
      if (businessDescription) parts.push(`**Description:**\n${businessDescription}`);
      if (website) parts.push(`**Website:** ${website}`);
      if (email) parts.push(`**Support Email:** ${email}`);
      if (phone) parts.push(`**Phone:** ${phone}`);
      if (address) parts.push(`**Address:** ${address}`);

      if (socialLinks && Object.values(socialLinks).some((v) => Boolean(v))) {
        parts.push(`\n**Social Profiles:**`);
        if (socialLinks.linkedin) parts.push(`- LinkedIn: ${socialLinks.linkedin}`);
        if (socialLinks.twitter) parts.push(`- Twitter/X: ${socialLinks.twitter}`);
        if (socialLinks.facebook) parts.push(`- Facebook: ${socialLinks.facebook}`);
        if (socialLinks.instagram) parts.push(`- Instagram: ${socialLinks.instagram}`);
        if (socialLinks.youtube) parts.push(`- YouTube: ${socialLinks.youtube}`);
      }
      parts.push("");
    }
  }

  // Services
  if (Array.isArray(data.services) && data.services.length > 0) {
    parts.push(`# Services Offered\n`);
    data.services.forEach((s, idx) => {
      parts.push(`### ${idx + 1}. ${s.name || "Service"}`);
      if (s.description) parts.push(`${s.description}`);
      parts.push("");
    });
  }

  // Products
  if (Array.isArray(data.products) && data.products.length > 0) {
    parts.push(`# Products Catalog\n`);
    data.products.forEach((p, idx) => {
      parts.push(`### ${idx + 1}. ${p.name || "Product"}`);
      if (p.description) parts.push(`${p.description}`);
      if (p.features) parts.push(`**Features / Specs:** ${p.features}`);
      parts.push("");
    });
  }

  // Portfolio
  if (Array.isArray(data.portfolio) && data.portfolio.length > 0) {
    parts.push(`# Portfolio & Case Studies\n`);
    data.portfolio.forEach((item, idx) => {
      parts.push(`### ${idx + 1}. ${item.projectName || "Project"}`);
      if (item.links) parts.push(`**Link:** ${item.links}`);
      if (item.description) parts.push(`${item.description}`);
      parts.push("");
    });
  }

  // FAQs
  if (Array.isArray(data.faqs) && data.faqs.length > 0) {
    parts.push(`# Frequently Asked Questions\n`);
    data.faqs.forEach((faq, idx) => {
      parts.push(`**Q${idx + 1}: ${faq.question || ""}**`);
      parts.push(`A: ${faq.answer || ""}\n`);
    });
  }

  // Policies
  if (data.policies) {
    const { returnPolicy, refundPolicy, shippingPolicy, privacyPolicy, termsAndConditions, customPolicies } = data.policies;
    if (returnPolicy || refundPolicy || shippingPolicy || privacyPolicy || termsAndConditions || (customPolicies && customPolicies.length > 0)) {
      parts.push(`# Company Policies & Terms\n`);
      if (returnPolicy) parts.push(`**Return Policy:** ${returnPolicy}`);
      if (refundPolicy) parts.push(`**Refund Policy:** ${refundPolicy}`);
      if (shippingPolicy) parts.push(`**Shipping Policy:** ${shippingPolicy}`);
      if (privacyPolicy) parts.push(`**Privacy Highlights:** ${privacyPolicy}`);
      if (termsAndConditions) parts.push(`**Terms & Conditions:** ${termsAndConditions}`);

      if (Array.isArray(customPolicies) && customPolicies.length > 0) {
        parts.push(`\n**Custom Policies:**`);
        customPolicies.forEach((cp) => {
          parts.push(`- **${cp.name || "Policy"}:** ${cp.details || ""}`);
        });
      }
      parts.push("");
    }
  }

  // Timelines
  if (data.timelines) {
    const { deliveryTime, projectTimeline, supportHours, businessWorkingHours } = data.timelines;
    if (deliveryTime || projectTimeline || supportHours || businessWorkingHours) {
      parts.push(`# Timelines & Working Hours\n`);
      if (deliveryTime) parts.push(`- **Delivery Time:** ${deliveryTime}`);
      if (projectTimeline) parts.push(`- **Project Timeline:** ${projectTimeline}`);
      if (supportHours) parts.push(`- **Support Hours:** ${supportHours}`);
      if (businessWorkingHours) parts.push(`- **Working Hours:** ${businessWorkingHours}`);
      parts.push("");
    }
  }

  // Writing Style
  if (data.writingStyle) {
    const { toneOfVoice, brandPersonality, communicationStyle, preferredLanguage, wordsToAvoid, exampleResponses } = data.writingStyle;
    if (toneOfVoice || brandPersonality || communicationStyle || wordsToAvoid || exampleResponses) {
      parts.push(`# Brand Voice & Communication Style\n`);
      if (toneOfVoice) parts.push(`- **Tone:** ${toneOfVoice}`);
      if (brandPersonality) parts.push(`- **Personality:** ${brandPersonality}`);
      if (communicationStyle) parts.push(`- **Style:** ${communicationStyle}`);
      if (preferredLanguage) parts.push(`- **Language:** ${preferredLanguage}`);
      if (wordsToAvoid) parts.push(`- **Words to Avoid:** ${wordsToAvoid}`);
      if (exampleResponses) parts.push(`\n**Example Responses:**\n${exampleResponses}`);
      parts.push("");
    }
  }

  return parts.join("\n").trim();
};

/**
 * Clean URL string if formatted as Markdown link [text](url) or <url>
 */
export const sanitizeUrl = (val) => {
  if (typeof val !== "string") return "";
  let str = val.trim();
  if (!str) return "";

  // Handle markdown format [text](url) or [url](url)
  const mdMatch = str.match(/^\[.*?\]\((https?:\/\/[^\s\)]+)\)$/i) || str.match(/^\[.*?\]\((.*?)\)$/i);
  if (mdMatch && mdMatch[1]) {
    str = mdMatch[1].trim();
  }

  // Strip mailto: if mistakenly placed in URL field
  str = str.replace(/^mailto:/i, "");

  // Strip angle brackets <url>
  str = str.replace(/^<|>$|^<|>$/g, "").trim();

  return str;
};

/**
 * Clean Email string if formatted as Markdown link [email](mailto:email) or mailto:email or <email>
 */
export const sanitizeEmail = (val) => {
  if (typeof val !== "string") return "";
  let str = val.trim();
  if (!str) return "";

  // Handle markdown format [text](mailto:email) or [email](email)
  const mdMatch = str.match(/^\[.*?\]\((.*?)\)$/i);
  if (mdMatch && mdMatch[1]) {
    str = mdMatch[1].trim();
  }

  // Strip mailto: prefix
  str = str.replace(/^mailto:/i, "");

  // Strip angle brackets <email>
  str = str.replace(/^<|>$|^<|>$/g, "").trim();

  return str;
};

/**
 * Clean all fields of a company object (website, email, social links)
 */
export const sanitizeCompanyObject = (companyObj) => {
  if (!companyObj || typeof companyObj !== "object") return companyObj;
  return {
    ...companyObj,
    website: sanitizeUrl(companyObj.website),
    email: sanitizeEmail(companyObj.email),
    socialLinks: companyObj.socialLinks
      ? {
          linkedin: sanitizeUrl(companyObj.socialLinks.linkedin),
          twitter: sanitizeUrl(companyObj.socialLinks.twitter),
          facebook: sanitizeUrl(companyObj.socialLinks.facebook),
          instagram: sanitizeUrl(companyObj.socialLinks.instagram),
          youtube: sanitizeUrl(companyObj.socialLinks.youtube),
        }
      : companyObj.socialLinks,
  };
};

/**
 * Validate and normalize JSON input against Company Profile schema
 */
export const validateAndNormalizeCompanyProfileJson = (jsonContent) => {
  const errors = [];
  const warnings = [];

  let parsed = null;

  if (typeof jsonContent === "string") {
    try {
      const cleanedStr = jsonContent.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
      parsed = JSON.parse(cleanedStr);
    } catch (err) {
      return {
        isValid: false,
        errors: [`Invalid JSON format: ${err.message}`],
        warnings: [],
        normalizedData: null,
      };
    }
  } else if (typeof jsonContent === "object" && jsonContent !== null) {
    parsed = jsonContent;
  } else {
    return {
      isValid: false,
      errors: ["Invalid input: JSON data must be a string or object."],
      warnings: [],
      normalizedData: null,
    };
  }

  if (typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      isValid: false,
      errors: ["Root JSON content must be an object."],
      warnings: [],
      normalizedData: null,
    };
  }

  const normalized = JSON.parse(JSON.stringify(DEFAULT_COMPANY_PROFILE));
  const cleanStr = (val) => (typeof val === "string" ? val.trim() : typeof val === "number" || typeof val === "boolean" ? String(val) : "");

  // 1. Company
  if (parsed.company && typeof parsed.company === "object" && !Array.isArray(parsed.company)) {
    normalized.company.companyName = cleanStr(parsed.company.companyName);
    normalized.company.businessDescription = cleanStr(parsed.company.businessDescription);
    normalized.company.industry = cleanStr(parsed.company.industry);
    normalized.company.website = sanitizeUrl(cleanStr(parsed.company.website));
    normalized.company.email = sanitizeEmail(cleanStr(parsed.company.email));
    normalized.company.phone = cleanStr(parsed.company.phone);
    normalized.company.address = cleanStr(parsed.company.address);

    if (parsed.company.socialLinks && typeof parsed.company.socialLinks === "object") {
      normalized.company.socialLinks = {
        linkedin: sanitizeUrl(cleanStr(parsed.company.socialLinks.linkedin)),
        twitter: sanitizeUrl(cleanStr(parsed.company.socialLinks.twitter)),
        facebook: sanitizeUrl(cleanStr(parsed.company.socialLinks.facebook)),
        instagram: sanitizeUrl(cleanStr(parsed.company.socialLinks.instagram)),
        youtube: sanitizeUrl(cleanStr(parsed.company.socialLinks.youtube)),
      };
    }
  } else if (parsed.company !== undefined) {
    warnings.push("Field 'company' should be an object. Defaulted to empty company info.");
  }

  // 2. Services
  if (Array.isArray(parsed.services)) {
    normalized.services = parsed.services.map((s, idx) => ({
      id: s?.id ? String(s.id) : `${Date.now()}-service-${idx}`,
      name: cleanStr(s?.name),
      description: cleanStr(s?.description),
    }));
  } else if (parsed.services !== undefined) {
    warnings.push("Field 'services' should be an array. Defaulted to empty services.");
  }

  // 3. Products
  if (Array.isArray(parsed.products)) {
    normalized.products = parsed.products.map((p, idx) => ({
      id: p?.id ? String(p.id) : `${Date.now()}-product-${idx}`,
      name: cleanStr(p?.name),
      description: cleanStr(p?.description),
      features: cleanStr(p?.features),
    }));
  } else if (parsed.products !== undefined) {
    warnings.push("Field 'products' should be an array. Defaulted to empty products.");
  }

  // 4. Portfolio
  if (Array.isArray(parsed.portfolio)) {
    normalized.portfolio = parsed.portfolio.map((item, idx) => ({
      id: item?.id ? String(item.id) : `${Date.now()}-portfolio-${idx}`,
      projectName: cleanStr(item?.projectName || item?.name),
      links: cleanStr(item?.links || item?.link || item?.url),
      description: cleanStr(item?.description),
    }));
  } else if (parsed.portfolio !== undefined) {
    warnings.push("Field 'portfolio' should be an array. Defaulted to empty portfolio.");
  }

  // 5. FAQs
  if (Array.isArray(parsed.faqs)) {
    normalized.faqs = parsed.faqs.map((f, idx) => ({
      id: f?.id ? String(f.id) : `${Date.now()}-faq-${idx}`,
      question: cleanStr(f?.question),
      answer: cleanStr(f?.answer),
    }));
  } else if (parsed.faqs !== undefined) {
    warnings.push("Field 'faqs' should be an array. Defaulted to empty FAQs.");
  }

  // 6. Policies
  if (parsed.policies && typeof parsed.policies === "object" && !Array.isArray(parsed.policies)) {
    normalized.policies.returnPolicy = cleanStr(parsed.policies.returnPolicy);
    normalized.policies.refundPolicy = cleanStr(parsed.policies.refundPolicy);
    normalized.policies.shippingPolicy = cleanStr(parsed.policies.shippingPolicy);
    normalized.policies.privacyPolicy = cleanStr(parsed.policies.privacyPolicy);
    normalized.policies.termsAndConditions = cleanStr(parsed.policies.termsAndConditions);

    if (Array.isArray(parsed.policies.customPolicies)) {
      normalized.policies.customPolicies = parsed.policies.customPolicies.map((cp, idx) => ({
        id: cp?.id ? String(cp.id) : `${Date.now()}-custom-policy-${idx}`,
        name: cleanStr(cp?.name),
        details: cleanStr(cp?.details),
      }));
    }
  } else if (parsed.policies !== undefined) {
    warnings.push("Field 'policies' should be an object. Defaulted to empty policies.");
  }

  // 7. Timelines
  if (parsed.timelines && typeof parsed.timelines === "object" && !Array.isArray(parsed.timelines)) {
    normalized.timelines.deliveryTime = cleanStr(parsed.timelines.deliveryTime);
    normalized.timelines.projectTimeline = cleanStr(parsed.timelines.projectTimeline);
    normalized.timelines.supportHours = cleanStr(parsed.timelines.supportHours);
    normalized.timelines.businessWorkingHours = cleanStr(parsed.timelines.businessWorkingHours);
  } else if (parsed.timelines !== undefined) {
    warnings.push("Field 'timelines' should be an object. Defaulted to empty timelines.");
  }

  // 8. Writing Style
  if (parsed.writingStyle && typeof parsed.writingStyle === "object" && !Array.isArray(parsed.writingStyle)) {
    normalized.writingStyle.toneOfVoice = cleanStr(parsed.writingStyle.toneOfVoice);
    normalized.writingStyle.brandPersonality = cleanStr(parsed.writingStyle.brandPersonality);
    normalized.writingStyle.communicationStyle = cleanStr(parsed.writingStyle.communicationStyle);
    normalized.writingStyle.preferredLanguage = cleanStr(parsed.writingStyle.preferredLanguage) || "English";
    normalized.writingStyle.wordsToAvoid = cleanStr(parsed.writingStyle.wordsToAvoid);
    normalized.writingStyle.exampleResponses = cleanStr(parsed.writingStyle.exampleResponses);
  } else if (parsed.writingStyle !== undefined) {
    warnings.push("Field 'writingStyle' should be an object. Defaulted to empty writing style.");
  }

  // 9. Company Knowledge
  if (typeof parsed.companyKnowledge === "string" && parsed.companyKnowledge.trim()) {
    normalized.companyKnowledge = parsed.companyKnowledge.trim();
  } else if (typeof parsed.companyKnowledge === "object" && parsed.companyKnowledge !== null) {
    normalized.companyKnowledge = JSON.stringify(parsed.companyKnowledge, null, 2);
  } else {
    normalized.companyKnowledge = synthesizeCompanyKnowledge(normalized);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    normalizedData: normalized,
  };
};
