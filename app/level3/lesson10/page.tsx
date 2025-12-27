'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, BookOpen, ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL3_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL3_LESSONS[9]; // Lesson 10 (0-indexed)
const LESSON_ID = 43;

export default function Lesson10() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('# Try sorting a list!\n');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);

    // Animation states for library sorting
    const [sortMode, setSortMode] = useState<'unsorted' | 'sorting' | 'ascending' | 'descending'>('unsorted');
    const [animatingBooks, setAnimatingBooks] = useState<string[]>(['Python', 'Zelda', 'Adventure', 'Code', 'Basic']);

    // Demo books for animation
    const unsortedBooks = ['Python', 'Zelda', 'Adventure', 'Code', 'Basic'];
    const sortedAscBooks = ['Adventure', 'Basic', 'Code', 'Python', 'Zelda'];
    const sortedDescBooks = ['Zelda', 'Python', 'Code', 'Basic', 'Adventure'];

    // Quiz questions
    const quizQuestions = [
        {
            question: 'What does .sort() do to the original list?',
            options: ['A) Creates a copy', 'B) Changes it directly', 'C) Deletes it'],
            correct: 1
        },
        {
            question: 'How do you sort from biggest to smallest?',
            options: ['A) .sort(reverse=True)', 'B) .sort(backwards=True)', 'C) .unsort()'],
            correct: 0
        }
    ];

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    // Auto-animate sorting demo
    useEffect(() => {
        const interval = setInterval(() => {
            setSortMode(prev => {
                if (prev === 'unsorted') {
                    setAnimatingBooks(unsortedBooks);
                    setTimeout(() => {
                        setSortMode('sorting');
                    }, 500);
                    return 'unsorted';
                }
                if (prev === 'sorting') {
                    setTimeout(() => {
                        setAnimatingBooks(sortedAscBooks);
                        setSortMode('ascending');
                    }, 800);
                    return 'sorting';
                }
                if (prev === 'ascending') {
                    setTimeout(() => {
                        setAnimatingBooks(sortedDescBooks);
                        setSortMode('descending');
                    }, 2000);
                    return 'ascending';
                }
                setAnimatingBooks(unsortedBooks);
                return 'unsorted';
            });
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            let variables: { [key: string]: (string | number)[] } = {};

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) continue;

                // List assignment with strings: name = ["item1", "item2", ...]
                const stringListMatch = trimmed.match(/^(\w+)\s*=\s*\[(.*)\]$/);
                if (stringListMatch) {
                    const listContent = stringListMatch[2];
                    // Check if it's strings or numbers
                    const items = listContent.split(',').map(item => {
                        const strMatch = item.trim().match(/^["'](.*)["']$/);
                        if (strMatch) return strMatch[1];
                        const numMatch = item.trim().match(/^(\d+)$/);
                        if (numMatch) return parseInt(numMatch[1]);
                        return item.trim();
                    }).filter(item => item !== '');
                    variables[stringListMatch[1]] = items;
                    continue;
                }

                // .sort() method
                const sortMatch = trimmed.match(/^(\w+)\.sort\(\s*(reverse\s*=\s*True)?\s*\)$/);
                if (sortMatch) {
                    const listVar = sortMatch[1];
                    const reverse = sortMatch[2] !== undefined;
                    if (variables[listVar]) {
                        const list = [...variables[listVar]];
                        if (typeof list[0] === 'number') {
                            list.sort((a, b) => (a as number) - (b as number));
                        } else {
                            list.sort();
                        }
                        if (reverse) list.reverse();
                        variables[listVar] = list;
                    }
                    continue;
                }

                // sorted() function
                const sortedMatch = trimmed.match(/^(\w+)\s*=\s*sorted\(\s*(\w+)\s*(?:,\s*reverse\s*=\s*True)?\s*\)$/);
                if (sortedMatch) {
                    const newVar = sortedMatch[1];
                    const sourceVar = sortedMatch[2];
                    const reverse = trimmed.includes('reverse=True');
                    if (variables[sourceVar]) {
                        const list = [...variables[sourceVar]];
                        if (typeof list[0] === 'number') {
                            list.sort((a, b) => (a as number) - (b as number));
                        } else {
                            list.sort();
                        }
                        if (reverse) list.reverse();
                        variables[newVar] = list;
                    }
                    continue;
                }

                // Print statement
                const printMatch = trimmed.match(/^print\s*\(\s*(.+)\s*\)$/);
                if (printMatch) {
                    const expr = printMatch[1].trim();

                    // Check for variable name (list)
                    if (variables[expr]) {
                        const list = variables[expr];
                        const formatted = '[' + list.map(item =>
                            typeof item === 'string' ? `'${item}'` : item
                        ).join(', ') + ']';
                        outputLines.push(formatted);
                        continue;
                    }

                    // Quoted string
                    const stringMatch = expr.match(/^["'](.*)["']$/);
                    if (stringMatch) {
                        outputLines.push(stringMatch[1]);
                        continue;
                    }

                    // f-string with variable
                    const fstringMatch = expr.match(/^f["'](.*)["']$/);
                    if (fstringMatch) {
                        let result = fstringMatch[1];
                        // Replace {var} with actual values
                        for (const [varName, value] of Object.entries(variables)) {
                            const varPattern = new RegExp(`\\{${varName}\\}`, 'g');
                            if (Array.isArray(value)) {
                                result = result.replace(varPattern, '[' + value.map(item =>
                                    typeof item === 'string' ? `'${item}'` : item
                                ).join(', ') + ']');
                            } else {
                                result = result.replace(varPattern, String(value));
                            }
                        }
                        outputLines.push(result);
                        continue;
                    }
                }
            }

            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Try using .sort() on a list!');
        } catch {
            setOutput('Error in code! Check your syntax.');
        }
    };

    const checkQuiz = () => {
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = true;
        setQuizChecked(newChecked);

        if (quizAnswers[currentQuiz] === quizQuestions[currentQuiz].correct) {
            if (currentQuiz < 1) {
                setTimeout(() => {
                    setCurrentQuiz(currentQuiz + 1);
                }, 1000);
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
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = false;
        setQuizChecked(newChecked);
        const newAnswers = [...quizAnswers];
        newAnswers[currentQuiz] = null;
        setQuizAnswers(newAnswers);
    };

    // Get book color based on first letter for visual distinction
    const getBookColor = (book: string) => {
        const colors: { [key: string]: string } = {
            'A': '#f472b6', // Pink
            'B': '#60a5fa', // Blue
            'C': '#4ade80', // Green
            'P': '#c084fc', // Purple
            'Z': '#fbbf24', // Yellow
        };
        return colors[book[0]] || '#94a3b8';
    };

    if (isLoading || !user) return <div className={styles.container}><div className="flex items-center justify-center h-screen text-slate-400">Loading...</div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
                    <ArrowUpDown size={50} className="text-white" />
                </motion.div>
                <h2 className={styles.successTitle}>{LESSON.successMessage}</h2>
                <p className={styles.successMessage}>You can now sort data like a librarian pro!</p>
                <div className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</div>
                <Link href="/level3/lesson11" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/level3" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 16</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                {!showQuiz ? (
                    <>
                        <div className={styles.lessonTitle}>
                            <motion.div
                                className={styles.lessonEmoji}
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3))' }}
                            >
                                <span style={{ fontSize: '2.5rem' }}>{LESSON.emoji}</span>
                            </motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Story/Mission Box with Library Animation */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(168, 85, 247, 0.15))',
                                textAlign: 'center',
                                padding: '1.5rem'
                            }}
                        >
                            <div style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <BookOpen size={24} className="text-blue-400" />
                                Library Helper! Books are all mixed up and need to be put in order.
                            </div>

                            {/* Animated Library Bookshelf */}
                            <div style={{
                                background: 'linear-gradient(180deg, #8B4513 0%, #654321 100%)',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                marginBottom: '1rem',
                                boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.3)'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    minHeight: '100px',
                                    alignItems: 'flex-end',
                                    padding: '0.5rem'
                                }}>
                                    <AnimatePresence mode="popLayout">
                                        {animatingBooks.map((book, idx) => (
                                            <motion.div
                                                key={book}
                                                layout
                                                initial={{ opacity: 0, y: -20 }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                    rotate: sortMode === 'sorting' ? [0, 5, -5, 0] : 0
                                                }}
                                                exit={{ opacity: 0, y: 20 }}
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 300,
                                                    damping: 25,
                                                    delay: idx * 0.05
                                                }}
                                                style={{
                                                    width: '50px',
                                                    height: `${60 + (book.length * 3)}px`,
                                                    background: `linear-gradient(180deg, ${getBookColor(book)}, ${getBookColor(book)}dd)`,
                                                    borderRadius: '2px 4px 4px 2px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                                                    border: '1px solid rgba(0,0,0,0.2)',
                                                    writingMode: 'vertical-rl',
                                                    textOrientation: 'mixed',
                                                    fontSize: '0.65rem',
                                                    fontWeight: 700,
                                                    color: 'white',
                                                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                                                }}
                                            >
                                                {book}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Status Indicator */}
                            <motion.div
                                animate={{ opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    background: sortMode === 'ascending' ? 'rgba(16, 185, 129, 0.2)' :
                                               sortMode === 'descending' ? 'rgba(251, 191, 36, 0.2)' :
                                               sortMode === 'sorting' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(0,0,0,0.2)',
                                    borderRadius: '9999px',
                                    fontSize: '0.9rem',
                                    fontWeight: 600
                                }}
                            >
                                {sortMode === 'unsorted' && <><ArrowUpDown size={16} /> Mixed Up!</>}
                                {sortMode === 'sorting' && <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.5, repeat: Infinity }}><ArrowUpDown size={16} /></motion.div> Sorting...</>}
                                {sortMode === 'ascending' && <><ArrowUp size={16} className="text-emerald-400" /> A to Z (ascending)</>}
                                {sortMode === 'descending' && <><ArrowDown size={16} className="text-amber-400" /> Z to A (descending)</>}
                            </motion.div>

                            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                Learn to SORT your lists from smallest to largest (or A to Z)!
                            </p>
                        </motion.div>

                        {/* Symbol Explanations */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ArrowUpDown size={20} /> Sorting Methods:
                            </h3>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{
                                    background: 'rgba(59, 130, 246, 0.15)',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(59, 130, 246, 0.3)'
                                }}>
                                    <code style={{ color: '#3b82f6', fontWeight: 700, fontSize: '1.1rem' }}>.sort()</code>
                                    <span style={{ marginLeft: '0.75rem' }}>=</span>
                                    <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>
                                        Sorts the list itself, changes the original list
                                    </span>
                                </div>
                                <div style={{
                                    background: 'rgba(168, 85, 247, 0.15)',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(168, 85, 247, 0.3)'
                                }}>
                                    <code style={{ color: '#a855f7', fontWeight: 700, fontSize: '1.1rem' }}>sorted()</code>
                                    <span style={{ marginLeft: '0.75rem' }}>=</span>
                                    <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>
                                        Creates a brand new sorted list, keeps original safe
                                    </span>
                                </div>
                                <div style={{
                                    background: 'rgba(251, 191, 36, 0.15)',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(251, 191, 36, 0.3)'
                                }}>
                                    <code style={{ color: '#fbbf24', fontWeight: 700, fontSize: '1.1rem' }}>reverse=True</code>
                                    <span style={{ marginLeft: '0.75rem' }}>=</span>
                                    <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>
                                        Flip the order: biggest first!
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Key Concepts */}
                        <div className={styles.explainBox} style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                            <h3 style={{ marginBottom: '0.75rem', color: '#10b981' }}>Key Concepts:</h3>
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>1</span>
                                    <p><code>list.sort()</code> - sorts the list IN PLACE (changes original)</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>2</span>
                                    <p><code>sorted(list)</code> - returns a NEW sorted list (keeps original)</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>3</span>
                                    <p>Default: smallest to largest (ascending)</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>4</span>
                                    <p><code>reverse=True</code> for largest to smallest</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>5</span>
                                    <p>Works with numbers and strings!</p>
                                </div>
                            </div>
                        </div>

                        {/* Code Example */}
                        <div className={styles.codeSection}>
                            <h3>Code Example</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>sorting.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># Numbers list</span>{'\n'}
                                    numbers = [<span className={styles.number}>5</span>, <span className={styles.number}>2</span>, <span className={styles.number}>8</span>, <span className={styles.number}>1</span>, <span className={styles.number}>9</span>]{'\n\n'}

                                    <span className={styles.comment}># Sort from smallest to largest</span>{'\n'}
                                    numbers.<span style={{ color: '#8be9fd' }}>sort</span>(){'\n'}
                                    <span className={styles.keyword}>print</span>(numbers)  <span className={styles.comment}># [1, 2, 5, 8, 9]</span>{'\n\n'}

                                    <span className={styles.comment}># Reverse order (biggest first)</span>{'\n'}
                                    numbers.<span style={{ color: '#8be9fd' }}>sort</span>(<span style={{ color: '#fbbf24' }}>reverse=True</span>){'\n'}
                                    <span className={styles.keyword}>print</span>(numbers)  <span className={styles.comment}># [9, 8, 5, 2, 1]</span>
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>[1, 2, 5, 8, 9]{'\n'}[9, 8, 5, 2, 1]</div>
                            </div>
                        </div>

                        {/* Comparison Box */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem',
                                marginBottom: '2rem'
                            }}
                        >
                            <div style={{
                                background: 'rgba(59, 130, 246, 0.1)',
                                border: '2px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: 'var(--radius)',
                                padding: '1rem'
                            }}>
                                <h4 style={{ color: '#3b82f6', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.25rem' }}>1</span> .sort()
                                </h4>
                                <div className={styles.codeBlock} style={{ marginBottom: '0.5rem' }}>
                                    <div className={styles.codeContent} style={{ fontSize: '0.85rem', padding: '0.75rem' }}>
                                        nums = [<span className={styles.number}>3</span>, <span className={styles.number}>1</span>, <span className={styles.number}>2</span>]{'\n'}
                                        nums.<span style={{ color: '#8be9fd' }}>sort</span>(){'\n'}
                                        <span className={styles.keyword}>print</span>(nums){'\n'}
                                        <span className={styles.comment}># [1, 2, 3]</span>
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Changes original list!</p>
                            </div>

                            <div style={{
                                background: 'rgba(168, 85, 247, 0.1)',
                                border: '2px solid rgba(168, 85, 247, 0.3)',
                                borderRadius: 'var(--radius)',
                                padding: '1rem'
                            }}>
                                <h4 style={{ color: '#a855f7', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.25rem' }}>2</span> sorted()
                                </h4>
                                <div className={styles.codeBlock} style={{ marginBottom: '0.5rem' }}>
                                    <div className={styles.codeContent} style={{ fontSize: '0.85rem', padding: '0.75rem' }}>
                                        nums = [<span className={styles.number}>3</span>, <span className={styles.number}>1</span>, <span className={styles.number}>2</span>]{'\n'}
                                        new = <span style={{ color: '#8be9fd' }}>sorted</span>(nums){'\n'}
                                        <span className={styles.keyword}>print</span>(new){'\n'}
                                        <span className={styles.comment}># [1, 2, 3]</span>
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Original stays the same!</p>
                            </div>
                        </motion.div>

                        {/* Interactive Code Editor */}
                        <div className={styles.codeSection}>
                            <h3>Your Turn!</h3>
                            <p style={{ marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Try sorting books alphabetically! You can also try with numbers like <code>[5, 2, 8, 1]</code>.
                                Use <code>reverse=True</code> to flip the order!
                            </p>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    spellCheck={false}
                                    style={{ minHeight: '180px' }}
                                />
                            </div>
                            <button className={styles.runBtn} onClick={runCode}><Play size={18} /> Run Code</button>
                            {output && <div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></div>}
                        </div>

                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <div>
                                <p style={{ fontWeight: 600 }}>Pro Tip: Strings Sort Alphabetically!</p>
                                <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                    <code>["cat", "apple", "banana"].sort()</code> gives <code>["apple", "banana", "cat"]</code>
                                </p>
                            </div>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level3/lesson9" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection}>
                        <h2 className={styles.quizTitle}>Brain Check! ({currentQuiz + 1}/2)</h2>
                        <p className={styles.quizQuestion}>{quizQuestions[currentQuiz].question}</p>
                        <div className={styles.quizOptions}>
                            {quizQuestions[currentQuiz].options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        if (!quizChecked[currentQuiz]) {
                                            const newAnswers = [...quizAnswers];
                                            newAnswers[currentQuiz] = idx;
                                            setQuizAnswers(newAnswers);
                                        }
                                    }}
                                    className={`${styles.quizOption} ${quizAnswers[currentQuiz] === idx ? styles.selected : ''} ${quizChecked[currentQuiz] && idx === quizQuestions[currentQuiz].correct ? styles.correct : ''} ${quizChecked[currentQuiz] && quizAnswers[currentQuiz] === idx && idx !== quizQuestions[currentQuiz].correct ? styles.wrong : ''}`}
                                    disabled={quizChecked[currentQuiz]}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                        {!quizChecked[currentQuiz] ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswers[currentQuiz] === null}>Check Answer</button>
                        ) : quizAnswers[currentQuiz] !== quizQuestions[currentQuiz].correct ? (
                            <div className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>
                                    {currentQuiz === 0 && '.sort() modifies the original list directly - it changes it in place!'}
                                    {currentQuiz === 1 && 'Use .sort(reverse=True) to sort from biggest to smallest. There is no .unsort() or backwards=True!'}
                                </p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem' }}>Try Again</button>
                            </div>
                        ) : (
                            <div className={`${styles.quizFeedback} ${styles.success}`}>
                                <h4>Correct!</h4>
                                {currentQuiz < 1 && <p>Moving to the next question...</p>}
                            </div>
                        )}

                        <button
                            onClick={() => setShowQuiz(false)}
                            style={{
                                marginTop: '1.5rem',
                                padding: '0.5rem 1rem',
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '0.5rem',
                                color: 'var(--text-muted)',
                                cursor: 'pointer'
                            }}
                        >
                            <ChevronLeft size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Back to Lesson
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
