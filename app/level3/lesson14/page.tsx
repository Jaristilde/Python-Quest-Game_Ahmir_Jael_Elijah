'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Hash, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL3_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL3_LESSONS[13]; // Lesson 14 (0-indexed)
const LESSON_ID = 47; // Level 3 lessons start at 34, so lesson 14 = 34 + 13 = 47

export default function Lesson14() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('# Count items with len() and .count()!\n');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);

    // Animation states for counting visual
    const [countingStep, setCountingStep] = useState(0);
    const [isCountingTotal, setIsCountingTotal] = useState(true);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [currentCount, setCurrentCount] = useState(0);

    const inventoryItems = ["apple", "banana", "apple", "orange", "apple"];

    const quizQuestions = [
        {
            question: 'What does len(["a", "b", "c", "d"]) return?',
            options: ["3", "4", '"abcd"'],
            correct: 1
        },
        {
            question: 'If colors = ["red", "blue", "red"], what is colors.count("red")?',
            options: ["1", "2", "3"],
            correct: 1
        }
    ];

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    // Animate counting through items
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const runCountingAnimation = () => {
            if (countingStep < inventoryItems.length) {
                setHighlightedIndex(countingStep);
                setCurrentCount(countingStep + 1);
                timeoutId = setTimeout(() => {
                    setCountingStep(prev => prev + 1);
                }, 600);
            } else if (countingStep === inventoryItems.length) {
                // Pause then switch modes
                timeoutId = setTimeout(() => {
                    if (isCountingTotal) {
                        setIsCountingTotal(false);
                        setCountingStep(0);
                        setHighlightedIndex(-1);
                        setCurrentCount(0);
                    } else {
                        setIsCountingTotal(true);
                        setCountingStep(0);
                        setHighlightedIndex(-1);
                        setCurrentCount(0);
                    }
                }, 2000);
            }
        };

        runCountingAnimation();

        return () => clearTimeout(timeoutId);
    }, [countingStep, isCountingTotal]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            let variables: { [key: string]: string[] | number | string } = {};

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) continue;

                // List assignment: name = ["item1", "item2", ...]
                const listMatch = trimmed.match(/^(\w+)\s*=\s*\[(.*)\]$/);
                if (listMatch) {
                    const items = listMatch[2].split(',').map(item => {
                        const match = item.trim().match(/^["'](.*)["']$/);
                        return match ? match[1] : item.trim();
                    }).filter(item => item !== '');
                    variables[listMatch[1]] = items;
                    continue;
                }

                // len() assignment: name = len(list)
                const lenMatch = trimmed.match(/^(\w+)\s*=\s*len\s*\(\s*(\w+)\s*\)$/);
                if (lenMatch) {
                    const [, varName, listVar] = lenMatch;
                    const list = variables[listVar] as string[];
                    if (list && Array.isArray(list)) {
                        variables[varName] = list.length;
                    }
                    continue;
                }

                // .count() assignment: name = list.count("item")
                const countMatch = trimmed.match(/^(\w+)\s*=\s*(\w+)\.count\s*\(\s*["'](.+)["']\s*\)$/);
                if (countMatch) {
                    const [, varName, listVar, item] = countMatch;
                    const list = variables[listVar] as string[];
                    if (list && Array.isArray(list)) {
                        variables[varName] = list.filter(i => i === item).length;
                    }
                    continue;
                }

                // Print statements
                const printMatch = trimmed.match(/^print\s*\((.+)\)$/);
                if (printMatch) {
                    const content = printMatch[1].trim();

                    // print("text", variable)
                    const textVarMatch = content.match(/^["'](.+)["']\s*,\s*(\w+)$/);
                    if (textVarMatch) {
                        const text = textVarMatch[1];
                        const varName = textVarMatch[2];
                        const value = variables[varName];
                        outputLines.push(`${text} ${value}`);
                        continue;
                    }

                    // print(len(list))
                    const printLenMatch = content.match(/^len\s*\(\s*(\w+)\s*\)$/);
                    if (printLenMatch) {
                        const list = variables[printLenMatch[1]] as string[];
                        if (list && Array.isArray(list)) {
                            outputLines.push(String(list.length));
                        }
                        continue;
                    }

                    // print(list.count("item"))
                    const printCountMatch = content.match(/^(\w+)\.count\s*\(\s*["'](.+)["']\s*\)$/);
                    if (printCountMatch) {
                        const list = variables[printCountMatch[1]] as string[];
                        const item = printCountMatch[2];
                        if (list && Array.isArray(list)) {
                            outputLines.push(String(list.filter(i => i === item).length));
                        }
                        continue;
                    }

                    // print(variable)
                    if (variables[content] !== undefined) {
                        outputLines.push(String(variables[content]));
                        continue;
                    }

                    // print("text")
                    const strMatch = content.match(/^["'](.*)["']$/);
                    if (strMatch) {
                        outputLines.push(strMatch[1]);
                        continue;
                    }
                }
            }

            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Try using len() or .count()!');
        } catch {
            setOutput('Error in code! Check your syntax.');
        }
    };

    const checkQuiz = () => {
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = true;
        setQuizChecked(newChecked);

        if (quizAnswers[currentQuiz] === quizQuestions[currentQuiz].correct) {
            if (currentQuiz < 1) {
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
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = false;
        setQuizChecked(newChecked);
        const newAnswers = [...quizAnswers];
        newAnswers[currentQuiz] = null;
        setQuizAnswers(newAnswers);
    };

    // Get count of apples for .count() animation
    const getAppleCount = () => {
        let count = 0;
        for (let i = 0; i <= highlightedIndex; i++) {
            if (inventoryItems[i] === "apple") count++;
        }
        return count;
    };

    if (isLoading || !user) return <div className={styles.container}><div className="flex items-center justify-center h-screen text-slate-400">Loading...</div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}><Check size={50} className="text-white" /></motion.div>
                <h2 className={styles.successTitle}>{LESSON.successMessage}</h2>
                <p className={styles.successMessage}>You can now count items like a pro inventory manager!</p>
                <div className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</div>
                <Link href="/level3/lesson15" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/level3" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 16</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                {!showQuiz ? (
                    <>
                        <div className={styles.lessonTitle}>
                            <motion.div
                                className={styles.lessonEmoji}
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(16, 185, 129, 0.2))' }}
                            >
                                {LESSON.emoji}
                            </motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Story/Mission Box */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(16, 185, 129, 0.15))',
                                textAlign: 'center',
                                padding: '1.5rem'
                            }}
                        >
                            <div style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <Hash size={24} className="text-blue-400" /> Inventory Inspector! You need to know how many items you have total, and how many of a SPECIFIC item.
                            </div>
                            <p style={{ color: 'var(--text-muted)' }}>
                                Python has two counting tools: <code>len()</code> for total count and <code>.count()</code> for specific items!
                            </p>
                        </motion.div>

                        {/* Animated Counting Visual */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                background: 'linear-gradient(135deg, #1a1a2e, #0f172a)',
                                border: '2px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: 'var(--radius)',
                                padding: '1.5rem',
                                marginBottom: '2rem'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <Package size={20} className="text-blue-400" />
                                <h3 style={{ margin: 0, fontWeight: 700 }}>
                                    {isCountingTotal ? 'len() - Count ALL Items' : '.count("apple") - Count Specific Item'}
                                </h3>
                            </div>

                            {/* Inventory Grid */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                marginBottom: '1.5rem',
                                flexWrap: 'wrap'
                            }}>
                                {inventoryItems.map((item, idx) => {
                                    const isHighlighted = idx <= highlightedIndex;
                                    const isApple = item === "apple";
                                    const shouldShow = isCountingTotal || (isApple && isHighlighted);

                                    return (
                                        <motion.div
                                            key={idx}
                                            animate={{
                                                scale: idx === highlightedIndex ? [1, 1.2, 1] : 1,
                                                borderColor: isHighlighted
                                                    ? (isCountingTotal ? 'rgba(59, 130, 246, 0.8)' : (isApple ? 'rgba(16, 185, 129, 0.8)' : 'rgba(255,255,255,0.1)'))
                                                    : 'rgba(255,255,255,0.1)',
                                                backgroundColor: isHighlighted
                                                    ? (isCountingTotal ? 'rgba(59, 130, 246, 0.2)' : (isApple ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0,0,0,0.3)'))
                                                    : 'rgba(0,0,0,0.3)'
                                            }}
                                            style={{
                                                width: '70px',
                                                height: '70px',
                                                borderRadius: '0.75rem',
                                                border: '2px solid',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.25rem',
                                                position: 'relative'
                                            }}
                                        >
                                            <span style={{ fontSize: '1.75rem' }}>
                                                {item === 'apple' ? '🍎' : item === 'banana' ? '🍌' : '🍊'}
                                            </span>

                                            {/* Count Badge */}
                                            <AnimatePresence>
                                                {isHighlighted && (isCountingTotal || isApple) && (
                                                    <motion.div
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0, opacity: 0 }}
                                                        style={{
                                                            position: 'absolute',
                                                            top: '-8px',
                                                            right: '-8px',
                                                            width: '24px',
                                                            height: '24px',
                                                            borderRadius: '50%',
                                                            background: isCountingTotal ? '#3b82f6' : '#10b981',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 700,
                                                            color: 'white'
                                                        }}
                                                    >
                                                        <Check size={14} />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Current Count Display */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '2rem',
                                padding: '1rem',
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '0.5rem'
                            }}>
                                <motion.div
                                    key={`count-${isCountingTotal}-${highlightedIndex}`}
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    style={{
                                        textAlign: 'center'
                                    }}
                                >
                                    <div style={{
                                        fontFamily: 'monospace',
                                        fontSize: '0.9rem',
                                        color: isCountingTotal ? '#3b82f6' : '#10b981',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {isCountingTotal ? 'len(fruits)' : 'fruits.count("apple")'}
                                    </div>
                                    <motion.div
                                        key={isCountingTotal ? currentCount : getAppleCount()}
                                        initial={{ scale: 1.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        style={{
                                            fontSize: '2.5rem',
                                            fontWeight: 800,
                                            color: isCountingTotal ? '#60a5fa' : '#34d399'
                                        }}
                                    >
                                        {isCountingTotal ? currentCount : getAppleCount()}
                                    </motion.div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {isCountingTotal ? 'Total Items' : 'Apple Count'}
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Symbol Explanations */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem' }}>Counting Tools:</h3>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{
                                    background: 'rgba(59, 130, 246, 0.15)',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(59, 130, 246, 0.3)'
                                }}>
                                    <code style={{ color: '#3b82f6', fontWeight: 700, fontSize: '1.1rem' }}>len()</code>
                                    <span style={{ marginLeft: '0.75rem' }}>=</span>
                                    <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>
                                        "Length" - counts how many items TOTAL in a list
                                    </span>
                                </div>
                                <div style={{
                                    background: 'rgba(16, 185, 129, 0.15)',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(16, 185, 129, 0.3)'
                                }}>
                                    <code style={{ color: '#10b981', fontWeight: 700, fontSize: '1.1rem' }}>.count()</code>
                                    <span style={{ marginLeft: '0.75rem' }}>=</span>
                                    <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>
                                        Counts how many times ONE specific thing appears
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Key Concepts */}
                        <div className={styles.explainBox} style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                            <h3 style={{ marginBottom: '0.75rem', color: '#3b82f6' }}>Key Concepts:</h3>
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>1</span>
                                    <p><code>len(list)</code> - counts TOTAL items in list</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>2</span>
                                    <p><code>list.count(item)</code> - counts how many times specific item appears</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>3</span>
                                    <p><code>len()</code> works on any list - strings, numbers, anything!</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>4</span>
                                    <p><code>.count()</code> returns 0 if item not found</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>5</span>
                                    <p>Great for finding duplicates in your lists!</p>
                                </div>
                            </div>
                        </div>

                        {/* Code Example */}
                        <div className={styles.codeSection}>
                            <h3>Code Example</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>counting.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># A basket of fruits with some duplicates</span>{'\n'}
                                    fruits = [<span className={styles.string}>"apple"</span>, <span className={styles.string}>"banana"</span>, <span className={styles.string}>"apple"</span>, <span className={styles.string}>"orange"</span>, <span className={styles.string}>"apple"</span>]{'\n\n'}
                                    <span className={styles.comment}># Count ALL items</span>{'\n'}
                                    total = <span style={{ color: '#3b82f6' }}>len</span>(fruits){'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"Total fruits:"</span>, total){'\n\n'}
                                    <span className={styles.comment}># Count SPECIFIC item</span>{'\n'}
                                    apples = fruits.<span style={{ color: '#10b981' }}>count</span>(<span className={styles.string}>"apple"</span>){'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"Apples:"</span>, apples)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>Total fruits: 5{'\n'}Apples: 3</div>
                            </div>
                        </div>

                        {/* Interactive Code Editor */}
                        <div className={styles.codeSection}>
                            <h3>Your Turn!</h3>
                            <p style={{ marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Try changing the list items! Add more apples, count different fruits, or try counting something that doesn't exist to see what happens!
                            </p>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    spellCheck={false}
                                    style={{ minHeight: '200px' }}
                                />
                            </div>
                            <button className={styles.runBtn} onClick={runCode}><Play size={18} /> Run Code</button>
                            {output && <div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></div>}
                        </div>

                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <div>
                                <p style={{ fontWeight: 600 }}>Finding Duplicates!</p>
                                <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                    If <code>list.count(item)</code> returns more than 1, you have duplicates! This is useful for checking if something appears multiple times.
                                </p>
                            </div>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level3/lesson13" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection}>
                        <h2 className={styles.quizTitle}>Brain Check! ({currentQuiz + 1}/2)</h2>
                        <p className={styles.quizQuestion} dangerouslySetInnerHTML={{ __html: quizQuestions[currentQuiz].question.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/`([^`]+)`/g, '<code>$1</code>') }} />
                        <div className={styles.quizOptions}>
                            {quizQuestions[currentQuiz].options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        if (!quizChecked[currentQuiz]) {
                                            const newAnswers = [...quizAnswers];
                                            newAnswers[currentQuiz] = idx;
                                            setQuizAnswers(newAnswers);
                                        }
                                    }}
                                    className={`${styles.quizOption} ${quizAnswers[currentQuiz] === idx ? styles.selected : ''} ${quizChecked[currentQuiz] && idx === quizQuestions[currentQuiz].correct ? styles.correct : ''} ${quizChecked[currentQuiz] && quizAnswers[currentQuiz] === idx && idx !== quizQuestions[currentQuiz].correct ? styles.wrong : ''}`}
                                    disabled={quizChecked[currentQuiz]}
                                >
                                    {String.fromCharCode(65 + idx)}) {option}
                                </button>
                            ))}
                        </div>
                        {!quizChecked[currentQuiz] ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswers[currentQuiz] === null}>Check Answer</button>
                        ) : quizAnswers[currentQuiz] !== quizQuestions[currentQuiz].correct ? (
                            <div className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>
                                    {currentQuiz === 0 && 'len() counts ALL items in the list. ["a", "b", "c", "d"] has 4 items, so len() returns 4!'}
                                    {currentQuiz === 1 && '"red" appears 2 times in the list ["red", "blue", "red"], so .count("red") returns 2!'}
                                </p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem' }}>Try Again</button>
                            </div>
                        ) : (
                            <div className={`${styles.quizFeedback} ${styles.success}`}>
                                <h4>Correct!</h4>
                                {currentQuiz < 1 && <p>Moving to the next question...</p>}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
