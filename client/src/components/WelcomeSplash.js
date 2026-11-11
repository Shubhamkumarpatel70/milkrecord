import React, { useState, useEffect } from 'react';
import Logo from './CustomLogo';
import './WelcomeSplash.css';

const WelcomeSplash = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [particles, setParticles] = useState([]);

  // Generate floating particles
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 20; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 2,
          speed: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2
        });
      }
      setParticles(newParticles);
    };
    generateParticles();
  }, []);

  useEffect(() => {
    // Animation sequence with improved timing
    const animationTimeline = [
      { phase: 0, delay: 0 },      // Initial state
      { phase: 1, delay: 300 },    // Logo appears
      { phase: 2, delay: 800 },    // Text appears with stagger
      { phase: 3, delay: 2500 },   // Text fades
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

  const handleSkip = () => {
    // Add haptic feedback if supported
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Add subtle sound feedback (if audio context is available)
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Silently fail if audio is not supported
      console.debug('Audio feedback not supported');
    }

    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="welcome-splash">
      {/* Floating particles */}
      <div className="particles-container">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              animationDuration: `${particle.speed * 3}s`
            }}
          />
        ))}
      </div>

      <div className="welcome-splash-content">
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="skip-button"
          aria-label="Skip splash screen"
        >
          Skip
        </button>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary-200/20 rounded-full animate-float"></div>
          <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-accent-200/20 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-success-200/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Logo with enhanced animation */}
        <div className={`relative z-10 transition-all duration-1000 ${animationPhase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}>
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-full blur-xl animate-pulse-soft"></div>
            <Logo size="large" className="justify-center relative z-10" />
          </div>
        </div>

        {/* Welcome text with staggered animations */}
        <div className="relative z-10">
          <h1 className={`text-4xl md:text-6xl font-bold gradient-text mb-4 transition-all duration-1000 ${
            animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          } ${animationPhase >= 3 ? 'opacity-0' : ''}`}>
            Welcome to
          </h1>
          <h2 className={`text-3xl md:text-5xl font-bold bg-gradient-to-r from-accent-600 to-success-600 bg-clip-text text-transparent mb-6 transition-all duration-1000 ${
            animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          } ${animationPhase >= 3 ? 'opacity-0' : ''}`}
          style={{ transitionDelay: '0.2s' }}>
            Milk Record
          </h2>
          <p className={`text-lg md:text-xl text-secondary-600 dark:text-secondary-400 max-w-md mx-auto leading-relaxed transition-all duration-1000 ${
            animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          } ${animationPhase >= 3 ? 'opacity-0' : ''}`}
          style={{ transitionDelay: '0.4s' }}>
            Manage your milk production records with ease and precision
          </p>
        </div>

        {/* Enhanced loading animation with progress ring */}
        <div className={`mt-8 transition-opacity duration-500 relative z-10 ${animationPhase >= 2 && animationPhase < 3 ? 'opacity-100' : 'opacity-0'
          }`}>
          <div className="loading-container">
            <div className="loading-ring">
              <div className="loading-ring-progress" style={{
                background: `conic-gradient(from 0deg, #0ea5e9 ${(animationPhase / 5) * 360}deg, transparent 0deg)`
              }}></div>
              <div className="loading-center">
                <div className="loading-pulse"></div>
              </div>
            </div>
          </div>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-4 animate-pulse">
            Loading your dashboard...
          </p>
        </div>

        {/* Enhanced progress bar */}
        <div className={`mt-8 w-64 mx-auto transition-opacity duration-500 relative z-10 ${animationPhase >= 2 && animationPhase < 3 ? 'opacity-100' : 'opacity-0'
          }`}>
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(animationPhase / 5) * 100}%` }}
              ></div>
              <div className="progress-glow"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSplash; 