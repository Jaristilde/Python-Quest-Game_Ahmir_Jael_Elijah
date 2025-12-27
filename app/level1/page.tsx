'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Lock, Check, ChevronRight, Play } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, getAvatarEmoji } from '../context/AuthContext';
import { LEVEL1_LESSONS } from './lessonData';
import styles from './lessons.module.css';

export default function Level1Hub() {
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

    // Determine which lessons are completed (Level 1 has 15 lessons)
    const completedLessons = user.progress.completedLevels
        .filter(l => l.level >= 1 && l.level <= 15)
        .map(l => l.level);

    const getNextLesson = () => {
        for (let i = 1; i <= 15; i++) {
            if (!completedLessons.includes(i)) return i;
        }
        return 16; // All done
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
                    <span style={{ fontSize: '4rem' }}>🗣️💻</span>
                    <h1 className={styles.hubTitle}>Level 1: Talk to Your Computer</h1>
                    <p className={styles.hubSubtitle}>15 lessons to become a Python beginner!</p>

                    {/* Progress */}
                    <div style={{ maxWidth: '400px', margin: '1.5rem auto 0' }}>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${(completedLessons.length / 15) * 100}%` }}
                            />
                        </div>
                        <p className="text-slate-400 text-sm">{completedLessons.length} of 15 lessons complete</p>
                    </div>
                </motion.div>
            </div>

            {/* Lesson Grid */}
            <div className={styles.lessonGrid}>
                {LEVEL1_LESSONS.map((lesson, idx) => {
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
                                    href={`/level1/lesson${lesson.id}`}
                                    className={`${styles.lessonCard} ${isCompleted ? styles.completed : ''}`}
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
            {completedLessons.length === 15 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ textAlign: 'center', marginTop: '3rem' }}
                >
                    <Link href="/level1/complete" className="btn btn-success text-lg px-8 py-4">
                        🎉 View Level 1 Complete Badge! <ChevronRight size={20} />
                    </Link>
                </motion.div>
            )}
        </div>
    );
}
