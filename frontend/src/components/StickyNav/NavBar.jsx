{/*
    Documentation for NavBar.jsx:

    This file defines the NavBar component, which is a simple navigation bar for our Coffee Break application. It imports its own CSS file for styling and contains a single link to the Home section. The NavBar component is used in the App.jsx file to display the navigation bar at the top of the page.
    Source: https://www.w3schools.com/howto/howto_js_navbar_sticky.asp
    
    */}
import React from "react";
import "./NavBar.css"; // Importing its own stylesheet

function NavBar() {
    return (
        <nav className="navbar-banner">
            {/* LEFT SIDE BOUND */}
            <div className="navbar-brand">
                <span className="brand-icon">☕</span>
                <span className="brand-name">Coffee Break</span>
            </div>

            {/* RIGHT SIDE BOUND */}
            <div className="navbar-actions">
                <button className="btn-text">Sign In</button>
                <button className="btn-primary">Sign Up</button> 
            </div>
        </nav>
    );
}

export default NavBar;