'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Sparkles, Clover, Dice6 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL6_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL6_LESSONS[7]; // Lesson 8 (index 7)
const LESSON_ID = 83;

export default function Lesson8() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# Lucky Number Generator - Project Part 1!
import random
import math

# Generate your lucky numbers!
print("=== LUCKY NUMBER GENERATOR ===")
print("")

# Lucky number between 1 and 100
lucky_num = random.randint(1, 100)
print("Your Lucky Number:", lucky_num)

# Three lottery numbers
num1 = random.randint(1, 50)
num2 = random.randint(1, 50)
num3 = random.randint(1, 50)
print("Lottery Numbers:", num1, num2, num3)

# Lucky percentage (0-100%)
lucky_percent = random.uniform(0, 100)
lucky_rounded = round(lucky_percent, 1)
print("Luck Level:", lucky_rounded, "%")

# Calculate a power number
base = random.randint(2, 5)
power_result = math.pow(base, 2)
print("Power Number:", base, "squared =", power_result)

# Random fortune message
fortunes = ["Great luck ahead!", "Success is coming!", "Today is your day!"]
fortune_index = random.randint(0, 2)
print("")
print("Fortune:", fortunes[fortune_index])
`);
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasLuckyNum, setHasLuckyNum] = useState(false);
    const [hasLottery, setHasLottery] = useState(false);
    const [hasFortune, setHasFortune] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            const variables: Record<string, number | string | string[]> = {};
            const lists: Record<string, string[]> = {};

            // Simulate random functions
            const simulateRandom = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
            const simulateUniform = (min: number, max: number) => Math.random() * (max - min) + min;

            let inList = false;
            let currentListName = '';
            let currentListItems: string[] = [];

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || trimmed === '' || trimmed.startsWith('import')) continue;

                // List definition on single line
                const listMatch = trimmed.match(/^(\w+)\s*=\s*\[(.+)\]$/);
                if (listMatch) {
                    const varName = listMatch[1];
                    const items = listMatch[2].split(',').map(i => i.trim().replace(/['"]/g, ''));
                    lists[varName] = items;
                    setHasFortune(true);
                    continue;
                }

                // random.randint
                const randintMatch = trimmed.match(/^(\w+)\s*=\s*random\.randint\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)$/);
                if (randintMatch) {
                    const varName = randintMatch[1];
                    const min = parseInt(randintMatch[2]);
                    const max = parseInt(randintMatch[3]);
                    variables[varName] = simulateRandom(min, max);
                    if (varName.includes('lucky') || varName.includes('num')) setHasLuckyNum(true);
                    if (varName === 'num1' || varName === 'num2' || varName === 'num3') setHasLottery(true);
                    continue;
                }

                // random.uniform
                const uniformMatch = trimmed.match(/^(\w+)\s*=\s*random\.uniform\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*\)$/);
                if (uniformMatch) {
                    const varName = uniformMatch[1];
                    const min = parseFloat(uniformMatch[2]);
                    const max = parseFloat(uniformMatch[3]);
                    variables[varName] = simulateUniform(min, max);
                    continue;
                }

                // round function
                const roundMatch = trimmed.match(/^(\w+)\s*=\s*round\s*\(\s*(\w+)\s*,\s*(\d+)\s*\)$/);
                if (roundMatch) {
                    const varName = roundMatch[1];
                    const sourceVar = roundMatch[2];
                    const decimals = parseInt(roundMatch[3]);
                    if (variables[sourceVar] !== undefined) {
                        variables[varName] = Number(Number(variables[sourceVar]).toFixed(decimals));
                    }
                    continue;
                }

                // math.pow
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

                // Print statements
                // print("text")
                const printStrMatch = trimmed.match(/^print\s*\(\s*["'](.*)["']\s*\)$/);
                if (printStrMatch) {
                    outputLines.push(printStrMatch[1]);
                    continue;
                }

                // print("label", var)
                const printLabelVarMatch = trimmed.match(/^print\s*\(\s*["'](.+)["']\s*,\s*(\w+)\s*\)$/);
                if (printLabelVarMatch) {
                    const label = printLabelVarMatch[1];
                    const varName = printLabelVarMatch[2];
                    if (variables[varName] !== undefined) {
                        outputLines.push(`${label} ${variables[varName]}`);
                    }
                    continue;
                }

                // print("label", var, var, var) - for lottery numbers
                const printMultiMatch = trimmed.match(/^print\s*\(\s*["'](.+)["']\s*,\s*(\w+)\s*,\s*(\w+)\s*,\s*(\w+)\s*\)$/);
                if (printMultiMatch) {
                    const label = printMultiMatch[1];
                    const v1 = printMultiMatch[2];
                    const v2 = printMultiMatch[3];
                    const v3 = printMultiMatch[4];
                    outputLines.push(`${label} ${variables[v1]} ${variables[v2]} ${variables[v3]}`);
                    continue;
                }

                // print("label", var, "text") - for luck percentage
                const printVarTextMatch = trimmed.match(/^print\s*\(\s*["'](.+)["']\s*,\s*(\w+)\s*,\s*["'](.+)["']\s*\)$/);
                if (printVarTextMatch) {
                    const label = printVarTextMatch[1];
                    const varName = printVarTextMatch[2];
                    const suffix = printVarTextMatch[3];
                    if (variables[varName] !== undefined) {
                        outputLines.push(`${label} ${variables[varName]} ${suffix}`);
                    }
                    continue;
                }

                // print("label", var, "text", var) - for power
                const printPowerMatch = trimmed.match(/^print\s*\(\s*["'](.+)["']\s*,\s*(\w+)\s*,\s*["'](.+)["']\s*,\s*(\w+)\s*\)$/);
                if (printPowerMatch) {
                    const label = printPowerMatch[1];
                    const v1 = printPowerMatch[2];
                    const text = printPowerMatch[3];
                    const v2 = printPowerMatch[4];
                    outputLines.push(`${label} ${variables[v1]} ${text} ${variables[v2]}`);
                    continue;
                }

                // print("label", list[index])
                const printListMatch = trimmed.match(/^print\s*\(\s*["'](.+)["']\s*,\s*(\w+)\s*\[\s*(\w+)\s*\]\s*\)$/);
                if (printListMatch) {
                    const label = printListMatch[1];
                    const listName = printListMatch[2];
                    const indexVar = printListMatch[3];
                    if (lists[listName] && variables[indexVar] !== undefined) {
                        const idx = Number(variables[indexVar]);
                        if (lists[listName][idx]) {
                            outputLines.push(`${label} ${lists[listName][idx]}`);
                        }
                    }
                    continue;
                }
            }

            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code to see output!');
        } catch {
            setOutput('Error! Check your code syntax.');
        }
    };

    const checkQuiz = () => {
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = true;
        setQuizChecked(newChecked);
        const correctAnswers = [1, 2]; // Q1=randint for integers, Q2=list with index

        if (quizAnswers[currentQuiz] === correctAnswers[currentQuiz]) {
            if (currentQuiz === 0) {
                setTimeout(() => setCurrentQuiz(1), 1000);
            } else {
                setTimeout(() => {
                    addXpAndCoins(LESSON.xpReward, 15);
                    completeLevel(LESSON_ID, LESSON.xpReward, 15, 1, 120);
                    setLessonComplete(true);
                }, 1000);
            }
        }
    };

    const retryQuiz = () => {
        const newAnswers = [...quizAnswers];
        newAnswers[currentQuiz] = null;
        setQuizAnswers(newAnswers);
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = false;
        setQuizChecked(newChecked);
    };

    if (isLoading || !user) {
        return <div className={styles.container} style={{ background: 'var(--bg-primary)' }}><div className="flex items-center justify-center h-screen"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🍀</motion.div></div></div>;
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'rgba(0, 0, 0, 0.95)' }}>
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', duration: 0.8 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
                    <Clover size={50} className="text-white" />
                </motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle} style={{ color: '#10b981' }}>
                    App Builder! 🍀
                </motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>
                    {LESSON.successMessage}
                </motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className={styles.successXp} style={{ background: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                    <Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                    <Link href="/level6/lesson9" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
                        Final Project <ChevronRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            <header className={styles.header} style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid #10b981' }}>
                <Link href="/level6" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 9</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                {!showQuiz ? (
                    <>
                        <div className={styles.lessonTitle}>
                            <motion.div className={styles.lessonEmoji} animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>{LESSON.emoji}</motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1 style={{ color: '#10b981' }}>{LESSON.title}</h1>
                                <p style={{ color: 'var(--text-muted)' }}>Project: <code style={{ color: '#3b82f6' }}>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Project Introduction */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2))', border: '2px solid rgba(16, 185, 129, 0.4)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Clover size={28} style={{ color: '#10b981' }} />
                                <Dice6 size={24} style={{ color: '#3b82f6' }} />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#10b981' }}>PROJECT: Lucky Number Generator</span>
                            </div>
                            <p style={{ marginBottom: '1rem' }}>
                                Build a fun app that generates lucky numbers using
                                <strong style={{ color: '#10b981' }}> random</strong> and
                                <strong style={{ color: '#3b82f6' }}> math</strong> modules!
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                                <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem' }}>🎯</div>
                                    <div style={{ fontWeight: 600, color: '#10b981' }}>Lucky Numbers</div>
                                </div>
                                <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem' }}>🎰</div>
                                    <div style={{ fontWeight: 600, color: '#3b82f6' }}>Lottery Picks</div>
                                </div>
                                <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem' }}>🔮</div>
                                    <div style={{ fontWeight: 600, color: '#8b5cf6' }}>Fortunes</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* What You'll Build */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: '#10b981' }}>
                            <h3 style={{ marginBottom: '1rem', color: '#10b981' }}>What You'll Create:</h3>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                    <span style={{ fontWeight: 700, color: '#10b981' }}>1.</span>
                                    <span>A lucky number between 1-100</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                    <span style={{ fontWeight: 700, color: '#3b82f6' }}>2.</span>
                                    <span>Three lottery numbers</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                    <span style={{ fontWeight: 700, color: '#8b5cf6' }}>3.</span>
                                    <span>A luck percentage with decimals</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                    <span style={{ fontWeight: 700, color: '#f59e0b' }}>4.</span>
                                    <span>A random fortune message</span>
                                </div>
                            </div>
                        </div>

                        {/* Code Editor */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: '#10b981' }}>Build Your Lucky Number Generator:</h3>
                            <div className={styles.editor} style={{ borderColor: '#10b981' }}>
                                <div className={styles.codeHeader}><span>lucky_generator.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '450px' }} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
                                <Play size={18} /> Generate Lucky Numbers!
                            </button>
                            {output && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.outputBox}>
                                    <div className={styles.outputLabel}>Your Luck:</div>
                                    <div className={styles.outputText} style={{ whiteSpace: 'pre-wrap' }}>{output}</div>
                                </motion.div>
                            )}
                        </div>

                        {/* Progress */}
                        <div className={styles.challenges} style={{ background: 'var(--bg-secondary)', borderColor: '#10b981' }}>
                            <h3 style={{ color: '#10b981' }}>Project Progress:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasLuckyNum ? styles.done : ''}`} style={hasLuckyNum ? { background: '#10b981', borderColor: '#10b981' } : {}}>
                                        {hasLuckyNum && <Check size={14} />}
                                    </div>
                                    Generate a lucky number with random.randint()
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasLottery ? styles.done : ''}`} style={hasLottery ? { background: '#3b82f6', borderColor: '#3b82f6' } : {}}>
                                        {hasLottery && <Check size={14} />}
                                    </div>
                                    Create lottery numbers
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasFortune ? styles.done : ''}`} style={hasFortune ? { background: '#8b5cf6', borderColor: '#8b5cf6' } : {}}>
                                        {hasFortune && <Check size={14} />}
                                    </div>
                                    Add fortune messages in a list
                                </li>
                            </ul>
                        </div>

                        <div className={styles.tipBox} style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: '#10b981' }}>
                            <Lightbulb size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, color: '#10b981' }}>Pro Tip:</p>
                                <p style={{ fontSize: '0.9rem' }}>
                                    Use <code>random.randint(0, len(list)-1)</code> to pick a random item from a list!
                                    Or use <code>random.choice(list)</code> directly.
                                </p>
                            </div>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level6/lesson7" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)} style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection} style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))', borderColor: '#10b981' }}>
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍀</motion.div>
                        <h2 className={styles.quizTitle} style={{ color: '#10b981' }}>Project Quiz! (Question {currentQuiz + 1}/2)</h2>

                        {currentQuiz === 0 ? (
                            <>
                                <p className={styles.quizQuestion}>Which function generates random whole numbers?</p>
                                <div className={styles.quizOptions}>
                                    {['random.uniform()', 'random.randint()', 'random.random()'].map((opt, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[0]) { const a = [...quizAnswers]; a[0] = idx; setQuizAnswers(a); } }}
                                            className={`${styles.quizOption} ${quizAnswers[0] === idx ? styles.selected : ''} ${quizChecked[0] && idx === 1 ? styles.correct : ''} ${quizChecked[0] && quizAnswers[0] === idx && idx !== 1 ? styles.wrong : ''}`}
                                            disabled={quizChecked[0]}><code>{opt}</code></button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>How do you pick a random item from a list called "fortunes"?</p>
                                <div className={styles.quizOptions}>
                                    {['fortunes.random()', 'random(fortunes)', 'fortunes[random.randint(0, len(fortunes)-1)]'].map((opt, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[1]) { const a = [...quizAnswers]; a[1] = idx; setQuizAnswers(a); } }}
                                            className={`${styles.quizOption} ${quizAnswers[1] === idx ? styles.selected : ''} ${quizChecked[1] && idx === 2 ? styles.correct : ''} ${quizChecked[1] && quizAnswers[1] === idx && idx !== 2 ? styles.wrong : ''}`}
                                            disabled={quizChecked[1]}><code style={{ fontSize: '0.8rem' }}>{opt}</code></button>
                                    ))}
                                </div>
                            </>
                        )}

                        {!quizChecked[currentQuiz] ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswers[currentQuiz] === null} style={{ background: '#10b981' }}>Check Answer</button>
                        ) : quizAnswers[currentQuiz] !== (currentQuiz === 0 ? 1 : 2) ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>{currentQuiz === 0 ? 'randint() gives you random integers (whole numbers)!' : 'Use random index to pick from a list!'}</p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem', background: '#10b981' }}>Try Again</button>
                            </motion.div>
                        ) : currentQuiz === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${styles.quizFeedback} ${styles.success}`}>
                                <h4>Correct!</h4><p>random.randint() for whole numbers! Next question...</p>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
