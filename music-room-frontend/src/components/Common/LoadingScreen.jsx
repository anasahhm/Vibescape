import { useState, useEffect } from 'react';

const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing...');

  useEffect(() => {
    const loadingSteps = [
      { progress: 20, text: 'Connecting to server...', delay: 300 },
      { progress: 40, text: 'Loading your profile...', delay: 500 },
      { progress: 60, text: 'Setting up lounges...', delay: 400 },
      { progress: 80, text: 'Preparing music player...', delay: 400 },
      { progress: 100, text: 'Almost ready...', delay: 300 }
    ];

    let currentStep = 0;

    const runLoadingSequence = () => {
      if (currentStep < loadingSteps.length) {
        const step = loadingSteps[currentStep];
        
        setTimeout(() => {
          setProgress(step.progress);
          setLoadingText(step.text);
          currentStep++;
          runLoadingSequence();
        }, step.delay);
      } else {
        // Complete loading
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    };

    runLoadingSequence();
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-spotify-black via-spotify-darkGray to-spotify-gray flex items-center justify-center z-50">
      <div className="text-center max-w-md w-full px-8">
        {/* Animated Logo */}
        <div className="mb-8 animate-bounce">
          <div className="text-8xl mb-4">🎵</div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Music Room
          </h1>
          <p className="text-spotify-lightGray text-lg">
            Where music brings us together
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-3 bg-spotify-gray rounded-full overflow-hidden mb-4">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-spotify-green to-green-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
          </div>
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer"></div>
        </div>

        {/* Progress Text */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-spotify-lightGray text-sm">{loadingText}</span>
          <span className="text-spotify-green font-bold text-sm">{progress}%</span>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center gap-2">
          <div className="w-3 h-3 bg-spotify-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-spotify-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-spotify-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;