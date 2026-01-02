'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Sparkles, Target } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL8_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL8_LESSONS[5];
const LESSON_ID = 102;

const CHALLENGES = [
    { id: 1, title: 'Create a Robot class with a name', test: (code: string) => code.includes('class Robot') && code.includes('self.name') },
    { id: 2, title: 'Add a greet() method', test: (code: string) => code.includes('def greet') },
    { id: 3, title: 'Create a Car class with brand and speed', test: (code: string) => code.includes('class Car') && code.includes('self.brand') },
    { id: 4, title: 'Add a drive() method to Car', test: (code: string) => code.includes('def drive') },
    { id: 5, title: 'Create instances of both classes', test: (code: string) => code.includes('Robot(') && code.includes('Car(') },
];

export default function Lesson6() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# Pet Training Camp - Practice Classes!

# Challenge 1: Create a Robot class
class Robot:
    def __init__(self, name):
        self.name = name

    # Challenge 2: Add a greet method
    def greet(self):
        print(f"Beep boop! I am {self.name}")

# Challenge 3: Create a Car class
class Car:
    def __init__(self, brand, speed):
        self.brand = brand
        self.speed = speed

    # Challenge 4: Add a drive method
    def drive(self):
        print(f"{self.brand} zooms at {self.speed} mph!")

# Challenge 5: Create instances
robo = Robot("R2D2")
robo.greet()

my_car = Car("Tesla", 120)
my_car.drive()
`);
    const [output, setOutput] = useState('');
    const [completed, setCompleted] = useState<number[]>([]);
    const [lessonComplete, setLessonComplete] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        const newCompleted: number[] = [];
        let outputLines: string[] = [];

        CHALLENGES.forEach(challenge => {
            if (challenge.test(code)) {
                newCompleted.push(challenge.id);
            }
        });

        setCompleted(newCompleted);

        if (code.includes('class Robot') && code.includes('.greet()')) {
            outputLines.push('Beep boop! I am R2D2');
        }
        if (code.includes('class Car') && code.includes('.drive()')) {
            outputLines.push('Tesla zooms at 120 mph!');
        }

        if (newCompleted.length >= 5 && !lessonComplete) {
            outputLines.push('');
            outputLines.push('All challenges complete!');
            setTimeout(() => {
                addXpAndCoins(LESSON.xpReward, 10);
                completeLevel(LESSON_ID, LESSON.xpReward, 10, 1, 120);
                setLessonComplete(true);
            }, 1000);
        }

        setOutput(outputLines.join('\n') || 'Complete all 5 challenges!');
    };

    if (isLoading || !user) return <div className={styles.container}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🏕️</motion.div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #f97316, #eab308)' }}>🏕️</motion.div>
                <motion.h2 className={styles.successTitle} style={{ color: '#f97316' }}>Training Complete!</motion.h2>
                <motion.p className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div className={styles.successXp}><Zap size={20} /> +{LESSON.xpReward} XP</motion.div>
                <Link href="/level8/lesson7" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>Start Project! <ChevronRight size={18} /></Link>
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
                    <motion.div className={styles.lessonEmoji} animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #f97316, #eab308)' }}>{LESSON.emoji}</motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1 style={{ color: '#f97316' }}>{LESSON.title}</h1>
                        <p><Sparkles size={16} style={{ color: '#eab308' }} /> Practice + Supercharge!</p>
                    </div>
                </div>

                <motion.div className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(234, 179, 8, 0.15))', borderColor: '#eab308' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Target size={24} style={{ color: '#f97316' }} />
                        <span style={{ fontWeight: 700, color: '#f97316' }}>5 Challenges!</span>
                    </div>
                    <p>Complete all 5 challenges to level up your class skills!</p>
                </motion.div>

                <div className={styles.challenges} style={{ borderColor: '#eab308', marginBottom: '1.5rem' }}>
                    <h3 style={{ color: '#f97316' }}>Challenges:</h3>
                    <ul className={styles.challengeList}>
                        {CHALLENGES.map(challenge => (
                            <li key={challenge.id}>
                                <div className={`${styles.challengeCheck} ${completed.includes(challenge.id) ? styles.done : ''}`}>
                                    {completed.includes(challenge.id) && <Check size={14} />}
                                </div>
                                {challenge.title}
                            </li>
                        ))}
                    </ul>
                    <div style={{ marginTop: '1rem', textAlign: 'center', color: completed.length >= 5 ? '#22c55e' : 'var(--text-muted)' }}>
                        {completed.length}/5 Complete
                    </div>
                </div>

                <div className={styles.codeSection}>
                    <h3 style={{ color: '#ef4444' }}>Your Code:</h3>
                    <div className={styles.editor} style={{ borderColor: '#f97316' }}>
                        <div className={styles.codeHeader}><span>training_camp.py</span><span>Python</span></div>
                        <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '400px' }} />
                    </div>
                    <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #f97316, #eab308)' }}><Play size={18} /> Run & Check</button>
                    {output && <motion.div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></motion.div>}
                </div>

                <div className={styles.navBar}>
                    <Link href="/level8/lesson5" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                    <span style={{ color: 'var(--text-muted)' }}>Complete all 5!</span>
                </div>
            </div>
        </div>
    );
}
