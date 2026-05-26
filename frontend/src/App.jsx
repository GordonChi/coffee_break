import React from 'react';
import NavBar from './components/StickyNav/NavBar'; 
import HeroSection from './components/HeroSection/HeroSection';

//import Setup2FA from './components/2FA/Setup2FA';  // Taking this out for now to clean up the screen, but we'll add it back in later when we implement the 2FA flow
import './App.css';

function App() {
  return (
    <div className="app-root">
      
      {/* 1. The Full-Width Top Banner */}
      <NavBar />
      
      {/* 2. The Main Content Area (Below the banner) */}
      <div className="main-content-wrapper">

        {/* Center Canvas */}
        <main className="hero-wrapper">
          <HeroSection />
        </main>
        
      </div>

    </div>
  );
}

export default App;