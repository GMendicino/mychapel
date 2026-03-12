import { useState, useEffect } from "react";
import type { InfoPointNode } from "../script/TourDataStruct";
import styles from "../styles/InfoPointModal.module.css";

interface InfoPointModalProps {
    infoPoint: InfoPointNode;
    onClose: () => void;
}

function InfoPointModal({ infoPoint, onClose }: InfoPointModalProps) {
    const [imageExpanded, setImageExpanded] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const handleSpeak = () => {
        if (isSpeaking) {
            speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }
        const utterance = new SpeechSynthesisUtterance(infoPoint.description);
        utterance.onend = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    };

    useEffect(() => {
        return () => speechSynthesis.cancel();
    }, []);

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{infoPoint.title}</h2>
                    <button onClick={onClose} className={styles.closeBtn}>&times;</button>
                </div>
                <div className={styles.body}>
                    <p className={styles.description}>{infoPoint.description}</p>
                    <div className={styles.mediaRow}>
                        {infoPoint.imageSrc && (
                            <div>
                                <img
                                    src={infoPoint.imageSrc.replace('.jpg', '-small.jpg')}
                                    alt={infoPoint.title}
                                    className={styles.image}
                                    onClick={() => setImageExpanded(true)}
                                    draggable={false}
                                />
                                <p className={styles.imageHint}>Click image to expand</p>
                            </div>
                        )}
                        {infoPoint.description && (
                            <button className={styles.speakBtn} onClick={handleSpeak}>
                                {isSpeaking ? "Stop Audio" : "Play Audio"}
                            </button>
                        )}
                    </div>
                    {imageExpanded && (
                        <div className={styles.imageOverlay} onClick={() => setImageExpanded(false)}>
                            <img src={infoPoint.imageSrc} alt={infoPoint.title} draggable={false} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default InfoPointModal;