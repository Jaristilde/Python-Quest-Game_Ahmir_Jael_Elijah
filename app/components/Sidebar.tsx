'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Menu, Trophy, Zap } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  LEVELS,
  isLevelUnlocked,
  getLevelProgress,
  getOverallProgress,
  getUserRank,
  TOTAL_LESSONS
} from '../lib/levelConfig';
import LevelNavItem from './LevelNavItem';
import styles from './Sidebar.module.css';

const SIDEBAR_STORAGE_KEY = 'python_quest_sidebar_open';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  // Load saved state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (saved !== null) {
        setIsOpen(saved === 'true');
      }

      // Check if mobile
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // Save state to localStorage
  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(newState));
    }
  };

  const closeSidebar = () => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, 'false');
    }
  };

  // Get current level from pathname
  const getCurrentLevelId = (): number => {
    const match = pathname.match(/\/level(\d+)/);
    return match ? parseInt(match[1]) : 1;
  };

  const currentLevelId = getCurrentLevelId();
  const completedLevels = user?.progress.completedLevels || [];
  const overallProgress = getOverallProgress(completedLevels);
  const userRank = getUserRank(completedLevels);
  const totalCompleted = completedLevels.length;

  // Sidebar animation variants
  const sidebarVariants = {
    open: {
      x: 0,
      transition: { type: 'spring' as const, stiffness: 300, damping: 30 }
    },
    closed: {
      x: '-100%',
      transition: { type: 'spring' as const, stiffness: 300, damping: 30 }
    }
  };

  const backdropVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 }
  };

  return (
    <>
      {/* Toggle Button - Always visible */}
      <button
        onClick={toggleSidebar}
        className={styles.toggleButton}
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            {isMobile && (
              <motion.div
                className={styles.backdrop}
                initial="closed"
                animate="open"
                exit="closed"
                variants={backdropVariants}
                onClick={closeSidebar}
              />
            )}

            {/* Sidebar */}
            <motion.aside
              className={styles.sidebar}
              initial="closed"
              animate="open"
              exit="closed"
              variants={sidebarVariants}
            >
              {/* Header */}
              <div className={styles.header}>
                <div className={styles.logo}>
                  <span className={styles.logoEmoji}>🐍</span>
                  <span className={styles.logoText}>PYTHON QUEST</span>
                </div>
                <button onClick={closeSidebar} className={styles.closeButton}>
                  <X size={20} />
                </button>
              </div>

              {/* User Progress */}
              {user && (
                <div className={styles.userProgress}>
                  <div className={styles.rankBadge}>
                    <Trophy size={16} />
                    <span>{userRank}</span>
                  </div>
                  <div className={styles.progressBar}>
                    <motion.div
                      className={styles.progressFill}
                      initial={{ width: 0 }}
                      animate={{ width: `${overallProgress}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                  <div className={styles.progressText}>
                    <span>{totalCompleted}/{TOTAL_LESSONS} lessons</span>
                    <span>{overallProgress}% Complete</span>
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className={styles.divider} />

              {/* Levels Section */}
              <div className={styles.levelsSection}>
                <h3 className={styles.sectionTitle}>LEVELS</h3>
                <div className={styles.levelsList}>
                  {LEVELS.map((level) => {
                    const completedCount = getLevelProgress(level.id, completedLevels);
                    const unlocked = isLevelUnlocked(level.id, completedLevels);
                    const isCurrent = level.id === currentLevelId;

                    return (
                      <LevelNavItem
                        key={level.id}
                        level={level}
                        completedCount={completedCount}
                        isUnlocked={unlocked}
                        isCurrent={isCurrent}
                        onClick={isMobile ? closeSidebar : undefined}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              {user && (
                <div className={styles.footer}>
                  <div className={styles.xpBadge}>
                    <Zap size={14} fill="currentColor" />
                    <span>{user.progress.xp} XP</span>
                  </div>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for desktop when sidebar is open */}
      {isOpen && !isMobile && <div className={styles.sidebarSpacer} />}
    </>
  );
}
