'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Bot, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL5_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL5_LESSONS[3]; // Lesson 4
const LESSON_ID = 66;

export default function Lesson4() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# Update a dictionary!
pet = {
    "name": "Buddy",
    "type": "dog",
    "age": 3
}

# Add a new key
pet["color"] = "golden"

# Change a value
pet["age"] = 4

print(pet["name"])
print(pet["age"])
print(pet["color"])
`);
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasAddedKey, setHasAddedKey] = useState(false);
    const [hasChangedValue, setHasChangedValue] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            const dicts: Record<string, Record<string, string | number>> = {};

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || trimmed === '') continue;

                // Dictionary creation
                const dictMatch = trimmed.match(/^(\w+)\s*=\s*\{$/);
                if (dictMatch) {
                    dicts[dictMatch[1]] = {};
                    continue;
                }

                // Key-value pair inside dict
                const kvMatch = trimmed.match(/^["'](\w+)["']\s*:\s*(?:["']([^"']+)["']|(\d+)),?$/);
                if (kvMatch) {
                    const lastDict = Object.keys(dicts).pop();
                    if (lastDict) {
                        const key = kvMatch[1];
                        const value = kvMatch[2] || Number(kvMatch[3]);
                        dicts[lastDict][key] = value;
                    }
                    continue;
                }

                // End of dict
                if (trimmed === '}') continue;

                // Add or update key: dict["key"] = value
                const updateMatch = trimmed.match(/^(\w+)\[["'](\w+)["']\]\s*=\s*(?:["']([^"']+)["']|(\d+))$/);
                if (updateMatch) {
                    const dictName = updateMatch[1];
                    const key = updateMatch[2];
                    const value = updateMatch[3] || Number(updateMatch[4]);

                    if (dicts[dictName]) {
                        if (dicts[dictName][key] === undefined) {
                            setHasAddedKey(true);
                        } else {
                            setHasChangedValue(true);
                        }
                        dicts[dictName][key] = value;
                    }
                    continue;
                }

                // del dict["key"]
                const delMatch = trimmed.match(/^del\s+(\w+)\[["'](\w+)["']\]$/);
                if (delMatch) {
                    const dictName = delMatch[1];
                    const key = delMatch[2];
                    if (dicts[dictName] && dicts[dictName][key] !== undefined) {
                        delete dicts[dictName][key];
                    }
                    continue;
                }

                // Print value: print(dict["key"])
                const printMatch = trimmed.match(/^print\s*\(\s*(\w+)\[["'](\w+)["']\]\s*\)$/);
                if (printMatch) {
                    const dictName = printMatch[1];
                    const key = printMatch[2];
                    if (dicts[dictName] && dicts[dictName][key] !== undefined) {
                        outputLines.push(String(dicts[dictName][key]));
                    } else {
                        outputLines.push(`KeyError: '${key}'`);
                    }
                    continue;
                }

                // Print string
                const printStrMatch = trimmed.match(/^print\s*\(["'](.+)["']\)$/);
                if (printStrMatch) {
                    outputLines.push(printStrMatch[1]);
                }
            }

            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code!');
        } catch {
            setOutput('Error! Check syntax.');
        }
    };

    const checkQuiz = () => {
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = true;
        setQuizChecked(newChecked);
        const correctAnswers = [1, 2]; // Q1=dict["key"]=value, Q2=del

        if (quizAnswers[currentQuiz] === correctAnswers[currentQuiz]) {
            if (currentQuiz === 0) {
                setTimeout(() => setCurrentQuiz(1), 1000);
            } else {
                setTimeout(() => {
                    addXpAndCoins(LESSON.xpReward, 5);
                    completeLevel(LESSON_ID, LESSON.xpReward, 5, 1, 60);
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
        return <div className={styles.container} style={{ background: 'var(--bg-primary)' }}><div className="flex items-center justify-center h-screen"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>✏️</motion.div></div></div>;
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'rgba(0, 0, 0, 0.95)' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}><Check size={50} /></motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle} style={{ color: 'var(--accent-primary)' }}>Dictionary Editor! ✏️</motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}><Link href="/level5/lesson5" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link></motion.div>
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
                            <motion.div className={styles.lessonEmoji} animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>{LESSON.emoji}</motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1 style={{ color: 'var(--accent-primary)' }}>{LESSON.title}</h1>
                                <p>Learn: <code style={{ color: 'var(--accent-secondary)' }}>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))', borderColor: 'var(--accent-primary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Bot size={28} style={{ color: 'var(--accent-primary)' }} />
                                <Sparkles size={24} style={{ color: 'var(--accent-secondary)' }} />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>Updating Dictionaries!</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '0.75rem', marginBottom: '1rem' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✏️</div>
                                    <p style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>Unlike tuples, dictionaries CAN change!</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Add, update, or remove items anytime</p>
                                </div>
                            </div>

                            <p>
                                Dictionaries are <strong style={{ color: 'var(--accent-secondary)' }}>mutable</strong> - that means you can
                                <strong style={{ color: 'var(--accent-primary)' }}> add new labels</strong>,
                                <strong style={{ color: '#50fa7b' }}> change values</strong>, or
                                <strong style={{ color: '#ff5555' }}> remove items</strong> whenever you want!
                            </p>
                        </motion.div>

                        {/* Three Operations */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-secondary)' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Three Ways to Update</h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ background: 'rgba(80, 250, 123, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(80, 250, 123, 0.3)' }}>
                                    <p style={{ fontWeight: 700, color: '#50fa7b', marginBottom: '0.5rem' }}>1. ADD a new key</p>
                                    <code style={{ fontSize: '0.9rem' }}>
                                        pet[<span style={{ color: '#50fa7b' }}>"color"</span>] = <span style={{ color: '#f1fa8c' }}>"golden"</span>
                                    </code>
                                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Creates a brand new label!</p>
                                </div>

                                <div style={{ background: 'rgba(139, 233, 253, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(139, 233, 253, 0.3)' }}>
                                    <p style={{ fontWeight: 700, color: '#8be9fd', marginBottom: '0.5rem' }}>2. CHANGE a value</p>
                                    <code style={{ fontSize: '0.9rem' }}>
                                        pet[<span style={{ color: '#50fa7b' }}>"age"</span>] = <span style={{ color: '#bd93f9' }}>4</span>
                                    </code>
                                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Updates existing key with new value!</p>
                                </div>

                                <div style={{ background: 'rgba(255, 85, 85, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 85, 85, 0.3)' }}>
                                    <p style={{ fontWeight: 700, color: '#ff5555', marginBottom: '0.5rem' }}>3. DELETE a key</p>
                                    <code style={{ fontSize: '0.9rem' }}>
                                        <span style={{ color: '#ff79c6' }}>del</span> pet[<span style={{ color: '#50fa7b' }}>"type"</span>]
                                    </code>
                                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Removes the key completely!</p>
                                </div>
                            </div>
                        </div>

                        {/* Example */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: 'var(--accent-secondary)' }}>Example: Updating Pet Info</h3>
                            <div className={styles.codeBlock} style={{ borderColor: 'var(--accent-primary)' }}>
                                <div className={styles.codeHeader}><span>main.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    pet = {"{"}{'\n'}
                                    {'    '}<span style={{ color: '#50fa7b' }}>"name"</span>: <span className={styles.string}>"Buddy"</span>,{'\n'}
                                    {'    '}<span style={{ color: '#50fa7b' }}>"age"</span>: <span style={{ color: '#bd93f9' }}>3</span>{'\n'}
                                    {"}"}{'\n\n'}
                                    <span className={styles.comment}># Add a new key</span>{'\n'}
                                    pet[<span style={{ color: '#50fa7b' }}>"color"</span>] = <span className={styles.string}>"golden"</span>{'\n\n'}
                                    <span className={styles.comment}># Change age (it's his birthday!)</span>{'\n'}
                                    pet[<span style={{ color: '#50fa7b' }}>"age"</span>] = <span style={{ color: '#bd93f9' }}>4</span>{'\n\n'}
                                    <span className={styles.comment}># Remove with del</span>{'\n'}
                                    <span className={styles.keyword}>del</span> pet[<span style={{ color: '#50fa7b' }}>"color"</span>]
                                </div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: 'var(--accent-secondary)' }}>Your Turn!</h3>
                            <div className={styles.editor} style={{ borderColor: 'var(--accent-primary)' }}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '280px' }} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode} style={{ background: 'var(--accent-primary)' }}><Play size={18} /> Run Code</button>
                            {output && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></motion.div>}
                        </div>

                        {/* Challenges */}
                        <div className={styles.challenges} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
                            <h3 style={{ color: 'var(--accent-primary)' }}>Challenges:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasAddedKey ? styles.done : ''}`}>{hasAddedKey && <Check size={14} />}</div>
                                    Add a NEW key to a dictionary
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasChangedValue ? styles.done : ''}`}>{hasChangedValue && <Check size={14} />}</div>
                                    Change an EXISTING value
                                </li>
                            </ul>
                        </div>

                        <div className={styles.tipBox} style={{ background: 'rgba(251, 191, 36, 0.15)', borderColor: 'var(--accent-secondary)' }}>
                            <Lightbulb size={20} style={{ color: 'var(--accent-secondary)', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>Same Syntax, Different Action!</p>
                                <p style={{ fontSize: '0.9rem' }}>
                                    <code>dict["key"] = value</code> does TWO things:{'\n'}
                                    - If key exists: <strong>updates</strong> the value{'\n'}
                                    - If key is new: <strong>adds</strong> it!
                                </p>
                            </div>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level5/lesson3" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)} style={{ background: 'var(--accent-primary)' }}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection} style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))', borderColor: 'var(--accent-primary)' }}>
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>✏️</motion.div>
                        <h2 className={styles.quizTitle} style={{ color: 'var(--accent-primary)' }}>Brain Check! (Question {currentQuiz + 1}/2)</h2>

                        {currentQuiz === 0 ? (
                            <>
                                <p className={styles.quizQuestion}>How do you add a new key "score" with value 100 to a dictionary called <code>game</code>?</p>
                                <div className={styles.quizOptions}>
                                    {['game.add("score", 100)', 'game["score"] = 100', 'game.score = 100'].map((opt, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[0]) { const a = [...quizAnswers]; a[0] = idx; setQuizAnswers(a); } }}
                                            className={`${styles.quizOption} ${quizAnswers[0] === idx ? styles.selected : ''} ${quizChecked[0] && idx === 1 ? styles.correct : ''} ${quizChecked[0] && quizAnswers[0] === idx && idx !== 1 ? styles.wrong : ''}`}
                                            disabled={quizChecked[0]}><code>{opt}</code></button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>How do you REMOVE a key from a dictionary?</p>
                                <div className={styles.quizOptions}>
                                    {['dict.remove("key")', 'dict["key"] = None', 'del dict["key"]'].map((opt, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[1]) { const a = [...quizAnswers]; a[1] = idx; setQuizAnswers(a); } }}
                                            className={`${styles.quizOption} ${quizAnswers[1] === idx ? styles.selected : ''} ${quizChecked[1] && idx === 2 ? styles.correct : ''} ${quizChecked[1] && quizAnswers[1] === idx && idx !== 2 ? styles.wrong : ''}`}
                                            disabled={quizChecked[1]}><code>{opt}</code></button>
                                    ))}
                                </div>
                            </>
                        )}

                        {!quizChecked[currentQuiz] ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswers[currentQuiz] === null} style={{ background: 'var(--accent-primary)' }}>Check Answer</button>
                        ) : quizAnswers[currentQuiz] !== (currentQuiz === 0 ? 1 : 2) ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>{currentQuiz === 0 ? 'Use dict["key"] = value to add or update!' : 'Use del dict["key"] to remove a key completely!'}</p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem', background: 'var(--accent-primary)' }}>Try Again</button>
                            </motion.div>
                        ) : currentQuiz === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${styles.quizFeedback} ${styles.success}`}>
                                <h4>Correct!</h4><p>dict["key"] = value works for adding and updating! Next question...</p>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
