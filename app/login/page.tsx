'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogIn, ArrowLeft, AlertCircle, Bot } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import styles from './login.module.css';

export default function LoginPage() {
    const router = useRouter();
    const { login, user } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const result = login(username, password);

        if (result.success) {
            router.push('/');
        } else {
            setError(result.error || 'Something went wrong');
        }
    };

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
                    <p className={styles.subtitle}>Robo-1 missed you! 🤖</p>
                </div>

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
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-full text-lg py-4">
                        <LogIn size={20} /> Log In
                    </button>
                </form>

                <p className={styles.signupLink}>
                    Don't have an account? <Link href="/signup">Sign Up</Link>
                </p>
            </div>
        </div>
    );
}
