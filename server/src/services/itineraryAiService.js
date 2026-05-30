import OpenAI from "openai";

const fallbackItinerary = {
  title: "AI Travel Plan",
  destination: "Upcoming trip",
  startDate: "",
  endDate: "",
  summary:
    "Your uploaded bookings were processed into a practical trip plan. Add an AI API key to generate richer personalized recommendations.",
  days: [
    {
      date: "Day 1",
      title: "Arrival and check-in",
      morning: "Review flight or travel arrival details and keep booking confirmations handy.",
      afternoon: "Check in to the hotel and confirm important local transport options.",
      evening: "Take a relaxed walk near the stay area and prepare essentials for the next day.",
      logistics: "Keep passport/ID, tickets, hotel voucher, and payment method accessible."
    },
    {
      date: "Day 2",
      title: "Explore the destination",
      morning: "Start with the highest-priority attraction or business commitment.",
      afternoon: "Plan lunch close to the next activity to reduce travel time.",
      evening: "Reserve time for dinner, shopping, or a flexible local experience.",
      logistics: "Buffer 30-45 minutes between bookings and transfers."
    }
  ],
  bookings: [],
  tips: [
    "Download offline maps before departure.",
    "Keep digital and offline copies of bookings.",
    "Check baggage rules, check-in times, and hotel cancellation policies."
  ]
};

export async function generateItinerary({ extractedText, notes }) {
  if (!process.env.OPENAI_API_KEY) {
    const hfResult = await generateWithHuggingFace({ extractedText, notes });
    return hfResult || enrichFallback(notes);
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
    return enrichFallback(notes);
  }

  return normalizeAiPayload(JSON.parse(content));
}

async function generateWithHuggingFace({ extractedText, notes }) {
  const model = process.env.HF_MODEL || "mistralai/Mistral-7B-Instruct-v0.2";
  const token = process.env.HF_API_TOKEN || "";

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

function enrichFallback(notes) {
  return {
    ...fallbackItinerary,
    summary: notes
      ? `${fallbackItinerary.summary} Notes considered: ${notes}`
      : fallbackItinerary.summary
  };
}

function normalizeAiPayload(payload) {
  return {
    title: payload.title || "AI Travel Itinerary",
    destination: payload.destination || "Upcoming trip",
    startDate: payload.startDate || "",
    endDate: payload.endDate || "",
    summary: payload.summary || "",
    days: Array.isArray(payload.days) ? payload.days : [],
    bookings: Array.isArray(payload.bookings) ? payload.bookings : [],
    tips: Array.isArray(payload.tips) ? payload.tips : []
  };
}
