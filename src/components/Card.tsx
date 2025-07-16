import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Card.module.css';

interface CardProps {
  title: string;
  icon: string;
  to: string;
  children: React.ReactNode;
}

export function Card({ title, icon, to, children }: CardProps) {
  return (
    <Link to={to} className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardIcon}>{icon}</span>
        <h3 className={styles.cardTitle}>{title}</h3>
      </div>
      <p className={styles.cardBody}>{children}</p>
    </Link>
  );
}

interface CardGridProps {
    children: React.ReactNode;
}

export function CardGrid({ children }: CardGridProps) {
  return <div className={styles.cardGrid}>{children}</div>;
}