import { React, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/StickyNav/NavBar';
import HeroSection from './components/HeroSection/HeroSection';
import Setup2FA from './components/2FA/Setup2FA';
import LoginPage from './pages/Login/LoginPage';
import SignupPage from './pages/Signup/SignupPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import UserSettings from './pages/UserSettings/UserSettings';
import './App.css'; 

function App() {
  // Check if the user has global settings to apply
  useEffect(() => {
    // Check localstorage for settings
    const savedTheme = localStorage.getItem("appTheme");

    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
    }
  }, []);
  
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
            {/* Home Page (when logged out, should land here) */}
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
            
            {/* If the user is already logged in, redirect them to the dashboard */}
            <Route path="/home" element={<Navigate to="/dashboard" replace />} />

            {/* Settings and related pages */}
            <Route path="/settings" element={<UserSettings />} />
            <Route path="/setup-2fa" element={<Setup2FA />} />
            {/* Authentication Page (Login/Signup) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route path="/dashboard" element={<DashboardPage />} />

          </Routes>

        </div>
      </div>
    </Router>
  );
}

export default App;