'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, ChevronRight, Home, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Confetti from 'react-confetti';

export default function Level4Complete() {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }

        setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight
        });

        const timer = setTimeout(() => setShowConfetti(false), 5000);
        return () => clearTimeout(timer);
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
            </div>
        );
    }

    // Check if Level 4 is actually complete
    const level4Completed = user.progress.completedLevels.filter(l => l.level >= 50 && l.level <= 62).length;
    const isComplete = level4Completed >= 13;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {showConfetti && (
                <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    recycle={false}
                    numberOfPieces={500}
                    colors={['#FF79C6', '#8BE9FD', '#50FA7B', '#FFB86C', '#BD93F9', '#F1FA8C']}
                />
            )}

            {/* Background glow effects */}
            <div style={{
                position: 'absolute',
                top: '20%',
                left: '10%',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(255, 121, 198, 0.3) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(60px)',
                zIndex: 0
            }} />
            <div style={{
                position: 'absolute',
                bottom: '20%',
                right: '10%',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(139, 233, 253, 0.3) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(60px)',
                zIndex: 0
            }} />

            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', duration: 1, delay: 0.2 }}
                style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--badge-project))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '2rem',
                    boxShadow: '0 0 40px rgba(255, 121, 198, 0.5)',
                    position: 'relative',
                    zIndex: 10
                }}
            >
                <Trophy size={60} style={{ color: '#1E1E2E' }} />
            </motion.div>

            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}
            >
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    marginBottom: '0.5rem',
                    background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}>
                    LEVEL 4 COMPLETE!
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    You mastered Functions!
                </p>
            </motion.div>

            {/* Badge Earned */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: 'spring' }}
                style={{
                    background: 'var(--bg-card)',
                    border: '2px solid var(--accent-primary)',
                    borderRadius: '1rem',
                    padding: '2rem',
                    textAlign: 'center',
                    marginBottom: '2rem',
                    boxShadow: '0 0 30px rgba(255, 121, 198, 0.2)',
                    position: 'relative',
                    zIndex: 10
                }}
            >
                <motion.div
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ fontSize: '4rem', marginBottom: '1rem' }}
                >
                    🍕🔧
                </motion.div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    Function Master Badge
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    You can create reusable commands!
                </p>

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1rem',
                    marginTop: '1.5rem',
                    flexWrap: 'wrap'
                }}>
                    <div style={{
                        background: 'rgba(80, 250, 123, 0.15)',
                        border: '1px solid rgba(80, 250, 123, 0.3)',
                        borderRadius: '0.5rem',
                        padding: '0.5rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Star size={16} style={{ color: 'var(--success)' }} fill="currentColor" />
                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>13 Lessons</span>
                    </div>
                    <div style={{
                        background: 'rgba(255, 184, 108, 0.15)',
                        border: '1px solid rgba(255, 184, 108, 0.3)',
                        borderRadius: '0.5rem',
                        padding: '0.5rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Zap size={16} style={{ color: 'var(--xp-coins)' }} fill="currentColor" />
                        <span style={{ color: 'var(--xp-coins)', fontWeight: 600 }}>+155 XP Earned</span>
                    </div>
                </div>
            </motion.div>

            {/* Skills Unlocked */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                style={{
                    background: 'var(--bg-card)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    maxWidth: '400px',
                    width: '100%',
                    position: 'relative',
                    zIndex: 10
                }}
            >
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    <Sparkles size={18} style={{ color: 'var(--badge-supercharge)' }} />
                    Skills Unlocked
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {[
                        'Create functions with def',
                        'Add parameters to functions',
                        'Return values from functions',
                        'Use multiple parameters',
                        'Variable scope (local vs global)',
                        'Functions with if/else',
                        'Functions with lists',
                        'Functions with loops',
                        'Build real programs!'
                    ].map((skill, idx) => (
                        <motion.li
                            key={idx}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 1 + idx * 0.1 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 0',
                                borderBottom: idx < 8 ? '1px solid var(--border-default)' : 'none',
                                color: 'var(--text-secondary)',
                                fontSize: '0.9rem'
                            }}
                        >
                            <span style={{ color: 'var(--success)' }}>✓</span>
                            {skill}
                        </motion.li>
                    ))}
                </ul>
            </motion.div>

            {/* Next Steps */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.5 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', zIndex: 10 }}
            >
                <Link
                    href="/"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
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
                    <Home size={20} />
                    Back to Home
                    <ChevronRight size={20} />
                </Link>

                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Level 5 coming soon...
                </p>
            </motion.div>

            {/* Floating celebration emojis */}
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{
                        y: -100,
                        opacity: [0, 1, 1, 0],
                        x: Math.sin(i) * 50
                    }}
                    transition={{
                        duration: 3,
                        delay: i * 0.3,
                        repeat: Infinity,
                        repeatDelay: 2
                    }}
                    style={{
                        position: 'absolute',
                        bottom: '10%',
                        left: `${10 + i * 10}%`,
                        fontSize: '2rem',
                        zIndex: 5
                    }}
                >
                    {['🍕', '🎉', '⭐', '🔧', '🏆', '✨', '🚀', '💻'][i]}
                </motion.div>
            ))}
        </div>
    );
}
