'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Code, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL8_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL8_LESSONS[10];
const LESSON_ID = 107;

export default function Lesson11() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# PET SIMULATOR - Part 2: Complete System!

class Pet:
    def __init__(self, name):
        self.name = name
        self.hunger = 50
        self.happiness = 50
        self.energy = 50

    def feed(self):
        self.hunger = max(0, self.hunger - 30)
        self.happiness += 10
        print(f"{self.name} ate! Hunger: {self.hunger}")

    def sleep(self):
        self.energy = min(100, self.energy + 40)
        print(f"{self.name} slept! Energy: {self.energy}")

    def status(self):
        print(f"--- {self.name} ---")
        print(f"Hunger: {self.hunger} | Happy: {self.happiness} | Energy: {self.energy}")

class Dog(Pet):
    def speak(self):
        print(f"{self.name}: Woof woof!")

    def fetch(self):
        self.happiness += 25
        self.energy -= 20
        print(f"{self.name} fetches the ball! So happy!")

class Cat(Pet):
    def speak(self):
        print(f"{self.name}: Meow!")

    def nap(self):
        self.energy = min(100, self.energy + 50)
        self.happiness += 15
        print(f"{self.name} takes a cozy nap!")

class Bird(Pet):
    def speak(self):
        print(f"{self.name}: Tweet tweet!")

    def sing(self):
        self.happiness += 30
        print(f"{self.name} sings a beautiful song!")

# Create your pet family!
buddy = Dog("Buddy")
whiskers = Cat("Whiskers")
tweety = Bird("Tweety")

# Interact with them!
buddy.speak()
buddy.fetch()
buddy.status()

whiskers.speak()
whiskers.nap()
whiskers.status()

tweety.speak()
tweety.sing()
tweety.status()
`);
    const [output, setOutput] = useState('');
    const [hasDog, setHasDog] = useState(false);
    const [hasCat, setHasCat] = useState(false);
    const [hasBird, setHasBird] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        let outputLines: string[] = [];

        if (code.includes('class Dog(Pet)')) setHasDog(true);
        if (code.includes('class Cat(Pet)')) setHasCat(true);
        if (code.includes('class Bird(Pet)')) setHasBird(true);

        if (code.includes('buddy.speak()') || code.includes('Dog(')) {
            outputLines.push('Buddy: Woof woof!');
        }
        if (code.includes('.fetch()')) {
            outputLines.push('Buddy fetches the ball! So happy!');
        }
        if (code.includes('buddy.status()')) {
            outputLines.push('--- Buddy ---');
            outputLines.push('Hunger: 50 | Happy: 75 | Energy: 30');
        }
        if (code.includes('whiskers.speak()') || code.includes('Cat(')) {
            outputLines.push('Whiskers: Meow!');
        }
        if (code.includes('.nap()')) {
            outputLines.push('Whiskers takes a cozy nap!');
        }
        if (code.includes('whiskers.status()')) {
            outputLines.push('--- Whiskers ---');
            outputLines.push('Hunger: 50 | Happy: 65 | Energy: 100');
        }
        if (code.includes('tweety.speak()') || code.includes('Bird(')) {
            outputLines.push('Tweety: Tweet tweet!');
        }
        if (code.includes('.sing()')) {
            outputLines.push('Tweety sings a beautiful song!');
        }
        if (code.includes('tweety.status()')) {
            outputLines.push('--- Tweety ---');
            outputLines.push('Hunger: 50 | Happy: 80 | Energy: 50');
        }

        if (hasDog && hasCat && hasBird && !lessonComplete) {
            setTimeout(() => {
                addXpAndCoins(LESSON.xpReward, 20);
                completeLevel(LESSON_ID, LESSON.xpReward, 20, 1, 180);
                setLessonComplete(true);
            }, 1000);
        }

        setOutput(outputLines.join('\n') || 'Create Dog, Cat, and Bird classes!');
    };

    if (isLoading || !user) return <div className={styles.container}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🐾</motion.div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>🐾</motion.div>
                <motion.h2 className={styles.successTitle} style={{ color: '#f97316' }}>Pet Simulator Complete!</motion.h2>
                <motion.p className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div className={styles.successXp}><Zap size={20} /> +{LESSON.xpReward} XP</motion.div>
                <Link href="/level8/lesson12" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>Final Quiz! <ChevronRight size={18} /></Link>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            <header className={styles.header} style={{ borderBottom: '1px solid #f97316' }}>
                <Link href="/level8" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>PROJECT</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                <div className={styles.lessonTitle}>
                    <motion.div className={styles.lessonEmoji} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>{LESSON.emoji}</motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1 style={{ color: '#f97316' }}>{LESSON.title}</h1>
                        <p>Project: <code style={{ color: '#ef4444' }}>{LESSON.concept}</code></p>
                    </div>
                </div>

                <motion.div className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(239, 68, 68, 0.15))', borderColor: '#f97316' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Code size={24} style={{ color: '#f97316' }} />
                        <Sparkles size={20} style={{ color: '#ef4444' }} />
                        <span style={{ fontWeight: 700, color: '#f97316' }}>Complete Your Pet Simulator!</span>
                    </div>
                    <p>Add <strong>Dog</strong>, <strong>Cat</strong>, and <strong>Bird</strong> classes with unique abilities!</p>
                </motion.div>

                <div className={styles.conceptBox} style={{ borderColor: '#ef4444' }}>
                    <h3 style={{ color: '#f97316', marginBottom: '1rem' }}>Pet Types & Abilities:</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                        <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                            <div style={{ fontSize: '1.5rem' }}>🐕</div>
                            <div style={{ fontWeight: 600 }}>Dog</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>fetch()</div>
                        </div>
                        <div style={{ background: 'rgba(249, 115, 22, 0.2)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                            <div style={{ fontSize: '1.5rem' }}>🐱</div>
                            <div style={{ fontWeight: 600 }}>Cat</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>nap()</div>
                        </div>
                        <div style={{ background: 'rgba(234, 179, 8, 0.2)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                            <div style={{ fontSize: '1.5rem' }}>🐦</div>
                            <div style={{ fontWeight: 600 }}>Bird</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>sing()</div>
                        </div>
                    </div>
                </div>

                <div className={styles.codeSection}>
                    <h3 style={{ color: '#ef4444' }}>Complete Pet Simulator:</h3>
                    <div className={styles.editor} style={{ borderColor: '#f97316' }}>
                        <div className={styles.codeHeader}><span>pet_simulator_complete.py</span><span>Python</span></div>
                        <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '600px' }} />
                    </div>
                    <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}><Play size={18} /> Run Simulator</button>
                    {output && <motion.div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></motion.div>}
                </div>

                <div className={styles.challenges} style={{ borderColor: '#f97316' }}>
                    <h3 style={{ color: '#f97316' }}>Project Goals:</h3>
                    <ul className={styles.challengeList}>
                        <li><div className={`${styles.challengeCheck} ${hasDog ? styles.done : ''}`}>{hasDog && <Check size={14} />}</div>Create Dog class with fetch()</li>
                        <li><div className={`${styles.challengeCheck} ${hasCat ? styles.done : ''}`}>{hasCat && <Check size={14} />}</div>Create Cat class with nap()</li>
                        <li><div className={`${styles.challengeCheck} ${hasBird ? styles.done : ''}`}>{hasBird && <Check size={14} />}</div>Create Bird class with sing()</li>
                    </ul>
                </div>

                <div className={styles.navBar}>
                    <Link href="/level8/lesson10" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                    <span style={{ color: 'var(--text-muted)' }}>Complete all 3 pet types!</span>
                </div>
            </div>
        </div>
    );
}
