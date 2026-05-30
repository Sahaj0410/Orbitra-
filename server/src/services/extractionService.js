import fs from "fs/promises";
import OpenAI from "openai";
import pdfParse from "pdf-parse";
import Tesseract from "tesseract.js";

export async function extractTextFromFile(file) {
  if (file.mimetype === "application/pdf") {
    const buffer = await fs.readFile(file.path);
    const parsed = await pdfParse(buffer);
    return normalizeText(parsed.text);
  }

  if (file.mimetype.startsWith("image/") && process.env.OPENAI_API_KEY) {
    return extractTextFromImageWithOpenAI(file);
  }

  if (file.mimetype.startsWith("image/")) {
    return extractTextFromImageWithTesseract(file);
  }

  return [
    `Image uploaded: ${file.originalname}.`,
    "OCR can be connected here with Google Vision, AWS Textract, or Tesseract for production extraction.",
    "Use any visible booking details from the filename and user notes."
  ].join(" ");
}

export function normalizeText(text) {
  return text.replace(/\s+/g, " ").trim();
}

async function extractTextFromImageWithOpenAI(file) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const buffer = await fs.readFile(file.path);
  const base64 = buffer.toString("base64");

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Extract travel booking information from images. Return concise plain text with dates, times, places, providers, passenger names, confirmation numbers, and prices if visible."
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Extract booking details from this uploaded image: ${file.originalname}`
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${file.mimetype};base64,${base64}`
            }
          }
        ]
      }
    ],
    temperature: 0
  });

  return normalizeText(completion.choices[0]?.message?.content || "");
}

async function extractTextFromImageWithTesseract(file) {
  const buffer = await fs.readFile(file.path);
  const result = await Tesseract.recognize(buffer, "eng");
  return normalizeText(result.data?.text || "");
}
