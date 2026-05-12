'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import axios from 'axios';

export const useQueue = () => {
  const { 
    generationQueue, 
    removeFromQueue, 
    updatePanel, 
    currentProject,
    isGeneratingImages,
    setGeneratingImages
  } = useStore();
  
  const processingRef = useRef(false);

  useEffect(() => {
    const processQueue = async () => {
      if (processingRef.current || generationQueue.length === 0) return;

      processingRef.current = true;
      setGeneratingImages(true);

      const panelId = generationQueue[0];
      const panel = currentProject?.panels.find(p => p.id === panelId);

      if (panel) {
        try {
          updatePanel(panelId, { status: 'generating' });
          
          const response = await axios.post('/api/image', {
            prompt: panel.prompt,
            panelId: panel.id
          });

          updatePanel(panelId, { 
            imagePath: response.data.image_path, 
            status: 'completed' 
          });
        } catch (error) {
          console.error(`Panel ${panelId} generation failed:`, error);
          updatePanel(panelId, { status: 'failed' });
        }
      }

      removeFromQueue(panelId);
      processingRef.current = false;
      
      if (generationQueue.length <= 1) {
        setGeneratingImages(false);
      }
    };

    processQueue();
  }, [generationQueue, currentProject, removeFromQueue, updatePanel, setGeneratingImages]);
};
