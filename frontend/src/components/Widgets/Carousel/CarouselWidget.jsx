import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import './CarouselWidget.css';

export default function CarouselWidget({ widgetId, position, data, onUpdate, onRemove }) {
    const images = data?.imageUrls || [];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const nodeRef = useRef(null);

    const handleFileSelect = (e) => setSelectedFile(e.target.files[0]);

    // Upload image to Cloudinary, then hand the updated array up to the Dashboard to persist
    const handleUpload = async () => {
        if (!selectedFile) return;
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            const cloudRes = await fetch('http://127.0.0.1:5000/api/widgets/upload', {
                method: 'POST',
                body: formData
            });

            if (cloudRes.ok) {
                const cloudData = await cloudRes.json();
                const updatedImages = [...images, cloudData.imageUrl];
                onUpdate(widgetId, { data: { imageUrls: updatedImages } });
                setCurrentIndex(updatedImages.length - 1);
                setSelectedFile(null);
            }
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setIsUploading(false);
        }
    };

    // Report new coordinates to Dashboard on drag stop
    const handleDragStop = (e, dragData) => {
        onUpdate(widgetId, { position: { x: dragData.x, y: dragData.y } });
    };

    // Delete the currently viewed image from this specific widget instance
    const handleDelete = () => {
        if (images.length === 0) return;
        const updatedImages = images.filter((_, index) => index !== currentIndex);
        onUpdate(widgetId, { data: { imageUrls: updatedImages } });

        if (currentIndex >= updatedImages.length && updatedImages.length > 0) {
            setCurrentIndex(updatedImages.length - 1);
        }
    };

    const nextImage = () => setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    const prevImage = () => setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));

    return (
        <Draggable
            nodeRef={nodeRef}
            defaultPosition={position || { x: 50, y: 150 }}
            handle=".drag-handle"
            cancel=".widget-close-btn"
            bounds="parent"
            onStop={handleDragStop}
        >
            <div ref={nodeRef} className="mock-widget carousel-widget-container" style={{ position: 'absolute', padding: 0, overflow: 'hidden' }}>
                <div
                    className="drag-handle"
                    style={{
                        cursor: 'grab',
                        padding: '10px 15px',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        userSelect: 'none'
                    }}
                >
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', margin: 0, color: 'var(--text-secondary)' }}>
                        Photo Carousel
                    </span>
                    <button
                        className="widget-close-btn"
                        onClick={() => onRemove(widgetId)}
                        title="Remove Widget"
                    >
                        ×
                    </button>
                </div>

                <div style={{ padding: '1rem' }}>
                    <div className="carousel-form-group" style={{ marginBottom: images.length > 0 ? '15px' : '0' }}>
                        <input type="file" accept="image/*" onChange={handleFileSelect} />
                        <button className="carousel-upload-btn" onClick={handleUpload} disabled={!selectedFile || isUploading}>
                            {isUploading ? 'Uploading...' : 'Upload Image'}
                        </button>
                    </div>

                    {images.length > 0 && (
                        <div className="carousel-preview-container" style={{ marginTop: '5px' }}>
                            <img
                                src={images[currentIndex]}
                                alt={`Slide ${currentIndex}`}
                                className="carousel-preview-image"
                            />

                            {images.length > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0' }}>
                                    <button onClick={prevImage} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'var(--accent-color)' }}>&larr; Prev</button>
                                    <span style={{ fontSize: '0.8rem' }}>{currentIndex + 1} / {images.length}</span>
                                    <button onClick={nextImage} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'var(--accent-color)' }}>Next &rarr;</button>
                                </div>
                            )}

                            <button
                                onClick={handleDelete}
                                style={{ width: '100%', marginTop: '5px', padding: '6px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Delete Photo
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Draggable>
    );
}