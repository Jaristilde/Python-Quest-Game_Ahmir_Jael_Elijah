'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogIn, ArrowLeft, AlertCircle, Bot, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { getAuthErrorMessage, KidFriendlyAuthError } from '../lib/auth';
import ForgotPassword from '../components/ForgotPassword';
import styles from './login.module.css';

export default function LoginPage() {
    const router = useRouter();
    const { login, user } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<KidFriendlyAuthError | null>(null);
    const [showForgotPasswordFlow, setShowForgotPasswordFlow] = useState(false);

    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const result = login(username, password);

        if (result.success) {
            router.push('/');
        } else {
            // Map error messages to error codes
            let errorCode = 'UNKNOWN';
            if (result.error?.includes("Can't find")) {
                errorCode = 'USERNAME_NOT_FOUND';
            } else if (result.error?.includes('Wrong password')) {
                errorCode = 'WRONG_PASSWORD';
            }

            const friendlyError = getAuthErrorMessage(errorCode);
            setError(friendlyError);
        }
    };

    const handleForgotPasswordSuccess = () => {
        setShowForgotPasswordFlow(false);
        setError(null);
        // Show success message
        alert('Password updated! You can now log in with your new password.');
    };

    if (showForgotPasswordFlow) {
        return (
            <div className={styles.container}>
                <ForgotPassword
                    onBack={() => setShowForgotPasswordFlow(false)}
                    onSuccess={handleForgotPasswordSuccess}
                />
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
                    <motion.div
                        className={styles.robotWrapper}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <Bot size={48} className="text-indigo-400" />
                    </motion.div>
                    <h1 className={styles.title}>Welcome Back!</h1>
                    <p className={styles.subtitle}>Robo-1 missed you!</p>
                </div>

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
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div className={styles.inputGroup}>
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
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
                    </div>

                    <button type="submit" className="btn btn-primary w-full text-lg py-4">
                        <LogIn size={20} /> Log In
                    </button>
                </form>

                {/* Forgot Password Link - Always visible */}
                <button
                    onClick={() => setShowForgotPasswordFlow(true)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#8BE9FD',
                        marginTop: '16px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        width: '100%',
                        textAlign: 'center'
                    }}
                >
                    Forgot your password?
                </button>

                <p className={styles.signupLink}>
                    Don't have an account? <Link href="/signup">Sign Up</Link>
                </p>
            </div>
        </div>
    );
}
