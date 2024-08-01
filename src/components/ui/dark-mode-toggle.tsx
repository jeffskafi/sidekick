'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '~/lib/utils';
import styles from '~/styles/darkModeToggle.module.css';
import { useDarkMode } from '~/app/_contexts/DarkModeContext';

const DarkModeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [stars, setStars] = useState<JSX.Element[]>([]);

  useEffect(() => {
    // Generate stars once and store them in state
    const generatedStars = Array.from({ length: 20 }).map((_, index) => (
      <div
        key={index}
        className={styles.star}
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
        }}
      />
    ));
    setStars(generatedStars);
  }, []);

  return (
    <div
      className={cn(
        styles.toggleSwitch,
        !isDarkMode && styles.lightMode,
      )}
      onClick={toggleDarkMode}
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