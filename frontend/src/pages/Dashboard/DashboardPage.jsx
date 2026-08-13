import React, { useEffect, useState } from 'react';
import './DashboardPage.css';

export default function DashboardPage() {
    // Grab the user from the login token
    const username = localStorage.getItem('username') || 'Traveler';
    const userId = localStorage.getItem('userId'); // Fixed: getItem

    // States for the new post input
    const [postContent, setPostContent] = useState('');
    // States for fetched timeline
    const [posts, setPosts] = useState([]); // Fixed: renamed to 'posts'

    // Load the timeline when the dashboard first loads
    // using useEffect
    useEffect(() => { // Fixed: Removed the extra '('
        const fetchTimeLine = async () => {
            try {
                // use the userId for a query parameter
                const response = await fetch(`http://127.0.0.1:5000/api/posts/timeline?userId=${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setPosts(data.posts);
                }
            } catch (error) {
                console.error("Error fetching timeline:", error);
            }
        }
        if (userId) {
            fetchTimeLine();
        }
    }, [userId]);

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

                newPost.user = { username: username };

                setPosts([newPost, ...posts]);

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
                    {posts.length === 0 ? (
                        <div className="placeholder-post">
                            <p>No posts yet. Start the conversation!</p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <div key={post._id} className="placeholder-post">
                                <p><strong>{post.user?.username || 'Unknown User'}</strong></p>
                                <p>{post.content}</p>
                                <small>{new Date(post.createdAt).toLocaleString()}</small>
                            </div>
                        ))
                    )}
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