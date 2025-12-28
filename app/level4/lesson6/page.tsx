'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Bot, Target, Star, Award } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL4_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL4_LESSONS[5]; // Lesson 6 (Practice)
const LESSON_ID = 55; // Level 4 lessons: 50-62

export default function Lesson6() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [currentChallenge, setCurrentChallenge] = useState(0);
    const [code, setCode] = useState('# Challenge 1: Create a function that says hello\ndef say_hello():\n    print("Hello, World!")\n\n# Call your function\nsay_hello()\n');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [challengesCompleted, setChallengesCompleted] = useState<boolean[]>([false, false, false, false]);
    const [showSupercharge, setShowSupercharge] = useState(false);
    const [superchargeComplete, setSuperchargeComplete] = useState(false);
    const [superchargeCode, setSuperchargeCode] = useState('# SUPERCHARGE Challenge: Build a Mini Calculator!\n# Create add and subtract functions\n\ndef add(a, b):\n    return a + b\n\ndef subtract(a, b):\n    return a - b\n\n# Test your calculator\nresult1 = add(10, 5)\nresult2 = subtract(20, 8)\nprint(f"10 + 5 = {result1}")\nprint(f"20 - 8 = {result2}")\n');
    const [superchargeOutput, setSuperchargeOutput] = useState('');

    const challenges = [
        {
            title: "Challenge 1: Simple Hello Function",
            description: "Create a function called say_hello() that prints 'Hello, World!'",
            starterCode: '# Challenge 1: Create a function that says hello\ndef say_hello():\n    print("Hello, World!")\n\n# Call your function\nsay_hello()\n',
            check: (code: string) => code.includes('def say_hello') && code.includes('print')
        },
        {
            title: "Challenge 2: Function with Parameter",
            description: "Create a function called greet(name) that prints a greeting with the name",
            starterCode: '# Challenge 2: Create a function with a parameter\ndef greet(name):\n    print(f"Hello, {name}!")\n\n# Call your function with a name\ngreet("Alex")\n',
            check: (code: string) => code.includes('def greet') && code.includes('name') && code.includes('print')
        },
        {
            title: "Challenge 3: Function that Returns",
            description: "Create a function called double(number) that returns the number times 2",
            starterCode: '# Challenge 3: Create a function that returns a value\ndef double(number):\n    return number * 2\n\n# Test your function\nresult = double(5)\nprint(f"Double of 5 is: {result}")\n',
            check: (code: string) => code.includes('def double') && code.includes('return') && code.includes('* 2')
        },
        {
            title: "Challenge 4: Multiple Parameters",
            description: "Create a function called add_three(a, b, c) that returns the sum of three numbers",
            starterCode: '# Challenge 4: Create a function with multiple parameters\ndef add_three(a, b, c):\n    return a + b + c\n\n# Test your function\ntotal = add_three(1, 2, 3)\nprint(f"1 + 2 + 3 = {total}")\n',
            check: (code: string) => code.includes('def add_three') && (code.includes('a, b, c') || code.includes('a,b,c')) && code.includes('return')
        }
    ];

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

                const funcMatch = trimmed.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*:/);
                if (funcMatch) {
                    if (inFunction && currentFunctionName) {
                        functions[currentFunctionName] = { params: currentFunctionParams, body: currentFunctionBody };
                    }
                    inFunction = true;
                    currentFunctionName = funcMatch[1];
                    const paramsStr = funcMatch[2].trim();
                    currentFunctionParams = paramsStr ? paramsStr.split(',').map(p => p.trim()) : [];
                    currentFunctionBody = [];
                    continue;
                }

                if (inFunction && (line.startsWith('    ') || line.startsWith('\t'))) {
                    currentFunctionBody.push(trimmed);
                    continue;
                }

                if (inFunction && !line.startsWith('    ') && !line.startsWith('\t') && trimmed) {
                    functions[currentFunctionName] = { params: currentFunctionParams, body: currentFunctionBody };
                    inFunction = false;
                }
            }

            if (inFunction && currentFunctionName) {
                functions[currentFunctionName] = { params: currentFunctionParams, body: currentFunctionBody };
            }

            // Helper functions
            const evalExpr = (expr: string, localVars: Record<string, string | number>): number | string => {
                const trimExpr = expr.trim();
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
                // a + b + c pattern
                const multiArithMatch = trimExpr.match(/^(\w+)\s*\+\s*(\w+)\s*\+\s*(\w+)$/);
                if (multiArithMatch) {
                    const val1 = localVars[multiArithMatch[1]] !== undefined ? Number(localVars[multiArithMatch[1]]) : Number(multiArithMatch[1]);
                    const val2 = localVars[multiArithMatch[2]] !== undefined ? Number(localVars[multiArithMatch[2]]) : Number(multiArithMatch[2]);
                    const val3 = localVars[multiArithMatch[3]] !== undefined ? Number(localVars[multiArithMatch[3]]) : Number(multiArithMatch[3]);
                    return val1 + val2 + val3;
                }
                if (localVars[trimExpr] !== undefined) return localVars[trimExpr];
                if (!isNaN(Number(trimExpr))) return Number(trimExpr);
                return trimExpr;
            };

            const executeFunction = (funcName: string, args: (string | number)[]): number | string | undefined => {
                if (!functions[funcName]) return undefined;
                const func = functions[funcName];
                const localVars: Record<string, string | number> = {};
                func.params.forEach((param, idx) => {
                    if (args[idx] !== undefined) localVars[param] = args[idx];
                });
                let returnValue: number | string | undefined = undefined;

                for (const bodyLine of func.body) {
                    const assignMatch = bodyLine.match(/^(\w+)\s*=\s*(.+)$/);
                    if (assignMatch) {
                        localVars[assignMatch[1]] = evalExpr(assignMatch[2], localVars);
                        continue;
                    }
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
                            if (strMatch) outputLines.push(strMatch[1]);
                            else if (localVars[printArg] !== undefined) outputLines.push(String(localVars[printArg]));
                        }
                        continue;
                    }
                    const returnMatch = bodyLine.match(/^return\s+(.+)$/);
                    if (returnMatch) returnValue = evalExpr(returnMatch[1], localVars);
                }
                return returnValue;
            };

            // Second pass: execute main code
            inFunction = false;
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) continue;
                if (trimmed.startsWith('def ')) { inFunction = true; continue; }
                if (inFunction && (line.startsWith('    ') || line.startsWith('\t'))) continue;
                if (inFunction && !line.startsWith('    ') && !line.startsWith('\t') && trimmed) inFunction = false;
                if (inFunction) continue;

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
                            if (strMatch) args.push(strMatch[1]);
                            else if (!isNaN(Number(arg))) args.push(Number(arg));
                            else if (variables[arg] !== undefined) args.push(variables[arg]);
                        });
                    }
                    const result = executeFunction(funcName, args);
                    if (result !== undefined) variables[varName] = result;
                    continue;
                }

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
                        if (strMatch) outputLines.push(strMatch[1]);
                        else if (variables[printArg] !== undefined) outputLines.push(String(variables[printArg]));
                    }
                    continue;
                }

                const callMatch = trimmed.match(/^(\w+)\s*\(([^)]*)\)$/);
                if (callMatch && functions[callMatch[1]]) {
                    const funcName = callMatch[1];
                    const argsStr = callMatch[2].trim();
                    const args: (string | number)[] = [];
                    if (argsStr) {
                        argsStr.split(',').forEach(a => {
                            const arg = a.trim();
                            const strMatch = arg.match(/^["'](.*)["']$/);
                            if (strMatch) args.push(strMatch[1]);
                            else if (!isNaN(Number(arg))) args.push(Number(arg));
                        });
                    }
                    executeFunction(funcName, args);
                }
            }

            if (outputLines.length > 0) {
                setOutput(outputLines.join('\n'));
                // Check if challenge is completed
                if (challenges[currentChallenge].check(code)) {
                    const newCompleted = [...challengesCompleted];
                    newCompleted[currentChallenge] = true;
                    setChallengesCompleted(newCompleted);
                }
            } else {
                setOutput('Run your code to see what happens!');
            }
        } catch {
            setOutput('Error in code! Check your syntax.');
        }
    };

    const runSuperchargeCode = () => {
        try {
            const lines = superchargeCode.trim().split('\n');
            let outputLines: string[] = [];
            let functions: Record<string, { params: string[]; body: string[] }> = {};
            let variables: Record<string, string | number> = {};
            let inFunction = false;
            let currentFunctionName = '';
            let currentFunctionParams: string[] = [];
            let currentFunctionBody: string[] = [];

            // Parse functions
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) {
                    if (!inFunction) continue;
                }

                const funcMatch = trimmed.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*:/);
                if (funcMatch) {
                    if (inFunction && currentFunctionName) {
                        functions[currentFunctionName] = { params: currentFunctionParams, body: currentFunctionBody };
                    }
                    inFunction = true;
                    currentFunctionName = funcMatch[1];
                    const paramsStr = funcMatch[2].trim();
                    currentFunctionParams = paramsStr ? paramsStr.split(',').map(p => p.trim()) : [];
                    currentFunctionBody = [];
                    continue;
                }

                if (inFunction && (line.startsWith('    ') || line.startsWith('\t'))) {
                    currentFunctionBody.push(trimmed);
                    continue;
                }

                if (inFunction && !line.startsWith('    ') && !line.startsWith('\t') && trimmed) {
                    functions[currentFunctionName] = { params: currentFunctionParams, body: currentFunctionBody };
                    inFunction = false;
                }
            }

            if (inFunction && currentFunctionName) {
                functions[currentFunctionName] = { params: currentFunctionParams, body: currentFunctionBody };
            }

            // Check for add and subtract functions
            const hasAdd = functions['add'] && functions['add'].body.some(l => l.includes('return'));
            const hasSubtract = functions['subtract'] && functions['subtract'].body.some(l => l.includes('return'));

            // Execute code
            const evalExpr = (expr: string, localVars: Record<string, string | number>): number | string => {
                const trimExpr = expr.trim();
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
                if (localVars[trimExpr] !== undefined) return localVars[trimExpr];
                if (!isNaN(Number(trimExpr))) return Number(trimExpr);
                return trimExpr;
            };

            const executeFunction = (funcName: string, args: (string | number)[]): number | string | undefined => {
                if (!functions[funcName]) return undefined;
                const func = functions[funcName];
                const localVars: Record<string, string | number> = {};
                func.params.forEach((param, idx) => {
                    if (args[idx] !== undefined) localVars[param] = args[idx];
                });
                for (const bodyLine of func.body) {
                    const returnMatch = bodyLine.match(/^return\s+(.+)$/);
                    if (returnMatch) return evalExpr(returnMatch[1], localVars);
                }
                return undefined;
            };

            // Execute main code
            inFunction = false;
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) continue;
                if (trimmed.startsWith('def ')) { inFunction = true; continue; }
                if (inFunction && (line.startsWith('    ') || line.startsWith('\t'))) continue;
                if (inFunction && !line.startsWith('    ') && !line.startsWith('\t') && trimmed) inFunction = false;
                if (inFunction) continue;

                const assignFuncMatch = trimmed.match(/^(\w+)\s*=\s*(\w+)\s*\(([^)]*)\)$/);
                if (assignFuncMatch) {
                    const varName = assignFuncMatch[1];
                    const funcName = assignFuncMatch[2];
                    const argsStr = assignFuncMatch[3].trim();
                    const args: (string | number)[] = argsStr.split(',').map(a => {
                        const arg = a.trim();
                        if (!isNaN(Number(arg))) return Number(arg);
                        return variables[arg] !== undefined ? variables[arg] : arg;
                    });
                    const result = executeFunction(funcName, args);
                    if (result !== undefined) variables[varName] = result;
                    continue;
                }

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
                    }
                }
            }

            setSuperchargeOutput(outputLines.join('\n'));

            if (hasAdd && hasSubtract && outputLines.length >= 2) {
                setSuperchargeComplete(true);
            }
        } catch {
            setSuperchargeOutput('Error in code! Check your syntax.');
        }
    };

    const nextChallenge = () => {
        if (currentChallenge < 3) {
            const next = currentChallenge + 1;
            setCurrentChallenge(next);
            setCode(challenges[next].starterCode);
            setOutput('');
        }
    };

    const checkQuiz = () => {
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = true;
        setQuizChecked(newChecked);

        // Correct: Q1 = 0 (def), Q2 = 1 (return), Q3 = 2 (commas)
        const correctAnswers = [0, 1, 2];

        if (quizAnswers[currentQuiz] === correctAnswers[currentQuiz]) {
            if (currentQuiz < 2) {
                setTimeout(() => setCurrentQuiz(currentQuiz + 1), 1000);
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

    const claimSuperchargeBonus = () => {
        addXpAndCoins(25, 10);
        setShowSupercharge(false);
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

    if (lessonComplete && !showSupercharge) {
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
                    Practice Champion!
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={styles.successMessage}
                >
                    {LESSON.successMessage} You've mastered the basics of functions!
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
                    style={{ display: 'flex', gap: '1rem', flexDirection: 'column', alignItems: 'center' }}
                >
                    <button
                        onClick={() => setShowSupercharge(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.875rem 1.5rem',
                            background: 'linear-gradient(135deg, var(--badge-supercharge), #FFD93D)',
                            color: '#1E1E2E',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        <Zap size={18} /> SUPERCHARGE +25 XP
                    </button>
                    <Link href="/level4/lesson7" className={`${styles.navBtn} ${styles.primary}`}>
                        Next Lesson <ChevronRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (showSupercharge) {
        return (
            <div className={styles.container}>
                <header className={styles.header}>
                    <button onClick={() => setShowSupercharge(false)} className={styles.backBtn}>
                        <ArrowLeft size={18} /> Back
                    </button>
                    <span className={styles.lessonInfo} style={{ color: 'var(--badge-supercharge)' }}>SUPERCHARGE BONUS</span>
                    <div className={styles.stats}>
                        <div className={`${styles.statBadge} ${styles.xp}`}>
                            <Zap size={14} fill="currentColor" /> {user.progress.xp}
                        </div>
                    </div>
                </header>

                <div className={styles.content}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={styles.lessonTitle}
                    >
                        <motion.div
                            className={styles.lessonEmoji}
                            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ background: 'linear-gradient(135deg, rgba(241, 250, 140, 0.3), rgba(255, 184, 108, 0.3))' }}
                        >
                            <Zap size={40} style={{ color: 'var(--badge-supercharge)' }} />
                        </motion.div>
                        <div className={styles.lessonTitleText}>
                            <h1 style={{ color: 'var(--badge-supercharge)' }}>SUPERCHARGE Challenge</h1>
                            <p>Build a Mini Calculator for +25 XP!</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={styles.explainBox}
                        style={{ background: 'linear-gradient(135deg, rgba(241, 250, 140, 0.15), rgba(255, 184, 108, 0.15))', borderColor: 'rgba(241, 250, 140, 0.3)' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <Award size={28} style={{ color: 'var(--badge-supercharge)' }} />
                            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Build a Mini Calculator!</span>
                        </div>
                        <p>
                            Create TWO functions for a calculator:
                        </p>
                        <ul style={{ marginTop: '0.75rem', paddingLeft: '1.25rem' }}>
                            <li><code>add(a, b)</code> - returns a + b</li>
                            <li><code>subtract(a, b)</code> - returns a - b</li>
                        </ul>
                        <p style={{ marginTop: '0.75rem' }}>
                            Test them both and print the results!
                        </p>
                    </motion.div>

                    <div className={styles.codeSection}>
                        <h3>Your Mini Calculator</h3>
                        <div className={styles.editor}>
                            <div className={styles.codeHeader}>
                                <span>calculator.py</span>
                                <span>Python</span>
                            </div>
                            <textarea
                                value={superchargeCode}
                                onChange={(e) => setSuperchargeCode(e.target.value)}
                                spellCheck={false}
                                style={{ minHeight: '250px' }}
                            />
                        </div>
                        <button className={styles.runBtn} onClick={runSuperchargeCode}>
                            <Play size={18} /> Run Calculator
                        </button>

                        {superchargeOutput && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={styles.outputBox}
                            >
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>{superchargeOutput}</div>
                            </motion.div>
                        )}
                    </div>

                    {superchargeComplete && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                background: 'linear-gradient(135deg, rgba(241, 250, 140, 0.2), rgba(80, 250, 123, 0.2))',
                                border: '1px solid rgba(241, 250, 140, 0.5)',
                                borderRadius: '0.75rem',
                                padding: '1.5rem',
                                textAlign: 'center',
                                marginTop: '1.5rem'
                            }}
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                style={{ fontSize: '3rem', marginBottom: '0.5rem' }}
                            >
                                🏆
                            </motion.div>
                            <h3 style={{ color: 'var(--badge-supercharge)', marginBottom: '0.5rem' }}>Calculator Complete!</h3>
                            <p style={{ marginBottom: '1rem' }}>You built a working calculator with add and subtract!</p>
                            <button
                                onClick={claimSuperchargeBonus}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.875rem 2rem',
                                    background: 'linear-gradient(135deg, var(--badge-supercharge), #FFD93D)',
                                    color: '#1E1E2E',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    fontSize: '1rem'
                                }}
                            >
                                <Zap size={18} /> Claim +25 XP Bonus!
                            </button>
                        </motion.div>
                    )}

                    <div className={styles.navBar}>
                        <button onClick={() => setShowSupercharge(false)} className={`${styles.navBtn} ${styles.secondary}`}>
                            <ChevronLeft size={18} /> Skip Bonus
                        </button>
                        <Link href="/level4/lesson7" className={`${styles.navBtn} ${styles.primary}`}>
                            Next Lesson <ChevronRight size={18} />
                        </Link>
                    </div>
                </div>
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
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 13 - Practice</span>
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
                                style={{ background: 'linear-gradient(135deg, rgba(255, 184, 108, 0.2), rgba(255, 121, 198, 0.2))' }}
                            >
                                {LESSON.emoji}
                            </motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p style={{ color: 'var(--badge-practice)' }}>PRACTICE MODE</p>
                            </div>
                        </div>

                        {/* Mission */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{ background: 'linear-gradient(135deg, rgba(255, 184, 108, 0.15), rgba(255, 121, 198, 0.15))' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Target size={28} style={{ color: 'var(--badge-practice)' }} />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Practice Time!</span>
                            </div>
                            <p>
                                Time to practice everything you've learned about functions! Complete all 4 challenges to unlock the quiz.
                            </p>
                        </motion.div>

                        {/* Progress Tracker */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            marginBottom: '2rem'
                        }}>
                            {[0, 1, 2, 3].map((idx) => (
                                <motion.div
                                    key={idx}
                                    animate={idx === currentChallenge ? { scale: [1, 1.1, 1] } : {}}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: challengesCompleted[idx]
                                            ? 'var(--success)'
                                            : idx === currentChallenge
                                            ? 'var(--accent-primary)'
                                            : 'var(--bg-card)',
                                        border: `2px solid ${challengesCompleted[idx] ? 'var(--success)' : idx === currentChallenge ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                                        color: challengesCompleted[idx] || idx === currentChallenge ? '#1E1E2E' : 'var(--text-secondary)',
                                        fontWeight: 700
                                    }}
                                >
                                    {challengesCompleted[idx] ? <Check size={18} /> : idx + 1}
                                </motion.div>
                            ))}
                        </div>

                        {/* Current Challenge */}
                        <div className={styles.codeSection}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Star size={18} style={{ color: 'var(--xp-coins)' }} />
                                {challenges[currentChallenge].title}
                            </h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                {challenges[currentChallenge].description}
                            </p>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}>
                                    <span>challenge_{currentChallenge + 1}.py</span>
                                    <span>Python</span>
                                </div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
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
                                    <div className={styles.outputLabel}>Output:</div>
                                    <div className={styles.outputText}>{output}</div>
                                </motion.div>
                            )}

                            {challengesCompleted[currentChallenge] && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{
                                        background: 'rgba(80, 250, 123, 0.1)',
                                        border: '1px solid rgba(80, 250, 123, 0.3)',
                                        borderRadius: '0.5rem',
                                        padding: '1rem',
                                        marginTop: '1rem',
                                        textAlign: 'center'
                                    }}
                                >
                                    <Check size={24} style={{ color: 'var(--success)', marginBottom: '0.5rem' }} />
                                    <p style={{ color: 'var(--success)', fontWeight: 600 }}>Challenge Complete!</p>
                                </motion.div>
                            )}
                        </div>

                        {/* Tip Box */}
                        <div className={styles.tipBox}>
                            <Lightbulb size={20} style={{ color: 'var(--xp-coins)', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Need Help?</p>
                                <p style={{ fontSize: '0.9rem' }}>
                                    Remember: <code>def</code> creates functions, parentheses hold parameters, and <code>return</code> sends back values!
                                </p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className={styles.navBar}>
                            {currentChallenge > 0 ? (
                                <button
                                    onClick={() => {
                                        const prev = currentChallenge - 1;
                                        setCurrentChallenge(prev);
                                        setCode(challenges[prev].starterCode);
                                        setOutput('');
                                    }}
                                    className={`${styles.navBtn} ${styles.secondary}`}
                                >
                                    <ChevronLeft size={18} /> Previous
                                </button>
                            ) : (
                                <Link href="/level4/lesson5" className={`${styles.navBtn} ${styles.secondary}`}>
                                    <ChevronLeft size={18} /> Back
                                </Link>
                            )}

                            {challengesCompleted[currentChallenge] && currentChallenge < 3 ? (
                                <button onClick={nextChallenge} className={`${styles.navBtn} ${styles.primary}`}>
                                    Next Challenge <ChevronRight size={18} />
                                </button>
                            ) : challengesCompleted.every(c => c) ? (
                                <button onClick={() => setShowQuiz(true)} className={`${styles.navBtn} ${styles.primary}`}>
                                    Take Quiz! <ChevronRight size={18} />
                                </button>
                            ) : (
                                <button disabled className={`${styles.navBtn} ${styles.primary}`} style={{ opacity: 0.5 }}>
                                    Complete Challenge <ChevronRight size={18} />
                                </button>
                            )}
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
                        <h2 className={styles.quizTitle}>Practice Quiz! (Question {currentQuiz + 1}/3)</h2>

                        {currentQuiz === 0 ? (
                            <>
                                <p className={styles.quizQuestion}>
                                    What keyword creates a function in Python?
                                </p>
                                <div className={styles.quizOptions}>
                                    {['A) def', 'B) func', 'C) create'].map((option, idx) => (
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
                                    {['A) send', 'B) return', 'C) give'].map((option, idx) => (
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
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>
                                    How do you separate multiple parameters?
                                </p>
                                <div className={styles.quizOptions}>
                                    {['A) Spaces', 'B) Plus signs', 'C) Commas'].map((option, idx) => (
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
                                                } ${quizChecked[2] && idx === 2 ? styles.correct : ''
                                                } ${quizChecked[2] && quizAnswers[2] === idx && idx !== 2 ? styles.wrong : ''
                                                }`}
                                            disabled={quizChecked[2]}
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
                        ) : quizAnswers[currentQuiz] !== (currentQuiz === 0 ? 0 : currentQuiz === 1 ? 1 : 2) ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.quizFeedback} ${styles.error}`}
                            >
                                <h4>Not quite!</h4>
                                <p>
                                    {currentQuiz === 0
                                        ? 'The "def" keyword defines (creates) a function in Python!'
                                        : currentQuiz === 1
                                        ? 'The "return" keyword sends a value back from a function.'
                                        : 'We use commas to separate multiple parameters in a function!'
                                    }
                                </p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem' }}>
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
