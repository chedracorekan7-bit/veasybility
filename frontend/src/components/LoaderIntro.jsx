import React, { useState, useEffect } from 'react';
import './LoaderIntro.css';

const LoaderIntro = ({ onComplete, onFadeOutStart }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('');

  useEffect(() => {
    // Lock scrolling
    document.body.style.overflow = 'hidden';

    const startTime = performance.now();
    let animationFrameId;

    const animateProgress = (currentTime) => {
      const elapsed = currentTime - startTime;
      let currentProgress = 0;

      if (elapsed <= 600) {
        // 0 to 600ms: Progress goes to 30% while typing EASY
        currentProgress = (elapsed / 600) * 30;
      } else if (elapsed <= 1600) {
        // 600ms to 1600ms: 1 second pause
        currentProgress = 30;
      } else if (elapsed <= 2700) {
        // 1600ms to 2700ms: Progress goes from 30% to 100%
        const remainingElapsed = elapsed - 1600;
        currentProgress = 30 + ((remainingElapsed / 1100) * 70);
      } else {
        currentProgress = 100;
      }

      setProgress(Math.floor(currentProgress));

      if (elapsed < 2700) {
        animationFrameId = requestAnimationFrame(animateProgress);
      }
    };
    animationFrameId = requestAnimationFrame(animateProgress);

    // Text typing sequence logic
    const timeouts = [];
    
    // Type EASY
    timeouts.push(setTimeout(() => setText('E'), 150));
    timeouts.push(setTimeout(() => setText('EA'), 300));
    timeouts.push(setTimeout(() => setText('EAS'), 450));
    timeouts.push(setTimeout(() => setText('EASY'), 600));

    // Pause for 1 second (600ms to 1600ms)

    // Erase EASY
    timeouts.push(setTimeout(() => setText('EAS'), 1600));
    timeouts.push(setTimeout(() => setText('EA'), 1675));
    timeouts.push(setTimeout(() => setText('E'), 1750));
    timeouts.push(setTimeout(() => setText(''), 1825));

    // Type VEASYBILITY
    const finalWord = "VEASYBILITY";
    for (let i = 1; i <= finalWord.length; i++) {
      timeouts.push(setTimeout(() => {
        setText(finalWord.slice(0, i));
      }, 1825 + (i * 79.5))); 
    }

    // 2700ms -> 100%, text is fully VEASYBILITY. Trigger fade out.
    const tFade = setTimeout(() => {
      setIsExiting(true);
      if (onFadeOutStart) onFadeOutStart();
    }, 2700);
    
    // 3100ms -> Unmount.
    const tEnd = setTimeout(() => {
      document.body.style.overflow = '';
      onComplete();
    }, 3100);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(tFade);
      clearTimeout(tEnd);
      timeouts.forEach(clearTimeout);
      document.body.style.overflow = '';
    };
  }, [onComplete, onFadeOutStart]);

  const renderText = (str) => {
    if (str.startsWith('V')) {
      return (
        <>
          <span className="text-white">{str.charAt(0)}</span>
          <span className="text-easy">{str.substring(1, 5)}</span>
          <span className="text-white">{str.substring(5)}</span>
        </>
      );
    }
    return <span className="text-easy">{str}</span>;
  };

  return (
    <div 
      className={`loader-intro-container ${isExiting ? 'fade-out' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000000',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
      }}
    >
      {/* Text Container */}
      <div className="text-container">
        <div className="typewriter-dynamic">
          {renderText(text)}
          <span className="cursor-blink"></span>
        </div>
      </div>

      {/* Full Width Progress Bar & Percentage */}
      <div className="progress-full-container">
        <div className="progress-percentage">
          {progress}%
        </div>
        <div className="progress-full-bar" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
};

export default LoaderIntro;
