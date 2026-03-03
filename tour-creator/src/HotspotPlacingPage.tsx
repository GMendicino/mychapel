import { PanoNode, TourNode, InfoPointNode } from "./script/TourDataStruct";
import PanoHotspotPlacer from "./Components/PanoHotspotPlacer";
import ImageUpload from "./Components/ImageUpload";
import { useState } from "react";
import EditorLeftBar from "./Components/EditorLeftBar";
import styles from "./styles/HotspotPlacingPage.module.css";
import Panorama from "./Components/Panorama";
import { listProjects, saveProjects } from "./script/storage";

interface HotspotPlacingPageProps {
    tour: TourNode;
    projectId?: string;
    onReturn?: () => void;
}

function HotspotPlacingPage({ tour, projectId, onReturn }: HotspotPlacingPageProps) {
    const [update, setUpdate] = useState(0);
    const [selectedPanoNode, setSelectedPanoNode] = useState<PanoNode | null>(null);
    const [selectedMoveNode, setSelectedMoveNode] = useState<PanoNode | null>(null);
    const [selectedHotspotImg, setSelectedHotspotImg] = useState<string | null>(null);
    const [currentPitch, setCurrentPitch] = useState(0);
    const [currentYaw, setCurrentYaw] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [infoTitle, setInfoTitle] = useState("");
    const [infoDescription, setInfoDescription] = useState("");
    const [viewingTour, setViewingTour] = useState(false);

    const getFileNameFromUrl = (url: string) => {
        try {
            const last = url.split("/").pop();
            return last ? decodeURIComponent(last.split("?")[0]) : "";
        } catch {
            return "";
        }
    };

    // Helper functions to delete hotspots
    const handleDeleteInfoSpot = (index: number) => {
        if (!selectedPanoNode || !selectedPanoNode.infoSpots) return;
        
        if (window.confirm("Are you sure you want to delete this info point?")) {
            selectedPanoNode.infoSpots.splice(index, 1);
            setUpdate(u => u + 1); // Force re-render to update UI and Visual Editor
        }
    };

    const handleDeleteNavSpot = (index: number) => {
        if (!selectedPanoNode || !selectedPanoNode.nodeConnection) return;

        if (window.confirm("Are you sure you want to delete this navigation link?")) {
            selectedPanoNode.nodeConnection.splice(index, 1);
            setUpdate(u => u + 1); // Force re-render to update UI and Visual Editor
        }
    };

    const infoHotspots = selectedPanoNode
        ? (selectedPanoNode.infoSpots ?? []).map(([info, yaw, pitch], i) => ({
                key: `info-${i}`,
                index: i,
                text: `${(info as any).title ?? `Info point ${i + 1}`}`,
          }))
        : [];

    const navHotspots = selectedPanoNode
        ? (selectedPanoNode.nodeConnection ?? []).map(([node, yaw, pitch], i) => ({
              key: `nav-${i}`,
              index: i,
              text: `${
                  (node as any).fileName || getFileNameFromUrl((node as any).imageSrc) || "Scene"
              }`,
          })) 
        : [];

    const visualHotspots = selectedPanoNode
        ? [
              ...(selectedPanoNode.infoSpots ?? []).map(([, yaw, pitch]) => ({
                  type: "info" as const,
                  yaw,
                  pitch,
              })),
              ...(selectedPanoNode.nodeConnection ?? []).map(([, yaw, pitch]) => ({
                  type: "nav" as const,
                  yaw,
                  pitch,
              })),
          ]
        : [];

    function handlePanoLink() {
        if (selectedPanoNode && selectedMoveNode) {
            selectedPanoNode.addNodeConnection(selectedMoveNode, currentYaw, currentPitch);
            setSelectedMoveNode(null); 
            setUpdate(update + 1);
            alert("Movement arrow placed successfully!");
        }
    }

    function handleInfoPointSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (selectedPanoNode && infoTitle && infoDescription) {
            const infoPoint = new InfoPointNode(infoTitle, infoDescription);
            if (selectedHotspotImg) {
                infoPoint.imageSrc = selectedHotspotImg;
            }
            selectedPanoNode.addInfoSpot(infoPoint, currentYaw, currentPitch);

            setInfoTitle("");
            setInfoDescription("");
            setSelectedHotspotImg(null);
            setUpdate(update + 1);
            alert("Info point placed successfully!");
        }
    }

    const handleSave = async () => {
        if (!projectId) {
            alert("Error: Missing project id, cannot save.");
            return;
        }
        const projects = await listProjects();
        const index = projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            projects[index].tour = tour;
            saveProjects(projects);
            alert("Tour saved successfully!");
        } else {
            alert("Error: Project not found.");
        }
    };

    if (viewingTour && tour.startNode) {
        return (
            <div className={styles.viewerContainer}>
                <button className={styles.viewerCloseBtn} onClick={() => setViewingTour(false)}>Return to hotspot editor</button>
                <Panorama GivenPanoNode={tour.startNode}></Panorama>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <EditorLeftBar
                topButtonLabel="← Return"
                onTopButton={onReturn}
                name={tour.mainPage.title}
                admin={tour.admin}
                onSave={handleSave}
            />

            <main className={styles.content}>
                <div className={styles.header}>
                    <h1 className={styles.pageTitle}>Hotspot Editor</h1>
                </div>

                <div className={styles.mainContent}>
                { !selectedPanoNode ? (
                    <div className={styles.selectionCard}>
                        <h2 className={styles.selectionTitle}>Select a scene to edit:</h2>
                        <div className={styles.grid}>
                            {tour.createdPanoNodes?.map((panoNode, index) => (
                                <img
                                    key={index}
                                    src={panoNode.imageSrc}
                                    alt={`Panorama ${index + 1}`}
                                    className={styles.panoThumbnail}
                                    onClick={() => setSelectedPanoNode(panoNode)}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className={styles.editorGrid}>
                        {/* Left: Visual Editor */}
                        <div className={styles.editorPanel}>
                            <h3 className={styles.panelHeader}>
                                Visual Editor
                                <span style={{marginLeft: 'auto', fontSize: '0.8rem', fontWeight: 'normal', float: 'right'}}>
                                    Drag to position crosshair
                                </span>
                            </h3>
                            <PanoHotspotPlacer 
                                image={selectedPanoNode.imageSrc}
                                hotspots={visualHotspots}
                                onPositionChange={(pitch, yaw) => {
                                    setCurrentPitch(pitch);
                                    setCurrentYaw(yaw);
                                }}
                            />
                            <div style={{ marginTop: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>
                                Target Coordinates: 
                                <span className={styles.coordBadge}>Yaw: {currentYaw.toFixed(1)}</span>
                                <span className={styles.coordBadge}>Pitch: {currentPitch.toFixed(1)}</span>
                            </div>

                           {infoHotspots.length > 0 ? (
                                <>
                                    <div className={styles.listTitle}>Info hotspots</div>
                                    <ul className={styles.fileList}>
                                        {infoHotspots.map(item => (
                                            <li key={item.key} className={styles.fileListItem}>
                                                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1}}>
                                                    <span className={styles.fileIcon} aria-hidden />
                                                    <span>{item.text}</span>
                                                </div>
                                                <button 
                                                    onClick={() => handleDeleteInfoSpot(item.index)}
                                                    style={{
                                                        background: 'none', 
                                                        border: 'none', 
                                                        cursor: 'pointer', 
                                                        padding: '4px 8px',
                                                        fontSize: '1.1rem',
                                                        marginLeft: 'auto',
                                                        opacity: 0.7,
                                                        transition: 'opacity 0.2s'
                                                    }}
                                                    title="Delete Info Point"
                                                    onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                                                    onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
                                                >
                                                    🗑️
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : null}

                            {navHotspots.length > 0 ? (
                                <>
                                    <div className={styles.listTitle}>Navigation hotspots</div>
                                    <ul className={styles.fileList}>
                                        {navHotspots.map(item => (
                                            <li key={item.key} className={styles.fileListItem}>
                                                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1}}>
                                                    <span className={styles.fileIcon} aria-hidden />
                                                    <span>{item.text}</span>
                                                </div>
                                                <button 
                                                    onClick={() => handleDeleteNavSpot(item.index)}
                                                    style={{
                                                        background: 'none', 
                                                        border: 'none', 
                                                        cursor: 'pointer', 
                                                        padding: '4px 8px',
                                                        fontSize: '1.1rem',
                                                        marginLeft: 'auto',
                                                        opacity: 0.7,
                                                        transition: 'opacity 0.2s'
                                                    }}
                                                    title="Delete Navigation Link"
                                                    onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                                                    onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
                                                >
                                                    🗑️
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : null}
                        </div>
                        
                        {/* Right: Tools */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            
                            {/* Info Point Tool */}
                            <div className={styles.editorPanel}>
                                <h3 className={styles.panelHeader}>Add Info Point</h3>
                                <form onSubmit={handleInfoPointSubmit}>
                                    <input className={styles.input} type="text" placeholder="Title" maxLength={32} minLength={2} required value={infoTitle} onChange={(e) => setInfoTitle(e.target.value)}/>
                                    <textarea className={styles.input} placeholder="Description" maxLength={1024} minLength={5} required value={infoDescription} onChange={(e) => setInfoDescription(e.target.value)} rows={4} />
                                    <div style={{ marginBottom: '1rem' }}>
                                        <p style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Optional Image:</p>
                                        <ImageUpload key={update} onSubmit={(img) => {if (img) {setSelectedHotspotImg(img);}}} />
                                    </div>
                                    <button type="submit" className={styles.primaryBtn}>Place Info Hotspot</button>
                                </form>
                            </div>

                            {/* Navigation Tool */}
                            <div className={styles.editorPanel}>
                                <h3 className={styles.panelHeader}>Add Navigation Link</h3>
                                <div style={{ marginBottom: '1rem' }}>
                                    <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.5rem' }}>
                                        Link to scene: {selectedMoveNode ? <strong>Selected</strong> : "None selected"}
                                    </p>
                                    <button type="button" onClick={() => setShowModal(true)} className={styles.secondaryBtn} style={{ width: '100%' }}>
                                        {selectedMoveNode ? "Change Target Scene" : "Select Target Scene"}
                                    </button>
                                </div>
                                <button onClick={handlePanoLink} disabled={!selectedMoveNode} className={styles.primaryBtn} style={{ opacity: selectedMoveNode ? 1 : 0.5 }}>
                                    Place Navigation Arrow
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                </div>
            </main>
            
            {/* Scene Selection Modal */}
            {showModal && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalContent}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Select Destination Scene</h2>
                            <button onClick={() => setShowModal(false)} className={styles.secondaryBtn}>Close</button>
                        </div>
                        
                        <div className={styles.grid}>
                            {tour.createdPanoNodes?.filter(panoNode => {
                                if (panoNode === selectedPanoNode) return false;
                                const alreadyLinked = selectedPanoNode?.nodeConnection?.some(
                                    ([linkedNode]) => linkedNode === panoNode
                                );
                                return !alreadyLinked;
                            }).map((panoNode, index) => (
                                <div key={index} style={{ position: 'relative' }}>
                                    <img
                                        src={panoNode.imageSrc}
                                        alt={`Panorama ${index + 1}`}
                                        className={`${styles.panoThumbnail} ${selectedMoveNode === panoNode ? styles.selected : ''}`}
                                        onClick={() => setSelectedMoveNode(panoNode)}
                                    />
                                    {selectedMoveNode === panoNode && (
                                        <div style={{ position: 'absolute', top: 5, right: 5, background: '#2563eb', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                            <button onClick={() => setShowModal(false)} className={styles.primaryBtn} style={{ width: 'auto' }}>Confirm Selection</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default HotspotPlacingPage;