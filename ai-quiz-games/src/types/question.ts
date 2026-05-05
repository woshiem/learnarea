export type Difficulty = "easy" | "medium" | "hard";

export type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: Difficulty;
  hint: string;
};

export type GeneratedQuestionsResponse = {
  questions: QuizQuestion[];
};

export type GameState = "uploading" | "analyzing" | "playing" | "result";

export type LifelineState = {
  fiftyFifty: boolean; // true = used
  audience: boolean;
  hint: boolean;
};

export type GameResult = "win" | "lose" | null;
