import React, { useState } from 'react';
import { cn } from '~/lib/utils';
import styles from '~/styles/notificationsToggle.module.css';

interface NotificationToggleProps {
  label: string;
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({ label }) => {
  const [isEnabled, setIsEnabled] = useState(false);

  const handleToggle = () => {
    setIsEnabled(!isEnabled);
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-black dark:text-white">{label}</span>
      <label className={styles.toggle}>
        <input 
          type="checkbox" 
          checked={isEnabled} 
          onChange={handleToggle}
          className="sr-only"
        />
        <span className={cn(styles.slider, isEnabled && styles.enabled)}>
          <span className={styles.button}>
            <span className={cn(styles.sphereGradient, styles.off)}></span>
            <span className={cn(styles.sphereGradient, styles.on)}></span>
          </span>
        </span>
      </label>
    </div>
  );
};

export default NotificationToggle;