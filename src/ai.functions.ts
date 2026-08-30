import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.5-flash";

const DISCLAIMER_EN =
  "This is general legal information, not legal advice. For your specific situation, consult a qualified lawyer.";
const DISCLAIMER_BN =
  "এটি সাধারণ আইনি তথ্য, আইনি পরামর্শ নয়। আপনার নির্দিষ্ট পরিস্থিতির জন্য একজন আইনজীবীর পরামর্শ নিন।";

async function callGateway(messages: Array<{ role: string; content: string }>) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured yet.");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: MODEL, messages }),
  });

  if (res.status === 429) throw new Error("Too many requests right now. Please try again in a moment.");
  if (res.status === 402) throw new Error("AI credits are exhausted. Please top up to continue.");
  if (!res.ok) throw new Error(`AI request failed (${res.status}).`);

  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return json.choices?.[0]?.message?.content?.trim() ?? "No answer was returned.";
}

const chatSchema = z.object({
  language: z.enum(["en", "bn"]).default("en"),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(6000) }))
    .max(24)
    .default([]),
  question: z.string().min(2).max(4000),
});

export const askLegalQuestion = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => chatSchema.parse(d))
  .handler(async ({ data }) => {
    const bn = data.language === "bn";
    const system = [
      "You are LawSuite, a legal information assistant for people in Bangladesh.",
      "Explain in plain, warm language a non-lawyer can follow. Never use jargon without defining it.",
      "Structure answers as: a short direct answer, then 'What the law says', then 'What you can do next' as numbered steps.",
      "Cite the relevant Bangladeshi act by name and year when you are confident of it. Say plainly when you are unsure.",
      "Never claim to be a lawyer and never guarantee outcomes.",
      bn
        ? `Answer entirely in Bengali. End with this exact line: ${DISCLAIMER_BN}`
        : `Answer in English. End with this exact line: ${DISCLAIMER_EN}`,
    ].join(" ");

    const messages = [
      { role: "system", content: system },
      ...data.history,
      { role: "user", content: data.question },
    ];
    return { answer: await callGateway(messages) };
  });

const summarySchema = z.object({
  language: z.enum(["en", "bn"]).default("en"),
  text: z.string().min(40).max(30000),
  filename: z.string().max(200).optional(),
});

export const summariseDocument = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => summarySchema.parse(d))
  .handler(async ({ data }) => {
    const bn = data.language === "bn";
    const system = [
      "You summarise legal documents for ordinary people in Bangladesh.",
      "Return markdown with these sections: '## In one line', '## What this document is', '## Key points', '## Your obligations', '## Dates and deadlines', '## Watch out for'.",
      "Use short bullets. Quote exact figures, dates and names from the document. Do not invent anything not present.",
      bn ? `Write in Bengali. End with: ${DISCLAIMER_BN}` : `Write in English. End with: ${DISCLAIMER_EN}`,
    ].join(" ");

    return {
      summary: await callGateway([
        { role: "system", content: system },
        { role: "user", content: `Document${data.filename ? ` (${data.filename})` : ""}:\n\n${data.text}` },
      ]),
    };
  });
