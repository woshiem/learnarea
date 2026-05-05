/**
 * JSON Schema for structured AI output.
 * Used with OpenAI Responses API to enforce the question format.
 */
export const questionJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    questions: {
      type: "array",
      minItems: 15,
      maxItems: 15,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: {
            type: "number",
            description: "Question number 1–15",
          },
          question: {
            type: "string",
            description: "The quiz question text",
          },
          options: {
            type: "array",
            minItems: 4,
            maxItems: 4,
            items: { type: "string" },
            description: "Exactly 4 answer options",
          },
          correctAnswer: {
            type: "string",
            description: "Must exactly match one of the options strings",
          },
          explanation: {
            type: "string",
            description: "Short explanation of why the answer is correct",
          },
          difficulty: {
            type: "string",
            enum: ["easy", "medium", "hard"],
            description: "easy for Q1-5, medium for Q6-10, hard for Q11-15",
          },
          hint: {
            type: "string",
            description:
              "A helpful hint that guides toward the answer without revealing it",
          },
        },
        required: [
          "id",
          "question",
          "options",
          "correctAnswer",
          "explanation",
          "difficulty",
          "hint",
        ],
      },
    },
  },
  required: ["questions"],
};
