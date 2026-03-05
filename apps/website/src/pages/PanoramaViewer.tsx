import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TripAdvisorWidget from '../components/TripAdvisorWidget';

declare global {
  interface Window {
    pannellum: any;
  }
}

export const PanoramaViewer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tourId = searchParams.get('id');
  const viewerRef = useRef<any>(null);
  const [tripAdvisorId, setTripAdvisorId] = useState<string | null>(null);

  useEffect(() => {
    async function loadTourData() {
      if (!tourId) return;

      try {
        // Fetch the full tour JSON for this specific ID
        const response = await fetch(`/get-tour-details?id=${tourId}`);
        const fullTourData = await response.json(); // This is your TourNode struct

        if (fullTourData.mainPage?.tripAdvisorLocationId) {
          setTripAdvisorId(fullTourData.mainPage.tripAdvisorLocationId);
        } else {
          // Fallback ID if none is set (e.g., Edinburgh Castle for demo/testing)
          // You can change this to King's College Chapel's real ID when found
          setTripAdvisorId("212130"); 
        }

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
      } catch (err) {
        console.error("Failed to load tour data:", err);
      }
    }

    loadTourData();

    // Cleanup on unmount
    return () => {
      if (viewerRef.current) viewerRef.current.destroy();
    };
  }, [tourId]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>
      <div id="panorama-container" style={{ width: '100%', height: '100%' }}></div>
      {tripAdvisorId && <TripAdvisorWidget locationId={tripAdvisorId} />}
    </div>
  );
};