import styles from '../styles/LandingPageCreator.module.css';
import { useState, useEffect } from 'react';
import { TourNode } from '../script/TourDataStruct';
import EditorLeftBar from './EditorLeftBar';
import ImageUpload from './ImageUpload';
import { listProjects, saveProjects } from '../script/storage';
import Panorama from './Panorama';

interface LandingPageCreatorProps {
    tour: TourNode;
    projectId?: string;
    onReturnEditor: () => void;
    section?: 'card' | 'landing';
}

export const LandingPageCreator: React.FC<LandingPageCreatorProps> = ({ tour, projectId, onReturnEditor, section }) => {
    const [cardTitle, setCardTitle] = useState(tour.mainPage.title || "");
    const [cardLogo, setCardLogo] = useState(tour.mainPage.logo || "");
    const [tripAdvisorId, setTripAdvisorId] = useState(tour.mainPage.tripAdvisorLocationId || "");
    const [landingTitle, setLandingTitle] = useState(tour.mainPage.introduction || ""); 
    const [landingDescription, setLandingDescription] = useState(tour.mainPage.description || "");
    const [slideshowImages] = useState<string[]>(tour.mainPage.slideShowImages || []);
    
    const [viewingTour, setViewingTour] = useState(false);
    const [viewingLandingPreview, setViewingLandingPreview] = useState(false);
    const [activeSection, setActiveSection] = useState<'card' | 'landing'>(section ?? 'card');
    const [currentSlide, setCurrentSlide] = useState(0);
    const currentSection = section ?? activeSection;

    useEffect(() => {
        if (section) setActiveSection(section);
    }, [section]);

    useEffect(() => {
        tour.mainPage.title = cardTitle;
        tour.mainPage.logo = cardLogo;
        tour.mainPage.tripAdvisorLocationId = tripAdvisorId;
        tour.mainPage.introduction = landingTitle;
        tour.mainPage.description = landingDescription;
        tour.mainPage.slideShowImages = slideshowImages;
    }, [cardTitle, cardLogo, tripAdvisorId, landingTitle, landingDescription, slideshowImages, tour]);

    useEffect(() => {
        if (!viewingLandingPreview || slideshowImages.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [viewingLandingPreview, slideshowImages]);

    const handleSave = async () => {
        if (!projectId) return;
        const projects = await listProjects();
        const index = projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            projects[index].tour = tour;
            await saveProjects(projects);
            alert("Project saved successfully");
        }
    };

    if (viewingTour && tour.startNode) {
        return (
            <div className={styles.viewerContainer}>
                <button className={styles.viewerCloseBtn} onClick={() => setViewingTour(false)}>
                    Return to Page Editor
                </button>
                <Panorama GivenPanoNode={tour.startNode}></Panorama>
            </div>
        );
    }

    if (viewingLandingPreview) {
        return (
            <div className={styles.fullPagePreview}>
                <nav className={styles.previewNav}>
                    <button onClick={() => setViewingLandingPreview(false)} className={styles.viewerCloseBtn}>
                        ← Exit Preview
                    </button>
                    <span className={styles.previewBadge}>LANDING PAGE PREVIEW</span>
                </nav>
                
                <div className={styles.webPageContent}>
                    <header className={styles.slideshowContainer}>
                        {slideshowImages.length > 0 ? (
                            slideshowImages.map((img, idx) => (
                                <div 
                                    key={idx} 
                                    className={`${styles.slide} ${idx === currentSlide ? styles.activeSlide : ''}`}
                                    style={{ backgroundImage: `url(${img})` }}
                                />
                            ))
                        ) : (
                            <div className={styles.emptySlideshowPlaceholder}>No Slideshow Images Uploaded</div>
                        )}
                    </header>

                    <button className={styles.fullWidthStartBtn} onClick={() => { setViewingLandingPreview(false); setViewingTour(true); }}>
                        Tour Start
                    </button>

                    <article className={styles.webBody}>
                        <div className={styles.webContainer}>
                            <h1 className={styles.landingPageTitle}>{landingTitle || "Page Title"}</h1>
                            <p className={styles.bodyText}>{landingDescription || "No description provided."}</p>
                        </div>
                    </article>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <EditorLeftBar
                topButtonLabel="← Return"
                onTopButton={onReturnEditor}
                name={cardTitle || "New Tour"}
                admin={tour.admin}
                onSave={handleSave}
                onView={section === 'card' ? undefined : () => setViewingLandingPreview(true)}
                viewLabel="Preview Page"
            />

            <main className={styles.content}>
                <div className={styles.header}>
                        <h1 className={styles.pageTitle}>
                            {
                                section === 'card' ? 'Selection Card Creator' 
                            : 
                                section === 'landing' ? 'Landing Page Creator'
                            : null}
                        </h1>
                        <p className={styles.pageSubtitle}>
                            {
                                section === 'card' ? 'Here you can customize the card that represents this tour on the website tour list.' 
                            : 
                                section === 'landing' ? 'Here you can customize the content that visitors will see on the tour\'s landing page, such as the title and description.'
                            : null}
                        </p>
                </div>

                <div className={styles.mainContent}>

                    <div className={styles.editorGrid}>
                        {currentSection === 'card' ? (
                            <>
                                <div className={styles.editorPanel}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.cardTitle}>Card Title</label>
                                        <input className={styles.input} type="text" value={cardTitle} onChange={(e) => setCardTitle(e.target.value)} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.cardTitle}>Square Thumbnail</label>
                                        <ImageUpload onSubmit={(img) => setCardLogo(img || "")} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.cardTitle}>TripAdvisor Location ID</label>
                                        <input className={styles.input} type="text" value={tripAdvisorId} onChange={(e) => setTripAdvisorId(e.target.value)} placeholder="e.g. 212130" />
                                        <p className={styles.inputHint}>Leave blank if not applicable. The ID is the number in the TripAdvisor URL.</p>
                                    </div>
                                </div>

                                <div className={styles.previewColumn}>
                                    <h3 className={styles.cardTitle}>Card Preview</h3>
                                    <div className={styles.squareCard}>
                                        <div className={styles.squareImageWrapper}>
                                            {cardLogo ? <img src={cardLogo} className={styles.cardImage} alt="Preview" /> : <div className={styles.placeholderImage}>No Image</div>}
                                        </div>
                                        <div className={styles.squareCardContent}>
                                            <h3 className={styles.squareCardTitle}>{cardTitle || "Untitled Tour"}</h3>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className={styles.landingEditorFull}>
                                <div className={styles.editorPanel}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.cardTitle}>Main Page Title</label>
                                        <input 
                                            className={styles.input} 
                                            type="text" 
                                            value={landingTitle} 
                                            onChange={(e) => setLandingTitle(e.target.value)} 
                                            placeholder="The title visitors see on the landing page..."
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.cardTitle}>Page Description / Content</label>
                                        <textarea 
                                            className={`${styles.input} ${styles.largeInput}`}
                                            value={landingDescription} 
                                            onChange={(e) => setLandingDescription(e.target.value)} 
                                            placeholder="Write the full description or history here..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};