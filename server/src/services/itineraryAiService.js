import OpenAI from "openai";

const SYSTEM_PROMPT =
  "You create concise, practical travel itineraries from booking text. Return valid JSON only.";

const buildUserPrompt = (extractedText, notes, maxChars = 12000) => `
Create a structured travel itinerary from the following booking data.

Return JSON with exactly these keys: title, destination, startDate, endDate, summary, days, bookings, tips.

days must be an array of objects. Each day object MUST have ALL of these fields:
- date: the calendar date (string)
- title: short title for the day (string)
- morning: specific activities, sightseeing, or plans for the morning hours (string, NEVER empty)
- afternoon: specific activities, sightseeing, or plans for the afternoon hours (string, NEVER empty)
- evening: specific activities, dining, or plans for the evening hours (string, NEVER empty)
- logistics: transport, transfers, check-in/check-out info, airport pickups (string)

IMPORTANT: morning, afternoon, and evening must contain real activity descriptions based on the destination. Do NOT leave them empty or null.

bookings must be an array of objects, each with: type, provider, confirmation, date, time, location, notes.

tips must be an array of useful travel tip strings.

User notes:
${notes || "None"}

Extracted booking text:
${extractedText.slice(0, maxChars)}
`.trim();

export async function generateItinerary({ extractedText, notes }) {
  if (!process.env.OPENAI_API_KEY) {
    if (process.env.OPENROUTER_API_KEY) {
      return generateWithOpenRouter({ extractedText, notes });
    }
    const hfResult = await generateWithHuggingFace({ extractedText, notes });
    if (!hfResult) {
      throw new Error(
        "AI generation failed. Configure a valid OpenAI, OpenRouter, or Hugging Face API key."
      );
    }
    return hfResult;
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(extractedText, notes) }
    ],
    temperature: 0.35
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI generation failed. OpenAI returned an empty response.");
  }

  return normalizeAiPayload(JSON.parse(content));
}

async function generateWithOpenRouter({ extractedText, notes }) {
  const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1"
  });
  const model = process.env.OPENROUTER_MODEL || "google/gemma-2-2b-it";

  const completion = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(extractedText, notes) }
    ],
    temperature: 0.35
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI generation failed. OpenRouter returned an empty response.");
  }

  return normalizeAiPayload(JSON.parse(content));
}

async function generateWithHuggingFace({ extractedText, notes }) {
  const model = process.env.HF_MODEL || "mistralai/Mistral-7B-Instruct-v0.2";
  const token = process.env.HF_API_TOKEN || "";

  if (!token) return null;

  const prompt = `You are a travel planner. Create a concise itinerary from the booking text.
Return ONLY valid JSON with keys: title, destination, startDate, endDate, summary, days, bookings, tips.

days must be an array of objects. Each day MUST have ALL of these fields filled:
- date: calendar date string
- title: short day title
- morning: real morning activity descriptions (NEVER empty)
- afternoon: real afternoon activity descriptions (NEVER empty)
- evening: real evening activity or dining descriptions (NEVER empty)
- logistics: transport and transfer info

bookings must be an array of objects with: type, provider, confirmation, date, time, location, notes.
tips must be an array of strings.

User notes:
${notes || "None"}

Extracted booking text:
${extractedText.slice(0, 8000)}
`;

  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 900,
            temperature: 0.35,
            return_full_text: false
          }
        })
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const rawText = data?.[0]?.generated_text || data?.generated_text || "";
    const parsed = safeJsonParse(rawText);
    return parsed ? normalizeAiPayload(parsed) : null;
  } catch {
    return null;
  }
}

function safeJsonParse(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function normalizeAiPayload(payload) {
  return {
    title: payload.title || "AI Travel Itinerary",
    destination: payload.destination || "Upcoming trip",
    startDate: payload.startDate || "",
    endDate: payload.endDate || "",
    summary: payload.summary || "",
    days: normalizeDays(payload.days),
    bookings: normalizeBookings(payload.bookings),
    tips: normalizeStringArray(payload.tips)
  };
}

function normalizeBookings(bookings) {
  if (!bookings) return [];

  if (typeof bookings === "string") {
    const parsed = safeJsonParse(bookings);
    if (parsed) return normalizeBookings(parsed);
    return parseBookingsFromText(bookings);
  }

  if (Array.isArray(bookings)) {
    return bookings.flatMap((item) => normalizeBookingItem(item)).filter(Boolean);
  }

  return normalizeBookingItem(bookings);
}

function normalizeBookingItem(item) {
  if (!item) return [];

  if (typeof item === "string") {
    const parsed = safeJsonParse(item);
    if (parsed) return normalizeBookings(parsed);
    return parseBookingsFromText(item);
  }

  if (Array.isArray(item)) return normalizeBookings(item);
  if (typeof item !== "object") return [];

  const normalized = {
    type: stringifyField(item.type),
    provider: stringifyField(item.provider),
    confirmation: stringifyField(item.confirmation),
    date: stringifyField(item.date),
    time: stringifyField(item.time),
    location: stringifyField(item.location),
    notes: stringifyField(item.notes)
  };

  return Object.values(normalized).some(Boolean) ? [normalized] : [];
}

function parseBookingsFromText(text) {
  if (!text || typeof text !== "string") return [];

  const blocks = text.match(/\{[\s\S]*?\}/g) || [];
  const sourceBlocks = blocks.length ? blocks : [text];

  return sourceBlocks
    .map((block) => {
      const booking = {};
      const pattern =
        /(type|provider|confirmation|date|time|location|notes)\s*:\s*([^\n\r}]+)/gi;
      let match;
      while ((match = pattern.exec(block)) !== null) {
        const key = match[1].toLowerCase();
        const value = match[2]
          .trim()
          .replace(/^['"]|['"]$/g, "")
          .replace(/['"],?\s*\+\s*$/g, "")
          .replace(/\\n/g, " ");
        booking[key] = value;
      }
      return Object.keys(booking).length ? booking : null;
    })
    .filter(Boolean);
}

function normalizeDays(days) {
  if (!days) return [];

  if (typeof days === "string") {
    const parsed = safeJsonParse(days);
    return Array.isArray(parsed) ? parsed : [];
  }

  return Array.isArray(days)
    ? days
        .filter((day) => day && typeof day === "object")
        .map((day, index) => ({
          date: stringifyField(day.date) || `Day ${index + 1}`,
          title: stringifyField(day.title) || `Day ${index + 1}`,
          morning: stringifyField(day.morning) || "",
          afternoon: stringifyField(day.afternoon) || "",
          evening: stringifyField(day.evening) || "",
          logistics: stringifyField(day.logistics) || ""
        }))
    : [];
}

function normalizeStringArray(items) {
  if (!items) return [];

  if (typeof items === "string") {
    const parsed = safeJsonParse(items);
    return Array.isArray(parsed) ? parsed : [items];
  }

  return Array.isArray(items) ? items.map(stringifyField).filter(Boolean) : [];
}

function stringifyField(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}