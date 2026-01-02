'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL8_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL8_LESSONS[2];
const LESSON_ID = 99;

export default function Lesson3() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# The Magic __init__ Method!

class Pet:
    def __init__(self):
        print("A new pet is born!")

# When you create a pet, __init__ runs automatically!
fluffy = Pet()
buddy = Pet()

print("Two pets created!")
`);
    const [output, setOutput] = useState('');
    const [hasInit, setHasInit] = useState(false);
    const [hasCreatedPets, setHasCreatedPets] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        let outputLines: string[] = [];

        if (code.includes('def __init__')) {
            setHasInit(true);
            const petCount = (code.match(/\w+\s*=\s*Pet\(\)/g) || []).length;

            for (let i = 0; i < petCount; i++) {
                outputLines.push('A new pet is born!');
            }

            if (petCount >= 2) {
                setHasCreatedPets(true);
                outputLines.push('');
                outputLines.push('Two pets created!');
            }
        }

        if (hasInit && hasCreatedPets && !lessonComplete) {
            setTimeout(() => {
                addXpAndCoins(LESSON.xpReward, 5);
                completeLevel(LESSON_ID, LESSON.xpReward, 5, 1, 60);
                setLessonComplete(true);
            }, 1000);
        }

        setOutput(outputLines.join('\n') || 'Add the __init__ method!');
    };

    if (isLoading || !user) return <div className={styles.container}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>✨</motion.div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>✨</motion.div>
                <motion.h2 className={styles.successTitle} style={{ color: '#f97316' }}>Init Magic Learned!</motion.h2>
                <motion.p className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div className={styles.successXp}><Zap size={20} /> +{LESSON.xpReward} XP</motion.div>
                <Link href="/level8/lesson4" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>Next Lesson <ChevronRight size={18} /></Link>
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
                    <motion.div className={styles.lessonEmoji} animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>{LESSON.emoji}</motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1 style={{ color: '#f97316' }}>{LESSON.title}</h1>
                        <p>Learn about <code style={{ color: '#ef4444' }}>{LESSON.concept}</code></p>
                    </div>
                </div>

                <motion.div className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(239, 68, 68, 0.15))', borderColor: '#f97316' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Sparkles size={24} style={{ color: '#f97316' }} />
                        <span style={{ fontWeight: 700, color: '#f97316' }}>The __init__ Spell!</span>
                    </div>
                    <p><code style={{ color: '#ef4444' }}>__init__</code> is a <strong>special method</strong> that runs automatically when you create an object!</p>
                    <p style={{ marginTop: '0.5rem' }}>It's like a "birth announcement" for every new pet!</p>
                </motion.div>

                <div className={styles.conceptBox} style={{ borderColor: '#ef4444' }}>
                    <h3 style={{ color: '#f97316', marginBottom: '1rem' }}>The Init Method:</h3>
                    <pre style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.5rem', fontSize: '1rem' }}>
{`class Pet:
    def __init__(self):  # Runs automatically!
        print("A new pet is born!")

fluffy = Pet()  # Prints: A new pet is born!`}
                    </pre>
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <strong>Note:</strong> <code>self</code> refers to the pet being created
                    </p>
                </div>

                <div className={styles.codeSection}>
                    <h3 style={{ color: '#ef4444' }}>Try the Magic __init__!</h3>
                    <div className={styles.editor} style={{ borderColor: '#f97316' }}>
                        <div className={styles.codeHeader}><span>init_magic.py</span><span>Python</span></div>
                        <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} />
                    </div>
                    <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}><Play size={18} /> Run Code</button>
                    {output && <motion.div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></motion.div>}
                </div>

                <div className={styles.challenges} style={{ borderColor: '#f97316' }}>
                    <h3 style={{ color: '#f97316' }}>Goals:</h3>
                    <ul className={styles.challengeList}>
                        <li><div className={`${styles.challengeCheck} ${hasInit ? styles.done : ''}`}>{hasInit && <Check size={14} />}</div>Add the __init__ method</li>
                        <li><div className={`${styles.challengeCheck} ${hasCreatedPets ? styles.done : ''}`}>{hasCreatedPets && <Check size={14} />}</div>Create 2 pets to see it run</li>
                    </ul>
                </div>

                <div className={styles.navBar}>
                    <Link href="/level8/lesson2" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                    <span style={{ color: 'var(--text-muted)' }}>Complete goals!</span>
                </div>
            </div>
        </div>
    );
}
