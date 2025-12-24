'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Coins, Zap, Trophy, Clock, Star, Check, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, getAvatarEmoji } from '../context/AuthContext';
import { AVATARS } from '../lib/auth';
import styles from './profile.module.css';

export default function ProfilePage() {
    const router = useRouter();
    const { user, isLoading, updateAvatar } = useAuth();
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading...</div>
            </div>
        );
    }

    const totalLevels = 14;
    const completedCount = user.progress.completedLevels.length;
    const progressPercent = Math.round((completedCount / totalLevels) * 100);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/" className={styles.backLink}>
                    <ArrowLeft size={18} /> Back to Home
                </Link>
            </header>

            <div className={styles.content}>
                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.profileCard}
                >
                    <div className={styles.avatarSection}>
                        <div className={styles.avatarLarge}>
                            {getAvatarEmoji(user.avatar)}
                        </div>
                        <button
                            className={styles.editAvatarBtn}
                            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                        >
                            <Edit2 size={14} /> Change Avatar
                        </button>

                        {showAvatarPicker && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={styles.avatarPicker}
                            >
                                {AVATARS.map((avatar) => (
                                    <button
                                        key={avatar.id}
                                        onClick={() => {
                                            updateAvatar(avatar.id);
                                            setShowAvatarPicker(false);
                                        }}
                                        className={`${styles.avatarOption} ${user.avatar === avatar.id ? styles.avatarActive : ''}`}
                                    >
                                        {avatar.emoji}
                                        {user.avatar === avatar.id && <Check size={12} className={styles.checkIcon} />}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </div>

                    <h1 className={styles.username}>{user.username}</h1>
                    <p className={styles.joinDate}>Joined {formatDate(user.createdAt)}</p>

                    {/* Stats Grid */}
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <Heart size={24} className="text-red-400" fill="currentColor" />
                            <div className={styles.statValue}>{user.progress.lives}</div>
                            <div className={styles.statLabel}>Lives</div>
                        </div>
                        <div className={styles.statCard}>
                            <Coins size={24} className="text-amber-400" />
                            <div className={styles.statValue}>{user.progress.coins}</div>
                            <div className={styles.statLabel}>Coins</div>
                        </div>
                        <div className={styles.statCard}>
                            <Zap size={24} className="text-purple-400" fill="currentColor" />
                            <div className={styles.statValue}>{user.progress.xp}</div>
                            <div className={styles.statLabel}>XP</div>
                        </div>
                        <div className={styles.statCard}>
                            <Trophy size={24} className="text-indigo-400" />
                            <div className={styles.statValue}>Lv. {user.progress.currentLevel}</div>
                            <div className={styles.statLabel}>Current</div>
                        </div>
                    </div>
                </motion.div>

                {/* Progress Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={styles.progressSection}
                >
                    <h2 className={styles.sectionTitle}>
                        <Clock size={20} /> Overall Progress
                    </h2>

                    <div className={styles.progressBar}>
                        <motion.div
                            className={styles.progressFill}
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                        />
                    </div>
                    <div className={styles.progressText}>
                        {completedCount} / {totalLevels} levels completed ({progressPercent}%)
                    </div>

                    <div className={styles.timeStats}>
                        <div>
                            <span className="text-slate-400">Total Time Played:</span>
                            <span className="font-bold ml-2">{formatTime(user.progress.totalTimePlayed)}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Completed Levels */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={styles.levelsSection}
                >
                    <h2 className={styles.sectionTitle}>
                        <Star size={20} /> Completed Levels
                    </h2>

                    {user.progress.completedLevels.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>No levels completed yet. Start your first lesson!</p>
                            <Link href="/level1" className="btn btn-primary mt-4">
                                Start Level 1
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.levelsList}>
                            {user.progress.completedLevels.map((level) => (
                                <div key={level.level} className={styles.levelItem}>
                                    <div className={styles.levelBadge}>
                                        Level {level.level}
                                    </div>
                                    <div className={styles.levelDetails}>
                                        <div className={styles.levelStats}>
                                            <span><Zap size={14} /> {level.xpEarned} XP</span>
                                            <span><Coins size={14} /> {level.coinsEarned}</span>
                                            <span><Clock size={14} /> {formatTime(level.timeSpent)}</span>
                                        </div>
                                        <div className={styles.levelDate}>
                                            Completed {formatDate(level.completedAt)}
                                        </div>
                                    </div>
                                    <div className={styles.levelStars}>
                                        {[1, 2, 3].map((star) => (
                                            <Star
                                                key={star}
                                                size={18}
                                                className={level.attempts <= star ? 'text-amber-400' : 'text-slate-700'}
                                                fill={level.attempts <= star ? 'currentColor' : 'none'}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
