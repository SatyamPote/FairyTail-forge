export default function ProductWeb() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg px-[6vw] py-[8vh] grid grid-cols-12 gap-[3vw]">
      <div className="absolute top-0 left-0 right-0 h-[0.3vh] bg-border" />
      <div className="absolute top-0 left-[6vw] w-[8vw] h-[0.3vh] bg-primary" />

      <div className="col-span-5 flex flex-col justify-center">
        <div className="font-body text-[1.5vw] uppercase tracking-[0.3em] text-primary">
          03 — Product · Web
        </div>
        <h2 className="mt-[3vh] font-display font-extrabold text-[4.5vw] leading-[0.95] tracking-tighter text-text text-balance">
          Studio on the desktop.
        </h2>
        <p className="mt-[3vh] font-body text-[1.8vw] text-muted leading-snug text-pretty">
          A full A4 comic canvas with asymmetric panel layouts, per-panel re-inking, and live theme switching.
        </p>
        <div className="mt-[4vh] flex flex-col gap-[1.5vh]">
          <div className="flex items-baseline gap-[1.2vw]">
            <span className="text-primary font-display font-bold text-[1.8vw]">→</span>
            <span className="font-body text-[1.7vw] text-text">Sequential generation queue</span>
          </div>
          <div className="flex items-baseline gap-[1.2vw]">
            <span className="text-primary font-display font-bold text-[1.8vw]">→</span>
            <span className="font-body text-[1.7vw] text-text">PDF export, one click</span>
          </div>
          <div className="flex items-baseline gap-[1.2vw]">
            <span className="text-primary font-display font-bold text-[1.8vw]">→</span>
            <span className="font-body text-[1.7vw] text-text">Four built-in themes</span>
          </div>
        </div>
      </div>

      <div className="col-span-7 flex items-center justify-center">
        <div className="w-full aspect-[16/10] bg-bg-elevated border border-border rounded-[0.6vw] overflow-hidden flex flex-col shadow-2xl">
          <div className="h-[3vh] bg-bg border-b border-border flex items-center px-[1vw] gap-[0.6vw]">
            <div className="w-[0.9vw] h-[0.9vw] rounded-full bg-border" />
            <div className="w-[0.9vw] h-[0.9vw] rounded-full bg-border" />
            <div className="w-[0.9vw] h-[0.9vw] rounded-full bg-border" />
          </div>
          <div className="flex-1 grid grid-cols-[14%_1fr]">
            <div className="bg-bg border-r border-border p-[1vh] flex flex-col gap-[0.8vh]">
              <div className="h-[1.6vh] bg-primary/30 rounded-sm" />
              <div className="h-[1.6vh] bg-border rounded-sm" />
              <div className="h-[1.6vh] bg-border rounded-sm" />
              <div className="h-[1.6vh] bg-border rounded-sm" />
            </div>
            <div className="p-[2vh] grid grid-cols-3 grid-rows-3 gap-[1vh]">
              <div className="row-span-2 bg-gradient-to-br from-primary/40 to-primary/10 border border-primary/30 rounded-sm" />
              <div className="bg-gradient-to-br from-accent/30 to-accent/5 border border-border rounded-sm" />
              <div className="bg-gradient-to-br from-primary/30 to-primary/5 border border-border rounded-sm" />
              <div className="bg-gradient-to-br from-accent/30 to-accent/10 border border-border rounded-sm" />
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-border rounded-sm" />
              <div className="col-span-3 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 border border-primary/30 rounded-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
