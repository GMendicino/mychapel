import { useState } from 'react';
import type { ChangeEvent } from 'react';
import styles from '../styles/ImageUpload.module.css';
import imageCompression from 'browser-image-compression';

interface ImageUploadProps {
    onSubmit: (image: string | null, fileName?: string) => void;
}

const ImageUpload = ({ onSubmit }: ImageUploadProps) => {
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        setError(null);
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith('image/')) {
                setError('Please select a valid image file.');
                setPreviewUrl(null);
                setSelectedFile(null);
                return;
            }

            // Create local preview
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
            setSelectedFile(file);
        } else {
            setPreviewUrl(null);
            setSelectedFile(null);
        }
    };

    const uploadFile = async (file: File | Blob, filename: string): Promise<string> => {
        const formData = new FormData();
        formData.append('image', file, filename);

        const token = localStorage.getItem("authToken");
        if (!token) {
            throw new Error("Not authenticated");
        }

        const response = await fetch('/save-image', {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const data = await response.json();
        return data.url;
    };


    const handleSubmit = async () => {
        if (!selectedFile) return;

        setUploading(true);
        try {
            
            // Compress image before upload
            const options = {
                maxSizeMB: 5,              // Max file size 5MB
                maxWidthOrHeight: 8192,    // up to 8K resolution
                useWebWorker: true, 
                fileType: 'image/jpeg'     // Convert to JPEG
            };

            console.log('Original size:', (selectedFile.size / 1024 / 1024).toFixed(2), 'MB');
            
            const compressedFile = await imageCompression(selectedFile, options);
            
            console.log('Compressed size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
            
            // Generates unique base filename
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 8);
            const baseName = `${timestamp}-${randomStr}`;

            // Upload Original
            const originalUrl = await uploadFile(compressedFile, `${baseName}.jpg`);

            // Upload 200KB thumbnail version
            const thumbnailOptions = {
                maxSizeMB: 0.25,
                maxWidthOrHeight: 2048,
                useWebWorker: true,
                fileType: 'image/jpeg' as const
            };
            const thumbnailFile = await imageCompression(selectedFile, thumbnailOptions);
            console.log('Thumbnail size:', (thumbnailFile.size / 1024 / 1024).toFixed(2), 'MB');

            await uploadFile(thumbnailFile, `${baseName}-small.jpg`);

            onSubmit(originalUrl);

            // Cleanup
            setPreviewUrl(null);
            setSelectedFile(null);
        } catch (err) {
            console.error(err);
            setError('Failed to upload image.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={styles.container}>
            <label className={styles.uploadLabel}>
                <div className={styles.iconContainer}>
                    <svg className={styles.uploadIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    <span className={styles.uploadTextMain}>Click to Select Image</span>
                    <span className={styles.uploadTextSub}>JPG, PNG supported</span>
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} className={styles.fileInput} />
            </label>

            {error && <div className={styles.errorMsg}>{error}</div>}

            {previewUrl && (
                <img src={previewUrl} alt="Preview" className={styles.previewImg} />
            )}

            <button
                type="button"
                onClick={handleSubmit}
                disabled={!selectedFile || uploading}
                className={styles.submitBtn}
            >
                {uploading ? 'Uploading...' : 'Submit Image'}
            </button>
        </div>
    );
};

export default ImageUpload;