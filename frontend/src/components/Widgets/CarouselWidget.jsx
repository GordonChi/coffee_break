import React, { useState } from 'react';
import './CarouselWidget.css';

export default function CarouselWidget() {
    // Store the files before uploading them
    const [selectedFile, setSelectedFile] = useState(null);
    // Store the cloudinary URL after uploading them
    const [uploadedUrl, setUploadedUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Grab the file
    const handleFileSelect = (e) => {
        // e.target.files is an array, just grab the first one
        const file = e.target.files[0];
        setSelectedFile(file);
    };

    // Uploading
    const handleUpload = async () => {
        if (!selectedFile) return;
        setIsUploading(true);

        try {
            // BUG 1 FIXED: Capitalized FormData
            const formData = new FormData();

            // put the file into a box and ship it
            formData.append('image', selectedFile);

            // send it to backend
            const response = await fetch('http://127.0.0.1:5000/api/widgets/upload', {
                method: 'POST',
                // BUG 2 FIXED: Removed the quotes around formData
                body: formData 
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Success! Cloudinary URL: ", data.imageUrl);
                setUploadedUrl(data.imageUrl);  // Save the image url to display the image
            }
        }
        catch (error) {
            console.error("Upload failed:", error);
        }
        finally {
            setIsUploading(false);
        }
    }; // Removed the extra closing brace that was below this line!

    return (
        /* We keep 'mock-widget' for the white box/shadow, and add our specific container class */
        <div className="mock-widget carousel-widget-container">
            <h4>Photo Carousel Prototype</h4>
            
            <div className="carousel-form-group">
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileSelect} 
                />
                
                <button 
                    className="carousel-upload-btn"
                    onClick={handleUpload} 
                    disabled={!selectedFile || isUploading}
                >
                    {isUploading ? 'Uploading to Cloudinary...' : 'Upload Image'}
                </button>
            </div>

            {uploadedUrl && (
                <div className="carousel-preview-container">
                    <p className="carousel-success-text">Upload Successful!</p>
                    <img 
                        src={uploadedUrl} 
                        alt="Uploaded preview" 
                        className="carousel-preview-image" 
                    />
                </div>
            )}
        </div>
    );
}