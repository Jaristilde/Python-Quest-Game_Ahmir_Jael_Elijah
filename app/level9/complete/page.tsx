'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, ChevronRight, Home, Zap, Award, Crown, Sparkles, Heart, Medal, Gift } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Confetti from 'react-confetti';

export default function Level9Complete() {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    const [showFireworks, setShowFireworks] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        }
        // Keep confetti running longer for final celebration
        const timer = setTimeout(() => setShowFireworks(false), 10000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🎓</motion.div>
            </div>
        );
    }

    // Calculate TOTAL stats across ALL levels
    const totalXP = user.progress.xp;
    const totalCoins = user.progress.coins;
    const totalLessons = user.progress.completedLevels.length;

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1E1E2E 0%, #2D1B3D 25%, #1B3D2D 50%, #3D2D1B 75%, #1E1E2E 100%)', color: 'var(--text-primary)', overflow: 'hidden', position: 'relative' }}>
            {showFireworks && (
                <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    recycle={true}
                    numberOfPieces={500}
                    colors={['#FF79C6', '#8BE9FD', '#50FA7B', '#FFD700', '#FF6B6B', '#BD93F9', '#F1FA8C']}
                />
            )}

            {/* Floating stars background */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    style={{
                        position: 'absolute',
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        fontSize: '1.5rem',
                        opacity: 0.3
                    }}
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.3, 0.6, 0.3],
                        rotate: [0, 180, 360]
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2
                    }}
                >
                    ⭐
                </motion.div>
            ))}

            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1.5rem', textAlign: 'center', position: 'relative', zIndex: 10 }}>
                {/* Crown and Badge */}
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', duration: 1.5 }}
                    style={{ marginBottom: '1rem' }}
                >
                    <Crown size={60} style={{ color: '#FFD700', filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.5))' }} />
                </motion.div>

                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', duration: 1.2, delay: 0.3 }}
                    style={{
                        width: '180px',
                        height: '180px',
                        margin: '0 auto 1.5rem',
                        background: 'linear-gradient(135deg, #FF79C6, #8BE9FD, #50FA7B, #FFD700)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 80px rgba(255, 121, 198, 0.5), 0 0 120px rgba(139, 233, 253, 0.3)',
                        border: '6px solid rgba(255, 255, 255, 0.3)'
                    }}
                >
                    <span style={{ fontSize: '5rem' }}>🎓</span>
                </motion.div>

                {/* Title */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 800,
                        marginBottom: '0.5rem',
                        background: 'linear-gradient(135deg, #FF79C6, #8BE9FD, #50FA7B, #FFD700)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 0 30px rgba(255, 121, 198, 0.3)'
                    }}>
                        CONGRATULATIONS!
                    </h1>
                    <h2 style={{ fontSize: '1.5rem', color: '#FFD700', marginBottom: '0.5rem' }}>
                        🐍 You Are Now a Python Master! 🐍
                    </h2>
                </motion.div>

                <motion.p
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}
                >
                    You completed Python Quest! 🎉
                </motion.p>

                {/* Grand Badge Earned */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: 'spring' }}
                    style={{
                        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 121, 198, 0.2))',
                        border: '3px solid #FFD700',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        marginBottom: '2rem'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Star size={24} style={{ color: '#FFD700' }} fill="#FFD700" />
                        <Trophy size={32} style={{ color: '#FFD700' }} />
                        <Star size={24} style={{ color: '#FFD700' }} fill="#FFD700" />
                    </div>
                    <h3 style={{ color: '#FFD700', marginBottom: '0.5rem', fontSize: '1.3rem' }}>Ultimate Badge Earned!</h3>
                    <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆 Python Quest Champion 🏆</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        Mastered all 9 levels of Python programming!
                    </p>
                </motion.div>

                {/* Total Stats */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    style={{ marginBottom: '2rem' }}
                >
                    <h3 style={{ color: '#8BE9FD', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Medal size={20} /> Your Journey Stats <Medal size={20} />
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        <div style={{ background: 'rgba(80, 250, 123, 0.15)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(80, 250, 123, 0.3)' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#50FA7B' }}>{totalLessons}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Lessons</div>
                        </div>
                        <div style={{ background: 'rgba(255, 121, 198, 0.15)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 121, 198, 0.3)' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#FF79C6' }}>{totalXP}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total XP</div>
                        </div>
                        <div style={{ background: 'rgba(255, 215, 0, 0.15)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#FFD700' }}>{totalCoins}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Coins</div>
                        </div>
                    </div>
                </motion.div>

                {/* All Skills */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1 }}
                    style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem', textAlign: 'left' }}
                >
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                        <Sparkles size={20} style={{ color: '#FFD700' }} /> Skills Mastered <Sparkles size={20} style={{ color: '#FFD700' }} />
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.85rem' }}>
                        {[
                            '🔤 Variables & Data Types',
                            '🔁 Loops & Iteration',
                            '❓ Conditionals',
                            '📋 Lists & Data',
                            '🎯 Functions',
                            '📦 Modules',
                            '✂️ String Operations',
                            '🏗️ Classes & Objects',
                            '🌐 APIs & JSON'
                        ].map((skill, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.1 + idx * 0.05 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem',
                                    background: `rgba(${idx % 3 === 0 ? '255, 121, 198' : idx % 3 === 1 ? '139, 233, 253' : '80, 250, 123'}, 0.1)`,
                                    borderRadius: '0.5rem'
                                }}
                            >
                                {skill}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Encouragement Message */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    style={{
                        background: 'linear-gradient(135deg, rgba(139, 233, 253, 0.15), rgba(80, 250, 123, 0.15))',
                        border: '1px solid rgba(139, 233, 253, 0.3)',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        marginBottom: '2rem'
                    }}
                >
                    <Gift size={32} style={{ color: '#8BE9FD', marginBottom: '0.5rem' }} />
                    <h3 style={{ color: '#8BE9FD', marginBottom: '0.5rem' }}>What's Next?</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                        You've learned the foundations of Python! Keep coding by:
                    </p>
                    <div style={{ marginTop: '0.75rem', textAlign: 'left', paddingLeft: '1rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>🎮 Building your own games</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>🤖 Creating fun projects</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>📚 Learning more Python online</p>
                    </div>
                </motion.div>

                {/* Navigation */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.7 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                    <Link
                        href="/"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            padding: '1.25rem 2rem',
                            background: 'linear-gradient(135deg, #FF79C6, #8BE9FD, #50FA7B)',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '1.2rem',
                            boxShadow: '0 4px 30px rgba(255, 121, 198, 0.4)'
                        }}
                    >
                        <Home size={24} />
                        Return Home as a Champion!
                        <ChevronRight size={24} />
                    </Link>
                </motion.div>

                {/* Footer */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    style={{ marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}
                >
                    Thank you for playing Python Quest! 🐍❤️
                </motion.p>
            </div>
        </div>
    );
}
