{/*
    Documentation for NavBar.jsx:

    This file defines the NavBar component, which is a simple navigation bar for our Coffee Break application. It imports its own CSS file for styling and contains a single link to the Home section. The NavBar component is used in the App.jsx file to display the navigation bar at the top of the page.
    Source: https://www.w3schools.com/howto/howto_js_navbar_sticky.asp
    
    */}
import { Link } from 'react-router-dom'; // Importing Link for navigation
import "./NavBar.css"; // Importing its own stylesheet

export default function NavBar() {
    return (
        <nav className="navbar-banner">
            {/* Links replaces the onClick */}
            <Link to="/" className="navbar-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span className="brand-icon">☕</span>
                <span className="brand-text">Coffee Break</span>
            </Link>

            <div className="navbar-actions">
                {/* We will point these to the real auth pages later */}
                <Link to="/login" className="btn-text" style={{ textDecoration: 'none' }}>Sign In</Link>
                <Link to="/signup" className="btn-primary" style={{ textDecoration: 'none' }}>Sign Up</Link>
            </div>
        </nav>
    );
}