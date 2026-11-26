import React, { useEffect, useState, useRef } from 'react';
import './DashboardPage.css';
import CarouselWidget from '../../components/Widgets/Carousel/CarouselWidget';

export default function DashboardPage() {
    const username = localStorage.getItem('username') || 'Traveler';
    const userId = localStorage.getItem('userId');

    const [postContent, setPostContent] = useState('');
    const [posts, setPosts] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [feedWidth, setFeedWidth] = useState(400);
    const [isDragging, setIsDragging] = useState(false);

    // Master ledger of all active widgets on the canvas
    const [activeWidgets, setActiveWidgets] = useState([]);

    const viewportRef = useRef(null);
    const [isPanning, setIsPanning] = useState(false);
    const panState = useRef({ isDown: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 });

    // Load timeline posts on mount
    useEffect(() => {
        const fetchTimeLine = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5000/api/posts/timeline?userId=${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setPosts(data.posts);
                }
            } catch (error) {
                console.error("Error fetching timeline:", error);
            }
        };
        if (userId) fetchTimeLine();
    }, [userId]);

    // Load saved dashboard widget layout once on mount
    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5000/api/dashboard/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setActiveWidgets(data.widgets || []);
                }
            } catch (error) {
                console.error("Error fetching dashboard layout:", error);
            }
        };
        if (userId) fetchDashboard();
    }, [userId]);

    // Sync the full widgets array to MongoDB
    const saveDashboardLayout = async (updatedWidgets) => {
        if (!userId) return;
        try {
            await fetch(`http://127.0.0.1:5000/api/dashboard/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ widgets: updatedWidgets })
            });
        } catch (error) {
            console.error("Error saving dashboard layout:", error);
        }
    };

    // Add a new widget instance with a unique client-side ID
    const handleAddWidget = (type) => {
        const newWidget = {
            widgetId: crypto.randomUUID(),
            type,
            position: { x: 50, y: 150 },
            data: {}
        };
        const updatedWidgets = [...activeWidgets, newWidget];
        setActiveWidgets(updatedWidgets);
        saveDashboardLayout(updatedWidgets);
    };

    // Remove a specific widget instance by its unique widgetId
    const handleRemoveWidget = (widgetIdToRemove) => {
        const updatedWidgets = activeWidgets.filter(w => w.widgetId !== widgetIdToRemove);
        setActiveWidgets(updatedWidgets);
        saveDashboardLayout(updatedWidgets);
    };

    // Update a specific widget's position or data without affecting other instances
    const handleUpdateWidget = (widgetIdToUpdate, updates) => {
        const updatedWidgets = activeWidgets.map(w =>
            w.widgetId === widgetIdToUpdate
                ? {
                    ...w,
                    ...updates,
                    data: updates.data ? { ...w.data, ...updates.data } : w.data
                }
                : w
        );
        setActiveWidgets(updatedWidgets);
        saveDashboardLayout(updatedWidgets);
    };

    // Event handlers for resizing feed partition
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            const screenWidth = window.innerWidth;
            const minWidth = screenWidth * 0.30;
            const maxWidth = screenWidth * 0.60;
            const sidebarOffset = isSidebarOpen ? 250 : 0;
            const rawWidth = e.clientX - sidebarOffset;
            setFeedWidth(Math.max(minWidth, Math.min(rawWidth, maxWidth)));
        };

        const handleMouseUp = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isSidebarOpen]);

    const handleCanvasMouseDown = (e) => {
        if (!e.target.classList.contains('widget-canvas-area') && !e.target.classList.contains('widget-viewport')) {
            return;
        }
        e.preventDefault();
        setIsPanning(true);
        panState.current.isDown = true;
        panState.current.startX = e.pageX - viewportRef.current.offsetLeft;
        panState.current.startY = e.pageY - viewportRef.current.offsetTop;
        panState.current.scrollLeft = viewportRef.current.scrollLeft;
        panState.current.scrollTop = viewportRef.current.scrollTop;
    };

    const handleCanvasMouseMove = (e) => {
        if (!panState.current.isDown) return;
        e.preventDefault();
        const x = e.pageX - viewportRef.current.offsetLeft;
        const y = e.pageY - viewportRef.current.offsetTop;
        viewportRef.current.scrollLeft = panState.current.scrollLeft - (x - panState.current.startX);
        viewportRef.current.scrollTop = panState.current.scrollTop - (y - panState.current.startY);
    };

    const handleCanvasMouseUpOrLeave = () => {
        setIsPanning(false);
        panState.current.isDown = false;
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!postContent.trim()) return;

        try {
            const response = await fetch('http://127.0.0.1:5000/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, content: postContent })
            });

            if (response.ok) {
                const newPost = await response.json();
                newPost.user = { username };
                setPosts([...posts, newPost]);
                setPostContent('');
            } else {
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
            <aside className={`sidebar-nav ${isSidebarOpen ? '' : 'collapsed'}`}>
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
            <container className="center-feed" style={{ width: `${feedWidth}px` }}>
                <div className="feed-header">
                    <button
                        className="hamburger-btn"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        title={isSidebarOpen ? "Close Menu" : "Open Menu"}
                    >
                        ☰
                    </button>
                    <h3>Your Feed</h3>
                </div>

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

                <form className='chat-input-form' onSubmit={handleCreatePost} style={{ width: `${feedWidth - 30}px` }}>
                    <textarea
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
            </container>

            {/* Resizing div */}
            <div
                className="resizer-handle"
                onMouseDown={() => setIsDragging(true)}
            />

            {/* Widget Viewport */}
            <section
                className={`widget-viewport ${isPanning ? 'panning' : ''}`}
                ref={viewportRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUpOrLeave}
                onMouseLeave={handleCanvasMouseUpOrLeave}
            >
                <div className="widget-hud-container">
                    <span className="widget-hud-text">
                        {activeWidgets.length} {activeWidgets.length === 1 ? 'widget' : 'widgets'} active
                    </span>
                    <button
                        className="widget-hud-btn"
                        onClick={() => handleAddWidget('carousel')}
                    >
                        + Add Widget
                    </button>
                </div>

                {/* Widget Canvas */}
                <div className="widget-canvas-area">
                    {activeWidgets.map((widget) => {
                        if (widget.type === 'carousel') {
                            return (
                                <CarouselWidget
                                    key={widget.widgetId}
                                    widgetId={widget.widgetId}
                                    position={widget.position}
                                    data={widget.data}
                                    onUpdate={handleUpdateWidget}
                                    onRemove={handleRemoveWidget}
                                />
                            );
                        }
                        return null;
                    })}
                </div>
            </section>
        </div>
    );
}