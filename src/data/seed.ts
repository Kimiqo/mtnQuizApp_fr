import type { Team, Group, QuestionBank } from "@/types";





export const INITIAL_QUESTIONS: QuestionBank = {
  round1: [],
  round2: [],
  round3: [],
  round4: [],
  round5: [],
  tiebreaker: []
};

export const ROUND_CONFIG = {
  1: { label: "General Knowledge", short: "R1", color: "#FFCC00", pts: 2 },
  2: { label: "Problem of the Day", short: "R2", color: "#FFCC00", pts: 5 },
  3: { label: "True / False — Directed", short: "R3", color: "#FFCC00", pts: 1 },
  4: { label: "Riddle Round", short: "R4", color: "#FFCC00", pts: 5 },
  5: { label: "Speed Race", short: "R5", color: "#FFCC00", pts: 2 },
  6: { label: "Tie-Breaker", short: "TB", color: "#FFCC00", pts: 1 },
} as const;

export const STEAL_TIMER_SECS = Number(import.meta.env.VITE_STEAL_TIMER_SECS);
export const CLUE_TIMER_SECS = Number(import.meta.env.VITE_CLUE_TIMER_SECS);
export const R2_TIMER_SECS = Number(import.meta.env.VITE_R2_TIMER_SECS);

// ── Sound engine (Web Audio API — no external files needed) ──────────────────
let _audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext {
  if (!_audioCtx) _audioCtx = new AudioContext();
  if (_audioCtx.state === "suspended") _audioCtx.resume();
  return _audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = "sine", vol = 0.15, delay = 0) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  } catch { /* ignore browsers without audio */ }
}

export function playSound(type: "shuffle" | "reveal" | "draw" | "answer" | "timer" | "buzz" | "correct" | "wrong" | "lockout") {
  switch (type) {
    case "draw":
      playTone(440, 0.15, "triangle", 0.12);
      playTone(587, 0.15, "triangle", 0.12, 0.08);
      break;
    case "shuffle":
      playTone(330, 0.08, "square", 0.06);
      break;
    case "reveal":
      playTone(523, 0.12, "sine", 0.15);
      playTone(659, 0.12, "sine", 0.15, 0.1);
      playTone(784, 0.2, "sine", 0.15, 0.2);
      break;
    case "answer":
      playTone(880, 0.1, "sine", 0.12);
      playTone(1047, 0.15, "sine", 0.12, 0.08);
      break;
    case "correct":
      // Cheerful ascending ping when points are awarded
      playTone(659, 0.12, "sine", 0.18);
      playTone(784, 0.12, "sine", 0.18, 0.1);
      playTone(1047, 0.25, "sine", 0.2, 0.2);
      break;
    case "wrong":
      playTone(200, 0.3, "sawtooth", 0.1);
      playTone(180, 0.3, "sawtooth", 0.1, 0.15);
      break;
    case "buzz":
      playTone(880, 0.08, "square", 0.15);
      playTone(1100, 0.12, "square", 0.18, 0.06);
      break;
    case "lockout":
      playTone(300, 0.2, "sawtooth", 0.1);
      playTone(220, 0.3, "sawtooth", 0.12, 0.15);
      break;
    case "timer":
      playTone(440, 0.1, "triangle", 0.1);
      break;
  }
}

export function buildInitialScores() {
  return {};
}

export const INITIAL_BROADCAST = {
  questionText: null,
  questionId: null,
  round: null,
  isShuffling: false,
  buzzedTeamId: null,
  lockedOutTeamIds: [] as string[],
  isStealMode: false,
  isBonusMode: false,

  timerSecs: 0,
  timerTotal: 0,
  timerActive: false,
  timerLabel: "",

  drawPhase: "idle" as const,
  drawRevealedGroups: 0,
  flashFeedback: null,
  useTestData: true,
  isTiebreaker: false,
} as const;
