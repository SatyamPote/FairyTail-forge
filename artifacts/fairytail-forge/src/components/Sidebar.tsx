import React from 'react';
import {
  LayoutGrid,
  PlusCircle,
  History,
  Settings,
  Users,
  Download,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { clsx } from 'clsx';
import { CharacterList } from './CharacterList';

export const Sidebar = () => {
  const { projects, currentProject, setCurrentProject } = useStore();

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col h-full overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold font-display tracking-tight">FairyTail Forge</h1>
        </div>

        <nav className="space-y-1">
          <div className="sidebar-item active">
            <LayoutGrid className="w-5 h-5" />
            <span>Editor</span>
          </div>
          <div className="sidebar-item">
            <PlusCircle className="w-5 h-5" />
            <span>New Story</span>
          </div>
          <div className="sidebar-item">
            <Users className="w-5 h-5" />
            <span>Characters</span>
          </div>
          <div className="sidebar-item">
            <History className="w-5 h-5" />
            <span>History</span>
          </div>
          <div className="sidebar-item">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </div>
        </nav>
      </div>

      <CharacterList />

      <div className="mt-auto p-4 border-t border-slate-800">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
          Your Projects
        </div>
        <div className="space-y-1 max-h-[300px] overflow-y-auto">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => setCurrentProject(project)}
              className={clsx(
                'sidebar-item text-sm truncate',
                currentProject?.id === project.id && 'active'
              )}
            >
              <Layers className="w-4 h-4" />
              <span className="truncate">{project.title}</span>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="px-4 py-3 text-sm text-slate-600 italic">No projects yet</div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-slate-800">
        <button className="w-full py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
          <Download className="w-4 h-4" />
          Export All
        </button>
      </div>
    </aside>
  );
};
