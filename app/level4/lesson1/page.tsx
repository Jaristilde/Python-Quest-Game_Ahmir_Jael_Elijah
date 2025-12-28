'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Bot, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL4_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL4_LESSONS[0]; // Lesson 1
const LESSON_ID = 50; // Level 4 lessons start at 50 for tracking

export default function Lesson1() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('# Create your first function!\n');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasCreatedFunction, setHasCreatedFunction] = useState(false);
    const [hasCalledFunction, setHasCalledFunction] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            let functions: Record<string, string[]> = {};
            let currentFunction: string | null = null;
            let functionBody: string[] = [];

            // First pass: collect function definitions
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();

                if (trimmed.startsWith('#') || trimmed === '') continue;

                // Function definition: def function_name():
                const defMatch = trimmed.match(/^def\s+(\w+)\s*\(\s*\)\s*:$/);
                if (defMatch) {
                    currentFunction = defMatch[1];
                    functionBody = [];
                    setHasCreatedFunction(true);
                    continue;
                }

                // Check if we're inside a function (indented code)
                if (currentFunction && (line.startsWith('    ') || line.startsWith('\t'))) {
                    functionBody.push(trimmed);
                    functions[currentFunction] = [...functionBody];
                    continue;
                }

                // End of function body (non-indented line)
                if (currentFunction && !line.startsWith('    ') && !line.startsWith('\t')) {
                    currentFunction = null;
                }
            }

            // Second pass: execute top-level code and function calls
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || trimmed === '') continue;
                if (trimmed.startsWith('def ')) continue;
                if (line.startsWith('    ') || line.startsWith('\t')) continue;

                // Function call: function_name()
                const callMatch = trimmed.match(/^(\w+)\s*\(\s*\)$/);
                if (callMatch) {
                    const funcName = callMatch[1];
                    if (funcName === 'print') continue;

                    if (functions[funcName]) {
                        setHasCalledFunction(true);
                        // Execute the function body
                        for (const bodyLine of functions[funcName]) {
                            const printMatch = bodyLine.match(/^print\s*\(["'](.*)["']\)$/);
                            if (printMatch) {
                                outputLines.push(printMatch[1]);
                            }
                        }
                    }
                    continue;
                }

                // Print statement
                const printMatch = trimmed.match(/^print\s*\(["'](.*)["']\)$/);
                if (printMatch) {
                    outputLines.push(printMatch[1]);
                    continue;
                }
            }

            if (outputLines.length > 0) {
                setOutput(outputLines.join('\n'));
            } else {
                setOutput('Run your code to see what happens!');
            }
        } catch {
            setOutput('Error in code! Check your syntax.');
        }
    };

    const checkQuiz = () => {
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = true;
        setQuizChecked(newChecked);

        // Correct answers: Q1 = 2 (def), Q2 = 1 (function_name())
        const correctAnswers = [2, 1];

        if (quizAnswers[currentQuiz] === correctAnswers[currentQuiz]) {
            if (currentQuiz === 0) {
                setTimeout(() => {
                    setCurrentQuiz(1);
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
        const newAnswers = [...quizAnswers];
        newAnswers[currentQuiz] = null;
        setQuizAnswers(newAnswers);

        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = false;
        setQuizChecked(newChecked);
    };

    if (isLoading || !user) {
        return (
            <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
                <div className="flex items-center justify-center h-screen">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        style={{ fontSize: '3rem' }}
                    >
                        🍭
                    </motion.div>
                </div>
            </div>
        );
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'rgba(0, 0, 0, 0.95)' }}>
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', duration: 0.8 }}
                    className={styles.successIcon}
                    style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
                >
                    <Check size={50} className="text-white" />
                </motion.div>
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={styles.successTitle}
                    style={{ color: 'var(--accent-primary)' }}
                >
                    Function Creator Unlocked!
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={styles.successMessage}
                >
                    {LESSON.successMessage} You taught your robot a new trick!
                </motion.p>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className={styles.successXp}
                >
                    <Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP
                </motion.div>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <Link href="/level4/lesson2" className={`${styles.navBtn} ${styles.primary}`}>
                        Next Lesson <ChevronRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
            <header className={styles.header} style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--accent-primary)' }}>
                <Link href="/level4" className={styles.backBtn}>
                    <ArrowLeft size={18} /> Back
                </Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 13</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}>
                        <Heart size={14} fill="currentColor" /> {user.progress.lives}
                    </div>
                    <div className={`${styles.statBadge} ${styles.xp}`}>
                        <Zap size={14} fill="currentColor" /> {user.progress.xp}
                    </div>
                </div>
            </header>

            <div className={styles.content}>
                {!showQuiz ? (
                    <>
                        {/* Lesson Title */}
                        <div className={styles.lessonTitle}>
                            <motion.div
                                className={styles.lessonEmoji}
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
                            >
                                {LESSON.emoji}
                            </motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1 style={{ color: 'var(--accent-primary)' }}>{LESSON.title}</h1>
                                <p>Learn: <code style={{ color: 'var(--accent-secondary)' }}>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Story Introduction - Candy Land Theme */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))', borderColor: 'var(--accent-primary)' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Bot size={28} style={{ color: 'var(--accent-primary)' }} />
                                <Sparkles size={24} style={{ color: 'var(--accent-secondary)' }} />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>Mission: Teach Your Robot a Trick!</span>
                            </div>

                            {/* Robot Animation */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '1.5rem',
                                background: 'var(--bg-secondary)',
                                borderRadius: '0.75rem',
                                marginBottom: '1rem'
                            }}>
                                <motion.div
                                    animate={{ y: [0, -3, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    style={{ fontSize: '2.5rem', marginRight: '0.5rem' }}
                                >
                                    🤖
                                </motion.div>
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    style={{ fontSize: '1.5rem' }}
                                >
                                    💬
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 }}
                                    style={{
                                        background: 'var(--accent-primary)',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '1rem',
                                        marginLeft: '0.5rem',
                                        color: 'white',
                                        fontWeight: 600
                                    }}
                                >
                                    "Hello, friend!"
                                </motion.div>
                            </div>

                            <p>
                                🍬 Imagine you had to tell your robot to say "Hello!" every time by typing the same code over and over.
                                <strong style={{ color: 'var(--accent-secondary)' }}> Boring!</strong> Let's teach it a <strong style={{ color: 'var(--accent-primary)' }}>TRICK</strong> it can do whenever you ask!
                            </p>
                        </motion.div>

                        {/* The Problem vs Solution */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-secondary)' }}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
                                <Lightbulb size={20} style={{ color: 'var(--accent-secondary)' }} /> Why Functions?
                            </h3>

                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {/* The Problem */}
                                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                    <p style={{ fontWeight: 700, color: '#f87171', marginBottom: '0.5rem' }}>The Problem (Repeating Code):</p>
                                    <div style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.9rem', color: '#6272a4' }}>
                                        print("Hello, friend!"){'\n'}
                                        print("Hello, friend!"){'\n'}
                                        print("Hello, friend!"){'\n'}
                                        <span style={{ color: '#f87171' }}># So much typing! 😫</span>
                                    </div>
                                </div>

                                {/* The Solution */}
                                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                    <p style={{ fontWeight: 700, color: '#10b981', marginBottom: '0.5rem' }}>The Solution (Use a Function!):</p>
                                    <div style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.9rem' }}>
                                        <span style={{ color: '#ff79c6' }}>def</span> <span style={{ color: '#50fa7b' }}>say_hello</span>():{'\n'}
                                        {'    '}print("Hello, friend!"){'\n\n'}
                                        <span style={{ color: '#50fa7b' }}>say_hello</span>()  <span style={{ color: '#6272a4' }}># Just call it! 🎉</span>{'\n'}
                                        <span style={{ color: '#50fa7b' }}>say_hello</span>()  <span style={{ color: '#6272a4' }}># And again!</span>{'\n'}
                                        <span style={{ color: '#50fa7b' }}>say_hello</span>()  <span style={{ color: '#6272a4' }}># Easy!</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Symbol Explanations */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
                                🍭 The Magic Symbols
                            </h3>

                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255, 121, 198, 0.1)', borderRadius: '0.5rem' }}>
                                    <code style={{ color: '#ff79c6', fontSize: '1.1rem', fontWeight: 700 }}>def</code>
                                    <span>= "Define" - This keyword tells Python you're creating a new function!</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(80, 250, 123, 0.1)', borderRadius: '0.5rem' }}>
                                    <code style={{ color: '#50fa7b', fontSize: '1.1rem', fontWeight: 700 }}>function_name</code>
                                    <span>= The name you give your trick (use lowercase and underscores like <code>say_hello</code>)</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(189, 147, 249, 0.1)', borderRadius: '0.5rem' }}>
                                    <code style={{ color: '#bd93f9', fontSize: '1.1rem', fontWeight: 700 }}>()</code>
                                    <span>= Parentheses - Like a container for extra info (we'll learn more later!)</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(139, 233, 253, 0.1)', borderRadius: '0.5rem' }}>
                                    <code style={{ color: '#8be9fd', fontSize: '1.1rem', fontWeight: 700 }}>:</code>
                                    <span>= Colon - Marks the start of your function's code (don't forget it!)</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255, 184, 108, 0.1)', borderRadius: '0.5rem' }}>
                                    <code style={{ color: '#ffb86c', fontSize: '1.1rem', fontWeight: 700 }}>{'    '}indented code</code>
                                    <span>= Code that belongs to the function (use 4 spaces or Tab)</span>
                                </div>
                            </div>
                        </div>

                        {/* Example Code */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: 'var(--accent-secondary)' }}>Example: Say Hello Function</h3>
                            <div className={styles.codeBlock} style={{ borderColor: 'var(--accent-primary)' }}>
                                <div className={styles.codeHeader}>
                                    <span>main.py</span>
                                    <span>Python</span>
                                </div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># Create a function that says hello</span>{'\n'}
                                    <span className={styles.keyword}>def</span> <span style={{ color: '#50fa7b' }}>say_hello</span>():{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"Hello, friend!"</span>){'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"Welcome to Candy Land!"</span>){'\n\n'}
                                    <span className={styles.comment}># Call the function 3 times!</span>{'\n'}
                                    <span style={{ color: '#50fa7b' }}>say_hello</span>(){'\n'}
                                    <span style={{ color: '#50fa7b' }}>say_hello</span>(){'\n'}
                                    <span style={{ color: '#50fa7b' }}>say_hello</span>()
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>
                                    Hello, friend!{'\n'}
                                    Welcome to Candy Land!{'\n'}
                                    Hello, friend!{'\n'}
                                    Welcome to Candy Land!{'\n'}
                                    Hello, friend!{'\n'}
                                    Welcome to Candy Land!
                                </div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: 'var(--accent-secondary)' }}>Your Turn - Create a Cheer Function!</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                Create a function called <code style={{ color: 'var(--accent-primary)' }}>cheer()</code> that prints an encouraging message, then call it!
                            </p>
                            <div className={styles.editor} style={{ borderColor: 'var(--accent-primary)' }}>
                                <div className={styles.codeHeader}>
                                    <span>your_code.py</span>
                                    <span>Python</span>
                                </div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder='# Create a cheer function!
def cheer():
    print("You can do it!")
    print("Go team!")

# Call your function
cheer()'
                                    spellCheck={false}
                                    style={{ minHeight: '180px' }}
                                />
                            </div>
                            <button className={styles.runBtn} onClick={runCode} style={{ background: 'var(--accent-primary)' }}>
                                <Play size={18} /> Run Code
                            </button>

                            {output && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={styles.outputBox}
                                >
                                    <div className={styles.outputLabel}>
                                        Output:
                                    </div>
                                    <div className={styles.outputText}>
                                        {output}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Challenge Tracker */}
                        <div className={styles.challenges} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
                            <h3 style={{ color: 'var(--accent-primary)' }}>Try These Challenges:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasCreatedFunction ? styles.done : ''}`}>
                                        {hasCreatedFunction && <Check size={14} />}
                                    </div>
                                    Create a function using <code style={{ color: 'var(--accent-secondary)' }}>def</code>
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasCalledFunction ? styles.done : ''}`}>
                                        {hasCalledFunction && <Check size={14} />}
                                    </div>
                                    Call your function using <code style={{ color: 'var(--accent-secondary)' }}>function_name()</code>
                                </li>
                            </ul>
                        </div>

                        {/* Tip Box */}
                        <div className={styles.tipBox} style={{ background: 'rgba(251, 191, 36, 0.15)', borderColor: 'var(--accent-secondary)' }}>
                            <Lightbulb size={20} style={{ color: 'var(--accent-secondary)', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--accent-secondary)' }}>Remember:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li>Use <code>def</code> to create a function</li>
                                    <li>Don't forget the <code>:</code> after the parentheses!</li>
                                    <li>Indent your code inside the function (4 spaces)</li>
                                    <li>Call your function by its name with <code>()</code></li>
                                </ul>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className={styles.navBar}>
                            <Link href="/level4" className={`${styles.navBtn} ${styles.secondary}`}>
                                <ChevronLeft size={18} /> Level Hub
                            </Link>
                            <button
                                className={`${styles.navBtn} ${styles.primary}`}
                                onClick={() => setShowQuiz(true)}
                                style={{ background: 'var(--accent-primary)' }}
                            >
                                Quiz Time! <ChevronRight size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    /* Quiz Section */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={styles.quizSection}
                        style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))', borderColor: 'var(--accent-primary)' }}
                    >
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ fontSize: '3rem', marginBottom: '1rem' }}
                        >
                            🍬
                        </motion.div>
                        <h2 className={styles.quizTitle} style={{ color: 'var(--accent-primary)' }}>Brain Check! (Question {currentQuiz + 1}/2)</h2>

                        {currentQuiz === 0 ? (
                            <>
                                <p className={styles.quizQuestion}>
                                    What keyword creates a function in Python?
                                </p>
                                <div className={styles.quizOptions}>
                                    {[
                                        'new',
                                        'function',
                                        'def'
                                    ].map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                if (!quizChecked[0]) {
                                                    const newAnswers = [...quizAnswers];
                                                    newAnswers[0] = idx;
                                                    setQuizAnswers(newAnswers);
                                                }
                                            }}
                                            className={`${styles.quizOption} ${quizAnswers[0] === idx ? styles.selected : ''
                                                } ${quizChecked[0] && idx === 2 ? styles.correct : ''
                                                } ${quizChecked[0] && quizAnswers[0] === idx && idx !== 2 ? styles.wrong : ''
                                                }`}
                                            disabled={quizChecked[0]}
                                        >
                                            <code>{option}</code>
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>
                                    How do you call (run) a function named <code>dance</code>?
                                </p>
                                <div className={styles.quizOptions}>
                                    {[
                                        'def dance():',
                                        'dance()',
                                        'call dance'
                                    ].map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                if (!quizChecked[1]) {
                                                    const newAnswers = [...quizAnswers];
                                                    newAnswers[1] = idx;
                                                    setQuizAnswers(newAnswers);
                                                }
                                            }}
                                            className={`${styles.quizOption} ${quizAnswers[1] === idx ? styles.selected : ''
                                                } ${quizChecked[1] && idx === 1 ? styles.correct : ''
                                                } ${quizChecked[1] && quizAnswers[1] === idx && idx !== 1 ? styles.wrong : ''
                                                }`}
                                            disabled={quizChecked[1]}
                                        >
                                            <code>{option}</code>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {!quizChecked[currentQuiz] ? (
                            <button
                                className={styles.quizBtn}
                                onClick={checkQuiz}
                                disabled={quizAnswers[currentQuiz] === null}
                                style={{ background: 'var(--accent-primary)' }}
                            >
                                Check Answer
                            </button>
                        ) : quizAnswers[currentQuiz] !== (currentQuiz === 0 ? 2 : 1) ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.quizFeedback} ${styles.error}`}
                            >
                                <h4>Not quite!</h4>
                                <p>
                                    {currentQuiz === 0
                                        ? 'In Python, we use "def" (short for define) to create functions. Think of it as DEFining a new trick!'
                                        : 'To call a function, just use its name followed by parentheses: dance()'
                                    }
                                </p>
                                <button
                                    className={styles.quizBtn}
                                    onClick={retryQuiz}
                                    style={{ marginTop: '1rem', background: 'var(--accent-primary)' }}
                                >
                                    Try Again
                                </button>
                            </motion.div>
                        ) : currentQuiz === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.quizFeedback} ${styles.success}`}
                            >
                                <h4>Correct!</h4>
                                <p>"def" is short for "define" - you're defining a new function! Moving to the next question...</p>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
