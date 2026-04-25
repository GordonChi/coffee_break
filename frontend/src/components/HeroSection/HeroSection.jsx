import React from 'react';
import './HeroSection.css'; // Importing its own stylesheet, just like in RateMyCourse!

function HeroSection() {
  return (
    <section className="hero-container">
      {/* 1. The small intro badge (if we want it) */}
      <div className="hero-badge">
        <span>☕</span> Introducing the future of task management
      </div>

      {/* 2. Main Large Headline */}
      <h1 className="hero-title">
        Build amazing things faster
      </h1>

      {/* 3. The description subtitle */}
      <p className="hero-subtitle">
        Transform your workflow with our intuitive platform. Streamline your processes, organize your day, and achieve more in less time.
      </p>

      {/* 4. Action Buttons */}
      <div className="hero-buttons">
        <button className="btn-primary">Get Started Free</button>
        <button className="btn-secondary">Watch Demo</button>
      </div>

      {/* The  */}
      <p className="hero-proof">Beep boop wheat scadoot • Push the buttons</p>
    </section>
  );
}

export default HeroSection;