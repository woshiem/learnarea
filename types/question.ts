export type Difficulty = "easy" | "medium" | "hard";

export type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: Difficulty;
};

export type GeneratedQuestionsResponse = {
  questions: QuizQuestion[];
};
