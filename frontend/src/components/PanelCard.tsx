'use client';

import React, { useState } from 'react';
import { Panel } from '@/types';
import { 
  Play, 
  RefreshCcw, 
  Edit3, 
  Trash2, 
  MessageSquare, 
  Info,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import axios from 'axios';

interface PanelCardProps {
  panel: Panel;
}

export const PanelCard = ({ panel }: PanelCardProps) => {
  const { updatePanel } = useStore();
  const [isEditing, setIsEditing] = useState(false);

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
    <div className="relative h-full w-full bg-white border-2 border-slate-950 overflow-hidden group">
      {/* Panel Image */}
      <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
        {panel.imagePath ? (
          <img 
            src={panel.imagePath} 
            alt={panel.prompt}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            {panel.status === 'generating' ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-8 h-8 text-slate-400 animate-spin mb-2" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inking...</span>
              </div>
            ) : (
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Pending</span>
            )}
          </div>
        )}
      </div>

      {/* Caption Box (Top) */}
      {panel.narration && (
        <div className="absolute top-0 left-0 p-3 w-full">
          <div className="bg-white border-2 border-slate-950 p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-[11px] font-black text-slate-950 uppercase tracking-tighter leading-tight font-sans">
              {panel.narration}
            </p>
          </div>
        </div>
      )}

      {/* Dialogue (Bottom) */}
      {panel.dialogue && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center px-4">
          <div className="bg-white border-2 border-slate-950 rounded-[40px] px-4 py-2 shadow-sm">
            <p className="text-[11px] font-bold text-slate-950 text-center leading-tight">
              {panel.dialogue}
            </p>
          </div>
        </div>
      )}

      {/* Panel Number */}
      <div className="absolute bottom-2 right-2 bg-slate-950 text-white w-5 h-5 flex items-center justify-center text-[10px] font-bold">
        {panel.panelNumber}
      </div>

      {/* Overlay Controls */}
      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
        <button 
          onClick={generateImage}
          className="w-10 h-10 bg-white border-2 border-slate-950 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <RefreshCcw className="w-5 h-5 text-slate-950" />
        </button>
      </div>

      {/* Scanline Animation for generating state */}
      {panel.status === 'generating' && (
        <div className="absolute inset-0 scanline pointer-events-none opacity-50" />
      )}
    </div>
  );
};
