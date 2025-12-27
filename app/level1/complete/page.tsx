'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Check, Star, Zap, Coins, Award, ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, getAvatarEmoji } from '../../context/AuthContext';
import { LEVEL1_LESSONS, TOTAL_LEVEL1_XP } from '../lessonData';
import styles from '../lessons.module.css';

export default function Level1Complete() {
    const router = useRouter();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return <div className={styles.container}><div className="flex items-center justify-center h-screen text-slate-400">Loading...</div></div>;
    }

    return (
        <div className={styles.container} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', maxWidth: '600px' }}
            >
                {/* Trophy */}
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                >
                    <div style={{
                        width: '120px',
                        height: '120px',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 2rem',
                        boxShadow: '0 0 60px rgba(245, 158, 11, 0.4)'
                    }}>
                        <Trophy size={60} className="text-white" />
                    </div>
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}
                >
                    🏆 AMAZING JOB! 🏆
                </motion.h1>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2rem' }}
                >
                    You finished Level 1, {user.username}!
                </motion.p>

                {/* What you learned */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    style={{
                        background: 'var(--surface)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: 'var(--radius)',
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        textAlign: 'left'
                    }}
                >
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Star size={20} className="text-amber-400" /> You Learned:
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                        {[
                            'print() - Make computer talk',
                            'Variables - Give things names',
                            'Math - Add, subtract, multiply',
                            'Comparisons - Ask yes/no',
                            'f-strings - Fill in blanks',
                            'if/else - Make choices',
                            'Lists - Remember many things',
                            'Loops - Repeat without retyping'
                        ].map((skill, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <Check size={16} className="text-green-400" /> {skill}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Rewards */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    style={{
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15))',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        borderRadius: 'var(--radius)',
                        padding: '1.5rem',
                        marginBottom: '2rem'
                    }}
                >
                    <h3 style={{ marginBottom: '1rem' }}>🎁 You Earned:</h3>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Zap size={24} className="text-purple-400" fill="currentColor" />
                            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{user.progress.xp}</span>
                            <span style={{ color: 'var(--text-muted)' }}>XP</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Coins size={24} className="text-amber-400" />
                            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{user.progress.coins}</span>
                            <span style={{ color: 'var(--text-muted)' }}>Coins</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Award size={24} className="text-pink-400" />
                            <span style={{ fontSize: '1rem', fontWeight: 700 }}>"Python Beginner" Badge</span>
                        </div>
                    </div>
                </motion.div>

                {/* User avatar */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: 'spring' }}
                    style={{ fontSize: '4rem', marginBottom: '2rem' }}
                >
                    {getAvatarEmoji(user.avatar)}
                </motion.div>

                {/* Level 2 Unlocked! */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.9, type: 'spring', stiffness: 200 }}
                    style={{
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2))',
                        border: '2px solid rgba(16, 185, 129, 0.5)',
                        borderRadius: 'var(--radius)',
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem'
                    }}
                >
                    <motion.span
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, repeat: 3 }}
                        style={{ fontSize: '2.5rem' }}
                    >
                        🔓
                    </motion.span>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>Level 2 Unlocked!</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You're ready for the Math Ninja adventure!</p>
                    </div>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}
                >
                    <Link
                        href="/level2"
                        className="btn btn-primary"
                        style={{
                            fontSize: '1.1rem',
                            padding: '1rem 2rem',
                            background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        🥷 Continue to Level 2: Math Ninja <ChevronRight size={20} />
                    </Link>
                    <Link href="/" className="btn btn-secondary" style={{ padding: '0.875rem 1.5rem' }}>
                        <Home size={18} /> Return to Home
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
