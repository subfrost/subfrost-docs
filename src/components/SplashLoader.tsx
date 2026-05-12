import React, { useEffect, useRef } from 'react';
import styles from './SplashLoader.module.css';

const SplashLoader = ({ loading }) => {
  const barRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const readyRef = useRef(false);

  useEffect(() => {
    if (!loading) {
      readyRef.current = true;
    }
  }, [loading]);

  useEffect(() => {
    let progress = 0;
    let targetP = 0;

    const tick = () => {
      if (!readyRef.current) {
        targetP += 0.6;
        targetP = Math.min(targetP, 95);
      } else {
        targetP = 100;
      }

      progress += (targetP - progress) * 0.08;

      const clamped = Math.min(progress, 100);
      if (barRef.current) barRef.current.style.width = clamped + '%';
      if (pctRef.current) pctRef.current.textContent = Math.round(clamped) + '%';

      if (readyRef.current && progress > 99.5) {
        return;
      }
      frameRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div className={`${styles.splashScreen} ${loading ? '' : styles.hidden}`}>
      <div className={styles.loaderContainer}>
        <div className={styles.barTrack}>
          <div ref={barRef} className={styles.barFill} />
        </div>
        <div ref={pctRef} className={styles.percent}>0%</div>
      </div>
    </div>
  );
};

export default SplashLoader;
