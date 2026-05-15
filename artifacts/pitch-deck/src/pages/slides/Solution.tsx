export default function Solution() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg px-[6vw] py-[8vh] flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-[0.3vh] bg-border" />
      <div className="absolute top-0 left-[6vw] w-[8vw] h-[0.3vh] bg-primary" />

      <div className="font-body text-[1.5vw] uppercase tracking-[0.3em] text-primary">
        02 — Solution
      </div>

      <h2 className="mt-[3vh] font-display font-extrabold text-[5vw] leading-[0.95] tracking-tighter text-text max-w-[80vw] text-balance">
        A one-prompt comic studio that runs on your machine.
      </h2>

      <div className="mt-[6vh] grid grid-cols-3 gap-[2.5vw] flex-1">
        <div className="bg-bg-elevated border border-border p-[3vh]">
          <div className="font-display font-extrabold text-[2.4vw] text-primary leading-none">
            01
          </div>
          <div className="mt-[2vh] font-display font-semibold text-[2.2vw] text-text leading-tight">
            Write a prompt
          </div>
          <div className="mt-[1.5vh] font-body text-[1.6vw] text-muted leading-snug text-pretty">
            Describe your story. Pick a genre and panel count. That's the whole input.
          </div>
        </div>
        <div className="bg-bg-elevated border border-border p-[3vh]">
          <div className="font-display font-extrabold text-[2.4vw] text-primary leading-none">
            02
          </div>
          <div className="mt-[2vh] font-display font-semibold text-[2.2vw] text-text leading-tight">
            Local LLM scripts it
          </div>
          <div className="mt-[1.5vh] font-body text-[1.6vw] text-muted leading-snug text-pretty">
            Ollama streams a full script — characters, dialog, panel-by-panel scene direction.
          </div>
        </div>
        <div className="bg-bg-elevated border border-border p-[3vh]">
          <div className="font-display font-extrabold text-[2.4vw] text-primary leading-none">
            03
          </div>
          <div className="mt-[2vh] font-display font-semibold text-[2.2vw] text-text leading-tight">
            Local SD inks it
          </div>
          <div className="mt-[1.5vh] font-body text-[1.6vw] text-muted leading-snug text-pretty">
            Stable Diffusion paints each panel sequentially. Export to PDF when done.
          </div>
        </div>
      </div>

      <div className="mt-[5vh] font-body text-[1.6vw] text-muted">
        Zero cloud calls. Zero subscriptions. Your story never leaves the device.
      </div>
    </div>
  );
}
