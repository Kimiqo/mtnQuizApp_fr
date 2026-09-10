import { useEffect } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { Trophy, Medal } from "lucide-react";

export default function PodiumCeremony() {
  const { teams, finalsScores } = useApp();

  const finalsTeams = teams.filter(t => t.groupId === "finals");
  const ranked = [...finalsTeams].sort((a, b) => (finalsScores[b.id]?.total ?? 0) - (finalsScores[a.id]?.total ?? 0));

  const firstPlace = ranked[0];
  const secondPlace = ranked[1];
  const thirdPlace = ranked[2];

  useEffect(() => {
    // Optional: play a grand sound effect here if implemented
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center overflow-hidden bg-black pb-8 lg:pb-32">
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
      
      <div className="absolute top-[10vh] md:top-[15vh] lg:top-1/4 flex flex-col items-center">
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

      <div className="relative flex items-end justify-center gap-2 md:gap-4 px-2">
        {/* 2nd Place */}
        {secondPlace && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 1, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div className="mb-2 md:mb-4 flex flex-col items-center text-center">
              <span className="mb-1 md:mb-2 text-xl md:text-3xl font-black text-[#C0C0C0]" style={{ fontFamily: "var(--font-display)" }}>{finalsScores[secondPlace.id]?.total ?? 0}</span>
              <span className="w-24 md:w-48 text-xs md:text-lg font-bold text-white leading-tight" style={{ fontFamily: "var(--font-display)" }}>{secondPlace.name}</span>
            </div>
            <div
              className="relative flex h-[35vh] md:h-[40vh] max-h-[10rem] md:max-h-[16rem] w-24 md:w-40 flex-col items-center justify-start rounded-t-lg border-t-2 md:border-t-4 pt-2 md:pt-4 shadow-2xl"
              style={{
                background: "linear-gradient(to bottom, #1a1a1a, #050505)",
                borderColor: "#C0C0C0",
                boxShadow: "0 -10px 40px #C0C0C030"
              }}
            >
              <Medal className="w-8 h-8 md:w-12 md:h-12" style={{ color: "#C0C0C0" }} />
              <span className="mt-2 md:mt-4 text-4xl md:text-6xl font-black text-[#C0C0C030]" style={{ fontFamily: "var(--font-display)" }}>2</span>
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
              className="absolute -top-[12vh] md:-top-[15vh]"
            >
              <Trophy className="w-12 h-12 md:w-20 md:h-20" style={{ color: "#FFCC00", filter: "drop-shadow(0 0 20px #FFCC00)" }} />
            </motion.div>

            <div className="mb-2 md:mb-4 flex flex-col items-center text-center">
              <span className="mb-1 md:mb-2 text-2xl md:text-4xl font-black text-[#FFCC00]" style={{ fontFamily: "var(--font-display)" }}>{finalsScores[firstPlace.id]?.total ?? 0}</span>
              <span className="w-28 md:w-56 text-sm md:text-2xl font-black text-white leading-tight" style={{ fontFamily: "var(--font-display)" }}>{firstPlace.name}</span>
            </div>
            <div
              className="relative flex h-[45vh] md:h-[50vh] max-h-[14rem] md:max-h-[20rem] w-28 md:w-48 flex-col items-center justify-start rounded-t-lg border-t-2 md:border-t-4 pt-4 md:pt-6 shadow-2xl"
              style={{
                background: "linear-gradient(to bottom, #2a2000, #050505)",
                borderColor: "#FFCC00",
                boxShadow: "0 -20px 60px #FFCC0040"
              }}
            >
              <span className="text-6xl md:text-8xl font-black text-[#FFCC0030]" style={{ fontFamily: "var(--font-display)" }}>1</span>
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
            <div className="mb-2 md:mb-4 flex flex-col items-center text-center">
              <span className="mb-1 md:mb-2 text-lg md:text-3xl font-black text-[#CD7F32]" style={{ fontFamily: "var(--font-display)" }}>{finalsScores[thirdPlace.id]?.total ?? 0}</span>
              <span className="w-24 md:w-48 text-xs md:text-lg font-bold text-white leading-tight" style={{ fontFamily: "var(--font-display)" }}>{thirdPlace.name}</span>
            </div>
            <div
              className="relative flex h-[25vh] md:h-[30vh] max-h-[8rem] md:max-h-[12rem] w-24 md:w-40 flex-col items-center justify-start rounded-t-lg border-t-2 md:border-t-4 pt-2 md:pt-4 shadow-2xl"
              style={{
                background: "linear-gradient(to bottom, #1a1005, #050505)",
                borderColor: "#CD7F32",
                boxShadow: "0 -10px 40px #CD7F3230"
              }}
            >
              <Medal className="w-6 h-6 md:w-10 md:h-10" style={{ color: "#CD7F32" }} />
              <span className="mt-2 md:mt-4 text-4xl md:text-6xl font-black text-[#CD7F3230]" style={{ fontFamily: "var(--font-display)" }}>3</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
