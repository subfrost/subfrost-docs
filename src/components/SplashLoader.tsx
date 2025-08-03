{
  /*
    Chadson v69.69
    File: src/components/SplashLoader.tsx
    Purpose: Implements a splash screen component that displays while the main application is loading.
    Project: SUBFROST Documentation
    Date: 2025-07-25
    Task: Replace FaSnowflake with custom SnowflakeIcon component.
  */
}
import React from 'react';
import styles from './SplashLoader.module.css';
import SnowflakeIcon from './SnowflakeIcon';

const SplashLoader = ({ loading }) => {
  return (
    <div className={`${styles.splashScreen} ${loading ? '' : styles.hidden}`}>
      <div className={styles.loaderContainer}>
        <div className={styles.logo}>
          <SnowflakeIcon />
        </div>
      </div>
    </div>
  );
};

export default SplashLoader;