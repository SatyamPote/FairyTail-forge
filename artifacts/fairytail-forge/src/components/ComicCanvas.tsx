import React, { useState } from 'react';
import {
  Loader2,
  Sparkles,
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import { useStore } from '@/store/useStore';
import { PanelCard } from './PanelCard';

export const ComicCanvas = () => {
  const {
    currentProject,
    currentPageIndex,
    setCurrentPageIndex,
    isGeneratingImages,
    addToQueue,
    studioTheme,
    setStudioTheme,
  } = useStore();

  const [zoom, setZoom] = useState(0.8);

  const currentPage = currentProject?.pages?.[currentPageIndex];

  const handleExport = async () => {
    if (!currentProject) return;
    const element = document.getElementById('comic-page');
    if (!element) return;

    try {
      const dataUrl = await toPng(element, { quality: 1.0, pixelRatio: 3 });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(dataUrl, 'PNG', 0, 0, 210, 297);
      pdf.save(`${currentProject.title}_Page_${currentPageIndex + 1}.pdf`);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (!currentProject || !currentPage) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#020617] text-white">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-indigo-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-bold uppercase tracking-widest">Awaiting Script...</h2>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex-1 flex flex-col overflow-hidden transition-colors duration-500 ${
        studioTheme === 'manga-white' ? 'bg-slate-200' : 'bg-[#020617]'
      }`}
    >
      {/* Studio Navigation Bar */}
      <div className="h-14 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-40">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white/5 rounded-lg border border-white/10 overflow-hidden">
            <button
              disabled={currentPageIndex === 0}
              onClick={() => setCurrentPageIndex(currentPageIndex - 1)}
              className="p-2 hover:bg-white/10 disabled:opacity-20 transition-colors"
            >
              <ChevronLeft size={16} className="text-white" />
            </button>
            <div className="px-4 border-x border-white/5 text-[10px] font-black text-white uppercase tracking-widest flex flex-col items-center justify-center min-w-[80px]">
              <span className="opacity-40">Page</span>
              <span>
                {currentPageIndex + 1} / {currentProject.pages.length}
              </span>
            </div>
            <button
              disabled={currentPageIndex === currentProject.pages.length - 1}
              onClick={() => setCurrentPageIndex(currentPageIndex + 1)}
              className="p-2 hover:bg-white/10 disabled:opacity-20 transition-colors"
            >
              <ChevronRight size={16} className="text-white" />
            </button>
          </div>

          <div className="h-6 w-px bg-white/10 mx-2" />

          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg">
            <button
              onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
              className="p-1.5 hover:bg-white/10 rounded text-slate-400"
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-[10px] font-bold text-white w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
              className="p-1.5 hover:bg-white/10 rounded text-white"
            >
              <ZoomIn size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={studioTheme}
            onChange={(e) => setStudioTheme(e.target.value as any)}
            className="bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase rounded-lg px-3 py-2 outline-none cursor-pointer hover:bg-white/10"
          >
            <option value="studio-dark">Studio Dark</option>
            <option value="manga-white">Manga White</option>
            <option value="cyberpunk-neon">Cyberpunk Neon</option>
            <option value="retro-comic">Retro Comic</option>
          </select>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Workspace */}
      <div className="flex-1 overflow-auto p-12 scrollbar-hide flex items-start justify-center bg-grid-slate-900/[0.04] bg-[size:40px_40px]">
        <div
          className="transition-transform duration-500 ease-in-out origin-top"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* A4 Page Canvas */}
          <div
            id="comic-page"
            className={`relative bg-white shadow-[0_80px_120px_rgba(0,0,0,0.6)] p-[12mm] border-[1px] border-slate-200 ${
              currentPage.isCover ? 'cover-mode' : ''
            }`}
            style={{
              width: '210mm',
              height: '297mm',
              backgroundImage:
                studioTheme === 'retro-comic' ? 'url("/textures/paper.png")' : 'none',
            }}
          >
            {/* Page Metadata Overlay */}
            <div className="absolute top-4 left-6 text-[8px] font-black text-slate-300 uppercase tracking-[0.5em] pointer-events-none">
              {currentProject.title} •{' '}
              {currentPage.isCover ? 'COVER' : `PAGE ${currentPageIndex + 1}`}
            </div>

            <div className="grid grid-cols-2 grid-rows-3 gap-6 w-full h-full relative">
              {currentPage.panels?.map((panel, index) => (
                <div
                  key={panel.id}
                  className={`
                    ${index === 0 && !currentPage.isCover ? 'row-span-2' : ''}
                    ${index === 3 && !currentPage.isCover ? 'col-span-2' : ''}
                    ${currentPage.isCover ? 'col-span-2 row-span-3' : ''}
                    border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-slate-50 relative group/panel
                  `}
                >
                  <PanelCard panel={panel} />
                </div>
              ))}
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-black text-slate-300 uppercase tracking-[1em] pointer-events-none">
              FAIRYTAIL FORGE PROFESSIONAL
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
