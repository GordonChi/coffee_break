import React, { useState, useEffect } from 'react';
import './UserSettings.css'; 

export default function UserSettings() {
    const userId = localStorage.getItem('userId');
    
    // 1. Instant UI Toggles 
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // 2. Batched Settings (for now)
    const [formData, setFormData] = useState({
        displayName: '',
        bio: ''
    });

    // Fetch the user's existing settings on load
    useEffect(() => {
        const fetchUserSettings = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5000/api/users/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    
                    setFormData({
                        displayName: data.displayName || '',
                        bio: data.bio || ''
                    });
                }
            } 
            catch (error) {
                console.error("Error fetching user settings:", error);
            } 
            finally {
                setIsLoading(false); 
            }
        };

        if (userId) {
            fetchUserSettings();
        }
    }, [userId]);

    const handleFormChange = (e) => {
        setFormData({
            ...formData, 
            [e.target.name]: e.target.value 
        });
    };

    // 
    const handleThemeToggle = () => {
        const newThemeStatus = !isDarkMode;
        setIsDarkMode(newThemeStatus); // Let react know what mode you are in

        if (newThemeStatus){
            document.body.classList.add('dark-theme');
            localStorage.setItem('appTheme', 'dark');   // Save it to local storage
        }
        else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('appTheme', 'light');  // Save it to local storage
        }
    };

    const handleSaveSettings = async () => {
        console.log("Preparing to send this packet to Express:", formData);
        
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/users/${userId}`, {
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert("Settings saved successfully!");
            }
        } catch (error) {
            console.error("Error saving settings:", error);
        }
    };

    if (isLoading) {
        return <div className="settings-container">Loading your preferences...</div>;
    }

    return (
        <div className="settings-container">
            <h1>Account Settings</h1>
            
            <div className="settings-card">
                {/* --- INSTANT TOGGLES SECTION --- */}
                <h2>Appearance</h2>
                <div className="setting-row">
                    <label>Enable Dark Mode</label>
                    <button className="btn-standard" onClick={handleThemeToggle}>
                        {isDarkMode ? 'Turn Off' : 'Turn On'}
                    </button>
                </div>

                <hr className="settings-divider" />

                {/* --- BATCHED PROFILE SECTION --- */}
                <h2>Profile Information</h2>
                <div className="profile-form-group">
                    <label>Display Name</label>
                    <input 
                        type="text" 
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleFormChange}
                        className="form-input"
                    />
                    
                    <label>Bio</label>
                    <textarea 
                        name="bio"
                        value={formData.bio}
                        onChange={handleFormChange}
                        rows="3"
                        className="form-input"
                    />
                </div>

                <hr className="settings-divider" />

                {/* --- REDIRECT SECTION --- */}
                <h2>Security</h2>
                <div className="setting-row">
                    <label>Two-Factor Authentication (2FA)</label>
                    <p className="helper-text">
                        Protect your account with an extra layer of security.
                    </p>
                    <button className="btn-disabled" disabled>
                        Setup 2FA (Coming Soon)
                    </button>
                </div>

                {/* THE BIG SAVE BUTTON */}
                <div className="save-action-container">
                    <button className="btn-save" onClick={handleSaveSettings}>
                        Save & Apply Changes
                    </button>
                </div>
            </div>
        </div>
    );
}