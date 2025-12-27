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
            <div style={{ minHeight: '100vh', background: '#0f0a1f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#64748b' }}>Loading...</div>
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
                return { background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.5)', color: '#22c55e' };
            case 'practice':
                return { background: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.5)', color: '#eab308' };
            case 'project':
                return { background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.5)', color: '#a855f7' };
            default:
                return { background: 'rgba(100, 116, 139, 0.15)', border: '1px solid rgba(100, 116, 139, 0.5)', color: '#64748b' };
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
        <div style={{ minHeight: '100vh', background: '#0f0a1f', color: 'white' }}>
            {/* Header */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.5rem',
                background: 'rgba(15, 10, 31, 0.95)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backdropFilter: 'blur(10px)'
            }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>
                    <ArrowLeft size={18} /> Back
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', textDecoration: 'none' }}>
                        <span style={{ fontSize: '1.25rem' }}>{getAvatarEmoji(user.avatar)}</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{user.username}</span>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', borderRadius: '9999px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontSize: '0.85rem', fontWeight: 600 }}>
                        <Heart size={14} fill="currentColor" /> {user.progress.lives}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', borderRadius: '9999px', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#c084fc', fontSize: '0.85rem', fontWeight: 600 }}>
                        <Zap size={14} fill="currentColor" /> {user.progress.xp} XP
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div style={{ textAlign: 'center', padding: '2rem 1.5rem 1rem' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🗣️💻</div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Level 1: Python Basics</h1>
                    <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Learn to talk to your computer</p>

                    {/* Progress Bar */}
                    <div style={{ maxWidth: '300px', margin: '1.5rem auto 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                            <span>{completedLessons.length} of 15 complete</span>
                            <span>{Math.round((completedLessons.length / 15) * 100)}%</span>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(completedLessons.length / 15) * 100}%` }}
                                transition={{ duration: 0.5 }}
                                style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: '9999px' }}
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
                                    background: 'rgba(255,255,255,0.02)',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    opacity: 0.5,
                                    cursor: 'not-allowed'
                                }}>
                                    <div style={{ width: '40px', fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
                                        {String(lesson.id).padStart(2, '0')}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#64748b' }}>{lesson.title}</div>
                                    </div>
                                    <div style={{ ...badgeStyle, padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, marginRight: '1rem', opacity: 0.5 }}>
                                        {getBadgeText(lesson.lessonType)}
                                    </div>
                                    <Lock size={18} style={{ color: '#475569' }} />
                                </div>
                            ) : (
                                <Link
                                    href={`/level1/lesson${lesson.id}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '1rem 1.25rem',
                                        background: isCurrent ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.02)',
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        borderLeft: isCurrent ? '3px solid #6366f1' : '3px solid transparent',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = isCurrent ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.02)';
                                    }}
                                >
                                    <div style={{ width: '40px', display: 'flex', alignItems: 'center' }}>
                                        {isCompleted ? (
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Check size={14} style={{ color: 'white' }} />
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: '0.9rem', color: isCurrent ? '#a5b4fc' : '#64748b', fontWeight: 600 }}>
                                                {String(lesson.id).padStart(2, '0')}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: isCompleted ? '#94a3b8' : 'white' }}>{lesson.title}</div>
                                        {lesson.lessonType === 'project' && (
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>{lesson.subtitle}</div>
                                        )}
                                    </div>
                                    <div style={{ ...badgeStyle, padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, marginRight: '1rem' }}>
                                        {getBadgeText(lesson.lessonType)}
                                    </div>
                                    {isCompleted ? (
                                        <Check size={18} style={{ color: '#22c55e' }} />
                                    ) : isCurrent ? (
                                        <ChevronRight size={18} style={{ color: '#6366f1' }} />
                                    ) : (
                                        <ChevronRight size={18} style={{ color: '#475569' }} />
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
                                    background: 'rgba(234, 179, 8, 0.05)',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    opacity: isCompleted ? 1 : 0.5,
                                    cursor: isCompleted ? 'pointer' : 'not-allowed'
                                }}>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Zap size={16} style={{ color: '#eab308' }} />
                                        <span style={{ color: '#eab308', fontWeight: 600, fontSize: '0.85rem' }}>SUPERCHARGE</span>
                                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>+25 XP Bonus</span>
                                    </div>
                                    {isCompleted ? (
                                        <ChevronRight size={16} style={{ color: '#eab308' }} />
                                    ) : (
                                        <Lock size={16} style={{ color: '#475569' }} />
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
                                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '12px',
                                fontWeight: 700,
                                fontSize: '1rem',
                                boxShadow: '0 4px 20px rgba(34, 197, 94, 0.3)'
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
