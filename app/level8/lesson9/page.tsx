'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL8_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL8_LESSONS[8];
const LESSON_ID = 105;

export default function Lesson9() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# Pet Family Tree - Inheritance!

# Parent class
class Pet:
    def __init__(self, name):
        self.name = name

    def speak(self):
        print(f"{self.name} makes a sound")

# Child classes inherit from Pet!
class Dog(Pet):
    def speak(self):  # Override parent method
        print(f"{self.name} says: Woof woof!")

    def fetch(self):  # New method just for dogs
        print(f"{self.name} fetches the ball!")

class Cat(Pet):
    def speak(self):  # Override parent method
        print(f"{self.name} says: Meow!")

    def climb(self):  # New method just for cats
        print(f"{self.name} climbs the tree!")

# Create different pet types
buddy = Dog("Buddy")
whiskers = Cat("Whiskers")

buddy.speak()
buddy.fetch()

whiskers.speak()
whiskers.climb()
`);
    const [output, setOutput] = useState('');
    const [hasParent, setHasParent] = useState(false);
    const [hasChild, setHasChild] = useState(false);
    const [hasOverride, setHasOverride] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        let outputLines: string[] = [];

        if (code.includes('class Pet')) {
            setHasParent(true);
        }
        if (code.includes('class Dog(Pet)') || code.includes('class Cat(Pet)')) {
            setHasChild(true);
        }
        if (code.match(/class \w+\(Pet\)[\s\S]*def speak/)) {
            setHasOverride(true);
        }

        if (code.includes('.speak()') && code.includes('Dog')) {
            outputLines.push('Buddy says: Woof woof!');
        }
        if (code.includes('.fetch()')) {
            outputLines.push('Buddy fetches the ball!');
        }
        if (code.includes('.speak()') && code.includes('Cat')) {
            outputLines.push('Whiskers says: Meow!');
        }
        if (code.includes('.climb()')) {
            outputLines.push('Whiskers climbs the tree!');
        }

        if (hasParent && hasChild && hasOverride && !lessonComplete) {
            setTimeout(() => {
                addXpAndCoins(LESSON.xpReward, 10);
                completeLevel(LESSON_ID, LESSON.xpReward, 10, 1, 90);
                setLessonComplete(true);
            }, 1000);
        }

        setOutput(outputLines.join('\n') || 'Create parent and child classes!');
    };

    if (isLoading || !user) return <div className={styles.container}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🌳</motion.div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #f97316, #22c55e)' }}>🌳</motion.div>
                <motion.h2 className={styles.successTitle} style={{ color: '#f97316' }}>Family Tree Complete!</motion.h2>
                <motion.p className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div className={styles.successXp}><Zap size={20} /> +{LESSON.xpReward} XP</motion.div>
                <Link href="/level8/lesson10" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>Next Lesson <ChevronRight size={18} /></Link>
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
                    <motion.div className={styles.lessonEmoji} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #f97316, #22c55e)' }}>{LESSON.emoji}</motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1 style={{ color: '#f97316' }}>{LESSON.title}</h1>
                        <p>Learn about <code style={{ color: '#ef4444' }}>{LESSON.concept}</code></p>
                    </div>
                </div>

                <motion.div className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(34, 197, 94, 0.15))', borderColor: '#f97316' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Lightbulb size={24} style={{ color: '#f97316' }} />
                        <span style={{ fontWeight: 700, color: '#f97316' }}>Inheritance = Family!</span>
                    </div>
                    <p><strong style={{ color: '#22c55e' }}>Child classes</strong> inherit everything from their <strong style={{ color: '#ef4444' }}>parent class</strong>!</p>
                    <p style={{ marginTop: '0.5rem' }}>Dogs and Cats are both Pets, but with special abilities!</p>
                </motion.div>

                <div className={styles.conceptBox} style={{ borderColor: '#22c55e' }}>
                    <h3 style={{ color: '#f97316', marginBottom: '1rem' }}>Inheritance Syntax:</h3>
                    <pre style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.95rem' }}>
{`class Pet:           # Parent
    def speak(self):
        print("Sound")

class Dog(Pet):      # Child inherits!
    def speak(self): # Override method
        print("Woof!")`}
                    </pre>
                </div>

                <div className={styles.codeSection}>
                    <h3 style={{ color: '#ef4444' }}>Build Your Pet Family!</h3>
                    <div className={styles.editor} style={{ borderColor: '#f97316' }}>
                        <div className={styles.codeHeader}><span>pet_family.py</span><span>Python</span></div>
                        <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '450px' }} />
                    </div>
                    <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #f97316, #22c55e)' }}><Play size={18} /> Run Code</button>
                    {output && <motion.div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></motion.div>}
                </div>

                <div className={styles.challenges} style={{ borderColor: '#f97316' }}>
                    <h3 style={{ color: '#f97316' }}>Goals:</h3>
                    <ul className={styles.challengeList}>
                        <li><div className={`${styles.challengeCheck} ${hasParent ? styles.done : ''}`}>{hasParent && <Check size={14} />}</div>Create a Pet parent class</li>
                        <li><div className={`${styles.challengeCheck} ${hasChild ? styles.done : ''}`}>{hasChild && <Check size={14} />}</div>Create Dog or Cat child class</li>
                        <li><div className={`${styles.challengeCheck} ${hasOverride ? styles.done : ''}`}>{hasOverride && <Check size={14} />}</div>Override the speak() method</li>
                    </ul>
                </div>

                <div className={styles.navBar}>
                    <Link href="/level8/lesson8" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                    <span style={{ color: 'var(--text-muted)' }}>Complete goals!</span>
                </div>
            </div>
        </div>
    );
}
