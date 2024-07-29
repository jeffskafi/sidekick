import React, { useState } from 'react';
import { cn } from '~/lib/utils';
import styles from '~/styles/emailNotificationsToggle.module.css';

const EmailNotificationsToggle: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  const handleToggle = () => {
    setIsEnabled(!isEnabled);
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-black dark:text-white">Email Notifications</span>
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

export default EmailNotificationsToggle;