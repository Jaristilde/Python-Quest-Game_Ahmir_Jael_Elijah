'use client';

import { motion } from 'framer-motion';
import { Play, BookOpen } from 'lucide-react';
import Link from 'next/link';
import styles from './home.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Background blobs */}
      <div className={styles.blob1}></div>
      <div className={styles.blob2}></div>

      <div className={styles.content}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className={styles.badge}>
            For Kids Ages 9-12
          </span>
          <h1 className={styles.title}>
            Python <br />
            <span className="title-gradient">Adventure Quest</span>
          </h1>
          <p className={styles.description}>
            Join Jael, Ahmir, and Elijah on an epic coding journey! Help Robo-1, solve puzzles, and learn Python along the way.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={styles.actions}
        >
          <Link href="/level1" className="btn btn-primary" style={{ fontSize: '1.25rem', padding: '1rem 2rem' }}>
            <Play size={24} fill="currentColor" />
            Start Quest: Level 1
          </Link>

          <Link href="/teacher" className="btn btn-secondary" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
            <BookOpen size={24} />
            Teacher Guide
          </Link>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={styles.grid}
        >
          <div className={`glass-panel ${styles.featureCard}`} style={{ padding: '1.5rem' }}>
            <div className={styles.featureIcon} style={{ background: 'var(--primary)' }}>
              <span style={{ fontSize: '1.5rem' }}>🤖</span>
            </div>
            <h3 className={styles.featureTitle}>Story Driven</h3>
            <p className={styles.featureText}>Help robots and defeat monsters using real code!</p>
          </div>
          <div className={`glass-panel ${styles.featureCard}`} style={{ padding: '1.5rem' }}>
            <div className={styles.featureIcon} style={{ background: 'var(--secondary)' }}>
              <span style={{ fontSize: '1.5rem' }}>🚀</span>
            </div>
            <h3 className={styles.featureTitle}>Real Python</h3>
            <p className={styles.featureText}>Learn actual syntax used by pros, simplified for you.</p>
          </div>
          <div className={`glass-panel ${styles.featureCard}`} style={{ padding: '1.5rem' }}>
            <div className={styles.featureIcon} style={{ background: 'var(--accent)' }}>
              <span style={{ fontSize: '1.5rem' }}>🏆</span>
            </div>
            <h3 className={styles.featureTitle}>Earn Badges</h3>
            <p className={styles.featureText}>Collect rewards as you master new skills.</p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
