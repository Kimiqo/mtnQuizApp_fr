import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, RotateCcw, BookOpen, SkipForward } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useHostShortcuts, HostAnswerControls } from "@/components/shared/HostControls";
import { playSound, CLUE_TIMER_SECS } from "@/data/seed";

type ClueLevel = 0 | 1 | 2 | 3;
const CLUE_PTS:    Record<1|2|3, number> = { 1: 5, 2: 4, 3: 3 };
const CLUE_COLORS: Record<1|2|3, string> = { 1: "#FFCC00", 2: "#FFCC00", 3: "#FFCC00" };

function CountdownRing({ seconds, total }: { seconds: number; total: number }) {
  const r = 32; const circ = 2 * Math.PI * r;
  const pct = seconds / total;
  const color = seconds > 15 ? "#FFCC00" : seconds > 8 ? "#FFCC00" : "#EF4444";
  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r={r} fill="none" stroke="#1e1e1e" strokeWidth="5" />
      <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
        transform="rotate(-90 40 40)" style={{ transition: "stroke-dashoffset 1s linear, stroke 0.4s" }}
      />
      <text x="40" y="42" textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="22" fontWeight="900" fontFamily="var(--font-display)">{seconds}</text>
    </svg>
  );
}

export default function RoundFive() {
  const { questions, markR5Used, updateBroadcast, clearBuzzState, startTimer, broadcast, awardBuzzedTeam, passQuestion, teams } = useApp();
  const [currentRiddle, setCurrentRiddle] = useState<typeof questions.round5[0] | null>(null);
  const [clueLevel, setClueLevel] = useState<ClueLevel>(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [localSecs, setLocalSecs] = useState(CLUE_TIMER_SECS);
  const [localRunning, setLocalRunning] = useState(false);

  const available = questions.round5.filter((q) => !q.isUsed);
  const total = questions.round5.length;
  const remaining = available.length;

  // Keep local countdown for display
  useEffect(() => {
    if (!localRunning) return;
    const id = setInterval(() => {
      setLocalSecs((s) => { if (s <= 1) { setLocalRunning(false); return 0; } return s - 1; });
    }, 1000);
    return () => clearInterval(id);
  }, [localRunning]);

  const startClueTimer = useCallback(() => {
    setLocalSecs(CLUE_TIMER_SECS);
    setLocalRunning(true);
    startTimer(CLUE_TIMER_SECS, "CLUE");
    playSound("timer");
  }, [startTimer]);

  const nextClue = useCallback(() => {
    if (!currentRiddle || clueLevel >= 3) return;
    const next = (clueLevel + 1) as ClueLevel;
    setClueLevel(next);
    setShowAnswer(false);
    startClueTimer();
    playSound("reveal");
    // Broadcast the clue text
    const clueText = next === 1 ? currentRiddle.clue1 : next === 2 ? currentRiddle.clue2 : currentRiddle.clue3;
    updateBroadcast({ questionText: clueText, isShuffling: false });
  }, [clueLevel, currentRiddle, startClueTimer, updateBroadcast]);

  const drawRiddle = useCallback(() => {
    if (!available.length) return;
    const r = available[0];
    setCurrentRiddle(r);
    setClueLevel(0);
    setShowAnswer(false);
    setLocalRunning(false);
    clearBuzzState();
    markR5Used(r.id);
    playSound("draw");
    updateBroadcast({ questionText: null, questionId: r.id, round: 4, isShuffling: false });
  }, [available, markR5Used, updateBroadcast, clearBuzzState]);

  const toggleAnswer = useCallback(() => {
    if (!currentRiddle || clueLevel === 0) return;
    setShowAnswer((p) => !p);
    playSound("answer");
  }, [currentRiddle, clueLevel]);

  // End the current riddle early (e.g. team answered without needing all 3 clues)
  const endRiddle = useCallback(() => {
    setCurrentRiddle(null);
    setClueLevel(0);
    setShowAnswer(false);
    setLocalRunning(false);
    clearBuzzState();
    updateBroadcast({ questionText: null, questionId: null });
    playSound("reveal");
  }, [clearBuzzState, updateBroadcast]);

  const handleCorrect = useCallback(() => {
    if (!currentRiddle || !showAnswer || !broadcast.buzzedTeamId || clueLevel === 0) return;
    awardBuzzedTeam(CLUE_PTS[clueLevel as 1|2|3]);
    endRiddle();
  }, [currentRiddle, showAnswer, broadcast.buzzedTeamId, clueLevel, awardBuzzedTeam, endRiddle]);

  const handleIncorrect = useCallback(() => {
    if (!currentRiddle || !showAnswer || !broadcast.buzzedTeamId) return;
    passQuestion();
    setShowAnswer(false);
  }, [currentRiddle, showAnswer, broadcast.buzzedTeamId, passQuestion]);

  useHostShortcuts({
    onDraw: currentRiddle ? nextClue : drawRiddle,
    onToggleAnswer: toggleAnswer,
    onCorrect: handleCorrect,
    onIncorrect: handleIncorrect,
    onEscape: endRiddle,
    isDrawDisabled: !!currentRiddle && (showAnswer || clueLevel === 3),
    isShowAnswerDisabled: !currentRiddle || clueLevel === 0 || showAnswer,
    isCorrectDisabled: !showAnswer || !broadcast.buzzedTeamId || clueLevel === 0,
    isWrongDisabled: !showAnswer || !broadcast.buzzedTeamId,
  });

  const getClueText = (level: ClueLevel) => {
    if (!currentRiddle || level === 0) return "";
    if (level === 1) return currentRiddle.clue1;
    if (level === 2) return currentRiddle.clue2;
    return currentRiddle.clue3;
  };

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden p-5">
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h2 className="font-black uppercase tracking-widest" style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "#FFCC00" }}>
            Round 5 — Riddle Round
          </h2>
          <p className="text-xs" style={{ color: "#666", fontFamily: "var(--font-mono)" }}>
            Progressive clues · C1=5pts · C2=4pts · C3=3pts · 30s per clue · HOST VIEW
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-sm border px-3 py-1.5 text-center" style={{ borderColor: "#222", background: "#0A0A0A" }}>
            <p className="text-[10px] tracking-widest uppercase" style={{ color: "#555", fontFamily: "var(--font-mono)" }}>Riddles Left</p>
            <p className="font-black tabular-nums" style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "#FFCC00" }}>
              {remaining}<span style={{ color: "#444" }}>/{total}</span>
            </p>
          </div>
          <button onClick={() => { setCurrentRiddle(null); setClueLevel(0); setShowAnswer(false); setLocalRunning(false); clearBuzzState(); }}
            className="flex h-9 w-9 items-center justify-center rounded-sm border" style={{ borderColor: "#222", color: "#555" }}>
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        <div className="flex flex-1 flex-col gap-3 min-h-0">
          <AnimatePresence mode="wait">
            {!currentRiddle ? (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-1 items-center justify-center rounded-sm border"
                style={{ borderColor: "#1a1a1a", background: "#0A0A0A" }}
              >
                <div className="text-center">
                  <Lightbulb size={40} className="mx-auto mb-4" style={{ color: "#222" }} />
                  <p className="font-black uppercase" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px,4vw,44px)", color: remaining === 0 ? "#333" : "#222" }}>
                    {remaining === 0 ? "All Riddles Drawn" : "Ready for Riddle"}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div key={`riddle-${currentRiddle.id}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-1 flex-col overflow-hidden rounded-sm border"
                style={{ borderColor: "#FFCC0040", background: "#00100f" }}
              >
                <motion.div className="h-1 shrink-0" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6 }}
                  style={{ background: "#FFCC00", transformOrigin: "left" }}
                />

                {/* Clue pills */}
                <div className="flex items-center gap-3 border-b px-6 py-3" style={{ borderColor: "#FFCC0020" }}>
                  {([1, 2, 3] as const).map((n) => {
                    const revealed = clueLevel >= n;
                    const isCurrent = clueLevel === n;
                    return (
                      <div key={n} className="flex items-center gap-1.5 rounded-sm border px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-all"
                        style={{
                          borderColor: revealed ? `${CLUE_COLORS[n]}60` : "#222",
                          background: revealed ? `${CLUE_COLORS[n]}15` : "#0A0A0A",
                          color: revealed ? CLUE_COLORS[n] : "#333",
                          boxShadow: isCurrent ? `0 0 20px 2px ${CLUE_COLORS[n]}20` : "none",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        <Lightbulb size={10} />
                        Clue {n} · {CLUE_PTS[n]} pts
                      </div>
                    );
                  })}
                </div>

                {/* Revealed clues */}
                <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
                  {clueLevel === 0 && (
                    <div className="flex flex-1 items-center justify-center">
                      <p className="font-black uppercase" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(18px,2.5vw,32px)", color: "#FFCC0030" }}>
                        Reveal first clue to begin
                      </p>
                    </div>
                  )}
                  {([1, 2, 3] as const).map((n) => {
                    if (clueLevel < n) return null;
                    const isLatest = clueLevel === n;
                    return (
                      <motion.div key={n} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                        className="rounded-sm border p-5"
                        style={{ borderColor: isLatest ? `${CLUE_COLORS[n]}50` : "#222", background: isLatest ? `${CLUE_COLORS[n]}0C` : "#080808" }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb size={12} style={{ color: CLUE_COLORS[n] }} />
                          <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: CLUE_COLORS[n], fontFamily: "var(--font-mono)" }}>
                            Clue {n} — {CLUE_PTS[n]} Points
                          </span>
                        </div>
                        <p className="font-bold leading-snug" style={{
                          fontFamily: "var(--font-display)",
                          fontSize: isLatest ? "clamp(24px,3.5vw,40px)" : "clamp(18px,2.5vw,28px)",
                          color: isLatest ? "#fff" : "#666",
                        }}>
                          {getClueText(n)}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>

                <HostAnswerControls
                  showAnswer={showAnswer}
                  onToggleAnswer={toggleAnswer}
                  onCorrect={broadcast.buzzedTeamId && clueLevel > 0 ? handleCorrect : undefined}
                  onIncorrect={broadcast.buzzedTeamId ? handleIncorrect : undefined}
                  showGrading={true}
                  points={CLUE_PTS[clueLevel as 1|2|3]}
                  buzzedTeamName={broadcast.buzzedTeamId ? teams.find(t => t.id === broadcast.buzzedTeamId)?.name : undefined}
                />
                <AnimatePresence>
                  {showAnswer && (
                    <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }} className="overflow-hidden px-6 pb-4"
                    >
                      <div className="rounded-sm border p-4" style={{ borderColor: "#FFCC0050", background: "#001614" }}>
                        <p className="font-black" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(20px,3vw,34px)", color: "#FFCC00" }}>
                          {currentRiddle.answer}
                        </p>
                        {currentRiddle.explanation && (
                          <div className="mt-3 flex items-start gap-2 border-t pt-3" style={{ borderColor: "#FFCC0020" }}>
                            <BookOpen size={12} style={{ color: "#FFCC0080", flexShrink: 0, marginTop: "2px" }} />
                            <p className="text-sm leading-relaxed" style={{ color: "#67E8F9", fontFamily: "var(--font-body)" }}>
                              {currentRiddle.explanation}
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

          {/* Controls */}
          <div className="shrink-0 flex justify-center gap-3">
            {!currentRiddle ? (
              <motion.button onClick={drawRiddle} disabled={remaining === 0} whileTap={{ scale: 0.975 }}
                className="flex items-center gap-3 rounded-sm px-10 py-4 font-black uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-40"
                style={{ background: remaining === 0 ? "#1a1a1a" : "#FFCC00", color: remaining === 0 ? "#444" : "#000", fontFamily: "var(--font-display)", fontSize: "clamp(16px,2vw,20px)", letterSpacing: "0.14em", boxShadow: remaining === 0 ? "none" : "0 0 50px 8px #FFCC0025" }}
              >
                <Lightbulb size={20} />Draw Riddle
              </motion.button>
            ) : (
              <>
                <motion.button onClick={nextClue} disabled={clueLevel >= 3} whileTap={{ scale: 0.975 }}
                  className="flex items-center gap-3 rounded-sm px-10 py-4 font-black uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    background: clueLevel >= 3 ? "#1a1a1a" : CLUE_COLORS[Math.min(clueLevel + 1, 3) as 1|2|3],
                    color: clueLevel >= 3 ? "#444" : "#000",
                    fontFamily: "var(--font-display)", fontSize: "clamp(14px,2vw,18px)", letterSpacing: "0.12em",
                    boxShadow: clueLevel >= 3 ? "none" : `0 0 40px 6px ${CLUE_COLORS[Math.min(clueLevel + 1, 3) as 1|2|3]}25`,
                  }}
                >
                  <Lightbulb size={18} />
                  {clueLevel === 0 ? "Reveal Clue 1 (5 pts)" : clueLevel === 1 ? "Reveal Clue 2 (4 pts)" : clueLevel === 2 ? "Reveal Clue 3 (3 pts)" : "All Clues Revealed"}
                </motion.button>
                <motion.button onClick={endRiddle} whileTap={{ scale: 0.975 }}
                  className="flex items-center gap-2 rounded-sm border px-6 py-4 font-bold uppercase tracking-widest transition-colors hover:border-red-500/60 hover:text-red-400"
                  style={{ borderColor: "#333", color: "#888", fontFamily: "var(--font-mono)", fontSize: "clamp(12px,1.5vw,14px)" }}
                >
                  <SkipForward size={16} />
                  End Riddle
                </motion.button>
              </>
            )}
          </div>

          <div className="shrink-0 flex justify-center gap-4">
            {[["SPACE", "Draw / Reveal Next Clue"], ["ENTER", "Show Answer"], ["ESC", "End Riddle"]].map(([k, a]) => (
              <div key={k} className="flex items-center gap-1.5">
                <kbd className="rounded border px-2 py-0.5 text-[10px]" style={{ borderColor: "#333", background: "#111", color: "#555", fontFamily: "var(--font-mono)" }}>{k}</kbd>
                <span className="text-[10px]" style={{ color: "#444", fontFamily: "var(--font-mono)" }}>{a}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timer sidebar */}
        {currentRiddle && clueLevel > 0 && (
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="flex w-40 shrink-0 flex-col items-center gap-4">
            <div className="flex w-full flex-col items-center gap-3 rounded-sm border p-4" style={{ borderColor: "#222", background: "#0A0A0A" }}>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: "#555", fontFamily: "var(--font-mono)" }}>Time Left</p>
              <CountdownRing seconds={localSecs} total={CLUE_TIMER_SECS} />
              {localSecs === 0 && <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#EF4444", fontFamily: "var(--font-mono)" }}>Time&apos;s Up!</p>}
              <button onClick={startClueTimer} className="w-full rounded-sm py-2 text-xs font-semibold uppercase tracking-wider"
                style={{ background: "#FFCC0020", color: "#FFCC00", fontFamily: "var(--font-mono)" }}
              >Restart Timer</button>
            </div>
            <div className="w-full rounded-sm border p-3 text-center"
              style={{ borderColor: `${CLUE_COLORS[clueLevel as 1|2|3]}50`, background: `${CLUE_COLORS[clueLevel as 1|2|3]}10` }}
            >
              <p className="text-[10px] uppercase tracking-widest" style={{ color: "#555", fontFamily: "var(--font-mono)" }}>Value</p>
              <p className="font-black" style={{ fontFamily: "var(--font-display)", fontSize: "32px", color: CLUE_COLORS[clueLevel as 1|2|3] }}>
                {CLUE_PTS[clueLevel as 1|2|3]}
              </p>
              <p className="text-[10px]" style={{ color: "#555", fontFamily: "var(--font-mono)" }}>pts</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
