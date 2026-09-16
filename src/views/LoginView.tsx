import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, LogIn, ShieldCheck, Users, Monitor } from "lucide-react";
import { useApp } from "@/context/AppContext";

type Tab = "host" | "audience";

export default function LoginView() {
  const { login, loginAudience, teams, userRole, currentTeam } = useApp();
  const [tab, setTab] = useState<Tab>("audience");
  const [teamId, setTeamId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (userRole === "host") navigate("/host/bracket");
    else if (userRole === "team" && currentTeam) navigate(`/contestant/${currentTeam.id}`);
    else if (userRole === "audience") navigate("/audience");
  }, [userRole, currentTeam, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (tab === "audience") {
      loginAudience();
      navigate("/audience");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const id = tab === "host" ? "host" : teamId;
    if (!id) { setError("Please select a team."); setLoading(false); return; }
    const ok = await login(id, password);
    if (ok) {
      if (tab === "host") navigate("/host/bracket");
      else {
        const team = teams.find((t) => t.id === id);
        if (team) navigate(`/contestant/${team.id}`);
      }
    } else {
      setError("Invalid credentials. Please try again.");
    }
    setLoading(false);
  };

  const tabs = [
    { id: "host" as Tab, label: "Host", icon: <ShieldCheck size={13} />, hint: "moderator" },
    { id: "audience" as Tab, label: "Audience", icon: <Monitor size={13} />, hint: "No login required" },
  ];

  return (
    <div
      className="noise-bg relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% -10%, #1c1500 0%, #050505 60%)" }}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
        style={{ width: "50%", height: "2px", background: "#FFCC00", boxShadow: "0 0 120px 80px #FFCC0022" }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(#ffffff04 1px,transparent 1px),linear-gradient(90deg,#ffffff04 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md px-4"
      >
        {/* Brand */}
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded font-black text-black"
            style={{ background: "#FFCC00", fontFamily: "var(--font-display)", fontSize: "15px", boxShadow: "0 0 40px 12px #FFCC0030" }}
          >
            MTN
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px,5vw,38px)", fontWeight: 900, color: "#fff", lineHeight: 1.05 }}>
            MTN GHANA
          </h1>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(13px,2.5vw,17px)", color: "#FFCC00", letterSpacing: "0.22em", marginTop: "4px" }}>
            AI QUIZ CHAMPIONSHIP
          </p>
        </div>

        {/* Card */}
        <div className="rounded border p-6" style={{ background: "#0C0C0C", borderColor: "#252525" }}>
          {/* Tab switcher */}
          <div
            className="mb-5 flex rounded-sm border p-1"
            style={{ borderColor: "#222", background: "#080808" }}
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setError(""); setPassword(""); setTeamId(""); }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-sm py-2 text-xs font-semibold uppercase tracking-widest transition-all"
                style={{
                  background: tab === t.id ? "#FFCC00" : "transparent",
                  color: tab === t.id ? "#000" : "#555",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <AnimatePresence mode="wait">


              {tab === "host" && (
                <motion.div key="host" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="rounded-sm border p-3 text-center" style={{ borderColor: "#FFCC0030", background: "#100f00" }}>
                    <ShieldCheck size={18} className="mx-auto mb-1" style={{ color: "#FFCC00" }} />
                    <p className="font-black uppercase tracking-wider" style={{ color: "#FFCC00", fontFamily: "var(--font-display)", fontSize: "15px" }}>
                      QUIZ HOST / MODERATOR
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: "#888", fontFamily: "var(--font-mono)" }}>
                      Full control · draw questions · award points · manage buzzer
                    </p>
                  </div>
                </motion.div>
              )}

              {tab === "audience" && (
                <motion.div key="audience" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="rounded-sm border p-3 text-center" style={{ borderColor: "#FFCC0030", background: "#00091a" }}>
                    <Monitor size={18} className="mx-auto mb-1" style={{ color: "#FFCC00" }} />
                    <p className="font-black uppercase tracking-wider" style={{ color: "#FFCC00", fontFamily: "var(--font-display)", fontSize: "15px" }}>
                      AUDIENCE / PROJECTOR VIEW
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: "#888", fontFamily: "var(--font-mono)" }}>
                      Read-only · clean broadcast display · no credentials needed
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password (team + host only) */}
            {tab !== "audience" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest" style={{ color: "#FFCC0080", fontFamily: "var(--font-mono)" }}>
                  Password
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#555" }} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter password"
                    className="w-full rounded-sm border py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-yellow-500/40"
                    style={{ background: "#080808", borderColor: "#333", color: "#fff", fontFamily: "var(--font-body)" }}
                  />
                </div>
                <p className="text-[10px]" style={{ color: "#333", fontFamily: "var(--font-mono)" }}>
                  {tab === "host" ? "Please enter your host password" : "Ask your host for the team password"}
                </p>
              </div>
            )}

            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-xs" style={{ color: "#EF4444", fontFamily: "var(--font-mono)" }}
                >
                  ✕ {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.975 }}
              className="flex items-center justify-center gap-2 rounded-sm py-4 font-black uppercase tracking-widest disabled:opacity-50"
              style={{
                background: tab === "audience" ? "#FFCC00" : "#FFCC00",
                color: tab === "audience" ? "#fff" : "#000",
                fontFamily: "var(--font-display)",
                fontSize: "17px",
                letterSpacing: "0.14em",
                boxShadow: tab === "audience" ? "0 0 40px 6px #FFCC0028" : "0 0 40px 6px #FFCC0028",
              }}
            >
              {loading ? (
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} style={{ display: "inline-block" }}>◌</motion.span>
              ) : tab === "audience" ? (
                <><Monitor size={17} /> Open Projector View</>
              ) : (
                <><LogIn size={17} /> {tab === "host" ? "Enter Host Dashboard" : "Enter as Team"}</>
              )}
            </motion.button>
          </form>
        </div>

        <p className="mt-5 text-center text-[10px] tracking-wider" style={{ color: "#333", fontFamily: "var(--font-mono)" }}>
          MTN GHANA AI QUIZ CHAMPIONSHIP · 2026
        </p>
      </motion.div>
    </div>
  );
}
