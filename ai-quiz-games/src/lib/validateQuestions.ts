import type { QuizQuestion } from "@/types/question";

/**
 * Validates that the AI returned a proper array of 15 questions.
 * Returns an error message string if invalid, or null if valid.
 */
export function validateQuestions(questions: unknown): string | null {
  if (!Array.isArray(questions)) {
    return "AI did not return a list of questions.";
  }

  if (questions.length !== 15) {
    return `Expected 15 questions, but received ${questions.length}. The PDF content may be too short.`;
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i] as Partial<QuizQuestion>;
    const num = i + 1;

    if (!q.question || typeof q.question !== "string" || q.question.trim() === "") {
      return `Question ${num} is missing its question text.`;
    }

    if (!Array.isArray(q.options) || q.options.length !== 4) {
      return `Question ${num} must have exactly 4 answer options.`;
    }

    if (!q.correctAnswer || !q.options.includes(q.correctAnswer)) {
      return `Question ${num} has a correctAnswer that doesn't match any option.`;
    }

    if (!q.explanation || typeof q.explanation !== "string") {
      return `Question ${num} is missing an explanation.`;
    }

    if (!q.hint || typeof q.hint !== "string") {
      return `Question ${num} is missing a hint.`;
    }

    if (!["easy", "medium", "hard"].includes(q.difficulty ?? "")) {
      return `Question ${num} has an invalid difficulty level.`;
    }
  }

  return null; // All valid
}
