import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, RadioTower, Trophy, Zap, AlertTriangle, Lock } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ROUND_CONFIG } from "@/data/seed";

// ── Shared mini-leaderboard ──────────────────────────────────────────────────
function GroupLeaderboard({ groupId, teamId }: { groupId: string; teamId: string }) {
  const { groups, teams, scores, hostGroupId, broadcast, activeTeamId } = useApp();
  const gid = groupId || hostGroupId;
  const group = groups.find((g) => g.id === gid)!;
  const ranked = [...teams.filter((t) => t.groupId === gid)].sort(
    (a, b) => (scores[b.id]?.total ?? 0) - (scores[a.id]?.total ?? 0)
  );
  
  const activeFloorTeamId = broadcast.buzzedTeamId || activeTeamId;
  
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] uppercase tracking-widest" style={{ color: "#FFCC0080", fontFamily: "var(--font-mono)" }}>
        {group.name} — Live Standings
      </p>
      {ranked.map((team, i) => {
        const pts = scores[team.id]?.total ?? 0;
        const isMe = team.id === teamId;
        const isFirst = i === 0 && pts > 0;
        const isFloorTeam = team.id === activeFloorTeamId;
        return (
          <motion.div
            key={team.id}
            layout
            className="flex items-center gap-3 rounded-sm border px-4 py-2.5"
            style={{
              borderColor: isFloorTeam ? "#FFCC00" : isMe ? "#FFCC0060" : isFirst ? "#FFCC0025" : "#1e1e1e",
              background: isFloorTeam ? "#FFCC0020" : isMe ? "#0f0e00" : isFirst ? "#0c0b00" : "#0A0A0A",
              boxShadow: isFloorTeam ? "0 0 20px 2px #FFCC0040" : "none",
            }}
          >
            <span
              className="w-5 text-right font-black"
              style={{ fontFamily: "var(--font-display)", fontSize: "18px", color: isFirst ? "#FFCC00" : "#444" }}
            >
              {i + 1}
            </span>
            {isFirst && <Trophy size={12} style={{ color: "#FFCC00", flexShrink: 0 }} />}
            <span
              className="flex-1 truncate font-semibold"
              style={{ color: isMe ? "#FFCC00" : isFirst ? "#fff" : "#888", fontSize: isMe ? "15px" : "13px" }}
            >
              {team.name}
              {isMe && <span className="ml-2 text-[10px] opacity-60" style={{ fontFamily: "var(--font-mono)" }}>(you)</span>}
            </span>
            <motion.span
              layout
              className="font-black tabular-nums"
              style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: isFirst ? "#FFCC00" : "#fff" }}
            >
              {pts}
            </motion.span>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Timer display ────────────────────────────────────────────────────────────
function BroadcastTimer() {
  const { broadcast } = useApp();
  const { timerSecs, timerActive, timerTotal, timerLabel } = broadcast;
  if (!timerLabel && timerSecs === 0) return null;

  const pct = timerTotal > 0 ? timerSecs / timerTotal : 0;
  const color = broadcast.isStealMode
    ? "#FFCC00"
    : pct > 0.5
      ? "#22C55E"
      : pct > 0.25
        ? "#FFCC00"
        : "#EF4444";
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  return (
    <div className="flex items-center gap-4">
      <svg width="70" height="70" viewBox="0 0 70 70">
        <circle cx="35" cy="35" r={r} fill="none" stroke="#1e1e1e" strokeWidth="5" />
        <circle
          cx="35" cy="35" r={r} fill="none"
          stroke={color} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 35 35)"
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s" }}
        />
        <text x="35" y="37" textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="16" fontWeight="900" fontFamily="var(--font-display)">
          {String(Math.floor(timerSecs / 60)).padStart(2, "0")}:{String(timerSecs % 60).padStart(2, "0")}
        </text>
      </svg>
      <div>
        <p className="font-black uppercase tracking-widest" style={{ fontFamily: "var(--font-display)", fontSize: "13px", color }}>
          {timerLabel || (timerActive ? "TIMER" : "PAUSED")}
        </p>
        <p className="text-[10px]" style={{ color: "#555", fontFamily: "var(--font-mono)" }}>
          {timerActive ? "Counting down" : timerSecs === 0 ? "Time expired" : "Paused"}
        </p>
      </div>
    </div>
  );
}

// ── BUZZ button states ───────────────────────────────────────────────────────
type BuzzState = "idle" | "active" | "mybuzz" | "taken" | "locked" | "spectating";

export default function ContestantView() {
  const navigate = useNavigate();
  const { groupId: urlGroupId, teamId: urlTeamId } = useParams();
  const { currentTeam, logout, broadcast, teamBuzz, currentRound, groups, teams, hostGroupId } = useApp();
  const [buzzFlash, setBuzzFlash] = useState(false);

  const myId = urlTeamId || currentTeam?.id || "";
  const myGroupId = urlGroupId || currentTeam?.groupId || "";
  const group = groups.find((g) => g.id === myGroupId);
  const activeTeam = teams.find(t => t.id === myId);
  const roundConfig = ROUND_CONFIG[currentRound];

  // Check if this team's group is the active group on the pedestal
  const isMyGroupActive = myGroupId === hostGroupId;

  const buzzState: BuzzState = !broadcast.buzzEnabled
    ? "idle"
    : !isMyGroupActive
      ? "spectating"
      : broadcast.lockedOutTeamIds.includes(myId)
        ? "locked"
        : broadcast.buzzedTeamId === myId
          ? "mybuzz"
          : broadcast.buzzedTeamId
            ? "taken"
            : "active";

  const canBuzz = buzzState === "active";

  const handleBuzz = useCallback(() => {
    if (!canBuzz) return;
    teamBuzz(myId);
    setBuzzFlash(true);
    setTimeout(() => setBuzzFlash(false), 300);
  }, [canBuzz, teamBuzz, myId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); handleBuzz(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleBuzz]);

  const buzzConfig = {
    idle:       { bg: "#1a1a1a", color: "#444",    text: "STANDBY",    sub: "Buzzer not active yet",       glow: "none" },
    spectating: { bg: "#111827", color: "#6366F1", text: "SPECTATING", sub: "Another group is playing",     glow: "0 0 40px 8px #6366F120" },
    active:     { bg: "#FFCC00", color: "#000",    text: "BUZZ!",      sub: "Press to buzz in",             glow: "0 0 80px 20px #FFCC0050" },
    mybuzz:     { bg: "#22C55E", color: "#000",    text: "BUZZED IN!", sub: "Await host decision",          glow: "0 0 80px 20px #22C55E60" },
    taken:      { bg: "#1a1a1a", color: "#555",    text: "BUZZED",     sub: "Another team buzzed in",       glow: "none" },
    locked:     { bg: "#1f0a0a", color: "#EF4444", text: "LOCKED OUT", sub: "Cannot buzz this question",    glow: "0 0 40px 8px #EF444420" },
  }[buzzState];

  const isBuzzerRound = currentRound === 2 || currentRound === 5;

  return (
    <div
      className="noise-bg relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #161200 0%, #060606 60%)" }}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
        style={{ width: "60%", height: "1px", background: "#FFCC00", boxShadow: "0 0 80px 50px #FFCC0018" }}
      />

      {/* ── Header ── */}
      <header
        className="relative z-10 flex shrink-0 items-center justify-between border-b px-5 py-3"
        style={{ borderColor: "#1a1a1a", background: "rgba(0,0,0,0.7)" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm font-black text-black" style={{ background: "#FFCC00", fontFamily: "var(--font-display)", fontSize: "11px", letterSpacing: "0.06em", boxShadow: "0 0 20px 4px #FFCC0033" }}>
            MTN
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "#FFCC00", fontFamily: "var(--font-display)" }}>MTN Ghana AI Quiz</p>
            <p className="text-[10px] tracking-wider" style={{ color: "#555", fontFamily: "var(--font-mono)" }}>
              Logged in as: {activeTeam?.name ?? "Spectator"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Round indicator */}
          <div
            className="flex items-center gap-2 rounded-sm border px-3 py-1.5"
            style={{ borderColor: "#333", background: "#0A0A0A" }}
          >
            <RadioTower size={11} style={{ color: "#EF4444" }} />
            <span className="text-xs font-semibold" style={{ color: "#aaa", fontFamily: "var(--font-display)", fontSize: "14px" }}>
              {roundConfig.label}
            </span>
          </div>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="flex h-10 w-10 items-center justify-center rounded-sm border transition-colors hover:border-red-500/50 hover:text-red-400"
            style={{ borderColor: "#333", color: "#555" }}
          >
            <LogOut size={13} />
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="relative z-10 flex flex-1 gap-5 overflow-hidden p-5">
        {/* Left: Question + Timer + Buzz */}
        <div className="flex flex-1 flex-col gap-4">
          {/* Question display */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {!broadcast.questionText || broadcast.isShuffling ? (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-full items-center justify-center rounded-sm border"
                  style={{ borderColor: "#1a1a1a", background: "#0A0A0A" }}
                >
                  <div className="text-center px-8">
                    {broadcast.isShuffling ? (
                      <p className="slot-flicker font-black uppercase" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px,4vw,48px)", color: "#FFCC00" }}>
                        Question incoming...
                      </p>
                    ) : (
                      <>
                        <p className="mb-2 text-[10px] uppercase tracking-widest text-white/50" style={{ fontFamily: "var(--font-mono)" }}>
                          {group?.name}
                        </p>
                        <h2 className="font-black uppercase text-white shadow-black drop-shadow-lg" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 4vw, 42px)", lineHeight: 1.1 }}>
                          {activeTeam?.name ?? "Select Team"}
                        </h2>
                        <p className="mt-2 text-sm" style={{ color: "#333", fontFamily: "var(--font-mono)" }}>
                          The host will draw the next question shortly
                        </p>
                      </>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`q-${broadcast.questionId}`}
                  initial={{ opacity: 0, scale: 0.97, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex h-full flex-col overflow-hidden rounded-sm border glow-yellow"
                  style={{ borderColor: "#FFCC0040", background: "#0A0A0A" }}
                >
                  <motion.div className="h-1 shrink-0" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6 }}
                    style={{ background: "#FFCC00", transformOrigin: "left" }}
                  />
                  <div className="flex items-center gap-3 border-b px-6 py-3" style={{ borderColor: "#1a1a1a" }}>
                    <span className="text-[10px] uppercase tracking-widest" style={{ color: "#FFCC00", fontFamily: "var(--font-mono)" }}>
                      {roundConfig.short} · {roundConfig.label}
                    </span>
                  </div>
                  <div className="flex flex-1 items-center px-6 py-4">
                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="font-bold leading-snug"
                      style={{ fontFamily: "var(--font-display)", fontSize: currentRound === 3 ? "clamp(18px,2.5vw,36px)" : "clamp(26px,4vw,52px)", color: "#fff", whiteSpace: "pre-wrap" }}
                    >
                      {broadcast.questionText}
                    </motion.p>
                  </div>
                  {/* NEVER show answer on contestant view */}
                  <div className="shrink-0 border-t px-6 py-3" style={{ borderColor: "#1a1a1a" }}>
                    <p className="text-xs" style={{ color: "#444", fontFamily: "var(--font-mono)" }}>
                      Listen carefully · answer verbally when directed or buzz in
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Timer */}
          {(broadcast.timerActive || broadcast.timerSecs > 0) && (
            <div
              className="shrink-0 flex items-center gap-4 rounded-sm border px-5 py-4"
              style={{ borderColor: broadcast.isStealMode ? "#FFCC0040" : "#222", background: broadcast.isStealMode ? "#0f0800" : "#0A0A0A" }}
            >
              {broadcast.isStealMode && (
                <div className="flex items-center gap-2 rounded-sm border px-3 py-1.5" style={{ borderColor: "#FFCC0060", background: "#1a0f00" }}>
                  <Zap size={13} style={{ color: "#FFCC00" }} />
                  <span className="text-xs font-black uppercase tracking-widest" style={{ color: "#FFCC00", fontFamily: "var(--font-display)" }}>
                    STEAL!
                  </span>
                </div>
              )}
              <BroadcastTimer />
            </div>
          )}

          {/* Buzz status (when another team has buzzed) */}
          <AnimatePresence>
            {broadcast.buzzedTeamId && broadcast.buzzedTeamId !== myId && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="shrink-0 flex items-center gap-3 rounded-sm border px-5 py-3"
                style={{ borderColor: "#FFCC0040", background: "#0f0800" }}
              >
                <AlertTriangle size={16} style={{ color: "#FFCC00" }} />
                <span className="text-sm font-bold" style={{ color: "#FFCC00", fontFamily: "var(--font-display)", fontSize: "16px" }}>
                  Another team buzzed in — await host
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── BUZZ BUTTON ── */}
          {isBuzzerRound && (
            <div className="shrink-0">
              <motion.button
                onClick={handleBuzz}
                disabled={!canBuzz}
                whileTap={canBuzz ? { scale: 0.94 } : {}}
                animate={
                  buzzState === "active"
                    ? { scale: [1, 1.02, 1], transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } }
                    : buzzFlash
                      ? { scale: 1.05 }
                      : { scale: 1 }
                }
                className="relative w-full overflow-hidden rounded-sm py-8 font-black uppercase tracking-widest transition-all"
                style={{
                  background: buzzConfig.bg,
                  color: buzzConfig.color,
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(28px, 5vw, 48px)",
                  letterSpacing: "0.1em",
                  boxShadow: buzzConfig.glow,
                  cursor: canBuzz ? "pointer" : "default",
                  transition: "background 0.3s, box-shadow 0.3s",
                }}
              >
                {buzzState === "active" && (
                  <motion.span
                    className="pointer-events-none absolute inset-0"
                    style={{ background: "linear-gradient(105deg,transparent 35%,rgba(255,255,255,0.3) 50%,transparent 65%)", backgroundSize: "300% 100%" }}
                    animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-4">
                  {buzzState === "locked" && <Lock size={28} />}
                  {buzzState === "mybuzz" && <Zap size={28} />}
                  {buzzConfig.text}
                </span>
              </motion.button>
              <p className="mt-2 text-center text-[11px]" style={{ color: "#444", fontFamily: "var(--font-mono)" }}>
                {buzzConfig.sub}
                {buzzState === "active" && " · SPACE to buzz"}
              </p>
            </div>
          )}

          {!isBuzzerRound && (
            <div
              className="shrink-0 rounded-sm border px-5 py-3 text-center"
              style={{ borderColor: "#1e1e1e", background: "#0A0A0A" }}
            >
              <p className="text-sm font-semibold" style={{ color: "#555", fontFamily: "var(--font-display)", fontSize: "15px" }}>
                Answer verbally when directed by the host
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "#333", fontFamily: "var(--font-mono)" }}>
                Buzzer active in Speed Race (R4) and Riddle Round (R5)
              </p>
            </div>
          )}
        </div>

        {/* Right: Leaderboard */}
        <div
          className="flex w-72 shrink-0 flex-col gap-4 overflow-y-auto rounded-sm border p-4"
          style={{ borderColor: "#1a1a1a", background: "rgba(0,0,0,0.4)" }}
        >
          <GroupLeaderboard groupId={myGroupId} teamId={myId} />
        </div>
      </div>
    </div>
  );
}
