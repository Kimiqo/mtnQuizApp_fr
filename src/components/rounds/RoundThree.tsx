import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, RotateCcw, BookOpen } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { playSound } from "@/data/seed";
import { useHostShortcuts, HostDrawButton, HostAnswerControls } from "@/components/shared/HostControls";

export default function RoundThree() {
  const {
    questions, markR3Used, activeTeamId, teams, addPoints,
    updateBroadcast, clearBuzzState, advanceToNextTeam, flashTeam
  } = useApp();
  const [currentQ, setCurrentQ] = useState<typeof questions.round3[0] | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const available = questions.round3.filter((q) => !q.isUsed);
  const total = questions.round3.length;
  const remaining = available.length;
  const activeTeam = teams.find((t) => t.id === activeTeamId);

  const accentColor = "#FFCC00";
  const trueColor = "#22C55E"; const falseColor = "#EF4444";
  const isTrue = currentQ?.answer === "TRUE";

  const draw = useCallback(() => {
    if (!available.length) return;
    const q = available[0];
    setCurrentQ(q);
    setShowAnswer(false);
    markR3Used(q.id);
    clearBuzzState();
    playSound("draw");
    updateBroadcast({ questionText: q.text, questionId: q.id, round: 3, isShuffling: false });
  }, [available, markR3Used, updateBroadcast, clearBuzzState]);

  const toggleAnswer = useCallback(() => {
    if (!currentQ) return;
    setShowAnswer((p) => !p);
    playSound("answer");
  }, [currentQ]);

  const handleCorrect = useCallback(() => {
    if (!currentQ || !showAnswer || !activeTeamId) return;
    addPoints(activeTeamId, 1, "r3");
    advanceToNextTeam();
    setCurrentQ(null);
    setShowAnswer(false);
    updateBroadcast({ questionText: null, questionId: null });
  }, [currentQ, showAnswer, activeTeamId, addPoints, advanceToNextTeam, updateBroadcast]);

  const handleIncorrect = useCallback(() => {
    if (!currentQ || !showAnswer || !activeTeamId) return;
    flashTeam(activeTeamId, "wrong");
    advanceToNextTeam();
    setCurrentQ(null);
    setShowAnswer(false);
    updateBroadcast({ questionText: null, questionId: null });
  }, [currentQ, showAnswer, activeTeamId, advanceToNextTeam, updateBroadcast, flashTeam]);

  useHostShortcuts({
    onDraw: draw,
    onToggleAnswer: toggleAnswer,
    onCorrect: handleCorrect,
    onIncorrect: handleIncorrect,
    isDrawDisabled: !!currentQ || remaining === 0,
    isShowAnswerDisabled: !currentQ || showAnswer,
    isCorrectDisabled: !showAnswer,
    isWrongDisabled: !showAnswer,
  });

  const roundLabel = "Round 3 — True / False (Directed)";

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden p-5">
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h2 className="font-black uppercase tracking-widest" style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: accentColor }}>
            {roundLabel}
          </h2>
          <p className="text-xs" style={{ color: "#666", fontFamily: "var(--font-mono)" }}>
            3 statements per team · 1 pt · HOST VIEW — answers visible
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTeam && (
            <div className="rounded-sm border px-3 py-1.5" style={{ borderColor: `${accentColor}60`, background: "#0A0A0A" }}>
              <span className="font-black uppercase" style={{ fontFamily: "var(--font-display)", fontSize: "14px", color: accentColor }}>→ {activeTeam.name}</span>
            </div>
          )}
          <div className="rounded-sm border px-3 py-1.5 text-center" style={{ borderColor: "#222", background: "#0A0A0A" }}>
            <p className="text-[10px] tracking-widest uppercase" style={{ color: "#555", fontFamily: "var(--font-mono)" }}>Left</p>
            <p className="font-black tabular-nums" style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: accentColor }}>
              {remaining}<span style={{ color: "#444" }}>/{total}</span>
            </p>
          </div>
          <button onClick={() => { setCurrentQ(null); setShowAnswer(false); clearBuzzState(); }}
            className="flex h-9 w-9 items-center justify-center rounded-sm border" style={{ borderColor: "#222", color: "#555" }}>
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        <div className="flex flex-1 flex-col gap-3 min-h-0">
          <AnimatePresence mode="wait">
            {!currentQ ? (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-1 items-center justify-center rounded-sm border"
                style={{ borderColor: "#1a1a1a", background: "#0A0A0A" }}
              >
                <p className="font-black uppercase" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px,4vw,44px)", color: "#222" }}>
                  {remaining === 0 ? "All Drawn" : "Awaiting Draw"}
                </p>
              </motion.div>
            ) : (
              <motion.div key={`q-${currentQ.id}`} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-1 flex-col overflow-hidden rounded-sm border"
                style={{ borderColor: "#333", background: "#0A0A0A", boxShadow: showAnswer ? `0 0 60px 8px ${isTrue ? trueColor : falseColor}18` : "none" }}
              >
                <div className="flex h-1.5 w-full shrink-0">
                  <motion.div className="flex-1" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5 }}
                    style={{ background: trueColor, transformOrigin: "left" }}
                  />
                  <motion.div className="flex-1" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5 }}
                    style={{ background: falseColor, transformOrigin: "right" }}
                  />
                </div>

                <div className="flex flex-1 items-center px-8 py-6">
                  <p className="font-bold leading-snug" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,4vw,50px)", color: "#fff" }}>
                    {currentQ.text}
                  </p>
                </div>

                {/* T/F visual answer */}
                <div className="flex shrink-0 gap-4 border-t px-8 py-4" style={{ borderColor: "#1a1a1a" }}>
                  {[{ label: "TRUE", icon: <CheckCircle2 size={26} />, correct: isTrue, col: trueColor },
                    { label: "FALSE", icon: <XCircle size={26} />, correct: !isTrue, col: falseColor }].map(({ label, icon, correct, col }) => (
                    <div key={label} className="flex flex-1 items-center justify-center gap-3 rounded-sm border py-4 transition-all"
                      style={{
                        borderColor: showAnswer && correct ? col : "#1e1e1e",
                        background: showAnswer && correct ? (col === trueColor ? "#0a1f0f" : "#1f0a0a") : "#080808",
                        boxShadow: showAnswer && correct ? `0 0 40px 4px ${col}20` : "none",
                      }}
                    >
                      <span style={{ color: showAnswer && correct ? col : "#2a2a2a" }}>{icon}</span>
                      <span className="font-black uppercase tracking-widest" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(20px,3vw,34px)", color: showAnswer && correct ? col : "#2a2a2a" }}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* HOST: Answer + Explanation */}
                <HostAnswerControls
                  showAnswer={showAnswer}
                  onToggleAnswer={toggleAnswer}
                  onCorrect={activeTeamId ? handleCorrect : undefined}
                  onIncorrect={activeTeamId ? handleIncorrect : undefined}
                  showGrading={true}
                  points={1}
                />

                {/* Explanation (host only) */}
                <AnimatePresence>
                  {showAnswer && currentQ.explanation && (
                    <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: "auto", marginTop: 10 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }} className="overflow-hidden px-6 pb-4"
                    >
                      <div className="flex items-start gap-2 rounded-sm border p-3"
                        style={{ borderColor: isTrue ? "#22C55E30" : "#EF444430", background: isTrue ? "#0a1f0f" : "#1f0a0a" }}
                      >
                        <BookOpen size={12} style={{ color: isTrue ? "#22C55E80" : "#EF444480", flexShrink: 0, marginTop: "2px" }} />
                        <p className="text-sm leading-relaxed" style={{ color: isTrue ? "#86EFAC" : "#FCA5A5", fontFamily: "var(--font-body)" }}>
                          {currentQ.explanation}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="shrink-0 flex flex-col items-center gap-2">
            <HostDrawButton
              onDraw={draw}
              isShuffling={false}
              remaining={remaining}
              customLabel="Draw Statement"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
