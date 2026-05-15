export default function Audience() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg px-[6vw] py-[8vh] flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-[0.3vh] bg-border" />
      <div className="absolute top-0 left-[6vw] w-[8vw] h-[0.3vh] bg-primary" />

      <div className="font-body text-[1.5vw] uppercase tracking-[0.3em] text-primary">
        05 — Who it's for
      </div>

      <h2 className="mt-[3vh] font-display font-extrabold text-[5vw] leading-[0.95] tracking-tighter text-text max-w-[70vw] text-balance">
        Storytellers who'd rather draft than draw.
      </h2>

      <div className="mt-[7vh] grid grid-cols-3 gap-[2.5vw] flex-1">
        <div className="border-l-2 border-primary pl-[2vw] flex flex-col justify-center">
          <div className="font-display font-semibold text-[2.4vw] text-text leading-tight">
            Indie writers
          </div>
          <div className="mt-[2vh] font-body text-[1.7vw] text-muted leading-snug text-pretty">
            Ship a webcomic chapter on a weekend. No collaborator required.
          </div>
        </div>
        <div className="border-l-2 border-primary pl-[2vw] flex flex-col justify-center">
          <div className="font-display font-semibold text-[2.4vw] text-text leading-tight">
            Educators
          </div>
          <div className="mt-[2vh] font-body text-[1.7vw] text-muted leading-snug text-pretty">
            Turn a lesson into a comic strip your class will actually read.
          </div>
        </div>
        <div className="border-l-2 border-primary pl-[2vw] flex flex-col justify-center">
          <div className="font-display font-semibold text-[2.4vw] text-text leading-tight">
            Privacy-first hobbyists
          </div>
          <div className="mt-[2vh] font-body text-[1.7vw] text-muted leading-snug text-pretty">
            Run everything on local hardware. No accounts, no usage caps, no upload.
          </div>
        </div>
      </div>
    </div>
  );
}
