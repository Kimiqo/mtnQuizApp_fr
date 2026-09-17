import { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Maximize2, Minimize2, Minus,
  RadioTower, Zap, SkipForward, Lock, AlertTriangle, Trophy,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ROUND_CONFIG } from "@/data/seed";
import type { RoundType, RoundKey } from "@/types";
import { FinalsRevealCeremony } from "@/components/shared/FinalsRevealCeremony";
import RoundOne from "@/components/rounds/RoundOne";
import RoundTwo from "@/components/rounds/RoundTwo";
import RoundThree from "@/components/rounds/RoundThree";
import RoundFour from "@/components/rounds/RoundFour";
import RoundFive from "@/components/rounds/RoundFive";
import RoundTiebreaker from "@/components/rounds/RoundTiebreaker";

const ROUND_KEYS: Record<RoundType, RoundKey | "tb"> = { 1: "r1", 2: "r2", 3: "r3", 4: "r4", 5: "r5", 6: "tb" };

// ── Buzz Control Panel (host) ─────────────────────────────────────────────────
function BuzzPanel() {
  const {
    broadcast, teams, hostGroupId,
    selectBuzzedTeam, activateBonus, lockoutTeam, passQuestion, awardBuzzedTeam, clearBuzzState,
    currentRound,
  } = useApp();

  const { buzzedTeamId, lockedOutTeamIds, isStealMode, isBonusMode } = broadcast;
  const isBuzzerRound = currentRound === 4 || currentRound === 6 || isBonusMode;
  const buzzedTeam = buzzedTeamId ? teams.find((t) => t.id === buzzedTeamId) : null;
  const groupTeams = teams.filter((t) => t.groupId === hostGroupId).sort((a, b) => (a.seat || "").localeCompare(b.seat || ""));

  if (!isBuzzerRound) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest" style={{ color: "#FFCC0080", fontFamily: "var(--font-mono)" }}>
          Buzzer Control
        </span>
        {lockedOutTeamIds.length > 0 && (
          <button
            onClick={clearBuzzState}
            className="text-[9px] uppercase tracking-widest transition-opacity hover:opacity-80"
            style={{ color: "#555", fontFamily: "var(--font-mono)" }}
          >
            Reset
          </button>
        )}
      </div>

      {/* Team Selection Grid (Host Manual Selection) */}
      {!buzzedTeam && (
        <div className="grid grid-cols-2 gap-2">
          {groupTeams.map((team) => {
            const isLockedOut = lockedOutTeamIds.includes(team.id);
            return (
              <button
                key={team.id}
                onClick={() => selectBuzzedTeam(team.id)}
                disabled={isLockedOut}
                className="flex items-center justify-center rounded-sm py-2 px-1 text-[10px] font-bold uppercase transition-all"
                style={{
                  background: isLockedOut ? "#1a0a0a" : "#22C55E15",
                  border: `1px solid ${isLockedOut ? "#EF444430" : "#22C55E40"}`,
                  color: isLockedOut ? "#EF444460" : "#22C55E",
                  opacity: isLockedOut ? 0.5 : 1,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {team.name}
              </button>
            );
          })}
        </div>
      )}



      {/* Buzzed-in alert */}
      <AnimatePresence>
        {buzzedTeam && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col gap-2 rounded-sm border p-3"
            style={{ borderColor: "#FFCC0060", background: "#0f0e00", boxShadow: "0 0 30px 4px #FFCC0015" }}
          >
            <div className="flex items-center gap-2">
              <Zap size={14} style={{ color: "#FFCC00" }} />
              <span className="text-[10px] uppercase tracking-widest" style={{ color: "#FFCC0080", fontFamily: "var(--font-mono)" }}>
                Buzzed In
              </span>
            </div>
            <p className="font-black uppercase" style={{ fontFamily: "var(--font-display)", fontSize: "15px", color: "#FFCC00" }}>
              {buzzedTeam.name}
            </p>

            {/* Award points buttons */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((pts) => (
                <button
                  key={pts}
                  onClick={() => awardBuzzedTeam(pts)}
                  className="flex flex-1 items-center justify-center rounded-sm py-1.5 text-xs font-black transition-opacity hover:opacity-80"
                  style={{ background: "#FFCC00", color: "#000", fontFamily: "var(--font-display)", fontSize: "13px" }}
                >
                  +{pts}
                </button>
              ))}
            </div>

            {/* Pass / Lockout */}
            <div className="flex gap-2">
              <button
                onClick={passQuestion}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-sm border py-2 text-[11px] font-bold uppercase tracking-wider transition-colors hover:border-orange-400/60 hover:text-orange-400"
                style={{ borderColor: "#333", color: "#888", fontFamily: "var(--font-mono)" }}
              >
                <SkipForward size={11} />
                Pass
              </button>
              <button
                onClick={() => lockoutTeam(buzzedTeamId!)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-sm border py-2 text-[11px] font-bold uppercase tracking-wider transition-colors hover:border-red-500/60 hover:text-red-400"
                style={{ borderColor: "#333", color: "#888", fontFamily: "var(--font-mono)" }}
              >
                <Lock size={11} />
                Lockout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Steal mode indicator */}
      {isStealMode && !buzzedTeam && (
        <div
          className="flex items-center gap-2 rounded-sm border px-3 py-2"
          style={{ borderColor: "#FFCC0050", background: "#0f0800" }}
        >
          <AlertTriangle size={12} style={{ color: "#FFCC00" }} />
          <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "#FFCC00", fontFamily: "var(--font-mono)" }}>
            Bonus mode active
          </span>
        </div>
      )}

      {/* Locked-out teams */}
      {lockedOutTeamIds.length > 0 && (
        <div className="flex flex-col gap-1 mt-2">
          <span className="text-[9px] uppercase tracking-widest" style={{ color: "#555", fontFamily: "var(--font-mono)" }}>
            Locked out
          </span>
          {lockedOutTeamIds.map((id) => {
            const t = teams.find((x) => x.id === id);
            return (
              <div key={id} className="flex items-center gap-2 rounded-sm border px-2 py-1" style={{ borderColor: "#EF444430", background: "#1f0a0a" }}>
                <Lock size={9} style={{ color: "#EF4444" }} />
                <span className="text-[10px] truncate font-semibold" style={{ color: "#EF4444" }}>{t?.name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Score sidebar ─────────────────────────────────────────────────────────────
function ScoreSidebar() {
  const { groups, teams, scores, finalsScores, hostGroupId, setHostGroupId, activeTeamId, setActiveTeamId, currentRound, addPoints, deductPoints, updateBroadcast } = useApp();

  useEffect(() => {
    if (!activeTeamId && hostGroupId) {
      const gTeams = teams.filter(t => t.groupId === hostGroupId);
      if (gTeams.length > 0) {
        setActiveTeamId(gTeams[0].id);
      }
    }
  }, [activeTeamId, hostGroupId, teams, setActiveTeamId]);
  const roundKey = ROUND_KEYS[currentRound];
  const groupTeams = teams.filter((t) => t.groupId === hostGroupId);
  const targetScores = hostGroupId === "finals" ? finalsScores : scores;
  const ranked = [...groupTeams].sort((a, b) => (a.seat || "").localeCompare(b.seat || ""));

  const displayGroups = hostGroupId === "finals" 
    ? groups.filter(g => g.id === "finals")
    : groups.filter(g => g.id !== "finals");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] uppercase tracking-widest" style={{ color: "#FFCC0080", fontFamily: "var(--font-mono)" }}>Active Group</span>
        <select
          value={hostGroupId}
          onChange={(e) => { 
            const newGroupId = e.target.value;
            setHostGroupId(newGroupId); 
            const gTeams = teams.filter(t => t.groupId === newGroupId);
            if (gTeams.length > 0) {
              setActiveTeamId(gTeams[0].id);
            } else {
              setActiveTeamId(null);
            }
          }}
          className="select-custom w-full rounded-sm border px-3 py-2 text-xs font-semibold outline-none"
          style={{ background: "#080808", borderColor: "#333", color: "#fff", fontFamily: "var(--font-body)" }}
        >
          {displayGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        {hostGroupId !== "finals" && displayGroups.length > 0 && (
          <button
            onClick={() => {
              const currentIndex = displayGroups.findIndex(g => g.id === hostGroupId);
              const nextGroup = displayGroups[(currentIndex + 1) % displayGroups.length];
              setHostGroupId(nextGroup.id);
              const gTeams = teams.filter(t => t.groupId === nextGroup.id);
              if (gTeams.length > 0) setActiveTeamId(gTeams[0].id);
            }}
            className="mt-1 w-full rounded-sm border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-[#FFCC0020]"
            style={{ borderColor: "#FFCC0040", color: "#FFCC00", fontFamily: "var(--font-mono)", background: "#0A0A0A" }}
          >
            Next Group →
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] uppercase tracking-widest" style={{ color: "#FFCC0080", fontFamily: "var(--font-mono)" }}>Live Scores</span>
        <div className="flex flex-col gap-1">
          {ranked.map((team) => {
            const isActive = activeTeamId === team.id;
            return (
              <motion.div
                key={team.id}
                layout
                onClick={() => setActiveTeamId(isActive ? null : team.id)}
                className="flex cursor-pointer items-center gap-2 rounded-sm border px-3 py-2 transition-all"
                style={{ borderColor: isActive ? "#FFCC0060" : "#1e1e1e", background: isActive ? "#0f0e00" : "#0A0A0A" }}
              >
                <div className="flex flex-1 flex-col min-w-0">
                  <span className="truncate text-[11px] font-semibold" style={{ color: isActive ? "#FFCC00" : "#aaa" }}>
                    {team.name}
                  </span>
                </div>
                <motion.span layout className="font-black tabular-nums" style={{ fontFamily: "var(--font-display)", fontSize: "18px", color: isActive ? "#FFCC00" : "#fff" }}>
                  {targetScores[team.id]?.total ?? 0}
                </motion.span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {activeTeamId && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-widest" style={{ color: "#FFCC0080", fontFamily: "var(--font-mono)" }}>Award Points</span>
          <div className="grid grid-cols-5 gap-1">
            {[1, 2, 3, 4, 5].map((pts) => (
              <button key={pts} onClick={() => addPoints(activeTeamId, pts, roundKey)}
                className="rounded-sm py-2 text-xs font-black"
                style={{ background: "#FFCC00", color: "#000", fontFamily: "var(--font-display)", fontSize: "14px" }}
              >+{pts}</button>
            ))}
          </div>
          <div className="flex gap-1">
            {[1, 2].map((pts) => (
              <button key={pts} onClick={() => deductPoints(activeTeamId, pts, roundKey)}
                className="flex flex-1 items-center justify-center gap-1 rounded-sm border py-1.5 text-xs transition-colors hover:border-red-500/40 hover:text-red-400"
                style={{ borderColor: "#333", color: "#555", fontFamily: "var(--font-mono)" }}
              >
                <Minus size={10} /> {pts}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {hostGroupId === "finals" && (
        <button
          onClick={() => {
            if (confirm("End the tournament and show the podium?")) {
              updateBroadcast({ drawPhase: "podium_reveal", timerActive: false });
            }
          }}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-sm border px-3 py-3 text-[11px] font-black uppercase tracking-widest transition-all hover:bg-[#FFCC0020]"
          style={{ borderColor: "#FFCC00", color: "#FFCC00", fontFamily: "var(--font-display)", background: "#1a1300" }}
        >
          <Trophy size={14} />
          End Tournament
        </button>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function QuizStageView() {
  const navigate = useNavigate();
  const { currentRound, setCurrentRound, activeTeamId, setActiveTeamId, hostGroupId, teams, updateBroadcast, broadcast } = useApp();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const groupTeams = teams.filter((t) => t.groupId === hostGroupId);



  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLSelectElement || e.target instanceof HTMLInputElement) return;
      if (e.code === "KeyF") { e.preventDefault(); toggleFullscreen(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleFullscreen]);

  return (
    <div
      className="noise-bg relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #161200 0%, #060606 60%)" }}
    >
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
        style={{ width: "70%", height: "1px", background: "#FFCC00", boxShadow: "0 0 100px 60px #FFCC0012" }}
      />

      {/* ── Header ── */}
      <header className="relative z-10 flex shrink-0 items-center justify-between border-b px-5 py-2.5"
        style={{ borderColor: "#1a1a1a", background: "rgba(0,0,0,0.75)" }}
      >
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/host/bracket")}
            className="flex h-8 w-8 items-center justify-center rounded-sm border transition-colors hover:border-yellow-400/30"
            style={{ borderColor: "#333", color: "#555" }}
          >
            <ArrowLeft size={14} />
          </button>
          <div className="flex h-7 w-7 items-center justify-center rounded-sm font-black text-black"
            style={{ background: "#FFCC00", fontFamily: "var(--font-display)", fontSize: "9px" }}
          >MTN</div>
          <div className="flex items-center gap-2">
            <RadioTower size={11} style={{ color: "#EF4444" }} />
            <span className="font-black uppercase tracking-widest" style={{ fontFamily: "var(--font-display)", fontSize: "13px", color: "#FFCC00" }}>
              Host Control
            </span>
            <span style={{ color: "#333" }}>·</span>
            <span className="text-sm font-semibold" style={{ color: "#888", fontFamily: "var(--font-display)" }}>
              {ROUND_CONFIG[currentRound].label}
            </span>
          </div>
        </div>

        <div className="hidden items-center gap-1 lg:flex">
          {([1, 2, 3, 4, 6] as RoundType[]).map((r) => (
            <button key={r} onClick={() => {
              setCurrentRound(r);
              // Clear question and timer from screen so they don't persist across rounds
              updateBroadcast({ questionText: null, questionId: null, timerSecs: 0, timerTotal: 0, timerActive: false, timerLabel: "", buzzedTeamId: null, lockedOutTeamIds: [], isStealMode: false, isBonusMode: false });
            }}
              className="rounded-sm border px-3 py-1 text-xs font-bold uppercase tracking-widest transition-all"
              style={{
                borderColor: currentRound === r ? "#FFCC0080" : "#222",
                background: currentRound === r ? "#0f0e00" : "#0A0A0A",
                color: currentRound === r ? "#FFCC00" : "#555",
                fontFamily: "var(--font-mono)",
              }}
            >{r === 6 ? "TIE-BREAKER" : `R${r}`}</button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => {
            const nextBonus = !broadcast.isBonusMode;
            let lockedOut = [...broadcast.lockedOutTeamIds];
            if (nextBonus && activeTeamId && !lockedOut.includes(activeTeamId)) {
               lockedOut.push(activeTeamId);
            }
            updateBroadcast({ isBonusMode: nextBonus, isStealMode: false, lockedOutTeamIds: nextBonus ? lockedOut : [] });
          }}
            className="flex h-8 items-center justify-center rounded-sm border px-3 transition-colors font-bold tracking-widest text-[10px]"
            style={{ 
              borderColor: broadcast.isBonusMode ? "#FFCC00" : "#333", 
              color: broadcast.isBonusMode ? "#000" : "#555",
              background: broadcast.isBonusMode ? "#FFCC00" : "transparent"
            }} 
            title="Toggle Bonus Mode"
          >
            BONUS
          </button>
          <button onClick={toggleFullscreen}
          className="flex h-8 w-8 items-center justify-center rounded-sm border transition-colors hover:border-yellow-400/30"
          style={{ borderColor: "#333", color: "#555" }} title="Fullscreen (F)"
        >
          {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* ── Sidebar ── */}
        <aside className="flex w-60 shrink-0 flex-col gap-4 overflow-y-auto border-r p-4"
          style={{ borderColor: "#1a1a1a", background: "rgba(0,0,0,0.5)" }}
        >
          {/* Round selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-widest" style={{ color: "#FFCC0080", fontFamily: "var(--font-mono)" }}>Round</span>
            <div className="flex flex-col gap-1">
              {([1, 2, 3, 4] as RoundType[]).map((r) => {
                const rc = ROUND_CONFIG[r];
                return (
                  <button key={r} onClick={() => {
                    setCurrentRound(r);
                    updateBroadcast({ questionText: null, questionId: null, timerSecs: 0, timerTotal: 0, timerActive: false, timerLabel: "", buzzedTeamId: null, lockedOutTeamIds: [], isStealMode: false });
                  }}
                    className="flex items-center gap-2 rounded-sm border px-3 py-2 text-left transition-all"
                    style={{ borderColor: currentRound === r ? "#FFCC0060" : "#1a1a1a", background: currentRound === r ? "#0f0e00" : "transparent" }}
                  >
                    <span className="text-[10px] font-bold" style={{ color: currentRound === r ? "#FFCC00" : "#444", fontFamily: "var(--font-mono)" }}>R{r}</span>
                    <span className="truncate text-[11px] font-semibold" style={{ color: currentRound === r ? "#fff" : "#666" }}>{rc.label}</span>
                  </button>
                );
              })}

              <div className="my-1 h-px" style={{ background: "#1a1a1a" }} />
              
              <button
                onClick={() => {
                  setCurrentRound(6);
                  updateBroadcast({ questionText: null, questionId: null, timerSecs: 0, timerTotal: 0, timerActive: false, timerLabel: "", buzzedTeamId: null, lockedOutTeamIds: [], isStealMode: false, isBonusMode: false });
                }}
                className="flex items-center gap-2 rounded-sm border px-3 py-2 text-left transition-all"
                style={{ borderColor: currentRound === 6 ? "#FFCC0060" : "#1a1a1a", background: currentRound === 6 ? "#0f0e00" : "transparent" }}
              >
                <span className="text-[10px] font-bold" style={{ color: currentRound === 6 ? "#FFCC00" : "#444", fontFamily: "var(--font-mono)" }}>TB</span>
                <span className="truncate text-[11px] font-semibold" style={{ color: currentRound === 6 ? "#fff" : "#666" }}>Tie-Breaker</span>
              </button>
            </div>
          </div>

          {/* Team selector */}
          {(currentRound === 1 || currentRound === 4) && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-widest" style={{ color: "#FFCC0080", fontFamily: "var(--font-mono)" }}>Active Team</span>
              <select
                value={activeTeamId ?? ""}
                onChange={(e) => setActiveTeamId(e.target.value || null)}
                className="select-custom w-full rounded-sm border px-3 py-2 text-xs font-semibold outline-none"
                style={{ background: "#080808", borderColor: "#333", color: activeTeamId ? "#fff" : "#555", fontFamily: "var(--font-body)" }}
              >
                <option value="">— Select team —</option>
                {groupTeams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}

          <div className="h-px" style={{ background: "#1a1a1a" }} />

          {/* Buzz panel (R4/R5 only) */}
          <BuzzPanel />
          {(currentRound === 4 || currentRound === 5) && <div className="h-px" style={{ background: "#1a1a1a" }} />}

          <ScoreSidebar />
        </aside>

        {/* ── Main round area ── */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentRound}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="flex h-full flex-col"
            >
              {currentRound === 1 && <RoundOne />}
              {currentRound === 2 && <RoundTwo />}
              {currentRound === 3 && <RoundThree />}
              {currentRound === 4 && <RoundFive />}
              {currentRound === 6 && <RoundTiebreaker />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
