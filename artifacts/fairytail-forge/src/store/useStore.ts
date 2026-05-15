import { create } from 'zustand';
import { Project, Panel, Page, Character, Genre, StudioTheme } from '@/types';

interface AppState {
  currentProject: Project | null;
  projects: Project[];
  currentPageIndex: number;
  isGeneratingStory: boolean;
  isGeneratingImages: boolean;
  generationQueue: string[];
  availableModels: string[];
  selectedModel: string;
  studioTheme: StudioTheme;

  setCurrentProject: (project: Project | null) => void;
  setProjects: (projects: Project[]) => void;
  setCurrentPageIndex: (index: number) => void;
  updatePanel: (panelId: string, updates: Partial<Panel>) => void;
  addToQueue: (panelIds: string[]) => void;
  removeFromQueue: (panelId: string) => void;
  setGeneratingStory: (status: boolean) => void;
  setGeneratingImages: (status: boolean) => void;
  setAvailableModels: (models: string[]) => void;
  setSelectedModel: (model: string) => void;
  setStudioTheme: (theme: StudioTheme) => void;
}

export const useStore = create<AppState>((set) => ({
  currentProject: null,
  projects: [],
  currentPageIndex: 0,
  isGeneratingStory: false,
  isGeneratingImages: false,
  generationQueue: [],
  availableModels: [],
  selectedModel: 'phi3:latest',
  studioTheme: 'studio-dark',

  setCurrentProject: (project) => set({ currentProject: project, currentPageIndex: 0 }),
  setProjects: (projects) => set({ projects }),
  setCurrentPageIndex: (index) => set({ currentPageIndex: index }),

  updatePanel: (panelId, updates) =>
    set((state) => {
      if (!state.currentProject) return state;

      const updatedPages = state.currentProject.pages.map((page) => ({
        ...page,
        panels: page.panels.map((p) => (p.id === panelId ? { ...p, ...updates } : p)),
      }));

      return {
        currentProject: {
          ...state.currentProject,
          pages: updatedPages,
        },
      };
    }),

  addToQueue: (panelIds) =>
    set((state) => ({
      generationQueue: [...state.generationQueue, ...panelIds],
    })),

  removeFromQueue: (panelId) =>
    set((state) => ({
      generationQueue: state.generationQueue.filter((id) => id !== panelId),
    })),

  setGeneratingStory: (status) => set({ isGeneratingStory: status }),
  setGeneratingImages: (status) => set({ isGeneratingImages: status }),
  setAvailableModels: (models) => set({ availableModels: models }),
  setSelectedModel: (model) => set({ selectedModel: model }),
  setStudioTheme: (theme) => set({ studioTheme: theme }),
}));
