import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';

export const useQueue = () => {
  const {
    generationQueue,
    removeFromQueue,
    updatePanel,
    currentProject,
    setGeneratingImages,
  } = useStore();

  const processingRef = useRef(false);

  useEffect(() => {
    const processQueue = async () => {
      if (processingRef.current || generationQueue.length === 0) return;

      processingRef.current = true;
      setGeneratingImages(true);

      const panelId = generationQueue[0];
      const allPanels = currentProject?.pages?.flatMap((p) => p.panels) || [];
      const panel = allPanels.find((p) => p.id === panelId);

      if (panel) {
        try {
          updatePanel(panelId, { status: 'generating' });

          const response = await fetch('/api/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: panel.prompt,
              panelId: panel.id,
            }),
          });

          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
          }

          const data = (await response.json()) as { image_path?: string };
          updatePanel(panelId, {
            imagePath: data.image_path,
            status: 'completed',
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
