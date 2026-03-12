import { useEffect, useMemo, useState } from 'react';
import { TourNode } from '../script/TourDataStruct';
import { listProjects, saveProjects } from '../script/storage';
import EditorLeftBar from './EditorLeftBar';
import ImageUpload from './ImageUpload';
import styles from '../styles/LandingPageCreator.module.css';

interface HighlightsCreatorProps {
    tour: TourNode;
    projectId?: string;
    onReturnEditor: () => void;
}

type Highlight = [string, string, string];

export const HighlightsCreator: React.FC<HighlightsCreatorProps> = ({
    tour,
    projectId,
    onReturnEditor,
}) => {
    const [Highlights, setHighlights] = useState<Highlight[]>(
        tour.mainPage.Highlights || []
    );
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [highlightTitle, setHighlightTitle] = useState('');
    const [highlightImage, setHighlightImage] = useState('');
    const [highlightDescription, setHighlightDescription] = useState('');

    useEffect(() => {
        tour.mainPage.Highlights = Highlights;
    }, [Highlights, tour]);

    const hasFormContent = useMemo(
        () => Boolean(highlightTitle.trim() || highlightImage.trim() || highlightDescription.trim()),
        [highlightTitle, highlightImage, highlightDescription]
    );

    const resetForm = () => {
        setSelectedIndex(null);
        setHighlightTitle('');
        setHighlightImage('');
        setHighlightDescription('');
    };

    const handleSelectHighlight = (index: number) => {
        const [imageSrc, title, description] = Highlights[index];
        setSelectedIndex(index);
        setHighlightImage(imageSrc || '');
        setHighlightTitle(title || '');
        setHighlightDescription(description || '');
    };

    const handleSaveHighlight = () => {
        const trimmedTitle = highlightTitle.trim();
        const trimmedDescription = highlightDescription.trim();

        if (!trimmedTitle) {
            alert('Please enter a title for the highlight.');
            return;
        }

        if (!highlightImage) {
            alert('Please upload an image for the highlight.');
            return;
        }

        if (!trimmedDescription) {
            alert('Please enter a description for the highlight.');
            return;
        }

        const nextHighlight: Highlight = [highlightImage, trimmedTitle, trimmedDescription];

        setHighlights((prev) => {
            if (selectedIndex === null) {
                return [...prev, nextHighlight];
            }

            return prev.map((highlight, index) => (index === selectedIndex ? nextHighlight : highlight));
        });

        resetForm();
    };

    const handleDeleteHighlight = () => {
        if (selectedIndex === null) {
            return;
        }

        setHighlights((prev) => prev.filter((_, index) => index !== selectedIndex));
        resetForm();
    };

    const handleSave = async () => {
        if (!projectId) return;
        const projects = await listProjects();
        const index = projects.findIndex((p) => p.id === projectId);

        if (index !== -1) {
            projects[index].tour = tour;
            await saveProjects(projects);
            alert('Project saved successfully');
        }
    };

    const HIGHLIGHT_DESCRIPTION_MAX_LENGTH = 350;

    return (
        <div className={styles.pageContainer}>
            <EditorLeftBar
                topButtonLabel="← Return"
                onTopButton={onReturnEditor}
                name={tour.mainPage.title || 'New Tour'}
                admin={tour.admin}
                onSave={handleSave}
            />

            <main className={styles.content}>
                <div className={styles.header}>
                    <h1 className={styles.pageTitle}>Highlight Creator</h1>
                    <p className={styles.pageSubtitle}>
                        Here you can add the highlights that appear on the public tour page.
                    </p>
                </div>

                <div className={styles.mainContent}>
                    <div className={styles.editorGrid}>
                        <div className={styles.editorPanel}>
                            <div className={styles.formGroup}>
                                <label className={styles.cardTitle}>Highlight Title</label>
                                <input
                                    className={styles.input}
                                    type="text"
                                    value={highlightTitle}
                                    onChange={(e) => setHighlightTitle(e.target.value)}
                                    placeholder="Highlight title"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.cardTitle}>Square Thumbnail</label>
                                <ImageUpload onSubmit={(img) => setHighlightImage(img || '')} />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.cardTitle}>Description</label>
                                <textarea
                                    className={`${styles.input} ${styles.largeInput}`}
                                    value={highlightDescription}
                                    onChange={(e) =>
                                        setHighlightDescription(
                                            e.target.value.slice(0, HIGHLIGHT_DESCRIPTION_MAX_LENGTH)
                                        )
                                    }
                                    maxLength={HIGHLIGHT_DESCRIPTION_MAX_LENGTH}                                    
                                    placeholder="Highlight description"
                                />
                                <p className={styles.cardSubtitle}>
                                    {highlightDescription.length}/{HIGHLIGHT_DESCRIPTION_MAX_LENGTH} characters
                                </p>
                            </div>

                            <div className={styles.buttonRow}>
                                <button className={styles.primaryActionBtn} onClick={handleSaveHighlight}>
                                    {selectedIndex === null ? 'Add Highlight' : 'Update Highlight'}
                                </button>
                                <button
                                    className={styles.dangerActionBtn}
                                    onClick={handleDeleteHighlight}
                                    disabled={selectedIndex === null}
                                >
                                    Delete Highlight
                                </button>
                            </div>
                        </div>

                        <div className={styles.previewColumn}>
                            <h3 className={styles.cardTitle}>Card Preview</h3>
                            <div className={styles.squareCard}>
                                <div className={styles.squareImageWrapper}>
                                    {highlightImage ? (
                                        <img src={highlightImage} className={styles.cardImage} alt="Preview" />
                                    ) : (
                                        <div className={styles.placeholderImage}>No Image</div>
                                    )}
                                </div>
                                <div className={styles.squareCardContent}>
                                    <h3 className={styles.highlightsTitleText}>{highlightTitle || 'Untitled Highlight'}</h3>
                                    <p className={styles.highlightsListText}>
                                        {highlightDescription || 'No description provided.'}
                                    </p>
                                </div>
                            </div>

                            <div className={styles.highlightListSection}>
                                <h3 className={styles.cardTitle}>Saved Highlights</h3>
                                {Highlights.length === 0 ? (
                                    <p className={styles.cardSubtitle}>No highlights have been added yet.</p>
                                ) : (
                                    <div className={styles.highlightCardList}>
                                        {Highlights.map(([imageSrc, title], index) => (
                                            <button
                                                key={`${title}-${index}`}
                                                type="button"
                                                className={`${styles.highlightsListItem} ${selectedIndex === index ? styles.highlightsListItemActive : ''}`}
                                                onClick={() => handleSelectHighlight(index)}
                                            >
                                                <div className={styles.highlightsThumb}>
                                                    {imageSrc ? (
                                                        <img src={imageSrc.replace('.jpg', '-small.jpg')} alt={title} className={styles.cardImage} />
                                                    ) : (
                                                        <div className={styles.placeholderImage}>No Image</div>
                                                    )}
                                                </div>
                                                <div className={styles.highlightsTitleText}>
                                                    <strong>{title}</strong>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};