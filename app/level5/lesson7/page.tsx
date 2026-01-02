'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Bot, Sparkles, Gamepad2, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL5_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL5_LESSONS[6]; // Lesson 7
const LESSON_ID = 69;

export default function Lesson7() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# Video Game Inventory System - Part 1
# Build your inventory dictionary!

inventory = {
    "health_potion": 3,
    "sword": 1,
    "gold_coins": 50
}

# Show all items
print("=== YOUR INVENTORY ===")
for item, count in inventory.items():
    print(item, ":", count)

# Add a new item
inventory["shield"] = 1
print("Added shield!")

# Use a health potion
if inventory["health_potion"] > 0:
    inventory["health_potion"] = inventory["health_potion"] - 1
    print("Used health potion! Remaining:", inventory["health_potion"])

# Pick up more gold
inventory["gold_coins"] = inventory["gold_coins"] + 25
print("Found gold! Total:", inventory["gold_coins"])
`);
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasInventory, setHasInventory] = useState(false);
    const [hasAddedItem, setHasAddedItem] = useState(false);
    const [hasUsedItem, setHasUsedItem] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            const dicts: Record<string, Record<string, number>> = {};
            let currentDict = '';
            let inDict = false;
            let inForLoop = false;
            let loopKeyVar = '';
            let loopValueVar = '';
            let loopDictName = '';

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || trimmed === '') continue;

                // Dictionary creation start
                const dictStartMatch = trimmed.match(/^(\w+)\s*=\s*\{$/);
                if (dictStartMatch) {
                    currentDict = dictStartMatch[1];
                    dicts[currentDict] = {};
                    inDict = true;
                    setHasInventory(true);
                    continue;
                }

                // Key-value pair inside dict
                if (inDict) {
                    const kvMatch = trimmed.match(/^["']([^"']+)["']\s*:\s*(\d+),?$/);
                    if (kvMatch) {
                        dicts[currentDict][kvMatch[1]] = Number(kvMatch[2]);
                        continue;
                    }
                    if (trimmed === '}') {
                        inDict = false;
                        continue;
                    }
                }

                // For loop with items
                const forItemsMatch = trimmed.match(/^for\s+(\w+),\s*(\w+)\s+in\s+(\w+)\.items\(\):$/);
                if (forItemsMatch) {
                    loopKeyVar = forItemsMatch[1];
                    loopValueVar = forItemsMatch[2];
                    loopDictName = forItemsMatch[3];
                    inForLoop = true;
                    continue;
                }

                // Print inside loop
                if (inForLoop && line.match(/^\s+/) && trimmed.startsWith('print(')) {
                    const dict = dicts[loopDictName];
                    if (dict) {
                        // Handle print(key, ":", value)
                        const printBothMatch = trimmed.match(/print\s*\(\s*(\w+)\s*,\s*["']:["']\s*,\s*(\w+)\s*\)/);
                        if (printBothMatch) {
                            for (const [k, v] of Object.entries(dict)) {
                                outputLines.push(`${k} : ${v}`);
                            }
                        }
                    }
                    continue;
                }

                // Check if we're exiting loop
                if (inForLoop && !line.match(/^\s+/)) {
                    inForLoop = false;
                }

                // Add new item: dict["key"] = value
                const addMatch = trimmed.match(/^(\w+)\[["']([^"']+)["']\]\s*=\s*(\d+)$/);
                if (addMatch) {
                    const dictName = addMatch[1];
                    const key = addMatch[2];
                    const value = Number(addMatch[3]);
                    if (dicts[dictName]) {
                        if (dicts[dictName][key] === undefined) {
                            setHasAddedItem(true);
                        }
                        dicts[dictName][key] = value;
                    }
                    continue;
                }

                // Update item: dict["key"] = dict["key"] +/- value
                const updateMatch = trimmed.match(/^(\w+)\[["']([^"']+)["']\]\s*=\s*\1\[["']\2["']\]\s*([+-])\s*(\d+)$/);
                if (updateMatch) {
                    const dictName = updateMatch[1];
                    const key = updateMatch[2];
                    const op = updateMatch[3];
                    const value = Number(updateMatch[4]);
                    if (dicts[dictName] && dicts[dictName][key] !== undefined) {
                        if (op === '+') {
                            dicts[dictName][key] += value;
                        } else {
                            dicts[dictName][key] -= value;
                            setHasUsedItem(true);
                        }
                    }
                    continue;
                }

                // If statement (simple check)
                const ifMatch = trimmed.match(/^if\s+(\w+)\[["']([^"']+)["']\]\s*>\s*(\d+):$/);
                if (ifMatch) {
                    // Just continue - we'll process the body
                    continue;
                }

                // Print statements
                const printStrMatch = trimmed.match(/^print\s*\(["'](.+)["']\)$/);
                if (printStrMatch) {
                    outputLines.push(printStrMatch[1]);
                    continue;
                }

                // Print with variable: print("text", dict["key"])
                const printVarMatch = trimmed.match(/^print\s*\(["'](.+)["'],\s*(\w+)\[["']([^"']+)["']\]\)$/);
                if (printVarMatch) {
                    const text = printVarMatch[1];
                    const dictName = printVarMatch[2];
                    const key = printVarMatch[3];
                    if (dicts[dictName] && dicts[dictName][key] !== undefined) {
                        outputLines.push(`${text} ${dicts[dictName][key]}`);
                    }
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
        const correctAnswers = [1, 0]; // Q1=dict["item"]=count, Q2=decrement

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
        return <div className={styles.container} style={{ background: 'var(--bg-primary)' }}><div className="flex items-center justify-center h-screen"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🎮</motion.div></div></div>;
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'rgba(0, 0, 0, 0.95)' }}>
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', duration: 0.8 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
                    <Gamepad2 size={50} className="text-white" />
                </motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle} style={{ color: '#10b981' }}>
                    Inventory Started! 🎮
                </motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>
                    {LESSON.successMessage}
                </motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className={styles.successXp} style={{ background: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                    <Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                    <Link href="/level5/lesson8" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
                        Next Lesson <ChevronRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            <header className={styles.header} style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--accent-primary)' }}>
                <Link href="/level5" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 13</span>
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
                                <Gamepad2 size={28} style={{ color: '#10b981' }} />
                                <Package size={24} style={{ color: '#3b82f6' }} />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#10b981' }}>PROJECT: Video Game Inventory</span>
                            </div>
                            <p style={{ marginBottom: '1rem' }}>
                                Build a real inventory system like in video games! You'll create a dictionary to track
                                <strong style={{ color: '#10b981' }}> items and their quantities</strong>.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                                <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem' }}>📦</div>
                                    <div style={{ fontWeight: 600, color: '#10b981' }}>Show Items</div>
                                </div>
                                <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem' }}>➕</div>
                                    <div style={{ fontWeight: 600, color: '#3b82f6' }}>Add Items</div>
                                </div>
                                <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem' }}>🧪</div>
                                    <div style={{ fontWeight: 600, color: '#f59e0b' }}>Use Items</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* How It Works */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: '#10b981' }}>
                            <h3 style={{ marginBottom: '1rem', color: '#10b981' }}>How Inventory Works:</h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ background: 'rgba(80, 250, 123, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
                                    <p style={{ fontWeight: 700, color: '#50fa7b', marginBottom: '0.5rem' }}>Structure: item name → count</p>
                                    <code style={{ fontSize: '0.9rem' }}>
                                        inventory = {"{"}<br/>
                                        {'    '}<span style={{ color: '#50fa7b' }}>"health_potion"</span>: <span style={{ color: '#bd93f9' }}>3</span>,<br/>
                                        {'    '}<span style={{ color: '#50fa7b' }}>"sword"</span>: <span style={{ color: '#bd93f9' }}>1</span><br/>
                                        {"}"}
                                    </code>
                                </div>
                                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
                                    <p style={{ fontWeight: 700, color: '#3b82f6', marginBottom: '0.5rem' }}>Add item: set the key and count</p>
                                    <code style={{ fontSize: '0.9rem' }}>
                                        inventory[<span style={{ color: '#50fa7b' }}>"shield"</span>] = <span style={{ color: '#bd93f9' }}>1</span>
                                    </code>
                                </div>
                                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
                                    <p style={{ fontWeight: 700, color: '#f59e0b', marginBottom: '0.5rem' }}>Use item: decrease the count</p>
                                    <code style={{ fontSize: '0.9rem' }}>
                                        inventory[<span style={{ color: '#50fa7b' }}>"health_potion"</span>] = inventory[<span style={{ color: '#50fa7b' }}>"health_potion"</span>] - <span style={{ color: '#bd93f9' }}>1</span>
                                    </code>
                                </div>
                            </div>
                        </div>

                        {/* Code Editor */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: '#10b981' }}>Build Your Inventory System:</h3>
                            <div className={styles.editor} style={{ borderColor: '#10b981' }}>
                                <div className={styles.codeHeader}><span>inventory.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '400px' }} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
                                <Play size={18} /> Run Inventory
                            </button>
                            {output && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.outputBox}>
                                    <div className={styles.outputLabel}>Game Output:</div>
                                    <div className={styles.outputText}>{output}</div>
                                </motion.div>
                            )}
                        </div>

                        {/* Progress */}
                        <div className={styles.challenges} style={{ background: 'var(--bg-secondary)', borderColor: '#10b981' }}>
                            <h3 style={{ color: '#10b981' }}>Project Progress:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasInventory ? styles.done : ''}`} style={hasInventory ? { background: '#10b981', borderColor: '#10b981' } : {}}>
                                        {hasInventory && <Check size={14} />}
                                    </div>
                                    Create an inventory dictionary
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasAddedItem ? styles.done : ''}`} style={hasAddedItem ? { background: '#3b82f6', borderColor: '#3b82f6' } : {}}>
                                        {hasAddedItem && <Check size={14} />}
                                    </div>
                                    Add a new item to inventory
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasUsedItem ? styles.done : ''}`} style={hasUsedItem ? { background: '#f59e0b', borderColor: '#f59e0b' } : {}}>
                                        {hasUsedItem && <Check size={14} />}
                                    </div>
                                    Use an item (decrease count)
                                </li>
                            </ul>
                        </div>

                        <div className={styles.tipBox} style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: '#10b981' }}>
                            <Lightbulb size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, color: '#10b981' }}>Game Dev Tip:</p>
                                <p style={{ fontSize: '0.9rem' }}>
                                    Real games use dictionaries for inventory just like this!
                                    The key is the item name, and the value is how many you have.
                                </p>
                            </div>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level5/lesson6" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)} style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection} style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))', borderColor: '#10b981' }}>
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎮</motion.div>
                        <h2 className={styles.quizTitle} style={{ color: '#10b981' }}>Project Quiz! (Question {currentQuiz + 1}/2)</h2>

                        {currentQuiz === 0 ? (
                            <>
                                <p className={styles.quizQuestion}>How do you add 5 arrows to an inventory dictionary?</p>
                                <div className={styles.quizOptions}>
                                    {['inventory.add("arrows", 5)', 'inventory["arrows"] = 5', 'inventory.arrows = 5'].map((opt, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[0]) { const a = [...quizAnswers]; a[0] = idx; setQuizAnswers(a); } }}
                                            className={`${styles.quizOption} ${quizAnswers[0] === idx ? styles.selected : ''} ${quizChecked[0] && idx === 1 ? styles.correct : ''} ${quizChecked[0] && quizAnswers[0] === idx && idx !== 1 ? styles.wrong : ''}`}
                                            disabled={quizChecked[0]}><code>{opt}</code></button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>You have 3 potions and use 1. What code updates the count?</p>
                                <div className={styles.quizOptions}>
                                    {['inventory["potion"] = inventory["potion"] - 1', 'inventory["potion"].use()', 'del inventory["potion"]'].map((opt, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[1]) { const a = [...quizAnswers]; a[1] = idx; setQuizAnswers(a); } }}
                                            className={`${styles.quizOption} ${quizAnswers[1] === idx ? styles.selected : ''} ${quizChecked[1] && idx === 0 ? styles.correct : ''} ${quizChecked[1] && quizAnswers[1] === idx && idx !== 0 ? styles.wrong : ''}`}
                                            disabled={quizChecked[1]}><code style={{ fontSize: '0.85rem' }}>{opt}</code></button>
                                    ))}
                                </div>
                            </>
                        )}

                        {!quizChecked[currentQuiz] ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswers[currentQuiz] === null} style={{ background: '#10b981' }}>Check Answer</button>
                        ) : quizAnswers[currentQuiz] !== (currentQuiz === 0 ? 1 : 0) ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>{currentQuiz === 0 ? 'Use dict["key"] = value to add items!' : 'Subtract 1 from the current value to use an item!'}</p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem', background: '#10b981' }}>Try Again</button>
                            </motion.div>
                        ) : currentQuiz === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${styles.quizFeedback} ${styles.success}`}>
                                <h4>Correct!</h4><p>That's how you add items! Next question...</p>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
