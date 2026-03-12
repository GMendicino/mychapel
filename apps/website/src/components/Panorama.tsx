import { useEffect, useRef, useState } from "react";
import type { InfoPointNode, PanoNode } from "../script/TourDataStruct";
import InfoPointModal from "./InfoPointModal";
import arrowIcon from "../assets/arrow.svg";
import InfoPointIcon from "../assets/InfoPoint.svg";

interface Props {
    GivenPanoNode: PanoNode;
    onNavigate?: (targetNode: PanoNode) => void;
    onDeletePanorama?: (panoNode: PanoNode) => void;
}

declare global {
    interface Window {
        pannellum: any;
    }
}

function PanoHotspotPlacer({ GivenPanoNode, onNavigate, onDeletePanorama }: Props) {
    const viewerRef = useRef<HTMLDivElement>(null);
    const viewerInstanceRef = useRef<any>(null);
    const onNavigateRef = useRef(onNavigate);
    const [currentPanoNode, setCurrentPanoNode] = useState<PanoNode>(GivenPanoNode);
    const [selectedInfoPoint, setSelectedInfoPoint] = useState<InfoPointNode | null>(null);

    // Keep the callback ref updated
    useEffect(() => {
        onNavigateRef.current = onNavigate;
    }, [onNavigate]);

    // Update current node when GivenPanoNode prop changes
    useEffect(() => {
        setCurrentPanoNode(GivenPanoNode);
    }, [GivenPanoNode]);

    useEffect(() => {
        if (!window.pannellum || !viewerRef.current) return;

        // Create viewer (recreate on image change) and store instance
        const viewer = window.pannellum.viewer(viewerRef.current, {
            type: 'equirectangular',
            panorama: currentPanoNode.imageSrc,
            autoLoad: true,
            hotSpots: []
        });
        viewerInstanceRef.current = viewer;

        // Add hotspots for node connections (done by ai :o)
        const addHotspots = () => {
            if (currentPanoNode.nodeConnection && currentPanoNode.nodeConnection.length > 0) { // For Navigation hotspots
                currentPanoNode.nodeConnection.forEach(([targetNode, yaw, pitch]) => {
                    const hotspot = {
                        pitch: pitch,
                        yaw: yaw,
                        type: 'custom',
                        createTooltipFunc: (hotSpotDiv: HTMLDivElement) => {
                            hotSpotDiv.style.width = '65px';
                            hotSpotDiv.style.height = '65px';
                            hotSpotDiv.style.transform = 'translate(-50%, -50%)';

                            const img = document.createElement('img');
                            img.src = arrowIcon;
                            img.alt = 'Navigate';
                            img.style.width = '100%';
                            img.style.height = '100%';
                            img.style.cursor = 'pointer';
                            img.style.display = 'block';
                            img.style.userSelect = 'none';
                            img.draggable = false;
                            hotSpotDiv.appendChild(img);
                        },
                        clickHandlerFunc: () => {
                            setCurrentPanoNode(targetNode);
                            if (onNavigateRef.current) {
                                onNavigateRef.current(targetNode);
                            }
                        }
                    };
                    viewer.addHotSpot(hotspot);
                });
            }
            if (currentPanoNode.infoSpots && currentPanoNode.infoSpots.length > 0) { // For info point hotspots
                currentPanoNode.infoSpots.forEach(([InfoPointNode, yaw, pitch]) => {
                    const hotspot = {
                        pitch: pitch,
                        yaw: yaw,
                        type: 'custom',
                        createTooltipFunc: (hotSpotDiv: HTMLDivElement) => {
                            hotSpotDiv.style.width = '65px';
                            hotSpotDiv.style.height = '65px';
                            hotSpotDiv.style.transform = 'translate(-50%, -50%)';

                            const img = document.createElement('img');
                            img.src = InfoPointIcon;
                            img.alt = 'Navigate';
                            img.style.width = '100%';
                            img.style.height = '100%';
                            img.style.cursor = 'pointer';
                            img.style.display = 'block';
                            img.style.userSelect = 'none';
                            img.draggable = false;
                            hotSpotDiv.appendChild(img);
                        },
                        clickHandlerFunc: () => {
                            setSelectedInfoPoint(InfoPointNode);
                        }
                    };
                    viewer.addHotSpot(hotspot);
                });
            }
        };

        // Add hotspots when viewer is ready
        if (typeof viewer.on === 'function') {
            viewer.on('load', addHotspots);
        } else {
            // Fallback if 'on' method doesn't exist
            setTimeout(addHotspots, 300);
        }

        return () => {
            // try to destroy viewer
            try { if (viewer && typeof viewer.destroy === 'function') viewer.destroy(); } catch (e) { }
            viewerInstanceRef.current = null;
        };
    }, [currentPanoNode]);

    const handleDeletePanorama = () => {
        if (onDeletePanorama && window.confirm('Are you sure you want to delete this panorama?')) {
            onDeletePanorama(currentPanoNode);
        }
    };

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
            <div ref={viewerRef} style={{ width: '100%', height: '100%' }} />
            {selectedInfoPoint && (
                <InfoPointModal
                    infoPoint={selectedInfoPoint}
                    onClose={() => setSelectedInfoPoint(null)} />
            )}
            {onDeletePanorama && (
                <button
                    onClick={handleDeletePanorama}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        padding: '12px 24px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        zIndex: 1000,
                        transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ef4444';
                    }}
                >
                    Delete Panorama
                </button>
            )}
        </div>
    );
}

export default PanoHotspotPlacer;