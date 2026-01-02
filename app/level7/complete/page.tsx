'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, ChevronRight, Home, Zap, Award } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Confetti from 'react-confetti';

export default function Level7Complete() {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        }
    }, []);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🧙</motion.div>
            </div>
        );
    }

    // Calculate stats for Level 7 (lessons 85-96)
    const level7Lessons = user.progress.completedLevels.filter(l => l.level >= 85 && l.level <= 96);
    const totalXP = level7Lessons.reduce((sum, l) => sum + l.xpEarned, 0);
    const totalCoins = level7Lessons.reduce((sum, l) => sum + l.coinsEarned, 0);

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1E1E2E 0%, #2D1B4E 50%, #1E1E2E 100%)', color: 'var(--text-primary)', overflow: 'hidden', position: 'relative' }}>
            <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={300} colors={['#a855f7', '#ec4899', '#8b5cf6', '#f472b6', '#c084fc']} />

            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center', position: 'relative', zIndex: 10 }}>
                {/* Badge */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', duration: 1, delay: 0.2 }}
                    style={{
                        width: '150px',
                        height: '150px',
                        margin: '0 auto 2rem',
                        background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 60px rgba(168, 85, 247, 0.5)',
                        border: '4px solid rgba(255, 255, 255, 0.2)'
                    }}
                >
                    <span style={{ fontSize: '4rem' }}>🧙</span>
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                    Level 7 Complete!
                </motion.h1>

                <motion.p
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}
                >
                    Text Wizardry Master! ✨🔐✂️
                </motion.p>

                {/* Badge Earned */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, type: 'spring' }}
                    style={{
                        background: 'rgba(168, 85, 247, 0.1)',
                        border: '2px solid rgba(168, 85, 247, 0.4)',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        marginBottom: '2rem'
                    }}
                >
                    <Award size={32} style={{ color: '#a855f7', marginBottom: '0.5rem' }} />
                    <h3 style={{ color: '#a855f7', marginBottom: '0.5rem' }}>Badge Earned!</h3>
                    <p style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🧙 Text Wizard</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Mastered Strings & List Operations
                    </p>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}
                >
                    <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '0.75rem' }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ec4899' }}>12</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Lessons</div>
                    </div>
                    <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '0.75rem' }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#a855f7' }}>{totalXP || 150}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>XP Earned</div>
                    </div>
                    <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '0.75rem' }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#8b5cf6' }}>{totalCoins || 85}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Coins</div>
                    </div>
                </motion.div>

                {/* Skills Learned */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem', textAlign: 'left' }}
                >
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Star size={20} style={{ color: '#ec4899' }} /> Skills Mastered
                    </h3>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {[
                            '✂️ String slicing & indexing',
                            '🔠 Case transformation methods',
                            '🔍 Find, replace & text searching',
                            '🔗 Split & join operations',
                            '🧹 Strip & text validation',
                            '🍕 List slicing with steps',
                            '✨ List comprehensions',
                            '🔐 Secret Code Maker project'
                        ].map((skill, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
                                {skill}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Navigation */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                    <Link
                        href="/"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            padding: '1rem 2rem',
                            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            boxShadow: '0 4px 20px rgba(168, 85, 247, 0.4)'
                        }}
                    >
                        <Trophy size={20} />
                        Back to Home
                        <ChevronRight size={20} />
                    </Link>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        More levels coming soon!
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
