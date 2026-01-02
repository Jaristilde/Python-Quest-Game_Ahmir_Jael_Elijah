'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { unlockAllLevels } from '../lib/auth';

export default function UnlockPage() {
    const router = useRouter();
    const { user, isLoading, refreshUser } = useAuth();
    const [unlocked, setUnlocked] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    const handleUnlock = () => {
        unlockAllLevels();
        refreshUser();
        setUnlocked(true);
    };

    if (isLoading || !user) {
        return (
            <div style={{ minHeight: '100vh', background: '#1E1E2E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                Loading...
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#1E1E2E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '2rem' }}>
            <div style={{ textAlign: 'center', maxWidth: '400px' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                    {unlocked ? '🎉' : '🔓'}
                </div>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                    {unlocked ? 'All Levels Unlocked!' : 'Unlock All Levels'}
                </h1>
                <p style={{ color: '#888', marginBottom: '2rem' }}>
                    {unlocked
                        ? 'You now have access to all 9 levels including the final level!'
                        : 'This will unlock all 9 levels for testing purposes.'}
                </p>

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
                            marginBottom: '1rem'
                        }}
                    >
                        Unlock All Levels
                    </button>
                ) : (
                    <button
                        onClick={() => router.push('/level9')}
                        style={{
                            padding: '1rem 2rem',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            marginBottom: '1rem'
                        }}
                    >
                        Go to Level 9 (Final Level!)
                    </button>
                )}

                <div>
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
            </div>
        </div>
    );
}
