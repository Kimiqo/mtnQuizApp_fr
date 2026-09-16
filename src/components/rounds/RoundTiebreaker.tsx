import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useHostShortcuts, HostDrawButton, HostAnswerControls } from "@/components/shared/HostControls";
import { playSound } from "@/data/seed";

export default function RoundTiebreaker() {
  const { questions, updateBroadcast, activeTeamId, clearBuzzState, broadcast, awardBuzzedTeam, passQuestion } = useApp();
  const [currentQIndex, setCurrentQIndex] = useState(-1);
  const [showAnswer, setShowAnswer] = useState(false);

  const available = questions.tiebreaker || [];
  const total = available.length;
  
  // Tiebreakers are just sequentially shown
  const currentQ = currentQIndex >= 0 && currentQIndex < total ? available[currentQIndex] : null;
  const remaining = total - (currentQIndex + 1);

  const draw = useCallback(() => {
    if (currentQIndex + 1 >= total) return;
    const nextIdx = currentQIndex + 1;
    const sel = available[nextIdx];
    setShowAnswer(false);
    setCurrentQIndex(nextIdx);
    clearBuzzState();
    playSound("draw");
    // Broadcast round 6 to indicate tiebreaker
    updateBroadcast({ questionText: sel.text, questionId: sel.id, isShuffling: false, round: 6 as any, isTiebreaker: true });
  }, [available, currentQIndex, total, clearBuzzState, updateBroadcast]);

  const toggleAnswer = useCallback(() => {
    if (!currentQ) return;
    setShowAnswer((p) => !p);
    playSound("answer");
  }, [currentQ]);

  const handleCorrect = useCallback(() => {
    if (!currentQ || !showAnswer || !broadcast.buzzedTeamId) return;
    awardBuzzedTeam(1);
    setShowAnswer(false);
  }, [currentQ, showAnswer, broadcast.buzzedTeamId, awardBuzzedTeam]);

  const handleIncorrect = useCallback(() => {
    if (!currentQ || !showAnswer || !broadcast.buzzedTeamId) return;
    passQuestion();
    setShowAnswer(false);
  }, [currentQ, showAnswer, broadcast.buzzedTeamId, passQuestion]);

  // Keyboard shortcuts
  useHostShortcuts({
    onDraw: draw,
    onToggleAnswer: toggleAnswer,
    onCorrect: handleCorrect,
    onIncorrect: handleIncorrect,
    isDrawDisabled: currentQIndex + 1 >= total,
    isShowAnswerDisabled: !currentQ || showAnswer,
    isCorrectDisabled: !showAnswer || !broadcast.buzzedTeamId,
    isWrongDisabled: !showAnswer || !broadcast.buzzedTeamId,
  });

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-end justify-between shrink-0">
        <div>
          <h2 className="font-black uppercase tracking-widest" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 3vw, 36px)", color: "#fff", lineHeight: 1 }}>
            Tie-Breaker
          </h2>
          <p className="text-xs" style={{ color: "#666", fontFamily: "var(--font-mono)" }}>HOST VIEW — answers visible</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-sm border px-3 py-1.5 text-center" style={{ borderColor: "#222", background: "#0A0A0A" }}>
            <p className="text-[10px] tracking-widest uppercase" style={{ color: "#555", fontFamily: "var(--font-mono)" }}>Left</p>
            <p className="font-black tabular-nums" style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "#FFCC00" }}>
              {remaining}<span style={{ color: "#444" }}>/{total}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Question display */}
      <div className="flex flex-1 flex-col gap-4 min-h-0">
        <AnimatePresence mode="wait">
          {!currentQ && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-1 items-center justify-center rounded-sm border"
              style={{ borderColor: "#1a1a1a", background: "#0A0A0A" }}
            >
              <p className="font-black uppercase" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px,4vw,44px)", color: remaining === 0 ? "#333" : "#222" }}>
                {remaining === 0 ? "Bank Exhausted" : "Ready"}
              </p>
            </motion.div>
          )}

          {currentQ && (
            <motion.div key={`q-${currentQ.id}`} initial={{ opacity: 0, scale: 0.97, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="glow-yellow flex flex-1 flex-col overflow-hidden rounded-sm border"
              style={{ borderColor: "#FFCC0050", background: "#0A0A0A" }}
            >
              <motion.div className="h-1 shrink-0" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5 }}
                style={{ background: "#FFCC00", transformOrigin: "left" }}
              />
              <div className="flex items-center gap-3 border-b px-6 py-2.5" style={{ borderColor: "#1a1a1a" }}>
                <span className="text-[10px] uppercase tracking-widest" style={{ color: "#555", fontFamily: "var(--font-mono)" }}>TB Q{String(currentQIndex + 1).padStart(2, "0")}</span>
              </div>

              {/* Question text */}
              <div className="flex flex-1 overflow-y-auto min-h-0 px-6 py-4">
                <div className="m-auto w-full">
                  <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="font-bold leading-snug"
                    style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px,4vw,48px)", color: "#fff" }}
                  >
                    {currentQ.text}
                  </motion.p>
                </div>
              </div>

              <HostAnswerControls
                showAnswer={showAnswer}
                onToggleAnswer={toggleAnswer}
                onCorrect={handleCorrect}
                onIncorrect={handleIncorrect}
                showGrading={true}
                points={1}
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
          <HostDrawButton
            onDraw={draw}
            isShuffling={false}
            remaining={remaining}
          />
        </div>
      </div>
    </div>
  );
}
