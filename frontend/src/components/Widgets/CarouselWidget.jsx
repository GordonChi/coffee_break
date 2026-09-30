import React, { useState, useEffect } from 'react';
import './CarouselWidget.css';

export default function CarouselWidget({ userId }) {
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [widgetId, setWidgetId] = useState(null); // Track the MongoDB document ID
    
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // Fetch existing carousel data (image URLs) when dashboard loads
    useEffect(() => {
        const fetchWidget = async () => {
            if (!userId) return;
            try {
                const response = await fetch(`http://127.0.0.1:5000/api/widgets/${userId}`);
                if (response.ok) {
                    const widgets = await response.json();
                    // Locate this user's specific carousel widget
                    const carousel = widgets.find(w => w.widgetType === 'carousel');
                    
                    // If found, set the widget ID and images state
                    if (carousel) {
                        setWidgetId(carousel._id);
                        if (carousel.data?.imageUrls) {
                            setImages(carousel.data.imageUrls);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch widget data:", error);
            }
        };
        fetchWidget();
    }, [userId]);

    const handleFileSelect = (e) => setSelectedFile(e.target.files[0]);

    // Upload the selected image to Cloudinary and then save the URL to MongoDB
    const handleUpload = async () => {
        if (!selectedFile) return;
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            // Upload image to Cloudinary
            const cloudRes = await fetch('http://127.0.0.1:5000/api/widgets/upload', {
                method: 'POST',
                body: formData 
            });

            if (cloudRes.ok) {
                const cloudData = await cloudRes.json();
                const updatedImages = [...images, cloudData.imageUrl]; // Append new image to existing array

                // Save the updated image URLs to MongoDB
                const method = widgetId ? 'PUT' : 'POST';
                const endpoint = widgetId 
                    ? `http://127.0.0.1:5000/api/widgets/${widgetId}` 
                    : 'http://127.0.0.1:5000/api/widgets';

                const dbResponse = await fetch(endpoint, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: userId,
                        widgetType: 'carousel',
                        position: { x: 50, y: 150 },
                        data: { imageUrls: updatedImages } 
                    })
                });

                if (dbResponse.ok) {
                    const savedWidget = await dbResponse.json();
                    setImages(updatedImages);
                    setWidgetId(savedWidget._id || widgetId); 
                    setCurrentIndex(updatedImages.length - 1); // Auto-scroll to the new photo
                    setSelectedFile(null); // Reset input
                }
            }
        } catch (error) {
            console.error("Pipeline failed:", error);
        } finally {
            setIsUploading(false);
        }
    };

    // Delete the currently viewed image
    const handleDelete = async () => {
        if (!widgetId || images.length === 0) return;
        
        // Filter out the image currently on screen
        const updatedImages = images.filter((_, index) => index !== currentIndex);
        
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/widgets/${widgetId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    data: { imageUrls: updatedImages }
                })
            });

            if (response.ok) {
                setImages(updatedImages);
                // Prevent index out-of-bounds if we delete the very last image in the array
                if (currentIndex >= updatedImages.length && updatedImages.length > 0) {
                    setCurrentIndex(updatedImages.length - 1);
                }
            }
        } catch (error) {
            console.error("Failed to delete image:", error);
        }
    };

    // Carousel Navigation
    const nextImage = () => setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    const prevImage = () => setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));

    return (
        <div className="mock-widget carousel-widget-container">
            <h4>Photo Carousel</h4>
            
            <div className="carousel-form-group">
                <input type="file" accept="image/*" onChange={handleFileSelect} />
                <button className="carousel-upload-btn" onClick={handleUpload} disabled={!selectedFile || isUploading}>
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                </button>
            </div>

            {images.length > 0 && (
                <div className="carousel-preview-container" style={{ marginTop: '15px' }}>
                    <img 
                        src={images[currentIndex]} 
                        alt={`Slide ${currentIndex}`} 
                        className="carousel-preview-image" 
                    />
                    
                    {images.length > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0' }}>
                            <button onClick={prevImage} style={{ cursor: 'pointer' }}>&larr; Prev</button>
                            <span style={{ fontSize: '0.8rem' }}>{currentIndex + 1} / {images.length}</span>
                            <button onClick={nextImage} style={{ cursor: 'pointer' }}>Next &rarr;</button>
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
    );
}