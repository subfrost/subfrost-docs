{
  /*
    Chadson v69.69
    File: src/components/SplashLoader.tsx
    Purpose: Implements a splash screen component that displays while the main application is loading.
    Project: SUBFROST Documentation
    Date: 2025-07-25
    Task: Replace static logo with FaSnowflake in splash loader.
  */
}
import React from 'react';
import styles from './SplashLoader.module.css';
import { FaSnowflake } from 'react-icons/fa';

const SplashLoader = ({ loading }) => {
  return (
    <div className={`${styles.splashScreen} ${loading ? '' : styles.hidden}`}>
      <div className={styles.loaderContainer}>
        <div className={styles.logo}>
          <FaSnowflake style={{ fontSize: '56px' }} />
        </div>
      </div>
    </div>
  );
};

export default SplashLoader;