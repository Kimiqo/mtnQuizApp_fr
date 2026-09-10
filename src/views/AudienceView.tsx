import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Trophy, RadioTower, Zap, ArrowRight, Star } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ROUND_CONFIG, TEAMS, playSound } from "@/data/seed";
import { GroupDrawCeremony } from "@/components/shared/GroupDrawCeremony";
import { FinalsRevealCeremony } from "@/components/shared/FinalsRevealCeremony";
import PodiumCeremony from "@/components/shared/PodiumCeremony";

function AudienceTimer() {
  const { broadcast } = useApp();
  const { timerSecs, timerActive, timerTotal, timerLabel, isStealMode } = broadcast;
  if (timerSecs === 0 && !timerActive) return null;

  const pct = timerTotal > 0 ? timerSecs / timerTotal : 0;
  const color = isStealMode ? "#FFCC00" : pct > 0.5 ? "#22C55E" : pct > 0.25 ? "#FFCC00" : "#EF4444";
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-2">
      {isStealMode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-sm border px-4 py-1.5 text-center"
          style={{ borderColor: "#FFCC0060", background: "#1a0f00" }}
        >
          <span className="font-black uppercase tracking-widest" style={{ color: "#FFCC00", fontFamily: "var(--font-display)", fontSize: "14px" }}>
            ⚡ STEAL TIME ⚡
          </span>
        </motion.div>
      )}
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="#1e1e1e" strokeWidth="6" />
        <circle
          cx="65" cy="65" r={r} fill="none"
          stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 65 65)"
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s" }}
        />
        <text x="65" y="60" textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="28" fontWeight="900" fontFamily="var(--font-display)">
          {String(Math.floor(timerSecs / 60)).padStart(2, "0")}:{String(timerSecs % 60).padStart(2, "0")}
        </text>
        {timerLabel && (
          <text x="65" y="82" textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="9" fontFamily="var(--font-mono)" letterSpacing="3">
            {timerLabel}
          </text>
        )}
      </svg>
    </div>
  );
}

function AnimatedLeaderboard({ groupId }: { groupId: string }) {
  const { teams, scores, finalsScores, broadcast, activeTeamId } = useApp();
  const groupTeams = teams.filter((t) => t.groupId === groupId);
  const targetScores = groupId === "finals" ? finalsScores : scores;
  const ranked = [...groupTeams].sort(
    (a, b) => (targetScores[b.id]?.total ?? 0) - (targetScores[a.id]?.total ?? 0)
  );

  const activeFloorTeamId = broadcast.buzzedTeamId || activeTeamId;

  return (
    <div className="flex flex-col gap-2">
      {ranked.map((team, idx) => {
        const isFirst = idx === 0;
        const pts = targetScores[team.id]?.total ?? 0;
        // relative width compared to the leader (or 1 if leader has 0)
        const barWidth = ranked[0] && (targetScores[ranked[0].id]?.total ?? 0) > 0
          ? `${Math.round((pts / (targetScores[ranked[0].id]?.total ?? 1)) * 100)}%`
          : "0%";

        const isFloorTeam = team.id === activeFloorTeamId;
        const isFlashTarget = broadcast.flashFeedback?.teamId === team.id;
        const flashType = broadcast.flashFeedback?.type;
        const isCorrect = isFlashTarget && flashType === "correct";
        const isWrong = isFlashTarget && flashType === "wrong";

        return (
          <motion.div
            key={team.id}
            layout
            initial={{ opacity: 0, x: 20 }}
            animate={isFlashTarget ? { opacity: 1, x: 0, scale: [1, 1.05, 1, 1.05, 1] } : { opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: isFlashTarget ? 0 : idx * 0.05, duration: 0.4 }}
            className="relative overflow-hidden rounded-sm border"
            style={{
              borderColor: isCorrect ? "#22c55e" : isWrong ? "#ef4444" : isFloorTeam ? "#FFCC00" : isFirst ? "#FFCC0060" : "#1e1e1e",
              background: isCorrect ? "#22c55e20" : isWrong ? "#ef444420" : isFloorTeam ? "#FFCC0020" : isFirst ? "#0f0e00" : "#0A0A0A",
              minHeight: "54px",
              boxShadow: isCorrect ? "0 0 30px 4px #22c55e40" : isWrong ? "0 0 30px 4px #ef444440" : isFloorTeam ? "0 0 20px 2px #FFCC0040" : "none",
            }}
          >
            {/* Score bar */}
            <motion.div
              className="absolute inset-y-0 left-0"
              animate={{ width: barWidth }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ background: isFirst ? "#FFCC0012" : "#ffffff06" }}
            />
            <div className="relative flex items-center gap-3 px-4 py-3">
              <span
                className="w-7 text-right font-black"
                style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: isFirst ? "#FFCC00" : "#555" }}
              >
                {idx + 1}
              </span>
              {isFirst && <Trophy size={14} style={{ color: "#FFCC00", flexShrink: 0 }} />}
              <span
                className="flex-1 truncate font-bold"
                style={{ fontFamily: "var(--font-display)", fontSize: "18px", color: isFirst ? "#fff" : "#aaa" }}
              >
                {team.name}
              </span>
              <motion.span
                layout
                className="font-black tabular-nums"
                style={{ fontFamily: "var(--font-display)", fontSize: "28px", color: isFirst ? "#FFCC00" : "#fff" }}
              >
                {pts}
              </motion.span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Bracket Components ──

function GroupCard({ groupId, isActive, onClick }: { groupId: string; isActive?: boolean; onClick?: () => void; }) {
  const { groups, teams, scores, finalsScores } = useApp();
  const group = groups.find((g) => g.id === groupId)!;
  const groupTeams = teams.filter((t) => (t.originalGroupId || t.groupId) === groupId);
  const targetScores = groupId === "finals" ? finalsScores : scores;
  const ranked = [...groupTeams].sort((a, b) => (targetScores[b.id]?.total ?? 0) - (targetScores[a.id]?.total ?? 0));

  return (
    <motion.div
      layout
      className="rounded-sm border transition-colors"
      style={{
        borderColor: isActive ? "#FFCC0060" : "#222",
        background: isActive ? "#0f0e00" : "#0A0A0A",
        boxShadow: isActive ? "0 0 30px 4px #FFCC0015" : "none",
      }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between border-b px-4 py-2.5" style={{ borderColor: isActive ? "#FFCC0030" : "#1e1e1e" }}>
        <span className="font-black uppercase tracking-widest" style={{ fontFamily: "var(--font-display)", fontSize: "13px", color: isActive ? "#FFCC00" : "#888" }}>
          {group.name}
        </span>
        {isActive && (
          <span className="flex items-center gap-1 rounded-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest"
            style={{ background: "#FFCC0015", color: "#FFCC00", border: "1px solid #FFCC0030", fontFamily: "var(--font-mono)" }}>
            <RadioTower size={8} />Active
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1.5">
        {ranked.map((team, idx) => (
          <div key={team.id} className="flex items-center gap-2">
            <span className="w-4 text-right text-[10px] font-semibold" style={{ color: idx === 0 ? "#FFCC00" : "#444", fontFamily: "var(--font-mono)" }}>{idx + 1}</span>
            <span className="flex-1 truncate text-xs font-semibold" style={{ color: idx === 0 ? "#fff" : "#666" }}>{team.name}</span>
            <span className="text-xs font-black tabular-nums" style={{ color: idx === 0 ? "#FFCC00" : "#555", fontFamily: "var(--font-display)", fontSize: "14px" }}>
              {targetScores[team.id]?.total ?? 0}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function BracketConnector({ side }: { side: "left" | "right" }) {
  return (
    <div className="flex items-center justify-center">
      <ArrowRight size={20} style={{ color: "#FFCC0060", transform: side === "right" ? "rotate(180deg)" : "none" }} />
    </div>
  );
}

function GrandFinalBox() {
  const { groups, teams, scores } = useApp();
  const winners = groups.filter(g => g.id !== "finals").map((g) => {
    const groupTeams = teams.filter((t) => (t.originalGroupId || t.groupId) === g.id);
    if (groupTeams.length === 0) return null;
    return groupTeams.reduce((top, t) => ((scores[t.id]?.total ?? 0) > (scores[top.id]?.total ?? 0) ? t : top), groupTeams[0]);
  }).filter(Boolean) as import("@/types").Team[];
  const allZero = winners.every((w) => (scores[w.id]?.total ?? 0) === 0);

  return (
    <div className="glow-yellow flex flex-col rounded-sm border" style={{ borderColor: "#FFCC0060", background: "#0f0e00", minWidth: "160px" }}>
      <div className="flex items-center justify-center gap-2 border-b px-4 py-3" style={{ borderColor: "#FFCC0030" }}>
        <Trophy size={14} style={{ color: "#FFCC00" }} />
        <span className="font-black uppercase tracking-widest" style={{ fontFamily: "var(--font-display)", fontSize: "12px", color: "#FFCC00" }}>Grand Final</span>
      </div>
      <div className="flex flex-col gap-2 p-3">
        {winners.map((w, i) => (
          <div key={w.id} className="flex items-center gap-2">
            <Star size={10} style={{ color: "#FFCC0060", flexShrink: 0 }} />
            <span className="truncate text-[11px] font-semibold" style={{ color: allZero ? "#333" : "#fff" }}>
              {allZero ? `G${i + 1} Winner` : w.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AudienceView() {
  const navigate = useNavigate();
  const { logout, broadcast, currentRound, groups, hostGroupId, teams, scores } = useApp();
  const [tab, setTab] = useState<"quiz" | "scoreboard">("quiz");
  const roundConfig = ROUND_CONFIG[currentRound];
  const buzzedTeam = teams.find(t => t.id === broadcast.buzzedTeamId);

  // Sound effect for flash feedback
  useEffect(() => {
    if (broadcast.flashFeedback) {
      playSound(broadcast.flashFeedback.type);
    }
  }, [broadcast.flashFeedback]);

  if (broadcast.drawPhase === "revealing_finals") {
    return (
      <div className="flex h-screen w-full bg-black">
        <FinalsRevealCeremony />
      </div>
    );
  }

  if (broadcast.drawPhase === "podium_reveal") {
    return (
      <div className="flex h-screen w-full bg-black">
        <PodiumCeremony />
      </div>
    );
  }

  if (broadcast.drawPhase !== "done") {
    return (
      <div className="flex h-screen w-full items-center justify-center p-8 bg-black">
        <GroupDrawCeremony />
      </div>
    );
  }

  // Auto-pick the group with highest activity (most points total)
  const activeGroup = groups.find((g) => g.id === hostGroupId) ?? groups[0];

  return (
    <div
      className="noise-bg relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% -5%, #1a1200 0%, #030303 55%)" }}
    >
      {/* Top light bar */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
        style={{ width: "80%", height: "2px", background: "#FFCC00", boxShadow: "0 0 160px 100px #FFCC0015" }}
      />

      {/* Grid texture */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(#ffffff03 1px,transparent 1px),linear-gradient(90deg,#ffffff03 1px,transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* ── Header ── */}
      <header
        className="relative z-10 flex shrink-0 items-center justify-between border-b px-8 py-4"
        style={{ borderColor: "#1a1a1a", background: "rgba(0,0,0,0.85)" }}
      >
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded font-black text-black"
            style={{ background: "#FFCC00", fontFamily: "var(--font-display)", fontSize: "12px", boxShadow: "0 0 30px 8px #FFCC0030" }}
          >
            MTN
          </div>
          <div>
            <p className="font-black uppercase tracking-widest" style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "#fff", lineHeight: 1 }}>
              MTN GHANA AI QUIZ CHAMPIONSHIP
            </p>
            <p className="text-[11px] tracking-wider uppercase" style={{ color: "#555", fontFamily: "var(--font-mono)" }}>
              {activeGroup.name} · {roundConfig.label}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Tab toggle */}
          <div className="flex rounded-sm border overflow-hidden" style={{ borderColor: "#333" }}>
            {([["quiz", "Live Quiz"], ["scoreboard", "Scoreboard"]] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-all"
                style={{
                  background: tab === key ? "#FFCC0015" : "#0A0A0A",
                  color: tab === key ? "#FFCC00" : "#555",
                  fontFamily: "var(--font-mono)",
                  borderRight: key === "quiz" ? "1px solid #333" : "none",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <RadioTower size={14} style={{ color: "#EF4444" }} />
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: "#EF4444", fontFamily: "var(--font-mono)" }}>
              Live
            </span>
          </div>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="flex h-8 w-8 items-center justify-center rounded-sm border transition-colors hover:border-red-500/40 hover:text-red-400"
            style={{ borderColor: "#333", color: "#555" }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* ── Main body ── */}
      {tab === "quiz" ? (
        <div className="relative z-10 flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden gap-6 p-6">
          {/* Left: Question area */}
          <div className="flex flex-[3] flex-col gap-4 min-h-0">
            {/* Round badge */}
            <div className="flex items-center gap-3">
              <div
                className="rounded-sm border px-4 py-1.5"
                style={{ borderColor: "#FFCC0040", background: "#0f0e00" }}
              >
                <span
                  className="font-black uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-display)", fontSize: "14px", color: "#FFCC00", letterSpacing: "0.2em" }}
                >
                  {roundConfig.short} — {roundConfig.label}
                </span>
              </div>
            </div>

            {/* Question card */}
            <div className="flex flex-1 flex-col min-h-0">
              <AnimatePresence mode="wait">
                {!broadcast.questionText || broadcast.isShuffling ? (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-1 items-center justify-center rounded-sm border"
                    style={{ borderColor: "#1a1a1a", background: "#080808" }}
                  >
                    <div className="text-center">
                      {broadcast.isShuffling ? (
                        <p className="slot-flicker font-black uppercase" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,5vw,60px)", color: "#FFCC00" }}>
                          Drawing question...
                        </p>
                      ) : (
                        <p className="font-black uppercase" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px,4vw,52px)", color: "#222" }}>
                          Awaiting Question
                        </p>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`q-${broadcast.questionId}`}
                    initial={{ opacity: 0, scale: 0.97, y: 14 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className={`scanline relative flex flex-1 flex-col overflow-hidden rounded-sm border min-h-0 ${!broadcast.flashFeedback ? "glow-yellow" : ""}`}
                    style={{ 
                      borderColor: broadcast.flashFeedback?.type === "correct" ? "#22c55e" : broadcast.flashFeedback?.type === "wrong" ? "#ef4444" : "#FFCC0050", 
                      background: broadcast.flashFeedback?.type === "correct" ? "#22c55e15" : broadcast.flashFeedback?.type === "wrong" ? "#ef444415" : "#0A0A0A",
                      boxShadow: broadcast.flashFeedback?.type === "correct" ? "0 0 80px 16px #22c55e30" : broadcast.flashFeedback?.type === "wrong" ? "0 0 80px 16px #ef444430" : undefined
                    }}
                  >
                    <motion.div className="h-1.5 shrink-0" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.7 }}
                      style={{ background: broadcast.flashFeedback?.type === "correct" ? "#22c55e" : broadcast.flashFeedback?.type === "wrong" ? "#ef4444" : "#FFCC00", transformOrigin: "left" }}
                    />
                    <div className="flex flex-1 flex-col px-6 md:px-10 py-6 md:py-8 overflow-y-auto min-h-0">
                      <div className="my-auto w-full shrink-0">
                        <motion.p
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="font-bold leading-snug"
                          style={{ fontFamily: "var(--font-display)", fontSize: currentRound === 3 ? "clamp(22px,3vw,40px)" : "clamp(28px,4.5vw,58px)", color: "#fff", whiteSpace: "pre-wrap" }}
                        >
                          {broadcast.questionText}
                        </motion.p>
                      </div>
                    </div>
                    {/* NEVER show answer/explanation on audience view */}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Buzzed team display */}
            <AnimatePresence>
              {buzzedTeam && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: broadcast.flashFeedback?.teamId === buzzedTeam.id ? [1, 1.05, 1, 1.05, 1] : 1,
                    transition: { duration: broadcast.flashFeedback ? 0.4 : 0.4, ease: [0.22, 1, 0.36, 1] } 
                  }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="shrink-0 flex items-center justify-center gap-4 rounded-sm border py-5"
                  style={{
                    borderColor: broadcast.flashFeedback?.teamId === buzzedTeam.id 
                                 ? (broadcast.flashFeedback.type === "correct" ? "#22c55e" : "#ef4444") 
                                 : "#FFCC0060",
                    background: broadcast.flashFeedback?.teamId === buzzedTeam.id
                                 ? (broadcast.flashFeedback.type === "correct" ? "#22c55e15" : "#ef444415")
                                 : "#0f0e00",
                    boxShadow: broadcast.flashFeedback?.teamId === buzzedTeam.id
                                 ? (broadcast.flashFeedback.type === "correct" ? "0 0 80px 16px #22c55e30" : "0 0 80px 16px #ef444430")
                                 : "0 0 60px 8px #FFCC0020",
                  }}
                >
                  <Zap size={24} style={{ color: broadcast.flashFeedback?.teamId === buzzedTeam.id ? (broadcast.flashFeedback.type === "correct" ? "#4ade80" : "#f87171") : "#FFCC00" }} />
                  <div className="text-center">
                    <p className="text-[11px] uppercase tracking-widest" style={{ color: broadcast.flashFeedback?.teamId === buzzedTeam.id ? (broadcast.flashFeedback.type === "correct" ? "#4ade8080" : "#f8717180") : "#FFCC0080", fontFamily: "var(--font-mono)" }}>
                      Buzzed In
                    </p>
                    <p className="font-black uppercase tracking-wide" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px,4vw,44px)", color: broadcast.flashFeedback?.teamId === buzzedTeam.id ? (broadcast.flashFeedback.type === "correct" ? "#4ade80" : "#f87171") : "#FFCC00" }}>
                      {buzzedTeam.name}
                    </p>
                  </div>
                  <Zap size={24} style={{ color: "#FFCC00" }} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Timer + Leaderboard */}
          <div className="flex w-full md:w-80 shrink-0 flex-col gap-4 overflow-y-visible md:overflow-y-auto border-t md:border-t-0 md:border-l p-4" style={{ borderColor: "#222" }}>
            {/* Timer */}
            {(broadcast.timerActive || broadcast.timerSecs > 0) && (
              <div
                className="flex justify-center rounded-sm border py-4"
                style={{ borderColor: broadcast.isStealMode ? "#FFCC0050" : "#222", background: broadcast.isStealMode ? "#0f0800" : "#0A0A0A" }}
              >
                <AudienceTimer />
              </div>
            )}

            {/* Leaderboard */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Trophy size={14} style={{ color: "#FFCC00" }} />
                <p className="font-black uppercase tracking-widest" style={{ fontFamily: "var(--font-display)", fontSize: "14px", color: "#FFCC00" }}>
                  {activeGroup.name} Standings
                </p>
              </div>
              <AnimatedLeaderboard groupId={activeGroup.id} />
            </div>

            {/* All-groups mini summary */}
            <div className="flex flex-col gap-1.5 mt-2">
              <p className="text-[10px] uppercase tracking-widest" style={{ color: "#444", fontFamily: "var(--font-mono)" }}>
                All Groups — Top Score
              </p>
              {groups.filter(g => g.id !== "finals").map((g) => {
                const top = [...teams.filter((t) => (t.originalGroupId || t.groupId) === g.id)]
                  .sort((a, b) => (scores[b.id]?.total ?? 0) - (scores[a.id]?.total ?? 0))[0];
                const pts = top ? (scores[top.id]?.total ?? 0) : 0;
                return (
                  <div key={g.id} className="flex items-center gap-2 rounded-sm border px-3 py-1.5" style={{ borderColor: "#1e1e1e", background: "#080808" }}>
                    <span className="text-[11px]" style={{ color: "#555", fontFamily: "var(--font-mono)" }}>{g.name}</span>
                    <span className="flex-1 truncate text-[11px] font-semibold" style={{ color: "#888" }}>{top?.name ?? "—"}</span>
                    <span className="font-black tabular-nums" style={{ fontFamily: "var(--font-display)", fontSize: "16px", color: "#FFCC00" }}>{pts}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ── Scoreboard Tab ── */
        <div className="relative z-10 flex flex-1 flex-col gap-6 overflow-y-auto p-6">
          
          <div className="shrink-0 mb-6">
            <p className="mb-4 flex items-center justify-center gap-2 text-sm uppercase tracking-widest" style={{ color: "#FFCC00", fontFamily: "var(--font-mono)" }}>
              <Trophy size={14} /> Tournament Bracket
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 max-w-4xl mx-auto w-full">
              {/* Left groups */}
              <div className="flex flex-col gap-3 w-full max-w-[280px] md:w-72">
                {groups.filter(g => g.id !== "finals").map((g) => (
                  <GroupCard key={g.id} groupId={g.id} isActive={activeGroup.id === g.id} />
                ))}
              </div>
              <div className="rotate-90 md:rotate-0 my-2 md:my-0">
                <BracketConnector side="left" />
              </div>
              <div className="w-full max-w-[280px] md:w-56">
                <GrandFinalBox />
              </div>
            </div>
          </div>

          <div className="h-px shrink-0 w-full mb-2 max-w-5xl mx-auto" style={{ background: "#1a1a1a" }} />

          <div className="max-w-5xl mx-auto w-full flex flex-col gap-8">
            {groups.filter(g => g.id !== "finals").map((g) => {
            const groupTeams = teams.filter((t) => (t.originalGroupId || t.groupId) === g.id);
            const ranked = [...groupTeams].sort(
              (a, b) => (scores[b.id]?.total ?? 0) - (scores[a.id]?.total ?? 0)
            );
            const roundKeys = ["r1", "r2", "r3", "r4"] as const;

            return (
              <div key={g.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Trophy size={16} style={{ color: "#FFCC00" }} />
                  <h2 className="font-black uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-display)", fontSize: "18px", color: "#FFCC00" }}
                  >
                    {g.name}
                  </h2>
                </div>

                <div className="overflow-hidden rounded-sm border" style={{ borderColor: "#222" }}>
                  {/* Table header */}
                  <div
                    className="grid border-b px-5 py-3"
                    style={{
                      borderColor: "#1e1e1e",
                      background: "#080808",
                      gridTemplateColumns: "48px 1fr repeat(5, 72px) 90px",
                    }}
                  >
                    {["#", "Team", "R1", "R2", "R3", "R4", "R5", "Total"].map((h) => (
                      <span
                        key={h}
                        className="text-center text-[11px] font-semibold uppercase tracking-widest first:text-left"
                        style={{ color: "#555", fontFamily: "var(--font-mono)" }}
                      >
                        {h}
                      </span>
                    ))}
                  </div>

                  {/* Rows */}
                  {ranked.map((team, idx) => {
                    const score = scores[team.id] ?? { total: 0, byRound: { r1: 0, r2: 0, r3: 0, r4: 0, r5: 0 } };
                    const isFirst = idx === 0 && score.total > 0;
                    return (
                      <motion.div
                        key={team.id}
                        layout
                        className="grid border-b px-5 py-4 transition-colors last:border-0"
                        style={{
                          borderColor: "#141414",
                          background: isFirst ? "#0f0e00" : idx % 2 === 0 ? "#0A0A0A" : "#080808",
                          gridTemplateColumns: "48px 1fr repeat(5, 72px) 90px",
                        }}
                      >
                        <span
                          className="font-black"
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "22px",
                            color: isFirst ? "#FFCC00" : "#444",
                          }}
                        >
                          {idx + 1}
                        </span>
                        <span
                          className="flex items-center gap-2 font-semibold"
                          style={{ color: isFirst ? "#fff" : "#ccc", fontSize: "16px" }}
                        >
                          {isFirst && <Trophy size={14} style={{ color: "#FFCC00", flexShrink: 0 }} />}
                          {team.name}
                        </span>
                        {roundKeys.map((rk) => (
                          <motion.span
                            key={rk}
                            layout
                            className="text-center tabular-nums"
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "16px",
                              color: (score.byRound[rk] ?? 0) > 0 ? "#aaa" : "#333",
                            }}
                          >
                            {score.byRound[rk] ?? 0}
                          </motion.span>
                        ))}
                        <motion.span
                          layout
                          className="text-center font-black tabular-nums"
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "28px",
                            color: isFirst ? "#FFCC00" : "#fff",
                          }}
                        >
                          {score.total}
                        </motion.span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
}
