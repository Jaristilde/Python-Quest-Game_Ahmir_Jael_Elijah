'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Lock, Check, ChevronRight, Play, Trophy, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, getAvatarEmoji } from '../context/AuthContext';
import { LEVEL9_LESSONS } from './lessonData';

export default function Level9Hub() {
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

    // Check if Level 8 is complete (12 lessons, stored as levels 97-108)
    const level8Complete = user.progress.completedLevels.filter(l => l.level >= 97 && l.level <= 108).length >= 12;

    if (!level8Complete) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                    <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>
                        🔒
                    </motion.div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>Level 9 is Locked!</h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '300px' }}>
                        Complete all 12 lessons in Level 8 to unlock APIs & JSON!
                    </p>
                    <Link href="/level8" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 1.5rem', background: 'linear-gradient(135deg, #FF79C6, #8BE9FD)', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 600 }}>
                        <Play size={18} /> Go to Level 8
                    </Link>
                </div>
            </div>
        );
    }

    // Level 9 lessons are stored as levels 109-115
    const completedLessons = user.progress.completedLevels
        .filter(l => l.level >= 109 && l.level <= 115)
        .map(l => l.level - 108);

    const getNextLesson = () => {
        for (let i = 1; i <= 7; i++) {
            if (!completedLessons.includes(i)) return i;
        }
        return 8;
    };

    const nextLesson = getNextLesson();
    const allComplete = completedLessons.length >= 7;

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1E1E2E 0%, #2D1B3D 50%, #1E1E2E 100%)', color: 'var(--text-primary)' }}>
            {/* Header */}
            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem 1rem 4.5rem', borderBottom: '1px solid rgba(255, 121, 198, 0.3)' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                    <ArrowLeft size={18} /> Home
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Star size={16} style={{ color: '#FFD700' }} />
                    <span style={{ fontWeight: 600, color: '#FF79C6' }}>FINAL LEVEL!</span>
                    <Star size={16} style={{ color: '#FFD700' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.65rem', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '20px', fontSize: '0.85rem', color: '#ef4444' }}>
                        <Heart size={14} fill="currentColor" /> {user.progress.lives}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.65rem', background: 'rgba(255, 121, 198, 0.15)', borderRadius: '20px', fontSize: '0.85rem', color: '#FF79C6' }}>
                        <Zap size={14} fill="currentColor" /> {user.progress.xp}
                    </div>
                </div>
            </header>

            {/* Level Info */}
            <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                        width: '100px',
                        height: '100px',
                        margin: '0 auto 1rem',
                        background: 'linear-gradient(135deg, #FF79C6, #8BE9FD)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        boxShadow: '0 0 40px rgba(255, 121, 198, 0.4)'
                    }}
                >
                    🌐
                </motion.div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', background: 'linear-gradient(135deg, #FF79C6, #8BE9FD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    APIs & JSON
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Fun Facts Generator</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span>7 Lessons</span>
                    <span>•</span>
                    <span>{completedLessons.length}/7 Complete</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{ padding: '0 1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(completedLessons.length / 7) * 100}%` }}
                        style={{ height: '100%', background: 'linear-gradient(90deg, #FF79C6, #8BE9FD)', borderRadius: '4px' }}
                    />
                </div>
            </div>

            {/* Lessons List */}
            <div style={{ padding: '0 1.5rem 2rem' }}>
                {LEVEL9_LESSONS.map((lesson, idx) => {
                    const lessonNum = idx + 1;
                    const isCompleted = completedLessons.includes(lessonNum);
                    const isNext = lessonNum === nextLesson;
                    const isLocked = lessonNum > nextLesson && !isCompleted;

                    return (
                        <motion.div
                            key={lesson.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Link
                                href={isLocked ? '#' : `/level9/lesson${lessonNum}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1rem',
                                    marginBottom: '0.75rem',
                                    background: isNext
                                        ? 'linear-gradient(135deg, rgba(255, 121, 198, 0.2), rgba(139, 233, 253, 0.2))'
                                        : isCompleted
                                            ? 'rgba(80, 250, 123, 0.1)'
                                            : 'var(--bg-card)',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    border: isNext ? '2px solid #FF79C6' : '1px solid transparent',
                                    opacity: isLocked ? 0.5 : 1,
                                    cursor: isLocked ? 'not-allowed' : 'pointer'
                                }}
                                onClick={e => isLocked && e.preventDefault()}
                            >
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '12px',
                                    background: isCompleted
                                        ? 'linear-gradient(135deg, #50FA7B, #22c55e)'
                                        : isNext
                                            ? 'linear-gradient(135deg, #FF79C6, #8BE9FD)'
                                            : 'var(--bg-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem'
                                }}>
                                    {isCompleted ? <Check size={24} color="white" /> : isLocked ? <Lock size={20} /> : lesson.emoji}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: isCompleted ? '#50FA7B' : isNext ? '#FF79C6' : 'var(--text-primary)' }}>
                                        {lesson.title}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {lesson.subtitle}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {lesson.lessonType === 'project' && <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(255, 121, 198, 0.2)', color: '#FF79C6', borderRadius: '4px' }}>FINAL PROJECT</span>}
                                    {lesson.hasSupercharge && <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(139, 233, 253, 0.2)', color: '#8BE9FD', borderRadius: '4px' }}>⚡</span>}
                                    <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>

            {/* Complete Button */}
            {allComplete && (
                <div style={{ padding: '0 1.5rem 2rem', textAlign: 'center' }}>
                    <Link
                        href="/level9/complete"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '1rem 2rem',
                            background: 'linear-gradient(135deg, #FF79C6, #8BE9FD, #50FA7B)',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            boxShadow: '0 4px 20px rgba(255, 121, 198, 0.4)'
                        }}
                    >
                        <Trophy size={20} />
                        Complete Python Quest!
                        <ChevronRight size={20} />
                    </Link>
                </div>
            )}
        </div>
    );
}
