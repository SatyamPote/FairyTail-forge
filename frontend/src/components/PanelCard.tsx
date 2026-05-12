'use client';

import React from 'react';
import { Panel } from '@/types';
import { 
  RefreshCcw, 
  Loader2,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import axios from 'axios';

interface PanelCardProps {
  panel: Panel;
}

export const PanelCard = ({ panel }: PanelCardProps) => {
  const { updatePanel } = useStore();

  const generateImage = async () => {
    try {
      updatePanel(panel.id, { status: 'generating' });
      
      const response = await axios.post('/api/image', {
        prompt: panel.prompt,
        panelId: panel.id
      });

      updatePanel(panel.id, { 
        imagePath: response.data.image_path, 
        status: 'completed' 
      });
    } catch (error) {
      console.error('Generation failed:', error);
      updatePanel(panel.id, { status: 'failed' });
    }
  };

  return (
    <div className="relative h-full w-full bg-slate-50 group">
      {/* Cinematic Image Layer */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {panel.imagePath ? (
          <img 
            src={panel.imagePath} 
            alt={panel.prompt}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            {panel.status === 'generating' ? (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-2" />
                  <div className="absolute inset-0 bg-indigo-500/10 blur-xl animate-pulse" />
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Drafting...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center opacity-20 group-hover:opacity-100 transition-opacity">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Uninked</span>
                <button 
                  onClick={generateImage}
                  className="mt-2 px-3 py-1 bg-black text-white text-[8px] font-black uppercase tracking-widest rounded-sm"
                >
                  Start Inking
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comic Overlays */}
      {panel.status === 'completed' && (
        <>
          {/* Top Narration Box */}
          {panel.narration && (
            <div className="absolute top-4 left-4 right-8 z-10">
              <div className="bg-[#fff9c4] border-2 border-black p-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-[10px] md:text-[11px] font-black text-black uppercase leading-tight font-mono tracking-tight">
                  {panel.narration}
                </p>
              </div>
            </div>
          )}

          {/* Dialogue Bubble (Bottom) */}
          {panel.dialogue && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center px-6 z-10">
              <div className="relative bg-white border-2 border-black rounded-[20px] px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] max-w-[90%]">
                <p className="text-[10px] md:text-[11px] font-black text-black text-center leading-tight uppercase font-sans">
                  "{panel.dialogue}"
                </p>
                {/* Bubble Tail */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-black rotate-45" />
              </div>
            </div>
          )}
        </>
      )}

      {/* Interactive Controls Overlay */}
      <div className="absolute inset-0 bg-indigo-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
        <button 
          onClick={generateImage}
          className="w-12 h-12 bg-white border-2 border-black rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          <RefreshCcw className="w-6 h-6 text-black" />
        </button>
      </div>

      {/* Generation Scanline */}
      {panel.status === 'generating' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="w-full h-[2px] bg-indigo-500/50 absolute top-0 animate-[scan_2s_linear_infinite] shadow-[0_0_10px_#6366f1]" />
        </div>
      )}

      <style jsx>{`
        @keyframes scan {
          0% { top: 0% }
          100% { top: 100% }
        }
      `}</style>
    </div>
  );
};
