'use client';

import { motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import Link from 'next/link';
import { LevelConfig } from '../lib/levelConfig';
import styles from './Sidebar.module.css';

interface LevelNavItemProps {
  level: LevelConfig;
  completedCount: number;
  isUnlocked: boolean;
  isCurrent: boolean;
  onClick?: () => void;
}

export default function LevelNavItem({
  level,
  completedCount,
  isUnlocked,
  isCurrent,
  onClick
}: LevelNavItemProps) {
  const isComplete = completedCount >= level.lessons;
  const progressText = `${completedCount}/${level.lessons}`;

  if (!isUnlocked) {
    return (
      <div
        className={`${styles.levelItem} ${styles.locked}`}
        title="Complete previous level first"
      >
        <div className={styles.levelNumber}>
          <Lock size={14} />
        </div>
        <div className={styles.levelInfo}>
          <span className={styles.levelName}>{level.name}</span>
          <span className={styles.levelProgress}>{progressText}</span>
        </div>
        <Lock size={16} className={styles.lockIcon} />
      </div>
    );
  }

  return (
    <Link
      href={level.route}
      onClick={onClick}
      className={`${styles.levelItem} ${isCurrent ? styles.current : ''} ${isComplete ? styles.complete : ''}`}
    >
      <div className={styles.levelNumber}>
        {isComplete ? (
          <Check size={14} className={styles.checkIcon} />
        ) : (
          <span>{String(level.id).padStart(2, '0')}</span>
        )}
      </div>
      <div className={styles.levelInfo}>
        <span className={styles.levelName}>{level.name}</span>
        <span className={styles.levelProgress}>{progressText}</span>
      </div>
      {isComplete && <Check size={16} className={styles.completeIcon} />}
    </Link>
  );
}
