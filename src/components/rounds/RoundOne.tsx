import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, BookOpen } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useHostShortcuts, HostDrawButton, HostAnswerControls } from "@/components/shared/HostControls";
import { playSound } from "@/data/seed";

const SHUFFLE_MS = 3500;
const SHUFFLE_INTERVAL = 120;
const SHUFFLE_PHRASES = [
  "Scanning question bank...", "Randomizing selection...", "Calculating probability...",
  "Shuffling the deck...", "Drawing next question...", "Please stand by...",
];

export default function RoundOne() {
  const { questions, markR1Used, resetQuestions, activeTeamId, teams, addPoints, updateBroadcast, clearBuzzState, advanceToNextTeam } = useApp();
  const [currentQ, setCurrentQ] = useState<typeof questions.round1[0] | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleText, setShuffleText] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const availableTotal = questions.round1.filter((q) => !q.isUsed);
  const available = availableTotal.filter((q) => q.difficulty === difficulty);
  const total = questions.round1.filter((q) => q.difficulty === difficulty).length;
  const remaining = available.length;
  const activeTeam = teams.find((t) => t.id === activeTeamId);

  const draw = useCallback(() => {
    if (!available.length || isShuffling) return;
    const sel = available[0];
    setShowAnswer(false);
    setCurrentQ(null);
    setIsShuffling(true);
    clearBuzzState();
    playSound("draw");
    updateBroadcast({ questionText: null, questionId: null, isShuffling: true, round: 1 });

    let idx = 0;
    intervalRef.current = setInterval(() => {
      idx = (idx + 1) % SHUFFLE_PHRASES.length;
      setShuffleText(SHUFFLE_PHRASES[idx]);
    }, SHUFFLE_INTERVAL);

    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsShuffling(false);
      setCurrentQ(sel);
      markR1Used(sel.id);
      playSound("reveal");
      updateBroadcast({ questionText: sel.text, questionId: sel.id, isShuffling: false });
    }, SHUFFLE_MS);
  }, [available, isShuffling, markR1Used, updateBroadcast, clearBuzzState]);

  const toggleAnswer = useCallback(() => {
    if (!currentQ || isShuffling) return;
    setShowAnswer((p) => !p);
    playSound("answer");
  }, [currentQ, isShuffling]);

  const handleCorrect = useCallback(() => {
    if (!currentQ || !showAnswer || !activeTeamId) return;
    addPoints(activeTeamId, 2, "r1");
    advanceToNextTeam();
    setCurrentQ(null);
    setShowAnswer(false);
    updateBroadcast({ questionText: null, questionId: null });
  }, [currentQ, showAnswer, activeTeamId, addPoints, advanceToNextTeam, updateBroadcast]);

  const handleIncorrect = useCallback(() => {
    if (!currentQ || !showAnswer || !activeTeamId) return;
    advanceToNextTeam();
    setCurrentQ(null);
    setShowAnswer(false);
    updateBroadcast({ questionText: null, questionId: null });
  }, [currentQ, showAnswer, activeTeamId, advanceToNextTeam, updateBroadcast]);

  useHostShortcuts({
    onDraw: draw,
    onToggleAnswer: toggleAnswer,
    onCorrect: handleCorrect,
    onIncorrect: handleIncorrect,
    isDrawDisabled: !!currentQ || isShuffling || remaining === 0,
    isShowAnswerDisabled: !currentQ || showAnswer,
    isCorrectDisabled: !showAnswer,
    isWrongDisabled: !showAnswer,
  });

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current)  clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden p-5">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between">
        <div>
          <h2 className="font-black uppercase tracking-widest" style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "#FFCC00" }}>
            Round 1 — General Knowledge
          </h2>
          <p className="text-xs" style={{ color: "#666", fontFamily: "var(--font-mono)" }}>2 directed questions per team · 2 pts each · HOST VIEW — answers visible</p>
        </div>
        <div className="flex items-center gap-3">
          {activeTeam && (
            <div className="rounded-sm border px-3 py-1.5" style={{ borderColor: "#FFCC0060", background: "#0A0A0A" }}>
              <span className="font-black uppercase" style={{ fontFamily: "var(--font-display)", fontSize: "14px", color: "#FFCC00" }}>→ {activeTeam.name}</span>
            </div>
          )}
          <div className="rounded-sm border px-3 py-1.5 text-center" style={{ borderColor: "#222", background: "#0A0A0A" }}>
            <p className="text-[10px] tracking-widest uppercase" style={{ color: "#555", fontFamily: "var(--font-mono)" }}>Left</p>
            <p className="font-black tabular-nums" style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "#FFCC00" }}>
              {remaining}<span style={{ color: "#444" }}>/{total}</span>
            </p>
          </div>
          <button onClick={() => { resetQuestions(); setCurrentQ(null); setShowAnswer(false); }}
            className="flex h-9 w-9 items-center justify-center rounded-sm border transition-colors hover:border-yellow-400/30"
            style={{ borderColor: "#222", color: "#555" }}
          ><RotateCcw size={14} /></button>
        </div>
      </div>

      {/* Question display */}
      <div className="flex flex-1 flex-col gap-4 min-h-0">
        <AnimatePresence mode="wait">
          {!currentQ && !isShuffling && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-1 items-center justify-center rounded-sm border"
              style={{ borderColor: "#1a1a1a", background: "#0A0A0A" }}
            >
              <p className="font-black uppercase" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px,4vw,44px)", color: remaining === 0 ? "#333" : "#222" }}>
                {remaining === 0 ? "Bank Exhausted" : "Awaiting Draw"}
              </p>
            </motion.div>
          )}

          {isShuffling && (
            <motion.div key="shuffle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="scanline relative flex flex-1 items-center justify-center overflow-hidden rounded-sm border"
              style={{ borderColor: "#FFCC0040", background: "#0A0A0A" }}
            >
              <div className="w-full px-10 text-center">
                <p className="slot-flicker font-black uppercase" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,4vw,50px)", color: "#FFCC00" }}>
                  {shuffleText}
                </p>
                <div className="mx-auto mt-6 h-0.5 overflow-hidden rounded-full" style={{ width: "50%", background: "#1e1e1e" }}>
                  <motion.div className="h-full rounded-full" style={{ background: "#FFCC00" }}
                    initial={{ width: "0%" }} animate={{ width: "100%" }}
                    transition={{ duration: SHUFFLE_MS / 1000, ease: "linear" }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentQ && !isShuffling && (
            <motion.div key={`q-${currentQ.id}`} initial={{ opacity: 0, scale: 0.97, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="glow-yellow flex flex-1 flex-col overflow-hidden rounded-sm border"
              style={{ borderColor: "#FFCC0050", background: "#0A0A0A" }}
            >
              <motion.div className="h-1 shrink-0" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5 }}
                style={{ background: "#FFCC00", transformOrigin: "left" }}
              />
              <div className="flex items-center gap-3 border-b px-6 py-2.5" style={{ borderColor: "#1a1a1a" }}>
                <span className="text-[10px] uppercase tracking-widest" style={{ color: "#555", fontFamily: "var(--font-mono)" }}>Q{String(currentQ.id).padStart(2, "0")}</span>
                {activeTeam && (
                  <><span className="h-3 w-px" style={{ background: "#333" }} />
                    <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#FFCC00", fontFamily: "var(--font-mono)" }}>→ {activeTeam.name}</span>
                  </>
                )}
              </div>

              {/* Question text */}
              <div className="flex flex-1 items-center px-6 py-4">
                <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="font-bold leading-snug"
                  style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px,4vw,48px)", color: "#fff" }}
                >
                  {currentQ.text}
                </motion.p>
              </div>

              <HostAnswerControls
                showAnswer={showAnswer}
                onToggleAnswer={toggleAnswer}
                onCorrect={activeTeamId ? handleCorrect : undefined}
                onIncorrect={activeTeamId ? handleIncorrect : undefined}
                showGrading={true}
                points={2}
              />
              
              <AnimatePresence>
                {showAnswer && (
                  <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }} className="overflow-hidden px-6 pb-4"
                  >
                    <div className="rounded-sm border p-4" style={{ borderColor: "#FFCC0040", background: "#0f0e00" }}>
                      <p className="font-bold" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(18px,3vw,28px)", color: "#FFCC00" }}>
                        {currentQ.answer}
                      </p>
                      {currentQ.explanation && (
                        <div className="mt-3 flex items-start gap-2 border-t pt-3" style={{ borderColor: "#FFCC0020" }}>
                          <BookOpen size={13} style={{ color: "#FFCC0080", flexShrink: 0, marginTop: "2px" }} />
                          <p className="text-sm leading-relaxed" style={{ color: "#FFCC0099", fontFamily: "var(--font-body)" }}>
                            {currentQ.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="shrink-0 flex flex-col items-center gap-2">
          {!currentQ && !isShuffling && (
            <div className="flex gap-1 p-1 mb-2 rounded-sm border" style={{ background: "#0A0A0A", borderColor: "#222" }}>
              {(["easy", "medium", "hard"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className="px-5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-sm transition-colors"
                  style={{
                    background: difficulty === d ? "#FFCC00" : "transparent",
                    color: difficulty === d ? "#000" : "#666",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
          <HostDrawButton
            onDraw={draw}
            isShuffling={isShuffling}
            remaining={remaining}
          />
        </div>
      </div>
    </div>
  );
}
