'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL8_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL8_LESSONS[7];
const LESSON_ID = 104;

export default function Lesson8() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# Class Attributes vs Instance Attributes

class Pet:
    # CLASS ATTRIBUTE - shared by ALL pets
    species_count = 0
    shelter_name = "Happy Paws"

    def __init__(self, name, species):
        # INSTANCE ATTRIBUTES - unique to each pet
        self.name = name
        self.species = species
        Pet.species_count += 1  # Increment shared counter

# Create pets
fluffy = Pet("Fluffy", "Cat")
buddy = Pet("Buddy", "Dog")
whiskers = Pet("Whiskers", "Cat")

# Instance attributes - different for each
print(f"Pet 1: {fluffy.name}")
print(f"Pet 2: {buddy.name}")

# Class attribute - same for all!
print(f"Total pets: {Pet.species_count}")
print(f"Shelter: {fluffy.shelter_name}")
print(f"Same shelter: {buddy.shelter_name}")
`);
    const [output, setOutput] = useState('');
    const [hasClassAttr, setHasClassAttr] = useState(false);
    const [hasInstanceAttr, setHasInstanceAttr] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        let outputLines: string[] = [];

        if (code.includes('species_count') || code.includes('shelter_name')) {
            setHasClassAttr(true);
        }
        if (code.includes('self.name') && code.includes('self.species')) {
            setHasInstanceAttr(true);
        }

        outputLines.push('Pet 1: Fluffy');
        outputLines.push('Pet 2: Buddy');
        outputLines.push('Total pets: 3');
        outputLines.push('Shelter: Happy Paws');
        outputLines.push('Same shelter: Happy Paws');

        if (hasClassAttr && hasInstanceAttr && !lessonComplete) {
            setTimeout(() => {
                addXpAndCoins(LESSON.xpReward, 5);
                completeLevel(LESSON_ID, LESSON.xpReward, 5, 1, 60);
                setLessonComplete(true);
            }, 1000);
        }

        setOutput(outputLines.join('\n'));
    };

    if (isLoading || !user) return <div className={styles.container}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🤝</motion.div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>🤝</motion.div>
                <motion.h2 className={styles.successTitle} style={{ color: '#f97316' }}>Shared Secrets Learned!</motion.h2>
                <motion.p className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div className={styles.successXp}><Zap size={20} /> +{LESSON.xpReward} XP</motion.div>
                <Link href="/level8/lesson9" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>Next Lesson <ChevronRight size={18} /></Link>
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
                    <motion.div className={styles.lessonEmoji} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>{LESSON.emoji}</motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1 style={{ color: '#f97316' }}>{LESSON.title}</h1>
                        <p>Learn about <code style={{ color: '#ef4444' }}>{LESSON.concept}</code></p>
                    </div>
                </div>

                <motion.div className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(239, 68, 68, 0.15))', borderColor: '#f97316' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Lightbulb size={24} style={{ color: '#f97316' }} />
                        <span style={{ fontWeight: 700, color: '#f97316' }}>Two Types of Attributes!</span>
                    </div>
                    <p><strong style={{ color: '#ef4444' }}>Class attributes</strong> = Shared by ALL objects</p>
                    <p><strong style={{ color: '#f97316' }}>Instance attributes</strong> = Unique to EACH object</p>
                </motion.div>

                <div className={styles.conceptBox} style={{ borderColor: '#ef4444' }}>
                    <h3 style={{ color: '#f97316', marginBottom: '1rem' }}>The Difference:</h3>
                    <pre style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
{`class Pet:
    shelter = "Happy Paws"  # CLASS - shared!

    def __init__(self, name):
        self.name = name    # INSTANCE - unique!

# All pets share the shelter name
# But each pet has their own name`}
                    </pre>
                </div>

                <div className={styles.codeSection}>
                    <h3 style={{ color: '#ef4444' }}>Explore the Difference!</h3>
                    <div className={styles.editor} style={{ borderColor: '#f97316' }}>
                        <div className={styles.codeHeader}><span>class_vs_instance.py</span><span>Python</span></div>
                        <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '400px' }} />
                    </div>
                    <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}><Play size={18} /> Run Code</button>
                    {output && <motion.div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></motion.div>}
                </div>

                <div className={styles.challenges} style={{ borderColor: '#f97316' }}>
                    <h3 style={{ color: '#f97316' }}>Goals:</h3>
                    <ul className={styles.challengeList}>
                        <li><div className={`${styles.challengeCheck} ${hasClassAttr ? styles.done : ''}`}>{hasClassAttr && <Check size={14} />}</div>Add a class attribute</li>
                        <li><div className={`${styles.challengeCheck} ${hasInstanceAttr ? styles.done : ''}`}>{hasInstanceAttr && <Check size={14} />}</div>Add instance attributes</li>
                    </ul>
                </div>

                <div className={styles.navBar}>
                    <Link href="/level8/lesson7" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                    <span style={{ color: 'var(--text-muted)' }}>Complete goals!</span>
                </div>
            </div>
        </div>
    );
}
