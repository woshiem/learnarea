import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Buffer } from "buffer";
import { validateQuestions } from "@/lib/validateQuestions";

// ── Prompt ─────────────────────────────────────────────────────────────────
const PROMPT = `
You are an expert educational quiz generator for a "Who Wants to Be a Millionaire?" style game.

Analyze the uploaded PDF and generate EXACTLY 15 multiple-choice questions based solely on its content.

Rules:
1. Use ONLY information from the PDF.
2. Generate EXACTLY 15 questions — no more, no less.
3. Each question must have EXACTLY 4 answer options (strings).
4. Only ONE option must be correct.
5. Difficulty MUST increase progressively:
   - Questions 1–5: easy (basic recall)
   - Questions 6–10: medium (comprehension, inference)
   - Questions 11–15: hard (analysis, nuanced details)
6. Each question must include a short explanation (why the correct answer is right).
7. Each question must include a helpful hint that guides toward the answer WITHOUT revealing it.
8. The correctAnswer value must be the EXACT text of one of the 4 options.

Return a JSON object with this exact structure:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "difficulty": "easy",
      "explanation": "Short explanation based on PDF content.",
      "hint": "Helpful hint without giving away the answer."
    }
  ]
}

Return ONLY the raw JSON — no markdown, no code fences, no extra text.
`;

// ── API Key guard ──────────────────────────────────────────────────────────
function getGeminiClient(): GoogleGenerativeAI | null {
  const key = process.env.GOOGLE_AI_API_KEY ?? "";
  if (!key || key.length < 10) return null;
  return new GoogleGenerativeAI(key);
}

// ── Route ──────────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const pdfFile = formData.get("pdf");

    // ── Input validation ────────────────────────────────────────────────
    if (!(pdfFile instanceof File)) {
      return NextResponse.json(
        { error: "Please upload a valid PDF file." },
        { status: 400 }
      );
    }
    if (pdfFile.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are accepted. Please upload a .pdf file." },
        { status: 400 }
      );
    }
    if (pdfFile.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 20MB limit." },
        { status: 400 }
      );
    }
    if (pdfFile.size < 1024) {
      return NextResponse.json(
        { error: "The PDF appears to be empty or too small to generate questions from." },
        { status: 400 }
      );
    }

    // ── API key check ───────────────────────────────────────────────────
    const genAI = getGeminiClient();
    if (!genAI) {
      return NextResponse.json(
        {
          error:
            "Google AI API key is not configured. Please add GOOGLE_AI_API_KEY to .env.local and restart the server.",
        },
        { status: 503 }
      );
    }

    // ── Convert PDF to base64 ───────────────────────────────────────────
    const arrayBuffer = await pdfFile.arrayBuffer();
    const base64Pdf = Buffer.from(arrayBuffer).toString("base64");

    // ── Call Gemini ─────────────────────────────────────────────────────
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        // Ask Gemini to return pure JSON
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Pdf,
          mimeType: "application/pdf",
        },
      },
      { text: PROMPT },
    ]);

    const rawText = result.response.text();

    if (!rawText || rawText.trim() === "") {
      return NextResponse.json(
        { error: "AI did not return any content. Please try again." },
        { status: 500 }
      );
    }

    // ── Parse JSON ──────────────────────────────────────────────────────
    let parsed: { questions: unknown[] };
    try {
      // Strip markdown fences if present (defensive)
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse Gemini response:", rawText.slice(0, 500));
      return NextResponse.json(
        { error: "AI returned an unexpected format. Please try again." },
        { status: 500 }
      );
    }

    // ── Validate ────────────────────────────────────────────────────────
    const validationError = validateQuestions(parsed.questions);
    if (validationError) {
      return NextResponse.json(
        {
          error: `The AI generated invalid questions: ${validationError}. Try a different PDF with more content.`,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ questions: parsed.questions });
  } catch (error) {
    console.error("Question generation error:", error);

    const msg = error instanceof Error ? error.message : "";

    if (msg.includes("quota") || msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
      return NextResponse.json(
        { error: "Free API quota exceeded. Please wait a minute and try again." },
        { status: 429 }
      );
    }
    if (msg.includes("SAFETY") || msg.includes("blocked")) {
      return NextResponse.json(
        { error: "The PDF content was blocked by safety filters. Please try a different document." },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate questions. Please check your PDF and try again." },
      { status: 500 }
    );
  }
}
