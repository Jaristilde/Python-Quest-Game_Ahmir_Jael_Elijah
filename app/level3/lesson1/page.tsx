'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Bot, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL3_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL3_LESSONS[0]; // Lesson 1
const LESSON_ID = 34; // Level 3 lessons start at 34 for tracking

export default function Lesson1() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('# Create your own list below!\n');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasCreatedList, setHasCreatedList] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            let variables: Record<string, string[] | string | number> = {};

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) continue;

                // List assignment: variable = ["item1", "item2", ...]
                const listMatch = trimmed.match(/^(\w+)\s*=\s*\[(.*)\]$/);
                if (listMatch) {
                    const [, varName, items] = listMatch;
                    // Parse list items - handle both strings and numbers
                    const itemList = items.split(',').map(item => {
                        const trimmedItem = item.trim();
                        // Check if it's a string (quoted)
                        const stringMatch = trimmedItem.match(/^["'](.*)["']$/);
                        if (stringMatch) {
                            return stringMatch[1];
                        }
                        // Check if it's a number
                        if (!isNaN(Number(trimmedItem)) && trimmedItem !== '') {
                            return trimmedItem;
                        }
                        return trimmedItem;
                    }).filter(item => item !== '');
                    variables[varName] = itemList;

                    // Check if they created a list with square brackets
                    if (items.length >= 0) {
                        setHasCreatedList(true);
                    }
                    continue;
                }

                // Empty list: variable = []
                const emptyListMatch = trimmed.match(/^(\w+)\s*=\s*\[\s*\]$/);
                if (emptyListMatch) {
                    const [, varName] = emptyListMatch;
                    variables[varName] = [];
                    setHasCreatedList(true);
                    continue;
                }

                // Print statement with variable
                const printVarMatch = trimmed.match(/^print\s*\((\w+)\)$/);
                if (printVarMatch) {
                    const varName = printVarMatch[1];
                    if (variables[varName] !== undefined) {
                        if (Array.isArray(variables[varName])) {
                            // Format list output like Python
                            const list = variables[varName] as string[];
                            const formattedList = '[' + list.map(item => {
                                // Check if it's a number
                                if (!isNaN(Number(item))) {
                                    return item;
                                }
                                return `'${item}'`;
                            }).join(', ') + ']';
                            outputLines.push(formattedList);
                        } else {
                            outputLines.push(String(variables[varName]));
                        }
                    }
                    continue;
                }

                // Print statement with string
                const printStringMatch = trimmed.match(/^print\s*\(["'](.*)["']\)$/);
                if (printStringMatch) {
                    outputLines.push(printStringMatch[1]);
                    continue;
                }

                // Print with f-string or concatenation (simplified)
                const printFMatch = trimmed.match(/^print\s*\(f["'](.*)["']\)$/);
                if (printFMatch) {
                    let text = printFMatch[1];
                    // Replace {variable} with actual values
                    text = text.replace(/\{(\w+)\}/g, (match, varName) => {
                        if (variables[varName] !== undefined) {
                            if (Array.isArray(variables[varName])) {
                                return (variables[varName] as string[]).join(', ');
                            }
                            return String(variables[varName]);
                        }
                        return match;
                    });
                    outputLines.push(text);
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

        // Correct answers: Q1 = 1 (square brackets), Q2 = 2 (commas)
        const correctAnswers = [1, 2];

        if (quizAnswers[currentQuiz] === correctAnswers[currentQuiz]) {
            if (currentQuiz === 0) {
                // Move to next question
                setTimeout(() => {
                    setCurrentQuiz(1);
                }, 1000);
            } else {
                // Both questions correct - complete lesson
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
                    List Creator Unlocked!
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={styles.successMessage}
                >
                    {LESSON.successMessage} You learned how to store multiple items in one place!
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
                    <Link href="/level3/lesson2" className={`${styles.navBtn} ${styles.primary}`}>
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
                <Link href="/level3" className={styles.backBtn}>
                    <ArrowLeft size={18} /> Back
                </Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 16</span>
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

                        {/* Story Introduction - Robot Packing for Adventure */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(59, 130, 246, 0.15))' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Bot size={28} className="text-green-400" />
                                <Package size={24} className="text-blue-400" />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Mission: Pack Your Backpack!</span>
                            </div>

                            {/* Robot Holding Box Animation */}
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
                                    animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{
                                        fontSize: '2rem',
                                        background: 'rgba(59, 130, 246, 0.3)',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.5rem',
                                        border: '2px dashed rgba(59, 130, 246, 0.5)',
                                        display: 'flex',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <motion.span animate={{ y: [0, -2, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}>
                                        🧴
                                    </motion.span>
                                    <motion.span animate={{ y: [0, -2, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}>
                                        🥪
                                    </motion.span>
                                    <motion.span animate={{ y: [0, -2, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}>
                                        🗺️
                                    </motion.span>
                                    <motion.span animate={{ y: [0, -2, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.3 }}>
                                        🔦
                                    </motion.span>
                                </motion.div>
                            </div>

                            <p>
                                🎒 You're going on an adventure! You need to bring a water bottle, a sandwich, a map, and a flashlight.
                                Instead of making 4 separate variables, you can put them all in one <strong>LIST</strong>!
                            </p>
                        </motion.div>

                        {/* Main Explanation */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Lightbulb size={20} className="text-amber-400" /> What is a List?
                            </h3>
                            <p>
                                A <strong>list</strong> is like a container or box that can hold multiple items.
                                Think of it like your backpack - it can hold many different things all in one place!
                            </p>

                            <div style={{ marginTop: '1.5rem' }}>
                                <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>The Magic Symbols:</p>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.2rem' }}>📦</span>
                                        <span><code style={{ color: '#60a5fa' }}>[ ]</code> = Square brackets create a list - they're like a box to hold things!</span>
                                    </li>
                                    <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.2rem' }}>✨</span>
                                        <span><code style={{ color: '#f472b6' }}>,</code> = Commas separate each item, like spaces between things in your backpack</span>
                                    </li>
                                    <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.2rem' }}>💾</span>
                                        <span><code style={{ color: '#a78bfa' }}>=</code> = Equals sign stores the list in a variable</span>
                                    </li>
                                </ul>
                            </div>

                            <div style={{
                                marginTop: '1.5rem',
                                padding: '1rem',
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Lists can hold:</p>
                                <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', margin: 0 }}>
                                    <li>Strings (text): <code>["apple", "banana", "cherry"]</code></li>
                                    <li>Numbers: <code>[1, 2, 3, 4, 5]</code></li>
                                    <li>Mixed items: <code>["Robo", 100, "coins"]</code></li>
                                    <li>Even an empty list: <code>items = []</code></li>
                                </ul>
                            </div>
                        </div>

                        {/* Example Code */}
                        <div className={styles.codeSection}>
                            <h3>Example: Packing Your Backpack</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}>
                                    <span>main.py</span>
                                    <span>Python</span>
                                </div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># Pack your backpack!</span>{'\n'}
                                    <span className={styles.variable}>backpack</span> = [<span className={styles.string}>"water bottle"</span>, <span className={styles.string}>"sandwich"</span>, <span className={styles.string}>"map"</span>, <span className={styles.string}>"flashlight"</span>]{'\n\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"My backpack contains:"</span>){'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.variable}>backpack</span>){'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"Ready for adventure!"</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>
                                    My backpack contains:{'\n'}
                                    ['water bottle', 'sandwich', 'map', 'flashlight']{'\n'}
                                    Ready for adventure!
                                </div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3>Your Turn - Create Your Own List!</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                Try creating your own list! Add your favorite items to the backpack, or create a completely new list with different items.
                            </p>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}>
                                    <span>your_code.py</span>
                                    <span>Python</span>
                                </div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder='# Create your list here!
backpack = ["water bottle", "sandwich", "map", "flashlight"]

print("My backpack contains:")
print(backpack)
print("Ready for adventure!")'
                                    spellCheck={false}
                                    style={{ minHeight: '160px' }}
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
                            <h3>Try These Challenges:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasCreatedList ? styles.done : ''}`}>
                                        {hasCreatedList && <Check size={14} />}
                                    </div>
                                    Create a list using square brackets <code>[ ]</code>
                                </li>
                                <li style={{ color: 'var(--text-muted)', paddingLeft: '2.5rem' }}>
                                    Try making a list of your favorite foods, games, or friends!
                                </li>
                                <li style={{ color: 'var(--text-muted)', paddingLeft: '2.5rem' }}>
                                    Try creating a list of numbers like <code>[10, 20, 30]</code>
                                </li>
                            </ul>
                        </div>

                        {/* Tip Box */}
                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Remember:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li>Use <code>[ ]</code> square brackets to create a list</li>
                                    <li>Put <code>,</code> commas between each item</li>
                                    <li>Put strings in quotes: <code>"like this"</code></li>
                                    <li>Numbers don't need quotes: <code>[1, 2, 3]</code></li>
                                </ul>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className={styles.navBar}>
                            <Link href="/level3" className={`${styles.navBtn} ${styles.secondary}`}>
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
                        <h2 className={styles.quizTitle}>Brain Check! (Question {currentQuiz + 1}/2)</h2>

                        {currentQuiz === 0 ? (
                            <>
                                <p className={styles.quizQuestion}>
                                    What symbols create a list in Python?
                                </p>
                                <div className={styles.quizOptions}>
                                    {[
                                        '{ } curly braces',
                                        '[ ] square brackets',
                                        '( ) parentheses'
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
                                            <code>{option}</code>
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>
                                    What goes between items in a list?
                                </p>
                                <div className={styles.quizOptions}>
                                    {[
                                        'Spaces',
                                        'Periods',
                                        'Commas'
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
                        )}

                        {!quizChecked[currentQuiz] ? (
                            <button
                                className={styles.quizBtn}
                                onClick={checkQuiz}
                                disabled={quizAnswers[currentQuiz] === null}
                            >
                                Check Answer
                            </button>
                        ) : quizAnswers[currentQuiz] !== (currentQuiz === 0 ? 1 : 2) ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.quizFeedback} ${styles.error}`}
                            >
                                <h4>Not quite!</h4>
                                <p>
                                    {currentQuiz === 0
                                        ? 'In Python, we use square brackets [ ] to create lists. Think of them like a box that holds your items!'
                                        : 'We use commas to separate items in a list. Just like how you put spaces between things in your backpack!'
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
                                <p>Square brackets [ ] create lists in Python! Moving to the next question...</p>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
