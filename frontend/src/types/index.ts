export type Genre = 'sci-fi' | 'cyberpunk' | 'fantasy' | 'comedy' | 'horror' | 'slice of life';

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
  status: 'pending' | 'generating' | 'completed' | 'failed';
}

export interface Project {
  id: string;
  title: string;
  genre: Genre;
  numPanels: number;
  panels: Panel[];
  characters: Character[];
  createdAt: string;
  updatedAt: string;
}

export interface StoryGenerationResponse {
  title: string;
  characters: Omit<Character, 'id'>[];
  panels: Omit<Panel, 'id' | 'status'>[];
}
