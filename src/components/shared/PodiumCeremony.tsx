import { useEffect } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { Trophy, Medal } from "lucide-react";

export default function PodiumCeremony() {
  const { teams, scores } = useApp();

  const finalsTeams = teams.filter(t => t.groupId === "finals");
  const ranked = [...finalsTeams].sort((a, b) => (scores[b.id]?.total ?? 0) - (scores[a.id]?.total ?? 0));

  const firstPlace = ranked[0];
  const secondPlace = ranked[1];
  const thirdPlace = ranked[2];

  useEffect(() => {
    // Optional: play a grand sound effect here if implemented
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center overflow-hidden bg-black pb-32">
      {/* Background glow & particles */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 100%, #302000 0%, #050505 70%)",
        }}
      />
      
      <div className="absolute top-1/4 flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 1, duration: 1, ease: "easeOut" }}
          className="font-black uppercase tracking-widest text-[#FFCC00]"
          style={{ fontFamily: "var(--font-display)", fontSize: "clamp(30px, 5vw, 60px)", textShadow: "0 0 40px #FFCC0080" }}
        >
          Grand Champions
        </motion.h1>
      </div>

      <div className="relative flex items-end justify-center gap-4">
        {/* 2nd Place */}
        {secondPlace && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 1, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div className="mb-4 flex flex-col items-center text-center">
              <span className="mb-2 text-3xl font-black text-[#C0C0C0]" style={{ fontFamily: "var(--font-display)" }}>{scores[secondPlace.id]?.total ?? 0}</span>
              <span className="w-48 text-lg font-bold text-white leading-tight" style={{ fontFamily: "var(--font-display)" }}>{secondPlace.name}</span>
            </div>
            <div
              className="relative flex h-64 w-40 flex-col items-center justify-start rounded-t-lg border-t-4 pt-4 shadow-2xl"
              style={{
                background: "linear-gradient(to bottom, #1a1a1a, #050505)",
                borderColor: "#C0C0C0",
                boxShadow: "0 -10px 40px #C0C0C030"
              }}
            >
              <Medal size={48} style={{ color: "#C0C0C0" }} />
              <span className="mt-4 text-6xl font-black text-[#C0C0C030]" style={{ fontFamily: "var(--font-display)" }}>2</span>
            </div>
          </motion.div>
        )}

        {/* 1st Place */}
        {firstPlace && (
          <motion.div
            initial={{ opacity: 0, y: 150 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 4, duration: 1.5, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Crown / Glow */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 5.5, type: "spring" }}
              className="absolute -top-32"
            >
              <Trophy size={80} style={{ color: "#FFCC00", filter: "drop-shadow(0 0 20px #FFCC00)" }} />
            </motion.div>

            <div className="mb-4 flex flex-col items-center text-center">
              <span className="mb-2 text-4xl font-black text-[#FFCC00]" style={{ fontFamily: "var(--font-display)" }}>{scores[firstPlace.id]?.total ?? 0}</span>
              <span className="w-56 text-2xl font-black text-white leading-tight" style={{ fontFamily: "var(--font-display)" }}>{firstPlace.name}</span>
            </div>
            <div
              className="relative flex h-80 w-48 flex-col items-center justify-start rounded-t-lg border-t-4 pt-6 shadow-2xl"
              style={{
                background: "linear-gradient(to bottom, #2a2000, #050505)",
                borderColor: "#FFCC00",
                boxShadow: "0 -20px 60px #FFCC0040"
              }}
            >
              <span className="text-8xl font-black text-[#FFCC0030]" style={{ fontFamily: "var(--font-display)" }}>1</span>
            </div>
          </motion.div>
        )}

        {/* 3rd Place */}
        {thirdPlace && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 1, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div className="mb-4 flex flex-col items-center text-center">
              <span className="mb-2 text-3xl font-black text-[#CD7F32]" style={{ fontFamily: "var(--font-display)" }}>{scores[thirdPlace.id]?.total ?? 0}</span>
              <span className="w-48 text-lg font-bold text-white leading-tight" style={{ fontFamily: "var(--font-display)" }}>{thirdPlace.name}</span>
            </div>
            <div
              className="relative flex h-48 w-40 flex-col items-center justify-start rounded-t-lg border-t-4 pt-4 shadow-2xl"
              style={{
                background: "linear-gradient(to bottom, #1a1005, #050505)",
                borderColor: "#CD7F32",
                boxShadow: "0 -10px 40px #CD7F3230"
              }}
            >
              <Medal size={40} style={{ color: "#CD7F32" }} />
              <span className="mt-4 text-6xl font-black text-[#CD7F3230]" style={{ fontFamily: "var(--font-display)" }}>3</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
