export default function Roadmap() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg px-[6vw] py-[8vh] flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-[0.3vh] bg-border" />
      <div className="absolute top-0 left-[6vw] w-[8vw] h-[0.3vh] bg-primary" />

      <div className="font-body text-[1.5vw] uppercase tracking-[0.3em] text-primary">
        06 — Roadmap
      </div>

      <h2 className="mt-[3vh] font-display font-extrabold text-[5vw] leading-[0.95] tracking-tighter text-text max-w-[70vw] text-balance">
        From single page to full series.
      </h2>

      <div className="mt-[8vh] flex-1 grid grid-cols-4 gap-[2vw] relative">
        <div className="absolute top-[3vh] left-0 right-0 h-[0.2vh] bg-border" />

        <div className="relative flex flex-col">
          <div className="w-[1.6vw] h-[1.6vw] rounded-full bg-primary border-[0.4vw] border-bg z-10" />
          <div className="mt-[3vh] font-body text-[1.5vw] uppercase tracking-[0.25em] text-primary">
            Now
          </div>
          <div className="mt-[1.5vh] font-display font-semibold text-[2.1vw] text-text leading-tight">
            Single-page comics
          </div>
          <div className="mt-[1.5vh] font-body text-[1.6vw] text-muted leading-snug text-pretty">
            Web + mobile, local generation, PDF export.
          </div>
        </div>

        <div className="relative flex flex-col">
          <div className="w-[1.6vw] h-[1.6vw] rounded-full bg-primary/60 border-[0.4vw] border-bg z-10" />
          <div className="mt-[3vh] font-body text-[1.5vw] uppercase tracking-[0.25em] text-primary">
            Next
          </div>
          <div className="mt-[1.5vh] font-display font-semibold text-[2.1vw] text-text leading-tight">
            Multi-page chapters
          </div>
          <div className="mt-[1.5vh] font-body text-[1.6vw] text-muted leading-snug text-pretty">
            Persistent character LoRAs, page-to-page continuity.
          </div>
        </div>

        <div className="relative flex flex-col">
          <div className="w-[1.6vw] h-[1.6vw] rounded-full bg-primary/30 border-[0.4vw] border-bg z-10" />
          <div className="mt-[3vh] font-body text-[1.5vw] uppercase tracking-[0.25em] text-muted">
            Later
          </div>
          <div className="mt-[1.5vh] font-display font-semibold text-[2.1vw] text-text leading-tight">
            Collaborative panels
          </div>
          <div className="mt-[1.5vh] font-body text-[1.6vw] text-muted leading-snug text-pretty">
            Share a project, co-write the script, divide the inking.
          </div>
        </div>

        <div className="relative flex flex-col">
          <div className="w-[1.6vw] h-[1.6vw] rounded-full bg-border border-[0.4vw] border-bg z-10" />
          <div className="mt-[3vh] font-body text-[1.5vw] uppercase tracking-[0.25em] text-muted">
            Vision
          </div>
          <div className="mt-[1.5vh] font-display font-semibold text-[2.1vw] text-text leading-tight">
            Reader marketplace
          </div>
          <div className="mt-[1.5vh] font-body text-[1.6vw] text-muted leading-snug text-pretty">
            Publish forged comics straight to a built-in mobile reader.
          </div>
        </div>
      </div>
    </div>
  );
}
