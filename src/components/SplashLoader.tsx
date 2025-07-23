{
  /*
    Chadson v69.1.0
    File: src/components/SplashLoader.tsx
    Purpose: Implements a splash screen component that displays while the main application is loading.
    Project: SUBFROST Documentation
    Date: 2025-07-16
    Task: Replace static logo with CanvasLogoLarge in splash loader.
  */
}
import React from 'react';
import styles from './SplashLoader.module.css';
import CanvasLogoLarge from './CanvasLogoLarge';

const SplashLoader = ({ loading }) => {
  return (
    <div className={`${styles.splashScreen} ${loading ? '' : styles.hidden}`}>
      <div className={styles.loaderContainer}>
        <div className={styles.logo}>
          <CanvasLogoLarge />
        </div>
      </div>
    </div>
  );
};

export default SplashLoader;