const base = import.meta.env.BASE_URL;

export default function Title() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg">
      <img
        src={`${base}hero.png`}
        crossOrigin="anonymous"
        alt="Comic illustration"
        className="absolute inset-0 w-full h-full object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/85 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />

      <div className="absolute top-[6vh] left-[6vw] flex items-center gap-[1vw]">
        <div className="w-[1.6vw] h-[1.6vw] rounded-sm bg-primary" />
        <span className="font-display font-semibold text-[1.6vw] tracking-wide text-text">
          FairyTail Forge
        </span>
      </div>

      <div className="absolute bottom-[12vh] left-[6vw] max-w-[70vw]">
        <div className="font-body text-[1.5vw] uppercase tracking-[0.3em] text-primary mb-[3vh]">
          Pitch Deck · 2026
        </div>
        <h1 className="font-display font-extrabold text-[7vw] leading-[0.95] tracking-tighter text-text text-balance">
          One prompt.
          <span className="block text-primary">A whole comic.</span>
        </h1>
        <p className="mt-[4vh] font-body text-[2vw] text-muted max-w-[50vw] text-pretty leading-snug">
          An offline AI studio that turns a single story idea into a finished, illustrated comic page.
        </p>
      </div>

      <div className="absolute bottom-[5vh] right-[6vw] font-body text-[1.5vw] text-muted">
        Web · Mobile · Local-first
      </div>
    </div>
  );
}
