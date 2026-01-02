'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL9_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL9_LESSONS[5];
const LESSON_ID = 114;

export default function Lesson6() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# Error Handling - When Things Go Wrong!
# APIs don't always work - we need a backup plan!

def get_data_from_api(should_fail=False):
    """Simulates an API that might fail"""
    if should_fail:
        raise Exception("Oops! The server is sleeping!")
    return {"message": "Success!", "data": [1, 2, 3]}

# Without error handling - DANGEROUS!
# result = get_data_from_api(True)  # This would crash!

# With error handling - SAFE!
try:
    # Try to get data
    print("Asking the API for data...")
    result = get_data_from_api(should_fail=False)
    print("Got it!", result["message"])
except Exception as error:
    # If something goes wrong, handle it nicely
    print("Uh oh! Something went wrong:")
    print(str(error))
    print("Let's try again later!")

# Now try with a failing API
print("\\n--- Testing error handling ---")
try:
    result = get_data_from_api(should_fail=True)
    print("Success:", result)
except Exception as error:
    print("Caught the error!")
    print("Error message:", str(error))
    print("But our program didn't crash!")
`);
    const [output, setOutput] = useState('');
    const [hasTry, setHasTry] = useState(false);
    const [hasExcept, setHasExcept] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        let outputLines: string[] = [];

        if (code.includes('try:')) {
            setHasTry(true);
            outputLines.push('Asking the API for data...');
            outputLines.push('Got it! Success!');
        }
        if (code.includes('except')) {
            setHasExcept(true);
            outputLines.push('');
            outputLines.push('--- Testing error handling ---');
            outputLines.push('Caught the error!');
            outputLines.push('Error message: Oops! The server is sleeping!');
            outputLines.push("But our program didn't crash!");
        }

        if (hasTry && hasExcept && !lessonComplete) {
            setTimeout(() => {
                addXpAndCoins(LESSON.xpReward, 5);
                completeLevel(LESSON_ID, LESSON.xpReward, 5, 1, 60);
                setLessonComplete(true);
            }, 1000);
        }

        setOutput(outputLines.join('\n') || 'Add try/except to handle errors!');
    };

    if (isLoading || !user) return <div className={styles.container}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🛡️</motion.div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #FF79C6, #8BE9FD)' }}>🛡️</motion.div>
                <motion.h2 className={styles.successTitle} style={{ color: '#FF79C6' }}>Error Handler!</motion.h2>
                <motion.p className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div className={styles.successXp}><Zap size={20} /> +{LESSON.xpReward} XP</motion.div>
                <Link href="/level9/lesson7" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #FF79C6, #8BE9FD, #50FA7B)' }}>Final Project! <ChevronRight size={18} /></Link>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            <header className={styles.header} style={{ borderBottom: '1px solid #FF79C6' }}>
                <Link href="/level9" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 7</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                <div className={styles.lessonTitle}>
                    <motion.div className={styles.lessonEmoji} animate={{ y: [0, -8, 0] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #FF79C6, #8BE9FD)' }}>{LESSON.emoji}</motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1 style={{ color: '#FF79C6' }}>{LESSON.title}</h1>
                        <p>Learn <code style={{ color: '#8BE9FD' }}>{LESSON.concept}</code></p>
                    </div>
                </div>

                <motion.div className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(255, 121, 198, 0.15), rgba(139, 233, 253, 0.15))', borderColor: '#FF79C6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Shield size={24} style={{ color: '#FF79C6' }} />
                        <span style={{ fontWeight: 700, color: '#FF79C6' }}>Be Prepared for Problems!</span>
                    </div>
                    <p>APIs can fail! The internet might be slow, the server might be down...</p>
                    <p style={{ marginTop: '0.5rem' }}><strong style={{ color: '#8BE9FD' }}>try/except</strong> lets us handle errors gracefully!</p>
                </motion.div>

                <div className={styles.conceptBox} style={{ borderColor: '#8BE9FD' }}>
                    <h3 style={{ color: '#FF79C6', marginBottom: '1rem' }}>Error Handling Pattern:</h3>
                    <pre style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
{`try:
    # Try something risky
    data = get_data_from_api()
    print("It worked!", data)
except:
    # If it fails, do this instead
    print("Oops! Let's try again later.")`}
                    </pre>
                </div>

                <div className={styles.conceptBox} style={{ borderColor: '#50FA7B', marginTop: '1rem' }}>
                    <h3 style={{ color: '#50FA7B', marginBottom: '0.75rem' }}>Kid-Friendly Error Messages:</h3>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(80, 250, 123, 0.1)', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
                            ❌ "Error 500: Internal Server Error"
                        </div>
                        <div style={{ padding: '0.5rem', background: 'rgba(255, 121, 198, 0.1)', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
                            ✅ "Oops! The server is taking a nap. Try again soon!"
                        </div>
                    </div>
                </div>

                <div className={styles.codeSection}>
                    <h3 style={{ color: '#8BE9FD' }}>Practice Error Handling!</h3>
                    <div className={styles.editor} style={{ borderColor: '#FF79C6' }}>
                        <div className={styles.codeHeader}><span>error_handling.py</span><span>Python</span></div>
                        <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '450px' }} />
                    </div>
                    <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #FF79C6, #8BE9FD)' }}><Play size={18} /> Run Code</button>
                    {output && <motion.div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></motion.div>}
                </div>

                <div className={styles.challenges} style={{ borderColor: '#FF79C6' }}>
                    <h3 style={{ color: '#FF79C6' }}>Goals:</h3>
                    <ul className={styles.challengeList}>
                        <li><div className={`${styles.challengeCheck} ${hasTry ? styles.done : ''}`}>{hasTry && <Check size={14} />}</div>Use try: block</li>
                        <li><div className={`${styles.challengeCheck} ${hasExcept ? styles.done : ''}`}>{hasExcept && <Check size={14} />}</div>Use except: to catch errors</li>
                    </ul>
                </div>

                <div className={styles.navBar}>
                    <Link href="/level9/lesson5" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                    <span style={{ color: 'var(--text-muted)' }}>Complete goals!</span>
                </div>
            </div>
        </div>
    );
}
