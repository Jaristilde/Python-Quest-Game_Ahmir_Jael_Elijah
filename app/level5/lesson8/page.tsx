'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Bot, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL5_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL5_LESSONS[7]; // Lesson 8 (0-indexed)
const LESSON_ID = 70;

export default function Lesson8() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('# Create your first set!\ngems = {"ruby", "emerald", "ruby", "diamond"}\nprint(gems)\n');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasCreatedSet, setHasCreatedSet] = useState(false);
    const [hasSeenDuplicateRemoval, setHasSeenDuplicateRemoval] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            let variables: Record<string, { type: string; value: unknown[] }> = {};

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

                    // Remove duplicates (set behavior)
                    const uniqueItems = [...new Set(items)];
                    variables[varName] = { type: 'set', value: uniqueItems };
                    setHasCreatedSet(true);
                    if (items.length !== uniqueItems.length) {
                        setHasSeenDuplicateRemoval(true);
                    }
                    continue;
                }

                // Print set: print(set_name)
                const printSetMatch = trimmed.match(/^print\s*\(\s*(\w+)\s*\)$/);
                if (printSetMatch) {
                    const varName = printSetMatch[1];
                    if (variables[varName] && variables[varName].type === 'set') {
                        const setVal = variables[varName].value as unknown[];
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
                        outputLines.push(String(variables[varName].value.length));
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
        const correctAnswers = [2, 1]; // Q1 = curly braces no colon, Q2 = 2

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
        return <div className={styles.container} style={{ background: 'var(--bg-primary)' }}><div className="flex items-center justify-center h-screen"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🎯</motion.div></div></div>;
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'rgba(0, 0, 0, 0.95)' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}><Check size={50} /></motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle} style={{ color: 'var(--accent-primary)' }}>Set Master! 🎯</motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}><Link href="/level5/lesson9" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link></motion.div>
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
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>Meet SETS!</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '0.75rem', marginBottom: '1rem' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎯</div>
                                    <p style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>A SET is a collection with NO DUPLICATES!</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Like a VIP list - each person can only be on it once!</p>
                                </div>
                            </div>

                            <p>
                                Imagine collecting <strong style={{ color: 'var(--accent-secondary)' }}>unique gems</strong>. If you already have a ruby,
                                adding another ruby doesn't give you two - you still just have <strong style={{ color: 'var(--accent-primary)' }}>one ruby</strong>!
                            </p>
                        </motion.div>

                        {/* Sets vs Dictionaries - Same brackets, different use */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-secondary)' }}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
                                <Lightbulb size={20} style={{ color: 'var(--accent-secondary)' }} /> Sets use {"{ }"} but NO colons!
                            </h3>

                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ background: 'rgba(255, 121, 198, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 121, 198, 0.3)' }}>
                                    <p style={{ fontWeight: 700, color: '#ff79c6', marginBottom: '0.5rem' }}>SET = {"{ }"} with just items</p>
                                    <div style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.9rem' }}>
                                        gems = <span style={{ color: '#ff79c6' }}>{"{"}"ruby", "emerald", "diamond"{"}"}</span>
                                    </div>
                                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No colons, no key:value pairs - just items!</p>
                                </div>

                                <div style={{ background: 'rgba(139, 233, 253, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(139, 233, 253, 0.3)' }}>
                                    <p style={{ fontWeight: 700, color: '#8be9fd', marginBottom: '0.5rem' }}>DICTIONARY = {"{ }"} with key:value</p>
                                    <div style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.9rem' }}>
                                        pet = <span style={{ color: '#8be9fd' }}>{"{"}"name": "Buddy", "age": 3{"}"}</span>
                                    </div>
                                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Has colons - key:value pairs!</p>
                                </div>
                            </div>
                        </div>

                        {/* Duplicate Removal Demo */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>🚫 Sets Automatically Remove Duplicates!</h3>
                            <div style={{ background: 'rgba(255, 121, 198, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
                                <code style={{ fontSize: '0.95rem', display: 'block', marginBottom: '0.75rem' }}>
                                    gems = {"{"}<span style={{ color: '#50fa7b' }}>"ruby"</span>, <span style={{ color: '#50fa7b' }}>"emerald"</span>, <span style={{ color: '#50fa7b' }}>"ruby"</span>{"}"}
                                </code>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Result:</span>
                                    <code style={{ color: '#ff79c6' }}>{"{"}'ruby', 'emerald'{"}"}</code>
                                    <span style={{ color: '#50fa7b', fontSize: '0.85rem' }}>Only 2 items!</span>
                                </div>
                            </div>
                            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                We tried to add "ruby" twice, but the set only keeps one copy!
                            </p>
                        </div>

                        {/* Example Code */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: 'var(--accent-secondary)' }}>Example: Gem Collection</h3>
                            <div className={styles.codeBlock} style={{ borderColor: 'var(--accent-primary)' }}>
                                <div className={styles.codeHeader}><span>main.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># Create a SET with curly braces - no colons!</span>{'\n'}
                                    gems = {"{"}<span className={styles.string}>"ruby"</span>, <span className={styles.string}>"emerald"</span>, <span className={styles.string}>"ruby"</span>, <span className={styles.string}>"diamond"</span>{"}"}{'\n\n'}
                                    <span className={styles.comment}># Print the set - duplicates are gone!</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(gems){'\n\n'}
                                    <span className={styles.comment}># Check how many unique items</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(len(gems))  <span className={styles.comment}># 3, not 4!</span>
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>{'{'}'ruby', 'emerald', 'diamond'{'}'}{'\n'}3</div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: 'var(--accent-secondary)' }}>Your Turn - Create a Set!</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                Try adding duplicates and watch them disappear!
                            </p>
                            <div className={styles.editor} style={{ borderColor: 'var(--accent-primary)' }}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '120px' }} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode} style={{ background: 'var(--accent-primary)' }}><Play size={18} /> Run Code</button>
                            {output && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></motion.div>}
                        </div>

                        {/* Challenges */}
                        <div className={styles.challenges} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
                            <h3 style={{ color: 'var(--accent-primary)' }}>Challenges:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasCreatedSet ? styles.done : ''}`}>{hasCreatedSet && <Check size={14} />}</div>
                                    Create a set with <code style={{ color: 'var(--accent-secondary)' }}>{"{ }"}</code> curly braces
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasSeenDuplicateRemoval ? styles.done : ''}`}>{hasSeenDuplicateRemoval && <Check size={14} />}</div>
                                    Add duplicate items and see them removed
                                </li>
                            </ul>
                        </div>

                        <div className={styles.tipBox} style={{ background: 'rgba(251, 191, 36, 0.15)', borderColor: 'var(--accent-secondary)' }}>
                            <Lightbulb size={20} style={{ color: 'var(--accent-secondary)', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>Remember:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li>Sets use <code>{"{ }"}</code> like dictionaries</li>
                                    <li>But NO colons - just items separated by commas</li>
                                    <li>Duplicates are automatically removed!</li>
                                    <li>Great for unique collections!</li>
                                </ul>
                            </div>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level5/lesson7" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)} style={{ background: 'var(--accent-primary)' }}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection} style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))', borderColor: 'var(--accent-primary)' }}>
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</motion.div>
                        <h2 className={styles.quizTitle} style={{ color: 'var(--accent-primary)' }}>Brain Check! (Question {currentQuiz + 1}/2)</h2>

                        {currentQuiz === 0 ? (
                            <>
                                <p className={styles.quizQuestion}>How do you create a SET in Python?</p>
                                <div className={styles.quizOptions}>
                                    {['[ ] Square brackets', '{ } Curly braces with colons', '{ } Curly braces WITHOUT colons'].map((opt, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[0]) { const a = [...quizAnswers]; a[0] = idx; setQuizAnswers(a); } }}
                                            className={`${styles.quizOption} ${quizAnswers[0] === idx ? styles.selected : ''} ${quizChecked[0] && idx === 2 ? styles.correct : ''} ${quizChecked[0] && quizAnswers[0] === idx && idx !== 2 ? styles.wrong : ''}`}
                                            disabled={quizChecked[0]}><code>{opt}</code></button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>
                                    <code>gems = {"{"}"ruby", "emerald", "ruby"{"}"}</code><br/>
                                    How many items are in this set?
                                </p>
                                <div className={styles.quizOptions}>
                                    {['3 items', '2 items', '1 item'].map((opt, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[1]) { const a = [...quizAnswers]; a[1] = idx; setQuizAnswers(a); } }}
                                            className={`${styles.quizOption} ${quizAnswers[1] === idx ? styles.selected : ''} ${quizChecked[1] && idx === 1 ? styles.correct : ''} ${quizChecked[1] && quizAnswers[1] === idx && idx !== 1 ? styles.wrong : ''}`}
                                            disabled={quizChecked[1]}>{opt}</button>
                                    ))}
                                </div>
                            </>
                        )}

                        {!quizChecked[currentQuiz] ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswers[currentQuiz] === null} style={{ background: 'var(--accent-primary)' }}>Check Answer</button>
                        ) : quizAnswers[currentQuiz] !== (currentQuiz === 0 ? 2 : 1) ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>{currentQuiz === 0 ? 'Sets use curly braces { } but WITHOUT colons. Dictionaries have colons!' : 'Sets remove duplicates! "ruby" appears twice but only counts once.'}</p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem', background: 'var(--accent-primary)' }}>Try Again</button>
                            </motion.div>
                        ) : currentQuiz === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${styles.quizFeedback} ${styles.success}`}>
                                <h4>Correct!</h4><p>Sets use curly braces without colons! Next question...</p>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
