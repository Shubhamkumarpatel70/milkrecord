import React, { useState, useEffect } from 'react';
import Logo from './CustomLogo';

const WelcomeSplash = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    // Animation sequence
    const animationTimeline = [
      { phase: 0, delay: 0 },      // Initial state
      { phase: 1, delay: 500 },    // Logo appears
      { phase: 2, delay: 1000 },   // Text appears
      { phase: 3, delay: 2000 },   // Text fades
      { phase: 4, delay: 3500 },   // Logo fades
      { phase: 5, delay: 4000 }    // Complete
    ];

    const timers = animationTimeline.map(({ phase, delay }) => 
      setTimeout(() => {
        setAnimationPhase(phase);
        if (phase === 5) {
          setIsVisible(false);
          setTimeout(onComplete, 500); // Wait for fade out animation
        }
      }, delay)
    );

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-100 dark:from-gray-900 dark:to-gray-800 transition-opacity duration-500">
      <div className="text-center">
        {/* Logo with animation */}
        <div className={`transition-all duration-1000 ${
          animationPhase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}>
          <Logo size="large" className="justify-center mb-8" />
        </div>
        
        {/* Welcome text with animation */}
        <div className={`transition-all duration-1000 ${
          animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        } ${animationPhase >= 3 ? 'opacity-0' : ''}`}>
          <h1 className="text-4xl md:text-6xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            Welcome to
          </h1>
          <h2 className="text-3xl md:text-5xl font-bold text-green-600 dark:text-green-400 mb-6">
            Milk Record
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Manage your milk production records with ease
          </p>
        </div>

        {/* Loading dots */}
        <div className={`mt-8 transition-opacity duration-500 ${
          animationPhase >= 2 && animationPhase < 3 ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSplash; 