import React from 'react';
// Import the new component from components
import HeroSection from './components/HeroSection/HeroSection';
import NavBar from './components/StickyNav/NavBar';

function App() {
  return (
    <div className="main-app-container">
      
      {/* This is where we will put the navbar next! */}
      <NavBar />
      <main>
        <HeroSection />
      </main>

    </div>
  );
}

export default App;