'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Check, Star, Zap, Award, ChevronRight, Home, Gamepad2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, getAvatarEmoji } from '../../context/AuthContext';
import { LEVEL2_LESSONS, TOTAL_LEVEL2_XP } from '../lessonData';
import styles from '../lessons.module.css';

export default function Level2Complete() {
    const router = useRouter();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return <div className={styles.container}><div className="flex items-center justify-center h-screen text-slate-400">Loading...</div></div>;
    }

    // Check if Level 2 is actually complete
    const level2Lessons = user.progress.completedLevels.filter(l => l.level >= 16 && l.level <= 33);
    const isComplete = level2Lessons.length >= 18;

    if (!isComplete) {
        return (
            <div className={styles.container} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                    <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</motion.div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Not So Fast!</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Complete all 18 lessons to unlock this badge!</p>
                    <Link href="/level2" className="btn btn-primary">Back to Level 2</Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', maxWidth: '700px' }}
            >
                {/* Confetti effect */}
                <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: -100, x: Math.random() * window.innerWidth, opacity: 1 }}
                            animate={{ y: window.innerHeight + 100, opacity: 0 }}
                            transition={{ duration: 3 + Math.random() * 2, delay: Math.random() * 2, repeat: Infinity }}
                            style={{
                                position: 'absolute',
                                fontSize: '2rem',
                                transform: `rotate(${Math.random() * 360}deg)`
                            }}
                        >
                            {['🎉', '⭐', '✊', '🏆', '🎮', '✨'][Math.floor(Math.random() * 6)]}
                        </motion.div>
                    ))}
                </div>

                {/* Badge */}
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                >
                    <div style={{
                        width: '150px',
                        height: '150px',
                        background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 2rem',
                        boxShadow: '0 0 80px rgba(245, 158, 11, 0.5), 0 0 120px rgba(236, 72, 153, 0.3)',
                        position: 'relative'
                    }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                            style={{
                                position: 'absolute',
                                inset: '-10px',
                                border: '3px dashed rgba(255,255,255,0.3)',
                                borderRadius: '50%'
                            }}
                        />
                        <Gamepad2 size={70} className="text-white" />
                    </div>
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    style={{
                        fontSize: '2.5rem',
                        fontWeight: 900,
                        background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '0.5rem'
                    }}
                >
                    🎮 FLOW CONTROL MASTER! 🎮
                </motion.h1>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2rem' }}
                >
                    {user.username}, you've completed all of Level 2!
                </motion.p>

                {/* Achievement Badge */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring' }}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(236, 72, 153, 0.2))',
                        border: '2px solid rgba(245, 158, 11, 0.5)',
                        padding: '1rem 2rem',
                        borderRadius: '9999px',
                        marginBottom: '2rem'
                    }}
                >
                    <Award size={24} className="text-amber-400" />
                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>LEVEL 2 COMPLETE!</span>
                    <Award size={24} className="text-pink-400" />
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '1.5rem',
                        marginBottom: '2rem'
                    }}
                >
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24' }}>18</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Lessons</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ec4899' }}>{TOTAL_LEVEL2_XP}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>XP Earned</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>🎮</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Games Built</div>
                    </div>
                </motion.div>

                {/* Skills Unlocked */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    style={{
                        background: 'var(--surface)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 'var(--radius)',
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        textAlign: 'left'
                    }}
                >
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Star size={20} className="text-amber-400" /> Skills Mastered:
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                        {[
                            'if/else Statements',
                            'Comparison Operators',
                            'elif Chains',
                            'and/or/not Logic',
                            '+= -= Operators',
                            'while Loops',
                            'for Loops & range()',
                            'break & continue',
                            'Rock, Paper, Scissors!'
                        ].map((skill, idx) => (
                            <motion.div
                                key={skill}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.9 + idx * 0.1 }}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <Check size={16} className="text-emerald-400" />
                                <span style={{ fontSize: '0.9rem' }}>{skill}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* What's Next */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: 'var(--radius)',
                        padding: '1.5rem',
                        marginBottom: '2rem'
                    }}
                >
                    <h3 style={{ marginBottom: '0.75rem' }}>🚀 What's Next?</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        Level 3 is coming soon! You'll learn about objects, classes, file handling, and building even bigger projects. Keep practicing what you've learned!
                    </p>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.7 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}
                >
                    <Link href="/level2" className="btn btn-secondary" style={{ padding: '1rem 2rem' }}>
                        <Zap size={18} /> Review Level 2
                    </Link>
                    <Link href="/" className="btn btn-primary" style={{ padding: '1rem 2rem', background: 'linear-gradient(135deg, #f59e0b, #ec4899)' }}>
                        <Home size={18} /> Back to Home
                    </Link>
                </motion.div>

                {/* Share message */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}
                >
                    Share your achievement with friends! You're officially a Game Developer! 🎮
                </motion.p>
            </motion.div>
        </div>
    );
}
