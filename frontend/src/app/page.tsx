'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ComicCanvas } from '@/components/ComicCanvas';
import { StoryGeneratorModal } from '@/components/StoryGeneratorModal';
import { Wand2, Sparkles, Plus } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useQueue } from '@/hooks/useQueue';

export default function Home() {
  useQueue(); // Initialize the sequential generation queue
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentProject } = useStore();

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            {currentProject && (
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-indigo-600 rounded text-[10px] font-bold uppercase tracking-wider">Project</span>
                <span className="text-sm font-medium text-slate-300">{currentProject.title}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-sm font-medium transition-all"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 border border-indigo-400/30 flex items-center justify-center text-[10px] font-bold shadow-lg shadow-indigo-500/20">
              FT
            </div>
          </div>
        </header>

        {/* Canvas Area */}
        <ComicCanvas />

        {/* Floating Action Button (if no project) */}
        {!currentProject && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="fixed bottom-12 right-12 w-16 h-16 bg-indigo-600 hover:bg-indigo-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/40 transition-all hover:scale-110 active:scale-95 animate-bounce group"
          >
            <Wand2 className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
          </button>
        )}
      </main>

      {/* Modals */}
      <StoryGeneratorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
