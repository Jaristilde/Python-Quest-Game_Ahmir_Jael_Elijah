'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Bot, Puzzle, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL4_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL4_LESSONS[4]; // Lesson 5
const LESSON_ID = 54; // Level 4 lessons: 50-62

export default function Lesson5() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('# Create a complete game score calculator!\ndef calculate_score(points, level):\n    bonus = level * 10\n    total = points + bonus\n    return total\n\n# Test your function\nmy_score = calculate_score(50, 3)\nprint(f"Your total score is: {my_score}")\n');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false, false]);
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
            let functions: Record<string, { params: string[]; body: string[] }> = {};
            let variables: Record<string, string | number> = {};
            let inFunction = false;
            let currentFunctionName = '';
            let currentFunctionParams: string[] = [];
            let currentFunctionBody: string[] = [];

            // First pass: collect function definitions
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) {
                    if (!inFunction) continue;
                }

                // Function definition
                const funcMatch = trimmed.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*:/);
                if (funcMatch) {
                    inFunction = true;
                    currentFunctionName = funcMatch[1];
                    const paramsStr = funcMatch[2].trim();
                    currentFunctionParams = paramsStr ? paramsStr.split(',').map(p => p.trim()) : [];
                    currentFunctionBody = [];
                    setHasCreatedFunction(true);
                    continue;
                }

                // Check if inside function (indented line)
                if (inFunction && (line.startsWith('    ') || line.startsWith('\t'))) {
                    currentFunctionBody.push(trimmed);
                    continue;
                }

                // End of function
                if (inFunction && !line.startsWith('    ') && !line.startsWith('\t') && trimmed) {
                    functions[currentFunctionName] = {
                        params: currentFunctionParams,
                        body: currentFunctionBody
                    };
                    inFunction = false;
                }
            }

            // Save last function if exists
            if (inFunction && currentFunctionName) {
                functions[currentFunctionName] = {
                    params: currentFunctionParams,
                    body: currentFunctionBody
                };
            }

            // Helper to evaluate expressions
            const evalExpr = (expr: string, localVars: Record<string, string | number>): number | string => {
                const trimExpr = expr.trim();

                // Check for arithmetic
                const arithMatch = trimExpr.match(/^(\w+)\s*([+\-*/])\s*(\w+)$/);
                if (arithMatch) {
                    const leftVal = localVars[arithMatch[1]] !== undefined ? Number(localVars[arithMatch[1]]) : Number(arithMatch[1]);
                    const rightVal = localVars[arithMatch[3]] !== undefined ? Number(localVars[arithMatch[3]]) : Number(arithMatch[3]);
                    switch (arithMatch[2]) {
                        case '+': return leftVal + rightVal;
                        case '-': return leftVal - rightVal;
                        case '*': return leftVal * rightVal;
                        case '/': return leftVal / rightVal;
                    }
                }

                // Variable or number
                if (localVars[trimExpr] !== undefined) {
                    return localVars[trimExpr];
                }
                if (!isNaN(Number(trimExpr))) {
                    return Number(trimExpr);
                }
                return trimExpr;
            };

            // Execute function
            const executeFunction = (funcName: string, args: (string | number)[]): number | string | undefined => {
                if (!functions[funcName]) return undefined;

                const func = functions[funcName];
                const localVars: Record<string, string | number> = {};

                // Map args to params
                func.params.forEach((param, idx) => {
                    if (args[idx] !== undefined) {
                        localVars[param] = args[idx];
                    }
                });

                let returnValue: number | string | undefined = undefined;

                // Execute body
                for (const bodyLine of func.body) {
                    // Variable assignment
                    const assignMatch = bodyLine.match(/^(\w+)\s*=\s*(.+)$/);
                    if (assignMatch) {
                        const varName = assignMatch[1];
                        const value = evalExpr(assignMatch[2], localVars);
                        localVars[varName] = value;
                        continue;
                    }

                    // Print
                    const printMatch = bodyLine.match(/^print\s*\((.+)\)$/);
                    if (printMatch) {
                        const printArg = printMatch[1];
                        const fMatch = printArg.match(/^f["'](.*)["']$/);
                        if (fMatch) {
                            let text = fMatch[1];
                            text = text.replace(/\{(\w+)\}/g, (match, varName) => {
                                if (localVars[varName] !== undefined) return String(localVars[varName]);
                                return match;
                            });
                            outputLines.push(text);
                        } else {
                            const strMatch = printArg.match(/^["'](.*)["']$/);
                            if (strMatch) {
                                outputLines.push(strMatch[1]);
                            } else if (localVars[printArg] !== undefined) {
                                outputLines.push(String(localVars[printArg]));
                            }
                        }
                        continue;
                    }

                    // Return
                    const returnMatch = bodyLine.match(/^return\s+(.+)$/);
                    if (returnMatch) {
                        returnValue = evalExpr(returnMatch[1], localVars);
                    }
                }

                return returnValue;
            };

            // Second pass: execute main code
            inFunction = false;
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) continue;
                if (trimmed.startsWith('def ')) {
                    inFunction = true;
                    continue;
                }
                if (inFunction && (line.startsWith('    ') || line.startsWith('\t'))) continue;
                if (inFunction && !line.startsWith('    ') && !line.startsWith('\t') && trimmed) {
                    inFunction = false;
                }
                if (inFunction) continue;

                // Variable assignment with function call
                const assignFuncMatch = trimmed.match(/^(\w+)\s*=\s*(\w+)\s*\(([^)]*)\)$/);
                if (assignFuncMatch) {
                    const varName = assignFuncMatch[1];
                    const funcName = assignFuncMatch[2];
                    const argsStr = assignFuncMatch[3].trim();

                    const args: (string | number)[] = [];
                    if (argsStr) {
                        argsStr.split(',').forEach(a => {
                            const arg = a.trim();
                            const strMatch = arg.match(/^["'](.*)["']$/);
                            if (strMatch) {
                                args.push(strMatch[1]);
                            } else if (!isNaN(Number(arg))) {
                                args.push(Number(arg));
                            } else if (variables[arg] !== undefined) {
                                args.push(variables[arg]);
                            }
                        });
                    }

                    const result = executeFunction(funcName, args);
                    if (result !== undefined) {
                        variables[varName] = result;
                    }
                    continue;
                }

                // Print statement
                const printMatch = trimmed.match(/^print\s*\((.+)\)$/);
                if (printMatch) {
                    const printArg = printMatch[1];
                    const fMatch = printArg.match(/^f["'](.*)["']$/);
                    if (fMatch) {
                        let text = fMatch[1];
                        text = text.replace(/\{(\w+)\}/g, (match, varName) => {
                            if (variables[varName] !== undefined) return String(variables[varName]);
                            return match;
                        });
                        outputLines.push(text);
                    } else {
                        const strMatch = printArg.match(/^["'](.*)["']$/);
                        if (strMatch) {
                            outputLines.push(strMatch[1]);
                        } else if (variables[printArg] !== undefined) {
                            outputLines.push(String(variables[printArg]));
                        }
                    }
                    continue;
                }

                // Direct function call
                const callMatch = trimmed.match(/^(\w+)\s*\(([^)]*)\)$/);
                if (callMatch && functions[callMatch[1]]) {
                    const funcName = callMatch[1];
                    const argsStr = callMatch[2].trim();

                    const args: (string | number)[] = [];
                    if (argsStr) {
                        argsStr.split(',').forEach(a => {
                            const arg = a.trim();
                            const strMatch = arg.match(/^["'](.*)["']$/);
                            if (strMatch) {
                                args.push(strMatch[1]);
                            } else if (!isNaN(Number(arg))) {
                                args.push(Number(arg));
                            }
                        });
                    }

                    executeFunction(funcName, args);
                }
            }

            if (outputLines.length > 0) {
                setOutput(outputLines.join('\n'));
            } else {
                setOutput('Run your code to see what happens! Make sure to call your function.');
            }
        } catch {
            setOutput('Error in code! Check your syntax.');
        }
    };

    const checkQuiz = () => {
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = true;
        setQuizChecked(newChecked);

        // Correct answers: Q1 = 0 (def), Q2 = 2 (return), Q3 = 1 (function_name())
        const correctAnswers = [0, 2, 1];

        if (quizAnswers[currentQuiz] === correctAnswers[currentQuiz]) {
            if (currentQuiz < 2) {
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
        const newAnswers = [...quizAnswers];
        newAnswers[currentQuiz] = null;
        setQuizAnswers(newAnswers);

        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = false;
        setQuizChecked(newChecked);
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
                        🤖
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
                    Function Master!
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={styles.successMessage}
                >
                    {LESSON.successMessage} You've mastered the basics of Python functions!
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
                    <Link href="/level4/lesson6" className={`${styles.navBtn} ${styles.primary}`}>
                        Practice Time! <ChevronRight size={18} />
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
                                <p>Learn: <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Story Introduction */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{ background: 'linear-gradient(135deg, rgba(189, 147, 249, 0.15), rgba(255, 121, 198, 0.15))' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Bot size={28} style={{ color: 'var(--badge-project)' }} />
                                <Trophy size={24} style={{ color: 'var(--xp-coins)' }} />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Mission: Master the Complete Picture!</span>
                            </div>

                            {/* Animation - Puzzle pieces coming together */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '1.5rem',
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: '0.75rem',
                                marginBottom: '1rem',
                                gap: '0.5rem'
                            }}>
                                <motion.div
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{ fontSize: '2rem' }}
                                >
                                    🧩
                                </motion.div>
                                <motion.div
                                    animate={{ x: [-10, 0, -10] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    style={{ fontSize: '1.5rem', color: 'var(--accent-primary)' }}
                                >
                                    +
                                </motion.div>
                                <motion.div
                                    animate={{ rotate: [0, -5, 5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                                    style={{ fontSize: '2rem' }}
                                >
                                    🧩
                                </motion.div>
                                <motion.div
                                    animate={{ x: [-10, 0, -10] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    style={{ fontSize: '1.5rem', color: 'var(--accent-secondary)' }}
                                >
                                    +
                                </motion.div>
                                <motion.div
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                                    style={{ fontSize: '2rem' }}
                                >
                                    🧩
                                </motion.div>
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    style={{ fontSize: '1.5rem', marginLeft: '0.5rem' }}
                                >
                                    =
                                </motion.div>
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    style={{ fontSize: '2.5rem' }}
                                >
                                    🎮
                                </motion.div>
                            </div>

                            <p>
                                Let's put EVERYTHING together! You now know how to create functions, add parameters, and return values. Time to see how all the pieces fit!
                            </p>
                        </motion.div>

                        {/* Review Section */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Puzzle size={20} style={{ color: 'var(--success)' }} /> Function Building Blocks Review
                            </h3>

                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {/* Block 1: def */}
                                <div style={{
                                    background: 'rgba(255, 121, 198, 0.1)',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    borderLeft: '3px solid var(--accent-primary)'
                                }}>
                                    <p style={{ fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>1. def - Create a Function</p>
                                    <code style={{ fontSize: '0.9rem' }}>def say_hello():</code>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>The "def" keyword starts every function</p>
                                </div>

                                {/* Block 2: Parameters */}
                                <div style={{
                                    background: 'rgba(139, 233, 253, 0.1)',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    borderLeft: '3px solid var(--accent-secondary)'
                                }}>
                                    <p style={{ fontWeight: 700, color: 'var(--accent-secondary)', marginBottom: '0.5rem' }}>2. Parameters - Accept Information</p>
                                    <code style={{ fontSize: '0.9rem' }}>def greet(name, age):</code>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Parameters go in parentheses, separated by commas</p>
                                </div>

                                {/* Block 3: Return */}
                                <div style={{
                                    background: 'rgba(80, 250, 123, 0.1)',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    borderLeft: '3px solid var(--success)'
                                }}>
                                    <p style={{ fontWeight: 700, color: 'var(--success)', marginBottom: '0.5rem' }}>3. return - Send Back a Value</p>
                                    <code style={{ fontSize: '0.9rem' }}>return result</code>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Return sends a value back to where the function was called</p>
                                </div>

                                {/* Block 4: Calling */}
                                <div style={{
                                    background: 'rgba(255, 184, 108, 0.1)',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    borderLeft: '3px solid var(--xp-coins)'
                                }}>
                                    <p style={{ fontWeight: 700, color: 'var(--xp-coins)', marginBottom: '0.5rem' }}>4. Calling - Use Your Function</p>
                                    <code style={{ fontSize: '0.9rem' }}>answer = calculate(5, 10)</code>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Call functions by name with arguments in parentheses</p>
                                </div>
                            </div>
                        </div>

                        {/* Complete Example */}
                        <div className={styles.codeSection}>
                            <h3>Complete Example: Game Score Calculator</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}>
                                    <span>game_score.py</span>
                                    <span>Python</span>
                                </div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># A complete function with everything!</span>{'\n'}
                                    <span className={styles.keyword}>def</span> <span className={styles.variable}>calculate_score</span>(points, level):{'\n'}
                                    {'    '}<span className={styles.comment}># Calculate bonus based on level</span>{'\n'}
                                    {'    '}bonus = level * <span className={styles.number}>10</span>{'\n'}
                                    {'    '}<span className={styles.comment}># Add bonus to points</span>{'\n'}
                                    {'    '}total = points + bonus{'\n'}
                                    {'    '}<span className={styles.comment}># Return the result</span>{'\n'}
                                    {'    '}<span className={styles.keyword}>return</span> total{'\n\n'}
                                    <span className={styles.comment}># Use the function!</span>{'\n'}
                                    my_score = calculate_score(<span className={styles.number}>50</span>, <span className={styles.number}>3</span>){'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>f"Your total score is: </span>{'{my_score}'}<span className={styles.string}>"</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>
                                    Your total score is: 80
                                </div>
                            </div>
                            <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                50 points + (3 levels x 10 bonus) = 80 total!
                            </p>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3>Your Turn - Build a Complete Function!</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                Try modifying the score calculator or create your own complete function. Use def, parameters, and return!
                            </p>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}>
                                    <span>your_code.py</span>
                                    <span>Python</span>
                                </div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder='# Create your complete function here!'
                                    spellCheck={false}
                                    style={{ minHeight: '200px' }}
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
                        <div className={styles.challenges}>
                            <h3>Challenges:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasCreatedFunction ? styles.done : ''}`}>
                                        {hasCreatedFunction && <Check size={14} />}
                                    </div>
                                    Create a complete function with parameters and return
                                </li>
                                <li style={{ color: 'var(--text-secondary)', paddingLeft: '2.5rem' }}>
                                    Try changing the bonus calculation!
                                </li>
                            </ul>
                        </div>

                        {/* Summary Box */}
                        <div className={styles.tipBox} style={{ background: 'rgba(189, 147, 249, 0.1)', borderColor: 'rgba(189, 147, 249, 0.3)' }}>
                            <Lightbulb size={20} style={{ color: 'var(--badge-project)', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Function Recipe:</p>
                                <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li><code>def</code> keyword + function name</li>
                                    <li>Parameters in parentheses <code>(a, b)</code></li>
                                    <li>Colon <code>:</code> at the end</li>
                                    <li>Indented code block</li>
                                    <li><code>return</code> to send back a value</li>
                                </ol>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className={styles.navBar}>
                            <Link href="/level4/lesson4" className={`${styles.navBtn} ${styles.secondary}`}>
                                <ChevronLeft size={18} /> Previous
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
                        <h2 className={styles.quizTitle}>Final Review! (Question {currentQuiz + 1}/3)</h2>

                        {currentQuiz === 0 ? (
                            <>
                                <p className={styles.quizQuestion}>
                                    What keyword starts a function definition in Python?
                                </p>
                                <div className={styles.quizOptions}>
                                    {[
                                        'A) def',
                                        'B) function',
                                        'C) create'
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
                                                } ${quizChecked[0] && idx === 0 ? styles.correct : ''
                                                } ${quizChecked[0] && quizAnswers[0] === idx && idx !== 0 ? styles.wrong : ''
                                                }`}
                                            disabled={quizChecked[0]}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : currentQuiz === 1 ? (
                            <>
                                <p className={styles.quizQuestion}>
                                    What keyword sends a value back from a function?
                                </p>
                                <div className={styles.quizOptions}>
                                    {[
                                        'A) send',
                                        'B) give',
                                        'C) return'
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
                                                } ${quizChecked[1] && idx === 2 ? styles.correct : ''
                                                } ${quizChecked[1] && quizAnswers[1] === idx && idx !== 2 ? styles.wrong : ''
                                                }`}
                                            disabled={quizChecked[1]}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>
                                    How do you call (use) a function named <code>calculate</code>?
                                </p>
                                <div className={styles.quizOptions}>
                                    {[
                                        'A) run calculate',
                                        'B) calculate()',
                                        'C) def calculate'
                                    ].map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                if (!quizChecked[2]) {
                                                    const newAnswers = [...quizAnswers];
                                                    newAnswers[2] = idx;
                                                    setQuizAnswers(newAnswers);
                                                }
                                            }}
                                            className={`${styles.quizOption} ${quizAnswers[2] === idx ? styles.selected : ''
                                                } ${quizChecked[2] && idx === 1 ? styles.correct : ''
                                                } ${quizChecked[2] && quizAnswers[2] === idx && idx !== 1 ? styles.wrong : ''
                                                }`}
                                            disabled={quizChecked[2]}
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
                            >
                                Check Answer
                            </button>
                        ) : quizAnswers[currentQuiz] !== (currentQuiz === 0 ? 0 : currentQuiz === 1 ? 2 : 1) ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.quizFeedback} ${styles.error}`}
                            >
                                <h4>Not quite!</h4>
                                <p>
                                    {currentQuiz === 0
                                        ? 'In Python, we use "def" to define (create) a function. It stands for "define"!'
                                        : currentQuiz === 1
                                        ? 'The "return" keyword sends a value back from a function to where it was called.'
                                        : 'To call a function, use its name followed by parentheses: function_name()'
                                    }
                                </p>
                                <button
                                    className={styles.quizBtn}
                                    onClick={retryQuiz}
                                    style={{ marginTop: '1rem' }}
                                >
                                    Try Again
                                </button>
                            </motion.div>
                        ) : currentQuiz < 2 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.quizFeedback} ${styles.success}`}
                            >
                                <h4>Correct!</h4>
                                <p>Great job! Moving to the next question...</p>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
