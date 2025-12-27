'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Lock, Check, ChevronRight, Play, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, getAvatarEmoji } from '../context/AuthContext';
import { LEVEL3_LESSONS } from './lessonData';
import styles from './lessons.module.css';

export default function Level3Hub() {
    const router = useRouter();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return (
            <div className={styles.hubContainer}>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-slate-400">Loading...</div>
                </div>
            </div>
        );
    }

    // Check if Level 2 is complete (18 lessons, stored as levels 16-33)
    const level2Complete = user.progress.completedLevels.filter(l => l.level >= 16 && l.level <= 33).length >= 18;

    // If Level 2 not complete, show locked message
    if (!level2Complete) {
        return (
            <div className={styles.hubContainer}>
                <header className={styles.header} style={{ position: 'relative', marginBottom: '2rem' }}>
                    <Link href="/" className={styles.backBtn}>
                        <ArrowLeft size={18} /> Back to Home
                    </Link>
                </header>

                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ fontSize: '5rem', marginBottom: '1.5rem' }}
                    >
                        🔒
                    </motion.div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Level 3 is Locked!</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                        Complete all 18 lessons in Level 2 to unlock Lists and build your ToDo app!
                    </p>
                    <Link href="/level2" className="btn btn-primary" style={{ padding: '1rem 2rem' }}>
                        <Play size={20} /> Go to Level 2
                    </Link>
                </div>
            </div>
        );
    }

    // Level 3 lessons are stored as levels 34-49 in completedLevels
    const completedLessons = user.progress.completedLevels
        .filter(l => l.level >= 34 && l.level <= 49)
        .map(l => l.level - 33); // Convert back to 1-16

    const getNextLesson = () => {
        for (let i = 1; i <= 16; i++) {
            if (!completedLessons.includes(i)) return i;
        }
        return 17; // All done
    };

    const nextLesson = getNextLesson();

    return (
        <div className={styles.hubContainer}>
            {/* Header */}
            <header className={styles.header} style={{ position: 'relative', marginBottom: '2rem' }}>
                <Link href="/" className={styles.backBtn}>
                    <ArrowLeft size={18} /> Back to Home
                </Link>

                <div className={styles.stats}>
                    <Link href="/profile" className="flex items-center gap-2 text-slate-300 hover:text-white transition mr-4">
                        <span className="text-xl">{getAvatarEmoji(user.avatar)}</span>
                        <span className="text-sm font-medium">{user.username}</span>
                    </Link>
                    <div className={`${styles.statBadge} ${styles.hearts}`}>
                        <Heart size={14} fill="currentColor" /> {user.progress.lives}
                    </div>
                    <div className={`${styles.statBadge} ${styles.xp}`}>
                        <Zap size={14} fill="currentColor" /> {user.progress.xp} XP
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className={styles.hubHeader}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <span style={{ fontSize: '4rem' }}>📦📝</span>
                    <h1 className={styles.hubTitle}>Level 3: Lists</h1>
                    <p className={styles.hubSubtitle}>16 lessons to master organizing data!</p>

                    {/* Progress */}
                    <div style={{ maxWidth: '400px', margin: '1.5rem auto 0' }}>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{
                                    width: `${(completedLessons.length / 16) * 100}%`,
                                    background: 'linear-gradient(90deg, #10b981, #3b82f6)'
                                }}
                            />
                        </div>
                        <p className="text-slate-400 text-sm">{completedLessons.length} of 16 lessons complete</p>
                    </div>
                </motion.div>
            </div>

            {/* Lesson Grid */}
            <div className={styles.lessonGrid}>
                {LEVEL3_LESSONS.map((lesson, idx) => {
                    const isCompleted = completedLessons.includes(lesson.id);
                    const isLocked = lesson.id > nextLesson;
                    const isCurrent = lesson.id === nextLesson;

                    return (
                        <motion.div
                            key={lesson.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            {isLocked ? (
                                <div className={`${styles.lessonCard} ${styles.locked}`}>
                                    <div className={styles.lessonCardHeader}>
                                        <div className={styles.lessonCardEmoji}>{lesson.emoji}</div>
                                        <div>
                                            <div className={styles.lessonCardNum}>Lesson {lesson.id}</div>
                                            <div className={styles.lessonCardTitle}>{lesson.title}</div>
                                            <div className={styles.lessonCardSubtitle}>{lesson.subtitle}</div>
                                        </div>
                                    </div>
                                    <span className={styles.lessonCardConcept}>{lesson.concept}</span>
                                    <div className={`${styles.lessonCardStatus} ${styles.locked}`}>
                                        <Lock size={14} /> Complete previous lesson first
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    href={`/level3/lesson${lesson.id}`}
                                    className={`${styles.lessonCard} ${isCompleted ? styles.completed : ''}`}
                                    style={{ borderColor: isCompleted ? 'rgba(16, 185, 129, 0.5)' : undefined }}
                                >
                                    <div className={styles.lessonCardHeader}>
                                        <div className={styles.lessonCardEmoji}>{lesson.emoji}</div>
                                        <div>
                                            <div className={styles.lessonCardNum}>Lesson {lesson.id}</div>
                                            <div className={styles.lessonCardTitle}>{lesson.title}</div>
                                            <div className={styles.lessonCardSubtitle}>{lesson.subtitle}</div>
                                        </div>
                                    </div>
                                    <span className={styles.lessonCardConcept}>{lesson.concept}</span>
                                    <div className={`${styles.lessonCardStatus} ${isCompleted ? styles.done : ''}`}>
                                        {isCompleted ? (
                                            <><Check size={14} /> Completed! +{lesson.xpReward} XP</>
                                        ) : isCurrent ? (
                                            <><Play size={14} /> Start lesson</>
                                        ) : (
                                            <><ChevronRight size={14} /> Review</>
                                        )}
                                    </div>
                                </Link>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* All Complete? */}
            {completedLessons.length === 16 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ textAlign: 'center', marginTop: '3rem' }}
                >
                    <Link href="/level3/complete" className="btn btn-success text-lg px-8 py-4" style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
                        <Trophy size={24} /> View Level 3 Complete Badge! <ChevronRight size={20} />
                    </Link>
                </motion.div>
            )}
        </div>
    );
}
