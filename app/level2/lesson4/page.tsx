'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Bot, GitFork } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL2_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL2_LESSONS[3]; // Lesson 4
const LESSON_ID = 19;

export default function Lesson4() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('guess = 5\nsecret = 7\n\nif guess == secret:\n    print("You got it!")\nelse:\n    print("Nope, try again!")');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizStep, setQuizStep] = useState(0);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizChecked, setQuizChecked] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [robotPath, setRobotPath] = useState<'left' | 'right' | null>(null);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let variables: { [key: string]: number | string } = {};
            let outputLines: string[] = [];
            let i = 0;

            while (i < lines.length) {
                const line = lines[i].trim();
                if (!line || line.startsWith('#')) { i++; continue; }

                // Variable assignment (number)
                const numAssignMatch = line.match(/^(\w+)\s*=\s*(\d+)$/);
                if (numAssignMatch) {
                    variables[numAssignMatch[1]] = parseInt(numAssignMatch[2]);
                    i++; continue;
                }

                // Variable assignment (string)
                const strAssignMatch = line.match(/^(\w+)\s*=\s*["'](.*)["']$/);
                if (strAssignMatch) {
                    variables[strAssignMatch[1]] = strAssignMatch[2];
                    i++; continue;
                }

                // If statement with == comparison
                const ifMatch = line.match(/^if\s+(\w+)\s*(==|!=|>|<|>=|<=)\s*(\w+)\s*:$/);
                if (ifMatch) {
                    const [, leftVar, op, rightVal] = ifMatch;
                    const leftValue = variables[leftVar] !== undefined ? variables[leftVar] : leftVar;
                    let rightValue: number | string = rightVal;
                    if (variables[rightVal] !== undefined) {
                        rightValue = variables[rightVal];
                    } else if (!isNaN(parseInt(rightVal))) {
                        rightValue = parseInt(rightVal);
                    }

                    let condition = false;
                    switch (op) {
                        case '==': condition = leftValue === rightValue; break;
                        case '!=': condition = leftValue !== rightValue; break;
                        case '>': condition = Number(leftValue) > Number(rightValue); break;
                        case '<': condition = Number(leftValue) < Number(rightValue); break;
                        case '>=': condition = Number(leftValue) >= Number(rightValue); break;
                        case '<=': condition = Number(leftValue) <= Number(rightValue); break;
                    }

                    // Find the if block
                    let j = i + 1;
                    while (j < lines.length && (lines[j].startsWith('    ') || lines[j].startsWith('\t') || lines[j].trim() === '')) {
                        if (lines[j].trim().startsWith('else')) break;
                        j++;
                    }
                    const ifBlockEnd = j;

                    // Check for else
                    let elseBlockStart = -1;
                    let elseBlockEnd = -1;
                    if (j < lines.length && lines[j].trim() === 'else:') {
                        elseBlockStart = j + 1;
                        j++;
                        while (j < lines.length && (lines[j].startsWith('    ') || lines[j].startsWith('\t'))) {
                            j++;
                        }
                        elseBlockEnd = j;
                    }

                    // Execute appropriate block
                    if (condition) {
                        setRobotPath('left');
                        // Execute if block
                        for (let k = i + 1; k < ifBlockEnd; k++) {
                            const blockLine = lines[k].trim();
                            const printStrMatch = blockLine.match(/^print\s*\(\s*["'](.*)["']\s*\)$/);
                            if (printStrMatch) {
                                outputLines.push(printStrMatch[1]);
                            }
                            const printVarMatch = blockLine.match(/^print\s*\(\s*(\w+)\s*\)$/);
                            if (printVarMatch && variables[printVarMatch[1]] !== undefined) {
                                outputLines.push(String(variables[printVarMatch[1]]));
                            }
                        }
                    } else if (elseBlockStart !== -1) {
                        setRobotPath('right');
                        // Execute else block
                        for (let k = elseBlockStart; k < elseBlockEnd; k++) {
                            const blockLine = lines[k].trim();
                            const printStrMatch = blockLine.match(/^print\s*\(\s*["'](.*)["']\s*\)$/);
                            if (printStrMatch) {
                                outputLines.push(printStrMatch[1]);
                            }
                            const printVarMatch = blockLine.match(/^print\s*\(\s*(\w+)\s*\)$/);
                            if (printVarMatch && variables[printVarMatch[1]] !== undefined) {
                                outputLines.push(String(variables[printVarMatch[1]]));
                            }
                        }
                    }

                    i = elseBlockEnd !== -1 ? elseBlockEnd : ifBlockEnd;
                    continue;
                }

                // Simple print
                const printStrMatch = line.match(/^print\s*\(\s*["'](.*)["']\s*\)$/);
                if (printStrMatch) {
                    outputLines.push(printStrMatch[1]);
                    i++; continue;
                }

                i++;
            }

            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code!');
        } catch {
            setOutput('Error in code!');
        }
    };

    const quizQuestions = [
        {
            question: 'When does the else code run?',
            options: ['When if is False', 'When if is True', 'Always'],
            correctAnswer: 0,
            explanation: 'The else block only runs when the if condition is False!'
        },
        {
            question: 'Does else need a condition?',
            options: ['No', 'Yes'],
            correctAnswer: 0,
            explanation: 'else catches everything that the if didn\'t catch - no condition needed!'
        }
    ];

    const checkQuiz = () => {
        setQuizChecked(true);
        const currentQ = quizQuestions[quizStep];
        if (quizAnswer === currentQ.correctAnswer) {
            setTimeout(() => {
                if (quizStep < quizQuestions.length - 1) {
                    setQuizStep(quizStep + 1);
                    setQuizAnswer(null);
                    setQuizChecked(false);
                } else {
                    addXpAndCoins(LESSON.xpReward, 5);
                    completeLevel(LESSON_ID, LESSON.xpReward, 5, 1, 60);
                    setLessonComplete(true);
                }
            }, 1000);
        }
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
                    style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}
                >
                    <Check size={50} className="text-white" />
                </motion.div>
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={styles.successTitle}
                >
                    {LESSON.successMessage}
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={styles.successMessage}
                >
                    Now Robo knows what to do when things are NOT true!
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
                    <Link href="/level2/lesson5" className={`${styles.navBtn} ${styles.primary}`}>
                        Next Lesson <ChevronRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/level2" className={styles.backBtn}>
                    <ArrowLeft size={18} /> Back
                </Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 18</span>
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
                        <div className={styles.lessonTitle}>
                            <motion.div
                                className={styles.lessonEmoji}
                                animate={{ x: [-5, 5, -5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                {LESSON.emoji}
                            </motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Story Introduction with Robot at Crossroads */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                                {/* Robot at Crossroads Animation */}
                                <div style={{
                                    position: 'relative',
                                    width: '80px',
                                    height: '80px',
                                    flexShrink: 0
                                }}>
                                    {/* Two paths */}
                                    <svg viewBox="0 0 80 80" style={{ position: 'absolute', width: '100%', height: '100%' }}>
                                        {/* Left path (if True) */}
                                        <motion.path
                                            d="M40 50 L15 15"
                                            stroke={robotPath === 'left' ? '#10b981' : 'rgba(16, 185, 129, 0.4)'}
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            fill="none"
                                            animate={{
                                                stroke: robotPath === 'left' ? '#10b981' : 'rgba(16, 185, 129, 0.4)'
                                            }}
                                        />
                                        {/* Right path (else) */}
                                        <motion.path
                                            d="M40 50 L65 15"
                                            stroke={robotPath === 'right' ? '#3b82f6' : 'rgba(59, 130, 246, 0.4)'}
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            fill="none"
                                            animate={{
                                                stroke: robotPath === 'right' ? '#3b82f6' : 'rgba(59, 130, 246, 0.4)'
                                            }}
                                        />
                                        {/* Labels */}
                                        <text x="8" y="10" fill="#10b981" fontSize="8" fontWeight="bold">if</text>
                                        <text x="58" y="10" fill="#3b82f6" fontSize="8" fontWeight="bold">else</text>
                                    </svg>
                                    {/* Robot */}
                                    <motion.div
                                        animate={
                                            robotPath === 'left'
                                                ? { x: -15, y: -20 }
                                                : robotPath === 'right'
                                                    ? { x: 15, y: -20 }
                                                    : { x: [0, -3, 3, 0], y: 0 }
                                        }
                                        transition={
                                            robotPath
                                                ? { duration: 0.5 }
                                                : { duration: 2, repeat: Infinity }
                                        }
                                        style={{
                                            position: 'absolute',
                                            bottom: '5px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            fontSize: '1.5rem'
                                        }}
                                    >
                                        🤖
                                    </motion.div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
                                        <GitFork size={24} className="text-emerald-400" />
                                        Robo's Guessing Game!
                                    </div>
                                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                                        If the guess is right, celebrate! But what happens when it's wrong? We need <code>else</code> to handle that!
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Main Explanation */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Bot size={20} className="text-blue-400" /> What is else?
                            </h3>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ fontSize: '1.25rem' }}>🔄</span>
                                    <div>
                                        <code style={{ color: '#3b82f6' }}>else</code> = "otherwise, do this instead"
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ fontSize: '1.25rem' }}>❌</span>
                                    <div>
                                        <code>else</code> only runs when the <code>if</code> condition is <span style={{ color: '#ef4444' }}>False</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ fontSize: '1.25rem' }}>🎯</span>
                                    <div>
                                        <code>else</code> doesn't need a condition - it catches everything else!
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ fontSize: '1.25rem' }}>:</span>
                                    <div>
                                        The colon <code>:</code> after else means "here's what to do if the if was False"
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Code Example */}
                        <div className={styles.codeSection}>
                            <h3>Example: The Guessing Game</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}>
                                    <span>main.py</span>
                                    <span>Python</span>
                                </div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># Set up the game</span>{'\n'}
                                    guess = <span className={styles.number}>5</span>{'\n'}
                                    secret = <span className={styles.number}>7</span>{'\n\n'}
                                    <span className={styles.comment}># Check if they match</span>{'\n'}
                                    <span className={styles.keyword}>if</span> guess == secret:{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"You got it!"</span>){'\n'}
                                    <span className={styles.keyword}>else</span>:{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"Nope, try again!"</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output (since 5 != 7):</div>
                                <div className={styles.outputText}>Nope, try again!</div>
                            </div>
                        </div>

                        {/* Visual Explanation */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem',
                                marginBottom: '1.5rem'
                            }}
                        >
                            <div style={{
                                background: 'rgba(16, 185, 129, 0.15)',
                                border: '2px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: '0.75rem',
                                padding: '1rem',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontWeight: 700, color: '#10b981', marginBottom: '0.5rem' }}>
                                    If TRUE
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    Run the if block
                                </div>
                                <div style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>✅</div>
                            </div>
                            <div style={{
                                background: 'rgba(59, 130, 246, 0.15)',
                                border: '2px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '0.75rem',
                                padding: '1rem',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: '0.5rem' }}>
                                    Else (FALSE)
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    Run the else block
                                </div>
                                <div style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>🔀</div>
                            </div>
                        </motion.div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3>Your Turn!</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                Change the guess to match the secret (7) and watch it switch from "Nope" to "You got it!"
                            </p>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}>
                                    <span>your_code.py</span>
                                    <span>Python</span>
                                </div>
                                <textarea
                                    value={code}
                                    onChange={(e) => {
                                        setCode(e.target.value);
                                        setRobotPath(null);
                                    }}
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
                                        {output.includes('You got it') ? '🎉 Result:' : '🤖 Result:'}
                                    </div>
                                    <div className={styles.outputText}>{output}</div>
                                </motion.div>
                            )}
                        </div>

                        {/* Tip Box */}
                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Remember:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li><code>if</code> checks a condition</li>
                                    <li><code>else</code> handles everything the <code>if</code> didn't catch</li>
                                    <li>Only ONE path runs - never both!</li>
                                </ul>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className={styles.navBar}>
                            <Link href="/level2/lesson3" className={`${styles.navBtn} ${styles.secondary}`}>
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
                        <h2 className={styles.quizTitle}>Brain Check! ({quizStep + 1}/{quizQuestions.length})</h2>
                        <p className={styles.quizQuestion}>
                            {quizQuestions[quizStep].question}
                        </p>

                        <div className={styles.quizOptions}>
                            {quizQuestions[quizStep].options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => !quizChecked && setQuizAnswer(idx)}
                                    className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''
                                        } ${quizChecked && idx === quizQuestions[quizStep].correctAnswer ? styles.correct : ''
                                        } ${quizChecked && quizAnswer === idx && idx !== quizQuestions[quizStep].correctAnswer ? styles.wrong : ''
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
                        ) : quizAnswer !== quizQuestions[quizStep].correctAnswer ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.quizFeedback} ${styles.error}`}
                            >
                                <h4>Not quite!</h4>
                                <p>{quizQuestions[quizStep].explanation}</p>
                                <button
                                    className={styles.quizBtn}
                                    onClick={() => { setQuizChecked(false); setQuizAnswer(null); }}
                                    style={{ marginTop: '1rem' }}
                                >
                                    Try Again
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    border: '2px solid rgba(16, 185, 129, 0.3)',
                                    borderRadius: '0.75rem',
                                    padding: '1rem',
                                    textAlign: 'center',
                                    marginTop: '1rem'
                                }}
                            >
                                <span style={{ fontSize: '1.5rem' }}>✅</span>
                                <p style={{ color: '#10b981', fontWeight: 600 }}>Correct!</p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
