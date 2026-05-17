import React from 'react';
import HeroSection from './components/HeroSection/HeroSection';
import Sidebar from './components/Sidebar/Sidebar';
import './App.css';

function App() {
  return (
    <div className="main-app-container">
      
      {/* Left Column */}
      <Sidebar />

      {/* Right Column */}
      <main className="content-area">
        <HeroSection />
      </main>

    </div>
  );
}

export default App;