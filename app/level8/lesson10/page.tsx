'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Sparkles, Target } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL8_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL8_LESSONS[9];
const LESSON_ID = 106;

const CHALLENGES = [
    { id: 1, title: 'Create a Vehicle parent class', test: (code: string) => code.includes('class Vehicle') },
    { id: 2, title: 'Add a Car child class', test: (code: string) => code.includes('class Car(Vehicle)') },
    { id: 3, title: 'Add a Motorcycle child class', test: (code: string) => code.includes('class Motorcycle(Vehicle)') },
    { id: 4, title: 'Override a method in child class', test: (code: string) => code.match(/class (Car|Motorcycle)\(Vehicle\)[\s\S]*def (drive|honk|move)/) !== null },
    { id: 5, title: 'Create instances and call methods', test: (code: string) => code.includes('Car(') && code.includes('Motorcycle(') },
];

export default function Lesson10() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# Advanced Pet Academy - Inheritance Practice!

# Challenge 1: Create a Vehicle parent class
class Vehicle:
    def __init__(self, brand):
        self.brand = brand

    def move(self):
        print(f"{self.brand} is moving")

    def honk(self):
        print("Beep!")

# Challenge 2: Create Car child class
class Car(Vehicle):
    def __init__(self, brand, doors):
        super().__init__(brand)  # Call parent __init__
        self.doors = doors

    def honk(self):  # Challenge 4: Override method
        print(f"{self.brand} car goes: HONK HONK!")

# Challenge 3: Create Motorcycle child class
class Motorcycle(Vehicle):
    def honk(self):  # Override method
        print(f"{self.brand} bike goes: BEEP BEEP!")

    def wheelie(self):  # Unique method
        print(f"{self.brand} does a wheelie!")

# Challenge 5: Create instances
my_car = Car("Tesla", 4)
my_bike = Motorcycle("Harley")

my_car.move()
my_car.honk()

my_bike.move()
my_bike.honk()
my_bike.wheelie()
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

        if (code.includes('.move()')) {
            outputLines.push('Tesla is moving');
        }
        if (code.includes('my_car.honk()') || code.includes('Car(')) {
            outputLines.push('Tesla car goes: HONK HONK!');
        }
        if (code.includes('my_bike.move()') || code.includes('Motorcycle(')) {
            outputLines.push('Harley is moving');
        }
        if (code.includes('my_bike.honk()')) {
            outputLines.push('Harley bike goes: BEEP BEEP!');
        }
        if (code.includes('.wheelie()')) {
            outputLines.push('Harley does a wheelie!');
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

    if (isLoading || !user) return <div className={styles.container}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🎓</motion.div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #f97316, #eab308)' }}>🎓</motion.div>
                <motion.h2 className={styles.successTitle} style={{ color: '#f97316' }}>Academy Graduate!</motion.h2>
                <motion.p className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div className={styles.successXp}><Zap size={20} /> +{LESSON.xpReward} XP</motion.div>
                <Link href="/level8/lesson11" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>Final Project! <ChevronRight size={18} /></Link>
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
                    <p>Practice inheritance with a Vehicle family!</p>
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
                        <div className={styles.codeHeader}><span>vehicle_academy.py</span><span>Python</span></div>
                        <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '500px' }} />
                    </div>
                    <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #f97316, #eab308)' }}><Play size={18} /> Run & Check</button>
                    {output && <motion.div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></motion.div>}
                </div>

                <div className={styles.navBar}>
                    <Link href="/level8/lesson9" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                    <span style={{ color: 'var(--text-muted)' }}>Complete all 5!</span>
                </div>
            </div>
        </div>
    );
}
