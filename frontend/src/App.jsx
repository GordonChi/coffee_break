import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/StickyNav/NavBar';
import HeroSection from './components/HeroSection/HeroSection';
import Setup2FA from './components/2FA/Setup2FA';
import AuthPage from './pages/AuthPage';
import './App.css'; 

function App() {
  return (
    <Router>
      <div className="app-root">
        {/* 
        Navigation Bar 
        Keep this outside of Routes so it appears on all pages
        */}
        <NavBar />

        <div className="main-content-wrapper">
          <Routes>
            {/* Home Page */}
            <Route path="/" element={
              <main className="hero-wrapper">
                <HeroSection />
              </main>
            } />

            {/* 
            All routes will be added here. Think of this as the "switchboard" that directs users to different pages based on the URL. 
            For example, when we create the AuthPage for login/signup, we will add a route like this:
            <Route path="/login" element={<AuthPage />} />
            And when we create more pages, we will have to add them here so users can navigate to them
            */}
            
            {/* 2FA Setup Page */}
            <Route path="/setup-2fa" element={<Setup2FA />} />
            {/* Authentication Page (Login/Signup) */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} /> {/* This is not yet implmented, but we will use the same AuthPage for both login and signup for now */}

          </Routes>

        </div>
      </div>
    </Router>
  );
}

export default App;