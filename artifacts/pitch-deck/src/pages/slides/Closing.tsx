export default function Closing() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg flex flex-col items-start justify-center px-[6vw]">
      <div className="absolute top-0 left-[6vw] right-[6vw] h-[0.3vh] bg-border" />
      <div className="absolute top-0 left-[6vw] w-[12vw] h-[0.3vh] bg-primary" />

      <div className="absolute top-[6vh] left-[6vw] flex items-center gap-[1vw]">
        <div className="w-[1.6vw] h-[1.6vw] rounded-sm bg-primary" />
        <span className="font-display font-semibold text-[1.6vw] tracking-wide text-text">
          FairyTail Forge
        </span>
      </div>

      <div className="font-body text-[1.5vw] uppercase tracking-[0.3em] text-primary">
        Help us forge the next chapter
      </div>

      <h2 className="mt-[3vh] font-display font-extrabold text-[8vw] leading-[0.9] tracking-tighter text-text max-w-[80vw] text-balance">
        Stories,
        <span className="block text-primary">at the speed of imagination.</span>
      </h2>

      <div className="mt-[6vh] grid grid-cols-3 gap-[3vw] w-full max-w-[70vw]">
        <div>
          <div className="font-body text-[1.4vw] uppercase tracking-[0.25em] text-muted">
            Web
          </div>
          <div className="mt-[1vh] font-body text-[1.8vw] text-text">
            fairytailforge.app
          </div>
        </div>
        <div>
          <div className="font-body text-[1.4vw] uppercase tracking-[0.25em] text-muted">
            Mobile
          </div>
          <div className="mt-[1vh] font-body text-[1.8vw] text-text">
            iOS · Android beta
          </div>
        </div>
        <div>
          <div className="font-body text-[1.4vw] uppercase tracking-[0.25em] text-muted">
            Contact
          </div>
          <div className="mt-[1vh] font-body text-[1.8vw] text-text">
            hello@fairytailforge.app
          </div>
        </div>
      </div>
    </div>
  );
}
