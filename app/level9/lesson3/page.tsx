'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL9_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL9_LESSONS[2];
const LESSON_ID = 111;

export default function Lesson3() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# Understanding JSON - The Labeled Lunchbox!

# JSON is like a lunchbox with labeled compartments
# Everything has a name (key) and content (value)

# Here's some JSON data about a game character:
character = {
    "name": "PyKnight",
    "level": 25,
    "health": 100,
    "items": ["sword", "shield", "potion"],
    "stats": {
        "strength": 15,
        "speed": 12
    }
}

# Access data using square brackets!
print("Character name:", character["name"])
print("Character level:", character["level"])

# Access items in a list
print("First item:", character["items"][0])

# Access nested data
print("Strength:", character["stats"]["strength"])
`);
    const [output, setOutput] = useState('');
    const [hasAccessed, setHasAccessed] = useState(false);
    const [hasNested, setHasNested] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        let outputLines: string[] = [];

        if (code.includes('character["name"]') || code.includes("character['name']")) {
            setHasAccessed(true);
            outputLines.push('Character name: PyKnight');
            outputLines.push('Character level: 25');
        }
        if (code.includes('character["items"]')) {
            outputLines.push('First item: sword');
        }
        if (code.includes('character["stats"]["strength"]') || code.includes("character['stats']['strength']")) {
            setHasNested(true);
            outputLines.push('Strength: 15');
        }

        if (hasAccessed && hasNested && !lessonComplete) {
            setTimeout(() => {
                addXpAndCoins(LESSON.xpReward, 5);
                completeLevel(LESSON_ID, LESSON.xpReward, 5, 1, 60);
                setLessonComplete(true);
            }, 1000);
        }

        setOutput(outputLines.join('\n') || 'Access the JSON data!');
    };

    if (isLoading || !user) return <div className={styles.container}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🍱</motion.div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #FF79C6, #8BE9FD)' }}>🍱</motion.div>
                <motion.h2 className={styles.successTitle} style={{ color: '#FF79C6' }}>JSON Master!</motion.h2>
                <motion.p className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div className={styles.successXp}><Zap size={20} /> +{LESSON.xpReward} XP</motion.div>
                <Link href="/level9/lesson4" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #FF79C6, #8BE9FD)' }}>Next Lesson <ChevronRight size={18} /></Link>
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
                    <motion.div className={styles.lessonEmoji} animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #FF79C6, #8BE9FD)' }}>{LESSON.emoji}</motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1 style={{ color: '#FF79C6' }}>{LESSON.title}</h1>
                        <p>Learn <code style={{ color: '#8BE9FD' }}>{LESSON.concept}</code></p>
                    </div>
                </div>

                <motion.div className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(255, 121, 198, 0.15), rgba(139, 233, 253, 0.15))', borderColor: '#FF79C6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Lightbulb size={24} style={{ color: '#FF79C6' }} />
                        <span style={{ fontWeight: 700, color: '#FF79C6' }}>JSON = Labeled Lunchbox!</span>
                    </div>
                    <p>JSON organizes data with <strong style={{ color: '#8BE9FD' }}>labels</strong> (keys) and <strong style={{ color: '#50FA7B' }}>content</strong> (values)!</p>
                    <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(139, 233, 253, 0.2)', borderRadius: '0.5rem', textAlign: 'center' }}>
                            <div style={{ fontWeight: 700, color: '#8BE9FD' }}>"name"</div>
                            <div style={{ fontSize: '0.8rem' }}>← Key (label)</div>
                        </div>
                        <div style={{ padding: '0.5rem', background: 'rgba(80, 250, 123, 0.2)', borderRadius: '0.5rem', textAlign: 'center' }}>
                            <div style={{ fontWeight: 700, color: '#50FA7B' }}>"PyKnight"</div>
                            <div style={{ fontSize: '0.8rem' }}>← Value (content)</div>
                        </div>
                    </div>
                </motion.div>

                <div className={styles.conceptBox} style={{ borderColor: '#8BE9FD' }}>
                    <h3 style={{ color: '#FF79C6', marginBottom: '1rem' }}>Accessing JSON Data:</h3>
                    <pre style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.95rem' }}>
{`data["name"]           # Get a value
data["items"][0]       # Get first item
data["stats"]["hp"]    # Get nested value`}
                    </pre>
                </div>

                <div className={styles.codeSection}>
                    <h3 style={{ color: '#8BE9FD' }}>Unpack the JSON Lunchbox!</h3>
                    <div className={styles.editor} style={{ borderColor: '#FF79C6' }}>
                        <div className={styles.codeHeader}><span>json_data.py</span><span>Python</span></div>
                        <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '400px' }} />
                    </div>
                    <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #FF79C6, #8BE9FD)' }}><Play size={18} /> Run Code</button>
                    {output && <motion.div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></motion.div>}
                </div>

                <div className={styles.challenges} style={{ borderColor: '#FF79C6' }}>
                    <h3 style={{ color: '#FF79C6' }}>Goals:</h3>
                    <ul className={styles.challengeList}>
                        <li><div className={`${styles.challengeCheck} ${hasAccessed ? styles.done : ''}`}>{hasAccessed && <Check size={14} />}</div>Access name and level</li>
                        <li><div className={`${styles.challengeCheck} ${hasNested ? styles.done : ''}`}>{hasNested && <Check size={14} />}</div>Access nested stats data</li>
                    </ul>
                </div>

                <div className={styles.navBar}>
                    <Link href="/level9/lesson2" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                    <span style={{ color: 'var(--text-muted)' }}>Complete goals!</span>
                </div>
            </div>
        </div>
    );
}
