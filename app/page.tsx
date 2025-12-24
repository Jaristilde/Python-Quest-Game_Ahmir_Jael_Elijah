'use client';

import { motion } from 'framer-motion';
import { Play, BookOpen, LogIn, UserPlus, LogOut, User, Zap, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useAuth, getAvatarEmoji } from './context/AuthContext';
import { getLeaderboard } from './lib/auth';
import { useState, useEffect } from 'react';
import styles from './home.module.css';

export default function Home() {
  const { user, isLoading, logout } = useAuth();
  const [leaderboard, setLeaderboard] = useState<{ username: string; avatar: string; xp: number }[]>([]);

  useEffect(() => {
    setLeaderboard(getLeaderboard());
  }, [user]);

  return (
    <main className={styles.main}>
      {/* Background blobs */}
      <div className={styles.blob1}></div>
      <div className={styles.blob2}></div>

      {/* User Header Bar */}
      {!isLoading && (
        <div className={styles.userBar}>
          {user ? (
            <div className={styles.userInfo}>
              <Link href="/profile" className={styles.userProfile}>
                <span className={styles.userAvatar}>{getAvatarEmoji(user.avatar)}</span>
                <span className={styles.userName}>{user.username}</span>
              </Link>
              <div className={styles.userStats}>
                <span className={styles.xpBadge}>
                  <Zap size={14} fill="currentColor" /> {user.progress.xp} XP
                </span>
                <span className={styles.levelBadge}>
                  Level {user.progress.currentLevel}
                </span>
              </div>
              <button onClick={logout} className={styles.logoutBtn}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <div className={styles.authButtons}>
              <Link href="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                <LogIn size={16} /> Log In
              </Link>
              <Link href="/signup" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                <UserPlus size={16} /> Sign Up
              </Link>
            </div>
          )}
        </div>
      )}

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
            {user
              ? `Welcome back, ${user.username}! Ready to continue your coding adventure?`
              : 'Join Jael, Ahmir, and Elijah on an epic coding journey! Help Robo-1, solve puzzles, and learn Python along the way.'
            }
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={styles.actions}
        >
          {user ? (
            <>
              <Link href={`/level${user.progress.currentLevel}`} className="btn btn-primary" style={{ fontSize: '1.25rem', padding: '1rem 2rem' }}>
                <Play size={24} fill="currentColor" />
                {user.progress.currentLevel === 1 ? 'Start Level 1' : `Continue Level ${user.progress.currentLevel}`}
              </Link>
              <Link href="/profile" className="btn btn-secondary" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
                <User size={24} />
                My Profile
              </Link>
            </>
          ) : (
            <>
              <Link href="/signup" className="btn btn-primary" style={{ fontSize: '1.25rem', padding: '1rem 2rem' }}>
                <UserPlus size={24} />
                Create Account
              </Link>
              <Link href="/login" className="btn btn-secondary" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
                <LogIn size={24} />
                I Have an Account
              </Link>
            </>
          )}

          <Link href="/teacher" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '0.875rem 1.5rem' }}>
            <BookOpen size={20} />
            Teacher Guide
          </Link>
        </motion.div>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={styles.leaderboard}
          >
            <h3 className={styles.leaderboardTitle}>
              <Trophy size={20} className="text-amber-400" /> Top Coders
            </h3>
            <div className={styles.leaderboardList}>
              {leaderboard.map((entry, idx) => (
                <div key={entry.username} className={styles.leaderboardItem}>
                  <span className={styles.rank}>#{idx + 1}</span>
                  <span className={styles.leaderAvatar}>{getAvatarEmoji(entry.avatar)}</span>
                  <span className={styles.leaderName}>{entry.username}</span>
                  <span className={styles.leaderXp}>{entry.xp} XP</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

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
