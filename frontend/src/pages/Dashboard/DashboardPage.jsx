import React, { useState } from 'react';
import './DashboardPage.css';

export default function DashboardPage() {
    // Grab the user from the login token
    const username = localStorage.getItem('username') || 'Traveler';

    // States for the new post input
    const [postContent, setPostContent] = useState('');

    // Handle submitting posts to the backend
    const handleCreatePost = async (e) => {
        e.preventDefault();

        if (!postContent.trim()) return;

        try {
            // Grab the userId from localStorage
            const userId = localStorage.getItem('userId');
            
            // Checking what I am sending because I keep getting an error
            console.log("Frontend is sending this payload:", { userId: userId, content: postContent });

            const response = await fetch('http://127.0.0.1:5000/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId,
                    content: postContent
                })
            });

            if (response.ok) {
                const newPost = await response.json();
                console.log("Post successfully created:", newPost);
                setPostContent(''); 
            } else {
                // If an error occurs while sending
                const errorData = await response.json();
                console.error("Server rejected the post:", errorData);
            }
        } catch (error) {
            console.error("Network or fetch error:", error);
        }
    };

    return (
        <div className="dashboard-master-layout">
            
            {/* Sidebar */}
            <aside className="sidebar-nav">
                <div className="sidebar-logo">
                    <span className="brand-icon">☕</span>
                    <h2>Menu</h2>
                </div>
                <nav className="sidebar-links">
                    <button className="nav-item active">Home</button>
                    <button className="nav-item">Profile</button>
                    <button className="nav-item">Settings</button>
                </nav>
                <div className="sidebar-footer">
                    <p className="user-greeting">Hi, {username}</p>
                </div>
            </aside>

            {/* Center Feed */}
            <main className="center-feed">
                <div className="feed-header">
                    <h3>Your Feed</h3>
                </div>

                {/* Scrollable area */}
                <div className="feed-content posts-scroll-area">
                    {/* We will build the post submission form here next! */}
                    <div className="placeholder-post">
                        <p><strong>{username}</strong></p>
                        <p>Just setting up my new workspace. Testing the layout!</p>
                        <small>Just now</small>
                    </div>
                    <div className="placeholder-post">
                        <p><strong>System</strong></p>
                        <p>Welcome to your personal dashboard.</p>
                        <small>1 hour ago</small>
                    </div>
                </div>

                { /* input box area */ }
                <form className='chat-input-form' onSubmit={handleCreatePost}>
                    <input
                        type="text"
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="What's on your mind today?"
                        className='chat-text-input'
                    />
                    <button type="submit" className='chat-send-button'>
                        Send
                    </button>
                </form>
            </main>

            {/* Widget Canvas */}
            <section className="widget-canvas">
                <div className="canvas-header">
                    <span>0 widgets active</span>
                    <button className="add-widget-btn">+ Add Widget</button>
                </div>
                
                {/* Temporary hardcoded widgets to test the look */}
                <div className="mock-widget weather-widget">
                    <h4>🌤️ Edmonton</h4>
                    <p>22°C</p>
                    <small>Partly Cloudy</small>
                </div>

                <div className="mock-widget sticky-widget">
                    <h4>📌 To-Do</h4>
                    <ul>
                        <li>Build Post API</li>
                        <li>Add Drag & Drop</li>
                        <li>Connect Spotify</li>
                    </ul>
                </div>
            </section>

        </div>
    );
}