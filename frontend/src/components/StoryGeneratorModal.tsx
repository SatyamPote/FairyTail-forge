'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wand2, 
  X, 
  Sparkles, 
  Type, 
  Layout, 
  Loader2,
  ChevronRight,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Genre } from '@/types';
import axios from 'axios';
import { clsx } from 'clsx';

export const StoryGeneratorModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { 
    setCurrentProject, 
    setGeneratingStory, 
    isGeneratingStory,
    availableModels,
    selectedModel,
    setAvailableModels,
    setSelectedModel,
    addToQueue
  } = useStore();
  
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState<Genre>('sci-fi');
  const [panels, setPanels] = useState(4);
  const [isFetchingModels, setIsFetchingModels] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchModels();
    }
  }, [isOpen]);

  const fetchModels = async () => {
    setIsFetchingModels(true);
    try {
      const response = await axios.get('/api/models');
      const modelNames = response.data.models.map((m: any) => m.name);
      setAvailableModels(modelNames);
      
      // Auto-select first available model if current one isn't in the list
      if (modelNames.length > 0 && !modelNames.includes(selectedModel)) {
        setSelectedModel(modelNames[0]);
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setIsFetchingModels(false);
    }
  };

  const genres: { id: Genre, label: string, icon: string }[] = [
    { id: 'sci-fi', label: 'Sci-Fi', icon: '🚀' },
    { id: 'cyberpunk', label: 'Cyberpunk', icon: '🤖' },
    { id: 'fantasy', label: 'Fantasy', icon: '⚔️' },
    { id: 'comedy', label: 'Comedy', icon: '😂' },
    { id: 'horror', label: 'Horror', icon: '👻' },
    { id: 'slice of life', label: 'Slice of Life', icon: '🏠' },
  ];

  const [liveLog, setLiveLog] = useState('');

  const handleGenerate = async () => {
    if (!prompt) return;
    
    setGeneratingStory(true);
    setLiveLog('');
    let fullResponse = '';
    
    try {
      const response = await fetch('/api/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre,
          numPanels: panels,
          prompt,
          model: selectedModel
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.trim());
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.response) {
              fullResponse += data.response;
              setLiveLog(prev => prev + data.response);
            }
          } catch (e) {
            // Ignore partial JSON chunks
          }
        }
      }

      const storyData = JSON.parse(fullResponse);
      
      const panelsList = (storyData.panels || []).map((p: any) => ({
        ...p,
        id: Math.random().toString(36).substr(2, 9),
        prompt: p.imagePrompt || p.prompt || p.image_prompt || 'A comic book panel',
        status: 'pending' as const
      }));

      // Chunk panels into pages of 4
      const pages = [];
      for (let i = 0; i < panelsList.length; i += 4) {
        pages.push({
          id: Math.random().toString(36).substr(2, 9),
          pageNumber: Math.floor(i / 4) + 1,
          panels: panelsList.slice(i, i + 4),
          isCover: false
        });
      }

      const newProject = {
        id: Math.random().toString(36).substr(2, 9),
        title: storyData.title,
        genre: genre,
        theme: 'studio-dark' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        characters: (storyData.characters || []).map((c: any) => ({ ...c, id: Math.random().toString(36).substr(2, 9) })),
        pages: pages
      };

      setCurrentProject(newProject as any);
      const panelIds = panelsList.map(p => p.id);
      addToQueue(panelIds);
      onClose();
    } catch (error: any) {
      console.error('Failed to generate story:', error);
      if (error.message.includes('system memory')) {
        alert(`Ollama Memory Error: Your system doesn't have enough RAM for ${selectedModel}. \n\nPlease select a smaller model like 'qwen2.5:3b' or 'tinyllama'.`);
      } else {
        alert(error.message || 'Generation failed. Make sure Ollama is running.');
      }
    } finally {
      setGeneratingStory(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-display">New Comic Story</h2>
                <p className="text-slate-500 text-sm">AI will draft your script and prompts</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <X className="w-6 h-6 text-slate-500" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Story Prompt */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase mb-3">
                <Type className="w-4 h-4 text-indigo-500" />
                What's the story about?
              </label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A lonely robot finds a flower in a post-apocalyptic wasteland..."
                className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-100 placeholder:text-slate-700 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />
            </div>

            {/* AI Model Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase">
                  <Cpu className="w-4 h-4 text-indigo-500" />
                  AI Model
                </label>
                <button 
                  onClick={fetchModels}
                  className="p-1 hover:bg-slate-800 rounded-md transition-colors"
                  title="Refresh models"
                >
                  <RefreshCw className={clsx("w-3.5 h-3.5 text-slate-500", isFetchingModels && "animate-spin")} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {availableModels.length > 0 ? (
                  availableModels.map((m) => (
                    <button
                      key={m}
                      onClick={() => setSelectedModel(m)}
                      className={clsx(
                        "px-4 py-2 rounded-xl border text-xs font-bold transition-all truncate",
                        selectedModel === m 
                          ? "bg-indigo-600/20 border-indigo-500 text-indigo-400" 
                          : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"
                      )}
                    >
                      {m}
                    </button>
                  ))
                ) : (
                  <div className="col-span-2 py-3 px-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 italic">
                    No Ollama models detected. Please run 'ollama serve'.
                  </div>
                )}
              </div>
            </div>

            {/* Genre Grid */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase mb-3">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Choose Genre
              </label>
              <div className="grid grid-cols-3 gap-3">
                {genres.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGenre(g.id)}
                    className={clsx(
                      "p-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-2",
                      genre === g.id 
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    )}
                  >
                    <span>{g.icon}</span>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Panel Count */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase mb-3">
                <Layout className="w-4 h-4 text-indigo-500" />
                Number of Panels
              </label>
              <div className="flex gap-4">
                {[4, 6, 8].map((n) => (
                  <button
                    key={n}
                    onClick={() => setPanels(n)}
                    className={clsx(
                      "flex-1 py-3 rounded-xl border text-sm font-bold transition-all",
                      panels === n 
                        ? "bg-indigo-600 border-indigo-500 text-white" 
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    )}
                  >
                    {n} Panels
                  </button>
                ))}
              </div>
            </div>
            {/* Live Generation Feed */}
            {isGeneratingStory && (
              <div className="mt-6 p-4 bg-black border border-indigo-500/30 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">AI Brain Feed</span>
                </div>
                <div className="h-40 overflow-y-auto text-[11px] font-mono text-slate-400 leading-relaxed scrollbar-hide">
                  {liveLog || "Initializing neural link..."}
                  <div className="w-1 h-4 bg-indigo-500 inline-block animate-pulse ml-1" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={isGeneratingStory || !prompt}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
          >
            {isGeneratingStory ? (
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Writing Script...
                </div>
                <span className="text-[10px] text-slate-500 italic">This can take 2-4 mins on some hardware</span>
              </div>
            ) : (
              <>
                Forge Story
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
