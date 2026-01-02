'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Code, Sparkles, Star, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL9_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL9_LESSONS[6];
const LESSON_ID = 115;

export default function Lesson7() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# FUN FACTS GENERATOR - Your Final Project!
# Build a complete API-powered app!

import random

# Step 1: Create our "API" database
FACTS_DATABASE = [
    {"fact": "Honey never spoils - archaeologists found 3000-year-old honey in Egyptian tombs!", "category": "food"},
    {"fact": "Octopuses have three hearts and blue blood!", "category": "animals"},
    {"fact": "A day on Venus is longer than a year on Venus!", "category": "space"},
    {"fact": "Bananas are berries, but strawberries aren't!", "category": "food"},
    {"fact": "Sharks existed before trees did!", "category": "animals"},
    {"fact": "The Eiffel Tower grows about 6 inches in summer!", "category": "science"},
    {"fact": "Cows have best friends and get stressed when separated!", "category": "animals"},
    {"fact": "Hot water freezes faster than cold water!", "category": "science"},
]

# Step 2: Create the API function
def get_random_fact(category=None):
    """Fetch a random fact, optionally filtered by category"""
    try:
        facts = FACTS_DATABASE

        # Filter by category if specified
        if category:
            facts = [f for f in facts if f["category"] == category]
            if not facts:
                return {"error": "No facts found for that category!"}

        # Return a random fact
        return random.choice(facts)
    except Exception as e:
        return {"error": f"Oops! Something went wrong: {e}"}

# Step 3: Display the fact nicely
def display_fact(fact_data):
    """Show the fact in a fun way"""
    if "error" in fact_data:
        print("😢", fact_data["error"])
    else:
        print("🎲 FUN FACT!")
        print("=" * 40)
        print(f"📚 {fact_data['fact']}")
        print(f"🏷️  Category: {fact_data['category']}")
        print("=" * 40)

# Step 4: Use our Fun Facts Generator!
print("Welcome to the Fun Facts Machine!")
print()

# Get a random fact
fact = get_random_fact()
display_fact(fact)

print()

# Get a fact about animals
print("Let's get an animal fact:")
animal_fact = get_random_fact(category="animals")
display_fact(animal_fact)
`);
    const [output, setOutput] = useState('');
    const [step1, setStep1] = useState(false);
    const [step2, setStep2] = useState(false);
    const [step3, setStep3] = useState(false);
    const [step4, setStep4] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const facts = [
        { fact: "Honey never spoils - archaeologists found 3000-year-old honey in Egyptian tombs!", category: "food" },
        { fact: "Octopuses have three hearts and blue blood!", category: "animals" },
        { fact: "A day on Venus is longer than a year on Venus!", category: "space" },
        { fact: "Sharks existed before trees did!", category: "animals" },
    ];

    const runCode = () => {
        let outputLines: string[] = [];

        // Check steps
        if (code.includes('FACTS_DATABASE')) {
            setStep1(true);
        }
        if (code.includes('def get_random_fact')) {
            setStep2(true);
        }
        if (code.includes('def display_fact')) {
            setStep3(true);
        }
        if (code.includes('get_random_fact()') && code.includes('display_fact(')) {
            setStep4(true);
        }

        // Generate output
        const randomFact = facts[Math.floor(Math.random() * facts.length)];
        const animalFact = facts.filter(f => f.category === 'animals')[Math.floor(Math.random() * 2)];

        outputLines.push('Welcome to the Fun Facts Machine!');
        outputLines.push('');
        outputLines.push('🎲 FUN FACT!');
        outputLines.push('=' .repeat(40));
        outputLines.push(`📚 ${randomFact.fact}`);
        outputLines.push(`🏷️  Category: ${randomFact.category}`);
        outputLines.push('=' .repeat(40));
        outputLines.push('');
        outputLines.push("Let's get an animal fact:");
        outputLines.push('🎲 FUN FACT!');
        outputLines.push('=' .repeat(40));
        outputLines.push(`📚 ${animalFact.fact}`);
        outputLines.push(`🏷️  Category: ${animalFact.category}`);
        outputLines.push('=' .repeat(40));

        if (step1 && step2 && step3 && step4 && !lessonComplete) {
            outputLines.push('');
            outputLines.push('🎉 AMAZING! You built a complete API app!');
            setTimeout(() => {
                addXpAndCoins(LESSON.xpReward, 25);
                completeLevel(LESSON_ID, LESSON.xpReward, 25, 1, 300);
                setLessonComplete(true);
            }, 1500);
        }

        setOutput(outputLines.join('\n'));
    };

    if (isLoading || !user) return <div className={styles.container}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🎰</motion.div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', duration: 1 }}
                    className={styles.successIcon}
                    style={{ background: 'linear-gradient(135deg, #FF79C6, #8BE9FD, #50FA7B)' }}
                >
                    <Trophy size={50} />
                </motion.div>
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={styles.successTitle}
                    style={{ color: '#FF79C6', fontSize: '2rem' }}
                >
                    YOU DID IT! 🎉
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className={styles.successMessage}
                >
                    {LESSON.successMessage}
                </motion.p>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7 }}
                    className={styles.successXp}
                    style={{ fontSize: '1.5rem' }}
                >
                    <Zap size={28} /> +{LESSON.xpReward} XP
                </motion.div>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9 }}
                >
                    <Link href="/level9/complete" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #FF79C6, #8BE9FD, #50FA7B)', padding: '1rem 2rem', fontSize: '1.1rem' }}>
                        <Star size={20} /> Complete Python Quest! <Star size={20} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            <header className={styles.header} style={{ borderBottom: '2px solid #FF79C6' }}>
                <Link href="/level9" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Star size={16} style={{ color: '#FFD700' }} />
                    <span style={{ fontWeight: 700, color: '#FF79C6' }}>FINAL PROJECT</span>
                    <Star size={16} style={{ color: '#FFD700' }} />
                </div>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                <div className={styles.lessonTitle}>
                    <motion.div
                        className={styles.lessonEmoji}
                        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ background: 'linear-gradient(135deg, #FF79C6, #8BE9FD, #50FA7B)', width: '80px', height: '80px', fontSize: '2.5rem' }}
                    >
                        {LESSON.emoji}
                    </motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1 style={{ color: '#FF79C6', fontSize: '1.75rem' }}>{LESSON.title}</h1>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sparkles size={18} style={{ color: '#50FA7B' }} />
                            Build a <code style={{ color: '#8BE9FD' }}>{LESSON.concept}</code>!
                            <Sparkles size={18} style={{ color: '#50FA7B' }} />
                        </p>
                    </div>
                </div>

                <motion.div className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(255, 121, 198, 0.2), rgba(139, 233, 253, 0.2), rgba(80, 250, 123, 0.2))', borderColor: '#FFD700', borderWidth: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Trophy size={28} style={{ color: '#FFD700' }} />
                        <span style={{ fontWeight: 700, color: '#FF79C6', fontSize: '1.2rem' }}>Your Final Challenge!</span>
                        <Trophy size={28} style={{ color: '#FFD700' }} />
                    </div>
                    <p style={{ textAlign: 'center' }}>Build a complete <strong style={{ color: '#8BE9FD' }}>Fun Facts Generator</strong> using everything you've learned about APIs!</p>
                </motion.div>

                <div className={styles.challenges} style={{ borderColor: '#50FA7B', marginBottom: '1.5rem' }}>
                    <h3 style={{ color: '#FF79C6' }}>Project Steps:</h3>
                    <ul className={styles.challengeList}>
                        <li><div className={`${styles.challengeCheck} ${step1 ? styles.done : ''}`}>{step1 && <Check size={14} />}</div>Step 1: Create the facts database</li>
                        <li><div className={`${styles.challengeCheck} ${step2 ? styles.done : ''}`}>{step2 && <Check size={14} />}</div>Step 2: Create get_random_fact() function</li>
                        <li><div className={`${styles.challengeCheck} ${step3 ? styles.done : ''}`}>{step3 && <Check size={14} />}</div>Step 3: Create display_fact() function</li>
                        <li><div className={`${styles.challengeCheck} ${step4 ? styles.done : ''}`}>{step4 && <Check size={14} />}</div>Step 4: Use your Fun Facts Generator!</li>
                    </ul>
                    <div style={{ marginTop: '1rem', textAlign: 'center', color: (step1 && step2 && step3 && step4) ? '#50FA7B' : 'var(--text-muted)', fontWeight: 700 }}>
                        {step1 && step2 && step3 && step4 ? '🎉 All steps complete!' : `${[step1, step2, step3, step4].filter(Boolean).length}/4 Complete`}
                    </div>
                </div>

                <div className={styles.codeSection}>
                    <h3 style={{ color: '#8BE9FD', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Code size={20} /> Build Your Fun Facts Generator!
                    </h3>
                    <div className={styles.editor} style={{ borderColor: '#FF79C6', borderWidth: '2px' }}>
                        <div className={styles.codeHeader}><span>fun_facts_generator.py</span><span>Python</span></div>
                        <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '550px' }} />
                    </div>
                    <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #FF79C6, #8BE9FD, #50FA7B)', fontSize: '1.1rem', padding: '0.875rem 2rem' }}>
                        <Play size={20} /> Run Fun Facts Generator!
                    </button>
                    {output && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.outputBox}
                        >
                            <div className={styles.outputLabel}>Output:</div>
                            <div className={styles.outputText} style={{ whiteSpace: 'pre-wrap' }}>{output}</div>
                        </motion.div>
                    )}
                </div>

                <div className={styles.navBar}>
                    <Link href="/level9/lesson6" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                    <span style={{ color: '#FFD700', fontWeight: 600 }}>Complete all 4 steps!</span>
                </div>
            </div>
        </div>
    );
}
