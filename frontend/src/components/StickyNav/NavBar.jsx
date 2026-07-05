{/*
    Documentation for NavBar.jsx:

    This file defines the NavBar component, which is a simple navigation bar for our Coffee Break application. It imports its own CSS file for styling and contains a single link to the Home section. The NavBar component is used in the App.jsx file to display the navigation bar at the top of the page.
    Source: https://www.w3schools.com/howto/howto_js_navbar_sticky.asp
    
    */}
import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

export default function NavBar() {
    // Check if the user is logged in
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    const handleLogout = () => {
        // Clear the pockets!
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        
        // Refresh the page to reset the UI
        window.location.href = '/login';
    };

    return (
        <nav className="navbar-banner">
            <Link to="/" className="navbar-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span className="brand-icon">☕</span>
                <span className="brand-text">Coffee Break</span>
            </Link>

            <div className="navbar-actions">
                {token ? (
                    /* IF LOGGED IN: Show User Menu */
                    <div className="user-menu">
                        <span className="welcome-text">Welcome, {username}</span>
                        
                        <div className="dropdown">
                            <button className="dropdown-button">Account ▾</button>
                            <div className="dropdown-content">
                                <Link to="/profile">Profile</Link>
                                <Link to="/settings">Settings</Link>
                                <Link to="/privacy">Privacy</Link>
                                <hr className="dropdown-divider" />
                                <button onClick={handleLogout} className="logout-btn">Log Out</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* IF LOGGED OUT: Show Standard Buttons */
                    <>
                        <Link to="/login" className="btn-text" style={{ textDecoration: 'none' }}>Sign In</Link>
                        <Link to="/signup" className="btn-primary" style={{ textDecoration: 'none' }}>Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
}