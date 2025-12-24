'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, ArrowLeft, Check, AlertCircle, PartyPopper } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { AVATARS, MAX_USERS, getUserCount } from '../lib/auth';
import styles from './signup.module.css';

export default function SignupPage() {
    const router = useRouter();
    const { signup, user } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('robot');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [spotsLeft, setSpotsLeft] = useState(MAX_USERS);

    useEffect(() => {
        setSpotsLeft(MAX_USERS - getUserCount());
    }, []);

    useEffect(() => {
        if (user && !success) {
            router.push('/');
        }
    }, [user, router, success]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const result = signup(username, password, selectedAvatar);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                router.push('/');
            }, 2500);
        } else {
            setError(result.error || 'Something went wrong');
        }
    };

    if (success) {
        return (
            <div className={styles.container}>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={styles.successContainer}
                >
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 10, 0] }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <PartyPopper size={80} className="text-amber-400" />
                    </motion.div>
                    <h1 className="text-3xl font-bold mt-6">Welcome to the Squad!</h1>
                    <p className="text-slate-400 mt-2">Get ready to become a coding master, {username}!</p>
                    <div className="text-6xl mt-6">
                        {AVATARS.find(a => a.id === selectedAvatar)?.emoji}
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.formCard}>
                <Link href="/" className={styles.backLink}>
                    <ArrowLeft size={18} /> Back to Home
                </Link>

                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <UserPlus size={32} />
                    </div>
                    <h1 className={styles.title}>Join the Quest!</h1>
                    <p className={styles.subtitle}>Create your coder profile</p>

                    <div className={`${styles.spotsCounter} ${spotsLeft <= 3 ? styles.spotsLow : ''}`}>
                        {spotsLeft > 0 ? (
                            <><span className="font-bold">{spotsLeft}</span> / {MAX_USERS} spots available</>
                        ) : (
                            <>All spots are taken!</>
                        )}
                    </div>
                </div>

                {spotsLeft === 0 ? (
                    <div className={styles.fullMessage}>
                        <AlertCircle size={48} className="text-amber-400 mb-4" />
                        <p>All spots are taken! Ask your teacher to add more.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={styles.error}
                            >
                                <AlertCircle size={18} /> {error}
                            </motion.div>
                        )}

                        <div className={styles.inputGroup}>
                            <label htmlFor="username">Pick a Username</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="e.g., CoderKid123"
                                maxLength={20}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="password">Create a Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="At least 4 characters"
                                minLength={4}
                                required
                            />
                            <span className={styles.hint}>Pick something you can remember!</span>
                        </div>

                        <div className={styles.avatarSection}>
                            <label>Choose Your Avatar</label>
                            <div className={styles.avatarGrid}>
                                {AVATARS.map((avatar) => (
                                    <button
                                        key={avatar.id}
                                        type="button"
                                        onClick={() => setSelectedAvatar(avatar.id)}
                                        className={`${styles.avatarButton} ${selectedAvatar === avatar.id ? styles.avatarSelected : ''}`}
                                    >
                                        <span className={styles.avatarEmoji}>{avatar.emoji}</span>
                                        <span className={styles.avatarName}>{avatar.name}</span>
                                        {selectedAvatar === avatar.id && (
                                            <div className={styles.avatarCheck}>
                                                <Check size={14} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary w-full text-lg py-4">
                            <UserPlus size={20} /> Create My Account
                        </button>
                    </form>
                )}

                <p className={styles.loginLink}>
                    Already have an account? <Link href="/login">Log In</Link>
                </p>
            </div>
        </div>
    );
}
