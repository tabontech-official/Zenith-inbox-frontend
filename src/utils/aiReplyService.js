/**
 * AI Reply Service
 * Uses OpenRouter → Google Gemma 4 26B A4B (free) to generate high-converting email replies
 * based on company knowledge from the company profile.
 */

const OPENROUTER_API_KEY =
  "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";
const OPENROUTER_MODEL = "google/gemma-4-26b-a4b-it:free";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const BACKEND_URL = "http://localhost:5000";

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
    return `You are a professional email assistant. Write high-converting, polite, and structured email replies.`;
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

  const senderName = cp.companyName ? "Samiullah Qureshi" : "Samiullah Qureshi";
  const companyName = cp.companyName || "Summit Digital Solutions";

  return `You are an expert Sales & Solutions Consultant for ${companyName}.

Your task is to generate a highly personalized, professional, and persuasive email reply based ONLY on the customer's inquiry.

## Company Context & Knowledge Base
- Company Name: ${companyName}
- Industry: ${cp.industry || "Digital Services"}
- Business Description: ${cp.businessDescription || "High-impact web development, strategic digital marketing, and business automation"}
- Services: ${services || "Web development, marketing, and business automation"}
- Delivery Timelines: ${timelines.deliveryTime || "As per scope"}
- FAQs: ${faqs || "N/A"}
- Knowledge Base: ${knowledge || "N/A"}

Instructions:
- Carefully analyze the customer's message before writing.
- Understand the customer's business, pain points, goals, budget, country, website, and requested service.
- Use your own knowledge and industry expertise to recommend the most suitable solution.
- Do NOT use generic marketing templates.
- Do NOT assume the customer needs services they did not mention.
- Only recommend services that directly solve the customer's stated problem.
- If appropriate, briefly explain how the proposed solution will benefit their business.
- Keep the email conversational, human, and consultative rather than salesy.
- Mention the customer's company name naturally if present.
- Mention the requested service and budget when relevant.
- Include a clear call-to-action, such as scheduling a discovery call or requesting any missing technical details.
- Use clear paragraph breaks (blank lines) between sections so the email is structured, formatted, and easy to read.

Sign off as:
${senderName}
${companyName}

Email Style & Guidelines:
- Professional
- Friendly
- Personalized
- Solution-focused
- 200–350 words
- No emojis
- No bullet points unless they improve readability
- Never mention services unrelated to the customer's inquiry.
- Never say "we specialize in everything" or use generic agency language.
- Every email must feel as if it was written specifically for that customer.

IMPORTANT: Output ONLY the complete email reply body text. Do NOT include a subject line, preamble, or markdown code block markers.`;
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
