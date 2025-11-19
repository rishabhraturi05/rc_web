'use client';
import { useEffect, useState } from 'react';

const PageLoader = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Hide loader once the current page finishes loading
  useEffect(() => {
    const finishLoading = () => {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    if (document.readyState === 'complete') {
      finishLoading();
    } else {
      window.addEventListener('load', finishLoading);
    }

    return () => window.removeEventListener('load', finishLoading);
  }, []);

  // Show loader again whenever the user refreshes/navigates away
  useEffect(() => {
    const handleBeforeUnload = () => {
      setIsLoading(true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Animated Spinner */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20">
          <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 border-4 border-transparent border-r-red-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        
        {/* Loading Text */}
        <div className="text-center">
          <p className="text-white text-sm sm:text-base font-semibold batman-font tracking-wide">
            Loading...
          </p>
          <p className="text-gray-400 text-xs sm:text-sm destruct-font mt-1">
            Robotics Club NITW
          </p>
        </div>

        {/* Animated Dots */}
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;

