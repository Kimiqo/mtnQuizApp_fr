
export type RoundType = 1 | 2 | 3 | 4 | 5 | 6;
export type RoundKey = "r1" | "r2" | "r3" | "r4" | "r5";
export type UserRole = "host" | "team" | "audience";

export interface Team {
  id: string;
  name: string;
  groupId?: string | null;
  seat?: string;
  originalGroupId?: string | null;
  password: string;
}

export interface Group {
  id: string;
  name: string;
  teamIds: string[];
}

// MySQL: `questions` table — round 1
export interface R1Question {
  id: number;
  text: string;
  answer: string;
  explanation?: string;
  isUsed: boolean;
  difficulty?: "easy" | "medium" | "hard";
}

// MySQL: `problems` table — round 2
export interface R2Question {
  id: number;
  scenario: string;
  question: string;
  answer: string;
  explanation?: string;
}

// MySQL: `tf_questions` table — rounds 3 & 4
export interface TFQuestion {
  id: number;
  text: string;
  answer: "TRUE" | "FALSE";
  correction?: string;
  explanation?: string;
  isUsed: boolean;
  difficulty?: "easy" | "medium" | "hard";
}

// MySQL: `riddles` table — round 5
export interface Riddle {
  id: number;
  clue1: string;
  clue2: string;
  clue3: string;
  answer: string;
  explanation?: string;
  isUsed: boolean;
}

export interface QuestionBank {
  round1: R1Question[];
  round2: R2Question[];
  round3: TFQuestion[];
  round4: R1Question[];
  round5: Riddle[];
  tiebreaker: R1Question[];
}

// MySQL: `scores` table
export interface TeamScore {
  total: number;
  byRound: Record<RoundKey | "tb", number>;
}

// Shared broadcast state — in production, replace with WebSocket/Socket.io
export interface BroadcastState {
  // What's on screen right now
  questionText: string | null;
  questionId: number | null;
  round: RoundType | null;
  isShuffling: boolean;

  // Buzzer system
  buzzedTeamId: string | null;
  lockedOutTeamIds: string[];
  isStealMode: boolean;
  isBonusMode: boolean;


  // Shared timer (R2 discussion, R5 clue timer, steal timer)
  timerSecs: number;
  timerTotal: number;
  timerActive: boolean;
  timerLabel: string; // "DISCUSSION" | "CLUE" | "STEAL" | ""
  
  // Tiebreaker state
  isTiebreaker: boolean;

  // Group Draw Ceremony
  drawPhase: "idle" | "awaiting" | "shuffling" | "revealing" | "done" | "revealing_finals" | "podium_reveal";
  drawRevealedGroups: number;

  // Dataset Toggle
  useTestData: boolean;

  // Visual Feedback
  flashFeedback: { teamId: string; type: "correct" | "wrong" } | null;
}
