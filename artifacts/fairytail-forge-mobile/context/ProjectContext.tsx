import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { apiUrl } from "@/lib/api";
import { Panel, Project } from "@/types";

const STORAGE_KEY = "ff.projects.v1";
const CURRENT_KEY = "ff.currentProjectId.v1";

interface ProjectContextValue {
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  updatePanel: (panelId: string, updates: Partial<Panel>) => void;
  enqueuePanels: (panelIds: string[]) => void;
  isGeneratingImages: boolean;
  queueLength: number;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProjectState] = useState<Project | null>(
    null,
  );
  const [queue, setQueue] = useState<string[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const initialized = useRef(false);
  const isProcessing = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const [raw, currentId] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(CURRENT_KEY),
        ]);
        if (raw) {
          const parsed = JSON.parse(raw) as Project[];
          setProjects(parsed);
          if (currentId) {
            const cur = parsed.find((p) => p.id === currentId);
            if (cur) setCurrentProjectState(cur);
          }
        }
      } catch (err) {
        console.warn("Failed to load projects", err);
      } finally {
        initialized.current = true;
      }
    })();
  }, []);

  useEffect(() => {
    if (!initialized.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(projects)).catch(() => {});
  }, [projects]);

  useEffect(() => {
    if (!initialized.current) return;
    if (currentProject?.id) {
      AsyncStorage.setItem(CURRENT_KEY, currentProject.id).catch(() => {});
    } else {
      AsyncStorage.removeItem(CURRENT_KEY).catch(() => {});
    }
  }, [currentProject?.id]);

  const setCurrentProject = useCallback((project: Project | null) => {
    setCurrentProjectState(project);
  }, []);

  const addProject = useCallback((project: Project) => {
    setProjects((prev) => [project, ...prev.filter((p) => p.id !== project.id)]);
    setCurrentProjectState(project);
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    setCurrentProjectState((cur) => (cur?.id === projectId ? null : cur));
  }, []);

  const updatePanel = useCallback(
    (panelId: string, updates: Partial<Panel>) => {
      const apply = (project: Project): Project => ({
        ...project,
        pages: project.pages.map((page) => ({
          ...page,
          panels: page.panels.map((p) =>
            p.id === panelId ? { ...p, ...updates } : p,
          ),
        })),
      });

      setProjects((prev) => prev.map((p) => apply(p)));
      setCurrentProjectState((cur) => (cur ? apply(cur) : cur));
    },
    [],
  );

  const enqueuePanels = useCallback((panelIds: string[]) => {
    setQueue((prev) => {
      const seen = new Set(prev);
      const additions = panelIds.filter((id) => !seen.has(id));
      return additions.length > 0 ? [...prev, ...additions] : prev;
    });
  }, []);

  // Sequential image generation queue
  useEffect(() => {
    if (queue.length === 0 || isProcessing.current) return;

    isProcessing.current = true;
    setIsGeneratingImages(true);
    const panelId = queue[0];

    (async () => {
      // Find panel across all projects
      let foundPanel: Panel | undefined;
      for (const project of projects) {
        for (const page of project.pages) {
          const p = page.panels.find((pp) => pp.id === panelId);
          if (p) {
            foundPanel = p;
            break;
          }
        }
        if (foundPanel) break;
      }

      if (!foundPanel) {
        setQueue((q) => q.slice(1));
        isProcessing.current = false;
        return;
      }

      updatePanel(panelId, { status: "generating" });

      try {
        const response = await fetch(apiUrl("/api/image"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: foundPanel.prompt,
            negativePrompt: foundPanel.negativePrompt,
          }),
        });

        if (!response.ok) throw new Error("Image generation failed");
        const data = (await response.json()) as { imagePath?: string };
        updatePanel(panelId, {
          status: "completed",
          imagePath: data.imagePath,
        });
      } catch (err) {
        console.warn("Image generation failed", err);
        updatePanel(panelId, { status: "failed" });
      } finally {
        setQueue((q) => q.slice(1));
        isProcessing.current = false;
      }
    })();
  }, [queue, projects, updatePanel]);

  useEffect(() => {
    if (queue.length === 0 && !isProcessing.current) {
      setIsGeneratingImages(false);
    }
  }, [queue]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        setCurrentProject,
        addProject,
        deleteProject,
        updatePanel,
        enqueuePanels,
        isGeneratingImages,
        queueLength: queue.length,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectProvider");
  return ctx;
}
