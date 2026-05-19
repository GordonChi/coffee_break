import React from "react";
import "./SideBar.css"; // Importing its own stylesheet

function SideBar() {
    return (
        <div className="side-bar">
            {/* Sidebar content goes here */}
            <a href="#Profile" className="side-link">Profile</a>
        </div>
    );
}

export default SideBar;