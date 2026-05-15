import { Character } from "@/types";

export const MANGA_STYLE_PREFIX = [
  "masterpiece",
  "black and white manga",
  "clean ink line art",
  "manga panel",
  "comic storyboard",
  "sharp outlines",
  "high contrast",
  "professional manga illustration",
  "monochrome",
  "dynamic composition",
  "detailed line work",
  "anime comic style",
  "white background",
  "black ink",
].join(", ");

export const MANGA_NEGATIVE_PROMPT = [
  "color",
  "colour",
  "painting",
  "watercolor",
  "photorealistic",
  "photograph",
  "cgi",
  "3d render",
  "blurry",
  "low quality",
  "bad anatomy",
  "distorted face",
  "extra limbs",
  "realistic lighting",
  "saturated",
  "vibrant colors",
].join(", ");

interface BuildOptions {
  scene: string;
  characters?: Character[];
}

export function buildMangaPrompt({ scene, characters }: BuildOptions): string {
  const sceneText = (scene || "").trim() || "a manga panel";

  const castSnippet =
    characters && characters.length > 0
      ? `Characters: ${characters
          .slice(0, 3)
          .map((c) => `${c.name} (${(c.appearance || c.description || "").trim()})`)
          .filter(Boolean)
          .join("; ")}`
      : "";

  return [MANGA_STYLE_PREFIX, `Scene: ${sceneText}`, castSnippet]
    .filter(Boolean)
    .join(", ");
}
