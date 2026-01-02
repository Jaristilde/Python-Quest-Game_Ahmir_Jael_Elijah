'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL6_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL6_LESSONS[4]; // Lesson 5 (index 4)
const LESSON_ID = 80;

export default function Lesson5() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# SUPERCHARGE: Module Master Challenge!
# Combine math, random, and datetime modules

import math
import random
import datetime

# Challenge 1: Calculate the square root of a random number
num = random.randint(1, 100)
sqrt_result = math.sqrt(num)
print("Random number:", num)
print("Square root:", sqrt_result)

# Challenge 2: Generate a random float and round it
random_float = random.uniform(1.0, 10.0)
rounded = round(random_float, 2)
print("Random float rounded:", rounded)

# Challenge 3: Get today's date
today = datetime.date.today()
print("Today is:", today)

# Challenge 4: Calculate days until New Year
new_year = datetime.date(2026, 1, 1)
days_left = (new_year - today).days
print("Days until 2026:", days_left)

# Challenge 5: Random math operation
a = random.randint(1, 20)
b = random.randint(1, 20)
power_result = math.pow(a, 2)
print(a, "squared is:", power_result)
`);
    const [output, setOutput] = useState('');
    const [challengesComplete, setChallengesComplete] = useState<boolean[]>([false, false, false, false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [supercharged, setSupercharged] = useState(false);

    const challenges = [
        { id: 1, title: "Use math.sqrt()", description: "Calculate a square root with math module", check: (code: string) => /math\.sqrt\s*\(/.test(code) && /random\.randint\s*\(/.test(code) },
        { id: 2, title: "Use random.uniform()", description: "Generate a random float number", check: (code: string) => /random\.uniform\s*\(/.test(code) && /round\s*\(/.test(code) },
        { id: 3, title: "Get today's date", description: "Use datetime.date.today()", check: (code: string) => /datetime\.date\.today\s*\(\)/.test(code) },
        { id: 4, title: "Calculate date difference", description: "Find days between two dates", check: (code: string) => /datetime\.date\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/.test(code) && /\.days/.test(code) },
        { id: 5, title: "Use math.pow()", description: "Calculate a power using math", check: (code: string) => /math\.pow\s*\(/.test(code) },
    ];

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            const variables: Record<string, number | string> = {};

            // Simulate module functions
            const simulateRandom = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
            const simulateUniform = (min: number, max: number) => Math.random() * (max - min) + min;

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || trimmed === '' || trimmed.startsWith('import')) continue;

                // Variable assignment with random.randint
                const randintMatch = trimmed.match(/^(\w+)\s*=\s*random\.randint\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)$/);
                if (randintMatch) {
                    const varName = randintMatch[1];
                    const min = parseInt(randintMatch[2]);
                    const max = parseInt(randintMatch[3]);
                    variables[varName] = simulateRandom(min, max);
                    continue;
                }

                // Variable assignment with random.uniform
                const uniformMatch = trimmed.match(/^(\w+)\s*=\s*random\.uniform\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*\)$/);
                if (uniformMatch) {
                    const varName = uniformMatch[1];
                    const min = parseFloat(uniformMatch[2]);
                    const max = parseFloat(uniformMatch[3]);
                    variables[varName] = simulateUniform(min, max);
                    continue;
                }

                // Variable assignment with math.sqrt
                const sqrtMatch = trimmed.match(/^(\w+)\s*=\s*math\.sqrt\s*\(\s*(\w+)\s*\)$/);
                if (sqrtMatch) {
                    const varName = sqrtMatch[1];
                    const argVar = sqrtMatch[2];
                    if (variables[argVar] !== undefined) {
                        variables[varName] = Math.sqrt(Number(variables[argVar]));
                    }
                    continue;
                }

                // Variable assignment with math.pow
                const powMatch = trimmed.match(/^(\w+)\s*=\s*math\.pow\s*\(\s*(\w+)\s*,\s*(\d+)\s*\)$/);
                if (powMatch) {
                    const varName = powMatch[1];
                    const base = powMatch[2];
                    const exp = parseInt(powMatch[3]);
                    if (variables[base] !== undefined) {
                        variables[varName] = Math.pow(Number(variables[base]), exp);
                    }
                    continue;
                }

                // Variable assignment with round
                const roundMatch = trimmed.match(/^(\w+)\s*=\s*round\s*\(\s*(\w+)\s*,\s*(\d+)\s*\)$/);
                if (roundMatch) {
                    const varName = roundMatch[1];
                    const numVar = roundMatch[2];
                    const decimals = parseInt(roundMatch[3]);
                    if (variables[numVar] !== undefined) {
                        variables[varName] = Number(Number(variables[numVar]).toFixed(decimals));
                    }
                    continue;
                }

                // datetime.date.today()
                const todayMatch = trimmed.match(/^(\w+)\s*=\s*datetime\.date\.today\s*\(\s*\)$/);
                if (todayMatch) {
                    const varName = todayMatch[1];
                    const today = new Date();
                    variables[varName] = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                    continue;
                }

                // datetime.date(year, month, day)
                const dateMatch = trimmed.match(/^(\w+)\s*=\s*datetime\.date\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
                if (dateMatch) {
                    const varName = dateMatch[1];
                    const year = parseInt(dateMatch[2]);
                    const month = parseInt(dateMatch[3]);
                    const day = parseInt(dateMatch[4]);
                    variables[varName] = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    continue;
                }

                // Date difference calculation
                const diffMatch = trimmed.match(/^(\w+)\s*=\s*\(\s*(\w+)\s*-\s*(\w+)\s*\)\.days$/);
                if (diffMatch) {
                    const varName = diffMatch[1];
                    const date1 = diffMatch[2];
                    const date2 = diffMatch[3];
                    if (variables[date1] && variables[date2]) {
                        const d1 = new Date(String(variables[date1]));
                        const d2 = new Date(String(variables[date2]));
                        const diffTime = d1.getTime() - d2.getTime();
                        variables[varName] = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    }
                    continue;
                }

                // Print with label and variable
                const printLabelVarMatch = trimmed.match(/^print\s*\(\s*["'](.+)["']\s*,\s*(\w+)\s*\)$/);
                if (printLabelVarMatch) {
                    const label = printLabelVarMatch[1];
                    const varName = printLabelVarMatch[2];
                    if (variables[varName] !== undefined) {
                        const val = typeof variables[varName] === 'number'
                            ? (Number.isInteger(variables[varName]) ? variables[varName] : Number(variables[varName]).toFixed(2))
                            : variables[varName];
                        outputLines.push(`${label} ${val}`);
                    }
                    continue;
                }

                // Print with multiple items: print(var, "text", var)
                const printMultiMatch = trimmed.match(/^print\s*\(\s*(\w+)\s*,\s*["'](.+)["']\s*,\s*(\w+)\s*\)$/);
                if (printMultiMatch) {
                    const var1 = printMultiMatch[1];
                    const text = printMultiMatch[2];
                    const var2 = printMultiMatch[3];
                    if (variables[var1] !== undefined && variables[var2] !== undefined) {
                        const val = typeof variables[var2] === 'number'
                            ? (Number.isInteger(variables[var2]) ? variables[var2] : Number(variables[var2]).toFixed(2))
                            : variables[var2];
                        outputLines.push(`${variables[var1]} ${text} ${val}`);
                    }
                    continue;
                }

                // Simple print string
                const printStrMatch = trimmed.match(/^print\s*\(\s*["'](.+)["']\s*\)$/);
                if (printStrMatch) {
                    outputLines.push(printStrMatch[1]);
                }
            }

            // Check challenges
            const newComplete = [...challengesComplete];
            challenges.forEach((challenge, idx) => {
                if (challenge.check(code)) {
                    newComplete[idx] = true;
                }
            });
            setChallengesComplete(newComplete);

            // Check if all complete
            if (newComplete.every(c => c) && !lessonComplete) {
                setSupercharged(true);
                setTimeout(() => {
                    addXpAndCoins(LESSON.xpReward, 15);
                    completeLevel(LESSON_ID, LESSON.xpReward, 15, 1, 90);
                    setLessonComplete(true);
                }, 1500);
            }

            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code to see output!');
        } catch {
            setOutput('Error! Check your code syntax.');
        }
    };

    if (isLoading || !user) {
        return <div className={styles.container} style={{ background: 'var(--bg-primary)' }}><div className="flex items-center justify-center h-screen"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>💪</motion.div></div></div>;
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'rgba(0, 0, 0, 0.95)' }}>
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', duration: 0.8 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                    <Trophy size={50} className="text-white" />
                </motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle} style={{ color: '#3b82f6' }}>
                    SUPERCHARGED! 💪
                </motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>
                    {LESSON.successMessage}
                </motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className={styles.successXp} style={{ background: 'rgba(59, 130, 246, 0.2)', borderColor: 'rgba(59, 130, 246, 0.4)' }}>
                    <Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP (BONUS!)
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                    <Link href="/level6/lesson6" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                        Next Lesson <ChevronRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            <header className={styles.header} style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid #3b82f6' }}>
                <Link href="/level6" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 9</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                <div className={styles.lessonTitle}>
                    <motion.div className={styles.lessonEmoji} animate={{ y: [0, -5, 0], scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>{LESSON.emoji}</motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1 style={{ color: '#3b82f6' }}>{LESSON.title}</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Practice: <code style={{ color: '#8b5cf6' }}>{LESSON.concept}</code></p>
                    </div>
                </div>

                {/* Supercharge Banner */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))', border: '2px solid rgba(59, 130, 246, 0.4)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Sparkles size={24} style={{ color: '#3b82f6' }} />
                        <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#3b82f6' }}>SUPERCHARGE CHALLENGE!</span>
                        <Sparkles size={24} style={{ color: '#3b82f6' }} />
                    </div>
                    <p style={{ color: 'var(--text-muted)' }}>Combine math, random, and datetime modules - Complete all 5 challenges for BONUS XP!</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                        {challengesComplete.map((done, idx) => (
                            <motion.div key={idx} animate={done ? { scale: [1, 1.2, 1] } : {}} style={{ width: '40px', height: '40px', borderRadius: '50%', background: done ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                                {done ? <Check size={20} /> : idx + 1}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Challenges List */}
                <div className={styles.challenges} style={{ background: 'var(--bg-secondary)', borderColor: '#3b82f6' }}>
                    <h3 style={{ color: '#3b82f6', marginBottom: '1rem' }}>Complete These Challenges:</h3>
                    <ul className={styles.challengeList}>
                        {challenges.map((challenge, idx) => (
                            <li key={idx}>
                                <div className={`${styles.challengeCheck} ${challengesComplete[idx] ? styles.done : ''}`} style={challengesComplete[idx] ? { background: '#3b82f6', borderColor: '#3b82f6' } : {}}>
                                    {challengesComplete[idx] && <Check size={14} />}
                                </div>
                                <div>
                                    <span style={{ fontWeight: 600, color: challengesComplete[idx] ? '#3b82f6' : 'inherit' }}>{challenge.title}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>- {challenge.description}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Code Editor */}
                <div className={styles.codeSection}>
                    <h3 style={{ color: '#3b82f6' }}>Your Code:</h3>
                    <div className={styles.editor} style={{ borderColor: '#3b82f6' }}>
                        <div className={styles.codeHeader}><span>module_master.py</span><span>Python</span></div>
                        <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '400px' }} />
                    </div>
                    <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                        <Play size={18} /> Run & Check
                    </button>
                    {output && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.outputBox}>
                            <div className={styles.outputLabel}>Output:</div>
                            <div className={styles.outputText} style={{ whiteSpace: 'pre-wrap' }}>{output}</div>
                        </motion.div>
                    )}
                </div>

                {/* Supercharged Animation */}
                {supercharged && (
                    <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                        <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: 2 }} style={{ fontSize: '6rem' }}>
                            ⚡
                        </motion.div>
                        <motion.h2 animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5, repeat: 2 }} style={{ color: '#3b82f6', fontSize: '2.5rem', fontWeight: 800 }}>
                            SUPERCHARGED!
                        </motion.h2>
                    </motion.div>
                )}

                <div className={styles.tipBox} style={{ background: 'rgba(59, 130, 246, 0.15)', borderColor: '#3b82f6' }}>
                    <Lightbulb size={20} style={{ color: '#3b82f6', flexShrink: 0 }} />
                    <div>
                        <p style={{ fontWeight: 600, color: '#3b82f6' }}>Module Power Tips:</p>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                            <li><code>math.sqrt()</code> - Calculate square roots</li>
                            <li><code>random.uniform()</code> - Get random floats</li>
                            <li><code>datetime.date.today()</code> - Get current date</li>
                            <li>Subtract dates and use <code>.days</code> for difference</li>
                        </ul>
                    </div>
                </div>

                <div className={styles.navBar}>
                    <Link href="/level6/lesson4" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Complete all challenges to continue!</span>
                </div>
            </div>
        </div>
    );
}
