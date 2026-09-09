import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Shuffle, Play, CheckCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { TEAMS, playSound } from "@/data/seed";

interface GroupDrawCeremonyProps {
  onComplete?: () => void;
}

export function GroupDrawCeremony({ onComplete }: GroupDrawCeremonyProps) {
  const { groups, teams, broadcast, updateBroadcast, userRole } = useApp();
  const isHost = userRole === "host" || window.location.pathname.startsWith("/host");

  const { drawPhase, drawRevealedGroups } = broadcast;

  // Local state for shuffling names to avoid spamming network
  const [shuffleNames, setShuffleNames] = useState<string[]>([]);
  const allTeamNames = TEAMS.map(t => t.name);

  // Synchronized visual shuffle
  useEffect(() => {
    if (drawPhase !== "shuffling") return;
    const id = setInterval(() => {
      const shuffled = [...allTeamNames].sort(() => Math.random() - 0.5);
      setShuffleNames(shuffled);
      // Play tick sound locally for everyone
      playSound("shuffle");
    }, 200);
    return () => clearInterval(id);
  }, [drawPhase, allTeamNames]);

  // Host Controls
  const startReveal = useCallback(() => {
    if (!isHost) return;
    updateBroadcast({ drawPhase: "revealing", drawRevealedGroups: 0 });
  }, [isHost, updateBroadcast]);

  const revealNext = useCallback(() => {
    if (!isHost) return;
    const next = drawRevealedGroups + 1;
    updateBroadcast({ drawRevealedGroups: next });
    playSound("reveal");

    if (next >= groups.length) {
      setTimeout(() => {
        updateBroadcast({ drawPhase: "done" });
      }, 1500);
    }
  }, [isHost, drawRevealedGroups, groups.length, updateBroadcast]);

  if (drawPhase === "done") {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-6 rounded-sm border p-8"
        style={{ borderColor: "#FFCC0040", background: "#0A0A0A" }}
      >
        <Trophy size={40} style={{ color: "#FFCC00" }} />
        <h2 className="font-black uppercase tracking-widest text-center" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 4vw, 32px)", color: "#FFCC00" }}>
          Groups Assigned!
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {groups.map((g) => (
            <div key={g.id} className="flex flex-col gap-1 rounded-sm border p-3" style={{ borderColor: "#FFCC0040", background: "#0f0e00", minWidth: "160px" }}>
              <span className="text-center text-[10px] font-black uppercase tracking-widest" style={{ color: "#FFCC00", fontFamily: "var(--font-mono)" }}>{g.name}</span>
              {teams.filter(t => t.groupId === g.id).map(t => (
                <span key={t.id} className="text-center text-xs font-semibold" style={{ color: "#ccc" }}>{t.name}</span>
              ))}
            </div>
          ))}
        </div>
        {isHost ? (
          <button
            onClick={onComplete}
            className="mt-2 flex items-center gap-2 rounded-sm px-6 py-2.5 font-black uppercase tracking-widest transition-all hover:opacity-90"
            style={{ background: "#FFCC00", color: "#000", fontFamily: "var(--font-display)", fontSize: "14px" }}
          >
            <CheckCircle size={16} /> Continue to Quiz
          </button>
        ) : (
          <p className="mt-2 text-sm uppercase tracking-widest" style={{ color: "#FFCC0080", fontFamily: "var(--font-mono)" }}>
            Awaiting host to start quiz...
          </p>
        )}
      </motion.div>
    );
  }

  const patternSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" transform="rotate(-30, 150, 150)" fill="#FFCC00" fill-opacity="0.03" font-family="sans-serif" font-size="22" font-weight="bold" letter-spacing="2">MTN DIGIFEST 2026</text>
</svg>
  `.trim());

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="relative flex flex-col items-center gap-6 rounded-sm border p-12 overflow-hidden"
      style={{ 
        borderColor: "#FFCC0040", 
        background: drawPhase === "idle" ? `#0A0A0A url("data:image/svg+xml;utf8,${patternSvg}") repeat` : "#0A0A0A", 
        minWidth: "60%" 
      }}
    >
      <div className="relative z-10 flex flex-col items-center gap-6 w-full">
        <h2 className="font-black uppercase tracking-widest text-center" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 4vw, 32px)", color: "#FFCC00" }}>
          {drawPhase === "idle" ? "WELCOME TO THE 2026 MTN AI QUIZ COMPETITION" : drawPhase === "awaiting" ? "Awaiting Group Draw..." : drawPhase === "shuffling" ? "Group Draw in Progress" : "Revealing Groups..."}
        </h2>

      {/* IDLE / AWAITING / SHUFFLING PHASE */}
      {(drawPhase === "idle" || drawPhase === "awaiting" || drawPhase === "shuffling") && (
        <>
          {drawPhase !== "idle" && (
            <div className="grid grid-cols-3 gap-2 w-full max-w-2xl">
              {(drawPhase === "shuffling" ? shuffleNames : allTeamNames).map((name, i) => (
                <motion.div
                  key={i}
                  animate={drawPhase === "shuffling" ? { opacity: [0.4, 1, 0.4] } : { opacity: 0.3 }}
                  transition={{ duration: 0.4, repeat: drawPhase === "shuffling" ? Infinity : 0 }}
                  className="rounded-sm border px-2 py-2 text-center text-[11px] font-semibold flex items-center justify-center min-h-[40px]"
                  style={{ borderColor: "#FFCC0030", background: "#0f0e00", color: "#FFCC00", fontFamily: "var(--font-display)", wordBreak: "break-word" }}
                >
                  {drawPhase === "shuffling" ? name : "?"}
                </motion.div>
              ))}
            </div>
          )}
          {isHost && drawPhase === "shuffling" && (
            <button
              onClick={startReveal}
              className="flex items-center gap-2 rounded-sm px-6 py-2.5 font-black uppercase tracking-widest transition-all hover:opacity-90"
              style={{ background: "#FFCC00", color: "#000", fontFamily: "var(--font-display)", fontSize: "14px" }}
            >
              <Play size={14} /> Reveal Groups
            </button>
          )}
          {isHost && drawPhase === "idle" && (
            <button
              onClick={() => updateBroadcast({ drawPhase: "awaiting" })}
              className="flex items-center gap-2 rounded-sm px-6 py-2.5 font-black uppercase tracking-widest transition-all hover:opacity-90 mt-8"
              style={{ background: "#FFCC00", color: "#000", fontFamily: "var(--font-display)", fontSize: "14px" }}
            >
              <Shuffle size={14} /> Prepare Draw
            </button>
          )}
          {isHost && drawPhase === "awaiting" && (
            <button
              onClick={() => updateBroadcast({ drawPhase: "shuffling", drawRevealedGroups: 0 })}
              className="flex items-center gap-2 rounded-sm px-6 py-2.5 font-black uppercase tracking-widest transition-all hover:opacity-90 mt-4"
              style={{ background: "#FFCC00", color: "#000", fontFamily: "var(--font-display)", fontSize: "14px" }}
            >
              <Shuffle size={14} /> Start Shuffle
            </button>
          )}
        </>
      )}

      {/* REVEALING PHASE */}
      {drawPhase === "revealing" && (
        <>
          <div className="flex flex-wrap justify-center gap-6">
            {groups.map((g, gi) => (
              <div key={g.id} className="flex flex-col gap-1 rounded-sm border p-3" style={{
                borderColor: gi < drawRevealedGroups ? "#FFCC0060" : "#222",
                background: gi < drawRevealedGroups ? "#0f0e00" : "#080808",
                minWidth: "160px",
                transition: "all 0.4s",
              }}>
                <span className="text-center text-[10px] font-black uppercase tracking-widest" style={{ color: gi < drawRevealedGroups ? "#FFCC00" : "#444", fontFamily: "var(--font-mono)" }}>{g.name}</span>
                <AnimatePresence>
                  {gi < drawRevealedGroups && teams.filter(t => t.groupId === g.id).map((t, ti) => (
                    <motion.span
                      key={t.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: ti * 0.12 }}
                      className="text-center text-xs font-semibold"
                      style={{ color: "#ccc" }}
                    >
                      {t.name}
                    </motion.span>
                  ))}
                </AnimatePresence>
                {gi >= drawRevealedGroups && (
                  <span className="text-center text-xs" style={{ color: "#333" }}>???</span>
                )}
              </div>
            ))}
          </div>
          {isHost && drawRevealedGroups < groups.length ? (
            <button
              onClick={revealNext}
              className="flex items-center gap-2 rounded-sm px-6 py-2.5 font-black uppercase tracking-widest transition-all hover:opacity-90"
              style={{ background: "#FFCC00", color: "#000", fontFamily: "var(--font-display)", fontSize: "14px" }}
            >
              <Shuffle size={14} /> Reveal {groups[drawRevealedGroups].name}
            </button>
          ) : null}
        </>
      )}
      </div>
    </motion.div>
  );
}
