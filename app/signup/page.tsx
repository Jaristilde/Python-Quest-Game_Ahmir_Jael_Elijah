'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, ArrowLeft, Check, AlertCircle, PartyPopper, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { AVATARS, MAX_USERS, getUserCount, validatePassword, getAuthErrorMessage, KidFriendlyAuthError } from '../lib/auth';
import styles from './signup.module.css';

export default function SignupPage() {
    const router = useRouter();
    const { signup, user } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState('robot');
    const [error, setError] = useState<KidFriendlyAuthError | null>(null);
    const [passwordSuggestions, setPasswordSuggestions] = useState<string[]>([]);
    const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
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

    const handlePasswordChange = (value: string) => {
        setPassword(value);
        if (value.length > 0) {
            const validation = validatePassword(value);
            setPasswordStrength(validation.strength);
            setPasswordSuggestions(validation.suggestions || []);
        } else {
            setPasswordStrength('weak');
            setPasswordSuggestions([]);
        }
    };

    const getStrengthColor = () => {
        switch (passwordStrength) {
            case 'strong': return '#50FA7B';
            case 'medium': return '#FFB86C';
            default: return '#FF5555';
        }
    };

    const getStrengthWidth = () => {
        switch (passwordStrength) {
            case 'strong': return '100%';
            case 'medium': return '66%';
            default: return '33%';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validate password first
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            const friendlyError = getAuthErrorMessage('PASSWORD_WEAK');
            setError(friendlyError);
            setPasswordSuggestions(passwordValidation.suggestions || []);
            return;
        }

        const result = signup(username, password, selectedAvatar);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                router.push('/');
            }, 2500);
        } else {
            // Map error messages to error codes
            let errorCode = 'UNKNOWN';
            if (result.error?.includes('already taken')) {
                errorCode = 'USERNAME_EXISTS';
            } else if (result.error?.includes('All spots')) {
                errorCode = 'ALL_SPOTS_TAKEN';
            } else if (result.error?.includes('at least 2')) {
                errorCode = 'USERNAME_TOO_SHORT';
            }

            const friendlyError = getAuthErrorMessage(errorCode);
            setError(friendlyError);
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
                        {/* Kid-Friendly Error Display */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    backgroundColor: 'rgba(255, 85, 85, 0.1)',
                                    border: '1px solid #FF5555',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    marginBottom: '16px'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                    <AlertCircle size={20} style={{ color: '#FF79C6', flexShrink: 0, marginTop: '2px' }} />
                                    <div>
                                        <h4 style={{ color: '#FF79C6', margin: '0 0 4px 0', fontSize: '1rem' }}>
                                            {error.title}
                                        </h4>
                                        <p style={{ color: '#F8F8F2', margin: '0 0 4px 0', fontSize: '0.9rem' }}>
                                            {error.message}
                                        </p>
                                        <p style={{ color: '#8BE9FD', margin: 0, fontSize: '0.85rem' }}>
                                            {error.action}
                                        </p>

                                        {/* Password suggestions */}
                                        {passwordSuggestions.length > 0 && (
                                            <ul style={{
                                                marginTop: '8px',
                                                paddingLeft: '16px',
                                                color: '#FFB86C',
                                                fontSize: '0.85rem'
                                            }}>
                                                {passwordSuggestions.map((suggestion, i) => (
                                                    <li key={i} style={{ marginBottom: '2px' }}>{suggestion}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
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
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => handlePasswordChange(e.target.value)}
                                    placeholder="At least 6 characters"
                                    minLength={6}
                                    required
                                    style={{ paddingRight: '40px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: '#6272A4',
                                        cursor: 'pointer',
                                        padding: '4px'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {password && (
                                <div style={{ marginTop: '8px' }}>
                                    <div style={{
                                        height: '4px',
                                        backgroundColor: '#44475A',
                                        borderRadius: '2px',
                                        overflow: 'hidden'
                                    }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: getStrengthWidth() }}
                                            style={{
                                                height: '100%',
                                                backgroundColor: getStrengthColor(),
                                                borderRadius: '2px'
                                            }}
                                        />
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginTop: '4px',
                                        fontSize: '0.75rem'
                                    }}>
                                        <span style={{ color: getStrengthColor() }}>
                                            {passwordStrength === 'strong' ? 'Strong password!' :
                                             passwordStrength === 'medium' ? 'Getting better...' : 'Too weak'}
                                        </span>
                                    </div>

                                    {/* Live suggestions */}
                                    {passwordSuggestions.length > 0 && !error && (
                                        <ul style={{
                                            marginTop: '8px',
                                            paddingLeft: '16px',
                                            color: '#6272A4',
                                            fontSize: '0.8rem'
                                        }}>
                                            {passwordSuggestions.map((suggestion, i) => (
                                                <li key={i} style={{ marginBottom: '2px' }}>{suggestion}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            <span className={styles.hint}>Use letters, numbers, and symbols for a strong password!</span>
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
