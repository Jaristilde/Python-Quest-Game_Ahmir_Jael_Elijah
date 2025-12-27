'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Gamepad2, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL3_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL3_LESSONS[1]; // Lesson 2
const LESSON_ID = 35;

export default function Lesson2() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('# Try accessing items by index!\n');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasAccessedItem, setHasAccessedItem] = useState(false);
    const [hasChangedItem, setHasChangedItem] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            let variables: Record<string, string[]> = {};
            const newAccessedItem = hasAccessedItem;
            const newChangedItem = hasChangedItem;

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) continue;

                // List assignment: inventory = ["sword", "shield", "potion"]
                const listMatch = trimmed.match(/^(\w+)\s*=\s*\[(.*)\]$/);
                if (listMatch) {
                    const [, varName, items] = listMatch;
                    const itemList = items.split(',').map(item => {
                        const match = item.trim().match(/^["'](.*)["']$/);
                        return match ? match[1] : item.trim();
                    }).filter(item => item.length > 0);
                    variables[varName] = itemList;
                    continue;
                }

                // Item access: list[0] = "new item"
                const setItemMatch = trimmed.match(/^(\w+)\[(-?\d+)\]\s*=\s*["'](.*)["']$/);
                if (setItemMatch) {
                    const [, varName, indexStr, newValue] = setItemMatch;
                    let index = parseInt(indexStr);
                    if (variables[varName]) {
                        const list = variables[varName];
                        if (index < 0) {
                            index = list.length + index;
                        }
                        if (index >= 0 && index < list.length) {
                            variables[varName][index] = newValue;
                            setHasChangedItem(true);
                        }
                    }
                    continue;
                }

                // Print list item: print(inventory[0])
                const printIndexMatch = trimmed.match(/^print\s*\((\w+)\[(-?\d+)\]\)$/);
                if (printIndexMatch) {
                    const [, varName, indexStr] = printIndexMatch;
                    let index = parseInt(indexStr);
                    if (variables[varName]) {
                        const list = variables[varName];
                        if (index < 0) {
                            index = list.length + index;
                        }
                        if (index >= 0 && index < list.length) {
                            outputLines.push(list[index]);
                            setHasAccessedItem(true);
                        } else {
                            outputLines.push(`IndexError: list index out of range`);
                        }
                    }
                    continue;
                }

                // Print entire list: print(inventory)
                const printListMatch = trimmed.match(/^print\s*\((\w+)\)$/);
                if (printListMatch) {
                    const varName = printListMatch[1];
                    if (variables[varName]) {
                        const list = variables[varName];
                        outputLines.push(`["${list.join('", "')}"]`);
                    }
                    continue;
                }

                // Print string: print("text")
                const printStrMatch = trimmed.match(/^print\s*\(["'](.*)["']\)$/);
                if (printStrMatch) {
                    outputLines.push(printStrMatch[1]);
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

        const correctAnswers = [1, 1]; // Q1: 0 (index 1), Q2: "blue" (index 1)

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
                        🎮
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
                    Item Swapper Achieved!
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={styles.successMessage}
                >
                    {LESSON.successMessage} You can now access and change any item in a list!
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
                    <Link href="/level3/lesson3" className={`${styles.navBtn} ${styles.primary}`}>
                        Next Lesson <ChevronRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    // Inventory items for the animated visual
    const inventoryItems = ['sword', 'shield', 'potion'];

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
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                {LESSON.emoji}
                            </motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Story Introduction - Game Inventory */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(59, 130, 246, 0.15))' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Gamepad2 size={28} className="text-purple-400" />
                                <Package size={24} className="text-blue-400" />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Mission: Manage Your Inventory!</span>
                            </div>

                            <p>
                                Your game character has an inventory! Each slot has a number starting from 0.
                                Let's learn to access and change items by their position number (called an <strong>INDEX</strong>).
                            </p>
                        </motion.div>

                        {/* Animated Index Visual */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{
                                background: 'rgba(0, 0, 0, 0.3)',
                                borderRadius: '1rem',
                                padding: '1.5rem',
                                marginBottom: '2rem'
                            }}
                        >
                            <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                Inventory Slots (Index Numbers)
                            </h3>

                            {/* Index numbers above */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                {inventoryItems.map((_, idx) => (
                                    <motion.div
                                        key={`index-${idx}`}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + idx * 0.2 }}
                                        style={{
                                            width: '100px',
                                            textAlign: 'center',
                                            color: '#bd93f9',
                                            fontFamily: 'Fira Code, monospace',
                                            fontWeight: 700,
                                            fontSize: '1.25rem'
                                        }}
                                    >
                                        [{idx}]
                                    </motion.div>
                                ))}
                            </div>

                            {/* Inventory slots */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                {inventoryItems.map((item, idx) => (
                                    <motion.div
                                        key={`item-${idx}`}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5 + idx * 0.2 }}
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        style={{
                                            width: '100px',
                                            padding: '1rem',
                                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.3))',
                                            border: '2px solid rgba(168, 85, 247, 0.5)',
                                            borderRadius: '0.75rem',
                                            textAlign: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                                            {item === 'sword' ? '🗡️' : item === 'shield' ? '🛡️' : '🧪'}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#50fa7b' }}>
                                            "{item}"
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Negative index explanation */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                                {inventoryItems.map((_, idx) => (
                                    <motion.div
                                        key={`neg-index-${idx}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1.2 + idx * 0.1 }}
                                        style={{
                                            width: '100px',
                                            textAlign: 'center',
                                            color: '#ff79c6',
                                            fontFamily: 'Fira Code, monospace',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        [{idx - inventoryItems.length}]
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Main Explanation */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Lightbulb size={20} className="text-amber-400" /> How List Indexing Works
                            </h3>

                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ background: 'rgba(80, 250, 123, 0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                    <p><strong>Index = position number in the list</strong></p>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Every item has a number that tells you where it is!</p>
                                </div>

                                <div style={{ background: 'rgba(255, 121, 198, 0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                    <p><strong>Python starts counting at 0, not 1!</strong></p>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>The first item is at position 0, second at 1, third at 2...</p>
                                </div>

                                <div style={{ background: 'rgba(139, 233, 253, 0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                    <code style={{ color: '#8be9fd', fontSize: '1.1rem' }}>[0]</code>
                                    <span style={{ marginLeft: '0.75rem' }}>The number in brackets gets that item. 0 = first, 1 = second, etc.</span>
                                </div>

                                <div style={{ background: 'rgba(255, 184, 108, 0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                    <code style={{ color: '#ffb86c', fontSize: '1.1rem' }}>[-1]</code>
                                    <span style={{ marginLeft: '0.75rem' }}>Negative numbers count from the end! -1 = last item</span>
                                </div>
                            </div>
                        </div>

                        {/* Example Code */}
                        <div className={styles.codeSection}>
                            <h3>Code Example</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}>
                                    <span>main.py</span>
                                    <span>Python</span>
                                </div>
                                <div className={styles.codeContent}>
                                    <span className={styles.variable}>inventory</span> = [<span className={styles.string}>"sword"</span>, <span className={styles.string}>"shield"</span>, <span className={styles.string}>"potion"</span>]{'\n\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.variable}>inventory</span>[<span className={styles.number}>0</span>])  <span className={styles.comment}># First item: sword</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.variable}>inventory</span>[<span className={styles.number}>2</span>])  <span className={styles.comment}># Third item: potion</span>{'\n\n'}
                                    <span className={styles.comment}># Upgrade your sword!</span>{'\n'}
                                    <span className={styles.variable}>inventory</span>[<span className={styles.number}>0</span>] = <span className={styles.string}>"golden sword"</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.variable}>inventory</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>
                                    sword{'\n'}
                                    potion{'\n'}
                                    ["golden sword", "shield", "potion"]
                                </div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3>Your Turn - Access and Change Items!</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                Try accessing different items with [0], [1], [2], or even [-1] for the last item!
                            </p>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}>
                                    <span>your_code.py</span>
                                    <span>Python</span>
                                </div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder='inventory = ["sword", "shield", "potion"]

print(inventory[0])
print(inventory[2])

# Upgrade your sword!
inventory[0] = "golden sword"
print(inventory)'
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
                                        {output.includes('Error') || output.includes('IndexError') ? 'Error:' : 'Output:'}
                                    </div>
                                    <div className={styles.outputText}
                                        style={{ color: output.includes('Error') || output.includes('IndexError') ? '#f87171' : '#50fa7b' }}
                                    >
                                        {output}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Challenge Tracker */}
                        <div className={styles.challenges}>
                            <h3>Your Turn Challenge:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasAccessedItem ? styles.done : ''}`}>
                                        {hasAccessedItem && <Check size={14} />}
                                    </div>
                                    Access an item using its index (like <code>inventory[0]</code>)
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasChangedItem ? styles.done : ''}`}>
                                        {hasChangedItem && <Check size={14} />}
                                    </div>
                                    Change an item to something new (like <code>inventory[0] = "diamond sword"</code>)
                                </li>
                            </ul>
                        </div>

                        {/* Tip Box */}
                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Remember:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li>Python counts from 0, not 1!</li>
                                    <li><code>list[0]</code> = first item</li>
                                    <li><code>list[-1]</code> = last item</li>
                                    <li>You can both READ and CHANGE items using their index</li>
                                </ul>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className={styles.navBar}>
                            <Link href="/level3/lesson1" className={`${styles.navBtn} ${styles.secondary}`}>
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
                                    What index gets the <strong>FIRST</strong> item in a list?
                                </p>
                                <div className={styles.quizOptions}>
                                    {[
                                        '1',
                                        '0',
                                        '-1'
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
                                    If <code>colors = ["red", "blue", "green"]</code>, what is <code>colors[1]</code>?
                                </p>
                                <div className={styles.quizOptions}>
                                    {[
                                        '"red"',
                                        '"blue"',
                                        '"green"'
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
                                        ? 'Remember: Python starts counting at 0! So list[0] gets the first item.'
                                        : 'Index 1 gets the SECOND item. Index 0 = "red", Index 1 = "blue", Index 2 = "green"'
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
                                <p>Moving to the next question...</p>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
