'use client';

import { motion } from 'framer-motion';
import { Play, BookOpen, LogIn, UserPlus, LogOut, User, Zap, Trophy, Lock, Check, ChevronRight } from 'lucide-react';
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
              {/* Calculate which game level (1, 2, 3, or 4) user should be on */}
              {(() => {
                const level1Complete = user.progress.completedLevels.filter(l => l.level >= 1 && l.level <= 15).length >= 15;
                const level2Complete = user.progress.completedLevels.filter(l => l.level >= 16 && l.level <= 33).length >= 18;
                const level3Complete = user.progress.completedLevels.filter(l => l.level >= 34 && l.level <= 49).length >= 16;
                const level4Complete = user.progress.completedLevels.filter(l => l.level >= 50 && l.level <= 62).length >= 13;
                const isNewUser = user.progress.completedLevels.length === 0;

                // Determine current game level and appropriate link
                let gameLevel = 1;
                let levelHref = '/level1';
                let buttonText = 'Continue Level 1';

                if (level4Complete) {
                  gameLevel = 4;
                  levelHref = '/level4';
                  buttonText = 'Review Level 4';
                } else if (level3Complete) {
                  gameLevel = 4;
                  levelHref = '/level4';
                  buttonText = 'Continue to Level 4';
                } else if (level2Complete) {
                  gameLevel = 3;
                  levelHref = '/level3';
                  buttonText = 'Continue to Level 3';
                } else if (level1Complete) {
                  gameLevel = 2;
                  levelHref = '/level2';
                  buttonText = 'Continue to Level 2';
                } else if (isNewUser) {
                  buttonText = 'Start Level 1';
                }

                return (
                  <Link
                    href={levelHref}
                    className="btn btn-primary"
                    style={{ fontSize: '1.25rem', padding: '1rem 2rem' }}
                  >
                    <Play size={24} fill="currentColor" />
                    {buttonText}
                  </Link>
                );
              })()}
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

        {/* Level Selection - Show when user is logged in */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            style={{ marginTop: '2rem', width: '100%', maxWidth: '700px' }}
          >
            <h3 style={{
              textAlign: 'center',
              marginBottom: '1.5rem',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--text-muted)'
            }}>
              🗺️ Your Adventures
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {(() => {
                const level1Completed = user.progress.completedLevels.filter(l => l.level >= 1 && l.level <= 15);
                const level1Complete = level1Completed.length >= 15;
                const level2Completed = user.progress.completedLevels.filter(l => l.level >= 16 && l.level <= 33);
                const level2Complete = level2Completed.length >= 18;
                const level3Completed = user.progress.completedLevels.filter(l => l.level >= 34 && l.level <= 49);
                const level3Complete = level3Completed.length >= 16;
                const level4Completed = user.progress.completedLevels.filter(l => l.level >= 50 && l.level <= 62);
                const level4Complete = level4Completed.length >= 13;

                return (
                  <>
                    {/* Level 1 Card */}
                    <Link
                      href="/level1"
                      className="glass-panel"
                      style={{
                        padding: '1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        textDecoration: 'none',
                        border: level1Complete ? '2px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.75rem'
                      }}>
                        🚀
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Level 1: Code Rookie</span>
                          {level1Complete && <Check size={18} style={{ color: 'var(--success)' }} />}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {level1Complete ? '15/15 Complete!' : `${level1Completed.length}/15 Lessons`}
                        </div>
                        <div style={{
                          marginTop: '0.5rem',
                          height: '4px',
                          background: 'var(--bg-card)',
                          borderRadius: '2px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${(level1Completed.length / 15) * 100}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                      <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
                    </Link>

                    {/* Level 2 Card */}
                    {level1Complete ? (
                      <Link
                        href="/level2"
                        className="glass-panel"
                        style={{
                          padding: '1.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          textDecoration: 'none',
                          border: level2Complete ? '2px solid var(--success)' : '1px solid rgba(255, 184, 108, 0.3)',
                          background: 'linear-gradient(135deg, rgba(255, 184, 108, 0.05), rgba(255, 121, 198, 0.05))',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, var(--xp-coins), var(--accent-primary))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.75rem'
                        }}>
                          🥷
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Level 2: Math Ninja</span>
                            {level2Complete ? <Check size={18} style={{ color: 'var(--success)' }} /> : <span style={{ fontSize: '0.75rem', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', padding: '2px 8px', borderRadius: '10px', fontWeight: 600, color: '#1E1E2E' }}>NEW!</span>}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {level2Complete ? '18/18 Complete!' : `${level2Completed.length}/18 Lessons`}
                          </div>
                          <div style={{
                            marginTop: '0.5rem',
                            height: '4px',
                            background: 'var(--bg-card)',
                            borderRadius: '2px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${(level2Completed.length / 18) * 100}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, var(--xp-coins), var(--accent-primary))',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                        </div>
                        <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
                      </Link>
                    ) : (
                      <div
                        className="glass-panel"
                        style={{
                          padding: '1.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          opacity: 0.6,
                          cursor: 'not-allowed',
                          border: '1px solid rgba(255,255,255,0.05)'
                        }}
                      >
                        <div style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '12px',
                          background: 'rgba(100, 100, 100, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.75rem'
                        }}>
                          🔒
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-muted)' }}>Level 2: Math Ninja</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Complete Level 1 to unlock!
                          </div>
                        </div>
                        <Lock size={20} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    )}

                    {/* Level 3 Card */}
                    {level2Complete ? (
                      <Link
                        href="/level3"
                        className="glass-panel"
                        style={{
                          padding: '1.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          textDecoration: 'none',
                          border: level3Complete ? '2px solid var(--success)' : '1px solid rgba(80, 250, 123, 0.3)',
                          background: 'linear-gradient(135deg, rgba(80, 250, 123, 0.05), rgba(139, 233, 253, 0.05))',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, var(--success), var(--accent-secondary))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.75rem'
                        }}>
                          📦
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Level 3: Lists</span>
                            {level3Complete ? <Check size={18} style={{ color: 'var(--success)' }} /> : <span style={{ fontSize: '0.75rem', background: 'linear-gradient(135deg, var(--success), var(--accent-secondary))', padding: '2px 8px', borderRadius: '10px', fontWeight: 600, color: '#1E1E2E' }}>NEW!</span>}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {level3Complete ? '16/16 Complete!' : `${level3Completed.length}/16 Lessons`}
                          </div>
                          <div style={{
                            marginTop: '0.5rem',
                            height: '4px',
                            background: 'var(--bg-card)',
                            borderRadius: '2px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${(level3Completed.length / 16) * 100}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, var(--success), var(--accent-secondary))',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                        </div>
                        <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
                      </Link>
                    ) : level1Complete ? (
                      <div
                        className="glass-panel"
                        style={{
                          padding: '1.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          opacity: 0.6,
                          cursor: 'not-allowed',
                          border: '1px solid rgba(255,255,255,0.05)'
                        }}
                      >
                        <div style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '12px',
                          background: 'rgba(100, 100, 100, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.75rem'
                        }}>
                          🔒
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-muted)' }}>Level 3: Lists</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Complete Level 2 to unlock!
                          </div>
                        </div>
                        <Lock size={20} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    ) : null}

                    {/* Level 4 Card */}
                    {level3Complete ? (
                      <Link
                        href="/level4"
                        className="glass-panel"
                        style={{
                          padding: '1.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          textDecoration: 'none',
                          border: level4Complete ? '2px solid var(--success)' : '1px solid rgba(189, 147, 249, 0.3)',
                          background: 'linear-gradient(135deg, rgba(189, 147, 249, 0.05), rgba(255, 121, 198, 0.05))',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, var(--badge-project), var(--accent-primary))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.75rem'
                        }}>
                          🔧
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Level 4: Functions</span>
                            {level4Complete ? <Check size={18} style={{ color: 'var(--success)' }} /> : <span style={{ fontSize: '0.75rem', background: 'linear-gradient(135deg, var(--badge-project), var(--accent-primary))', padding: '2px 8px', borderRadius: '10px', fontWeight: 600, color: '#1E1E2E' }}>NEW!</span>}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {level4Complete ? '13/13 Complete!' : `${level4Completed.length}/13 Lessons`}
                          </div>
                          <div style={{
                            marginTop: '0.5rem',
                            height: '4px',
                            background: 'var(--bg-card)',
                            borderRadius: '2px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${(level4Completed.length / 13) * 100}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, var(--badge-project), var(--accent-primary))',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                        </div>
                        <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
                      </Link>
                    ) : level2Complete ? (
                      <div
                        className="glass-panel"
                        style={{
                          padding: '1.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          opacity: 0.6,
                          cursor: 'not-allowed',
                          border: '1px solid rgba(255,255,255,0.05)'
                        }}
                      >
                        <div style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '12px',
                          background: 'rgba(100, 100, 100, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.75rem'
                        }}>
                          🔒
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-muted)' }}>Level 4: Functions</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Complete Level 3 to unlock!
                          </div>
                        </div>
                        <Lock size={20} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    ) : null}
                  </>
                );
              })()}
            </div>
          </motion.div>
        )}

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
