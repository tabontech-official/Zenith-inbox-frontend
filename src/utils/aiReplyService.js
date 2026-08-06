/**
 * AI Reply Service
 * Uses OpenRouter → Google Gemma 4 26B A4B (free) to generate high-converting email replies
 * based on company knowledge from the company profile.
 */

const OPENROUTER_API_KEY =
  "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";
const OPENROUTER_MODEL = "google/gemma-4-26b-a4b:free";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const BACKEND_URL = "https://email-syncing-backend.vercel.app";

/**
 * Fetch the company profile for the given user.
 * Returns the nested company object + knowledge base text.
 */
export async function fetchCompanyProfile(userId) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/company-profile/${userId}`);
    const json = await res.json();
    if (json.success && json.data) {
      return json.data; // { company: {...}, services: [...], faqs: [...], companyKnowledge: "...", ... }
    }
    return null;
  } catch (err) {
    console.warn("Could not load company profile for AI reply:", err.message);
    return null;
  }
}

/**
 * Build the system prompt from the company profile data.
 */
function buildSystemPrompt(profile) {
  if (!profile) {
    return `You are a professional email assistant. Write high-converting, polite, and concise email replies.`;
  }

  const cp = profile.company || {};
  const knowledge = profile.companyKnowledge || "";
  const services = (profile.services || [])
    .map((s) => `- ${s.name || s.title || ""}${s.description ? ": " + s.description : ""}`)
    .join("\n");
  const faqs = (profile.faqs || [])
    .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
    .join("\n\n");
  const policies = profile.policies || {};
  const timelines = profile.timelines || {};
  const writingStyle = profile.writingStyle || {};

  return `You are an expert email sales representative for ${cp.companyName || "our company"}.

## Company Information
- Company: ${cp.companyName || "N/A"}
- Industry: ${cp.industry || "N/A"}
- Description: ${cp.businessDescription || "N/A"}
- Website: ${cp.website || "N/A"}
- Support Email: ${cp.email || "N/A"}
- Phone: ${cp.phone || "N/A"}
- Address: ${cp.address || "N/A"}

## Services We Offer
${services || "General business services."}

## Delivery & Timeline Information
- Delivery Time: ${timelines.deliveryTime || "As per project scope"}
- Project Timeline: ${timelines.projectTimeline || "Discussed during consultation"}
- Support Hours: ${timelines.supportHours || "Business hours"}

## Policies
- Return Policy: ${policies.returnPolicy || "N/A"}
- Refund Policy: ${policies.refundPolicy || "N/A"}

## FAQs
${faqs || "No specific FAQs available."}

## Company Knowledge Base
${knowledge || "No additional knowledge available."}

## Writing Style Guidelines
- Tone: ${writingStyle.toneOfVoice || "Professional and friendly"}
- Brand Personality: ${writingStyle.brandPersonality || "Helpful and trustworthy"}
- Communication Style: ${writingStyle.communicationStyle || "Clear and concise"}
- Language: ${writingStyle.preferredLanguage || "English"}
${writingStyle.wordsToAvoid ? `- Words to avoid: ${writingStyle.wordsToAvoid}` : ""}

## Your Task
Write a HIGH-CONVERTING, professional email reply that:
1. Addresses the customer's inquiry directly
2. Highlights relevant services/solutions we offer
3. Builds trust and credibility using company information
4. Has a clear call-to-action (schedule a call, visit website, reply for more info)
5. Is warm, confident, and concise (max 200 words)
6. Does NOT include a subject line — write only the email body
7. Signs off with the company name
8. Does NOT use placeholder text like [Name] — write it naturally

IMPORTANT: Output ONLY the email body text. No subject line. No extra explanations. Just the email reply.`;
}

/**
 * Generate an AI email reply using OpenRouter Gemma model.
 *
 * @param {string} customerEmail - The customer's original email text
 * @param {object|null} profile - Company profile object from fetchCompanyProfile()
 * @param {string} customerName - Name of the customer (optional)
 * @returns {Promise<string>} - The generated email reply text
 */
export async function generateAiReply(customerEmail, profile, customerName = "") {
  const systemPrompt = buildSystemPrompt(profile);

  const userMessage = `Please write a professional email reply to this customer inquiry:

From: ${customerName || "A potential customer"}
---
${customerEmail}
---

Write the email reply body now:`;

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin,
      "X-Title": "Replex Engine AI Replies",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    throw new Error("No reply generated by AI model.");
  }

  return reply;
}

/**
 * Decrement the AI replies counter for the user after a successful send.
 * This calls the backend to increment aiRepliesUsed by 1.
 *
 * @param {string} userId
 * @param {object} emailMeta - { customerName, businessEmail, scenarioName, service, inboundMessage, generatedReply }
 */
export async function recordAiReplyUsed(userId, emailMeta = {}) {
  try {
    await fetch(`${BACKEND_URL}/auth/increment-ai-replies/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        customerName: emailMeta.customerName || "",
        businessEmail: emailMeta.businessEmail || "",
        scenarioName: emailMeta.scenarioName || "AI Reply",
        service: emailMeta.service || "General",
        inboundMessage: emailMeta.inboundMessage || "",
        generatedReply: emailMeta.generatedReply || "",
        scenarioType: emailMeta.scenarioType || "custom",
        status: "success",
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (err) {
    // Non-critical — log but don't block
    console.warn("Could not record AI reply usage:", err.message);
  }
}
