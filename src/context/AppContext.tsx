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
  INITIAL_QUESTIONS,
  INITIAL_BROADCAST,
  buildInitialScores,
  playSound,
} from "@/data/seed";
import { socket } from "@/lib/socket";

interface AppContextType {
  // ── Auth ──────────────────────────────────────────────────────────────────
  currentTeam: Team | null;
  userRole: "host" | "team" | "audience" | null;
  login: (teamId: string, password: string) => Promise<boolean>;
  loginAudience: () => void;
  logout: () => void;

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
  finalsScores: Record<string, TeamScore>;
  addPoints: (teamId: string, points: number, round: RoundKey) => void;
  deductPoints: (teamId: string, points: number, round: RoundKey) => void;
  toggleDataset: () => void;
  flashTeam: (teamId: string, type: "correct" | "wrong") => void;
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

export function AppProvider({ children }: { children: ReactNode }) {
  // Client-local Auth state
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [userRole, setUserRole] = useState<"host" | "team" | "audience" | null>(null);

  // Synced state
  const [hostGroupId, setHostGroupIdState] = useState("g1");
  const [currentRound, setCurrentRoundState] = useState<RoundType>(1);
  const [activeTeamId, setActiveTeamIdState] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionBank>(INITIAL_QUESTIONS);
  const [scores, setScores] = useState<Record<string, TeamScore>>(buildInitialScores());
  const [finalsScores, setFinalsScores] = useState<Record<string, TeamScore>>({});
  const [teams, setTeams] = useState<Team[]>(TEAMS);
  const [broadcast, setBroadcast] = useState<BroadcastState>({ ...INITIAL_BROADCAST });

  const prevBroadcast = useRef(broadcast);
  const prevScores = useRef(scores);

  // --- Socket Sync ---
  useEffect(() => {
    const onStateSync = (state: any) => {
      setHostGroupIdState(state.hostGroupId);
      setCurrentRoundState(state.currentRound);
      setActiveTeamIdState(state.activeTeamId);
      if (state.questions) setQuestions(state.questions);
      if (state.scores) setScores(state.scores);
      if (state.finalsScores) setFinalsScores(state.finalsScores);
      if (state.broadcast) setBroadcast(state.broadcast);
      if (state.teams) setTeams(state.teams);
    };

    const onBroadcastUpdate = (updatedBroadcast: BroadcastState) => {
      setBroadcast(updatedBroadcast);
    };

    const onScoresUpdate = (updatedScores: Record<string, TeamScore>) => {
      setScores(updatedScores);
    };

    const onFinalsScoresUpdate = (updatedScores: Record<string, TeamScore>) => {
      setFinalsScores(updatedScores);
    };

    const onTeamsUpdate = (updatedTeams: Team[]) => {
      setTeams(updatedTeams);
    };

    socket.on("state:sync", onStateSync);
    socket.on("broadcast:update", onBroadcastUpdate);
    socket.on("scores:update", onScoresUpdate);
    socket.on("finalsScores:update", onFinalsScoresUpdate);
    socket.on("teams:update", onTeamsUpdate);

    return () => {
      socket.off("state:sync", onStateSync);
      socket.off("broadcast:update", onBroadcastUpdate);
      socket.off("scores:update", onScoresUpdate);
      socket.off("finalsScores:update", onFinalsScoresUpdate);
      socket.off("teams:update", onTeamsUpdate);
    };
  }, []);

  // --- Sound Effects ---
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

  // Derived
  const currentGroup = useMemo(() => {
    if (currentTeam) return GROUPS.find((g) => g.id === currentTeam.groupId) ?? null;
    if (userRole === "host" || userRole === "audience")
      return GROUPS.find((g) => g.id === hostGroupId) ?? null;
    return null;
  }, [currentTeam, userRole, hostGroupId]);

  // ── Auth ────────────────────────────────────────────────────────────────
  // Auto-reconnect using saved session token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("quiz_session_token");
    if (!savedToken) return;

    socket.emit("auth", { token: savedToken }, (res: any) => {
      if (res.success) {
        if (res.role === "host") {
          setUserRole("host");
          setCurrentTeam(null);
        } else if (res.role === "team") {
          const team = TEAMS.find((t) => t.id === res.teamId);
          setCurrentTeam(team || null);
          setUserRole("team");
        } else if (res.role === "audience") {
          setUserRole("audience");
          setCurrentTeam(null);
        }
      } else {
        // Token expired or invalid — clear it
        localStorage.removeItem("quiz_session_token");
      }
    });
  }, []);

  const login = useCallback(async (teamId: string, password: string): Promise<boolean> => {
    const role = teamId === "host" ? "host" : "team";
    return new Promise((resolve) => {
      socket.emit("auth", { role, teamId, password }, (res: any) => {
        if (res.success) {
          // Save session token for reconnection
          if (res.token) localStorage.setItem("quiz_session_token", res.token);
          if (role === "host") {
            setUserRole("host");
            setCurrentTeam(null);
          } else {
            const team = TEAMS.find((t) => t.id === teamId);
            setCurrentTeam(team || null);
            setUserRole("team");
          }
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }, []);

  const loginAudience = useCallback(() => {
    socket.emit("auth", { role: "audience" }, (res: any) => {
      if (res.success) {
        if (res.token) localStorage.setItem("quiz_session_token", res.token);
        setUserRole("audience");
        setCurrentTeam(null);
      }
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("quiz_session_token");
    setCurrentTeam(null);
    setUserRole(null);
    socket.disconnect();
    socket.connect(); // Reconnect as anonymous
  }, []);

  const toggleDataset = useCallback(() => socket.emit("host:toggle-dataset"), []);

  // ── State Emitters (Host) ────────────────────────────────────────────────
  const setHostGroupId = useCallback((groupId: string) => {
    socket.emit("host:round", { groupId });
  }, []);

  const setCurrentRound = useCallback((round: RoundType) => {
    socket.emit("host:round", { round });
  }, []);

  const setActiveTeamId = useCallback((teamId: string | null) => {
    socket.emit("host:round", { teamId });
  }, []);

  const advanceToNextTeam = useCallback(() => {
    if (!activeTeamId) return;
    const groupTeams = teams.filter(t => t.groupId === hostGroupId);
    if (groupTeams.length === 0) return;
    const currentIndex = groupTeams.findIndex(t => t.id === activeTeamId);
    if (currentIndex === -1) return;
    
    // Always stay within the same group — wrap back to Team 1
    const nextIndex = (currentIndex + 1) % groupTeams.length;
    socket.emit("host:round", { teamId: groupTeams[nextIndex].id });
  }, [activeTeamId, hostGroupId, teams]);

  // ── Questions ────────────────────────────────────────────────────────────
  const markR1Used = useCallback((id: number) => socket.emit("host:question", { action: "mark-used", roundKey: "round1", questionId: id }), []);
  const markR3Used = useCallback((id: number) => socket.emit("host:question", { action: "mark-used", roundKey: "round3", questionId: id }), []);
  const markR4Used = useCallback((id: number) => socket.emit("host:question", { action: "mark-used", roundKey: "round4", questionId: id }), []);
  const markR5Used = useCallback((id: number) => socket.emit("host:question", { action: "mark-used", roundKey: "round5", questionId: id }), []);
  const resetQuestions = useCallback(() => socket.emit("host:reset"), []);

  // ── Scores ────────────────────────────────────────────────────────────────
  const addPoints = useCallback((teamId: string, pts: number, round: RoundKey) => {
    socket.emit("host:score", { action: "add", teamId, pts, round });
  }, []);
  const deductPoints = useCallback((teamId: string, pts: number, round: RoundKey) => {
    socket.emit("host:score", { action: "deduct", teamId, pts, round });
  }, []);
  const flashTeam = useCallback((teamId: string, type: "correct" | "wrong") => {
    socket.emit("host:flash", { teamId, type });
  }, []);

  // ── Broadcast ─────────────────────────────────────────────────────────────
  const updateBroadcast = useCallback((update: Partial<BroadcastState>) => {
    socket.emit("host:broadcast", update);
  }, []);

  // ── Timer ─────────────────────────────────────────────────────────────────
  const startTimer = useCallback((secs: number, label: string) => {
    socket.emit("host:timer", { action: "start", secs, label });
  }, []);
  const stopTimer = useCallback(() => {
    socket.emit("host:timer", { action: "stop" });
  }, []);
  const resetTimer = useCallback((secs: number) => {
    socket.emit("host:timer", { action: "reset", secs });
  }, []);

  // ── Buzz mechanics ────────────────────────────────────────────────────────
  const enableBuzz = useCallback(() => socket.emit("host:buzz-control", { action: "enable" }), []);
  const disableBuzz = useCallback(() => socket.emit("host:buzz-control", { action: "disable" }), []);
  const teamBuzz = useCallback((teamId: string) => socket.emit("buzz", { teamId }), []);
  const lockoutTeam = useCallback((teamId: string) => socket.emit("host:buzz-control", { action: "lockout", teamId }), []);
  const passQuestion = useCallback(() => socket.emit("host:buzz-control", { action: "pass" }), []);
  const awardBuzzedTeam = useCallback((pts: number) => socket.emit("host:buzz-control", { action: "award", pts }), []);
  const clearBuzzState = useCallback(() => socket.emit("host:buzz-control", { action: "clear" }), []);

  const resetQuizData = useCallback(() => {
    if (confirm("Are you sure you want to completely reset the quiz? All points and state will be lost.")) {
      socket.emit("host:reset");
      // Navigate to root to force a clean re-login
      window.location.href = "/";
    }
  }, []);

  const value = useMemo<AppContextType>(() => ({
    currentTeam, userRole, login, loginAudience, logout,
    teams, groups: GROUPS, currentGroup,
    hostGroupId, setHostGroupId,
    currentRound, setCurrentRound,
    activeTeamId, setActiveTeamId, advanceToNextTeam,
    questions, markR1Used, markR3Used, markR4Used, markR5Used, resetQuestions,
    scores, finalsScores, addPoints, deductPoints,
    flashTeam, toggleDataset,
    broadcast, updateBroadcast,
    startTimer, stopTimer, resetTimer,
    enableBuzz, disableBuzz, teamBuzz, lockoutTeam, passQuestion, awardBuzzedTeam, clearBuzzState,
    resetQuizData,
  }), [
    currentTeam, userRole, login, loginAudience, logout,
    currentGroup, hostGroupId, setHostGroupId,
    currentRound, setCurrentRound, activeTeamId, setActiveTeamId, advanceToNextTeam,
    questions, scores, finalsScores, broadcast,
    updateBroadcast, startTimer, stopTimer, resetTimer,
    markR1Used, markR3Used, markR4Used, markR5Used, resetQuestions,
    addPoints, deductPoints, flashTeam, toggleDataset,
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
