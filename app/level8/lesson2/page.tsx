'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL8_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL8_LESSONS[1];
const LESSON_ID = 98;

export default function Lesson2() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# Creating Objects (Instances) from a Class

class Pet:
    pass

# Each call to Pet() creates a NEW object
fluffy = Pet()
buddy = Pet()
whiskers = Pet()

print("Fluffy:", fluffy)
print("Buddy:", buddy)
print("Whiskers:", whiskers)

# Are they the same pet?
print("Same pet?", fluffy == buddy)
`);
    const [output, setOutput] = useState('');
    const [hasCreatedObjects, setHasCreatedObjects] = useState(false);
    const [hasThreePets, setHasThreePets] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        let outputLines: string[] = [];
        const petMatches = code.match(/\w+\s*=\s*Pet\(\)/g);
        const petCount = petMatches ? petMatches.length : 0;

        if (petCount >= 1) {
            setHasCreatedObjects(true);
            outputLines.push('Fluffy: <__main__.Pet object at 0x...>');
        }
        if (petCount >= 3) {
            setHasThreePets(true);
            outputLines.push('Buddy: <__main__.Pet object at 0x...>');
            outputLines.push('Whiskers: <__main__.Pet object at 0x...>');
            outputLines.push('Same pet? False');
            outputLines.push('');
            outputLines.push('Each pet is unique!');
        }

        if (hasCreatedObjects && hasThreePets && !lessonComplete) {
            setTimeout(() => {
                addXpAndCoins(LESSON.xpReward, 5);
                completeLevel(LESSON_ID, LESSON.xpReward, 5, 1, 60);
                setLessonComplete(true);
            }, 1000);
        }

        setOutput(outputLines.join('\n') || 'Create some pet objects!');
    };

    if (isLoading || !user) return <div className={styles.container}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🐣</motion.div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>🐣</motion.div>
                <motion.h2 className={styles.successTitle} style={{ color: '#f97316' }}>Pets Born!</motion.h2>
                <motion.p className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div className={styles.successXp}><Zap size={20} /> +{LESSON.xpReward} XP</motion.div>
                <Link href="/level8/lesson3" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>Next Lesson <ChevronRight size={18} /></Link>
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
                    <motion.div className={styles.lessonEmoji} animate={{ y: [0, -10, 0] }} transition={{ duration: 1, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>{LESSON.emoji}</motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1 style={{ color: '#f97316' }}>{LESSON.title}</h1>
                        <p>Learn about <code style={{ color: '#ef4444' }}>{LESSON.concept}</code></p>
                    </div>
                </div>

                <motion.div className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(239, 68, 68, 0.15))', borderColor: '#f97316' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Lightbulb size={24} style={{ color: '#f97316' }} />
                        <span style={{ fontWeight: 700, color: '#f97316' }}>Objects are Unique!</span>
                    </div>
                    <p>Each time you call <code style={{ color: '#ef4444' }}>Pet()</code>, you create a <strong>new, unique pet</strong>!</p>
                    <p style={{ marginTop: '0.5rem' }}>Like baking cookies - same recipe, but each cookie is different!</p>
                </motion.div>

                <div className={styles.conceptBox} style={{ borderColor: '#ef4444' }}>
                    <h3 style={{ color: '#f97316', marginBottom: '1rem' }}>Creating Objects:</h3>
                    <pre style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.5rem', fontSize: '1.1rem' }}>
{`fluffy = Pet()    # Pet #1
buddy = Pet()     # Pet #2 (different!)
whiskers = Pet()  # Pet #3 (also different!)`}
                    </pre>
                </div>

                <div className={styles.codeSection}>
                    <h3 style={{ color: '#ef4444' }}>Create Your Pet Family!</h3>
                    <div className={styles.editor} style={{ borderColor: '#f97316' }}>
                        <div className={styles.codeHeader}><span>pet_objects.py</span><span>Python</span></div>
                        <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} />
                    </div>
                    <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}><Play size={18} /> Run Code</button>
                    {output && <motion.div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></motion.div>}
                </div>

                <div className={styles.challenges} style={{ borderColor: '#f97316' }}>
                    <h3 style={{ color: '#f97316' }}>Goals:</h3>
                    <ul className={styles.challengeList}>
                        <li><div className={`${styles.challengeCheck} ${hasCreatedObjects ? styles.done : ''}`}>{hasCreatedObjects && <Check size={14} />}</div>Create pet objects</li>
                        <li><div className={`${styles.challengeCheck} ${hasThreePets ? styles.done : ''}`}>{hasThreePets && <Check size={14} />}</div>Create at least 3 unique pets</li>
                    </ul>
                </div>

                <div className={styles.navBar}>
                    <Link href="/level8/lesson1" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                    <span style={{ color: 'var(--text-muted)' }}>Create 3 pets!</span>
                </div>
            </div>
        </div>
    );
}
