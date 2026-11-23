import React, { useEffect, useState, useRef } from 'react'; // I should really start commenting when I add stuff
import './DashboardPage.css';                               // useRef added in version 0.5(?) (we're making up a starting point)
import CarouselWidget from '../../components/Widgets/CarouselWidget';

export default function DashboardPage() {
    // Grab the user from the login token
    const username = localStorage.getItem('username') || 'Traveler';
    const userId = localStorage.getItem('userId'); // Fixed: getItem

    // States for the new post input
    const [postContent, setPostContent] = useState('');
    // States for fetched timeline
    const [posts, setPosts] = useState([]); // Fixed: renamed to 'posts'
    // States for sidebar toggle on/off
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // States for middle partition (400 px by default)
    const [feedWidth, setFeedWidth] = useState(400);
    const [isDragging, setIsDragging] = useState(false);
    // Stuff for the click-and-drag widget area movement
    const viewportRef = useRef(null);   // Using useRef as to not make React re-render the page when making changes
    const [isPanning, setIsPanning] = useState(false)
    const panState = useRef({ isDown: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0});

    // Load the timeline when the dashboard first loads
    // using useEffect
    useEffect(() => {
        const fetchTimeLine = async () => {
            try {
                // use the userId for a query parameter to 'filter' only userIds timeline
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

    // Event handlers for resizing windows
    useEffect(() => {
        /* 
        If the mouse moves while the handle is being clicked:
        Find the X position of where the mouse is to reposition the handle
        */
        const handleMouseMove = (e) => {
            if (!isDragging) return;

            /* 
            Find the current screen size, this way it doesn't matter if
            the user is working on HD, SD, vertical screens, UHD or other
            niche resolutions
            */
            const screenWidth = window.innerWidth;

            /*
            The feed should never be under 30% or above 60% of the screen
            clamp it between these two values
            */
            const minWidth = screenWidth * 0.30;
            const maxWidth = screenWidth * 0.60;

            // If sidebar is open, take the difference.
            const sidebarOffset = isSidebarOpen ? 250 : 0;
            const rawWidth = e.clientX - sidebarOffset;

            // Clamp it!
            const clampedWidth = Math.max(minWidth, Math.min(rawWidth, maxWidth));

            setFeedWidth(clampedWidth);

        };


        const handleMouseUp = () => {
            setIsDragging(false);
        };

        /* 
        If the user is clicking on the handle:
        mousemove - the user moved the mouse
        mouseup - the user is no longer clicking the handle
        */
        if (isDragging){
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        // Cleanup
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
    }, [isDragging]);

            const handleCanvasMouseDown = (e) => {
            // Don't let the user move the widget window if the user is moving a widget
            if (!e.target.classList.contains('widget-canvas-area') && !e.target.classList.contains('widget-viewport')){
                return; // Ignore clicks on widgets, buttons, or anything else
            }

            e.preventDefault(); // blocks the highlighting text

            setIsPanning(true);
            panState.current.isDown = true;
            panState.current.startX = e.pageX - viewportRef.current.offsetLeft;
            panState.current.startY = e.pageY - viewportRef.current.offsetTop;
            panState.current.scrollLeft = viewportRef.current.scrollLeft;
            panState.current.scrollTop = viewportRef.current.scrollTop;
        };

        const handleCanvasMouseMove = (e) => {
            if (!panState.current.isDown) return;
            e.preventDefault();     // prevents the highlighting of text and stuff

            const x = e.pageX - viewportRef.current.offsetLeft;
            const y = e.pageY - viewportRef.current.offsetTop;

            // Calculate how far the mouse moved
            const walkX = x - panState.current.startX;
            const walkY = y - panState.current.startY;

            // Update the scroll position
            viewportRef.current.scrollLeft = panState.current.scrollLeft - walkX;
            viewportRef.current.scrollTop = panState.current.scrollTop - walkY;
        };

        const handleCanvasMouseUpOrLeave = () => {
            setIsPanning(false);
            panState.current.isDown = false;
        };


    // Handle submitting posts to the backend
    const handleCreatePost = async (e) => {
        e.preventDefault();

        if (!postContent.trim()) return;

        try {
            // Grab the userId from localStorage
            const userId = localStorage.getItem('userId');
            
            // Checking what I am sending because I keep getting an error
            // (old code now)
            //console.log("Frontend is sending this payload:", { userId: userId, content: postContent });

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

                setPosts([...posts, newPost]);

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
            <container className="center-feed" style={{ width: `${feedWidth}px`}}>
            {/*<main className="center-feed" style={{ width: `${feedWidth}px`}}>*/}
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

                {/* Scrollable area */}
                <div className="feed-content posts-scroll-area">
                    {/* If there are no posts yet */ }
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
                <form className='chat-input-form' onSubmit={handleCreatePost} style={{ width: `${feedWidth-30}px`}}>
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
            {/*</container></main>*/}
            </container>

            {/* Resizing div */ }
            <div 
                className="resizer-handle"
                onMouseDown={() => setIsDragging(true)}
            >
            </div>

            {/* Widget Viewport (The Window) */}
            <section 
                className={`widget-viewport ${isPanning ? 'panning' : ''}`}
                ref={viewportRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUpOrLeave}
                onMouseLeave={handleCanvasMouseUpOrLeave}
            >   
            <div className="widget-hud-container">
                <span className="widget-hud-text">0 widgets active</span>
                <button className="widget-hud-btn">+ Add Widget</button>
            </div>
                {/* Widget Canvas (The 1500x1500 Board) */}
                <div className="widget-canvas-area">
                    <CarouselWidget userId={userId} />
                </div>
            </section>

        </div>
    );
}