import OpenAI from "openai";

export async function generateItinerary({ extractedText, notes }) {
  if (!process.env.OPENAI_API_KEY) {
    if (process.env.OPENROUTER_API_KEY) {
      return generateWithOpenRouter({ extractedText, notes });
    }
    const hfResult = await generateWithHuggingFace({ extractedText, notes });
    if (!hfResult) {
      throw new Error("AI generation failed. Configure a valid OpenAI, OpenRouter, or Hugging Face API key.");
    }
    return hfResult;
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You create concise, practical travel itineraries from booking text. Return valid JSON only."
      },
      {
        role: "user",
        content: `Create a structured travel itinerary from the following booking data.

Return JSON with keys: title, destination, startDate, endDate, summary, days, bookings, tips.
days must be an array with date, title, morning, afternoon, evening, logistics.
bookings must include type, provider, confirmation, date, time, location, notes when available.

User notes:
${notes || "None"}

Extracted booking text:
${extractedText.slice(0, 12000)}`
      }
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
      {
        role: "system",
        content:
          "You create concise, practical travel itineraries from booking text. Return valid JSON only."
      },
      {
        role: "user",
        content: `Create a structured travel itinerary from the following booking data.

Return JSON with keys: title, destination, startDate, endDate, summary, days, bookings, tips.
days must be an array with date, title, morning, afternoon, evening, logistics.
bookings must include type, provider, confirmation, date, time, location, notes when available.

User notes:
${notes || "None"}

Extracted booking text:
${extractedText.slice(0, 12000)}`
      }
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

  if (!token) {
    return null;
  }

  const prompt = `You are a travel planner. Create a concise itinerary from the booking text.
Return ONLY valid JSON with keys: title, destination, startDate, endDate, summary, days, bookings, tips.
days must be an array with date, title, morning, afternoon, evening, logistics.
bookings must include type, provider, confirmation, date, time, location, notes when available.

User notes:
${notes || "None"}

Extracted booking text:
${extractedText.slice(0, 8000)}
`;

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
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
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const rawText = data?.[0]?.generated_text || data?.generated_text || "";
    const parsed = safeJsonParse(rawText);
    return parsed ? normalizeAiPayload(parsed) : null;
  } catch {
    return null;
  }
}

function safeJsonParse(text) {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function normalizeAiPayload(payload) {
  const parsedBookings = normalizeBookings(payload.bookings);
  const parsedDays = normalizeDays(payload.days);
  const parsedTips = normalizeStringArray(payload.tips);
  return {
    title: payload.title || "AI Travel Itinerary",
    destination: payload.destination || "Upcoming trip",
    startDate: payload.startDate || "",
    endDate: payload.endDate || "",
    summary: payload.summary || "",
    days: parsedDays,
    bookings: parsedBookings,
    tips: parsedTips
  };
}

function normalizeBookings(bookings) {
  if (!bookings) {
    return [];
  }

  if (typeof bookings === "string") {
    const parsed = safeJsonParse(bookings);
    return Array.isArray(parsed) ? parsed : [];
  }

  if (Array.isArray(bookings)) {
    return bookings
      .map((item) => {
        if (typeof item === "string") {
          const parsed = safeJsonParse(item);
          return parsed || null;
        }
        return item;
      })
      .filter(Boolean);
  }

  return [];
}

function normalizeDays(days) {
  if (!days) {
    return [];
  }

  if (typeof days === "string") {
    const parsed = safeJsonParse(days);
    return Array.isArray(parsed) ? parsed : [];
  }

  return Array.isArray(days) ? days : [];
}

function normalizeStringArray(items) {
  if (!items) {
    return [];
  }

  if (typeof items === "string") {
    const parsed = safeJsonParse(items);
    return Array.isArray(parsed) ? parsed : [items];
  }

  return Array.isArray(items) ? items : [];
}
