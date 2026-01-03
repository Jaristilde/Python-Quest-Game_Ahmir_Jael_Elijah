'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function UnlockPage() {
    const router = useRouter();
    const { user, isLoading, refreshUser } = useAuth();
    const [unlocked, setUnlocked] = useState(false);
    const [debugInfo, setDebugInfo] = useState('');

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    const handleUnlock = () => {
        try {
            // Get current data from localStorage
            const storageKey = 'python_quest_data';
            const stored = localStorage.getItem(storageKey);

            if (!stored) {
                setDebugInfo('Error: No user data found in localStorage');
                return;
            }

            const data = JSON.parse(stored);
            const currentUserId = data.currentUser;

            if (!currentUserId) {
                setDebugInfo('Error: No current user logged in');
                return;
            }

            const userIndex = data.users.findIndex((u: any) => u.id === currentUserId);

            if (userIndex === -1) {
                setDebugInfo('Error: User not found');
                return;
            }

            // All lesson IDs to unlock (1-115 covers all 9 levels)
            const allLessonIds = Array.from({ length: 115 }, (_, i) => i + 1);

            // Clear and rebuild completedLevels
            data.users[userIndex].progress.completedLevels = allLessonIds.map(level => ({
                level,
                completedAt: new Date().toISOString(),
                xpEarned: 10,
                coinsEarned: 5,
                attempts: 1,
                timeSpent: 60
            }));

            // Update other progress
            data.users[userIndex].progress.currentLevel = 116;
            data.users[userIndex].progress.xp = Math.max(data.users[userIndex].progress.xp, 2000);
            data.users[userIndex].progress.coins = Math.max(data.users[userIndex].progress.coins, 1000);

            // Save back to localStorage
            localStorage.setItem(storageKey, JSON.stringify(data));

            // Refresh the user context
            refreshUser();

            setDebugInfo(`Success! Unlocked ${allLessonIds.length} lessons for user: ${data.users[userIndex].username}`);
            setUnlocked(true);

        } catch (error) {
            setDebugInfo(`Error: ${error}`);
        }
    };

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', background: '#1E1E2E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                Loading...
            </div>
        );
    }

    if (!user) {
        return (
            <div style={{ minHeight: '100vh', background: '#1E1E2E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔐</div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Please Login First</h1>
                    <button
                        onClick={() => router.push('/login')}
                        style={{
                            padding: '1rem 2rem',
                            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#1E1E2E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '2rem' }}>
            <div style={{ textAlign: 'center', maxWidth: '500px' }}>
                <motion.div
                    style={{ fontSize: '4rem', marginBottom: '1rem' }}
                    animate={unlocked ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                    transition={{ duration: 0.5 }}
                >
                    {unlocked ? '🎉' : '🔓'}
                </motion.div>

                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {unlocked ? 'All Levels Unlocked!' : 'Unlock All Levels'}
                </h1>

                <p style={{ color: '#888', marginBottom: '0.5rem' }}>
                    Logged in as: <strong style={{ color: '#a855f7' }}>{user.username}</strong>
                </p>

                <p style={{ color: '#888', marginBottom: '2rem' }}>
                    {unlocked
                        ? 'You now have access to all 9 levels including the final level!'
                        : 'This will unlock all 9 levels (115 lessons) for testing purposes.'}
                </p>

                {/* Current Status */}
                <div style={{
                    background: 'rgba(168, 85, 247, 0.1)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    textAlign: 'left'
                }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: '#a855f7' }}>Current Progress:</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#aaa' }}>
                        Lessons completed: {user.progress.completedLevels.length} / 115
                    </p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#aaa' }}>
                        XP: {user.progress.xp} | Coins: {user.progress.coins}
                    </p>
                </div>

                {!unlocked ? (
                    <button
                        onClick={handleUnlock}
                        style={{
                            padding: '1rem 2rem',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            marginBottom: '1rem',
                            width: '100%'
                        }}
                    >
                        🔓 Unlock All 9 Levels
                    </button>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button
                            onClick={() => router.push('/level9')}
                            style={{
                                padding: '1rem 2rem',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #FF79C6, #8BE9FD)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer'
                            }}
                        >
                            🌐 Go to Level 9 (Final Level!)
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'rgba(255,255,255,0.1)',
                                color: '#fff',
                                border: '1px solid #444',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            🏠 Go to Home
                        </button>
                    </div>
                )}

                {/* Debug Info */}
                {debugInfo && (
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: debugInfo.includes('Error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        border: `1px solid ${debugInfo.includes('Error') ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                        borderRadius: '8px',
                        textAlign: 'left',
                        fontSize: '0.85rem',
                        color: debugInfo.includes('Error') ? '#ef4444' : '#10b981'
                    }}>
                        {debugInfo}
                    </div>
                )}

                {!unlocked && (
                    <div style={{ marginTop: '2rem' }}>
                        <button
                            onClick={() => router.push('/')}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'transparent',
                                color: '#888',
                                border: '1px solid #444',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            Back to Home
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
