import { Genre } from "@/types";

interface DemoStoryArgs {
  prompt: string;
  genre: Genre;
  numPanels: number;
}

interface DemoPanel {
  panelNumber: number;
  narration: string;
  dialogue: string;
  imagePrompt: string;
}

interface DemoStory {
  title: string;
  characters: { name: string; description: string; appearance: string }[];
  panels: DemoPanel[];
}

const TITLE_BY_GENRE: Record<Genre, string[]> = {
  "sci-fi": ["Echoes of Tomorrow", "The Last Signal", "Orbital Drift"],
  cyberpunk: ["Neon Static", "Chrome Heart", "Ghost in the Wire"],
  fantasy: ["The Cursed Hollow", "Ashen Crown", "Whispers of the Old Wood"],
  comedy: ["Total Disaster", "The Wrong Spell", "Snack Quest"],
  horror: ["Silent Hours", "The Hollow Below", "Bone Lullaby"],
  "slice of life": ["Quiet Mornings", "The Window Seat", "After the Rain"],
};

const CHARACTERS_BY_GENRE: Record<Genre, DemoStory["characters"]> = {
  "sci-fi": [
    {
      name: "Kaito",
      description: "A reluctant pilot haunted by a mission gone wrong.",
      appearance:
        "lean build, short dark hair, scar across left brow, worn flight suit",
    },
    {
      name: "VEX",
      description: "A salvaged AI fragment with a wry sense of humor.",
      appearance: "floating angular drone, glowing single eye, scratched chassis",
    },
  ],
  cyberpunk: [
    {
      name: "Rin",
      description: "A burned-out netrunner chasing a ghost in the data.",
      appearance: "shaved sides, long fringe, neural jack at temple, leather jacket",
    },
    {
      name: "Hex",
      description: "A street fixer who knows everyone and trusts no one.",
      appearance: "tall, mirrored shades, cybernetic right arm, long coat",
    },
  ],
  fantasy: [
    {
      name: "Aria",
      description: "A young apprentice carrying her master's last secret.",
      appearance: "small frame, braided hair, tattered traveler's cloak, oak staff",
    },
    {
      name: "Borren",
      description: "An old swordsman one fight away from retirement.",
      appearance: "broad shoulders, grey beard, chipped longsword, scarred hands",
    },
  ],
  comedy: [
    {
      name: "Momo",
      description: "Constantly hungry, constantly causing chaos.",
      appearance: "round face, messy bob, oversized hoodie, perpetual snack in hand",
    },
    {
      name: "Tato",
      description: "Momo's deeply tired best friend.",
      appearance: "tall, slouched, glasses crooked, expression of mild despair",
    },
  ],
  horror: [
    {
      name: "Ellis",
      description: "A grief-stricken doctor returning to her childhood town.",
      appearance: "thin, dark circles, long coat, clutched leather notebook",
    },
    {
      name: "The Watcher",
      description: "Something old that remembers her name.",
      appearance: "tall silhouette, hollow features, fingers too long",
    },
  ],
  "slice of life": [
    {
      name: "Yuna",
      description: "A quiet barista who sketches strangers in her notebook.",
      appearance: "small build, apron, soft smile, pencil tucked behind ear",
    },
    {
      name: "Sora",
      description: "A regular customer who never orders the same thing twice.",
      appearance: "tall, oversized scarf, kind eyes, always carrying a book",
    },
  ],
};

const SCENE_BEATS: Record<Genre, string[]> = {
  "sci-fi": [
    "Wide shot of a silent ship drifting past a dead star. The hull groans.",
    "Close-up on the protagonist's eyes reflecting a faint signal on the console.",
    "A flashback fragment: a hand reaching toward someone already gone.",
    "Tight panel: gloved fingers hovering over a single red switch.",
    "Wide shot: the protagonist stepping into a corridor lit only by emergency strobes.",
    "Final beat: a small, fragile thing — a bloom, a memory — held against the void.",
  ],
  cyberpunk: [
    "Rain-slicked alley. Neon signs bleed into puddles. The protagonist exhales smoke.",
    "Close-up of a cracked phone screen showing an impossible message.",
    "Rooftop wide shot: silhouettes against a wall of advertising drones.",
    "Inside a cramped apartment lit only by monitors. Cables everywhere.",
    "Chase fragment: blur of motion across a pedestrian bridge.",
    "Final beat: the protagonist alone, staring at a city that doesn't notice.",
  ],
  fantasy: [
    "Wide vista of a misty valley. A lone figure on a winding road.",
    "Close-up of a hand drawing a weapon, knuckles tense.",
    "Inside a candlelit cottage. An old map spread across a worn table.",
    "A creature watching from the treeline. Only the eyes are clear.",
    "The protagonist kneeling in tall grass, listening to something only they hear.",
    "Final beat: dawn breaking over the ridge. The journey is just beginning.",
  ],
  comedy: [
    "The protagonist tripping spectacularly while carrying too many groceries.",
    "Close-up: their friend giving the most exhausted look in the universe.",
    "A cat watching the disaster unfold with mild interest.",
    "An overhead shot of the kitchen, somehow on fire and covered in flour.",
    "Both characters frozen, staring at the same impossible thing.",
    "Final beat: the two of them eating cereal in the wreckage. Worth it.",
  ],
  horror: [
    "An empty hallway. Wallpaper peeling. A door at the end, slightly open.",
    "Close-up of a hand reaching for a doorknob that wasn't there a second ago.",
    "A figure in a doorway, just out of focus, just too tall.",
    "The protagonist's reflection — but it isn't moving with them.",
    "Footsteps in dust where no one walked. The trail leads upstairs.",
    "Final beat: a single eye, opening in the dark.",
  ],
  "slice of life": [
    "Morning light through a kitchen window. Steam from a quiet kettle.",
    "Close-up of hands wrapped around a warm mug.",
    "Two people sitting on a bench, not talking, watching the same thing.",
    "A page being turned in a worn notebook full of small drawings.",
    "Walking together down a long quiet street after the rain.",
    "Final beat: a small, honest smile. The day is enough.",
  ],
};

const DIALOGUE_BEATS: Record<Genre, string[]> = {
  "sci-fi": [
    "\"Tell me again why we came back.\"",
    "\"Because no one else will.\"",
    "\"This frequency shouldn't exist.\"",
    "\"It's not a signal. It's a name.\"",
    "\"Don't open it.\"",
    "\"I have to.\"",
  ],
  cyberpunk: [
    "\"The job's clean. Three minutes, in and out.\"",
    "\"Nothing in this city is clean.\"",
    "\"Who's the buyer?\"",
    "\"You don't want to know.\"",
    "\"…I want to know.\"",
    "\"Then run.\"",
  ],
  fantasy: [
    "\"You shouldn't have come this far alone.\"",
    "\"There was no one else.\"",
    "\"The old roads remember.\"",
    "\"Then let them remember me too.\"",
    "\"This blade has a name.\"",
    "\"Don't say it yet.\"",
  ],
  comedy: [
    "\"I CAN FIX THIS.\"",
    "\"You absolutely cannot.\"",
    "\"Why is the toaster on fire.\"",
    "\"You put bread in it.\"",
    "\"BREAD ISN'T SUPPOSED TO DO THIS.\"",
    "\"…valid.\"",
  ],
  horror: [
    "\"Did you hear that?\"",
    "\"…no.\"",
    "\"It's in the walls.\"",
    "\"It's been in the walls.\"",
    "\"How long?\"",
    "\"Longer than you've been here.\"",
  ],
  "slice of life": [
    "\"Same as yesterday?\"",
    "\"Surprise me.\"",
    "\"It's quiet today.\"",
    "\"I like it like this.\"",
    "\"Want to walk a bit?\"",
    "\"Yeah. Let's.\"",
  ],
};

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

export function generateDemoStory({
  prompt,
  genre,
  numPanels,
}: DemoStoryArgs): DemoStory {
  const trimmed = prompt.trim();
  const seed = trimmed
    .split(/\s+/)
    .slice(0, 6)
    .join(" ")
    .replace(/[^\w\s]/g, "")
    .trim();
  const titleSeeds = TITLE_BY_GENRE[genre];
  const title = seed
    ? `${seed.charAt(0).toUpperCase() + seed.slice(1)}`
    : pick(titleSeeds, Math.floor(Math.random() * titleSeeds.length));

  const characters = CHARACTERS_BY_GENRE[genre];
  const beats = SCENE_BEATS[genre];
  const dialogue = DIALOGUE_BEATS[genre];

  const panels: DemoPanel[] = [];
  for (let i = 0; i < numPanels; i++) {
    const beat = pick(beats, i);
    const line = pick(dialogue, i);
    const isFirst = i === 0;
    const isLast = i === numPanels - 1;
    const narration = isFirst
      ? `${title}. ${trimmed || "A story begins where the silence ends."}`
      : isLast
        ? "And so, this chapter quiets. The next one waits."
        : beat;
    panels.push({
      panelNumber: i + 1,
      narration,
      dialogue: line,
      imagePrompt: `${beat} Featuring ${characters[i % characters.length].name}.`,
    });
  }

  return { title, characters, panels };
}

// ---------------------------------------------------------------------------
// Bundled offline image generation: deterministic SVG manga placeholders.
// Returned as a data: URI so expo-image can render them with no network.
// ---------------------------------------------------------------------------

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

interface DemoImageArgs {
  panelNumber: number;
  prompt: string;
  narration?: string;
  genre?: Genre;
}

export function generateDemoImage({
  panelNumber,
  prompt,
  narration,
  genre = "sci-fi",
}: DemoImageArgs): string {
  const W = 720;
  const H = 720;
  const seed = hashString(`${panelNumber}|${prompt}|${genre}`);
  const variant = seed % 4;

  // Speed-line / background elements vary by variant for visual rhythm.
  let backdrop = "";
  if (variant === 0) {
    // radial speed lines
    const cx = 360;
    const cy = 320;
    const lines: string[] = [];
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      const inner = 80 + ((seed >> i) & 0x3f);
      const outer = 520;
      const x1 = cx + Math.cos(angle) * inner;
      const y1 = cy + Math.sin(angle) * inner;
      const x2 = cx + Math.cos(angle) * outer;
      const y2 = cy + Math.sin(angle) * outer;
      lines.push(
        `<line x1="${x1.toFixed(0)}" y1="${y1.toFixed(0)}" x2="${x2.toFixed(0)}" y2="${y2.toFixed(0)}" stroke="#000" stroke-width="2" opacity="0.55"/>`,
      );
    }
    backdrop = lines.join("");
  } else if (variant === 1) {
    // diagonal action lines
    const lines: string[] = [];
    for (let i = -10; i < 30; i++) {
      const x = i * 36;
      lines.push(
        `<line x1="${x}" y1="0" x2="${x + 360}" y2="${H}" stroke="#000" stroke-width="${i % 3 === 0 ? 3 : 1}" opacity="0.7"/>`,
      );
    }
    backdrop = lines.join("");
  } else if (variant === 2) {
    // halftone dots
    const dots: string[] = [];
    for (let y = 24; y < H; y += 28) {
      for (let x = 24; x < W; x += 28) {
        const r = ((seed >> ((x + y) & 0x1f)) & 0x7) * 0.4 + 1.6;
        dots.push(
          `<circle cx="${x}" cy="${y}" r="${r.toFixed(1)}" fill="#000" opacity="0.55"/>`,
        );
      }
    }
    backdrop = dots.join("");
  } else {
    // horizon + sun rays
    const rays: string[] = [];
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI;
      const x2 = 360 + Math.cos(a) * 600;
      const y2 = 380 - Math.sin(a) * 600;
      rays.push(
        `<line x1="360" y1="380" x2="${x2.toFixed(0)}" y2="${y2.toFixed(0)}" stroke="#000" stroke-width="2" opacity="0.5"/>`,
      );
    }
    backdrop =
      rays.join("") +
      `<rect x="0" y="380" width="${W}" height="${H - 380}" fill="#000" opacity="0.08"/>`;
  }

  // Foreground silhouette varies per panel for "characters present"
  const silhouettes = [
    // standing figure
    `<g transform="translate(360,420)">
      <ellipse cx="0" cy="-140" rx="38" ry="44" fill="#000"/>
      <path d="M -50 -100 Q 0 -120 50 -100 L 70 60 L 35 240 L 12 240 L 0 80 L -12 240 L -35 240 L -70 60 Z" fill="#000"/>
    </g>`,
    // two figures
    `<g>
      <g transform="translate(260,440)">
        <circle cx="0" cy="-130" r="36" fill="#000"/>
        <path d="M -45 -95 L 45 -95 L 60 60 L 30 220 L 10 220 L 0 80 L -10 220 L -30 220 L -60 60 Z" fill="#000"/>
      </g>
      <g transform="translate(470,460)">
        <circle cx="0" cy="-120" r="32" fill="#000"/>
        <path d="M -40 -88 L 40 -88 L 55 60 L 28 200 L 10 200 L 0 80 L -10 200 L -28 200 L -55 60 Z" fill="#000"/>
      </g>
    </g>`,
    // close-up face
    `<g transform="translate(360,360)">
      <ellipse cx="0" cy="0" rx="180" ry="220" fill="#000"/>
      <ellipse cx="-55" cy="-30" rx="22" ry="14" fill="#fff"/>
      <ellipse cx="55" cy="-30" rx="22" ry="14" fill="#fff"/>
      <ellipse cx="-55" cy="-30" rx="8" ry="10" fill="#000"/>
      <ellipse cx="55" cy="-30" rx="8" ry="10" fill="#000"/>
      <path d="M -60 60 Q 0 80 60 60" stroke="#fff" stroke-width="6" fill="none"/>
    </g>`,
    // wide landscape (no figure, just shapes)
    `<g>
      <path d="M 0 480 L 180 360 L 320 440 L 480 320 L 720 460 L 720 720 L 0 720 Z" fill="#000"/>
      <path d="M 60 720 L 60 540 L 100 540 L 100 720 Z" fill="#fff" opacity="0.9"/>
      <path d="M 640 720 L 640 580 L 680 580 L 680 720 Z" fill="#fff" opacity="0.9"/>
    </g>`,
  ];
  const figure = silhouettes[panelNumber % silhouettes.length];

  // Caption strip at bottom — narration text, manga-style.
  const caption = (narration || prompt).slice(0, 90);
  const captionStrip = caption
    ? `<g>
        <rect x="0" y="${H - 96}" width="${W}" height="96" fill="#fff"/>
        <rect x="0" y="${H - 96}" width="${W}" height="4" fill="#000"/>
        <foreignObject x="24" y="${H - 86}" width="${W - 48}" height="78">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: serif; font-size: 20px; line-height: 1.3; color: #000;">${escapeXml(caption)}</div>
        </foreignObject>
      </g>`
    : "";

  // Panel number badge (top-left)
  const badge = `<g>
    <rect x="20" y="20" width="62" height="40" fill="#000"/>
    <text x="51" y="48" text-anchor="middle" font-family="serif" font-size="22" font-weight="700" fill="#fff">#${panelNumber}</text>
  </g>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="#fff"/>
    ${backdrop}
    ${figure}
    ${captionStrip}
    ${badge}
    <rect x="3" y="3" width="${W - 6}" height="${H - 6}" fill="none" stroke="#000" stroke-width="6"/>
  </svg>`;

  // data: URI works in expo-image (web + native).
  const encoded = encodeURIComponent(svg).replace(/%20/g, " ");
  return `data:image/svg+xml;utf8,${encoded}`;
}
