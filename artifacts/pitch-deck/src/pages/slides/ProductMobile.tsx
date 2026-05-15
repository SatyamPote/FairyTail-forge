export default function ProductMobile() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg px-[6vw] py-[8vh] grid grid-cols-12 gap-[3vw]">
      <div className="absolute top-0 left-0 right-0 h-[0.3vh] bg-border" />
      <div className="absolute top-0 left-[6vw] w-[8vw] h-[0.3vh] bg-primary" />

      <div className="col-span-7 flex items-center justify-center gap-[2vw]">
        <div className="w-[18vw] aspect-[9/19] bg-bg-elevated border border-border rounded-[2vw] overflow-hidden flex flex-col shadow-2xl">
          <div className="h-[3vh] flex items-center justify-center">
            <div className="w-[6vw] h-[1vh] bg-border rounded-full" />
          </div>
          <div className="px-[1.2vw] flex flex-col gap-[1vh] flex-1">
            <div className="h-[2.5vh] w-[60%] bg-text/80 rounded-sm" />
            <div className="h-[1.4vh] w-[80%] bg-muted/40 rounded-sm" />
            <div className="mt-[1vh] aspect-[4/3] bg-gradient-to-br from-primary/50 to-primary/10 border border-primary/30 rounded-md" />
            <div className="aspect-[4/3] bg-gradient-to-br from-accent/40 to-accent/10 border border-border rounded-md" />
            <div className="h-[3vh] bg-primary rounded-md mt-auto" />
          </div>
        </div>
        <div className="w-[18vw] aspect-[9/19] bg-bg-elevated border border-border rounded-[2vw] overflow-hidden flex flex-col shadow-2xl">
          <div className="h-[3vh] flex items-center justify-center">
            <div className="w-[6vw] h-[1vh] bg-border rounded-full" />
          </div>
          <div className="px-[1.2vw] flex flex-col gap-[1vh] flex-1">
            <div className="h-[2.5vh] w-[70%] bg-text/80 rounded-sm" />
            <div className="grid grid-cols-2 gap-[0.8vh] flex-1">
              <div className="bg-gradient-to-br from-primary/40 to-primary/10 border border-border rounded-sm" />
              <div className="bg-gradient-to-br from-accent/40 to-accent/10 border border-border rounded-sm" />
              <div className="bg-gradient-to-br from-accent/30 to-accent/5 border border-border rounded-sm" />
              <div className="bg-gradient-to-br from-primary/30 to-primary/5 border border-border rounded-sm" />
            </div>
            <div className="h-[3vh] bg-bg border border-primary/40 rounded-md" />
          </div>
        </div>
      </div>

      <div className="col-span-5 flex flex-col justify-center">
        <div className="font-body text-[1.5vw] uppercase tracking-[0.3em] text-primary">
          04 — Product · Mobile
        </div>
        <h2 className="mt-[3vh] font-display font-extrabold text-[4.5vw] leading-[0.95] tracking-tighter text-text text-balance">
          Forge in your pocket.
        </h2>
        <p className="mt-[3vh] font-body text-[1.8vw] text-muted leading-snug text-pretty">
          The same studio, redrawn for a phone. Read, share, and queue panels from anywhere.
        </p>
        <div className="mt-[4vh] flex flex-col gap-[1.5vh]">
          <div className="flex items-baseline gap-[1.2vw]">
            <span className="text-primary font-display font-bold text-[1.8vw]">→</span>
            <span className="font-body text-[1.7vw] text-text">Native gesture-driven reader</span>
          </div>
          <div className="flex items-baseline gap-[1.2vw]">
            <span className="text-primary font-display font-bold text-[1.8vw]">→</span>
            <span className="font-body text-[1.7vw] text-text">Background panel queue</span>
          </div>
          <div className="flex items-baseline gap-[1.2vw]">
            <span className="text-primary font-display font-bold text-[1.8vw]">→</span>
            <span className="font-body text-[1.7vw] text-text">Offline-first, syncs when home</span>
          </div>
        </div>
      </div>
    </div>
  );
}
