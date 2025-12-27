'use client';

import { motion } from 'framer-motion';
import { Home, ArrowLeft, AlertTriangle, Compass } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--background)',
            color: 'var(--text)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center'
        }}>
            {/* Animated Robot */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    animate={{
                        rotate: [-5, 5, -5],
                        y: [0, -10, 0]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{ fontSize: '6rem', marginBottom: '1rem' }}
                >
                    🤖
                </motion.div>
            </motion.div>

            {/* Error Message */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: 900,
                    marginBottom: '0.5rem',
                    background: 'linear-gradient(135deg, #ef4444, #f97316)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Oops! 404
                </h1>

                <p style={{
                    fontSize: '1.25rem',
                    color: 'var(--text-muted)',
                    marginBottom: '1rem',
                    maxWidth: '400px'
                }}>
                    Robo-1 got lost! This page doesn't exist.
                </p>

                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring' }}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '9999px',
                        marginBottom: '2rem',
                        color: '#f87171'
                    }}
                >
                    <Compass size={18} />
                    <span style={{ fontWeight: 600 }}>Page not found</span>
                </motion.div>
            </motion.div>

            {/* Suggestions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                    background: 'var(--surface)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 'var(--radius)',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    maxWidth: '400px'
                }}
            >
                <h3 style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                    fontSize: '1rem'
                }}>
                    <AlertTriangle size={18} className="text-amber-400" /> What happened?
                </h3>
                <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    textAlign: 'left',
                    fontSize: '0.95rem',
                    color: 'var(--text-muted)'
                }}>
                    <li style={{ marginBottom: '0.5rem' }}>
                        - The page might have been moved
                    </li>
                    <li style={{ marginBottom: '0.5rem' }}>
                        - The URL might be typed wrong
                    </li>
                    <li>
                        - This level might not exist yet!
                    </li>
                </ul>
            </motion.div>

            {/* Navigation Options */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    alignItems: 'center'
                }}
            >
                <Link
                    href="/"
                    className="btn btn-primary"
                    style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
                >
                    <Home size={20} /> Go Home
                </Link>
                <Link
                    href="/level1"
                    className="btn btn-secondary"
                    style={{ padding: '0.875rem 1.5rem' }}
                >
                    <ArrowLeft size={18} /> Back to Level 1
                </Link>
            </motion.div>

            {/* Fun Message */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                style={{
                    marginTop: '2rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)'
                }}
            >
                Don't worry - even the best coders get lost sometimes!
            </motion.p>
        </div>
    );
}
