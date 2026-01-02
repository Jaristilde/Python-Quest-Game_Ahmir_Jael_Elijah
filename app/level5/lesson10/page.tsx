'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Bot, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL5_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL5_LESSONS[9]; // Lesson 10 (0-indexed)
const LESSON_ID = 72;

export default function Lesson10() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('# Nested structures - dict with list inside!\nclassroom = {\n    "teacher": "Ms. Smith",\n    "students": ["Alex", "Sam", "Jordan"]\n}\n\nprint(classroom["teacher"])\nprint(classroom["students"][0])\n');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasAccessedNested, setHasAccessedNested] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];

            // Simple nested structure parsing
            interface NestedValue {
                type: string;
                value: Record<string, string | string[]> | Array<Record<string, string | number>>;
            }
            let variables: Record<string, NestedValue> = {};
            let currentVar = '';
            let bracketCount = 0;
            let collectingDict = '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || trimmed === '') continue;

                // Start of dict with nested data
                const dictStartMatch = trimmed.match(/^(\w+)\s*=\s*\{$/);
                if (dictStartMatch) {
                    currentVar = dictStartMatch[1];
                    bracketCount = 1;
                    collectingDict = '{';
                    continue;
                }

                // Continue collecting dict
                if (bracketCount > 0) {
                    collectingDict += trimmed;
                    bracketCount += (trimmed.match(/\{/g) || []).length;
                    bracketCount -= (trimmed.match(/\}/g) || []).length;

                    if (bracketCount === 0) {
                        // Parse the complete dict
                        try {
                            // Simple parsing for demo
                            const teacherMatch = collectingDict.match(/"teacher"\s*:\s*"([^"]+)"/);
                            const studentsMatch = collectingDict.match(/"students"\s*:\s*\[([^\]]+)\]/);

                            const dict: Record<string, string | string[]> = {};
                            if (teacherMatch) dict['teacher'] = teacherMatch[1];
                            if (studentsMatch) {
                                dict['students'] = studentsMatch[1].split(',').map(s =>
                                    s.trim().replace(/['"]/g, '')
                                );
                            }

                            // Also check for other patterns
                            const nameMatch = collectingDict.match(/"name"\s*:\s*"([^"]+)"/);
                            const itemsMatch = collectingDict.match(/"items"\s*:\s*\[([^\]]+)\]/);
                            if (nameMatch) dict['name'] = nameMatch[1];
                            if (itemsMatch) {
                                dict['items'] = itemsMatch[1].split(',').map(s =>
                                    s.trim().replace(/['"]/g, '')
                                );
                            }

                            variables[currentVar] = { type: 'nested_dict', value: dict };
                        } catch {
                            // Parsing failed
                        }
                        currentVar = '';
                        collectingDict = '';
                    }
                    continue;
                }

                // Single line dict assignment
                const singleDictMatch = trimmed.match(/^(\w+)\s*=\s*\{(.+)\}$/);
                if (singleDictMatch) {
                    const varName = singleDictMatch[1];
                    const content = singleDictMatch[2];

                    const teacherMatch = content.match(/"teacher"\s*:\s*"([^"]+)"/);
                    const studentsMatch = content.match(/"students"\s*:\s*\[([^\]]+)\]/);

                    const dict: Record<string, string | string[]> = {};
                    if (teacherMatch) dict['teacher'] = teacherMatch[1];
                    if (studentsMatch) {
                        dict['students'] = studentsMatch[1].split(',').map(s =>
                            s.trim().replace(/['"]/g, '')
                        );
                    }

                    variables[varName] = { type: 'nested_dict', value: dict };
                    continue;
                }

                // List of dicts
                const listOfDictsMatch = trimmed.match(/^(\w+)\s*=\s*\[$/);
                if (listOfDictsMatch) {
                    // Simplified - just mark as list of dicts
                    variables[listOfDictsMatch[1]] = { type: 'list_of_dicts', value: [] };
                    continue;
                }

                // Print nested access: dict["key"][index]
                const nestedAccessMatch = trimmed.match(/^print\s*\(\s*(\w+)\[["'](\w+)["']\]\[(\d+)\]\s*\)$/);
                if (nestedAccessMatch) {
                    const varName = nestedAccessMatch[1];
                    const key = nestedAccessMatch[2];
                    const index = parseInt(nestedAccessMatch[3]);

                    if (variables[varName] && variables[varName].type === 'nested_dict') {
                        const dict = variables[varName].value as Record<string, string | string[]>;
                        if (dict[key] && Array.isArray(dict[key])) {
                            const arr = dict[key] as string[];
                            if (index < arr.length) {
                                outputLines.push(arr[index]);
                                setHasAccessedNested(true);
                            }
                        }
                    }
                    continue;
                }

                // Print simple key access: dict["key"]
                const simpleAccessMatch = trimmed.match(/^print\s*\(\s*(\w+)\[["'](\w+)["']\]\s*\)$/);
                if (simpleAccessMatch) {
                    const varName = simpleAccessMatch[1];
                    const key = simpleAccessMatch[2];

                    if (variables[varName] && variables[varName].type === 'nested_dict') {
                        const dict = variables[varName].value as Record<string, string | string[]>;
                        if (dict[key]) {
                            if (Array.isArray(dict[key])) {
                                outputLines.push(`['${(dict[key] as string[]).join("', '")}']`);
                            } else {
                                outputLines.push(dict[key] as string);
                            }
                        }
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
        const correctAnswers = [1, 2]; // Q1 = Yes you can, Q2 = classroom["students"][0]

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
        return <div className={styles.container} style={{ background: 'var(--bg-primary)' }}><div className="flex items-center justify-center h-screen"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🧩</motion.div></div></div>;
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'rgba(0, 0, 0, 0.95)' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}><Check size={50} /></motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle} style={{ color: 'var(--accent-primary)' }}>Data Architect! 🧩</motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}><Link href="/level5/lesson11" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link></motion.div>
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
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>Combining Collections!</span>
                            </div>
                            <p>
                                Here's where it gets exciting! You can put <strong style={{ color: 'var(--accent-secondary)' }}>collections inside other collections</strong>!
                                Like putting a list inside a dictionary, or making a list of dictionaries!
                            </p>
                        </motion.div>

                        {/* Dict with List Inside */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-secondary)' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>🏫 Dictionary with a List Inside</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                Imagine a classroom: one teacher, but MANY students. Perfect for a dict with a list!
                            </p>
                            <div style={{ background: 'rgba(139, 233, 253, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(139, 233, 253, 0.3)' }}>
                                <code style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap', display: 'block' }}>
                                    classroom = {"{"}{'\n'}
                                    {'    '}<span style={{ color: '#50fa7b' }}>"teacher"</span>: <span style={{ color: '#f1fa8c' }}>"Ms. Smith"</span>,{'\n'}
                                    {'    '}<span style={{ color: '#50fa7b' }}>"students"</span>: <span style={{ color: '#ff79c6' }}>["Alex", "Sam", "Jordan"]</span>{'\n'}
                                    {"}"}
                                </code>
                            </div>
                            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                The "students" key contains a whole LIST!
                            </p>
                        </div>

                        {/* Accessing Nested Data */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>🔍 Accessing Nested Data</h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ background: 'rgba(80, 250, 123, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
                                    <code style={{ color: '#50fa7b' }}>classroom["teacher"]</code>
                                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Gets "Ms. Smith"</p>
                                </div>
                                <div style={{ background: 'rgba(255, 121, 198, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
                                    <code style={{ color: '#ff79c6' }}>classroom["students"]</code>
                                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Gets the whole list: ["Alex", "Sam", "Jordan"]</p>
                                </div>
                                <div style={{ background: 'rgba(139, 233, 253, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
                                    <code style={{ color: '#8be9fd' }}>classroom["students"][0]</code>
                                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Gets the first student: "Alex"</p>
                                </div>
                            </div>
                        </div>

                        {/* List of Dicts */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-secondary)' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>📚 List of Dictionaries</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                You can also have a list where each item is a dictionary!
                            </p>
                            <div style={{ background: 'rgba(255, 121, 198, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 121, 198, 0.3)' }}>
                                <code style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap', display: 'block' }}>
                                    players = [{'\n'}
                                    {'    '}{"{"}"name": "Alex", "score": 100{"},"}{'\n'}
                                    {'    '}{"{"}"name": "Sam", "score": 85{"}"}{'\n'}
                                    ]
                                </code>
                            </div>
                            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                Each player has their own dict with name and score!
                            </p>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: 'var(--accent-secondary)' }}>Your Turn - Explore Nested Data!</h3>
                            <div className={styles.editor} style={{ borderColor: 'var(--accent-primary)' }}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '200px' }} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode} style={{ background: 'var(--accent-primary)' }}><Play size={18} /> Run Code</button>
                            {output && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></motion.div>}
                        </div>

                        {/* Challenges */}
                        <div className={styles.challenges} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
                            <h3 style={{ color: 'var(--accent-primary)' }}>Challenge:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasAccessedNested ? styles.done : ''}`}>{hasAccessedNested && <Check size={14} />}</div>
                                    Access a nested item with <code style={{ color: 'var(--accent-secondary)' }}>dict["key"][index]</code>
                                </li>
                            </ul>
                        </div>

                        <div className={styles.tipBox} style={{ background: 'rgba(251, 191, 36, 0.15)', borderColor: 'var(--accent-secondary)' }}>
                            <Lightbulb size={20} style={{ color: 'var(--accent-secondary)', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>Think of it like:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li>Dict with list = Classroom (one teacher, many students)</li>
                                    <li>List of dicts = Leaderboard (many players, each with stats)</li>
                                    <li>Access step by step: first get the dict key, then the list index</li>
                                </ul>
                            </div>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level5/lesson9" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)} style={{ background: 'var(--accent-primary)' }}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection} style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))', borderColor: 'var(--accent-primary)' }}>
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧩</motion.div>
                        <h2 className={styles.quizTitle} style={{ color: 'var(--accent-primary)' }}>Brain Check! (Question {currentQuiz + 1}/2)</h2>

                        {currentQuiz === 0 ? (
                            <>
                                <p className={styles.quizQuestion}>Can you put a list inside a dictionary?</p>
                                <div className={styles.quizOptions}>
                                    {['No, they are different types', 'Yes! A dictionary value can be a list', 'Only in Python 4'].map((opt, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[0]) { const a = [...quizAnswers]; a[0] = idx; setQuizAnswers(a); } }}
                                            className={`${styles.quizOption} ${quizAnswers[0] === idx ? styles.selected : ''} ${quizChecked[0] && idx === 1 ? styles.correct : ''} ${quizChecked[0] && quizAnswers[0] === idx && idx !== 1 ? styles.wrong : ''}`}
                                            disabled={quizChecked[0]}>{opt}</button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>
                                    Given: <code>classroom = {"{"}"students": ["Alex", "Sam"]{"}"}</code><br/>
                                    How do you get "Alex"?
                                </p>
                                <div className={styles.quizOptions}>
                                    {['classroom["Alex"]', 'classroom[0]', 'classroom["students"][0]'].map((opt, idx) => (
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
                                <p>{currentQuiz === 0 ? 'Yes you can! Dictionary values can be any type - including lists, tuples, or even other dictionaries!' : 'First get the list with ["students"], then the first item with [0]!'}</p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem', background: 'var(--accent-primary)' }}>Try Again</button>
                            </motion.div>
                        ) : currentQuiz === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${styles.quizFeedback} ${styles.success}`}>
                                <h4>Correct!</h4><p>Dictionary values can be any type! Next question...</p>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
