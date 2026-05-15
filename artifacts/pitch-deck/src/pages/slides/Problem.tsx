export default function Problem() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg px-[6vw] py-[8vh] flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-[0.3vh] bg-border" />
      <div className="absolute top-0 left-[6vw] w-[8vw] h-[0.3vh] bg-primary" />

      <div className="font-body text-[1.5vw] uppercase tracking-[0.3em] text-primary">
        01 — Problem
      </div>

      <h2 className="mt-[3vh] font-display font-extrabold text-[5.5vw] leading-[0.95] tracking-tighter text-text max-w-[70vw] text-balance">
        Making comics is slow,
        <span className="block text-muted">expensive, and gated.</span>
      </h2>

      <div className="mt-auto grid grid-cols-3 gap-[3vw]">
        <div className="border-t border-border pt-[3vh]">
          <div className="font-display font-extrabold text-[5vw] text-primary leading-none">
            40+
          </div>
          <div className="mt-[1.5vh] font-body text-[2vw] text-text font-medium">
            hours
          </div>
          <div className="mt-[1vh] font-body text-[1.6vw] text-muted leading-snug text-pretty">
            for a single 6-panel page from script to inked art.
          </div>
        </div>
        <div className="border-t border-border pt-[3vh]">
          <div className="font-display font-extrabold text-[5vw] text-primary leading-none">
            $$$
          </div>
          <div className="mt-[1.5vh] font-body text-[2vw] text-text font-medium">
            per panel
          </div>
          <div className="mt-[1vh] font-body text-[1.6vw] text-muted leading-snug text-pretty">
            illustrators charge by the panel — most creators can't afford it.
          </div>
        </div>
        <div className="border-t border-border pt-[3vh]">
          <div className="font-display font-extrabold text-[5vw] text-primary leading-none">
            0
          </div>
          <div className="mt-[1.5vh] font-body text-[2vw] text-text font-medium">
            offline tools
          </div>
          <div className="mt-[1vh] font-body text-[1.6vw] text-muted leading-snug text-pretty">
            existing AI comic tools require the cloud, an account, and a subscription.
          </div>
        </div>
      </div>
    </div>
  );
}
