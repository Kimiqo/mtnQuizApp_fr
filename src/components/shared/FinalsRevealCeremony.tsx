import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { playSound } from "@/data/seed";
import { Trophy } from "lucide-react";

export function FinalsRevealCeremony({ isHost = false }: { isHost?: boolean }) {
  const { teams, updateBroadcast } = useApp();
  const [step, setStep] = useState(0);

  const finalsTeams = teams.filter((t) => t.groupId === "finals");

  useEffect(() => {
    playSound("timer"); // intense sound
    const s1 = setTimeout(() => { setStep(1); playSound("draw"); }, 2000); // Title
    const s2 = setTimeout(() => { setStep(2); playSound("answer"); }, 4000); // Team 1
    const s3 = setTimeout(() => { setStep(3); playSound("answer"); }, 5500); // Team 2
    const s4 = setTimeout(() => { setStep(4); playSound("correct"); }, 7000); // Team 3
    const s5 = setTimeout(() => {
      if (isHost) updateBroadcast({ drawPhase: "done" });
    }, 11000);

    return () => { clearTimeout(s1); clearTimeout(s2); clearTimeout(s3); clearTimeout(s4); clearTimeout(s5); };
  }, [isHost, updateBroadcast]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-12 text-center" style={{ background: "radial-gradient(circle at center, #1a1200 0%, #030303 100%)" }}>
      <AnimatePresence>
        {step >= 1 && (
          <motion.div initial={{ opacity: 0, scale: 0.8, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="mb-12 flex flex-col items-center">
            <Trophy size={64} style={{ color: "#FFCC00", filter: "drop-shadow(0 0 40px #FFCC0080)" }} className="mb-6" />
            <h1 className="font-black uppercase tracking-widest text-white shadow-black drop-shadow-2xl" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px, 6vw, 80px)", lineHeight: 1 }}>
              GRAND FINALS
            </h1>
            <p className="mt-4 text-xl font-bold uppercase tracking-[0.3em]" style={{ color: "#FFCC00", fontFamily: "var(--font-mono)" }}>
              The Top 3 Teams
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex w-full max-w-5xl items-center justify-center gap-8">
        {[0, 1, 2].map((idx) => {
          const team = finalsTeams[idx];
          if (!team) return null;
          const isRevealed = step >= idx + 2;

          return (
            <div key={team.id} className="w-1/3">
              <AnimatePresence>
                {isRevealed && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                    className="flex flex-col items-center gap-4 rounded-sm border p-8"
                    style={{ borderColor: "#FFCC0050", background: "#0f0e00", boxShadow: "0 0 60px 10px #FFCC0020" }}
                  >
                    <span className="text-[12px] font-bold uppercase tracking-widest" style={{ color: "#FFCC0080", fontFamily: "var(--font-mono)" }}>
                      Finalist {idx + 1}
                    </span>
                    <h2 className="text-center font-black uppercase text-white shadow-black drop-shadow-md" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 3vw, 42px)", lineHeight: 1.1 }}>
                      {team.name}
                    </h2>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
