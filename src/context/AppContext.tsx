import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import type {
  RoundType,
  RoundKey,
  Team,
  Group,
  QuestionBank,
  TeamScore,
  BroadcastState,
} from "@/types";
import {
  TEAMS,
  GROUPS,
  HOST_ID,
  HOST_PASSWORD,
  INITIAL_QUESTIONS,
  INITIAL_BROADCAST,
  STEAL_TIMER_SECS,
  buildInitialScores,
  playSound,
} from "@/data/seed";

interface AppContextType {
  // ── Auth ──────────────────────────────────────────────────────────────────
  currentTeam: Team | null;
  userRole: "host" | "team" | "audience" | null;
  login: (teamId: string, password: string) => boolean;
  loginAudience: () => void;
  logout: () => void;

  // ── Navigation ────────────────────────────────────────────────────────────

  // ── Data ──────────────────────────────────────────────────────────────────
  teams: Team[];
  groups: Group[];
  currentGroup: Group | null;
  hostGroupId: string;
  setHostGroupId: (id: string) => void;

  // ── Quiz state ────────────────────────────────────────────────────────────
  currentRound: RoundType;
  setCurrentRound: (r: RoundType) => void;
  activeTeamId: string | null;
  setActiveTeamId: (id: string | null) => void;
  advanceToNextTeam: () => void;

  // ── Questions ─────────────────────────────────────────────────────────────
  questions: QuestionBank;
  markR1Used: (id: number) => void;
  markR3Used: (id: number) => void;
  markR4Used: (id: number) => void;
  markR5Used: (id: number) => void;
  resetQuestions: () => void;

  // ── Scores ────────────────────────────────────────────────────────────────
  scores: Record<string, TeamScore>;
  addPoints: (teamId: string, points: number, round: RoundKey) => void;
  deductPoints: (teamId: string, points: number, round: RoundKey) => void;

  // ── Broadcast state (host writes → contestant/audience read) ─────────────
  broadcast: BroadcastState;
  updateBroadcast: (update: Partial<BroadcastState>) => void;

  // ── Timer actions (host-controlled) ──────────────────────────────────────
  startTimer: (secs: number, label: string) => void;
  stopTimer: () => void;
  resetTimer: (secs: number) => void;

  // ── Buzz mechanics ────────────────────────────────────────────────────────
  enableBuzz: () => void;
  disableBuzz: () => void;
  teamBuzz: (teamId: string) => void;   // called from ContestantView
  lockoutTeam: (teamId: string) => void;
  passQuestion: () => void;             // lockout buzzed team, start steal timer
  awardBuzzedTeam: (pts: number) => void;
  clearBuzzState: () => void;
  resetQuizData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

function useSharedState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setSharedState = useCallback((value: React.SetStateAction<T>) => {
    setState((prev) => {
      const nextValue = value instanceof Function ? value(prev) : value;
      try {
        window.localStorage.setItem(key, JSON.stringify(nextValue));
      } catch (e) {
        console.error("Storage error", e);
      }
      return nextValue;
    });
  }, [key]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setState(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  return [state, setSharedState] as const;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentTeam, setCurrentTeam] = useSharedState<Team | null>("mtn_currentTeam", null);
  const [userRole, setUserRole] = useSharedState<"host" | "team" | "audience" | null>("mtn_userRole", null);
  
  const [hostGroupId, setHostGroupId] = useSharedState("mtn_hostGroupId", "g1");
  const [currentRound, setCurrentRound] = useSharedState<RoundType>("mtn_currentRound", 1);
  const [activeTeamId, setActiveTeamId] = useSharedState<string | null>("mtn_activeTeamId", null);

  useEffect(() => {
    if (userRole === "host" || userRole === "audience") {
      const group = GROUPS.find((g) => g.id === hostGroupId);
      if (group && (!activeTeamId || !group.teamIds.includes(activeTeamId))) {
        setActiveTeamId(group.teamIds[0] ?? null);
      }
    }
  }, [hostGroupId, activeTeamId, userRole, setActiveTeamId]);

  const advanceToNextTeam = useCallback(() => {
    if (!activeTeamId) return;
    const groupIndex = GROUPS.findIndex(g => g.id === hostGroupId);
    if (groupIndex === -1) return;
    const group = GROUPS[groupIndex];
    const currentIndex = group.teamIds.indexOf(activeTeamId);
    if (currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % group.teamIds.length;
    if (nextIndex === 0) {
      const nextGroupIndex = (groupIndex + 1) % GROUPS.length;
      const nextGroup = GROUPS[nextGroupIndex];
      setHostGroupId(nextGroup.id);
      setActiveTeamId(nextGroup.teamIds[0] ?? null);
    } else {
      setActiveTeamId(group.teamIds[nextIndex]);
    }
  }, [activeTeamId, hostGroupId, setHostGroupId, setActiveTeamId]);

  const [questions, setQuestions] = useSharedState<QuestionBank>("mtn_questions", INITIAL_QUESTIONS);
  const [scores, setScores] = useSharedState<Record<string, TeamScore>>("mtn_scores", buildInitialScores());
  const [broadcast, setBroadcast] = useSharedState<BroadcastState>("mtn_broadcast", { ...INITIAL_BROADCAST });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Derived
  const currentGroup = useMemo(() => {
    if (currentTeam) return GROUPS.find((g) => g.id === currentTeam.groupId) ?? null;
    if (userRole === "host" || userRole === "audience")
      return GROUPS.find((g) => g.id === hostGroupId) ?? null;
    return null;
  }, [currentTeam, userRole, hostGroupId]);

  // ── Auth ────────────────────────────────────────────────────────────────
  const login = useCallback((teamId: string, password: string): boolean => {
    if (teamId === HOST_ID && password === HOST_PASSWORD) {
      setUserRole("host");
      setCurrentTeam(null);
      return true;
    }
    const team = TEAMS.find((t) => t.id === teamId);
    if (team && password === team.password) {
      setCurrentTeam(team);
      setUserRole("team");
      return true;
    }
    return false;
  }, []);

  const loginAudience = useCallback(() => {
    setUserRole("audience");
    setCurrentTeam(null);
  }, []);

  const logout = useCallback(() => {
    setCurrentTeam(null);
    setUserRole(null);
  }, []);

  const resetQuizData = useCallback(() => {
    if (confirm("Are you sure you want to completely reset the quiz? All points and state will be lost.")) {
      Object.keys(window.localStorage).forEach((key) => {
        if (key.startsWith("mtn_")) {
          window.localStorage.removeItem(key);
        }
      });
      // Navigate to root to force a clean re-login
      window.location.href = "/";
    }
  }, []);

  const prevBroadcast = useRef(broadcast);
  const prevScores = useRef(scores);

  useEffect(() => {
    const prev = prevBroadcast.current;
    if (!prev.buzzEnabled && broadcast.buzzEnabled) playSound("buzz");
    if (!prev.buzzedTeamId && broadcast.buzzedTeamId) playSound("buzz");
    if (broadcast.lockedOutTeamIds.length > prev.lockedOutTeamIds.length) playSound("lockout");
    if (!prev.isStealMode && broadcast.isStealMode) playSound("timer");
    if (prev.timerActive && !broadcast.timerActive && broadcast.timerSecs === 0) playSound("timer");
    prevBroadcast.current = broadcast;
  }, [broadcast]);

  useEffect(() => {
    let scoreIncreased = false;
    for (const teamId in scores) {
      if ((scores[teamId]?.total ?? 0) > (prevScores.current[teamId]?.total ?? 0)) {
        scoreIncreased = true;
      }
    }
    if (scoreIncreased) playSound("correct");
    prevScores.current = scores;
  }, [scores]);

  // ── Questions ────────────────────────────────────────────────────────────
  const markR1Used = useCallback((id: number) => {
    setQuestions((p) => ({ ...p, round1: p.round1.map((q) => q.id === id ? { ...q, isUsed: true } : q) }));
  }, []);
  const markR3Used = useCallback((id: number) => {
    setQuestions((p) => ({ ...p, round3: p.round3.map((q) => q.id === id ? { ...q, isUsed: true } : q) }));
  }, []);
  const markR4Used = useCallback((id: number) => {
    setQuestions((p) => ({ ...p, round4: p.round4.map((q) => q.id === id ? { ...q, isUsed: true } : q) }));
  }, []);
  const markR5Used = useCallback((id: number) => {
    setQuestions((p) => ({ ...p, round5: p.round5.map((q) => q.id === id ? { ...q, isUsed: true } : q) }));
  }, []);
  const resetQuestions = useCallback(() => setQuestions(INITIAL_QUESTIONS), []);

  // ── Scores ────────────────────────────────────────────────────────────────
  const addPoints = useCallback((teamId: string, pts: number, round: RoundKey) => {
    setScores((p) => {
      const e = p[teamId] ?? { total: 0, byRound: { r1: 0, r2: 0, r3: 0, r4: 0, r5: 0 } };
      return { ...p, [teamId]: { total: e.total + pts, byRound: { ...e.byRound, [round]: (e.byRound[round] ?? 0) + pts } } };
    });
  }, []);
  const deductPoints = useCallback((teamId: string, pts: number, round: RoundKey) => {
    setScores((p) => {
      const e = p[teamId] ?? { total: 0, byRound: { r1: 0, r2: 0, r3: 0, r4: 0, r5: 0 } };
      return {
        ...p,
        [teamId]: {
          total: Math.max(0, e.total - pts),
          byRound: { ...e.byRound, [round]: Math.max(0, (e.byRound[round] ?? 0) - pts) },
        },
      };
    });
  }, []);

  // ── Broadcast ─────────────────────────────────────────────────────────────
  const updateBroadcast = useCallback((update: Partial<BroadcastState>) => {
    setBroadcast((p) => ({ ...p, ...update }));
  }, []);

  // ── Timer ─────────────────────────────────────────────────────────────────
  const startTimer = useCallback((secs: number, label: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setBroadcast((p) => ({ ...p, timerSecs: secs, timerTotal: secs, timerActive: true, timerLabel: label }));
    timerRef.current = setInterval(() => {
      setBroadcast((p) => {
        if (!p.timerActive || p.timerSecs <= 1) {
          clearInterval(timerRef.current!);
          return { ...p, timerSecs: 0, timerActive: false };
        }
        return { ...p, timerSecs: p.timerSecs - 1 };
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setBroadcast((p) => ({ ...p, timerActive: false }));
  }, []);

  const resetTimer = useCallback((secs: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setBroadcast((p) => ({ ...p, timerSecs: secs, timerActive: false }));
  }, []);

  // ── Buzz mechanics ────────────────────────────────────────────────────────
  const enableBuzz = useCallback(() => {
    setBroadcast((p) => ({ ...p, buzzEnabled: true }));
  }, []);

  const disableBuzz = useCallback(() => {
    setBroadcast((p) => ({ ...p, buzzEnabled: false }));
  }, []);

  const teamBuzz = useCallback((teamId: string) => {
    setBroadcast((p) => {
      if (!p.buzzEnabled || p.buzzedTeamId || p.lockedOutTeamIds.includes(teamId)) return p;
      // Only allow teams in the active group to buzz
      const team = TEAMS.find((t) => t.id === teamId);
      if (hostGroupId && team?.groupId !== hostGroupId) return p;
      if (timerRef.current) clearInterval(timerRef.current); // pause steal/clue timer
      return { ...p, buzzedTeamId: teamId, timerActive: false };
    });
  }, [hostGroupId]);

  const lockoutTeam = useCallback((teamId: string) => {
    setBroadcast((p) => ({
      ...p,
      lockedOutTeamIds: p.lockedOutTeamIds.includes(teamId) ? p.lockedOutTeamIds : [...p.lockedOutTeamIds, teamId],
      buzzedTeamId: p.buzzedTeamId === teamId ? null : p.buzzedTeamId,
    }));
  }, []);

  const passQuestion = useCallback(() => {
    setBroadcast((p) => ({
      ...p,
      lockedOutTeamIds: p.buzzedTeamId && !p.lockedOutTeamIds.includes(p.buzzedTeamId)
        ? [...p.lockedOutTeamIds, p.buzzedTeamId]
        : p.lockedOutTeamIds,
      buzzedTeamId: null,
      isStealMode: true,
    }));
    startTimer(STEAL_TIMER_SECS, "STEAL");
  }, [startTimer]);

  const awardBuzzedTeam = useCallback((pts: number) => {
    setBroadcast((p) => {
      if (p.buzzedTeamId) {
        const rk = `r${p.round ?? 1}` as RoundKey;
        addPoints(p.buzzedTeamId, pts, rk);
      }
      return { ...p, buzzedTeamId: null, buzzEnabled: false, isStealMode: false };
    });
  }, [addPoints]);

  const clearBuzzState = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setBroadcast((p) => ({
      ...p,
      buzzEnabled: false,
      buzzedTeamId: null,
      lockedOutTeamIds: [],
      isStealMode: false,
      timerActive: false,
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const value = useMemo<AppContextType>(() => ({
    currentTeam, userRole, login, loginAudience, logout,
    teams: TEAMS, groups: GROUPS, currentGroup,
    hostGroupId, setHostGroupId,
    currentRound, setCurrentRound,
    activeTeamId, setActiveTeamId, advanceToNextTeam,
    questions, markR1Used, markR3Used, markR4Used, markR5Used, resetQuestions,
    scores, addPoints, deductPoints,
    broadcast, updateBroadcast,
    startTimer, stopTimer, resetTimer,
    enableBuzz, disableBuzz, teamBuzz, lockoutTeam, passQuestion, awardBuzzedTeam, clearBuzzState,
    resetQuizData,
  }), [
    currentTeam, userRole, login, loginAudience, logout,
    currentGroup, hostGroupId,
    currentRound, activeTeamId,
    questions, scores, broadcast,
    updateBroadcast, startTimer, stopTimer, resetTimer,
    markR1Used, markR3Used, markR4Used, markR5Used, resetQuestions,
    addPoints, deductPoints,
    enableBuzz, disableBuzz, teamBuzz, lockoutTeam, passQuestion, awardBuzzedTeam, clearBuzzState,
    resetQuizData,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
