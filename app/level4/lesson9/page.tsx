'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, GitBranch } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL4_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL4_LESSONS[8]; // Lesson 9 (index 8)
const LESSON_ID = 58; // Level 4 lessons 50-62, lesson 9 = 58

export default function Lesson9() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# Functions can make decisions with if/else!

def check_age(age):
    if age >= 13:
        return "You can play this game!"
    else:
        return "Sorry, you're too young."

# Test the function with different ages
result1 = check_age(15)
print(result1)

result2 = check_age(10)
print(result2)
`);
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizChecked, setQuizChecked] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasCreatedIfFunction, setHasCreatedIfFunction] = useState(false);

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

            // First pass: collect functions
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();

                if (!trimmed || trimmed.startsWith('#')) continue;

                const funcMatch = trimmed.match(/^def\s+(\w+)\s*\((.*)\)\s*:/);
                if (funcMatch) {
                    if (inFunction && currentFuncName) {
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
                        currentFuncBody.push(line); // Keep original indentation for if/else
                    } else if (trimmed && lineIndent <= baseIndent) {
                        functions[currentFuncName] = { params: currentFuncParams, body: currentFuncBody };
                        inFunction = false;
                    }
                }
            }

            if (inFunction && currentFuncName) {
                functions[currentFuncName] = { params: currentFuncParams, body: currentFuncBody };
            }

            // Check if user created a function with if
            const codeHasIfFunction = code.includes('def ') && code.includes('if ') && code.includes('return');
            if (codeHasIfFunction) {
                setHasCreatedIfFunction(true);
            }

            // Execute function with if/else support
            const executeFunction = (funcName: string, args: (string | number)[]): string | number | undefined => {
                const func = functions[funcName];
                if (!func) return undefined;

                const localVars: Record<string, string | number> = {};
                func.params.forEach((param, idx) => {
                    localVars[param] = args[idx];
                });

                let returnValue: string | number | undefined = undefined;
                let inIfBlock = false;
                let inElseBlock = false;
                let inElifBlock = false;
                let conditionMet = false;
                let ifIndent = 0;

                for (let i = 0; i < func.body.length; i++) {
                    const line = func.body[i];
                    const trimmed = line.trim();
                    const lineIndent = line.search(/\S/);

                    if (!trimmed || trimmed.startsWith('#')) continue;

                    // Check for if statement
                    const ifMatch = trimmed.match(/^if\s+(.+)\s*:/);
                    if (ifMatch) {
                        const condition = ifMatch[1];
                        inIfBlock = true;
                        inElseBlock = false;
                        inElifBlock = false;
                        ifIndent = lineIndent;

                        // Evaluate condition
                        let evalCondition = condition;
                        evalCondition = evalCondition.replace(/\b(\w+)\b/g, (match, word) => {
                            if (localVars[word] !== undefined) return String(localVars[word]);
                            if (globalVars[word] !== undefined) return String(globalVars[word]);
                            return word;
                        });

                        try {
                            conditionMet = Function(`"use strict"; return (${evalCondition})`)();
                        } catch {
                            conditionMet = false;
                        }
                        continue;
                    }

                    // Check for elif statement
                    const elifMatch = trimmed.match(/^elif\s+(.+)\s*:/);
                    if (elifMatch) {
                        if (!conditionMet) {
                            const condition = elifMatch[1];
                            inIfBlock = false;
                            inElifBlock = true;
                            inElseBlock = false;

                            let evalCondition = condition;
                            evalCondition = evalCondition.replace(/\b(\w+)\b/g, (match, word) => {
                                if (localVars[word] !== undefined) return String(localVars[word]);
                                if (globalVars[word] !== undefined) return String(globalVars[word]);
                                return word;
                            });

                            try {
                                conditionMet = Function(`"use strict"; return (${evalCondition})`)();
                            } catch {
                                conditionMet = false;
                            }
                        } else {
                            inElifBlock = false;
                            inIfBlock = false;
                        }
                        continue;
                    }

                    // Check for else statement
                    if (trimmed === 'else:') {
                        inElseBlock = !conditionMet;
                        inIfBlock = false;
                        inElifBlock = false;
                        continue;
                    }

                    // Process code inside if/elif/else blocks
                    if (lineIndent > ifIndent) {
                        const shouldExecute = (inIfBlock && conditionMet) ||
                            (inElifBlock && conditionMet) ||
                            (inElseBlock);

                        if (shouldExecute) {
                            // Return statement
                            const returnMatch = trimmed.match(/^return\s+(.+)$/);
                            if (returnMatch) {
                                let expr = returnMatch[1].trim();

                                // String literal
                                const strMatch = expr.match(/^["'](.*)["']$/);
                                if (strMatch) {
                                    returnValue = strMatch[1];
                                    return returnValue;
                                }

                                // f-string
                                const fMatch = expr.match(/^f["'](.*)["']$/);
                                if (fMatch) {
                                    let text = fMatch[1];
                                    text = text.replace(/\{(\w+)\}/g, (m, varName) => {
                                        if (localVars[varName] !== undefined) return String(localVars[varName]);
                                        if (globalVars[varName] !== undefined) return String(globalVars[varName]);
                                        return m;
                                    });
                                    returnValue = text;
                                    return returnValue;
                                }

                                // Variable or expression
                                expr = expr.replace(/\b(\w+)\b/g, (match, word) => {
                                    if (localVars[word] !== undefined) return String(localVars[word]);
                                    if (globalVars[word] !== undefined) return String(globalVars[word]);
                                    return word;
                                });

                                try {
                                    returnValue = Function(`"use strict"; return (${expr})`)();
                                } catch {
                                    returnValue = expr.replace(/['"]/g, '');
                                }
                                return returnValue;
                            }

                            // Print statement
                            const printMatch = trimmed.match(/^print\s*\((.+)\)$/);
                            if (printMatch) {
                                let content = printMatch[1].trim();
                                const strM = content.match(/^["'](.*)["']$/);
                                if (strM) {
                                    outputLines.push(strM[1]);
                                } else if (localVars[content] !== undefined) {
                                    outputLines.push(String(localVars[content]));
                                } else if (globalVars[content] !== undefined) {
                                    outputLines.push(String(globalVars[content]));
                                }
                            }

                            // Variable assignment
                            const varMatch = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
                            if (varMatch) {
                                let expr = varMatch[2];
                                const strM = expr.match(/^["'](.*)["']$/);
                                if (strM) {
                                    localVars[varMatch[1]] = strM[1];
                                } else {
                                    expr = expr.replace(/\b(\w+)\b/g, (match, word) => {
                                        if (localVars[word] !== undefined) return String(localVars[word]);
                                        if (globalVars[word] !== undefined) return String(globalVars[word]);
                                        return word;
                                    });
                                    try {
                                        localVars[varMatch[1]] = Function(`"use strict"; return (${expr})`)();
                                    } catch {
                                        localVars[varMatch[1]] = expr;
                                    }
                                }
                            }
                        }
                    } else {
                        // Outside if/else block
                        inIfBlock = false;
                        inElseBlock = false;
                        inElifBlock = false;

                        // Return statement outside if/else
                        const returnMatch = trimmed.match(/^return\s+(.+)$/);
                        if (returnMatch) {
                            let expr = returnMatch[1].trim();
                            const strMatch = expr.match(/^["'](.*)["']$/);
                            if (strMatch) {
                                return strMatch[1];
                            }

                            expr = expr.replace(/\b(\w+)\b/g, (match, word) => {
                                if (localVars[word] !== undefined) return String(localVars[word]);
                                if (globalVars[word] !== undefined) return String(globalVars[word]);
                                return word;
                            });

                            try {
                                return Function(`"use strict"; return (${expr})`)();
                            } catch {
                                return expr.replace(/['"]/g, '');
                            }
                        }
                    }
                }

                return returnValue;
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

                // Variable assignment with function call
                const assignFuncMatch = trimmed.match(/^(\w+)\s*=\s*(\w+)\s*\((.*)\)$/);
                if (assignFuncMatch) {
                    const [, varName, funcName, argsStr] = assignFuncMatch;
                    if (functions[funcName]) {
                        const args: (string | number)[] = argsStr.split(',').map(arg => {
                            const t = arg.trim();
                            const sm = t.match(/^["'](.*)["']$/);
                            if (sm) return sm[1];
                            const n = Number(t);
                            if (!isNaN(n) && t !== '') return n;
                            if (globalVars[t] !== undefined) return globalVars[t];
                            return t;
                        }).filter(a => a !== '');
                        const result = executeFunction(funcName, args);
                        if (result !== undefined) {
                            globalVars[varName] = result;
                        }
                    }
                    continue;
                }

                // Simple variable assignment
                const simpleAssign = trimmed.match(/^(\w+)\s*=\s*["'](.*)["']$/);
                if (simpleAssign) {
                    globalVars[simpleAssign[1]] = simpleAssign[2];
                    continue;
                }

                const numAssign = trimmed.match(/^(\w+)\s*=\s*(\d+)$/);
                if (numAssign) {
                    globalVars[numAssign[1]] = parseInt(numAssign[2]);
                    continue;
                }

                // Print function call result
                const printFuncMatch = trimmed.match(/^print\s*\((\w+)\s*\((.*)\)\)$/);
                if (printFuncMatch && functions[printFuncMatch[1]]) {
                    const [, funcName, argsStr] = printFuncMatch;
                    const args: (string | number)[] = argsStr.split(',').map(arg => {
                        const t = arg.trim();
                        const sm = t.match(/^["'](.*)["']$/);
                        if (sm) return sm[1];
                        const n = Number(t);
                        if (!isNaN(n) && t !== '') return n;
                        if (globalVars[t] !== undefined) return globalVars[t];
                        return t;
                    }).filter(a => a !== '');
                    const result = executeFunction(funcName, args);
                    if (result !== undefined) {
                        outputLines.push(String(result));
                    }
                    continue;
                }

                // Print variable
                const printVarMatch = trimmed.match(/^print\s*\((\w+)\)$/);
                if (printVarMatch) {
                    const varName = printVarMatch[1];
                    if (globalVars[varName] !== undefined) {
                        outputLines.push(String(globalVars[varName]));
                    }
                    continue;
                }

                // Print string
                const printStrMatch = trimmed.match(/^print\s*\(["'](.*)["']\)$/);
                if (printStrMatch) {
                    outputLines.push(printStrMatch[1]);
                    continue;
                }

                // Print f-string
                const printFStrMatch = trimmed.match(/^print\s*\(f["'](.*)["']\)$/);
                if (printFStrMatch) {
                    let text = printFStrMatch[1];
                    text = text.replace(/\{(\w+)\}/g, (m, varName) => {
                        if (globalVars[varName] !== undefined) return String(globalVars[varName]);
                        return m;
                    });
                    outputLines.push(text);
                    continue;
                }

                // Direct function call (no assignment)
                const directFuncMatch = trimmed.match(/^(\w+)\s*\((.*)\)$/);
                if (directFuncMatch && functions[directFuncMatch[1]]) {
                    const [, funcName, argsStr] = directFuncMatch;
                    const args: (string | number)[] = argsStr.split(',').map(arg => {
                        const t = arg.trim();
                        const sm = t.match(/^["'](.*)["']$/);
                        if (sm) return sm[1];
                        const n = Number(t);
                        if (!isNaN(n) && t !== '') return n;
                        if (globalVars[t] !== undefined) return globalVars[t];
                        return t;
                    }).filter(a => a !== '');
                    executeFunction(funcName, args);
                    continue;
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
                    Decision Master!
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={styles.successMessage}
                >
                    {LESSON.successMessage} Your functions can now make smart choices!
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
                    <Link href="/level4/lesson10" className={`${styles.navBtn} ${styles.primary}`}>
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
                            style={{ background: 'linear-gradient(135deg, rgba(189, 147, 249, 0.15), rgba(255, 121, 198, 0.15))' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <GitBranch size={28} style={{ color: 'var(--badge-project)' }} />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Mission: Functions That Make Choices!</span>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '1.5rem',
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: '0.75rem',
                                marginBottom: '1rem',
                                gap: '1rem'
                            }}>
                                <motion.span
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{ fontSize: '2.5rem' }}
                                >
                                    🤖
                                </motion.span>
                                <motion.span
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    style={{ fontSize: '2rem' }}
                                >
                                    ❓
                                </motion.span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <motion.span
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        style={{ fontSize: '1.5rem' }}
                                    >
                                        ✅ Yes!
                                    </motion.span>
                                    <motion.span
                                        animate={{ x: [0, -5, 0] }}
                                        transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                                        style={{ fontSize: '1.5rem' }}
                                    >
                                        ❌ No!
                                    </motion.span>
                                </div>
                            </div>

                            <p style={{ fontSize: '1.05rem' }}>
                                Functions can make <strong>DECISIONS</strong>! By combining <code style={{ color: 'var(--accent-primary)' }}>if/else</code> with functions,
                                we can create smart helpers that give different answers based on what we ask!
                            </p>
                        </motion.div>

                        {/* Main Explanation */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Lightbulb size={20} style={{ color: 'var(--xp-coins)' }} /> How It Works
                            </h3>

                            <p style={{ marginBottom: '1rem' }}>
                                Remember <code style={{ color: 'var(--accent-primary)' }}>if/else</code> from Level 2?
                                We can use it INSIDE functions to return different values!
                            </p>

                            <div style={{
                                background: 'rgba(0,0,0,0.2)',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                marginBottom: '1rem'
                            }}>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>The Pattern:</p>
                                <ol style={{ paddingLeft: '1.5rem', margin: 0 }}>
                                    <li>Function takes a parameter (like <code>age</code> or <code>score</code>)</li>
                                    <li>Check the value with <code style={{ color: 'var(--accent-primary)' }}>if</code></li>
                                    <li>Return one thing if true, something else if false!</li>
                                </ol>
                            </div>
                        </div>

                        {/* Example 1 */}
                        <div className={styles.codeSection}>
                            <h3>Example 1: Age Checker</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}>
                                    <span>age_checker.py</span>
                                    <span>Python</span>
                                </div>
                                <div className={styles.codeContent}>
                                    <span className={styles.keyword}>def</span> <span className={styles.variable}>check_age</span>(age):{'\n'}
                                    {'    '}<span className={styles.keyword}>if</span> age {'>'}<span className={styles.number}>= 13</span>:{'\n'}
                                    {'        '}<span className={styles.keyword}>return</span> <span className={styles.string}>"You can play this game!"</span>{'\n'}
                                    {'    '}<span className={styles.keyword}>else</span>:{'\n'}
                                    {'        '}<span className={styles.keyword}>return</span> <span className={styles.string}>"Sorry, you're too young."</span>{'\n\n'}
                                    <span className={styles.comment}># Test it!</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.variable}>check_age</span>(<span className={styles.number}>15</span>))  <span className={styles.comment}># "You can play this game!"</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.variable}>check_age</span>(<span className={styles.number}>10</span>))  <span className={styles.comment}># "Sorry, you're too young."</span>
                                </div>
                            </div>
                        </div>

                        {/* Example 2 */}
                        <div className={styles.codeSection}>
                            <h3>Example 2: Grade Calculator</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}>
                                    <span>grades.py</span>
                                    <span>Python</span>
                                </div>
                                <div className={styles.codeContent}>
                                    <span className={styles.keyword}>def</span> <span className={styles.variable}>get_grade</span>(score):{'\n'}
                                    {'    '}<span className={styles.keyword}>if</span> score {'>'}<span className={styles.number}>= 90</span>:{'\n'}
                                    {'        '}<span className={styles.keyword}>return</span> <span className={styles.string}>"A"</span>{'\n'}
                                    {'    '}<span className={styles.keyword}>elif</span> score {'>'}<span className={styles.number}>= 80</span>:{'\n'}
                                    {'        '}<span className={styles.keyword}>return</span> <span className={styles.string}>"B"</span>{'\n'}
                                    {'    '}<span className={styles.keyword}>elif</span> score {'>'}<span className={styles.number}>= 70</span>:{'\n'}
                                    {'        '}<span className={styles.keyword}>return</span> <span className={styles.string}>"C"</span>{'\n'}
                                    {'    '}<span className={styles.keyword}>else</span>:{'\n'}
                                    {'        '}<span className={styles.keyword}>return</span> <span className={styles.string}>"Keep studying!"</span>
                                </div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3>Your Turn - Create a Decision Function!</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                Try the age checker below, then create your own! Ideas:
                                <code style={{ marginLeft: '0.5rem' }}>can_vote(age)</code>,
                                <code style={{ marginLeft: '0.5rem' }}>is_passing(score)</code>, or
                                <code style={{ marginLeft: '0.5rem' }}>can_drive(age)</code>
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
                            <h3>Decision Challenges:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasCreatedIfFunction ? styles.done : ''}`}>
                                        {hasCreatedIfFunction && <Check size={14} />}
                                    </div>
                                    Create a function with if/else that returns different values
                                </li>
                                <li style={{ color: 'var(--text-secondary)', paddingLeft: '2.5rem' }}>
                                    Try <code>can_vote(age)</code> - returns "Yes!" if age {'>'}= 18
                                </li>
                                <li style={{ color: 'var(--text-secondary)', paddingLeft: '2.5rem' }}>
                                    Try <code>is_passing(score)</code> - returns "Pass" if score {'>'}= 60
                                </li>
                            </ul>
                        </div>

                        {/* Tip Box */}
                        <div className={styles.tipBox}>
                            <Lightbulb size={20} style={{ color: 'var(--xp-coins)', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Remember:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li>Use <code>if</code> to check a condition</li>
                                    <li>Use <code>elif</code> to check more conditions</li>
                                    <li>Use <code>else</code> for everything else</li>
                                    <li>Each path should <code>return</code> something!</li>
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
                        <h2 className={styles.quizTitle}>Decision Check!</h2>

                        <p className={styles.quizQuestion}>
                            Can functions contain <code>if/else</code> statements?
                        </p>
                        <div className={styles.quizOptions}>
                            {[
                                'No, if/else can only be used outside functions',
                                'Yes! Functions can use if/else to return different values',
                                'Only special functions can use if/else'
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
                                    Functions can absolutely use <code>if/else</code> statements!
                                    This is one of the most powerful features - making functions that
                                    make smart decisions and return different results!
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
