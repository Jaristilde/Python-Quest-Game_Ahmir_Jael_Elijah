'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Sparkles, Target } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL9_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL9_LESSONS[3];
const LESSON_ID = 112;

const CHALLENGES = [
    { id: 1, title: 'Create a get_weather function', test: (code: string) => code.includes('def get_weather') },
    { id: 2, title: 'Return weather data with temp and condition', test: (code: string) => code.includes('"temp"') && code.includes('"condition"') },
    { id: 3, title: 'Call the function and store result', test: (code: string) => code.includes('= get_weather(') },
    { id: 4, title: 'Print the temperature', test: (code: string) => code.includes('["temp"]') },
    { id: 5, title: 'Print the condition', test: (code: string) => code.includes('["condition"]') },
];

export default function Lesson4() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# API Practice + SUPERCHARGE!

# Challenge 1 & 2: Create a weather API simulator
def get_weather(city):
    """Simulates fetching weather from an API"""
    weather_data = {
        "Paris": {"temp": 72, "condition": "Sunny", "humidity": 45},
        "Tokyo": {"temp": 68, "condition": "Cloudy", "humidity": 60},
        "London": {"temp": 55, "condition": "Rainy", "humidity": 80}
    }
    return weather_data.get(city, {"temp": 70, "condition": "Unknown"})

# Challenge 3: Call the function
weather = get_weather("Paris")

# Challenge 4 & 5: Print the data
print("Temperature:", weather["temp"], "°F")
print("Condition:", weather["condition"])

# SUPERCHARGE: Try another city!
tokyo_weather = get_weather("Tokyo")
print("\\nTokyo Temperature:", tokyo_weather["temp"], "°F")
print("Tokyo Condition:", tokyo_weather["condition"])
`);
    const [output, setOutput] = useState('');
    const [completed, setCompleted] = useState<number[]>([]);
    const [lessonComplete, setLessonComplete] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        const newCompleted: number[] = [];
        let outputLines: string[] = [];

        CHALLENGES.forEach(challenge => {
            if (challenge.test(code)) {
                newCompleted.push(challenge.id);
            }
        });

        setCompleted(newCompleted);

        if (code.includes('get_weather(')) {
            outputLines.push('Temperature: 72 °F');
            outputLines.push('Condition: Sunny');
        }
        if (code.includes('tokyo_weather') || code.includes('Tokyo')) {
            outputLines.push('');
            outputLines.push('Tokyo Temperature: 68 °F');
            outputLines.push('Tokyo Condition: Cloudy');
        }

        if (newCompleted.length >= 5 && !lessonComplete) {
            outputLines.push('');
            outputLines.push('All challenges complete!');
            setTimeout(() => {
                addXpAndCoins(LESSON.xpReward, 10);
                completeLevel(LESSON_ID, LESSON.xpReward, 10, 1, 120);
                setLessonComplete(true);
            }, 1000);
        }

        setOutput(outputLines.join('\n') || 'Complete all 5 challenges!');
    };

    if (isLoading || !user) return <div className={styles.container}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🎯</motion.div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #FF79C6, #50FA7B)' }}>🎯</motion.div>
                <motion.h2 className={styles.successTitle} style={{ color: '#FF79C6' }}>Practice Complete!</motion.h2>
                <motion.p className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div className={styles.successXp}><Zap size={20} /> +{LESSON.xpReward} XP</motion.div>
                <Link href="/level9/lesson5" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #FF79C6, #8BE9FD)' }}>Next Lesson <ChevronRight size={18} /></Link>
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
                    <motion.div className={styles.lessonEmoji} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #FF79C6, #50FA7B)' }}>{LESSON.emoji}</motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1 style={{ color: '#FF79C6' }}>{LESSON.title}</h1>
                        <p><Sparkles size={16} style={{ color: '#50FA7B' }} /> Practice + Supercharge!</p>
                    </div>
                </div>

                <motion.div className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(255, 121, 198, 0.15), rgba(80, 250, 123, 0.15))', borderColor: '#50FA7B' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Target size={24} style={{ color: '#FF79C6' }} />
                        <span style={{ fontWeight: 700, color: '#FF79C6' }}>5 Challenges!</span>
                    </div>
                    <p>Practice everything you've learned about APIs and JSON!</p>
                </motion.div>

                <div className={styles.challenges} style={{ borderColor: '#50FA7B', marginBottom: '1.5rem' }}>
                    <h3 style={{ color: '#FF79C6' }}>Challenges:</h3>
                    <ul className={styles.challengeList}>
                        {CHALLENGES.map(challenge => (
                            <li key={challenge.id}>
                                <div className={`${styles.challengeCheck} ${completed.includes(challenge.id) ? styles.done : ''}`}>
                                    {completed.includes(challenge.id) && <Check size={14} />}
                                </div>
                                {challenge.title}
                            </li>
                        ))}
                    </ul>
                    <div style={{ marginTop: '1rem', textAlign: 'center', color: completed.length >= 5 ? '#50FA7B' : 'var(--text-muted)' }}>
                        {completed.length}/5 Complete
                    </div>
                </div>

                <div className={styles.codeSection}>
                    <h3 style={{ color: '#8BE9FD' }}>Your Code:</h3>
                    <div className={styles.editor} style={{ borderColor: '#FF79C6' }}>
                        <div className={styles.codeHeader}><span>api_practice.py</span><span>Python</span></div>
                        <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '420px' }} />
                    </div>
                    <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #FF79C6, #50FA7B)' }}><Play size={18} /> Run & Check</button>
                    {output && <motion.div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></motion.div>}
                </div>

                <div className={styles.navBar}>
                    <Link href="/level9/lesson3" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                    <span style={{ color: 'var(--text-muted)' }}>Complete all 5!</span>
                </div>
            </div>
        </div>
    );
}
