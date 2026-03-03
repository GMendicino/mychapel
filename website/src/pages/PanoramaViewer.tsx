import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

declare global {
  interface Window {
    pannellum: any;
  }
}

export const PanoramaViewer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tourId = searchParams.get('id');
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    async function loadTourData() {
      if (!tourId) return;

      // Fetch the full tour JSON for this specific ID
      const response = await fetch(`/get-tour-details?id=${tourId}`);
      const fullTourData = await response.json(); // This is your TourNode struct

      // Find the start node (the first 360 image)
      const startNode = fullTourData.createdPanoNodes.find(
        (node: any) => node.nodeId === fullTourData.startNode
      );

      if (window.pannellum && startNode) {
        viewerRef.current = window.pannellum.viewer('panorama-container', {
          type: 'equirectangular',
          panorama: startNode.imageSrc, // URL from R2
          autoLoad: true,
        });
      }
    }

    loadTourData();

    // Cleanup on unmount
    return () => {
      if (viewerRef.current) viewerRef.current.destroy();
    };
  }, [tourId]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <div id="panorama-container" style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};