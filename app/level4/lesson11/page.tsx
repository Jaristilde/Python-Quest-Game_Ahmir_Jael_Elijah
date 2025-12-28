'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, RefreshCw, Repeat } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL4_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL4_LESSONS[10]; // Lesson 11 (0-indexed)
const LESSON_ID = 60;

export default function Lesson11() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('# Create a function with a loop inside!\n');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizChecked, setQuizChecked] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasCreatedFunction, setHasCreatedFunction] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            const variables: Record<string, any> = {};
            const functions: Record<string, { params: string[]; body: string[] }> = {};
            let currentFunction: string | null = null;
            let functionBody: string[] = [];
            let functionParams: string[] = [];

            // First pass: collect function definitions
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();

                if (!trimmed || trimmed.startsWith('#')) continue;

                // Function definition
                const funcMatch = trimmed.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*:/);
                if (funcMatch) {
                    currentFunction = funcMatch[1];
                    functionParams = funcMatch[2].split(',').map(p => p.trim()).filter(p => p);
                    functionBody = [];
                    setHasCreatedFunction(true);
                    continue;
                }

                // Inside function (indented)
                if (currentFunction && (line.startsWith('    ') || line.startsWith('\t'))) {
                    functionBody.push(line);
                    continue;
                }

                // End of function
                if (currentFunction && !line.startsWith('    ') && !line.startsWith('\t') && trimmed) {
                    functions[currentFunction] = { params: functionParams, body: functionBody };
                    currentFunction = null;
                }
            }

            // Save last function if any
            if (currentFunction) {
                functions[currentFunction] = { params: functionParams, body: functionBody };
                currentFunction = null;
            }

            // Execute function
            const executeFunction = (funcName: string, args: any[]): any => {
                const func = functions[funcName];
                if (!func) return undefined;

                const localVars: Record<string, any> = { ...variables };
                func.params.forEach((param, idx) => {
                    localVars[param] = args[idx];
                });

                let i = 0;
                while (i < func.body.length) {
                    const line = func.body[i];
                    const trimmed = line.trim();

                    // For loop with range
                    const forRangeMatch = trimmed.match(/^for\s+(\w+)\s+in\s+range\s*\(\s*(.+?)\s*\)\s*:/);
                    if (forRangeMatch) {
                        const loopVar = forRangeMatch[1];
                        let rangeArg = forRangeMatch[2];

                        // Check if it's a variable
                        if (localVars[rangeArg] !== undefined) {
                            rangeArg = String(localVars[rangeArg]);
                        }

                        const rangeEnd = parseInt(rangeArg);

                        // Collect loop body
                        const loopBody: string[] = [];
                        i++;
                        while (i < func.body.length) {
                            const nextLine = func.body[i];
                            // Check for deeper indentation (loop body)
                            if (nextLine.startsWith('        ') || (nextLine.startsWith('\t\t'))) {
                                loopBody.push(nextLine.trim());
                                i++;
                            } else {
                                break;
                            }
                        }

                        // Execute loop
                        for (let j = 0; j < rangeEnd; j++) {
                            localVars[loopVar] = j;
                            for (const bodyLine of loopBody) {
                                // Print statement
                                const printMatch = bodyLine.match(/^print\s*\(\s*(.+)\s*\)$/);
                                if (printMatch) {
                                    const arg = printMatch[1].trim();
                                    // String literal
                                    const strMatch = arg.match(/^["'](.*)["']$/);
                                    if (strMatch) {
                                        outputLines.push(strMatch[1]);
                                    } else if (localVars[arg] !== undefined) {
                                        outputLines.push(String(localVars[arg]));
                                    }
                                }
                            }
                        }
                        continue;
                    }

                    // For loop over list
                    const forListMatch = trimmed.match(/^for\s+(\w+)\s+in\s+(\w+)\s*:/);
                    if (forListMatch) {
                        const loopVar = forListMatch[1];
                        const listVar = forListMatch[2];

                        // Collect loop body
                        const loopBody: string[] = [];
                        i++;
                        while (i < func.body.length) {
                            const nextLine = func.body[i];
                            if (nextLine.startsWith('        ') || (nextLine.startsWith('\t\t'))) {
                                loopBody.push(nextLine.trim());
                                i++;
                            } else {
                                break;
                            }
                        }

                        // Execute loop
                        const list = localVars[listVar];
                        if (Array.isArray(list)) {
                            for (const item of list) {
                                localVars[loopVar] = item;
                                for (const bodyLine of loopBody) {
                                    const printMatch = bodyLine.match(/^print\s*\(\s*(.+)\s*\)$/);
                                    if (printMatch) {
                                        const arg = printMatch[1].trim();
                                        const strMatch = arg.match(/^["'](.*)["']$/);
                                        if (strMatch) {
                                            outputLines.push(strMatch[1]);
                                        } else if (localVars[arg] !== undefined) {
                                            outputLines.push(String(localVars[arg]));
                                        }
                                    }
                                }
                            }
                        }
                        continue;
                    }

                    // Print statement
                    const printMatch = trimmed.match(/^print\s*\(\s*(.+)\s*\)$/);
                    if (printMatch) {
                        const arg = printMatch[1].trim();
                        const strMatch = arg.match(/^["'](.*)["']$/);
                        if (strMatch) {
                            outputLines.push(strMatch[1]);
                        } else if (localVars[arg] !== undefined) {
                            outputLines.push(String(localVars[arg]));
                        }
                    }

                    i++;
                }

                return undefined;
            };

            // Second pass: execute code
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();

                if (!trimmed || trimmed.startsWith('#')) continue;
                if (trimmed.startsWith('def ')) continue;
                if (line.startsWith('    ') || line.startsWith('\t')) continue;

                // Variable assignment
                const assignMatch = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
                if (assignMatch) {
                    const varName = assignMatch[1];
                    const value = assignMatch[2].trim();

                    // List
                    const listMatch = value.match(/^\[(.*)\]$/);
                    if (listMatch) {
                        const content = listMatch[1].trim();
                        if (content === '') {
                            variables[varName] = [];
                        } else {
                            const items: any[] = [];
                            const itemMatches = content.match(/(?:"[^"]*"|'[^']*'|-?\d+(?:\.\d+)?)/g);
                            if (itemMatches) {
                                for (const item of itemMatches) {
                                    if (item.startsWith('"') || item.startsWith("'")) {
                                        items.push(item.slice(1, -1));
                                    } else {
                                        items.push(parseFloat(item));
                                    }
                                }
                            }
                            variables[varName] = items;
                        }
                        continue;
                    }

                    // Number
                    if (!isNaN(Number(value))) {
                        variables[varName] = Number(value);
                        continue;
                    }

                    // String
                    const strMatch = value.match(/^["'](.*)["']$/);
                    if (strMatch) {
                        variables[varName] = strMatch[1];
                        continue;
                    }
                }

                // Function call
                const funcCallMatch = trimmed.match(/^(\w+)\s*\(\s*([^)]*)\s*\)$/);
                if (funcCallMatch) {
                    const funcName = funcCallMatch[1];
                    const argsStr = funcCallMatch[2];

                    if (funcName === 'print') {
                        const arg = argsStr.trim();
                        const strMatch = arg.match(/^["'](.*)["']$/);
                        if (strMatch) {
                            outputLines.push(strMatch[1]);
                        } else if (variables[arg] !== undefined) {
                            outputLines.push(String(variables[arg]));
                        }
                    } else if (functions[funcName]) {
                        const args = argsStr.split(',').map(a => {
                            const arg = a.trim();
                            if (variables[arg] !== undefined) return variables[arg];
                            if (arg.startsWith('"') || arg.startsWith("'")) return arg.slice(1, -1);
                            if (!isNaN(Number(arg))) return Number(arg);
                            return arg;
                        }).filter(a => a !== '');

                        executeFunction(funcName, args);
                    }
                }
            }

            if (outputLines.length > 0) {
                setOutput(outputLines.join('\n'));
            } else {
                setOutput('Run your code to see what happens!');
            }
        } catch (error) {
            setOutput('Error in code! Check your syntax.');
        }
    };

    const checkQuiz = () => {
        setQuizChecked(true);
        // Correct answer is B (index 1) - Yes
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
            <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
                <div className="flex items-center justify-center h-screen">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        style={{ fontSize: '3rem' }}
                    >
                        {LESSON.emoji}
                    </motion.div>
                </div>
            </div>
        );
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'var(--bg-primary)' }}>
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
                >
                    Loop Master!
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={styles.successMessage}
                >
                    {LESSON.successMessage} Your functions can now repeat actions automatically!
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
                    <Link href="/level4/lesson12" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'var(--accent-primary)' }}>
                        Next Lesson <ChevronRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
            <header className={styles.header} style={{ background: 'var(--bg-secondary)' }}>
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
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
                            >
                                {LESSON.emoji}
                            </motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: <code style={{ color: 'var(--accent-primary)' }}>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Story Introduction */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(168, 85, 247, 0.15))', borderColor: 'var(--accent-primary)' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Repeat size={28} style={{ color: 'var(--accent-primary)' }} />
                                <RefreshCw size={24} style={{ color: 'var(--accent-secondary)' }} />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Mission: Functions Can REPEAT Things!</span>
                            </div>

                            <p style={{ fontSize: '1.1rem' }}>
                                What if your robot chef needs to say "Hi!" to MANY customers?
                                Put a loop INSIDE your function and it can repeat actions as many times as you want!
                            </p>
                        </motion.div>

                        {/* Main Explanation */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Lightbulb size={20} style={{ color: 'var(--accent-primary)' }} /> Loops Inside Functions
                            </h3>
                            <p>
                                You can put a <code>for</code> loop INSIDE a function! This lets your function repeat
                                actions based on the parameters you give it.
                            </p>

                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem' }}>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Why is this powerful?</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                                    <li>Repeat a message any number of times</li>
                                    <li>Process every item in a list</li>
                                    <li>Create countdown timers</li>
                                    <li>Build patterns and sequences</li>
                                </ul>
                            </div>
                        </div>

                        {/* Example Code */}
                        <div className={styles.codeSection}>
                            <h3>Example: Robot Greeter</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}>
                                    <span>greeter.py</span>
                                    <span>Python</span>
                                </div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># Function that says hi multiple times</span>{'\n'}
                                    <span className={styles.keyword}>def</span> <span style={{ color: '#8be9fd' }}>say_hi_times</span>(count):{'\n'}
                                    {'    '}<span className={styles.keyword}>for</span> i <span className={styles.keyword}>in</span> range(count):{'\n'}
                                    {'        '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"Hi!"</span>){'\n\n'}
                                    <span className={styles.comment}># Function that prints all items in a list</span>{'\n'}
                                    <span className={styles.keyword}>def</span> <span style={{ color: '#8be9fd' }}>print_list</span>(items):{'\n'}
                                    {'    '}<span className={styles.keyword}>for</span> item <span className={styles.keyword}>in</span> items:{'\n'}
                                    {'        '}<span className={styles.keyword}>print</span>(item){'\n\n'}
                                    <span className={styles.comment}># Try them out!</span>{'\n'}
                                    say_hi_times(<span className={styles.number}>3</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>Hi!{'\n'}Hi!{'\n'}Hi!</div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3>Your Turn - Create a Countdown Function!</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                Create a function called <code>countdown</code> that takes a number and counts down to 1.
                                For example, <code>countdown(5)</code> should print: 5, 4, 3, 2, 1
                            </p>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}>
                                    <span>your_code.py</span>
                                    <span>Python</span>
                                </div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder={`def countdown(num):
    for i in range(num):
        print(num)

countdown(5)`}
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
                                    <div className={styles.outputLabel}>Output:</div>
                                    <div className={styles.outputText}>{output}</div>
                                </motion.div>
                            )}
                        </div>

                        {/* Challenge Tracker */}
                        <div className={styles.challenges} style={{ background: 'var(--bg-secondary)' }}>
                            <h3>Try These Challenges:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasCreatedFunction ? styles.done : ''}`}>
                                        {hasCreatedFunction && <Check size={14} />}
                                    </div>
                                    Create a function with a loop inside
                                </li>
                                <li style={{ color: 'var(--text-muted)', paddingLeft: '2.5rem' }}>
                                    Try making a function that prints "Yay!" 5 times
                                </li>
                                <li style={{ color: 'var(--text-muted)', paddingLeft: '2.5rem' }}>
                                    Try making a countdown function
                                </li>
                            </ul>
                        </div>

                        {/* Tip Box */}
                        <div className={styles.tipBox} style={{ background: 'rgba(251, 191, 36, 0.1)', borderColor: 'rgba(251, 191, 36, 0.3)' }}>
                            <Lightbulb size={20} style={{ color: '#fbbf24', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Remember:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li><code>for i in range(n):</code> repeats n times</li>
                                    <li><code>for item in list:</code> goes through each item</li>
                                    <li>Indent the loop body with spaces</li>
                                    <li>The loop can print, calculate, or do anything!</li>
                                </ul>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className={styles.navBar}>
                            <Link href="/level4/lesson10" className={`${styles.navBtn} ${styles.secondary}`}>
                                <ChevronLeft size={18} /> Previous
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
                        style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))' }}
                    >
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ fontSize: '3rem', marginBottom: '1rem' }}
                        >
                            🧠
                        </motion.div>
                        <h2 className={styles.quizTitle}>Brain Check!</h2>

                        <p className={styles.quizQuestion}>
                            Can functions contain loops?
                        </p>
                        <div className={styles.quizOptions}>
                            {[
                                'A) No, loops and functions are separate',
                                'B) Yes, functions can have for loops inside!'
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
                                style={{ background: 'var(--accent-primary)' }}
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
                                    Functions can contain ANY Python code - including loops!
                                    This makes them super powerful for repeating actions.
                                </p>
                                <button
                                    className={styles.quizBtn}
                                    onClick={retryQuiz}
                                    style={{ marginTop: '1rem' }}
                                >
                                    Try Again
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.quizFeedback} ${styles.success}`}
                            >
                                <h4>Correct!</h4>
                                <p>Yes! Functions can have loops inside them, making them incredibly powerful for repetitive tasks!</p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
