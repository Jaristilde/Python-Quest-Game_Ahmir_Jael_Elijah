'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL7_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL7_LESSONS[6];
const LESSON_ID = 91;

export default function Lesson7() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# SECRET CODE MAKER - Part 1
# Let's build an encoder!

def encode_message(message):
    # Step 1: Convert to uppercase
    upper_msg = message.upper()

    # Step 2: Reverse the text
    reversed_msg = upper_msg[::-1]

    # Step 3: Replace vowels with numbers
    coded = reversed_msg.replace("A", "4")
    coded = coded.replace("E", "3")
    coded = coded.replace("I", "1")
    coded = coded.replace("O", "0")
    coded = coded.replace("U", "9")

    return coded

# Test the encoder!
secret = "Hello World"
encoded = encode_message(secret)
print("Original:", secret)
print("Encoded:", encoded)

# Try encoding your own message!
my_message = "Python is fun"
my_code = encode_message(my_message)
print("My message:", my_message)
print("My code:", my_code)
`);
    const [output, setOutput] = useState('');
    const [step, setStep] = useState(1);
    const [hasEncoded, setHasEncoded] = useState(false);
    const [hasCustomMessage, setHasCustomMessage] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            let outputLines: string[] = [];

            const encodeMessage = (msg: string) => {
                let upper = msg.toUpperCase();
                let reversed = upper.split('').reverse().join('');
                let coded = reversed.replace(/A/g, '4').replace(/E/g, '3').replace(/I/g, '1').replace(/O/g, '0').replace(/U/g, '9');
                return coded;
            };

            const printMatches = code.matchAll(/print\s*\(\s*["']([^"']+)["']\s*,\s*(\w+)\s*\)/g);
            for (const match of printMatches) {
                const label = match[1];
                const varName = match[2];

                if (varName === 'secret') outputLines.push(`${label} Hello World`);
                else if (varName === 'encoded') {
                    outputLines.push(`${label} ${encodeMessage('Hello World')}`);
                    setHasEncoded(true);
                }
                else if (varName === 'my_message') {
                    const msgMatch = code.match(/my_message\s*=\s*["']([^"']+)["']/);
                    if (msgMatch) outputLines.push(`${label} ${msgMatch[1]}`);
                }
                else if (varName === 'my_code') {
                    const msgMatch = code.match(/my_message\s*=\s*["']([^"']+)["']/);
                    if (msgMatch) {
                        outputLines.push(`${label} ${encodeMessage(msgMatch[1])}`);
                        setHasCustomMessage(true);
                    }
                }
            }

            if (hasEncoded && hasCustomMessage && !lessonComplete) {
                setTimeout(() => {
                    addXpAndCoins(LESSON.xpReward, 15);
                    completeLevel(LESSON_ID, LESSON.xpReward, 15, 1, 120);
                    setLessonComplete(true);
                }, 1000);
            }

            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code to see the magic!');
        } catch { setOutput('Error! Check your code.'); }
    };

    if (isLoading || !user) return <div className={styles.container}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🔐</motion.div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}><Lock size={50} /></motion.div>
                <motion.h2 className={styles.successTitle} style={{ color: '#8b5cf6' }}>Code Creator! 🔐</motion.h2>
                <motion.p className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div className={styles.successXp}><Zap size={20} /> +{LESSON.xpReward} XP</motion.div>
                <Link href="/level7/lesson8" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>Next Lesson <ChevronRight size={18} /></Link>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            <header className={styles.header} style={{ borderBottom: '1px solid #8b5cf6' }}>
                <Link href="/level7" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 12</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                <div className={styles.lessonTitle}>
                    <motion.div className={styles.lessonEmoji} animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>{LESSON.emoji}</motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1 style={{ color: '#8b5cf6' }}>{LESSON.title}</h1>
                        <p>Project: <code style={{ color: '#ec4899' }}>{LESSON.concept}</code></p>
                    </div>
                </div>

                <motion.div className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15))', borderColor: '#8b5cf6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Lock size={28} style={{ color: '#8b5cf6' }} />
                        <Sparkles size={24} style={{ color: '#ec4899' }} />
                        <span style={{ fontWeight: 700, color: '#8b5cf6' }}>Build a Secret Code Encoder!</span>
                    </div>
                    <p>Create a function that transforms messages into secret codes using string operations!</p>
                </motion.div>

                <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: '#ec4899' }}>
                    <h3 style={{ color: '#8b5cf6', marginBottom: '1rem' }}><Lightbulb size={20} /> How Our Encoder Works:</h3>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                        <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                            <strong>Step 1:</strong> Convert to UPPERCASE → "hello" becomes "HELLO"
                        </div>
                        <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                            <strong>Step 2:</strong> Reverse the text → "HELLO" becomes "OLLEH"
                        </div>
                        <div style={{ background: 'rgba(139, 233, 253, 0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                            <strong>Step 3:</strong> Replace vowels with numbers → A=4, E=3, I=1, O=0, U=9
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '0.5rem', fontFamily: 'monospace' }}>
                        "HELLO" → "0LL3H" (reversed + vowels replaced!)
                    </div>
                </div>

                <div className={styles.codeSection}>
                    <h3 style={{ color: '#ec4899' }}>Build Your Encoder:</h3>
                    <div className={styles.editor} style={{ borderColor: '#8b5cf6' }}>
                        <div className={styles.codeHeader}><span>secret_code.py</span><span>Python</span></div>
                        <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '450px' }} />
                    </div>
                    <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}><Play size={18} /> Run Encoder</button>
                    {output && <motion.div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></motion.div>}
                </div>

                <div className={styles.challenges} style={{ borderColor: '#8b5cf6' }}>
                    <h3 style={{ color: '#8b5cf6' }}>Project Goals:</h3>
                    <ul className={styles.challengeList}>
                        <li><div className={`${styles.challengeCheck} ${hasEncoded ? styles.done : ''}`}>{hasEncoded && <Check size={14} />}</div>Encode the sample message</li>
                        <li><div className={`${styles.challengeCheck} ${hasCustomMessage ? styles.done : ''}`}>{hasCustomMessage && <Check size={14} />}</div>Encode your own custom message</li>
                    </ul>
                </div>

                <div className={styles.navBar}>
                    <Link href="/level7/lesson6" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                    <span style={{ color: 'var(--text-muted)' }}>Complete both goals!</span>
                </div>
            </div>
        </div>
    );
}
