import React from 'react';
import './HeroSection.css'; // Importing its own stylesheet, just like in RateMyCourse!

function HeroSection() {
  return (
    <section className="hero-container">
      {/* 1. The small intro badge (if we want it) */}
      <div className="hero-badge">
        <span>☕</span> Coffee Break - Your daily dose of productivity
      </div>

      {/* 2. Main Large Headline */}
      <h1 className="hero-title">
        Take a Break, Boost Your Productivity
      </h1>

      {/* 3. The description subtitle */}
      <p className="hero-subtitle">
        Drinking coffee is great, but taking breaks is even better. Coffee Break helps you schedule and enjoy your breaks for maximum focus and creativity.
      </p>

      {/* 4. Action Buttons */}
      <div className="hero-buttons">
        <button className="btn-primary">Get Started Free*</button>
        <button className="btn-secondary">Watch Demo</button>
      </div>

      {/* The  */}
      <p className="hero-proof">Beep boop wheat scadoot • Push the buttons</p>
    </section>
  );
}

export default HeroSection;