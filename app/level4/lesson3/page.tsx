'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Calculator, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL4_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL4_LESSONS[2]; // Lesson 3
const LESSON_ID = 52;

export default function Lesson3() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('# Create a function that returns a value!\n');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasUsedReturn, setHasUsedReturn] = useState(false);
    const [hasSavedResult, setHasSavedResult] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            let functions: Record<string, { params: string[], body: string[] }> = {};
            let variables: Record<string, number | string> = {};
            let currentFunction: string | null = null;
            let currentParams: string[] = [];
            let functionBody: string[] = [];

            // First pass: collect function definitions
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();

                if (trimmed.startsWith('#') || trimmed === '') continue;

                // Function definition: def func_name(params):
                const defMatch = trimmed.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*:$/);
                if (defMatch) {
                    currentFunction = defMatch[1];
                    const paramStr = defMatch[2].trim();
                    currentParams = paramStr ? paramStr.split(',').map(p => p.trim()) : [];
                    functionBody = [];
                    continue;
                }

                // Check if we're inside a function (indented code)
                if (currentFunction && (line.startsWith('    ') || line.startsWith('\t'))) {
                    functionBody.push(trimmed);
                    if (trimmed.startsWith('return')) {
                        setHasUsedReturn(true);
                    }
                    functions[currentFunction] = { params: [...currentParams], body: [...functionBody] };
                    continue;
                }

                // End of function body
                if (currentFunction && !line.startsWith('    ') && !line.startsWith('\t')) {
                    currentFunction = null;
                    currentParams = [];
                }
            }

            // Helper function to evaluate a function call
            const evaluateFunction = (funcName: string, args: number[]): number | string | null => {
                const func = functions[funcName];
                if (!func) return null;

                // Create local scope with parameter values
                const localVars: Record<string, number> = {};
                func.params.forEach((param, idx) => {
                    if (idx < args.length) {
                        localVars[param] = args[idx];
                    }
                });

                // Execute function body
                for (const bodyLine of func.body) {
                    // Return statement: return a + b or return x * y
                    const returnMatch = bodyLine.match(/^return\s+(.+)$/);
                    if (returnMatch) {
                        const expr = returnMatch[1].trim();

                        // Handle arithmetic expressions
                        const addMatch = expr.match(/^(\w+)\s*\+\s*(\w+)$/);
                        if (addMatch) {
                            const val1 = localVars[addMatch[1]] ?? parseFloat(addMatch[1]);
                            const val2 = localVars[addMatch[2]] ?? parseFloat(addMatch[2]);
                            return val1 + val2;
                        }

                        const subMatch = expr.match(/^(\w+)\s*-\s*(\w+)$/);
                        if (subMatch) {
                            const val1 = localVars[subMatch[1]] ?? parseFloat(subMatch[1]);
                            const val2 = localVars[subMatch[2]] ?? parseFloat(subMatch[2]);
                            return val1 - val2;
                        }

                        const mulMatch = expr.match(/^(\w+)\s*\*\s*(\w+)$/);
                        if (mulMatch) {
                            const val1 = localVars[mulMatch[1]] ?? parseFloat(mulMatch[1]);
                            const val2 = localVars[mulMatch[2]] ?? parseFloat(mulMatch[2]);
                            return val1 * val2;
                        }

                        const divMatch = expr.match(/^(\w+)\s*\/\s*(\w+)$/);
                        if (divMatch) {
                            const val1 = localVars[divMatch[1]] ?? parseFloat(divMatch[1]);
                            const val2 = localVars[divMatch[2]] ?? parseFloat(divMatch[2]);
                            return val1 / val2;
                        }

                        // Just a variable or number
                        if (localVars[expr] !== undefined) {
                            return localVars[expr];
                        }
                        if (!isNaN(parseFloat(expr))) {
                            return parseFloat(expr);
                        }
                    }

                    // Print statement inside function
                    const printMatch = bodyLine.match(/^print\s*\(["'](.*)["']\)$/);
                    if (printMatch) {
                        outputLines.push(printMatch[1]);
                    }
                }

                return null;
            };

            // Second pass: execute top-level code
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || trimmed === '') continue;
                if (trimmed.startsWith('def ')) continue;
                if (line.startsWith('    ') || line.startsWith('\t')) continue;

                // Variable assignment with function call: result = add(5, 3)
                const assignCallMatch = trimmed.match(/^(\w+)\s*=\s*(\w+)\s*\(([^)]*)\)$/);
                if (assignCallMatch) {
                    const varName = assignCallMatch[1];
                    const funcName = assignCallMatch[2];
                    const argsStr = assignCallMatch[3];

                    if (funcName === 'print') continue;

                    const args = argsStr.split(',').map(arg => {
                        const trimmedArg = arg.trim();
                        // Check if it's a variable
                        if (variables[trimmedArg] !== undefined) {
                            return Number(variables[trimmedArg]);
                        }
                        return parseFloat(trimmedArg);
                    }).filter(n => !isNaN(n));

                    const result = evaluateFunction(funcName, args);
                    if (result !== null) {
                        variables[varName] = result;
                        setHasSavedResult(true);
                    }
                    continue;
                }

                // Print with variable: print(result)
                const printVarMatch = trimmed.match(/^print\s*\((\w+)\)$/);
                if (printVarMatch) {
                    const varName = printVarMatch[1];
                    if (variables[varName] !== undefined) {
                        outputLines.push(String(variables[varName]));
                    }
                    continue;
                }

                // Print string: print("text")
                const printStrMatch = trimmed.match(/^print\s*\(["'](.*)["']\)$/);
                if (printStrMatch) {
                    outputLines.push(printStrMatch[1]);
                    continue;
                }

                // Print f-string with variable: print(f"The answer is {result}")
                const printFMatch = trimmed.match(/^print\s*\(f["'](.*)["']\)$/);
                if (printFMatch) {
                    let text = printFMatch[1];
                    text = text.replace(/\{(\w+)\}/g, (_, varName) => {
                        if (variables[varName] !== undefined) {
                            return String(variables[varName]);
                        }
                        return `{${varName}}`;
                    });
                    outputLines.push(text);
                    continue;
                }

                // Direct function call: add(5, 3)
                const callMatch = trimmed.match(/^(\w+)\s*\(([^)]*)\)$/);
                if (callMatch) {
                    const funcName = callMatch[1];
                    const argsStr = callMatch[2];

                    if (funcName === 'print') continue;

                    const args = argsStr.split(',').map(arg => {
                        const trimmedArg = arg.trim();
                        if (variables[trimmedArg] !== undefined) {
                            return Number(variables[trimmedArg]);
                        }
                        return parseFloat(trimmedArg);
                    }).filter(n => !isNaN(n));

                    evaluateFunction(funcName, args);
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

        // Correct answers: Q1 = 1 (Sends an answer back), Q2 = 1 (result = add(2, 3))
        const correctAnswers = [1, 1];

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
                        🍬
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
                    Return Value Expert!
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={styles.successMessage}
                >
                    {LESSON.successMessage} Your functions can now calculate and return answers!
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
                    <Link href="/level4/lesson4" className={`${styles.navBtn} ${styles.primary}`}>
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

                        {/* Story Introduction */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))', borderColor: 'var(--accent-primary)' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Calculator size={28} style={{ color: 'var(--accent-primary)' }} />
                                <ArrowRightLeft size={24} style={{ color: 'var(--accent-secondary)' }} />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>Mission: Get Answers Back!</span>
                            </div>

                            <p>
                                🍭 Sometimes you want your function to <strong style={{ color: 'var(--accent-secondary)' }}>CALCULATE</strong> something and give you the answer back!
                                The <strong style={{ color: 'var(--accent-primary)' }}>return</strong> statement sends an answer back to where the function was called.
                            </p>
                        </motion.div>

                        {/* Comparison: Without Return vs With Return */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                gap: '1rem',
                                marginBottom: '2rem'
                            }}
                        >
                            {/* Without Return */}
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '0.75rem',
                                padding: '1.25rem'
                            }}>
                                <h4 style={{ color: '#f87171', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    Without return (just prints)
                                </h4>
                                <div style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                                    <span style={{ color: '#ff79c6' }}>def</span> add(a, b):{'\n'}
                                    {'    '}print(a + b){'\n\n'}
                                    add(5, 3)  <span style={{ color: '#6272a4' }}># prints 8</span>{'\n'}
                                    <span style={{ color: '#f87171' }}>result = add(5, 3)</span>{'\n'}
                                    <span style={{ color: '#6272a4' }}># result is None! 😢</span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    The function prints but doesn't give the answer back!
                                </p>
                            </div>

                            {/* With Return */}
                            <div style={{
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: '0.75rem',
                                padding: '1.25rem'
                            }}>
                                <h4 style={{ color: '#10b981', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    With return (gives answer back!)
                                </h4>
                                <div style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                                    <span style={{ color: '#ff79c6' }}>def</span> add(a, b):{'\n'}
                                    {'    '}<span style={{ color: '#ff79c6' }}>return</span> a + b{'\n\n'}
                                    <span style={{ color: '#50fa7b' }}>result = add(5, 3)</span>{'\n'}
                                    <span style={{ color: '#6272a4' }}># result is 8! 🎉</span>{'\n'}
                                    print(result)  <span style={{ color: '#6272a4' }}># prints 8</span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    The function gives the answer back so you can save it!
                                </p>
                            </div>
                        </motion.div>

                        {/* Animation: Return Value Flow */}
                        <motion.div
                            style={{
                                background: 'var(--bg-secondary)',
                                borderRadius: '1rem',
                                padding: '1.5rem',
                                marginBottom: '2rem',
                                border: '1px solid var(--accent-primary)',
                                textAlign: 'center'
                            }}
                        >
                            <h3 style={{ color: 'var(--accent-secondary)', marginBottom: '1rem' }}>How Return Works</h3>

                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <motion.div
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{
                                        background: 'var(--accent-primary)',
                                        color: 'white',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.5rem',
                                        fontFamily: 'Fira Code, monospace'
                                    }}
                                >
                                    result = add(5, 3)
                                </motion.div>

                                <motion.div
                                    animate={{ x: [0, 10, 0] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    style={{ fontSize: '1.5rem' }}
                                >
                                    ➡️
                                </motion.div>

                                <motion.div
                                    style={{
                                        background: 'rgba(80, 250, 123, 0.2)',
                                        border: '2px solid #50fa7b',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.5rem',
                                        fontFamily: 'Fira Code, monospace'
                                    }}
                                >
                                    return 5 + 3
                                </motion.div>

                                <motion.div
                                    animate={{ x: [0, 10, 0] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                                    style={{ fontSize: '1.5rem' }}
                                >
                                    ➡️
                                </motion.div>

                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    style={{
                                        background: 'var(--accent-secondary)',
                                        color: 'white',
                                        padding: '0.75rem 1.25rem',
                                        borderRadius: '0.5rem',
                                        fontWeight: 700,
                                        fontSize: '1.25rem'
                                    }}
                                >
                                    8
                                </motion.div>
                            </div>

                            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
                                The answer <strong>8</strong> gets sent back and stored in <strong>result</strong>!
                            </p>
                        </motion.div>

                        {/* Main Explanation */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-secondary)' }}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
                                <Lightbulb size={20} style={{ color: 'var(--accent-secondary)' }} /> The return Keyword
                            </h3>

                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255, 121, 198, 0.1)', borderRadius: '0.5rem' }}>
                                    <code style={{ color: '#ff79c6', fontSize: '1.1rem', fontWeight: 700 }}>return</code>
                                    <span>= Sends a value back from the function to where it was called</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(80, 250, 123, 0.1)', borderRadius: '0.5rem' }}>
                                    <code style={{ color: '#50fa7b', fontSize: '1rem' }}>result = func()</code>
                                    <span>= Saves the returned value in a variable so you can use it later!</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(189, 147, 249, 0.1)', borderRadius: '0.5rem' }}>
                                    <span>Think of <code>return</code> like a machine that gives you something back when you put things in!</span>
                                </div>
                            </div>
                        </div>

                        {/* Example Code */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: 'var(--accent-secondary)' }}>Example: Add Two Numbers</h3>
                            <div className={styles.codeBlock} style={{ borderColor: 'var(--accent-primary)' }}>
                                <div className={styles.codeHeader}>
                                    <span>main.py</span>
                                    <span>Python</span>
                                </div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># Create a function that returns the sum</span>{'\n'}
                                    <span className={styles.keyword}>def</span> <span style={{ color: '#50fa7b' }}>add</span>(a, b):{'\n'}
                                    {'    '}<span className={styles.keyword}>return</span> a + b{'\n\n'}
                                    <span className={styles.comment}># Call the function and save the result</span>{'\n'}
                                    <span className={styles.variable}>result</span> = <span style={{ color: '#50fa7b' }}>add</span>(<span className={styles.number}>5</span>, <span className={styles.number}>3</span>){'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>f"5 + 3 = </span><span style={{ color: '#ff79c6' }}>{'{'}result{'}'}</span><span className={styles.string}>"</span>){'\n\n'}
                                    <span className={styles.comment}># You can use the result in other calculations!</span>{'\n'}
                                    <span className={styles.variable}>double</span> = <span style={{ color: '#50fa7b' }}>add</span>(<span className={styles.number}>10</span>, <span className={styles.number}>10</span>){'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>f"10 + 10 = </span><span style={{ color: '#ff79c6' }}>{'{'}double{'}'}</span><span className={styles.string}>"</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>
                                    5 + 3 = 8{'\n'}
                                    10 + 10 = 20
                                </div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: 'var(--accent-secondary)' }}>Your Turn - Create a Multiply Function!</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                Create a function called <code style={{ color: 'var(--accent-primary)' }}>multiply(x, y)</code> that returns x * y, then save and print the result!
                            </p>
                            <div className={styles.editor} style={{ borderColor: 'var(--accent-primary)' }}>
                                <div className={styles.codeHeader}>
                                    <span>your_code.py</span>
                                    <span>Python</span>
                                </div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder='# Create a multiply function!
def multiply(x, y):
    return x * y

# Save the result
answer = multiply(4, 5)
print(f"4 x 5 = {answer}")

# Try another one!
big = multiply(7, 8)
print(f"7 x 8 = {big}")'
                                    spellCheck={false}
                                    style={{ minHeight: '220px' }}
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
                                    <div className={`${styles.challengeCheck} ${hasUsedReturn ? styles.done : ''}`}>
                                        {hasUsedReturn && <Check size={14} />}
                                    </div>
                                    Use <code style={{ color: 'var(--accent-secondary)' }}>return</code> in a function
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasSavedResult ? styles.done : ''}`}>
                                        {hasSavedResult && <Check size={14} />}
                                    </div>
                                    Save the returned value in a variable
                                </li>
                            </ul>
                        </div>

                        {/* Tip Box */}
                        <div className={styles.tipBox} style={{ background: 'rgba(251, 191, 36, 0.15)', borderColor: 'var(--accent-secondary)' }}>
                            <Lightbulb size={20} style={{ color: 'var(--accent-secondary)', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--accent-secondary)' }}>Remember:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li><code>return</code> sends an answer back from the function</li>
                                    <li>Save the returned value: <code>result = function()</code></li>
                                    <li><code>return</code> ends the function immediately - code after it won't run!</li>
                                    <li>Without <code>return</code>, the function gives back <code>None</code></li>
                                </ul>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className={styles.navBar}>
                            <Link href="/level4/lesson2" className={`${styles.navBtn} ${styles.secondary}`}>
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
                        style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))', borderColor: 'var(--accent-primary)' }}
                    >
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ fontSize: '3rem', marginBottom: '1rem' }}
                        >
                            🧮
                        </motion.div>
                        <h2 className={styles.quizTitle} style={{ color: 'var(--accent-primary)' }}>Brain Check! (Question {currentQuiz + 1}/2)</h2>

                        {currentQuiz === 0 ? (
                            <>
                                <p className={styles.quizQuestion}>
                                    What does the <code>return</code> keyword do?
                                </p>
                                <div className={styles.quizOptions}>
                                    {[
                                        'Prints something to the screen',
                                        'Sends an answer back from the function',
                                        'Ends the program completely'
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
                                                } ${quizChecked[0] && idx === 1 ? styles.correct : ''
                                                } ${quizChecked[0] && quizAnswers[0] === idx && idx !== 1 ? styles.wrong : ''
                                                }`}
                                            disabled={quizChecked[0]}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>
                                    How do you save the returned value from <code>add(2, 3)</code>?
                                </p>
                                <div className={styles.quizOptions}>
                                    {[
                                        'save add(2, 3)',
                                        'result = add(2, 3)',
                                        'return add(2, 3)'
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
                        ) : quizAnswers[currentQuiz] !== 1 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.quizFeedback} ${styles.error}`}
                            >
                                <h4>Not quite!</h4>
                                <p>
                                    {currentQuiz === 0
                                        ? '"return" sends an answer back from the function - it doesn\'t print, it gives the value back so you can save it!'
                                        : 'To save a returned value, use the equals sign: result = add(2, 3). This stores the answer in "result"!'
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
                                <p>"return" sends an answer back so you can save it and use it! Moving to the next question...</p>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
