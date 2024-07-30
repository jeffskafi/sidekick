'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { cn } from '~/lib/utils';
import styles from '~/styles/darkModeToggle.module.css';

const DarkModeToggle: React.FC = () => {
  const { user } = useUser();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (user) {
      const darkModePreference = user.unsafeMetadata.darkMode as boolean | undefined;
      setIsDarkMode(darkModePreference ?? false);
    }
  }, [user]);

  const handleToggle = async () => {
    if (isTransitioning || !user) return;
    
    setIsTransitioning(true);
    const newDarkMode = !isDarkMode;
    
    setIsDarkMode(newDarkMode);

    try {
      await user.update({
        unsafeMetadata: {
          darkMode: newDarkMode
        }
      });
    } catch (error) {
      console.error('Failed to update dark mode preference:', error);
      setIsDarkMode(!newDarkMode);
    }

    setTimeout(() => setIsTransitioning(false), 500);
  };

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
          animationDelay: `${Math.random() * 1}s`,
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