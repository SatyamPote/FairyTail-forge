'use client';

import { Loader2, Sparkles, Wand2, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import { useStore } from '@/store/useStore';
import { PanelCard } from './PanelCard';
import React from 'react';

export const ComicCanvas = () => {
  const { currentProject, isGeneratingImages, addToQueue } = useStore();

  const handleExport = async () => {
    if (!currentProject) return;
    
    const element = document.getElementById('comic-content');
    if (!element) return;

    try {
      const dataUrl = await toPng(element, { quality: 0.95 });
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [element.offsetWidth, element.offsetHeight]
      });
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, element.offsetWidth, element.offsetHeight);
      pdf.save(`${currentProject.title.replace(/\s+/g, '_')}_comic.pdf`);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleGenerateAll = () => {
    if (!currentProject) return;
    const pendingPanelIds = currentProject.panels
      .filter(p => p.status === 'pending' || p.status === 'failed')
      .map(p => p.id);
    addToQueue(pendingPanelIds);
  };

  if (!currentProject) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6">
          <Sparkles className="w-10 h-10 text-indigo-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2 font-display">Start Your Masterpiece</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-8">
          Use the story generator to create a script, then watch as the AI brings your characters to life panel by panel.
        </p>
        <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95">
          <Wand2 className="w-5 h-5" />
          Generate Story
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-900/30">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-display">{currentProject.title}</h1>
            <p className="text-slate-500 capitalize">{currentProject.genre} • {currentProject.numPanels} Panels</p>
          </div>
          <div className="flex gap-3">
            {isGeneratingImages && (
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 border border-indigo-500/50 rounded-lg text-indigo-400 text-sm font-medium">
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Panels...
              </div>
            )}
            <button 
              onClick={handleGenerateAll}
              disabled={isGeneratingImages}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-all border border-slate-700"
            >
              Generate All
            </button>
            <button 
              onClick={handleExport}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Comic
            </button>
          </div>
        </div>

        <div 
          id="comic-content" 
          className="bg-white p-8 shadow-2xl rounded-sm border border-slate-200 mx-auto grid grid-cols-2 gap-4 min-h-[1000px] max-w-[900px]"
        >
          {currentProject.panels.map((panel, index) => {
            // Asymmetrical layout logic
            let spanClass = "";
            if (currentProject.numPanels === 4) {
              if (index === 0) spanClass = "row-span-2 h-full";
              if (index === 3) spanClass = "col-span-2 h-[300px]";
            } else if (currentProject.numPanels === 6) {
              if (index === 0) spanClass = "col-span-2 h-[400px]";
              if (index === 1 || index === 2) spanClass = "row-span-2 h-full";
            } else {
              // 8 panels
              if (index === 0 || index === 7) spanClass = "col-span-2 h-[300px]";
            }

            return (
              <div key={panel.id} className={spanClass}>
                <PanelCard panel={panel} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
