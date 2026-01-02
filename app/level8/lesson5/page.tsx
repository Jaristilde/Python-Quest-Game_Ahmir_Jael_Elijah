'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL8_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL8_LESSONS[4];
const LESSON_ID = 101;

export default function Lesson5() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# Teach Your Pet Tricks - Methods!

class Pet:
    def __init__(self, name):
        self.name = name

    def speak(self):
        print(f"{self.name} says: Hello!")

    def do_trick(self):
        print(f"{self.name} does a backflip!")

# Create a pet and teach it tricks
buddy = Pet("Buddy")
buddy.speak()
buddy.do_trick()
`);
    const [output, setOutput] = useState('');
    const [hasMethod, setHasMethod] = useState(false);
    const [hasCalledMethod, setHasCalledMethod] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        let outputLines: string[] = [];

        if (code.includes('def speak') || code.includes('def do_trick')) {
            setHasMethod(true);

            if (code.includes('.speak()')) {
                outputLines.push('Buddy says: Hello!');
                setHasCalledMethod(true);
            }
            if (code.includes('.do_trick()')) {
                outputLines.push('Buddy does a backflip!');
                setHasCalledMethod(true);
            }
        }

        if (hasMethod && hasCalledMethod && !lessonComplete) {
            setTimeout(() => {
                addXpAndCoins(LESSON.xpReward, 5);
                completeLevel(LESSON_ID, LESSON.xpReward, 5, 1, 60);
                setLessonComplete(true);
            }, 1000);
        }

        setOutput(outputLines.join('\n') || 'Add a method and call it!');
    };

    if (isLoading || !user) return <div className={styles.container}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🎪</motion.div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>🎪</motion.div>
                <motion.h2 className={styles.successTitle} style={{ color: '#f97316' }}>Tricks Learned!</motion.h2>
                <motion.p className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div className={styles.successXp}><Zap size={20} /> +{LESSON.xpReward} XP</motion.div>
                <Link href="/level8/lesson6" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>Next Lesson <ChevronRight size={18} /></Link>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            <header className={styles.header} style={{ borderBottom: '1px solid #f97316' }}>
                <Link href="/level8" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 12</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                <div className={styles.lessonTitle}>
                    <motion.div className={styles.lessonEmoji} animate={{ y: [0, -15, 0] }} transition={{ duration: 0.5, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>{LESSON.emoji}</motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1 style={{ color: '#f97316' }}>{LESSON.title}</h1>
                        <p>Learn about <code style={{ color: '#ef4444' }}>{LESSON.concept}</code></p>
                    </div>
                </div>

                <motion.div className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(239, 68, 68, 0.15))', borderColor: '#f97316' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Lightbulb size={24} style={{ color: '#f97316' }} />
                        <span style={{ fontWeight: 700, color: '#f97316' }}>Methods = Pet Actions!</span>
                    </div>
                    <p><strong style={{ color: '#ef4444' }}>Methods</strong> are functions inside a class - they're things your pet can DO!</p>
                    <p style={{ marginTop: '0.5rem' }}>Call them with <code>pet.method_name()</code></p>
                </motion.div>

                <div className={styles.conceptBox} style={{ borderColor: '#ef4444' }}>
                    <h3 style={{ color: '#f97316', marginBottom: '1rem' }}>Adding Methods:</h3>
                    <pre style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.95rem' }}>
{`class Pet:
    def __init__(self, name):
        self.name = name

    def speak(self):  # Method!
        print(f"{self.name} says hi!")

buddy = Pet("Buddy")
buddy.speak()  # Call the method`}
                    </pre>
                </div>

                <div className={styles.codeSection}>
                    <h3 style={{ color: '#ef4444' }}>Teach Your Pet Tricks!</h3>
                    <div className={styles.editor} style={{ borderColor: '#f97316' }}>
                        <div className={styles.codeHeader}><span>pet_tricks.py</span><span>Python</span></div>
                        <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} />
                    </div>
                    <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}><Play size={18} /> Run Code</button>
                    {output && <motion.div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></motion.div>}
                </div>

                <div className={styles.challenges} style={{ borderColor: '#f97316' }}>
                    <h3 style={{ color: '#f97316' }}>Goals:</h3>
                    <ul className={styles.challengeList}>
                        <li><div className={`${styles.challengeCheck} ${hasMethod ? styles.done : ''}`}>{hasMethod && <Check size={14} />}</div>Add a method to the class</li>
                        <li><div className={`${styles.challengeCheck} ${hasCalledMethod ? styles.done : ''}`}>{hasCalledMethod && <Check size={14} />}</div>Call the method on a pet</li>
                    </ul>
                </div>

                <div className={styles.navBar}>
                    <Link href="/level8/lesson4" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                    <span style={{ color: 'var(--text-muted)' }}>Complete goals!</span>
                </div>
            </div>
        </div>
    );
}
