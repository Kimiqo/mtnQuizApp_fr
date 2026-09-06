import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Play, Pause, RotateCcw, AlertTriangle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { R2_TIMER_SECS, playSound } from "@/data/seed";

function TimerRing({ seconds, total }: { seconds: number; total: number }) {
  const r = 44; const circ = 2 * Math.PI * r;
  const pct = seconds / total;
  const color = pct > 0.5 ? "#22C55E" : pct > 0.2 ? "#FFCC00" : "#EF4444";
  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      <circle cx="55" cy="55" r={r} fill="none" stroke="#1e1e1e" strokeWidth="6" />
      <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
        transform="rotate(-90 55 55)" style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s" }}
      />
      <text x="55" y="52" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="20" fontWeight="900" fontFamily="var(--font-display)">
        {String(Math.floor(seconds / 60)).padStart(2,"0")}:{String(seconds % 60).padStart(2,"0")}
      </text>
      <text x="55" y="70" textAnchor="middle" fill={color} fontSize="8" fontFamily="var(--font-mono)">REMAINING</text>
    </svg>
  );
}

export default function RoundTwo() {
  const { questions, addPoints, teams, hostGroupId, updateBroadcast, startTimer, stopTimer, resetTimer: ctxResetTimer } = useApp();
  const problem = questions.round2[0];
  const [showAnswer, setShowAnswer] = useState(false);
  const [timerSecs, setTimerSecs] = useState(R2_TIMER_SECS);
  const [timerRunning, setTimerRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const groupTeams = teams.filter((t) => t.groupId === hostGroupId);

  // Push scenario to broadcast on mount
  useEffect(() => {
    updateBroadcast({
      questionText: `${problem.scenario}\n\nQuestion: ${problem.question}`,
      questionId: problem.id,
      round: 3,
      isShuffling: false
    });
  }, [problem, updateBroadcast]);

  const startLocalTimer = useCallback(() => {
    setTimerRunning(true);
    startTimer(timerSecs, "DISCUSSION");
    playSound("timer");
  }, [timerSecs, startTimer]);

  const pauseLocalTimer = useCallback(() => {
    setTimerRunning(false);
    stopTimer();
  }, [stopTimer]);

  const resetLocalTimer = useCallback(() => {
    setTimerRunning(false);
    setTimerSecs(R2_TIMER_SECS);
    ctxResetTimer(R2_TIMER_SECS);
  }, [ctxResetTimer]);

  // Keep local display in sync (separate from broadcast timer)
  useEffect(() => {
    if (timerRunning && timerSecs > 0) {
      intervalRef.current = setInterval(() => {
        setTimerSecs((s) => { if (s <= 1) { setTimerRunning(false); return 0; } return s - 1; });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerRunning]);

  const toggleAnswer = useCallback(() => { setShowAnswer((p) => !p); playSound("answer"); }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLSelectElement || e.target instanceof HTMLInputElement) return;
      if (e.code === "Enter") { e.preventDefault(); toggleAnswer(); }
      if (e.code === "Space") { e.preventDefault(); if (timerRunning) { pauseLocalTimer(); } else { startLocalTimer(); } }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [timerRunning, startLocalTimer, pauseLocalTimer, toggleAnswer]);

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden p-5">
      <div className="shrink-0">
        <h2 className="font-black uppercase tracking-widest" style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "#FFCC00" }}>
          Round 3 — Problem of the Day
        </h2>
        <p className="text-xs" style={{ color: "#666", fontFamily: "var(--font-mono)" }}>
          All teams simultaneously · group discussion · HOST VIEW — answer visible
        </p>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        {/* Problem card */}
        <div className="glow-yellow flex flex-1 flex-col overflow-hidden rounded-sm border" style={{ borderColor: "#FFCC0040", background: "#080f1a" }}>
          <motion.div className="h-1 shrink-0" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6 }}
            style={{ background: "#FFCC00", transformOrigin: "left" }}
          />
          <div className="flex items-center gap-2 border-b px-6 py-3" style={{ borderColor: "#FFCC0020" }}>
            <AlertTriangle size={13} style={{ color: "#FFCC00" }} />
            <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "#FFCC00", fontFamily: "var(--font-mono)" }}>Scenario</span>
          </div>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
            <p className="font-bold leading-relaxed" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(20px,2.5vw,30px)", color: "#c8d9ff" }}>
              {problem.scenario}
            </p>
            <div className="h-px" style={{ background: "#FFCC0020" }} />
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-widest" style={{ color: "#FFCC00", fontFamily: "var(--font-mono)" }}>Question</p>
              <p className="font-bold leading-snug" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px,3vw,36px)", color: "#fff" }}>
                {problem.question}
              </p>
            </div>
          </div>

          {/* HOST: Answer + Explanation */}
          <div className="shrink-0 border-t px-6 py-4" style={{ borderColor: "#FFCC0020" }}>
            <button onClick={toggleAnswer}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest hover:opacity-80"
              style={{ color: showAnswer ? "#FFCC00" : "#555", fontFamily: "var(--font-mono)" }}
            >
              {showAnswer ? <Eye size={13} /> : <EyeOff size={13} />}
              {showAnswer ? "Hide Answer" : "Show Answer (Host Only)"}
              <kbd className="rounded border px-1.5 py-0.5 text-[9px]" style={{ borderColor: "#333", color: "#444" }}>ENTER</kbd>
            </button>
            <AnimatePresence>
              {showAnswer && (
                <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }} className="overflow-hidden"
                >
                  <div className="rounded-sm border p-4" style={{ borderColor: "#FFCC0040", background: "#0f0e00" }}>
                    <p className="text-[10px] uppercase tracking-widest" style={{ color: "#FFCC00", fontFamily: "var(--font-mono)", marginBottom: "6px" }}>
                      Accepted answers — award up to 5 pts
                    </p>
                    <p className="font-bold" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(16px,2vw,22px)", color: "#93C5FD" }}>
                      {problem.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: timer + award */}
        <div className="flex w-48 shrink-0 flex-col gap-4">
          <div className="flex flex-col items-center gap-3 rounded-sm border p-4" style={{ borderColor: "#222", background: "#0A0A0A" }}>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: "#555", fontFamily: "var(--font-mono)" }}>Discussion Timer</p>
            <TimerRing seconds={timerSecs} total={R2_TIMER_SECS} />
            {timerSecs === 0 && <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#EF4444", fontFamily: "var(--font-mono)" }}>Time&apos;s Up!</p>}
            <div className="flex gap-2">
              <button onClick={timerRunning ? pauseLocalTimer : startLocalTimer}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-sm py-2 text-xs font-semibold uppercase tracking-wider"
                style={{ background: timerRunning ? "#222" : "#FFCC00", color: timerRunning ? "#888" : "#000", fontFamily: "var(--font-mono)" }}
              >
                {timerRunning ? <Pause size={12} /> : <Play size={12} />}
                {timerRunning ? "Pause" : "Start"}
              </button>
              <button onClick={resetLocalTimer} className="flex h-8 w-8 items-center justify-center rounded-sm border" style={{ borderColor: "#333", color: "#555" }}>
                <RotateCcw size={12} />
              </button>
            </div>
            <p className="text-center text-[9px]" style={{ color: "#333", fontFamily: "var(--font-mono)" }}>SPACE to start/pause</p>
          </div>

          <div className="flex flex-col gap-2 rounded-sm border p-3" style={{ borderColor: "#222", background: "#0A0A0A" }}>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: "#555", fontFamily: "var(--font-mono)" }}>Award Points</p>
            {groupTeams.map((team) => (
              <div key={team.id} className="flex items-center gap-1">
                <span className="flex-1 truncate text-[10px]" style={{ color: "#888" }}>{team.name.split(" ")[0]}</span>
                {[1, 2, 3].map((pts) => (
                  <button key={pts} onClick={() => addPoints(team.id, pts, "r3")}
                    className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                    style={{ background: "#FFCC0020", color: "#FFCC00" }}
                  >+{pts}</button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
