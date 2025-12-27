'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Calculator, Coins } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL3_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL3_LESSONS[10]; // Lesson 11 (0-indexed)
const LESSON_ID = 44;

export default function Lesson11() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('# Add up numbers with sum()!\n');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);

    // Animation states for coin counting visualization
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentCoinIndex, setCurrentCoinIndex] = useState(-1);
    const [runningTotal, setRunningTotal] = useState(0);
    const [coinPileHeight, setCoinPileHeight] = useState(0);
    const [showFinalTotal, setShowFinalTotal] = useState(false);

    const quizQuestions = [
        {
            question: 'What does sum([5, 10, 15]) return?',
            options: ['A) 3', 'B) 15', 'C) 30'],
            correct: 2
        },
        {
            question: 'To find the average, you divide sum() by:',
            options: ['A) max()', 'B) len()', 'C) min()'],
            correct: 1
        }
    ];

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            const variables: { [key: string]: number[] | number | string } = {};

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) continue;

                // List assignment: coins = [10, 25, 15, 30, 20]
                const listMatch = trimmed.match(/^(\w+)\s*=\s*\[(.*)\]$/);
                if (listMatch) {
                    const varName = listMatch[1];
                    const itemsStr = listMatch[2];
                    const items = itemsStr.split(',').map(item => {
                        const num = parseFloat(item.trim());
                        return isNaN(num) ? 0 : num;
                    }).filter(item => !isNaN(item));
                    variables[varName] = items;
                    continue;
                }

                // sum() assignment: total = sum(coins)
                const sumMatch = trimmed.match(/^(\w+)\s*=\s*sum\s*\(\s*(\w+)\s*\)$/);
                if (sumMatch) {
                    const varName = sumMatch[1];
                    const listName = sumMatch[2];
                    const list = variables[listName];
                    if (Array.isArray(list)) {
                        variables[varName] = list.reduce((a, b) => a + b, 0);
                    }
                    continue;
                }

                // Average calculation: average = sum(coins) / len(coins)
                const avgMatch = trimmed.match(/^(\w+)\s*=\s*sum\s*\(\s*(\w+)\s*\)\s*\/\s*len\s*\(\s*(\w+)\s*\)$/);
                if (avgMatch) {
                    const varName = avgMatch[1];
                    const listName = avgMatch[2];
                    const list = variables[listName];
                    if (Array.isArray(list) && list.length > 0) {
                        const total = list.reduce((a, b) => a + b, 0);
                        variables[varName] = total / list.length;
                    }
                    continue;
                }

                // Print with string and variable: print("Total coins:", total)
                const printVarMatch = trimmed.match(/^print\s*\(\s*["'](.+?)["']\s*,\s*(\w+)\s*\)$/);
                if (printVarMatch) {
                    const text = printVarMatch[1];
                    const varName = printVarMatch[2];
                    const value = variables[varName];
                    if (value !== undefined) {
                        outputLines.push(`${text} ${value}`);
                    }
                    continue;
                }

                // Simple print with sum: print(sum(coins))
                const printSumMatch = trimmed.match(/^print\s*\(\s*sum\s*\(\s*(\w+)\s*\)\s*\)$/);
                if (printSumMatch) {
                    const listName = printSumMatch[1];
                    const list = variables[listName];
                    if (Array.isArray(list)) {
                        outputLines.push(String(list.reduce((a, b) => a + b, 0)));
                    }
                    continue;
                }

                // Simple print: print("...")
                const simplePrintMatch = trimmed.match(/^print\s*\(\s*["'](.*)["']\s*\)$/);
                if (simplePrintMatch) {
                    outputLines.push(simplePrintMatch[1]);
                    continue;
                }

                // Print variable only: print(total)
                const printOnlyVarMatch = trimmed.match(/^print\s*\(\s*(\w+)\s*\)$/);
                if (printOnlyVarMatch) {
                    const varName = printOnlyVarMatch[1];
                    const value = variables[varName];
                    if (value !== undefined) {
                        outputLines.push(String(value));
                    }
                    continue;
                }
            }

            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code to see the total!');
        } catch {
            setOutput('Error in code! Check your syntax.');
        }
    };

    // Animated coin counting visualization
    const runAnimatedDemo = () => {
        setIsAnimating(true);
        setCurrentCoinIndex(-1);
        setRunningTotal(0);
        setCoinPileHeight(0);
        setShowFinalTotal(false);

        const coins = [10, 25, 15, 30, 20];
        let total = 0;

        // Animate each coin being added
        coins.forEach((coin, index) => {
            setTimeout(() => {
                setCurrentCoinIndex(index);
                total += coin;
                setRunningTotal(total);
                setCoinPileHeight((index + 1) * 20);
            }, 800 + index * 1000);
        });

        // Show final total
        setTimeout(() => {
            setCurrentCoinIndex(-1);
            setShowFinalTotal(true);
            setIsAnimating(false);
        }, 800 + coins.length * 1000 + 500);
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

    if (isLoading || !user) return <div className={styles.container}><div className="flex items-center justify-center h-screen text-slate-400">Loading...</div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                {/* Confetti Animation */}
                <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: -100, x: `${Math.random() * 100}vw`, opacity: 1, rotate: 0 }}
                            animate={{
                                y: '110vh',
                                opacity: [1, 1, 0],
                                rotate: Math.random() * 720 - 360
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                delay: Math.random() * 2,
                                repeat: Infinity,
                                ease: 'linear'
                            }}
                            style={{
                                position: 'absolute',
                                fontSize: '1.5rem',
                            }}
                        >
                            {['coins', 'calculator', 'sparkles', 'star', 'trophy'][Math.floor(Math.random() * 5)] === 'coins' ? '(coin)' :
                             ['coins', 'calculator', 'sparkles', 'star', 'trophy'][Math.floor(Math.random() * 5)] === 'calculator' ? '(calc)' :
                             ['coins', 'calculator', 'sparkles', 'star', 'trophy'][Math.floor(Math.random() * 5)] === 'sparkles' ? '(sparkle)' :
                             ['coins', 'calculator', 'sparkles', 'star', 'trophy'][Math.floor(Math.random() * 5)] === 'star' ? '(star)' : '(trophy)'}
                        </motion.div>
                    ))}
                </div>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #f59e0b, #10b981)' }}>
                    <Calculator size={50} className="text-white" />
                </motion.div>
                <h2 className={styles.successTitle}>{LESSON.successMessage}</h2>
                <p className={styles.successMessage}>You can now add up all the numbers in any list!</p>
                <div className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</div>
                <Link href="/level3/lesson12" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link>
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
                                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(16, 185, 129, 0.2))' }}
                            >
                                {LESSON.emoji}
                            </motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Coin Counter Story Box */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(16, 185, 129, 0.15))' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                {/* Animated Coin Pile */}
                                <div style={{ position: 'relative', width: '100px', height: '80px', flexShrink: 0 }}>
                                    {/* Coin stack animation */}
                                    {[0, 1, 2, 3, 4].map((i) => (
                                        <motion.div
                                            key={i}
                                            animate={{
                                                y: [0, -5, 0],
                                                rotateY: [0, 180, 360]
                                            }}
                                            transition={{
                                                duration: 2,
                                                delay: i * 0.2,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                            style={{
                                                position: 'absolute',
                                                left: `${20 + i * 12}px`,
                                                bottom: `${i * 8}px`,
                                                width: '35px',
                                                height: '35px',
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                                border: '3px solid #d97706',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 700,
                                                fontSize: '0.7rem',
                                                color: '#78350f',
                                                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)'
                                            }}
                                        >
                                            $
                                        </motion.div>
                                    ))}
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
                                        <Coins size={20} className="text-amber-400" />
                                        Coin Counter!
                                    </div>
                                    <p style={{ marginTop: '0.25rem', color: 'var(--text-muted)' }}>
                                        You've collected coins in different levels of your game. How many coins do you have <strong>TOTAL</strong>? Use <code>sum()</code> to add them all up instantly!
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Concept Explanation Box */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem' }}>How sum() Works</h3>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>1</span>
                                    <p><code>sum(list)</code> adds <strong>all numbers together</strong> in a list</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>2</span>
                                    <p>Only works with <strong>numbers</strong> (not strings like "hello")</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>3</span>
                                    <p>Returns a <strong>single total value</strong> - perfect for scores!</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>4</span>
                                    <p>Great for <strong>totals, averages, and scores</strong></p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>5</span>
                                    <p>Combine with <code>len()</code> for average: <code>sum(list)/len(list)</code></p>
                                </div>
                            </div>
                        </div>

                        {/* Symbol Explanations */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            style={{
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: 'var(--radius)',
                                padding: '1.25rem',
                                marginBottom: '2rem'
                            }}
                        >
                            <h3 style={{ marginBottom: '0.75rem', color: '#10b981' }}>Symbol Guide</h3>
                            <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.95rem' }}>
                                <div><code style={{ color: '#f472b6' }}>sum()</code> = "Adds up ALL the numbers in your list"</div>
                                <div><code style={{ color: '#f472b6' }}>/</code> = "Division - used to calculate average"</div>
                            </div>
                        </motion.div>

                        {/* Visual Coin Counter Animation */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{
                                background: 'var(--surface)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius)',
                                padding: '1.5rem',
                                marginBottom: '2rem'
                            }}
                        >
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Calculator size={18} /> Watch sum() Count Your Coins
                            </h3>

                            {/* Coins visualization */}
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>coins = </div>
                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    {[10, 25, 15, 30, 20].map((coin, idx) => (
                                        <motion.div
                                            key={idx}
                                            animate={{
                                                scale: currentCoinIndex === idx ? 1.3 : (currentCoinIndex > idx ? 0.8 : 1),
                                                opacity: currentCoinIndex > idx ? 0.4 : 1,
                                                borderColor: currentCoinIndex === idx ? '#fbbf24' : 'rgba(255,255,255,0.2)',
                                                boxShadow: currentCoinIndex === idx ? '0 0 25px rgba(251, 191, 36, 0.6)' : 'none',
                                                y: currentCoinIndex === idx ? -10 : 0
                                            }}
                                            style={{
                                                width: '55px',
                                                height: '55px',
                                                background: currentCoinIndex >= idx ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'rgba(0,0,0,0.3)',
                                                border: '3px solid',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontFamily: 'monospace',
                                                fontWeight: 700,
                                                fontSize: '0.9rem',
                                                color: currentCoinIndex >= idx ? '#78350f' : '#fbbf24',
                                                position: 'relative'
                                            }}
                                        >
                                            {coin}
                                            {currentCoinIndex === idx && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    style={{
                                                        position: 'absolute',
                                                        bottom: '-30px',
                                                        fontSize: '0.75rem',
                                                        color: '#10b981',
                                                        whiteSpace: 'nowrap',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    +{coin}!
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Running total display */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '1rem',
                                margin: '2rem 0 1rem'
                            }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(16, 185, 129, 0.2))',
                                    border: '2px solid rgba(16, 185, 129, 0.4)',
                                    borderRadius: '1rem',
                                    padding: '1rem 2rem',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Running Total</div>
                                    <motion.div
                                        key={runningTotal}
                                        initial={{ scale: 1.3 }}
                                        animate={{ scale: 1 }}
                                        style={{
                                            fontSize: '2rem',
                                            fontWeight: 800,
                                            color: showFinalTotal ? '#10b981' : '#fbbf24',
                                            fontFamily: 'monospace'
                                        }}
                                    >
                                        {runningTotal}
                                    </motion.div>
                                </div>

                                {/* Animated coin pile */}
                                <div style={{
                                    width: '80px',
                                    height: '100px',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    justifyContent: 'center'
                                }}>
                                    <motion.div
                                        animate={{ height: coinPileHeight }}
                                        style={{
                                            width: '60px',
                                            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                            borderRadius: '0.5rem 0.5rem 0 0',
                                            boxShadow: '0 0 15px rgba(251, 191, 36, 0.3)'
                                        }}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={runAnimatedDemo}
                                disabled={isAnimating}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1.5rem',
                                    background: isAnimating ? 'rgba(245, 158, 11, 0.3)' : 'linear-gradient(135deg, #f59e0b, #10b981)',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    color: 'white',
                                    fontWeight: 600,
                                    cursor: isAnimating ? 'not-allowed' : 'pointer',
                                    margin: '0 auto 1rem'
                                }}
                            >
                                <Coins size={18} /> {isAnimating ? 'Counting...' : 'Count Coins with sum()'}
                            </button>

                            {/* Final result display */}
                            <AnimatePresence>
                                {showFinalTotal && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        style={{
                                            background: 'rgba(16, 185, 129, 0.2)',
                                            border: '2px solid rgba(16, 185, 129, 0.5)',
                                            borderRadius: '0.75rem',
                                            padding: '1rem',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <div style={{ color: '#10b981', fontWeight: 700, marginBottom: '0.5rem' }}>
                                            sum([10, 25, 15, 30, 20]) = 100
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                            Total coins collected: <strong>100</strong>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Code Example */}
                        <div className={styles.codeSection}>
                            <h3>Code Example</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>coin_counter.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    coins = [<span className={styles.number}>10</span>, <span className={styles.number}>25</span>, <span className={styles.number}>15</span>, <span className={styles.number}>30</span>, <span className={styles.number}>20</span>]{'\n\n'}
                                    total = <span className={styles.keyword}>sum</span>(coins){'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"Total coins:"</span>, total){'\n\n'}
                                    <span className={styles.comment}># Calculate average</span>{'\n'}
                                    average = <span className={styles.keyword}>sum</span>(coins) / <span className={styles.keyword}>len</span>(coins){'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"Average:"</span>, average)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>Total coins: 100{'\n'}Average: 20.0</div>
                            </div>
                        </div>

                        {/* Interactive Code Editor */}
                        <div className={styles.codeSection}>
                            <h3>Your Turn!</h3>
                            <p style={{ marginBottom: '0.75rem', color: 'var(--text-muted)' }}>Try changing the coin values! What happens to the total and average?</p>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    spellCheck={false}
                                    style={{ minHeight: '180px' }}
                                />
                            </div>
                            <button className={styles.runBtn} onClick={runCode}><Play size={18} /> Run Code</button>
                            {output && <div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></div>}
                        </div>

                        {/* Tip Box */}
                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <div>
                                <p style={{ fontWeight: 600 }}>Remember: Numbers Only!</p>
                                <p style={{ fontSize: '0.9rem' }}><code>sum()</code> only works with lists of numbers. If you try <code>sum(["a", "b", "c"])</code>, Python will give you an error. Use it for scores, prices, ages, and other numeric data!</p>
                            </div>
                        </div>

                        {/* More Examples */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: 'var(--radius)',
                                padding: '1.25rem',
                                marginBottom: '2rem'
                            }}
                        >
                            <h4 style={{ marginBottom: '0.75rem', color: '#3b82f6' }}>More Examples of sum()</h4>
                            <div style={{ display: 'grid', gap: '0.75rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                    <span style={{ color: '#6272a4' }}># Game scores</span>{'\n'}
                                    <span>scores = [150, 200, 180, 220]</span>{'\n'}
                                    <span>total_score = <span style={{ color: '#8be9fd' }}>sum</span>(scores)  <span style={{ color: '#6272a4' }}># 750</span></span>
                                </div>
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                    <span style={{ color: '#6272a4' }}># Shopping cart</span>{'\n'}
                                    <span>prices = [5.99, 12.50, 3.25]</span>{'\n'}
                                    <span>total_price = <span style={{ color: '#8be9fd' }}>sum</span>(prices)  <span style={{ color: '#6272a4' }}># 21.74</span></span>
                                </div>
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                    <span style={{ color: '#6272a4' }}># Calculate class average</span>{'\n'}
                                    <span>grades = [85, 92, 78, 95, 88]</span>{'\n'}
                                    <span>average = <span style={{ color: '#8be9fd' }}>sum</span>(grades) / <span style={{ color: '#8be9fd' }}>len</span>(grades)  <span style={{ color: '#6272a4' }}># 87.6</span></span>
                                </div>
                            </div>
                        </motion.div>

                        <div className={styles.navBar}>
                            <Link href="/level3/lesson10" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection}>
                        <h2 className={styles.quizTitle}>Brain Check! ({currentQuiz + 1}/2)</h2>
                        <p className={styles.quizQuestion}>{quizQuestions[currentQuiz].question}</p>
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
                                    {option}
                                </button>
                            ))}
                        </div>
                        {!quizChecked[currentQuiz] ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswers[currentQuiz] === null}>Check Answer</button>
                        ) : quizAnswers[currentQuiz] !== quizQuestions[currentQuiz].correct ? (
                            <div className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>
                                    {currentQuiz === 0 && 'sum([5, 10, 15]) adds 5 + 10 + 15 = 30. It adds ALL the numbers together!'}
                                    {currentQuiz === 1 && 'To find the average, divide the sum by the count of items. len() gives you the count!'}
                                </p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem' }}>Try Again</button>
                            </div>
                        ) : (
                            <div className={`${styles.quizFeedback} ${styles.success}`}>
                                <h4>Correct!</h4>
                                {currentQuiz < 1 && <p>Moving to the next question...</p>}
                            </div>
                        )}
                        <button
                            onClick={() => setShowQuiz(false)}
                            style={{
                                marginTop: '1.5rem',
                                padding: '0.5rem 1rem',
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '0.5rem',
                                color: 'var(--text-muted)',
                                cursor: 'pointer'
                            }}
                        >
                            <ChevronLeft size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Back to Lesson
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
