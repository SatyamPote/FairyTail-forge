export type Genre =
  | "sci-fi"
  | "cyberpunk"
  | "fantasy"
  | "comedy"
  | "horror"
  | "slice of life";

export type StudioTheme =
  | "studio-dark"
  | "manga-white"
  | "cyberpunk-neon"
  | "retro-comic"
  | "noir-matte";

export interface Character {
  id: string;
  name: string;
  description: string;
  appearance: string;
  imageUrl?: string;
}

export interface Panel {
  id: string;
  panelNumber: number;
  prompt: string;
  negativePrompt?: string;
  content?: string;
  narration?: string;
  dialogue?: string;
  imagePath?: string;
  status: "pending" | "generating" | "completed" | "failed";
}

export interface Page {
  id: string;
  pageNumber: number;
  panels: Panel[];
  isCover?: boolean;
}

export interface Project {
  id: string;
  title: string;
  genre: Genre;
  theme: StudioTheme;
  pages: Page[];
  characters: Character[];
  createdAt: string;
  updatedAt: string;
}
