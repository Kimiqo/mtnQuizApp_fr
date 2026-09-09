import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LogOut, Zap, Trophy, ArrowRight, RadioTower, Star, Shuffle, Play } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ROUND_CONFIG, TEAMS, playSound } from "@/data/seed";
import { GroupDrawCeremony } from "@/components/shared/GroupDrawCeremony";

function GroupCard({
  groupId,
  isActive,
  onClick,
}: {
  groupId: string;
  isActive?: boolean;
  onClick?: () => void;
}) {
  const { groups, teams, scores, broadcast } = useApp();
  const group = groups.find((g) => g.id === groupId)!;
  const groupTeams = teams.filter((t) => (t.originalGroupId || t.groupId) === groupId);
  const ranked = [...groupTeams].sort(
    (a, b) => (scores[b.id]?.total ?? 0) - (scores[a.id]?.total ?? 0)
  );

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
      <div
        className="flex items-center justify-between border-b px-4 py-2.5"
        style={{ borderColor: isActive ? "#FFCC0030" : "#1e1e1e" }}
      >
        <span
          className="font-black uppercase tracking-widest"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "13px",
            color: isActive ? "#FFCC00" : "#888",
          }}
        >
          {group.name}
        </span>
        {isActive && (
          <span
            className="flex items-center gap-1 rounded-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest"
            style={{
              background: "#FFCC0015",
              color: "#FFCC00",
              border: "1px solid #FFCC0030",
              fontFamily: "var(--font-mono)",
            }}
          >
            <RadioTower size={8} />
            Active
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1.5">
        {broadcast.drawPhase !== "done" ? (
          <div className="flex items-center justify-center py-4">
            <span className="text-xs font-semibold" style={{ color: "#444" }}>???</span>
          </div>
        ) : (
          ranked.map((team, idx) => (
            <div key={team.id} className="flex items-center gap-2">
              <span
                className="w-4 text-right text-[10px] font-semibold"
                style={{
                  color: idx === 0 ? "#FFCC00" : "#444",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {idx + 1}
              </span>
              <span
                className="flex-1 truncate text-xs font-semibold"
                style={{ color: idx === 0 ? "#fff" : "#666" }}
              >
                {team.name}
              </span>
              <span
                className="text-xs font-black tabular-nums"
                style={{
                  color: idx === 0 ? "#FFCC00" : "#555",
                  fontFamily: "var(--font-display)",
                  fontSize: "14px",
                }}
              >
                {scores[team.id]?.total ?? 0}
              </span>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

function BracketConnector({ side }: { side: "left" | "right" }) {
  return (
    <div className="flex items-center justify-center">
      <ArrowRight
        size={20}
        style={{
          color: "#FFCC0060",
          transform: side === "right" ? "rotate(180deg)" : "none",
        }}
      />
    </div>
  );
}

function GrandFinalBox({ onStartFinals }: { onStartFinals: () => void }) {
  const { groups, teams, scores, hostGroupId } = useApp();
  const winners = groups.filter(g => g.id !== "finals").map((g) => {
    const groupTeams = teams.filter((t) => (t.originalGroupId || t.groupId) === g.id);
    if (groupTeams.length === 0) return null;
    return groupTeams.reduce(
      (top, t) => ((scores[t.id]?.total ?? 0) > (scores[top.id]?.total ?? 0) ? t : top),
      groupTeams[0]
    );
  }).filter(Boolean) as import("@/types").Team[];
  const allZero = winners.length === 0 || winners.every((w) => (scores[w.id]?.total ?? 0) === 0);
  const isFinalsActive = hostGroupId === "finals";

  return (
    <div
      className="glow-yellow flex flex-col rounded-sm border"
      style={{
        borderColor: isFinalsActive ? "#22C55E60" : "#FFCC0060",
        background: isFinalsActive ? "#0a1f0f" : "#0f0e00",
        minWidth: "160px",
      }}
    >
      <div
        className="flex items-center justify-center gap-2 border-b px-4 py-3"
        style={{ borderColor: isFinalsActive ? "#22C55E30" : "#FFCC0030" }}
      >
        <Trophy size={14} style={{ color: isFinalsActive ? "#22C55E" : "#FFCC00" }} />
        <span
          className="font-black uppercase tracking-widest"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "12px",
            color: isFinalsActive ? "#22C55E" : "#FFCC00",
          }}
        >
          Grand Final
        </span>
        {isFinalsActive && (
          <span className="flex items-center gap-1 rounded-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest"
            style={{ background: "#22C55E15", color: "#22C55E", border: "1px solid #22C55E30", fontFamily: "var(--font-mono)" }}>
            <RadioTower size={8} /> Live
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2 p-3">
        {winners.map((w, i) => (
          <div key={w.id} className="flex items-center gap-2">
            <Star size={10} style={{ color: "#FFCC0060", flexShrink: 0 }} />
            <span
              className="truncate text-[11px] font-semibold"
              style={{ color: allZero ? "#333" : "#fff" }}
            >
              {allZero ? `G${i + 1} Winner` : w.name}
            </span>
          </div>
        ))}
      </div>
      {!isFinalsActive && !allZero && (
        <div className="border-t px-3 py-2" style={{ borderColor: "#FFCC0020" }}>
          <button
            onClick={onStartFinals}
            className="flex w-full items-center justify-center gap-2 rounded-sm py-2 text-[11px] font-black uppercase tracking-widest transition-all hover:opacity-90"
            style={{ background: "#FFCC00", color: "#000", fontFamily: "var(--font-display)" }}
          >
            <Zap size={12} />
            Start Finals
          </button>
        </div>
      )}
    </div>
  );
}

function LiveLeaderboard() {
  const { groups, teams, scores, userRole, hostGroupId, currentTeam, broadcast } = useApp();
  const activeGroupId = userRole === "host" ? hostGroupId : (currentTeam?.groupId ?? "g1");
  const group = groups.find((g) => g.id === activeGroupId)!;
  const groupTeams = teams.filter((t) => (t.originalGroupId || t.groupId) === activeGroupId);
  const ranked = [...groupTeams].sort(
    (a, b) => (scores[b.id]?.total ?? 0) - (scores[a.id]?.total ?? 0)
  );

  const roundKeys = ["r1", "r2", "r3", "r4"] as const;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <RadioTower size={14} style={{ color: "#EF4444" }} />
        <h2
          className="font-black uppercase tracking-widest"
          style={{ fontFamily: "var(--font-display)", fontSize: "16px", color: "#FFCC00" }}
        >
          Live Scoreboard — {group.name}
        </h2>
      </div>

      <div className="overflow-hidden rounded-sm border" style={{ borderColor: "#222" }}>
        {/* Table header */}
        <div
          className="grid border-b px-4 py-2"
          style={{
            borderColor: "#1e1e1e",
            background: "#080808",
            gridTemplateColumns: "40px 1fr repeat(5, 52px) 72px",
          }}
        >
          {["#", "Team", "R1", "R2", "R3", "R4", "R5", "Total"].map((h) => (
            <span
              key={h}
              className="text-center text-[10px] font-semibold uppercase tracking-widest first:text-left"
              style={{ color: "#555", fontFamily: "var(--font-mono)" }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {broadcast.drawPhase !== "done" ? (
          <div className="py-8 text-center text-sm font-semibold uppercase tracking-widest" style={{ color: "#444", fontFamily: "var(--font-mono)" }}>
            Awaiting Draw...
          </div>
        ) : (
          ranked.map((team, idx) => {
            const score = scores[team.id] ?? { total: 0, byRound: { r1: 0, r2: 0, r3: 0, r4: 0, r5: 0 } };
            const isFirst = idx === 0 && score.total > 0;
            return (
              <motion.div
                key={team.id}
                layout
                className="grid border-b px-4 py-3 transition-colors last:border-0"
                style={{
                  borderColor: "#141414",
                  background: isFirst ? "#0f0e00" : idx % 2 === 0 ? "#0A0A0A" : "#080808",
                  gridTemplateColumns: "40px 1fr repeat(5, 52px) 72px",
                }}
              >
                <span
                  className="font-black"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "16px",
                    color: isFirst ? "#FFCC00" : "#444",
                  }}
                >
                  {idx + 1}
                </span>
                <span
                  className="flex items-center gap-2 font-semibold"
                  style={{ color: isFirst ? "#fff" : "#ccc" }}
                >
                  {isFirst && <Trophy size={12} style={{ color: "#FFCC00", flexShrink: 0 }} />}
                  {team.name}
                </span>
                {roundKeys.map((rk) => (
                  <motion.span
                    key={rk}
                    layout
                    className="text-center text-sm tabular-nums"
                    style={{
                      fontFamily: "var(--font-mono)",
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
                    fontSize: "20px",
                    color: isFirst ? "#FFCC00" : "#fff",
                  }}
                >
                  {score.total}
                </motion.span>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function BracketView() {
  const navigate = useNavigate();
  const { userRole, currentTeam, logout, hostGroupId, setHostGroupId, groups, currentRound, resetQuizData, setCurrentRound, updateBroadcast, broadcast } =
    useApp();
  const isHost = userRole === "host" || window.location.pathname.startsWith("/host");
  const displayName = isHost ? "Quiz Host" : currentTeam?.name ?? "";
  const currentRoundConfig = ROUND_CONFIG[currentRound];

  const showDrawCeremony = ["idle", "awaiting", "shuffling", "revealing"].includes(broadcast.drawPhase);

  const handleStartFinals = useCallback(() => {
    if (!confirm("Start the Grand Final? This will switch to the finals question bank.")) return;
    setHostGroupId("finals");
    setCurrentRound(1);
    updateBroadcast({ questionText: null, questionId: null, timerSecs: 0, timerTotal: 0, timerActive: false, timerLabel: "", buzzEnabled: false, buzzedTeamId: null, lockedOutTeamIds: [], isStealMode: false });
    navigate("/host/quiz");
  }, [setHostGroupId, setCurrentRound, updateBroadcast, navigate]);

  return (
    <div
      className="noise-bg relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #161200 0%, #060606 60%)" }}
    >
      {/* Top glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
        style={{
          width: "60%", height: "1px",
          background: "#FFCC00",
          boxShadow: "0 0 80px 50px #FFCC0018",
        }}
      />

      {/* ── Header ── */}
      <header
        className="relative z-10 flex shrink-0 items-center justify-between border-b px-6 py-3"
        style={{ borderColor: "#1a1a1a", background: "rgba(0,0,0,0.7)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-sm font-black text-black"
            style={{
              background: "#FFCC00",
              fontFamily: "var(--font-display)",
              fontSize: "11px",
              letterSpacing: "0.06em",
              boxShadow: "0 0 20px 4px #FFCC0033",
            }}
          >
            MTN
          </div>
          <div>
            <p
              className="text-xs font-bold tracking-widest uppercase"
              style={{ color: "#FFCC00", fontFamily: "var(--font-display)" }}
            >
              MTN Ghana AI Quiz Championship
            </p>
            <p
              className="text-[10px] tracking-wider"
              style={{ color: "#555", fontFamily: "var(--font-mono)" }}
            >
              {isHost ? "Host Dashboard" : `Logged in as: ${displayName}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Active round badge */}
          <div
            className="hidden items-center gap-2 rounded-sm border px-3 py-1.5 sm:flex"
            style={{ borderColor: "#333", background: "#0D0D0D" }}
          >
            <RadioTower size={11} style={{ color: "#EF4444" }} />
            <span
              className="text-[10px] tracking-widest uppercase"
              style={{ color: "#888", fontFamily: "var(--font-mono)" }}
            >
              {currentRoundConfig.short}:
            </span>
            <span
              className="text-sm font-bold"
              style={{ color: "#fff", fontFamily: "var(--font-display)" }}
            >
              {currentRoundConfig.label}
            </span>
          </div>

          {isHost && (
            <button
              onClick={resetQuizData}
              className="hidden sm:flex items-center gap-1 rounded-sm border px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors hover:border-red-500/60 hover:text-red-400"
              style={{ borderColor: "#333", color: "#555", fontFamily: "var(--font-mono)" }}
              title="Reset Quiz Data"
            >
              Reset Data
            </button>
          )}

          {isHost && !showDrawCeremony && (
            <button
              onClick={() => updateBroadcast({ drawPhase: "idle", drawRevealedGroups: 0 })}
              className="hidden sm:flex items-center gap-1.5 rounded-sm border px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors hover:border-yellow-400/40"
              style={{ borderColor: "#333", color: "#888", fontFamily: "var(--font-mono)" }}
            >
              <Shuffle size={11} />
              Redraw Groups
            </button>
          )}

          {isHost && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/host/quiz")}
              className="flex items-center gap-2 rounded-sm px-4 py-2 font-black uppercase tracking-widest"
              style={{
                background: "#FFCC00",
                color: "#000",
                fontFamily: "var(--font-display)",
                fontSize: "13px",
                letterSpacing: "0.12em",
                boxShadow: "0 0 20px 4px #FFCC0025",
              }}
            >
              <Zap size={13} />
              Quiz Stage
            </motion.button>
          )}

          <button
            onClick={() => { logout(); navigate("/"); }}
            className="flex h-8 w-8 items-center justify-center rounded-sm border transition-colors hover:border-red-500/40 hover:text-red-400"
            style={{ borderColor: "#333", color: "#555" }}
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="relative z-10 flex flex-1 flex-col gap-5 overflow-y-auto p-5">
        {/* Draw Ceremony Overlay */}
        <AnimatePresence>
          {showDrawCeremony && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-8"
              style={{ background: "rgba(0,0,0,0.9)" }}
            >
              <GroupDrawCeremony />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Group tabs (host only) */}
        {isHost && (
          <div className="flex gap-2">
            {groups.filter(g => g.id !== "finals").map((g) => (
              <button
                key={g.id}
                onClick={() => setHostGroupId(g.id)}
                className="rounded-sm border px-3 py-1.5 text-xs font-semibold uppercase tracking-widest transition-all"
                style={{
                  borderColor: hostGroupId === g.id ? "#FFCC0060" : "#222",
                  background: hostGroupId === g.id ? "#0f0e00" : "#0A0A0A",
                  color: hostGroupId === g.id ? "#FFCC00" : "#555",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {g.name}
              </button>
            ))}
            {hostGroupId === "finals" && (
              <span
                className="flex items-center gap-1 rounded-sm border px-3 py-1.5 text-xs font-bold uppercase tracking-widest"
                style={{ borderColor: "#22C55E60", background: "#0a1f0f", color: "#22C55E", fontFamily: "var(--font-mono)" }}
              >
                <Trophy size={10} /> Finals
              </span>
            )}
          </div>
        )}

        {/* ── Tournament Bracket ── */}
        <div className="shrink-0">
          <p
            className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-widest"
            style={{ color: "#FFCC00", fontFamily: "var(--font-mono)" }}
          >
            <Trophy size={11} />
            Tournament Bracket
          </p>

          <div className="flex items-center justify-center gap-8 max-w-4xl mx-auto">
            {/* Left groups */}
            <div className="flex flex-col gap-3 w-72">
              {groups.filter(g => g.id !== "finals").map((g) => (
                <GroupCard 
                  key={g.id} 
                  groupId={g.id} 
                  isActive={isHost ? hostGroupId === g.id : currentTeam?.groupId === g.id} 
                  onClick={() => isHost && setHostGroupId(g.id)} 
                />
              ))}
            </div>

            <BracketConnector side="left" />

            <div className="w-56">
              <GrandFinalBox onStartFinals={handleStartFinals} />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px shrink-0" style={{ background: "#1a1a1a" }} />

        {/* ── Live Leaderboard ── */}
        <div className="flex-1">
          <LiveLeaderboard />
        </div>
      </div>
    </div>
  );
}
