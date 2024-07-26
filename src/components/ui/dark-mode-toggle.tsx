import React from 'react';
import { useTheme } from '~/_components/ThemeProvider';
import styles from '~/styles/darkModeToggle.module.css';

const DarkModeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  const handleToggle = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <div
      className={`relative w-16 h-8 rounded-full cursor-pointer transition-colors duration-300 ease-in-out overflow-hidden ${
        isDarkMode ? 'bg-gray-800' : 'bg-blue-400'
      }`}
      onClick={handleToggle}
    >
      <div className="absolute inset-1">
        <div className={`relative w-full h-full ${isDarkMode ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 ease-in-out`}>
          {/* Stars */}
          {Array.from({ length: 30 }).map((_, index) => (
            <div
              key={index}
              className={`absolute rounded-full ${styles.star}`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 1.5 + 0.5}px`,
                height: `${Math.random() * 1.5 + 0.5}px`,
                animationDelay: `${Math.random() * -20}s`,
              }}
            />
          ))}
        </div>
        <div className={`relative w-full h-full ${isDarkMode ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ease-in-out`}>
          {/* Clouds */}
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className={styles.cloud}
              style={{
                '--x': `${50 + (index - 2) * 30}%`, // Center clouds horizontally
                '--y': `${20 + Math.random() * 60}%`, // Distribute clouds vertically
                '--size': `${Math.random() * 0.4 + 0.6}`,
                '--duration': `${Math.random() * 10 + 20}s`,
                '--delay': `${index * -5}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
      {/* Toggle button */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full transition-transform duration-300 ease-in-out flex items-center justify-center ${
          isDarkMode ? 'translate-x-8' : 'translate-x-0'
        }`}
      >
        {/* Sun/Moon */}
        <div className={`w-7 h-7 rounded-full ${isDarkMode ? styles.moon : styles.sun}`}>
          {!isDarkMode && (
            <>
              <div className={styles.sunRay} style={{ transform: 'rotate(0deg)' }}></div>
              <div className={styles.sunRay} style={{ transform: 'rotate(45deg)' }}></div>
              <div className={styles.sunRay} style={{ transform: 'rotate(90deg)' }}></div>
              <div className={styles.sunRay} style={{ transform: 'rotate(135deg)' }}></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DarkModeToggle;