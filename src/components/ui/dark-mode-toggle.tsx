import React, { useState, useEffect } from 'react';
import { useTheme } from '~/app/_components/ThemeProvider';
import { cn } from '~/lib/utils';
import styles from '~/styles/darkModeToggle.module.css';

const DarkModeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [stars, setStars] = useState<JSX.Element[]>([]);
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    // Generate stars once and store them in state
    const generatedStars = Array.from({ length: 20 }).map((_, index) => (
      <div
        key={index}
        className={styles.star}
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 1}s`,
        }}
      />
    ));
    setStars(generatedStars);
  }, []);

  const handleToggle = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    const newTheme = isDarkMode ? 'light' : 'dark';
    
    // Delay the theme change slightly to allow for a smoother transition
    setTimeout(() => {
      setTheme(newTheme);
      setTimeout(() => setIsTransitioning(false), 500); // Match this with your CSS transition duration
    }, 50);
  };

  return (
    <div
      className={cn(
        styles.toggleSwitch,
        !isDarkMode && styles.lightMode,
        isTransitioning && styles.transitioning
      )}
      onClick={handleToggle}
    >
      <div className={styles.clouds}>
        <div className={styles.cloud}></div>
        <div className={styles.cloud}></div>
        <div className={styles.cloud}></div>
      </div>
      <div className={styles.stars}>
        {stars}
      </div>
      <div className={styles.toggleButton}></div>
      <div className={styles.sun}></div>
      <div className={styles.moon}></div>
    </div>
  );
};

export default DarkModeToggle;