import React, { useEffect } from 'react';
import './WelcomeSplash.css';

const WelcomeSplash = ({ onComplete }) => {
  useEffect(() => {
    const timer = window.setTimeout(() => onComplete?.(), 1300);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="welcome-splash" role="status" aria-label="Loading Milk Record">
      <div className="welcome-splash-glow" />
      <div className="welcome-splash-logo">
        <img src="/logo192.png" alt="Milk Record" />
      </div>
    </div>
  );
};

export default WelcomeSplash;
