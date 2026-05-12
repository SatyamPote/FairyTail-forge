import { create } from 'zustand';
import { Project, Panel, Character, Genre } from '@/types';

interface AppState {
  currentProject: Project | null;
  projects: Project[];
  isGeneratingStory: boolean;
  isGeneratingImages: boolean;
  generationQueue: string[]; // List of panel IDs
  availableModels: string[];
  selectedModel: string;
  
  setCurrentProject: (project: Project | null) => void;
  setProjects: (projects: Project[]) => void;
  updatePanel: (panelId: string, updates: Partial<Panel>) => void;
  addToQueue: (panelIds: string[]) => void;
  removeFromQueue: (panelId: string) => void;
  setGeneratingStory: (status: boolean) => void;
  setGeneratingImages: (status: boolean) => void;
  setAvailableModels: (models: string[]) => void;
  setSelectedModel: (model: string) => void;
}

export const useStore = create<AppState>((set) => ({
  currentProject: null,
  projects: [],
  isGeneratingStory: false,
  isGeneratingImages: false,
  generationQueue: [],
  availableModels: [],
  selectedModel: 'phi3:latest',

  setCurrentProject: (project) => set({ currentProject: project }),
  setProjects: (projects) => set({ projects }),
  
  updatePanel: (panelId, updates) => set((state) => {
    if (!state.currentProject) return state;
    const updatedPanels = state.currentProject.panels.map((p) => 
      p.id === panelId ? { ...p, ...updates } : p
    );
    return {
      currentProject: {
        ...state.currentProject,
        panels: updatedPanels
      }
    };
  }),

  addToQueue: (panelIds) => set((state) => ({
    generationQueue: [...state.generationQueue, ...panelIds]
  })),

  removeFromQueue: (panelId) => set((state) => ({
    generationQueue: state.generationQueue.filter(id => id !== panelId)
  })),

  setGeneratingStory: (status) => set({ isGeneratingStory: status }),
  setGeneratingImages: (status) => set({ isGeneratingImages: status }),
  setAvailableModels: (models) => set({ availableModels: models }),
  setSelectedModel: (model) => set({ selectedModel: model }),
}));
