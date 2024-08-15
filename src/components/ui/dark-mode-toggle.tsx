'use client';

import React from 'react';
import { cn } from '~/lib/utils';
import styles from '~/styles/darkModeToggle.module.css';
import { useDarkMode } from '~/app/_contexts/DarkModeContext';

const DarkModeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Hardcoded random positions for stars
  const starPositions = [
    { left: 12, top: 5 },   { left: 85, top: 15 },  { left: 45, top: 30 },
    { left: 70, top: 45 },  { left: 23, top: 60 },  { left: 95, top: 25 },
    { left: 5, top: 80 },   { left: 60, top: 10 },  { left: 35, top: 75 },
    { left: 80, top: 55 },  { left: 15, top: 40 },  { left: 50, top: 90 },
    { left: 90, top: 70 },  { left: 30, top: 20 },  { left: 75, top: 85 },
    { left: 10, top: 50 },  { left: 55, top: 35 },  { left: 40, top: 65 },
    { left: 65, top: 95 },  { left: 20, top: 0 },
  ];

  // Hardcoded positions for clouds
  const cloudPositions = [
    { top: '20%', left: '100%', opacity: 0.9, scale: 1, delay: 0 },
    { top: '40%', left: '120%', opacity: 0.7, scale: 0.8, delay: -6 },
    { top: '60%', left: '140%', opacity: 0.8, scale: 0.6, delay: -12 },
  ];

  const stars = starPositions.map((pos, index) => (
    <div
      key={`star-${index}`}
      className={styles.star}
      style={{
        left: `${pos.left}%`,
        top: `${pos.top}%`,
        animationDelay: `${(index * 0.5) % 5}s`,
      }}
    />
  ));

  const clouds = cloudPositions.map((pos, index) => (
    <div
      key={`cloud-${index}`}
      className={styles.cloud}
      style={{
        top: pos.top,
        left: pos.left,
        opacity: pos.opacity,
        transform: `scale(${pos.scale})`,
        animationDelay: `${pos.delay}s`,
      }}
    />
  ));

  return (
    <div
      className={cn(
        styles.toggleSwitch,
        !isDarkMode && styles.lightMode,
      )}
      onClick={toggleDarkMode}
    >
      <div className={styles.clouds}>{clouds}</div>
      <div className={styles.stars}>{stars}</div>
      <div className={styles.toggleButton}></div>
      <div className={styles.sun}></div>
      <div className={styles.moon}></div>
    </div>
  );
};

export default DarkModeToggle;