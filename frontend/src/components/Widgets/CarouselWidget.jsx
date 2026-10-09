import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import './CarouselWidget.css';

export default function CarouselWidget({ userId }) {
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [widgetId, setWidgetId] = useState(null); // Track the MongoDB document ID

    // Positional data for the draggable widget
    const [position, setPosition] = useState({ x: 50, y: 150 });
    const [isLoaded, setIsLoaded] = useState(false); // Track if the widget has been loaded from the database

    const nodeRef = useRef(null); // Ref for the draggable node
    
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
                        if (carousel.data?.imageUrls) setImages(carousel.data.imageUrls);

                        // load the saved position from MongoDB if it exists
                        if (carousel.position) setPosition(carousel.position);
                    }
                }
            } 
            catch (error) {
                console.error("Failed to fetch widget data:", error);
            }
            finally {
                // Set the loaded state to true after the fetch attempt
                setIsLoaded(true);
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
                        position: position,
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
        } 
        catch (error) {
            console.error("Pipeline failed:", error);
        } 
        finally {
            setIsUploading(false);
        }
    };

    // Save position on drag stop
    const handleDragStop = async (e, data) => {
        const newPos = { x: data.x, y: data.y };
        setPosition(newPos); // Update local state immediately for responsiveness

        if (widgetId) {
            try {
                // Quietly save the new position to MongoDB without blocking the UI
                await fetch(`http://127.0.0.1:5000/api/widgets/${widgetId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: userId,
                        widgetType: 'carousel',
                        position: newPos,
                        data: { imageUrls: images } // Keep existing images
                    })
                });
            }
            catch (error) {
                console.error("Failed to save widget position:", error);
            }
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

    // Render nothing until the widget has been loaded from the database
    if (!isLoaded) return null;

    return (
        <Draggable 
            nodeRef={nodeRef} 
            defaultPosition={position}  
            handle=".drag-handle" 
            bounds="parent" 
            onStart={(e, data) => console.log("1. Mouse clicked the handle! Starting drag...")}
            onDrag={(e, data) => console.log(`2. Dragging... Current X: ${data.x}, Y: ${data.y}`)}
            onStop={(e, data) => {
                console.log("3. Mouse released! Saving to DB...");
                handleDragStop(e, data);
            }}
        >
            {/* 1. Override the default padding and hide overflow so the header corners round nicely */}
            <div ref={nodeRef} className="mock-widget carousel-widget-container" style={{ position: 'absolute', padding: 0, overflow: 'hidden' }}>
                
                {/* 2. The Window Title Bar (Functions as the completely clickable drag handle) */}
                <div 
                    className="drag-handle" 
                    style={{ 
                        cursor: 'grab', 
                        padding: '10px 15px', 
                        backgroundColor: 'rgba(255, 255, 255, 0.03)', 
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        userSelect: 'none' // Prevents the title text from highlighting while dragging
                    }}
                >
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', margin: 0, color: 'var(--text-secondary)' }}>
                        Photo Carousel
                    </span>
                </div>

                {/* 3. The Inner Content Area (Restores the padding for your actual widget UI) */}
                <div style={{ padding: '1rem' }}>

                    {/* Moved outside the conditional check so it always renders */}
                    <div className="carousel-form-group" style={{ marginBottom: images.length > 0 ? '15px' : '0' }}>
                        <input type="file" accept="image/*" onChange={handleFileSelect} />
                        <button className="carousel-upload-btn" onClick={handleUpload} disabled={!selectedFile || isUploading}>
                            {isUploading ? 'Uploading...' : 'Upload Image'}
                        </button>
                    </div>

                    {/* Only show the preview area if there are actually images */}
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