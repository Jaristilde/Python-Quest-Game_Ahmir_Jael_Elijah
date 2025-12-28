'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Home, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL4_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL4_LESSONS[7]; // Lesson 8 (index 7)
const LESSON_ID = 57; // Level 4 lessons 50-62, lesson 8 = 57

export default function Lesson8() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# Let's explore where variables live!

# This is a GLOBAL variable - it lives outside any function
robot_name = "Sparky"

def greet():
    # This is a LOCAL variable - it only lives inside this function
    greeting = "Hello!"
    print(greeting)
    print(robot_name)  # We CAN use global variables inside functions!

greet()
print(robot_name)  # This works - global variables work everywhere!
# print(greeting)  # This would cause an error! greeting only exists inside greet()
`);
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizChecked, setQuizChecked] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasTestedLocal, setHasTestedLocal] = useState(false);
    const [hasTestedGlobal, setHasTestedGlobal] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.split('\n');
            let outputLines: string[] = [];
            const globalVars: Record<string, string | number> = {};
            const functions: Record<string, { params: string[]; body: string[] }> = {};
            let inFunction = false;
            let currentFuncName = '';
            let currentFuncParams: string[] = [];
            let currentFuncBody: string[] = [];
            let baseIndent = 0;

            // First pass: collect functions and global variables
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();

                if (!trimmed || trimmed.startsWith('#')) continue;

                // Function definition
                const funcMatch = trimmed.match(/^def\s+(\w+)\s*\((.*)\)\s*:/);
                if (funcMatch) {
                    if (inFunction) {
                        functions[currentFuncName] = { params: currentFuncParams, body: currentFuncBody };
                    }
                    inFunction = true;
                    currentFuncName = funcMatch[1];
                    currentFuncParams = funcMatch[2].split(',').map(p => p.trim()).filter(p => p);
                    currentFuncBody = [];
                    baseIndent = line.search(/\S/);
                    continue;
                }

                if (inFunction) {
                    const lineIndent = line.search(/\S/);
                    if (lineIndent > baseIndent && trimmed) {
                        currentFuncBody.push(trimmed);
                    } else if (trimmed && lineIndent <= baseIndent) {
                        functions[currentFuncName] = { params: currentFuncParams, body: currentFuncBody };
                        inFunction = false;
                    }
                }

                // Global variable (outside function)
                if (!inFunction) {
                    const varMatch = trimmed.match(/^(\w+)\s*=\s*["'](.*)["']$/);
                    if (varMatch) {
                        globalVars[varMatch[1]] = varMatch[2];
                        setHasTestedGlobal(true);
                        continue;
                    }
                    const numMatch = trimmed.match(/^(\w+)\s*=\s*(\d+)$/);
                    if (numMatch) {
                        globalVars[numMatch[1]] = parseInt(numMatch[2]);
                        setHasTestedGlobal(true);
                        continue;
                    }
                }
            }

            if (inFunction) {
                functions[currentFuncName] = { params: currentFuncParams, body: currentFuncBody };
            }

            // Execute function
            const executeFunction = (funcName: string, args: (string | number)[]) => {
                const func = functions[funcName];
                if (!func) return;

                const localVars: Record<string, string | number> = {};
                func.params.forEach((param, idx) => {
                    localVars[param] = args[idx];
                });

                for (const bodyLine of func.body) {
                    // Skip comments
                    if (bodyLine.startsWith('#')) continue;

                    // Variable assignment
                    const varMatch = bodyLine.match(/^(\w+)\s*=\s*["'](.*)["']$/);
                    if (varMatch) {
                        localVars[varMatch[1]] = varMatch[2];
                        setHasTestedLocal(true);
                        continue;
                    }

                    const numMatch = bodyLine.match(/^(\w+)\s*=\s*(\d+)$/);
                    if (numMatch) {
                        localVars[numMatch[1]] = parseInt(numMatch[2]);
                        setHasTestedLocal(true);
                        continue;
                    }

                    // Print statement
                    const printMatch = bodyLine.match(/^print\s*\((.+)\)$/);
                    if (printMatch) {
                        let content = printMatch[1].trim();

                        // f-string
                        const fMatch = content.match(/^f["'](.*)["']$/);
                        if (fMatch) {
                            let text = fMatch[1];
                            text = text.replace(/\{(\w+)\}/g, (m, varName) => {
                                if (localVars[varName] !== undefined) return String(localVars[varName]);
                                if (globalVars[varName] !== undefined) return String(globalVars[varName]);
                                return m;
                            });
                            outputLines.push(text);
                            continue;
                        }

                        // String literal
                        const strMatch = content.match(/^["'](.*)["']$/);
                        if (strMatch) {
                            outputLines.push(strMatch[1]);
                            continue;
                        }

                        // Variable reference - check local first, then global
                        if (localVars[content] !== undefined) {
                            outputLines.push(String(localVars[content]));
                        } else if (globalVars[content] !== undefined) {
                            outputLines.push(String(globalVars[content]));
                        } else {
                            outputLines.push(`Error: '${content}' is not defined`);
                        }
                    }
                }
            };

            // Second pass: execute main code
            inFunction = false;
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();

                if (!trimmed || trimmed.startsWith('#')) continue;

                const funcDefMatch = trimmed.match(/^def\s+(\w+)\s*\((.*)\)\s*:/);
                if (funcDefMatch) {
                    inFunction = true;
                    baseIndent = line.search(/\S/);
                    continue;
                }

                if (inFunction) {
                    const lineIndent = line.search(/\S/);
                    if (lineIndent <= baseIndent && trimmed) {
                        inFunction = false;
                    } else {
                        continue;
                    }
                }

                // Skip variable assignments (already handled)
                if (trimmed.match(/^(\w+)\s*=\s*["'](.*)["']$/) || trimmed.match(/^(\w+)\s*=\s*(\d+)$/)) {
                    continue;
                }

                // Function call
                const funcCallMatch = trimmed.match(/^(\w+)\s*\((.*)\)$/);
                if (funcCallMatch && functions[funcCallMatch[1]]) {
                    const args = funcCallMatch[2].split(',').map(a => {
                        const t = a.trim();
                        const sm = t.match(/^["'](.*)["']$/);
                        if (sm) return sm[1];
                        const n = Number(t);
                        if (!isNaN(n) && t !== '') return n;
                        if (globalVars[t] !== undefined) return globalVars[t];
                        return t;
                    }).filter(a => a !== '');
                    executeFunction(funcCallMatch[1], args);
                    continue;
                }

                // Print statement at global level
                const printMatch = trimmed.match(/^print\s*\((.+)\)$/);
                if (printMatch) {
                    let content = printMatch[1].trim();

                    // f-string
                    const fMatch = content.match(/^f["'](.*)["']$/);
                    if (fMatch) {
                        let text = fMatch[1];
                        text = text.replace(/\{(\w+)\}/g, (m, varName) => {
                            if (globalVars[varName] !== undefined) return String(globalVars[varName]);
                            return m;
                        });
                        outputLines.push(text);
                        continue;
                    }

                    // String
                    const strMatch = content.match(/^["'](.*)["']$/);
                    if (strMatch) {
                        outputLines.push(strMatch[1]);
                        continue;
                    }

                    // Variable - only global variables are accessible here
                    if (globalVars[content] !== undefined) {
                        outputLines.push(String(globalVars[content]));
                    } else {
                        // Check if it's a local variable being accessed outside
                        outputLines.push(`NameError: name '${content}' is not defined`);
                        outputLines.push(`(This variable might only exist inside a function!)`);
                    }
                }
            }

            if (outputLines.length > 0) {
                setOutput(outputLines.join('\n'));
            } else {
                setOutput('Run your code to see the output!');
            }
        } catch {
            setOutput('Error in code! Check your syntax.');
        }
    };

    const checkQuiz = () => {
        setQuizChecked(true);
        if (quizAnswer === 1) {
            setTimeout(() => {
                addXpAndCoins(LESSON.xpReward, 5);
                completeLevel(LESSON_ID, LESSON.xpReward, 5, 1, 60);
                setLessonComplete(true);
            }, 1000);
        }
    };

    const retryQuiz = () => {
        setQuizAnswer(null);
        setQuizChecked(false);
    };

    if (isLoading || !user) {
        return (
            <div className={styles.container}>
                <div className="flex items-center justify-center h-screen">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        style={{ fontSize: '3rem' }}
                    >
                        Loading...
                    </motion.div>
                </div>
            </div>
        );
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', duration: 0.8 }}
                    className={styles.successIcon}
                >
                    <Check size={50} className="text-white" />
                </motion.div>
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={styles.successTitle}
                >
                    Scope Master!
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={styles.successMessage}
                >
                    {LESSON.successMessage} You know where variables live and can be used!
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
                    <Link href="/level4/lesson9" className={`${styles.navBtn} ${styles.primary}`}>
                        Next Lesson <ChevronRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
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
                            >
                                {LESSON.emoji}
                            </motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>{LESSON.subtitle}</p>
                            </div>
                        </div>

                        {/* Mission Introduction */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{ background: 'linear-gradient(135deg, rgba(80, 250, 123, 0.15), rgba(139, 233, 253, 0.15))' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Home size={28} style={{ color: 'var(--success)' }} />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Mission: Learn Where Variables Live!</span>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '2rem',
                                padding: '1.5rem',
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: '0.75rem',
                                marginBottom: '1rem'
                            }}>
                                {/* Global House */}
                                <div style={{ textAlign: 'center' }}>
                                    <motion.div
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        style={{ fontSize: '3rem', marginBottom: '0.5rem' }}
                                    >
                                        🏠
                                    </motion.div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>GLOBAL</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Lives everywhere!</div>
                                </div>

                                {/* Local Room */}
                                <div style={{ textAlign: 'center' }}>
                                    <motion.div
                                        animate={{ y: [0, -3, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        style={{ fontSize: '3rem', marginBottom: '0.5rem' }}
                                    >
                                        🚪
                                    </motion.div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}>LOCAL</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Stays in its room!</div>
                                </div>
                            </div>

                            <p style={{ fontSize: '1.05rem' }}>
                                Variables have <strong>homes</strong>! Some live <strong>INSIDE</strong> functions (local),
                                some live <strong>OUTSIDE</strong> (global). Let's learn where they can be used!
                            </p>
                        </motion.div>

                        {/* Main Explanation */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Lightbulb size={20} style={{ color: 'var(--xp-coins)' }} /> The Bedroom Analogy
                            </h3>

                            <div style={{
                                background: 'rgba(0,0,0,0.2)',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                marginBottom: '1rem'
                            }}>
                                <p style={{ marginBottom: '0.75rem' }}>
                                    <strong>Think of it like this:</strong>
                                </p>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <span>🧸</span>
                                        <span><strong>LOCAL variables</strong> are like toys in YOUR room - they stay in YOUR room only!</span>
                                    </li>
                                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <span>📺</span>
                                        <span><strong>GLOBAL variables</strong> are like the TV in the living room - everyone in the house can use it!</span>
                                    </li>
                                </ul>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem',
                                marginTop: '1rem'
                            }}>
                                <div style={{
                                    background: 'rgba(80, 250, 123, 0.1)',
                                    border: '1px solid rgba(80, 250, 123, 0.3)',
                                    padding: '1rem',
                                    borderRadius: '0.5rem'
                                }}>
                                    <h4 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Global Variables</h4>
                                    <code style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        name = "Sparky"  # Outside function
                                    </code>
                                    <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                                        Can be used anywhere!
                                    </p>
                                </div>

                                <div style={{
                                    background: 'rgba(255, 121, 198, 0.1)',
                                    border: '1px solid rgba(255, 121, 198, 0.3)',
                                    padding: '1rem',
                                    borderRadius: '0.5rem'
                                }}>
                                    <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Local Variables</h4>
                                    <code style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        def greet():<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;msg = "Hi"  # Inside function
                                    </code>
                                    <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                                        Only inside that function!
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Warning Box */}
                        <div style={{
                            background: 'rgba(255, 85, 85, 0.1)',
                            border: '1px solid rgba(255, 85, 85, 0.3)',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                            marginBottom: '2rem',
                            display: 'flex',
                            gap: '0.75rem'
                        }}>
                            <AlertTriangle size={20} style={{ color: 'var(--error)', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--error)' }}>Watch Out!</p>
                                <p style={{ fontSize: '0.9rem' }}>
                                    If you try to use a <strong>local variable</strong> outside its function,
                                    you'll get an error! The variable doesn't exist there!
                                </p>
                            </div>
                        </div>

                        {/* Example Code */}
                        <div className={styles.codeSection}>
                            <h3>Example: Where Variables Live</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}>
                                    <span>scope_example.py</span>
                                    <span>Python</span>
                                </div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># GLOBAL variable - lives outside</span>{'\n'}
                                    <span className={styles.variable}>robot_name</span> = <span className={styles.string}>"Sparky"</span>{'\n\n'}
                                    <span className={styles.keyword}>def</span> <span className={styles.variable}>say_hello</span>():{'\n'}
                                    {'    '}<span className={styles.comment}># LOCAL variable - only lives HERE</span>{'\n'}
                                    {'    '}<span className={styles.variable}>greeting</span> = <span className={styles.string}>"Hello!"</span>{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.variable}>greeting</span>){'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.variable}>robot_name</span>)  <span className={styles.comment}># Works! Global is accessible</span>{'\n\n'}
                                    <span className={styles.variable}>say_hello</span>(){'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.variable}>robot_name</span>)  <span className={styles.comment}># Works!</span>{'\n'}
                                    <span className={styles.comment}># print(greeting)  # ERROR! greeting only exists in say_hello()</span>
                                </div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3>Your Turn - Explore Variable Scope!</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                Try the code below! Then uncomment the last line to see what error happens
                                when you try to use a local variable outside its function.
                            </p>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}>
                                    <span>your_code.py</span>
                                    <span>Python</span>
                                </div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    spellCheck={false}
                                    style={{ minHeight: '280px' }}
                                />
                            </div>
                            <button className={styles.runBtn} onClick={runCode}>
                                <Play size={18} /> Run Code
                            </button>

                            {output && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={styles.outputBox}
                                >
                                    <div className={styles.outputLabel}>Output:</div>
                                    <div className={styles.outputText}>{output}</div>
                                </motion.div>
                            )}
                        </div>

                        {/* Challenge Tracker */}
                        <div className={styles.challenges}>
                            <h3>Scope Exploration:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasTestedGlobal ? styles.done : ''}`}>
                                        {hasTestedGlobal && <Check size={14} />}
                                    </div>
                                    Create a global variable (outside any function)
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasTestedLocal ? styles.done : ''}`}>
                                        {hasTestedLocal && <Check size={14} />}
                                    </div>
                                    Create a local variable (inside a function)
                                </li>
                                <li style={{ color: 'var(--text-secondary)', paddingLeft: '2.5rem' }}>
                                    Try uncommenting the last line to see the error!
                                </li>
                            </ul>
                        </div>

                        {/* Tip Box */}
                        <div className={styles.tipBox}>
                            <Lightbulb size={20} style={{ color: 'var(--xp-coins)', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Remember:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li><strong>Global</strong> = Outside functions = Usable EVERYWHERE</li>
                                    <li><strong>Local</strong> = Inside a function = ONLY usable in that function</li>
                                    <li>Functions CAN read global variables</li>
                                    <li>Outside code CANNOT read local variables!</li>
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
                    >
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ fontSize: '3rem', marginBottom: '1rem' }}
                        >
                            🧠
                        </motion.div>
                        <h2 className={styles.quizTitle}>Scope Check!</h2>

                        <p className={styles.quizQuestion}>
                            Where can you use a variable that was created <strong>inside</strong> a function?
                        </p>
                        <div className={styles.quizOptions}>
                            {[
                                'Everywhere in your code',
                                'Only inside that function',
                                'Only outside the function'
                            ].map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => !quizChecked && setQuizAnswer(idx)}
                                    className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''
                                        } ${quizChecked && idx === 1 ? styles.correct : ''
                                        } ${quizChecked && quizAnswer === idx && idx !== 1 ? styles.wrong : ''
                                        }`}
                                    disabled={quizChecked}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>

                        {!quizChecked ? (
                            <button
                                className={styles.quizBtn}
                                onClick={checkQuiz}
                                disabled={quizAnswer === null}
                            >
                                Check Answer
                            </button>
                        ) : quizAnswer !== 1 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.quizFeedback} ${styles.error}`}
                            >
                                <h4>Not quite!</h4>
                                <p>
                                    Variables created inside a function are <strong>LOCAL</strong> -
                                    they only exist inside that function! Think of them like toys in your room -
                                    they stay in YOUR room!
                                </p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem' }}>
                                    Try Again
                                </button>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
