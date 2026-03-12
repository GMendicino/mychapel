import ImageUpload from "./Components/ImageUpload";
import Panorama from "./Components/Panorama";
import { useState, useEffect, useRef } from "react";
import HotspotPlacingPage from "./HotspotPlacingPage";
import EditorLeftBar from "./Components/EditorLeftBar";
import SlideshowFeature from "./Components/ImageSlideshow";
import styles from "./styles/EditProjectPage.module.css"; // Import new styles
import { type Project, listProjects, saveProjects, publishTour, unpublishTour, isPublished } from "./script/storage";
import { LandingPageCreator } from "./Components/LandingPageCreator";
import { HighlightsCreator } from "./Components/HighlightCreator";

interface EditProjectPageProps {
    project: Project;
    onReturn?: () => void;
}

function EditProjectPage({ project, onReturn }: EditProjectPageProps) {
    const { tour } = project;
    const [update, setUpdate] = useState(0); // Dummy state to force re-render
    const [showHotspotPage, setShowHotspotPage] = useState(false);
    const [viewingTour, setViewingTour] = useState(false);
    const [showSlideshowPage, setShowSlideshowPage] = useState(false);
    const [showLandingPage, setShowLandingPage] = useState(false);
    const [showSelectionCardPage, setShowSelectionCardPage] = useState(false);
    const [showHighlightsPage, setShowHighlightsPage] = useState(false);
    const [published, setPublished] = useState(false);
    const [hoverPreview, setHoverPreview] = useState<{ imageSrc: string; x: number; y: number } | null>(null);
    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        isPublished(project.id).then(setPublished);
    }, [project.id]);

    // New render logic for the slideshow page
    if (showSlideshowPage) {
        return (
            <SlideshowFeature 
                tour={tour} 
                projectId={project.id}
                onReturnEditor={() => setShowSlideshowPage(false)} 
            />
        );
    }

    if (showHotspotPage) {
        return <HotspotPlacingPage tour={tour} projectId={project.id} onReturn={() => setShowHotspotPage(false)} />;
    }

    if (showLandingPage) {
        return (
            <LandingPageCreator
                tour={tour}
                projectId={project.id}
                section="landing"
                onReturnEditor={() => setShowLandingPage(false)}
            />
        );
    }

    if (showSelectionCardPage) {
         return (
             <LandingPageCreator
                tour={tour}
                projectId={project.id}
                section="card"
                onReturnEditor={() => setShowSelectionCardPage(false)}
            />
        );
    }

    if (showHighlightsPage) {
        return (
            <HighlightsCreator
                tour={tour}
                projectId={project.id}
                onReturnEditor={() => setShowHighlightsPage(false)}
            />
        );
    }


    if (viewingTour && tour.startNode) {
        return (
            <div className={styles.viewerContainer}>
                <button className={styles.viewerCloseBtn} onClick={() => setViewingTour(false)}>Return to edit projects page</button>
                <Panorama GivenPanoNode={tour.startNode}></Panorama>
            </div>
        )
    }

    const handleImageUpload = (img: string | null, fileName?: string) => {
        if (img) {
            if (!tour.startNode) {
                tour.setStartNode(img, fileName);
            } else {
                tour.addPanoNode(img, fileName);
            }
            setUpdate(update + 1);
        }
    };

    const getFileNameFromUrl = (url: string) => {
        try {
            const urlObj = new URL(url, window.location.origin);
            return urlObj.searchParams.get('name') || 'Unknown';
        } catch {
            return 'Unknown';
        }
    };

    const handleDeleteImage = (index: number) => {
        if (window.confirm('Are you sure you want to delete this image?')) {
            if (tour.createdPanoNodes && tour.createdPanoNodes[index]) {
                const deleted = tour.createdPanoNodes[index];
                tour.createdPanoNodes.splice(index, 1);

                // If the deleted node was the startNode, reassign to the next available node
                if (deleted === tour.startNode) {
                    tour.startNode = tour.createdPanoNodes.length > 0
                        ? tour.createdPanoNodes[0]
                        : undefined;
                }

                setUpdate(update + 1);
            }
            setHoverPreview(null);
        }
    };

    const SceneNames = (tour.createdPanoNodes ?? [])
        //.filter(p => p.imageSrc !== tour.startNode?.imageSrc)
        .map(p => p.fileName || getFileNameFromUrl(p.imageSrc))
        .filter(Boolean);

    const handlePublish = async () => {
        if (published) {
            if (!window.confirm("Are you sure you want to unpublish this tour?")) return;
            try {
                const success = await unpublishTour(project.id);
                if (success) {
                    setPublished(false);
                    alert("Tour unpublished successfully!");
                } else {
                    alert("Failed to unpublish tour.");
                }
            } catch (err) {
                alert("Error unpublishing tour.");
                console.error(err);
            }
        } else {
            if (!window.confirm("Are you sure you want to publish this tour?")) return;
            try {
                const success = await publishTour(project);
                if (success) {
                    setPublished(true);
                    alert("Tour published successfully!");
                } else {
                    alert("Failed to publish tour.");
                }
            } catch (err) {
                alert("Error publishing tour.");
                console.error(err);
            }
        }
    };

    const handleSave = async () => {
        const projects = await listProjects();
        const index = projects.findIndex(p => p.id === project.id);
        if (index !== -1) {
            projects[index].tour = tour;
            saveProjects(projects);
            alert("Tour saved successfully!");
        } else {
            alert("Error: Project not found.");
        }
    };

    const handleImageListItemHover = (e: React.MouseEvent<HTMLElement>, index: number) => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        const image = tour.createdPanoNodes ? tour.createdPanoNodes[index].imageSrc : undefined;
        const xCoord = e.currentTarget.getBoundingClientRect().left - 210; // - goes left
        const yCoord = Math.floor(e.currentTarget.getBoundingClientRect().top 
            + (e.currentTarget.getBoundingClientRect().height / 2) - 55); // - goes up
        if (image) {
            const thumbnail = image.replace('.jpg', '-small.jpg');
            setHoverPreview({ imageSrc: thumbnail, x: xCoord, y: yCoord });
        }
    };

    const handleImageListItemLeave = () => {
        hoverTimeoutRef.current = setTimeout(() => setHoverPreview(null), 100);
    };
    const uploadSection = !tour.startNode ? (
        <div className={styles.card}>
            <h3 className={styles.cardHeader}>360 Manager</h3>
            <p className={styles.cardText}>Upload starting image. This will be the first scene users see when they open the tour.</p>
            <ImageUpload key={update} onSubmit={handleImageUpload} />
        </div>
    ) : (
        <div className={styles.card}>
            <h3 className={styles.cardHeader}>360 Manager</h3>
            <p className={styles.cardText}>
                Upload more panoramic images to expand your tour, 
                or place your hotspots to highlight areas and link to other panoramas.</p>
            <button
                className={styles.actionBtn}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    marginBottom: '1rem',
                }}
                disabled={!tour.startNode}
                onClick={() => setShowHotspotPage(true)}
            >   
                Hotspot Placer
            </button>
            <ImageUpload key={update} onSubmit={handleImageUpload} />
            <p className={styles.cardText}>Submitted Images: {SceneNames.length}</p>
            {SceneNames.length > 0 ? (
                <ul className={styles.fileList}>
                    {SceneNames.map((name, i) => (
                        <li key={`${name}-${i}`} className={styles.fileListItem}
                            onMouseEnter={(e) => handleImageListItemHover(e, i)}
                            onMouseLeave={handleImageListItemLeave}
                        >
                            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1}}>
                                <span className={styles.fileIcon} aria-hidden />
                                <span>{name}</span>
                            </div>
                            <button
                                onClick={() => handleDeleteImage(i)}
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
                                title="Delete Image"
                                onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                                onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
                            >
                                🗑️
                            </button>
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    );

    return (
        <div className={styles.pageContainer}>
            <EditorLeftBar
                topButtonLabel="← Back to Admin"
                onTopButton={onReturn}
                name={tour.mainPage.title}
                admin={tour.admin}
                onSave={handleSave}
                onView={() => setViewingTour(true)}
                viewDisabled={!tour.startNode}
                onPublish={handlePublish}
                publishLabel={published ? "Unpublish Tour" : "Publish Tour"}
            />

            <main className={styles.content}>
                <div className={styles.header}>
                    <h1 className={styles.pageTitle}>Project Editor</h1>
                </div>
                <div className={styles.mainLayout}>
                    {/* Left Column: Upload */}
                    <div>
                        {uploadSection}
                    </div>

                    {/* Actions */}
                    {/* Right Column: Actions */}
                    <div className={styles.card}>
                        <h3 className={styles.cardHeader}>Customise Tour</h3>
                        <p className={styles.cardText}>
                        Here you can manage the way your tour will be presented on the website.</p>                        
                        <div className={styles.actionContainer}>
                            <button
                                className={styles.actionBtn}
                                style={{ width: '100%', margin: '1rem 0' }}
                                onClick={() => setShowSelectionCardPage(true)}
                            >
                                Selection Card
                            </button>                            
                            <button
                                className={styles.actionBtn}
                                style={{ width: '100%', margin: '1rem 0' }}
                                onClick={() => setShowSlideshowPage(true)}
                            >
                                Slideshow
                            </button>
                            <button
                                className={styles.actionBtn}
                                style={{ width: '100%' , margin: '1rem 0'}}
                                onClick={() => setShowLandingPage(true)}
                            >
                                Landing Page
                            </button>
                            <button
                                className={styles.actionBtn}
                                style={{ width: '100%' , margin: '1rem 0'}}
                                onClick={() => setShowHighlightsPage(true)}
                            >
                                Highlights
                            </button>
                            <button
                                className={styles.actionBtn}
                                style={{ width: '100%' , margin: '1rem 0'}}                            >
                                Place pin on map
                            </button>
                            <button
                                className={styles.actionBtn}
                                style={{ 
                                    width: '100%', 
                                    margin: '1rem 0', 
                                    backgroundColor: tour.mainPage.showTripAdvisor ? '#00af87' : '' 
                                }}
                                onClick={() => {
                                    if (tour.mainPage.showTripAdvisor) {
                                        if (window.confirm("Disable TripAdvisor reviews for this tour?")) {
                                            tour.mainPage.showTripAdvisor = false;
                                            setUpdate(update + 1);
                                        }
                                    } else {
                                        const locId = window.prompt("Enter TripAdvisor Location ID (e.g. 214007 for King's College Chapel):", tour.mainPage.tripAdvisorLocationId || "214007");
                                        if (locId) {
                                            tour.mainPage.showTripAdvisor = true;
                                            tour.mainPage.tripAdvisorLocationId = locId;
                                            setUpdate(update + 1);
                                        }
                                    }
                                }}
                            >
                                TripAdvisor API {tour.mainPage.showTripAdvisor ? "(ON)" : "(OFF)"}
                            </button>
                            
                        </div>
                    </div>
                </div>
            </main>
            {hoverPreview && (
                <img
                    src={hoverPreview.imageSrc}
                    alt="Preview"
                    style={{
                        position: 'fixed',
                        top: hoverPreview.y + 10,
                        left: hoverPreview.x + 10,
                        width: '200px',
                        borderRadius: '8px',
                        pointerEvents: 'none',
                        zIndex: 1000,
                    }}
                />
            )}
        </div>
    );
};

export default EditProjectPage;