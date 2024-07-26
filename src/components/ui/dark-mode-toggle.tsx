import React from 'react';
import { useTheme } from '~/_components/ThemeProvider';
import { cn } from '~/lib/utils';
import styles from '~/styles/darkModeToggle.module.css';

const DarkModeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  const handleToggle = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <div
      className={cn(styles.toggleSwitch, isDarkMode && styles.darkMode)}
      onClick={handleToggle}
    >
      <div className={styles.clouds}>
        <div className={styles.cloud}></div>
        <div className={styles.cloud}></div>
        <div className={styles.cloud}></div>
      </div>
      <div className={styles.stars}>
        {Array.from({ length: 20 }).map((_, index) => (
          <div
            key={index}
            className={styles.star}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 1}s`,
            }}
          />
        ))}
      </div>
      <div className={styles.toggleButton}></div>
      <div className={styles.sun}></div>
      <div className={styles.moon}></div>
    </div>
  );
};

export default DarkModeToggle;