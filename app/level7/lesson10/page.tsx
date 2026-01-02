'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL7_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL7_LESSONS[9];
const LESSON_ID = 94;

export default function Lesson10() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# Advanced String & List Practice!

# Challenge 1: List comprehension with strings
words = ["hello", "world", "python"]
upper_words = [w.upper() for w in words]
print(upper_words)

# Challenge 2: Filter words by length
long_words = [w for w in words if len(w) > 4]
print(long_words)

# Challenge 3: Slice and reverse
text = "Programming"
reversed_text = text[::-1]
print(reversed_text)

# Challenge 4: Split and transform
sentence = "I love Python programming"
words_list = sentence.split()
first_letters = [w[0] for w in words_list]
print(first_letters)

# Challenge 5: Join with custom separator
result = "-".join(first_letters)
print(result)
`);
    const [output, setOutput] = useState('');
    const [challengesComplete, setChallengesComplete] = useState<boolean[]>([false, false, false, false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [supercharged, setSupercharged] = useState(false);

    const challenges = [
        { id: 1, title: "List comprehension with strings", check: (code: string) => /\[w\.upper\(\) for w in/.test(code) },
        { id: 2, title: "Filter by length", check: (code: string) => /if len\(w\)/.test(code) },
        { id: 3, title: "Reverse with [::-1]", check: (code: string) => /\[::-1\]/.test(code) },
        { id: 4, title: "Split and get first letters", check: (code: string) => /\.split\(\)/.test(code) && /w\[0\]/.test(code) },
        { id: 5, title: "Join the result", check: (code: string) => /\.join\(/.test(code) },
    ];

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            let outputLines: string[] = [];

            if (code.includes('[w.upper() for w in')) outputLines.push("['HELLO', 'WORLD', 'PYTHON']");
            if (code.includes('if len(w) > 4')) outputLines.push("['hello', 'world', 'python']");
            if (code.includes('[::-1]')) outputLines.push("gnimmargorP");
            if (code.includes('.split()') && code.includes('w[0]')) outputLines.push("['I', 'l', 'P', 'p']");
            if (code.includes('.join(')) outputLines.push("I-l-P-p");

            const newComplete = challenges.map(c => c.check(code));
            setChallengesComplete(newComplete);

            if (newComplete.every(c => c) && !lessonComplete) {
                setSupercharged(true);
                setTimeout(() => {
                    addXpAndCoins(LESSON.xpReward, 10);
                    completeLevel(LESSON_ID, LESSON.xpReward, 10, 1, 90);
                    setLessonComplete(true);
                }, 1500);
            }

            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code!');
        } catch { setOutput('Error!'); }
    };

    if (isLoading || !user) return <div className={styles.container}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🏋️</motion.div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}><Trophy size={50} /></motion.div>
                <motion.h2 className={styles.successTitle} style={{ color: '#f59e0b' }}>SUPERCHARGED! 🏋️</motion.h2>
                <motion.p className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div className={styles.successXp} style={{ background: 'rgba(245, 158, 11, 0.2)' }}><Zap size={20} /> +{LESSON.xpReward} XP (BONUS!)</motion.div>
                <Link href="/level7/lesson11" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>Next Lesson <ChevronRight size={18} /></Link>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            <header className={styles.header} style={{ borderBottom: '1px solid #f59e0b' }}>
                <Link href="/level7" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 12</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                <div className={styles.lessonTitle}>
                    <motion.div className={styles.lessonEmoji} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>{LESSON.emoji}</motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1 style={{ color: '#f59e0b' }}>{LESSON.title}</h1>
                        <p>Practice: <code style={{ color: '#ef4444' }}>{LESSON.concept}</code></p>
                    </div>
                </div>

                <motion.div style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.2))', border: '2px solid rgba(245, 158, 11, 0.4)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Sparkles size={24} style={{ color: '#f59e0b' }} />
                        <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#f59e0b' }}>SUPERCHARGE CHALLENGE!</span>
                        <Sparkles size={24} style={{ color: '#f59e0b' }} />
                    </div>
                    <p style={{ color: 'var(--text-muted)' }}>Complete all 5 challenges for BONUS XP!</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                        {challengesComplete.map((done, idx) => (
                            <motion.div key={idx} animate={done ? { scale: [1, 1.2, 1] } : {}} style={{ width: '40px', height: '40px', borderRadius: '50%', background: done ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                                {done ? <Check size={20} /> : idx + 1}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <div className={styles.challenges} style={{ borderColor: '#f59e0b' }}>
                    <h3 style={{ color: '#f59e0b' }}>Complete These Challenges:</h3>
                    <ul className={styles.challengeList}>
                        {challenges.map((c, idx) => (
                            <li key={idx}>
                                <div className={`${styles.challengeCheck} ${challengesComplete[idx] ? styles.done : ''}`} style={challengesComplete[idx] ? { background: '#f59e0b' } : {}}>
                                    {challengesComplete[idx] && <Check size={14} />}
                                </div>
                                {c.title}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className={styles.codeSection}>
                    <h3 style={{ color: '#f59e0b' }}>Your Code:</h3>
                    <div className={styles.editor} style={{ borderColor: '#f59e0b' }}>
                        <div className={styles.codeHeader}><span>practice.py</span><span>Python</span></div>
                        <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '400px' }} />
                    </div>
                    <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}><Play size={18} /> Run & Check</button>
                    {output && <motion.div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></motion.div>}
                </div>

                {supercharged && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                        <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: 2 }} style={{ fontSize: '6rem' }}>⚡</motion.div>
                        <motion.h2 style={{ color: '#f59e0b', fontSize: '2.5rem', fontWeight: 800 }}>SUPERCHARGED!</motion.h2>
                    </motion.div>
                )}

                <div className={styles.navBar}>
                    <Link href="/level7/lesson9" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                    <span style={{ color: 'var(--text-muted)' }}>Complete all challenges!</span>
                </div>
            </div>
        </div>
    );
}
