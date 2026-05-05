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
          },
          question: {
            type: "string",
          },
          options: {
            type: "array",
            minItems: 4,
            maxItems: 4,
            items: {
              type: "string",
            },
          },
          correctAnswer: {
            type: "string",
          },
          explanation: {
            type: "string",
          },
          difficulty: {
            type: "string",
            enum: ["easy", "medium", "hard"],
          },
        },
        required: [
          "id",
          "question",
          "options",
          "correctAnswer",
          "explanation",
          "difficulty",
        ],
      },
    },
  },
  required: ["questions"],
};
