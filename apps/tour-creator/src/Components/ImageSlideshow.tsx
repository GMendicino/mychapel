import { useState, useEffect } from 'react';
import styles from '../styles/ImageSlideshow.module.css';
import { TourNode } from '../script/TourDataStruct';
import EditorLeftBar from './EditorLeftBar';
import ImageUpload from './ImageUpload'; // Using the shared component
import { listProjects, saveProjects } from '../script/storage';

interface ImageSlideshowProps {
  images: string[];
  onReturn: () => void;
}

// Viewer Component (The actual slideshow player)
const ImageSlideshow: React.FC<ImageSlideshowProps> = ({ images, onReturn }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    if (images.length === 0) return;
    const timer = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // 5 seconds per slide
    return () => clearTimeout(timer);
  }, [currentIndex, images.length]);

  return (
    <div className={styles.viewerContainer}>
      <div className={styles.viewerHeader}>
        <button onClick={onReturn} className={styles.backBtn}>← Exit Slideshow</button>
      </div>
      
      {images.length > 0 ? (
        <>
          <div className={styles.slideWrapper}>
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Slide ${index + 1}`}
                className={styles.slideImage}
                style={{ opacity: index === currentIndex ? 1 : 0 }}
              />
            ))}
          </div>
          <p className={styles.counter}>
            Slide {currentIndex + 1} of {images.length}
          </p>
        </>
      ) : (
         <div className={styles.emptyStateOverlay}>
            <p>No images uploaded.</p>
            <button onClick={onReturn} className={styles.secondaryBtn}>Return to Editor</button>
         </div>
      )}
    </div>
  );
};

interface SlideshowEditorProps {
    tour: TourNode;
    projectId?: string;
    onReturnEditor: () => void;
}

// Main Editor Page Component
function SlideshowFeature({ tour, projectId, onReturnEditor }: SlideshowEditorProps) {
  // Initialize from tour data, ensuring array exists
  const [slides, setSlides] = useState<string[]>(tour.mainPage.slideShowImages || []);
  const [isViewing, setIsViewing] = useState<boolean>(false);
  const [uploadKey, setUploadKey] = useState<number>(0);

  // Sync state back to tour object whenever slides change
  useEffect(() => {
    tour.mainPage.slideShowImages = slides;
  }, [slides, tour]);

  const handleAddSlide = (img: string | null) => {
    if (img) {
      setSlides(prev => [...prev, img]);
      setUploadKey(k => k + 1); // Reset upload input
    }
  };

  const handleDeleteSlide = (indexToDelete: number) => {
    if (window.confirm("Are you sure you want to delete this slide?")) {
        setSlides(prev => prev.filter((_, index) => index !== indexToDelete));
    }
  };

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
        alert("Slideshow saved successfully!");
    } else {
        alert("Error: Project not found.");
    }
  };

  if (isViewing) {
    return <ImageSlideshow images={slides} onReturn={() => setIsViewing(false)} />;
  }

  return (
    <div className={styles.pageContainer}>
        {/* Reuse the standard Left Bar for consistency */}
        <EditorLeftBar
            topButtonLabel="← Return"
            onTopButton={onReturnEditor}
            name={tour.mainPage.title}
            admin={tour.admin}
            onSave={handleSave}
            onView={() => setIsViewing(true)}
            viewLabel="Preview slideshow"
            viewDisabled={slides.length === 0}
        />

        <main className={styles.content}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>Slideshow Editor</h1>
                <p className={styles.pageSubtitle}>Here you can manage the images that will be displayed on the tour's landing page.</p>
            </div>

            <div className={styles.mainLayout}>
                {/* Top Section: Upload */}
                <div className={styles.uploadSection}>
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Add New Slide</h3>
                        <p className={styles.cardSubtitle}>Upload images to be displayed on the tour's landing page.</p>
                        <ImageUpload key={uploadKey} onSubmit={handleAddSlide} />
                    </div>
                </div>

                {/* Bottom Section: Grid of Slides */}
                <div className={styles.gridSection}>
                    <div className={styles.sectionHeader}>
                        <h3>Current Slides ({slides.length})</h3>
                    </div>
                    
                    {slides.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>No slides added yet. Upload an image above to get started.</p>
                        </div>
                    ) : (
                        <div className={styles.slideGrid}>
                            {slides.map((img, index) => (
                                <div key={index} className={styles.slideCard}>
                                    <div className={styles.imageRatioBox}>
                                        <img src={img} alt={`Slide ${index}`} />
                                    </div>
                                    <div className={styles.slideActions}>
                                        <span className={styles.slideIndex}>#{index + 1}</span>
                                        <button 
                                            onClick={() => handleDeleteSlide(index)} 
                                            className={styles.deleteBtn}
                                            title="Remove slide"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    </div>
  );
}

export default SlideshowFeature;