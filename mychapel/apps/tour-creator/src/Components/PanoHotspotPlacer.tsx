import { useEffect, useRef } from "react";
import arrowIcon from "../assets/arrow.svg";
import infoIcon from "../assets/InfoPoint.svg";
import crosshairIcon from "../assets/crosshair.png";

interface Props {
    image: string;
    onPositionChange?: (pitch: number, yaw: number) => void;
    hotspots?: {
        type: "info" | "nav";
        yaw: number;
        pitch: number;
    }[];
}

declare global {
    interface Window {
        pannellum: any;
    }
}

function PanoHotspotPlacer({ image, onPositionChange, hotspots }: Props) {
    const viewerRef = useRef<HTMLDivElement>(null);
    const viewerInstanceRef = useRef<any>(null);
    const onPositionChangeRef = useRef(onPositionChange);
    const hotspotIdsRef = useRef<string[]>([]);

    // Keep the callback ref updated
    useEffect(() => {
        onPositionChangeRef.current = onPositionChange;
    }, [onPositionChange]);

    useEffect(() => {
        if (!window.pannellum || !viewerRef.current) return;

        // Create viewer (recreate on image change) and store instance
        const viewer = window.pannellum.viewer(viewerRef.current, {
            type: 'equirectangular',
            panorama: image,
            autoLoad: true,
            hotSpots: []
        });
        viewerInstanceRef.current = viewer;

        // Listen for view changes and return current pitch and yaw
        const handleViewChange = () => {
            if (onPositionChangeRef.current && viewer) {
                const pitch = viewer.getPitch();
                const yaw = viewer.getYaw();
                onPositionChangeRef.current(pitch, yaw);
            }
        };

        // Add event listener for when the view changes
        if (viewer.on) {
            viewer.on('mouseup', handleViewChange);
            viewer.on('touchend', handleViewChange);
        }

        return () => {
            // try to destroy viewer
            try { if (viewer && typeof viewer.destroy === 'function') viewer.destroy(); } catch (e) {}
            viewerInstanceRef.current = null;
            hotspotIdsRef.current = [];
        };
    }, [image]);

        useEffect(() => {
        const viewer = viewerInstanceRef.current;
        if (!viewer) return;

        // Clear previously rendered hotspots
        hotspotIdsRef.current.forEach((id) => {
            try { viewer.removeHotSpot(id); } catch {}
        });
        hotspotIdsRef.current = [];

        (hotspots ?? []).forEach((h, i) => {
            const id = `hs-${h.type}-${i}`;
            hotspotIdsRef.current.push(id);

            viewer.addHotSpot({
                id,
                pitch: h.pitch,
                yaw: h.yaw,
                type: "custom",
                createTooltipFunc: (hotSpotDiv: HTMLDivElement) => {
                    hotSpotDiv.style.width = "32px";
                    hotSpotDiv.style.height = "32px";
                    hotSpotDiv.style.transform = "translate(-50%, -50%)";
                    // don't block dragging the pano
                    hotSpotDiv.style.pointerEvents = "none";

                    const img = document.createElement("img");
                    img.src = h.type === "nav" ? arrowIcon : infoIcon;
                    img.alt = h.type === "nav" ? "Navigation hotspot" : "Info hotspot";
                    img.style.width = "100%";
                    img.style.height = "100%";
                    img.style.display = "block";
                    img.style.userSelect = "none";
                    img.draggable = false;
                    img.style.pointerEvents = "none";
                    hotSpotDiv.appendChild(img);
                },
            });
        });
    }, [hotspots]);

    return (
        <div style={{ position: 'relative', width: '700px', height: '400px' }}>
            <div ref={viewerRef} style={{ width: '100%', height: '100%' }} />
            {/* crosshair in center of panorama */}
            <img
                src={crosshairIcon}
                alt="crosshair" 
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    width: '80px',
                    height: '80px'
                }}
            />
        </div>
    );
}

export default PanoHotspotPlacer;