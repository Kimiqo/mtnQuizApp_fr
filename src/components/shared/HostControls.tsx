import React, { useEffect } from "react";
import { Zap, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

interface ShortcutProps {
  onDraw?: () => void;
  onToggleAnswer?: () => void;
  onCorrect?: () => void;
  onIncorrect?: () => void;
  onEscape?: () => void;
  isDrawDisabled?: boolean;
  isShowAnswerDisabled?: boolean;
  isCorrectDisabled?: boolean;
  isWrongDisabled?: boolean;
}

export function useHostShortcuts({
  onDraw, onToggleAnswer, onCorrect, onIncorrect, onEscape,
  isDrawDisabled, isShowAnswerDisabled, isCorrectDisabled, isWrongDisabled
}: ShortcutProps) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLSelectElement || e.target instanceof HTMLInputElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        // Blur the active element to prevent repeated button clicks trapping focus
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        if (!isDrawDisabled && onDraw) onDraw();
        else if (!isShowAnswerDisabled && onToggleAnswer) onToggleAnswer();
      }
      if (e.code === "Enter") {
        e.preventDefault();
        if (!isShowAnswerDisabled && onToggleAnswer) onToggleAnswer();
      }
      if (e.code === "KeyC") {
        e.preventDefault();
        if (!isCorrectDisabled && onCorrect) onCorrect();
      }
      if (e.code === "KeyW") {
        e.preventDefault();
        if (!isWrongDisabled && onIncorrect) onIncorrect();
      }
      if (e.code === "Escape") {
        e.preventDefault();
        if (onEscape) onEscape();
      }
    };
    window.addEventListener("keydown", h, { capture: true });
    return () => window.removeEventListener("keydown", h, { capture: true });
  }, [onDraw, onToggleAnswer, onCorrect, onIncorrect, onEscape, isDrawDisabled, isShowAnswerDisabled, isCorrectDisabled, isWrongDisabled]);
}

export function HostDrawButton({ onDraw, isShuffling, remaining, customLabel }: { onDraw: () => void, isShuffling: boolean, remaining: number, customLabel?: string }) {
  return (
    <div className="shrink-0 flex flex-col items-center gap-2">
      <motion.button
        onClick={onDraw}
        disabled={isShuffling || remaining === 0}
        whileTap={{ scale: 0.975 }}
        whileHover={!isShuffling && remaining > 0 ? { scale: 1.02 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="relative flex items-center gap-3 overflow-hidden rounded-sm px-12 py-4 font-black uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          background: isShuffling || remaining === 0 ? "#1a1a1a" : "#FFCC00",
          color: isShuffling || remaining === 0 ? "#444" : "#000",
          fontFamily: "var(--font-display)", fontSize: "clamp(16px,2vw,22px)", letterSpacing: "0.14em",
          boxShadow: isShuffling || remaining === 0 ? "none" : "0 0 50px 8px #FFCC0030",
          transition: "background 0.2s, box-shadow 0.2s",
        }}
      >
        {!isShuffling && remaining > 0 && (
          <motion.span className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(105deg,transparent 35%,rgba(255,255,255,0.3) 50%,transparent 65%)", backgroundSize: "300% 100%" }}
            animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
        )}
        <Zap size={20} />
        {isShuffling ? "Drawing..." : remaining === 0 ? "No Questions Left" : customLabel || "Draw Next Question"}
      </motion.button>
      <div className="flex gap-4">
        {[["SPACE", "Draw"], ["ENTER", "Show Answer"]].map(([k, a]) => (
          <div key={k} className="flex items-center gap-1.5">
            <kbd className="rounded border px-2 py-0.5 text-[10px]" style={{ borderColor: "#333", background: "#111", color: "#555", fontFamily: "var(--font-mono)" }}>{k}</kbd>
            <span className="text-[10px]" style={{ color: "#444", fontFamily: "var(--font-mono)" }}>{a}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HostAnswerControls({ showAnswer, onToggleAnswer, onCorrect, onIncorrect, showGrading, points, buzzedTeamName }: { showAnswer: boolean, onToggleAnswer: () => void, onCorrect?: () => void, onIncorrect?: () => void, showGrading: boolean, points?: number, buzzedTeamName?: string }) {
  return (
    <div className="shrink-0 border-t px-6 py-4" style={{ borderColor: "#1a1a1a" }}>
      <div className="flex items-center justify-between">
        <button onClick={onToggleAnswer}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest hover:opacity-80"
          style={{ color: showAnswer ? "#FFCC00" : "#555", fontFamily: "var(--font-mono)" }}
        >
          {showAnswer ? <Eye size={13} /> : <EyeOff size={13} />}
          {showAnswer ? "Hide Answer" : "Show Answer"}
          <kbd className="rounded border px-1.5 py-0.5 text-[9px]" style={{ borderColor: "#333", color: "#444" }}>ENTER</kbd>
        </button>
        {showAnswer && showGrading && onCorrect && onIncorrect && (
          <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
            {buzzedTeamName && (
              <span className="text-[10px] uppercase tracking-widest font-bold mr-2" style={{ color: "#FFCC00", fontFamily: "var(--font-mono)" }}>
                Buzzed: {buzzedTeamName}
              </span>
            )}
            <button onClick={onCorrect}
              className="rounded-sm px-4 py-1.5 text-xs font-black flex items-center gap-1.5"
              style={{ background: "#22C55E", color: "#000", fontFamily: "var(--font-display)", fontSize: "14px" }}
            >
              ✅ CORRECT {points ? `(+${points})` : ""} <kbd className="hidden sm:inline-block rounded border border-black/20 px-1 py-0.5 text-[9px] bg-black/10">C</kbd>
            </button>
            <button onClick={onIncorrect}
              className="rounded-sm px-4 py-1.5 text-xs font-black flex items-center gap-1.5"
              style={{ background: "#EF4444", color: "#000", fontFamily: "var(--font-display)", fontSize: "14px" }}
            >
              ❌ WRONG <kbd className="hidden sm:inline-block rounded border border-black/20 px-1 py-0.5 text-[9px] bg-black/10">W</kbd>
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
