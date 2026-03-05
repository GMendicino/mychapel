import ImageUpload from "./Components/ImageUpload";
import Panorama from "./Components/Panorama";
import { useState } from "react";
import HotspotPlacingPage from "./HotspotPlacingPage";
import EditorLeftBar from "./Components/EditorLeftBar";
import SlideshowFeature from "./Components/ImageSlideshow";
import styles from "./styles/EditProjectPage.module.css"; // Import new styles
import { type Project, listProjects, saveProjects } from "./script/storage";
import { LandingPageCreator } from "./Components/LandingPageCreator";

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
        }
    };

    const SceneNames = (tour.createdPanoNodes ?? [])
        //.filter(p => p.imageSrc !== tour.startNode?.imageSrc)
        .map(p => p.fileName || getFileNameFromUrl(p.imageSrc))
        .filter(Boolean);

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
                        <li key={`${name}-${i}`} className={styles.fileListItem}>
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
                                // onClick={() => setShowPointsOfInterestPage(true)}
                            >
                                Points of Interest
                            </button>
                            <button
                                className={styles.actionBtn}
                                style={{ width: '100%' , margin: '1rem 0'}}
                                // onClick={() => setShowPointsOfInterestPage(true)}
                            >
                                Place pin on map
                            </button>
                            
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EditProjectPage;