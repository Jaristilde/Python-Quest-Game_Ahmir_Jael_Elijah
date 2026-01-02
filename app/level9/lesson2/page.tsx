'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL9_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL9_LESSONS[1];
const LESSON_ID = 110;

export default function Lesson2() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# Your First API Request!
# In real Python, we'd use: import requests

# Let's simulate an API call to a joke service!
def get_joke_from_api():
    """This simulates what an API would return"""
    jokes = [
        {"setup": "Why do programmers prefer dark mode?", "punchline": "Because light attracts bugs!"},
        {"setup": "Why was the computer cold?", "punchline": "It left its Windows open!"},
        {"setup": "What do you call a snake that builds?", "punchline": "A Python constructor!"}
    ]
    import random
    return random.choice(jokes)

# Make the "API request"
response = get_joke_from_api()

# Print what we got back!
print("Got a joke from the API!")
print("Setup:", response["setup"])
print("Punchline:", response["punchline"])
`);
    const [output, setOutput] = useState('');
    const [hasFetched, setHasFetched] = useState(false);
    const [hasPrinted, setHasPrinted] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        let outputLines: string[] = [];
        const jokes = [
            { setup: "Why do programmers prefer dark mode?", punchline: "Because light attracts bugs!" },
            { setup: "Why was the computer cold?", punchline: "It left its Windows open!" },
            { setup: "What do you call a snake that builds?", punchline: "A Python constructor!" }
        ];
        const joke = jokes[Math.floor(Math.random() * jokes.length)];

        if (code.includes('get_joke_from_api')) {
            setHasFetched(true);
            outputLines.push('Got a joke from the API!');
        }
        if (code.includes('response["setup"]') || code.includes("response['setup']")) {
            setHasPrinted(true);
            outputLines.push(`Setup: ${joke.setup}`);
            outputLines.push(`Punchline: ${joke.punchline}`);
        }

        if (hasFetched && hasPrinted && !lessonComplete) {
            setTimeout(() => {
                addXpAndCoins(LESSON.xpReward, 5);
                completeLevel(LESSON_ID, LESSON.xpReward, 5, 1, 60);
                setLessonComplete(true);
            }, 1000);
        }

        setOutput(outputLines.join('\n') || 'Call the API and print the response!');
    };

    if (isLoading || !user) return <div className={styles.container}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>📡</motion.div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #FF79C6, #8BE9FD)' }}>📡</motion.div>
                <motion.h2 className={styles.successTitle} style={{ color: '#FF79C6' }}>First Request Made!</motion.h2>
                <motion.p className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div className={styles.successXp}><Zap size={20} /> +{LESSON.xpReward} XP</motion.div>
                <Link href="/level9/lesson3" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #FF79C6, #8BE9FD)' }}>Next Lesson <ChevronRight size={18} /></Link>
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
                    <motion.div className={styles.lessonEmoji} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #FF79C6, #8BE9FD)' }}>{LESSON.emoji}</motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1 style={{ color: '#FF79C6' }}>{LESSON.title}</h1>
                        <p>Learn <code style={{ color: '#8BE9FD' }}>{LESSON.concept}</code></p>
                    </div>
                </div>

                <motion.div className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(255, 121, 198, 0.15), rgba(139, 233, 253, 0.15))', borderColor: '#FF79C6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Lightbulb size={24} style={{ color: '#FF79C6' }} />
                        <span style={{ fontWeight: 700, color: '#FF79C6' }}>Making Requests!</span>
                    </div>
                    <p>In real Python, we use the <code style={{ color: '#8BE9FD' }}>requests</code> library:</p>
                    <pre style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '0.5rem', marginTop: '0.5rem', fontSize: '0.9rem' }}>
{`import requests
response = requests.get("https://api.jokes.com")
data = response.json()`}
                    </pre>
                    <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>We'll simulate this since we're in a browser!</p>
                </motion.div>

                <div className={styles.codeSection}>
                    <h3 style={{ color: '#8BE9FD' }}>Fetch a Joke from the "API"!</h3>
                    <div className={styles.editor} style={{ borderColor: '#FF79C6' }}>
                        <div className={styles.codeHeader}><span>api_request.py</span><span>Python</span></div>
                        <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '380px' }} />
                    </div>
                    <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #FF79C6, #8BE9FD)' }}><Play size={18} /> Fetch Joke!</button>
                    {output && <motion.div className={styles.outputBox}><div className={styles.outputLabel}>Response:</div><div className={styles.outputText}>{output}</div></motion.div>}
                </div>

                <div className={styles.challenges} style={{ borderColor: '#FF79C6' }}>
                    <h3 style={{ color: '#FF79C6' }}>Goals:</h3>
                    <ul className={styles.challengeList}>
                        <li><div className={`${styles.challengeCheck} ${hasFetched ? styles.done : ''}`}>{hasFetched && <Check size={14} />}</div>Call the joke API</li>
                        <li><div className={`${styles.challengeCheck} ${hasPrinted ? styles.done : ''}`}>{hasPrinted && <Check size={14} />}</div>Print the setup and punchline</li>
                    </ul>
                </div>

                <div className={styles.navBar}>
                    <Link href="/level9/lesson1" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                    <span style={{ color: 'var(--text-muted)' }}>Complete goals!</span>
                </div>
            </div>
        </div>
    );
}
