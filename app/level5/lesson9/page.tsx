'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Bot, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL5_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL5_LESSONS[8]; // Lesson 9 (0-indexed)
const LESSON_ID = 71;

export default function Lesson9() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('# Set tricks!\ngems = {"ruby", "emerald"}\n\n# Add a new gem\ngems.add("diamond")\nprint(gems)\n\n# Check if item exists\nprint("ruby" in gems)\n');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasUsedAdd, setHasUsedAdd] = useState(false);
    const [hasUsedIn, setHasUsedIn] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            let variables: Record<string, { type: string; value: Set<string | number> }> = {};

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || trimmed === '') continue;

                // Set assignment: variable = {item1, item2, ...}
                const setMatch = trimmed.match(/^(\w+)\s*=\s*\{([^}]*)\}$/);
                if (setMatch && !trimmed.includes(':')) {
                    const varName = setMatch[1];
                    const content = setMatch[2];
                    const items = content.split(',').map(i => {
                        const t = i.trim();
                        if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
                            return t.slice(1, -1);
                        }
                        return isNaN(Number(t)) ? t : Number(t);
                    }).filter(i => i !== '');

                    variables[varName] = { type: 'set', value: new Set(items) };
                    continue;
                }

                // add(): set.add("item")
                const addMatch = trimmed.match(/^(\w+)\.add\s*\(\s*["'](.+)["']\s*\)$/);
                if (addMatch) {
                    const varName = addMatch[1];
                    const item = addMatch[2];
                    if (variables[varName] && variables[varName].type === 'set') {
                        variables[varName].value.add(item);
                        setHasUsedAdd(true);
                    }
                    continue;
                }

                // remove(): set.remove("item")
                const removeMatch = trimmed.match(/^(\w+)\.remove\s*\(\s*["'](.+)["']\s*\)$/);
                if (removeMatch) {
                    const varName = removeMatch[1];
                    const item = removeMatch[2];
                    if (variables[varName] && variables[varName].type === 'set') {
                        variables[varName].value.delete(item);
                    }
                    continue;
                }

                // Print "item" in set
                const inMatch = trimmed.match(/^print\s*\(\s*["'](.+)["']\s+in\s+(\w+)\s*\)$/);
                if (inMatch) {
                    const item = inMatch[1];
                    const varName = inMatch[2];
                    if (variables[varName] && variables[varName].type === 'set') {
                        const exists = variables[varName].value.has(item);
                        outputLines.push(exists ? 'True' : 'False');
                        setHasUsedIn(true);
                    }
                    continue;
                }

                // Print set: print(set_name)
                const printSetMatch = trimmed.match(/^print\s*\(\s*(\w+)\s*\)$/);
                if (printSetMatch) {
                    const varName = printSetMatch[1];
                    if (variables[varName] && variables[varName].type === 'set') {
                        const setVal = Array.from(variables[varName].value);
                        const formatted = setVal.map(v => typeof v === 'string' ? `'${v}'` : v).join(', ');
                        outputLines.push(`{${formatted}}`);
                    }
                    continue;
                }

                // Print length: print(len(set_name))
                const lenMatch = trimmed.match(/^print\s*\(\s*len\s*\(\s*(\w+)\s*\)\s*\)$/);
                if (lenMatch) {
                    const varName = lenMatch[1];
                    if (variables[varName]) {
                        outputLines.push(String(variables[varName].value.size));
                    }
                    continue;
                }

                // Regular print
                const printMatch = trimmed.match(/^print\s*\(["'](.*)["']\)$/);
                if (printMatch) {
                    outputLines.push(printMatch[1]);
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
        const correctAnswers = [0, 1]; // Q1 = add(), Q2 = in

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
        return <div className={styles.container} style={{ background: 'var(--bg-primary)' }}><div className="flex items-center justify-center h-screen"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🪄</motion.div></div></div>;
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'rgba(0, 0, 0, 0.95)' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}><Check size={50} /></motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle} style={{ color: 'var(--accent-primary)' }}>Set Wizard! 🪄</motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}><Link href="/level5/lesson10" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link></motion.div>
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
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>Cool Set Tricks!</span>
                            </div>
                            <p>
                                Now that you know what sets are, let's learn the <strong style={{ color: 'var(--accent-secondary)' }}>magic tricks</strong> you can do with them!
                            </p>
                        </motion.div>

                        {/* Three Main Operations */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-secondary)' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>🪄 Three Magic Set Tricks</h3>

                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {/* add() */}
                                <div style={{ background: 'rgba(80, 250, 123, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(80, 250, 123, 0.3)' }}>
                                    <p style={{ fontWeight: 700, color: '#50fa7b', marginBottom: '0.5rem' }}>1. add() - Add an item</p>
                                    <code style={{ fontSize: '0.9rem', display: 'block' }}>
                                        gems.<span style={{ color: '#50fa7b' }}>add</span>(<span style={{ color: '#f1fa8c' }}>"diamond"</span>)
                                    </code>
                                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Adds "diamond" to the set (if not already there)</p>
                                </div>

                                {/* remove() */}
                                <div style={{ background: 'rgba(255, 85, 85, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 85, 85, 0.3)' }}>
                                    <p style={{ fontWeight: 700, color: '#ff5555', marginBottom: '0.5rem' }}>2. remove() - Remove an item</p>
                                    <code style={{ fontSize: '0.9rem', display: 'block' }}>
                                        gems.<span style={{ color: '#ff5555' }}>remove</span>(<span style={{ color: '#f1fa8c' }}>"ruby"</span>)
                                    </code>
                                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Removes "ruby" from the set</p>
                                </div>

                                {/* in */}
                                <div style={{ background: 'rgba(139, 233, 253, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(139, 233, 253, 0.3)' }}>
                                    <p style={{ fontWeight: 700, color: '#8be9fd', marginBottom: '0.5rem' }}>3. in - Check if item exists</p>
                                    <code style={{ fontSize: '0.9rem', display: 'block' }}>
                                        <span style={{ color: '#f1fa8c' }}>"ruby"</span> <span style={{ color: '#8be9fd' }}>in</span> gems
                                    </code>
                                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Returns True or False</p>
                                </div>
                            </div>
                        </div>

                        {/* Example Code */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: 'var(--accent-secondary)' }}>Example: Managing Your Gems</h3>
                            <div className={styles.codeBlock} style={{ borderColor: 'var(--accent-primary)' }}>
                                <div className={styles.codeHeader}><span>main.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># Start with some gems</span>{'\n'}
                                    gems = {"{"}<span className={styles.string}>"ruby"</span>, <span className={styles.string}>"emerald"</span>{"}"}{'\n\n'}
                                    <span className={styles.comment}># Add a new gem</span>{'\n'}
                                    gems.<span style={{ color: '#50fa7b' }}>add</span>(<span className={styles.string}>"diamond"</span>){'\n'}
                                    <span className={styles.keyword}>print</span>(gems)  <span className={styles.comment}># Now has 3 gems!</span>{'\n\n'}
                                    <span className={styles.comment}># Check if we have a ruby</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"ruby"</span> <span style={{ color: '#8be9fd' }}>in</span> gems)  <span className={styles.comment}># True</span>{'\n\n'}
                                    <span className={styles.comment}># Remove the ruby</span>{'\n'}
                                    gems.<span style={{ color: '#ff5555' }}>remove</span>(<span className={styles.string}>"ruby"</span>){'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"ruby"</span> <span style={{ color: '#8be9fd' }}>in</span> gems)  <span className={styles.comment}># False</span>
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>{'{'}'ruby', 'emerald', 'diamond'{'}'}{'\n'}True{'\n'}False</div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: 'var(--accent-secondary)' }}>Your Turn - Try Set Tricks!</h3>
                            <div className={styles.editor} style={{ borderColor: 'var(--accent-primary)' }}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '180px' }} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode} style={{ background: 'var(--accent-primary)' }}><Play size={18} /> Run Code</button>
                            {output && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></motion.div>}
                        </div>

                        {/* Challenges */}
                        <div className={styles.challenges} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
                            <h3 style={{ color: 'var(--accent-primary)' }}>Challenges:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasUsedAdd ? styles.done : ''}`}>{hasUsedAdd && <Check size={14} />}</div>
                                    Use <code style={{ color: 'var(--accent-secondary)' }}>add()</code> to add an item
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasUsedIn ? styles.done : ''}`}>{hasUsedIn && <Check size={14} />}</div>
                                    Use <code style={{ color: 'var(--accent-secondary)' }}>in</code> to check if item exists
                                </li>
                            </ul>
                        </div>

                        <div className={styles.tipBox} style={{ background: 'rgba(251, 191, 36, 0.15)', borderColor: 'var(--accent-secondary)' }}>
                            <Lightbulb size={20} style={{ color: 'var(--accent-secondary)', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>Quick Reference:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li><code>set.add("item")</code> - Add item</li>
                                    <li><code>set.remove("item")</code> - Remove item</li>
                                    <li><code>"item" in set</code> - Check if exists (True/False)</li>
                                </ul>
                            </div>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level5/lesson8" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)} style={{ background: 'var(--accent-primary)' }}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection} style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))', borderColor: 'var(--accent-primary)' }}>
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>🪄</motion.div>
                        <h2 className={styles.quizTitle} style={{ color: 'var(--accent-primary)' }}>Brain Check! (Question {currentQuiz + 1}/2)</h2>

                        {currentQuiz === 0 ? (
                            <>
                                <p className={styles.quizQuestion}>How do you ADD an item to a set?</p>
                                <div className={styles.quizOptions}>
                                    {['set.add("item")', 'set.append("item")', 'set.insert("item")'].map((opt, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[0]) { const a = [...quizAnswers]; a[0] = idx; setQuizAnswers(a); } }}
                                            className={`${styles.quizOption} ${quizAnswers[0] === idx ? styles.selected : ''} ${quizChecked[0] && idx === 0 ? styles.correct : ''} ${quizChecked[0] && quizAnswers[0] === idx && idx !== 0 ? styles.wrong : ''}`}
                                            disabled={quizChecked[0]}><code>{opt}</code></button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>How do you CHECK if "ruby" is in a set called gems?</p>
                                <div className={styles.quizOptions}>
                                    {['gems.contains("ruby")', '"ruby" in gems', 'gems.has("ruby")'].map((opt, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[1]) { const a = [...quizAnswers]; a[1] = idx; setQuizAnswers(a); } }}
                                            className={`${styles.quizOption} ${quizAnswers[1] === idx ? styles.selected : ''} ${quizChecked[1] && idx === 1 ? styles.correct : ''} ${quizChecked[1] && quizAnswers[1] === idx && idx !== 1 ? styles.wrong : ''}`}
                                            disabled={quizChecked[1]}><code>{opt}</code></button>
                                    ))}
                                </div>
                            </>
                        )}

                        {!quizChecked[currentQuiz] ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswers[currentQuiz] === null} style={{ background: 'var(--accent-primary)' }}>Check Answer</button>
                        ) : quizAnswers[currentQuiz] !== (currentQuiz === 0 ? 0 : 1) ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>{currentQuiz === 0 ? 'Sets use add(), not append() like lists!' : 'In Python, we use "item" in set to check membership!'}</p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem', background: 'var(--accent-primary)' }}>Try Again</button>
                            </motion.div>
                        ) : currentQuiz === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${styles.quizFeedback} ${styles.success}`}>
                                <h4>Correct!</h4><p>Sets use add() to add items! Next question...</p>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
