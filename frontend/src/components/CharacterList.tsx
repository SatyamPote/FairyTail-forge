'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { User, Info } from 'lucide-react';

export const CharacterList = () => {
  const { currentProject } = useStore();

  if (!currentProject || currentProject.characters.length === 0) return null;

  return (
    <div className="p-6 border-t border-slate-800">
      <div className="flex items-center gap-2 mb-4">
        <User className="w-4 h-4 text-indigo-500" />
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cast of Characters</h3>
      </div>
      <div className="space-y-4">
        {currentProject.characters.map((char) => (
          <div key={char.id} className="group cursor-help">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-slate-200">{char.name}</span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Info className="w-3 h-3 text-slate-500" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
              {char.appearance}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
