export default function ContestantView() {
  return (
    <div
      className="flex h-screen w-screen flex-col items-center justify-center p-6 text-center"
      style={{ background: "#050505", color: "#666" }}
    >
      <h1 className="mb-4 font-black uppercase tracking-widest text-[#FFCC00]" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 4vw, 36px)" }}>
        Physical Buzzer Mode Active
      </h1>
      <p className="max-w-md text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
        The digital buzzer interface has been disabled for this event. 
        Please use your provided physical buzzer on stage.
      </p>
    </div>
  );
}
