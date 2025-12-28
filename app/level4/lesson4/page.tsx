'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Bot, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL4_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL4_LESSONS[3]; // Lesson 4
const LESSON_ID = 53; // Level 4 lessons: 50-62

export default function Lesson4() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('# Create a function with multiple parameters!\ndef introduce(name, age):\n    print(f"Hi, I am {name} and I am {age} years old!")\n\n# Call your function here\n');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
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
                    if (inFunction && !trimmed.startsWith('#')) continue;
                    if (!inFunction) continue;
                }

                // Function definition with multiple parameters
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

            // Second pass: execute function calls
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) continue;
                if (trimmed.startsWith('def ')) continue;
                if (line.startsWith('    ') || line.startsWith('\t')) continue;

                // Function call with multiple arguments
                const callMatch = trimmed.match(/^(\w+)\s*\(([^)]*)\)$/);
                if (callMatch) {
                    const funcName = callMatch[1];
                    const argsStr = callMatch[2].trim();

                    if (funcName === 'print') {
                        // Handle print with f-string
                        const fstringMatch = argsStr.match(/^f["'](.*)["']$/);
                        if (fstringMatch) {
                            let text = fstringMatch[1];
                            text = text.replace(/\{(\w+)\}/g, (match, varName) => {
                                if (variables[varName] !== undefined) {
                                    return String(variables[varName]);
                                }
                                return match;
                            });
                            outputLines.push(text);
                        } else {
                            // Regular print
                            const stringMatch = argsStr.match(/^["'](.*)["']$/);
                            if (stringMatch) {
                                outputLines.push(stringMatch[1]);
                            } else if (variables[argsStr] !== undefined) {
                                outputLines.push(String(variables[argsStr]));
                            }
                        }
                        continue;
                    }

                    // Call user-defined function
                    if (functions[funcName]) {
                        const func = functions[funcName];
                        // Parse arguments
                        const args: string[] = [];
                        let currentArg = '';
                        let inString = false;
                        let stringChar = '';

                        for (let i = 0; i < argsStr.length; i++) {
                            const char = argsStr[i];
                            if ((char === '"' || char === "'") && !inString) {
                                inString = true;
                                stringChar = char;
                                currentArg += char;
                            } else if (char === stringChar && inString) {
                                inString = false;
                                currentArg += char;
                            } else if (char === ',' && !inString) {
                                args.push(currentArg.trim());
                                currentArg = '';
                            } else {
                                currentArg += char;
                            }
                        }
                        if (currentArg.trim()) {
                            args.push(currentArg.trim());
                        }

                        // Map arguments to parameters
                        const localVars: Record<string, string | number> = {};
                        func.params.forEach((param, idx) => {
                            if (args[idx]) {
                                const arg = args[idx];
                                const strMatch = arg.match(/^["'](.*)["']$/);
                                if (strMatch) {
                                    localVars[param] = strMatch[1];
                                } else if (!isNaN(Number(arg))) {
                                    localVars[param] = Number(arg);
                                } else {
                                    localVars[param] = arg;
                                }
                            }
                        });

                        // Execute function body
                        for (const bodyLine of func.body) {
                            // Print statement
                            const printMatch = bodyLine.match(/^print\s*\((.+)\)$/);
                            if (printMatch) {
                                const printArg = printMatch[1];
                                // f-string
                                const fMatch = printArg.match(/^f["'](.*)["']$/);
                                if (fMatch) {
                                    let text = fMatch[1];
                                    text = text.replace(/\{(\w+)\}/g, (match, varName) => {
                                        if (localVars[varName] !== undefined) {
                                            return String(localVars[varName]);
                                        }
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
                            }

                            // Return statement
                            const returnMatch = bodyLine.match(/^return\s+(.+)$/);
                            if (returnMatch) {
                                const returnExpr = returnMatch[1];
                                // Try arithmetic
                                const arithMatch = returnExpr.match(/^(\w+)\s*([+\-*/])\s*(\w+)$/);
                                if (arithMatch) {
                                    const left = localVars[arithMatch[1]] !== undefined ? Number(localVars[arithMatch[1]]) : Number(arithMatch[1]);
                                    const right = localVars[arithMatch[3]] !== undefined ? Number(localVars[arithMatch[3]]) : Number(arithMatch[3]);
                                    let result = 0;
                                    switch (arithMatch[2]) {
                                        case '+': result = left + right; break;
                                        case '-': result = left - right; break;
                                        case '*': result = left * right; break;
                                        case '/': result = left / right; break;
                                    }
                                    outputLines.push(`Result: ${result}`);
                                }
                            }
                        }
                    }
                    continue;
                }

                // Variable assignment with function call result
                const assignMatch = trimmed.match(/^(\w+)\s*=\s*(\w+)\s*\(([^)]*)\)$/);
                if (assignMatch) {
                    const varName = assignMatch[1];
                    const funcName = assignMatch[2];
                    const argsStr = assignMatch[3].trim();

                    if (functions[funcName]) {
                        const func = functions[funcName];
                        const args = argsStr.split(',').map(a => a.trim());

                        const localVars: Record<string, string | number> = {};
                        func.params.forEach((param, idx) => {
                            if (args[idx]) {
                                const arg = args[idx];
                                const strMatch = arg.match(/^["'](.*)["']$/);
                                if (strMatch) {
                                    localVars[param] = strMatch[1];
                                } else if (!isNaN(Number(arg))) {
                                    localVars[param] = Number(arg);
                                }
                            }
                        });

                        // Look for return
                        for (const bodyLine of func.body) {
                            const returnMatch = bodyLine.match(/^return\s+(.+)$/);
                            if (returnMatch) {
                                const returnExpr = returnMatch[1];
                                const arithMatch = returnExpr.match(/^(\w+)\s*([+\-*/])\s*(\w+)$/);
                                if (arithMatch) {
                                    const left = localVars[arithMatch[1]] !== undefined ? Number(localVars[arithMatch[1]]) : Number(arithMatch[1]);
                                    const right = localVars[arithMatch[3]] !== undefined ? Number(localVars[arithMatch[3]]) : Number(arithMatch[3]);
                                    let result = 0;
                                    switch (arithMatch[2]) {
                                        case '+': result = left + right; break;
                                        case '-': result = left - right; break;
                                        case '*': result = left * right; break;
                                        case '/': result = left / right; break;
                                    }
                                    variables[varName] = result;
                                }
                            }
                        }
                    }
                    continue;
                }
            }

            if (outputLines.length > 0) {
                setOutput(outputLines.join('\n'));
            } else {
                setOutput('Run your code to see what happens! Try calling your function.');
            }
        } catch {
            setOutput('Error in code! Check your syntax.');
        }
    };

    const checkQuiz = () => {
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = true;
        setQuizChecked(newChecked);

        // Correct answers: Q1 = 1 (Commas), Q2 = 1 (2 parameters)
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
                    Multiple Parameters Master!
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={styles.successMessage}
                >
                    {LESSON.successMessage} You can now send multiple pieces of info to functions!
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
                    <Link href="/level4/lesson5" className={`${styles.navBtn} ${styles.primary}`}>
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
                                <p>Learn: <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Story Introduction */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{ background: 'linear-gradient(135deg, rgba(255, 121, 198, 0.15), rgba(139, 233, 253, 0.15))' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Bot size={28} style={{ color: 'var(--accent-primary)' }} />
                                <Package size={24} style={{ color: 'var(--accent-secondary)' }} />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Mission: Send Multiple Gifts!</span>
                            </div>

                            {/* Animation */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '1.5rem',
                                background: 'rgba(0,0,0,0.2)',
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
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{
                                        fontSize: '1.5rem',
                                        background: 'rgba(255, 121, 198, 0.3)',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.5rem',
                                        border: '2px dashed rgba(255, 121, 198, 0.5)',
                                        display: 'flex',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <motion.span animate={{ y: [0, -2, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}>
                                        🎁
                                    </motion.span>
                                    <motion.span animate={{ y: [0, -2, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.15 }}>
                                        🎁
                                    </motion.span>
                                    <motion.span animate={{ y: [0, -2, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.3 }}>
                                        🎁
                                    </motion.span>
                                </motion.div>
                            </div>

                            <p>
                                What if your function needs MORE than one piece of information? Like calculating the area of a rectangle - you need BOTH width AND height! Let's learn how to send multiple parameters!
                            </p>
                        </motion.div>

                        {/* Main Explanation */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Lightbulb size={20} style={{ color: 'var(--xp-coins)' }} /> Multiple Parameters
                            </h3>
                            <p>
                                Just like you might need to tell someone your name AND age, functions can accept multiple pieces of information. We separate them with <strong>commas</strong>!
                            </p>

                            <div style={{ marginTop: '1.5rem' }}>
                                <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>The Pattern:</p>
                                <div style={{
                                    background: 'rgba(0,0,0,0.3)',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    fontFamily: "'Fira Code', monospace",
                                    marginBottom: '1rem'
                                }}>
                                    <span style={{ color: 'var(--accent-primary)' }}>def</span> function_name(<span style={{ color: 'var(--accent-secondary)' }}>param1</span>, <span style={{ color: 'var(--success)' }}>param2</span>, <span style={{ color: 'var(--xp-coins)' }}>param3</span>):
                                </div>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.2rem' }}>1.</span>
                                        <span>Put each parameter inside the parentheses <code>()</code></span>
                                    </li>
                                    <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.2rem' }}>2.</span>
                                        <span>Separate parameters with commas <code>,</code></span>
                                    </li>
                                    <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.2rem' }}>3.</span>
                                        <span>When calling, give values in the same order!</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Example Code */}
                        <div className={styles.codeSection}>
                            <h3>Example: Calculate Rectangle Area</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}>
                                    <span>main.py</span>
                                    <span>Python</span>
                                </div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># Function with TWO parameters</span>{'\n'}
                                    <span className={styles.keyword}>def</span> <span className={styles.variable}>calculate_area</span>(<span style={{ color: 'var(--accent-secondary)' }}>width</span>, <span style={{ color: 'var(--success)' }}>height</span>):{'\n'}
                                    {'    '}<span className={styles.keyword}>return</span> width * height{'\n\n'}
                                    <span className={styles.comment}># Call with TWO arguments</span>{'\n'}
                                    <span className={styles.variable}>area</span> = calculate_area(<span className={styles.number}>5</span>, <span className={styles.number}>3</span>){'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>f"The area is: </span>{'{area}'}<span className={styles.string}>"</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>
                                    The area is: 15
                                </div>
                            </div>
                        </div>

                        {/* More Examples */}
                        <div className={styles.codeSection}>
                            <h3>More Examples</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}>
                                    <span>examples.py</span>
                                    <span>Python</span>
                                </div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># Adding two numbers</span>{'\n'}
                                    <span className={styles.keyword}>def</span> <span className={styles.variable}>add_numbers</span>(a, b):{'\n'}
                                    {'    '}<span className={styles.keyword}>return</span> a + b{'\n\n'}
                                    <span className={styles.comment}># Describing a pet with THREE parameters!</span>{'\n'}
                                    <span className={styles.keyword}>def</span> <span className={styles.variable}>describe_pet</span>(name, animal, age):{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>f"</span>{'{name}'}<span className={styles.string}> is a </span>{'{age}'}<span className={styles.string}> year old </span>{'{animal}'}<span className={styles.string}>!"</span>){'\n\n'}
                                    <span className={styles.comment}># Call the functions</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(add_numbers(<span className={styles.number}>10</span>, <span className={styles.number}>5</span>)){'\n'}
                                    describe_pet(<span className={styles.string}>"Buddy"</span>, <span className={styles.string}>"dog"</span>, <span className={styles.number}>3</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>
                                    15{'\n'}
                                    Buddy is a 3 year old dog!
                                </div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3>Your Turn - Create introduce(name, age)!</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                Create a function called <code>introduce</code> that takes a name and age, then prints a greeting. Don't forget to call your function!
                            </p>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}>
                                    <span>your_code.py</span>
                                    <span>Python</span>
                                </div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder='# Create your function here!
def introduce(name, age):
    print(f"Hi, I am {name} and I am {age} years old!")

# Call your function
introduce("Alex", 11)'
                                    spellCheck={false}
                                    style={{ minHeight: '180px' }}
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
                                    Create a function with multiple parameters
                                </li>
                                <li style={{ color: 'var(--text-secondary)', paddingLeft: '2.5rem' }}>
                                    Try creating describe_pet with name, animal, and age!
                                </li>
                            </ul>
                        </div>

                        {/* Tip Box */}
                        <div className={styles.tipBox}>
                            <Lightbulb size={20} style={{ color: 'var(--xp-coins)', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Remember:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li>Separate parameters with commas: <code>(a, b, c)</code></li>
                                    <li>Arguments must be in the SAME ORDER as parameters</li>
                                    <li>You can have as many parameters as you need!</li>
                                </ul>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className={styles.navBar}>
                            <Link href="/level4/lesson3" className={`${styles.navBtn} ${styles.secondary}`}>
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
                        <h2 className={styles.quizTitle}>Brain Check! (Question {currentQuiz + 1}/2)</h2>

                        {currentQuiz === 0 ? (
                            <>
                                <p className={styles.quizQuestion}>
                                    How do you separate multiple parameters in a function?
                                </p>
                                <div className={styles.quizOptions}>
                                    {[
                                        'A) Spaces',
                                        'B) Commas',
                                        'C) Plus signs'
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
                                    <code>def greet(first, last):</code> - How many parameters does this function have?
                                </p>
                                <div className={styles.quizOptions}>
                                    {[
                                        'A) 1',
                                        'B) 2',
                                        'C) 3'
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
                                            {option}
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
                        ) : quizAnswers[currentQuiz] !== 1 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.quizFeedback} ${styles.error}`}
                            >
                                <h4>Not quite!</h4>
                                <p>
                                    {currentQuiz === 0
                                        ? 'We use commas to separate multiple parameters in a function, just like separating items in a list!'
                                        : 'Count the parameter names between the parentheses! "first" and "last" are two separate parameters.'
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
                        ) : currentQuiz === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.quizFeedback} ${styles.success}`}
                            >
                                <h4>Correct!</h4>
                                <p>Commas separate multiple parameters! Moving to the next question...</p>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
