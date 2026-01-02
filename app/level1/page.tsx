'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Lock, Check, ChevronRight, Code, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, getAvatarEmoji } from '../context/AuthContext';
import { LEVEL1_LESSONS } from './lessonData';

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
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
            </div>
        );
    }

    const completedLessons = user.progress.completedLevels
        .filter(l => l.level >= 1 && l.level <= 15)
        .map(l => l.level);

    const getNextLesson = () => {
        for (let i = 1; i <= 15; i++) {
            if (!completedLessons.includes(i)) return i;
        }
        return 16;
    };

    const nextLesson = getNextLesson();

    const getBadgeStyle = (type: string) => {
        switch (type) {
            case 'learn':
                return { background: 'rgba(80, 250, 123, 0.15)', border: '1px solid rgba(80, 250, 123, 0.5)', color: 'var(--badge-learn)' };
            case 'practice':
                return { background: 'rgba(255, 184, 108, 0.15)', border: '1px solid rgba(255, 184, 108, 0.5)', color: 'var(--badge-practice)' };
            case 'project':
                return { background: 'rgba(189, 147, 249, 0.15)', border: '1px solid rgba(189, 147, 249, 0.5)', color: 'var(--badge-project)' };
            default:
                return { background: 'rgba(98, 114, 164, 0.15)', border: '1px solid rgba(98, 114, 164, 0.5)', color: 'var(--locked)' };
        }
    };

    const getBadgeText = (type: string) => {
        switch (type) {
            case 'learn': return 'LEARN';
            case 'practice': return 'PRACTICE';
            case 'project': return '</> PROJECT';
            default: return 'LESSON';
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            {/* Header */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.5rem 1rem 4.5rem',
                background: 'rgba(30, 30, 46, 0.95)',
                borderBottom: '1px solid var(--border-default)',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backdropFilter: 'blur(10px)'
            }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                    <ArrowLeft size={18} /> Back
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', textDecoration: 'none' }}>
                        <span style={{ fontSize: '1.25rem' }}>{getAvatarEmoji(user.avatar)}</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{user.username}</span>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', borderRadius: '9999px', background: 'rgba(255, 85, 85, 0.15)', border: '1px solid rgba(255, 85, 85, 0.3)', color: 'var(--error)', fontSize: '0.85rem', fontWeight: 600 }}>
                        <Heart size={14} fill="currentColor" /> {user.progress.lives}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', borderRadius: '9999px', background: 'rgba(255, 184, 108, 0.15)', border: '1px solid rgba(255, 184, 108, 0.3)', color: 'var(--xp-coins)', fontSize: '0.85rem', fontWeight: 600 }}>
                        <Zap size={14} fill="currentColor" /> {user.progress.xp} XP
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div style={{ textAlign: 'center', padding: '2rem 1.5rem 1rem' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🚀💻</div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Level 1: Python Basics</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Learn to talk to your computer</p>

                    {/* Progress Bar */}
                    <div style={{ maxWidth: '300px', margin: '1.5rem auto 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            <span>{completedLessons.length} of 15 complete</span>
                            <span>{Math.round((completedLessons.length / 15) * 100)}%</span>
                        </div>
                        <div style={{ height: '8px', background: 'var(--bg-card)', borderRadius: '9999px', overflow: 'hidden' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(completedLessons.length / 15) * 100}%` }}
                                transition={{ duration: 0.5 }}
                                style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))', borderRadius: '9999px' }}
                            />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Lesson List */}
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem 1rem 3rem' }}>
                {LEVEL1_LESSONS.map((lesson, idx) => {
                    const isCompleted = completedLessons.includes(lesson.id);
                    const isLocked = lesson.id > nextLesson;
                    const isCurrent = lesson.id === nextLesson;
                    const badgeStyle = getBadgeStyle(lesson.lessonType);

                    return (
                        <motion.div
                            key={lesson.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03 }}
                        >
                            {/* Main Lesson Row */}
                            {isLocked ? (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '1rem 1.25rem',
                                    background: 'var(--bg-card)',
                                    borderBottom: '1px solid var(--border-default)',
                                    opacity: 0.5,
                                    cursor: 'not-allowed'
                                }}>
                                    <div style={{ width: '40px', fontSize: '0.9rem', color: 'var(--locked)', fontWeight: 600 }}>
                                        {String(lesson.id).padStart(2, '0')}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--locked)' }}>{lesson.title}</div>
                                    </div>
                                    <div style={{ ...badgeStyle, padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, marginRight: '1rem', opacity: 0.5 }}>
                                        {getBadgeText(lesson.lessonType)}
                                    </div>
                                    <Lock size={18} style={{ color: 'var(--locked)' }} />
                                </div>
                            ) : (
                                <Link
                                    href={`/level1/lesson${lesson.id}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '1rem 1.25rem',
                                        background: isCurrent ? 'rgba(255, 121, 198, 0.1)' : 'var(--bg-card)',
                                        borderBottom: '1px solid var(--border-default)',
                                        borderLeft: isCurrent ? '3px solid var(--accent-primary)' : '3px solid transparent',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        transition: 'all 0.2s',
                                        boxShadow: isCurrent ? '0 0 15px rgba(255, 121, 198, 0.2)' : 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--bg-card-hover)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = isCurrent ? 'rgba(255, 121, 198, 0.1)' : 'var(--bg-card)';
                                    }}
                                >
                                    <div style={{ width: '40px', display: 'flex', alignItems: 'center' }}>
                                        {isCompleted ? (
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Check size={14} style={{ color: '#1E1E2E' }} />
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: '0.9rem', color: isCurrent ? 'var(--accent-secondary)' : 'var(--text-secondary)', fontWeight: 600 }}>
                                                {String(lesson.id).padStart(2, '0')}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{lesson.title}</div>
                                        {lesson.lessonType === 'project' && (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{lesson.subtitle}</div>
                                        )}
                                    </div>
                                    <div style={{ ...badgeStyle, padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, marginRight: '1rem' }}>
                                        {getBadgeText(lesson.lessonType)}
                                    </div>
                                    {isCompleted ? (
                                        <Check size={18} style={{ color: 'var(--success)' }} />
                                    ) : isCurrent ? (
                                        <ChevronRight size={18} style={{ color: 'var(--accent-primary)' }} />
                                    ) : (
                                        <ChevronRight size={18} style={{ color: 'var(--locked)' }} />
                                    )}
                                </Link>
                            )}

                            {/* SUPERCHARGE Row (after practice lessons) */}
                            {lesson.hasSupercharge && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0.75rem 1.25rem',
                                    paddingLeft: '3.5rem',
                                    background: 'rgba(241, 250, 140, 0.05)',
                                    borderBottom: '1px solid var(--border-default)',
                                    opacity: isCompleted ? 1 : 0.5,
                                    cursor: isCompleted ? 'pointer' : 'not-allowed'
                                }}>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Zap size={16} style={{ color: 'var(--badge-supercharge)' }} />
                                        <span style={{ color: 'var(--badge-supercharge)', fontWeight: 600, fontSize: '0.85rem' }}>SUPERCHARGE</span>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>+25 XP Bonus</span>
                                    </div>
                                    {isCompleted ? (
                                        <ChevronRight size={16} style={{ color: 'var(--badge-supercharge)' }} />
                                    ) : (
                                        <Lock size={16} style={{ color: 'var(--locked)' }} />
                                    )}
                                </div>
                            )}
                        </motion.div>
                    );
                })}

                {/* Level Complete Button */}
                {completedLessons.length === 15 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ marginTop: '2rem', textAlign: 'center' }}
                    >
                        <Link
                            href="/level1/complete"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '1rem 2rem',
                                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                color: '#1E1E2E',
                                textDecoration: 'none',
                                borderRadius: '12px',
                                fontWeight: 700,
                                fontSize: '1rem',
                                boxShadow: '0 4px 20px rgba(255, 121, 198, 0.4)'
                            }}
                        >
                            <Trophy size={20} />
                            View Level 1 Badge!
                            <ChevronRight size={20} />
                        </Link>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
