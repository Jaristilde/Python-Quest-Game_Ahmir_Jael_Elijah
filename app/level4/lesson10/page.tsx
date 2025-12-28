'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, List, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL4_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL4_LESSONS[9]; // Lesson 10 (0-indexed)
const LESSON_ID = 59;

export default function Lesson10() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('# Create a function that works with a list!\n');
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
                    functionBody.push(trimmed);
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

                let returnValue: any = undefined;

                for (const line of func.body) {
                    // Return statement with len()
                    const returnLenMatch = line.match(/^return\s+len\s*\(\s*(\w+)\s*\)$/);
                    if (returnLenMatch) {
                        const varName = returnLenMatch[1];
                        if (Array.isArray(localVars[varName])) {
                            returnValue = localVars[varName].length;
                        }
                        break;
                    }

                    // Return statement with variable
                    const returnVarMatch = line.match(/^return\s+(\w+)$/);
                    if (returnVarMatch) {
                        returnValue = localVars[returnVarMatch[1]];
                        break;
                    }

                    // Append to list
                    const appendMatch = line.match(/^(\w+)\.append\s*\(\s*(\w+)\s*\)$/);
                    if (appendMatch) {
                        const listName = appendMatch[1];
                        const itemName = appendMatch[2];
                        if (Array.isArray(localVars[listName])) {
                            localVars[listName].push(localVars[itemName]);
                        }
                        continue;
                    }

                    // Print item from list
                    const printItemMatch = line.match(/^print\s*\(\s*(\w+)\s*\)$/);
                    if (printItemMatch) {
                        const varName = printItemMatch[1];
                        if (localVars[varName] !== undefined) {
                            outputLines.push(String(localVars[varName]));
                        }
                        continue;
                    }

                    // For loop over list
                    const forMatch = line.match(/^for\s+(\w+)\s+in\s+(\w+)\s*:/);
                    if (forMatch) {
                        const loopVar = forMatch[1];
                        const listVar = forMatch[2];
                        if (Array.isArray(localVars[listVar])) {
                            // Find the next indented lines (loop body)
                            const loopBodyStart = func.body.indexOf(line) + 1;
                            const loopBody: string[] = [];
                            for (let j = loopBodyStart; j < func.body.length; j++) {
                                // In our simplified model, assume next lines with print are loop body
                                if (func.body[j].startsWith('print')) {
                                    loopBody.push(func.body[j]);
                                } else {
                                    break;
                                }
                            }

                            for (const item of localVars[listVar]) {
                                localVars[loopVar] = item;
                                for (const bodyLine of loopBody) {
                                    const printMatch2 = bodyLine.match(/^print\s*\(\s*(\w+)\s*\)$/);
                                    if (printMatch2 && localVars[printMatch2[1]] !== undefined) {
                                        outputLines.push(String(localVars[printMatch2[1]]));
                                    }
                                }
                            }
                        }
                        continue;
                    }
                }

                // Update original list if it was modified
                func.params.forEach((param, idx) => {
                    if (Array.isArray(args[idx]) && Array.isArray(localVars[param])) {
                        args[idx].length = 0;
                        args[idx].push(...localVars[param]);
                    }
                });

                return returnValue;
            };

            // Second pass: execute code
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();

                if (!trimmed || trimmed.startsWith('#')) continue;
                if (trimmed.startsWith('def ')) continue;
                if (line.startsWith('    ') || line.startsWith('\t')) continue;

                // List assignment
                const listMatch = trimmed.match(/^(\w+)\s*=\s*\[(.*)\]$/);
                if (listMatch) {
                    const varName = listMatch[1];
                    const content = listMatch[2].trim();
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

                // Function call with assignment: result = func(args)
                const funcCallAssignMatch = trimmed.match(/^(\w+)\s*=\s*(\w+)\s*\(\s*([^)]*)\s*\)$/);
                if (funcCallAssignMatch) {
                    const resultVar = funcCallAssignMatch[1];
                    const funcName = funcCallAssignMatch[2];
                    const argsStr = funcCallAssignMatch[3];

                    const args = argsStr.split(',').map(a => {
                        const arg = a.trim();
                        if (variables[arg] !== undefined) return variables[arg];
                        if (arg.startsWith('"') || arg.startsWith("'")) return arg.slice(1, -1);
                        if (!isNaN(Number(arg))) return Number(arg);
                        return arg;
                    }).filter(a => a !== '');

                    const result = executeFunction(funcName, args);
                    if (result !== undefined) {
                        variables[resultVar] = result;
                    }
                    continue;
                }

                // Function call without assignment
                const funcCallMatch = trimmed.match(/^(\w+)\s*\(\s*([^)]*)\s*\)$/);
                if (funcCallMatch) {
                    const funcName = funcCallMatch[1];
                    const argsStr = funcCallMatch[2];

                    if (funcName === 'print') {
                        // Handle print statements
                        const arg = argsStr.trim();

                        // Print function call: print(func(args))
                        const printFuncMatch = arg.match(/^(\w+)\s*\(\s*(\w+)\s*\)$/);
                        if (printFuncMatch) {
                            const innerFunc = printFuncMatch[1];
                            const innerArg = printFuncMatch[2];

                            if (innerFunc === 'len' && Array.isArray(variables[innerArg])) {
                                outputLines.push(String(variables[innerArg].length));
                            } else if (functions[innerFunc]) {
                                const result = executeFunction(innerFunc, [variables[innerArg]]);
                                if (result !== undefined) {
                                    outputLines.push(String(result));
                                }
                            }
                            continue;
                        }

                        // Print variable
                        if (variables[arg] !== undefined) {
                            if (Array.isArray(variables[arg])) {
                                const formatted = '[' + variables[arg].map((item: any) =>
                                    typeof item === 'string' ? `'${item}'` : item
                                ).join(', ') + ']';
                                outputLines.push(formatted);
                            } else {
                                outputLines.push(String(variables[arg]));
                            }
                            continue;
                        }

                        // Print string
                        const strMatch = arg.match(/^["'](.*)["']$/);
                        if (strMatch) {
                            outputLines.push(strMatch[1]);
                            continue;
                        }

                        // Print f-string
                        const fstringMatch = arg.match(/^f["'](.*)["']$/);
                        if (fstringMatch) {
                            let result = fstringMatch[1];
                            result = result.replace(/\{([^}]+)\}/g, (_, expr) => {
                                if (variables[expr] !== undefined) {
                                    if (Array.isArray(variables[expr])) {
                                        return '[' + variables[expr].join(', ') + ']';
                                    }
                                    return String(variables[expr]);
                                }
                                return expr;
                            });
                            outputLines.push(result);
                            continue;
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
                    continue;
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
                    List Master!
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={styles.successMessage}
                >
                    {LESSON.successMessage} Your functions can now work with entire lists of data!
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
                    <Link href="/level4/lesson11" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'var(--accent-primary)' }}>
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
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
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
                            style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))', borderColor: 'var(--accent-primary)' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <List size={28} style={{ color: 'var(--accent-primary)' }} />
                                <Package size={24} style={{ color: 'var(--accent-secondary)' }} />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Mission: Functions Can Work with LISTS!</span>
                            </div>

                            <p style={{ fontSize: '1.1rem' }}>
                                Imagine your robot chef at Pizza Palace has a WHOLE LIST of toppings to work with!
                                You can pass an entire list to a function and do cool things with ALL the items at once!
                            </p>
                        </motion.div>

                        {/* Main Explanation */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Lightbulb size={20} style={{ color: 'var(--accent-primary)' }} /> Passing Lists to Functions
                            </h3>
                            <p>
                                Just like you can pass a number or string to a function, you can pass a <strong>whole list</strong>!
                                The function can then count items, add items, or loop through them all!
                            </p>

                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem' }}>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Why is this useful?</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                                    <li>Process many items at once</li>
                                    <li>Count how many items are in a list</li>
                                    <li>Add new items to a list</li>
                                    <li>Print all items in a list</li>
                                </ul>
                            </div>
                        </div>

                        {/* Example Code */}
                        <div className={styles.codeSection}>
                            <h3>Example: Working with Pizza Toppings</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}>
                                    <span>pizza_toppings.py</span>
                                    <span>Python</span>
                                </div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># Function that counts list items</span>{'\n'}
                                    <span className={styles.keyword}>def</span> <span style={{ color: '#8be9fd' }}>count_items</span>(my_list):{'\n'}
                                    {'    '}<span className={styles.keyword}>return</span> len(my_list){'\n\n'}
                                    <span className={styles.comment}># Function that adds an item to list</span>{'\n'}
                                    <span className={styles.keyword}>def</span> <span style={{ color: '#8be9fd' }}>add_item</span>(my_list, new_item):{'\n'}
                                    {'    '}my_list.append(new_item){'\n'}
                                    {'    '}<span className={styles.keyword}>return</span> my_list{'\n\n'}
                                    <span className={styles.comment}># Create a list of toppings</span>{'\n'}
                                    toppings = [<span className={styles.string}>"pepperoni"</span>, <span className={styles.string}>"mushrooms"</span>]{'\n\n'}
                                    <span className={styles.comment}># Use our functions!</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(count_items(toppings))  <span className={styles.comment}># Prints: 2</span>
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>2</div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3>Your Turn - Create a Function That Prints All Items!</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                Create a function called <code>print_all</code> that takes a list and prints each item.
                                Use a <code>for</code> loop inside your function!
                            </p>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}>
                                    <span>your_code.py</span>
                                    <span>Python</span>
                                </div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder={`def print_all(items):
    for item in items:
        print(item)

fruits = ["apple", "banana", "cherry"]
print_all(fruits)`}
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
                                    Create a function using <code>def</code>
                                </li>
                                <li style={{ color: 'var(--text-muted)', paddingLeft: '2.5rem' }}>
                                    Try making a function that counts items in a list
                                </li>
                                <li style={{ color: 'var(--text-muted)', paddingLeft: '2.5rem' }}>
                                    Try making a function that prints all items
                                </li>
                            </ul>
                        </div>

                        {/* Tip Box */}
                        <div className={styles.tipBox} style={{ background: 'rgba(251, 191, 36, 0.1)', borderColor: 'rgba(251, 191, 36, 0.3)' }}>
                            <Lightbulb size={20} style={{ color: '#fbbf24', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Remember:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li>Lists can be passed to functions just like numbers or strings</li>
                                    <li>Use <code>len(my_list)</code> to count items</li>
                                    <li>Use <code>my_list.append(item)</code> to add items</li>
                                    <li>Use <code>for item in my_list:</code> to loop through items</li>
                                </ul>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className={styles.navBar}>
                            <Link href="/level4/lesson9" className={`${styles.navBtn} ${styles.secondary}`}>
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
                        style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(168, 85, 247, 0.1))' }}
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
                            Can you pass a list to a function in Python?
                        </p>
                        <div className={styles.quizOptions}>
                            {[
                                'A) No, functions only accept numbers',
                                'B) Yes, you can pass any list to a function!'
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
                                    Functions can accept ANY type of data - numbers, strings, AND lists!
                                    This makes functions super powerful for working with collections of data.
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
                                <p>Yes! Functions can work with lists, making them great for processing lots of data at once!</p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
