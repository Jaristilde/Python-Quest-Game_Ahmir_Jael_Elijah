'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Code } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL8_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL8_LESSONS[6];
const LESSON_ID = 103;

export default function Lesson7() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# PET SIMULATOR - Part 1: Basic Pet Class!

class Pet:
    def __init__(self, name, species):
        self.name = name
        self.species = species
        self.hunger = 50      # 0-100 scale
        self.happiness = 50   # 0-100 scale
        self.energy = 50      # 0-100 scale

    def feed(self):
        self.hunger = max(0, self.hunger - 30)
        self.happiness += 10
        print(f"{self.name} ate! Hunger: {self.hunger}")

    def play(self):
        self.happiness += 20
        self.energy -= 15
        self.hunger += 10
        print(f"{self.name} played! Happiness: {self.happiness}")

    def sleep(self):
        self.energy = min(100, self.energy + 40)
        print(f"{self.name} slept! Energy: {self.energy}")

    def status(self):
        print(f"--- {self.name}'s Status ---")
        print(f"Species: {self.species}")
        print(f"Hunger: {self.hunger}/100")
        print(f"Happiness: {self.happiness}/100")
        print(f"Energy: {self.energy}/100")

# Create your pet and interact!
my_pet = Pet("Buddy", "Dog")
my_pet.status()
my_pet.feed()
my_pet.play()
my_pet.status()
`);
    const [output, setOutput] = useState('');
    const [hasPetClass, setHasPetClass] = useState(false);
    const [hasStats, setHasStats] = useState(false);
    const [hasMethods, setHasMethods] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        let outputLines: string[] = [];

        if (code.includes('class Pet')) {
            setHasPetClass(true);
        }
        if (code.includes('self.hunger') && code.includes('self.happiness') && code.includes('self.energy')) {
            setHasStats(true);
        }
        if (code.includes('def feed') && code.includes('def play') && code.includes('def sleep')) {
            setHasMethods(true);
        }

        // Simulate output
        if (code.includes('.status()')) {
            outputLines.push("--- Buddy's Status ---");
            outputLines.push("Species: Dog");
            outputLines.push("Hunger: 50/100");
            outputLines.push("Happiness: 50/100");
            outputLines.push("Energy: 50/100");
        }
        if (code.includes('.feed()')) {
            outputLines.push("Buddy ate! Hunger: 20");
        }
        if (code.includes('.play()')) {
            outputLines.push("Buddy played! Happiness: 80");
        }
        if (code.includes('.status()') && (code.match(/\.status\(\)/g) || []).length >= 2) {
            outputLines.push("--- Buddy's Status ---");
            outputLines.push("Species: Dog");
            outputLines.push("Hunger: 30/100");
            outputLines.push("Happiness: 80/100");
            outputLines.push("Energy: 35/100");
        }

        if (hasPetClass && hasStats && hasMethods && !lessonComplete) {
            setTimeout(() => {
                addXpAndCoins(LESSON.xpReward, 15);
                completeLevel(LESSON_ID, LESSON.xpReward, 15, 1, 180);
                setLessonComplete(true);
            }, 1000);
        }

        setOutput(outputLines.join('\n') || 'Build your Pet class!');
    };

    if (isLoading || !user) return <div className={styles.container}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🐕</motion.div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>🐕</motion.div>
                <motion.h2 className={styles.successTitle} style={{ color: '#f97316' }}>Pet Simulator Started!</motion.h2>
                <motion.p className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div className={styles.successXp}><Zap size={20} /> +{LESSON.xpReward} XP</motion.div>
                <Link href="/level8/lesson8" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>Next Lesson <ChevronRight size={18} /></Link>
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
                    <motion.div className={styles.lessonEmoji} animate={{ y: [0, -10, 0] }} transition={{ duration: 1, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>{LESSON.emoji}</motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1 style={{ color: '#f97316' }}>{LESSON.title}</h1>
                        <p>Project: <code style={{ color: '#ef4444' }}>{LESSON.concept}</code></p>
                    </div>
                </div>

                <motion.div className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(239, 68, 68, 0.15))', borderColor: '#f97316' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Code size={24} style={{ color: '#f97316' }} />
                        <span style={{ fontWeight: 700, color: '#f97316' }}>Build Your Virtual Pet!</span>
                    </div>
                    <p>Create a Pet class with <strong>stats</strong> (hunger, happiness, energy) and <strong>actions</strong> (feed, play, sleep)!</p>
                </motion.div>

                <div className={styles.conceptBox} style={{ borderColor: '#ef4444' }}>
                    <h3 style={{ color: '#f97316', marginBottom: '1rem' }}>Pet Stats:</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                        <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                            <div style={{ fontSize: '1.5rem' }}>🍖</div>
                            <div style={{ fontWeight: 600 }}>Hunger</div>
                        </div>
                        <div style={{ background: 'rgba(249, 115, 22, 0.2)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                            <div style={{ fontSize: '1.5rem' }}>😊</div>
                            <div style={{ fontWeight: 600 }}>Happiness</div>
                        </div>
                        <div style={{ background: 'rgba(234, 179, 8, 0.2)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                            <div style={{ fontSize: '1.5rem' }}>⚡</div>
                            <div style={{ fontWeight: 600 }}>Energy</div>
                        </div>
                    </div>
                </div>

                <div className={styles.codeSection}>
                    <h3 style={{ color: '#ef4444' }}>Build Your Pet Simulator!</h3>
                    <div className={styles.editor} style={{ borderColor: '#f97316' }}>
                        <div className={styles.codeHeader}><span>pet_simulator.py</span><span>Python</span></div>
                        <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '500px' }} />
                    </div>
                    <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}><Play size={18} /> Run Simulator</button>
                    {output && <motion.div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></motion.div>}
                </div>

                <div className={styles.challenges} style={{ borderColor: '#f97316' }}>
                    <h3 style={{ color: '#f97316' }}>Project Goals:</h3>
                    <ul className={styles.challengeList}>
                        <li><div className={`${styles.challengeCheck} ${hasPetClass ? styles.done : ''}`}>{hasPetClass && <Check size={14} />}</div>Create the Pet class</li>
                        <li><div className={`${styles.challengeCheck} ${hasStats ? styles.done : ''}`}>{hasStats && <Check size={14} />}</div>Add hunger, happiness, energy stats</li>
                        <li><div className={`${styles.challengeCheck} ${hasMethods ? styles.done : ''}`}>{hasMethods && <Check size={14} />}</div>Add feed, play, sleep methods</li>
                    </ul>
                </div>

                <div className={styles.navBar}>
                    <Link href="/level8/lesson6" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                    <span style={{ color: 'var(--text-muted)' }}>Complete project goals!</span>
                </div>
            </div>
        </div>
    );
}
