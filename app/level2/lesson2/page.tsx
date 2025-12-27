'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL2_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL2_LESSONS[1]; // Lesson 2
const LESSON_ID = 17;

export default function Lesson2() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizStep, setQuizStep] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null, null]);
    const [quizChecked, setQuizChecked] = useState([false, false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [challengesDone, setChallengesDone] = useState<boolean[]>([false, false]);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let variables: { [key: string]: number } = {};
            let outputLines: string[] = [];
            const newChallenges = [...challengesDone];

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) continue;

                // Variable assignment: age = 10
                const assignMatch = trimmed.match(/^(\w+)\s*=\s*(\d+)$/);
                if (assignMatch) {
                    variables[assignMatch[1]] = parseInt(assignMatch[2]);
                    newChallenges[0] = true; // Changed the age
                    continue;
                }

                // If statement with comparison
                const ifMatch = trimmed.match(/^if\s+(\w+)\s*(>=|<=|==|!=|>|<)\s*(\d+)\s*:$/);
                if (ifMatch) {
                    const [, varName, operator, numStr] = ifMatch;
                    const varValue = variables[varName];
                    const compareValue = parseInt(numStr);

                    if (varValue === undefined) {
                        outputLines.push(`Oops! "${varName}" doesn't exist yet. Create it first!`);
                        continue;
                    }

                    let condition = false;
                    switch (operator) {
                        case '==': condition = varValue === compareValue; break;
                        case '!=': condition = varValue !== compareValue; break;
                        case '>': condition = varValue > compareValue; break;
                        case '<': condition = varValue < compareValue; break;
                        case '>=': condition = varValue >= compareValue; break;
                        case '<=': condition = varValue <= compareValue; break;
                    }

                    // Check for != usage
                    if (operator === '!=') {
                        newChallenges[1] = true;
                    }

                    // Look for the next line (the print inside if)
                    const lineIndex = lines.indexOf(line);
                    if (lineIndex + 1 < lines.length) {
                        const nextLine = lines[lineIndex + 1].trim();
                        const printMatch = nextLine.match(/^print\s*\(["'](.*)["']\)$/);
                        if (printMatch && condition) {
                            outputLines.push(printMatch[1]);
                        }
                    }
                    continue;
                }

                // Print with string
                const printStrMatch = trimmed.match(/^print\s*\(["'](.*)["']\)$/);
                if (printStrMatch && !lines.some(l => l.trim().startsWith('if '))) {
                    outputLines.push(printStrMatch[1]);
                    continue;
                }

                // Print with variable
                const printVarMatch = trimmed.match(/^print\s*\((\w+)\)$/);
                if (printVarMatch) {
                    const varName = printVarMatch[1];
                    if (variables[varName] !== undefined) {
                        outputLines.push(String(variables[varName]));
                    }
                    continue;
                }
            }

            setChallengesDone(newChallenges);
            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code! Try the example.');
        } catch {
            setOutput('Error in code!');
        }
    };

    const checkQuiz = () => {
        const correctAnswers = [0, 0, 0]; // "Are these the same?", "Greater than", "Not equal"
        const newChecked = [...quizChecked];
        newChecked[quizStep] = true;
        setQuizChecked(newChecked);

        if (quizAnswers[quizStep] === correctAnswers[quizStep]) {
            if (quizStep < 2) {
                setTimeout(() => {
                    setQuizStep(quizStep + 1);
                    newChecked[quizStep] = false;
                    setQuizChecked(newChecked);
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
                    Question Asker Achieved!
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={styles.successMessage}
                >
                    {LESSON.successMessage}
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
                    <Link href="/level2/lesson3" className={`${styles.navBtn} ${styles.primary}`}>
                        Next Lesson <ChevronRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    const quizQuestions = [
        {
            question: 'What does == mean in Python?',
            options: ['Are these the same?', 'Add these together', 'Copy this'],
            correct: 0
        },
        {
            question: 'What does > mean in Python?',
            options: ['Greater than', 'Less than', 'Equal to'],
            correct: 0
        },
        {
            question: 'What does != mean in Python?',
            options: ['Not equal', 'Equals', 'Greater than'],
            correct: 0
        }
    ];

    return (
        <div className={styles.container}>
            {/* Header */}
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
                        {/* Lesson Title with Robot Animation */}
                        <div className={styles.lessonTitle}>
                            <motion.div
                                className={styles.lessonEmoji}
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                {LESSON.emoji}
                            </motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Story Introduction - Robot at Signpost */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <motion.span
                                    style={{ fontSize: '2rem' }}
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    🤖
                                </motion.span>
                                <span style={{ fontSize: '1.5rem' }}>🎢</span>
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Mission: Roller Coaster Checker!</span>
                            </div>
                            <p>
                                Robo needs to check if players are old enough to ride the roller coaster!
                                Help Robo ask yes/no questions about age.
                            </p>
                        </motion.div>

                        {/* Main Explanation */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Sparkles size={20} className="text-amber-400" /> Comparison Operators
                            </h3>
                            <p style={{ marginBottom: '1rem' }}>
                                These symbols ask questions that Python answers with True or False:
                            </p>

                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ background: 'rgba(80, 250, 123, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <code style={{ fontSize: '1.3rem', color: '#50fa7b', minWidth: '50px' }}>==</code>
                                    <span>"Two equals signs asks <strong>'are these the same?'</strong>"</span>
                                </div>

                                <div style={{ background: 'rgba(255, 121, 198, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <code style={{ fontSize: '1.3rem', color: '#ff79c6', minWidth: '50px' }}>!=</code>
                                    <span>"Means <strong>'are these NOT the same?'</strong>"</span>
                                </div>

                                <div style={{ background: 'rgba(139, 233, 253, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <code style={{ fontSize: '1.3rem', color: '#8be9fd', minWidth: '50px' }}>&gt;</code>
                                    <span>"<strong>Is the left number bigger?</strong>"</span>
                                </div>

                                <div style={{ background: 'rgba(255, 184, 108, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <code style={{ fontSize: '1.3rem', color: '#ffb86c', minWidth: '50px' }}>&lt;</code>
                                    <span>"<strong>Is the left number smaller?</strong>"</span>
                                </div>

                                <div style={{ background: 'rgba(189, 147, 249, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <code style={{ fontSize: '1.3rem', color: '#bd93f9', minWidth: '50px' }}>&gt;=</code>
                                    <span>"<strong>Bigger OR equal?</strong>"</span>
                                </div>

                                <div style={{ background: 'rgba(241, 250, 140, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <code style={{ fontSize: '1.3rem', color: '#f1fa8c', minWidth: '50px' }}>&lt;=</code>
                                    <span>"<strong>Smaller OR equal?</strong>"</span>
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
                                    age = <span className={styles.number}>10</span>{'\n\n'}
                                    <span className={styles.keyword}>if</span> age &gt;= <span className={styles.number}>8</span>:{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"You can ride!"</span>){'\n\n'}
                                    <span className={styles.keyword}>if</span> age == <span className={styles.number}>10</span>:{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"You're exactly 10!"</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>
                                    You can ride!{'\n'}
                                    You're exactly 10!
                                </div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3>Your Turn - Check Ages!</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                Change the age and try different comparisons!
                            </p>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}>
                                    <span>your_code.py</span>
                                    <span>Python</span>
                                </div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder={'age = 10\n\nif age >= 8:\n    print("You can ride!")\n\nif age == 10:\n    print("You\'re exactly 10!")'}
                                    spellCheck={false}
                                    style={{ minHeight: '150px' }}
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
                                        {output.includes('Oops') ? 'Error:' : 'Output:'}
                                    </div>
                                    <div className={`${styles.outputText} ${output.includes('Oops') ? 'error' : ''}`}>
                                        {output}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Mini Challenges */}
                        <div className={styles.challenges}>
                            <h3>Your Turn Challenge:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${challengesDone[0] ? styles.done : ''}`}>
                                        {challengesDone[0] && <Check size={14} />}
                                    </div>
                                    Change the age to different numbers
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${challengesDone[1] ? styles.done : ''}`}>
                                        {challengesDone[1] && <Check size={14} />}
                                    </div>
                                    Try using != to check if age is NOT equal to something
                                </li>
                            </ul>
                        </div>

                        {/* Tips */}
                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Remember:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li><code>=</code> assigns a value (age = 10)</li>
                                    <li><code>==</code> checks if things are equal (is age the same as 10?)</li>
                                    <li>Don't mix them up! Two equals for questions!</li>
                                </ul>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className={styles.navBar}>
                            <Link href="/level2/lesson1" className={`${styles.navBtn} ${styles.secondary}`}>
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
                    /* Quiz */
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
                        <h2 className={styles.quizTitle}>Brain Check! ({quizStep + 1}/3)</h2>
                        <p className={styles.quizQuestion}>
                            {quizQuestions[quizStep].question}
                        </p>

                        <div className={styles.quizOptions}>
                            {quizQuestions[quizStep].options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        if (!quizChecked[quizStep]) {
                                            const newAnswers = [...quizAnswers];
                                            newAnswers[quizStep] = idx;
                                            setQuizAnswers(newAnswers);
                                        }
                                    }}
                                    className={`${styles.quizOption} ${quizAnswers[quizStep] === idx ? styles.selected : ''
                                        } ${quizChecked[quizStep] && idx === quizQuestions[quizStep].correct ? styles.correct : ''
                                        } ${quizChecked[quizStep] && quizAnswers[quizStep] === idx && idx !== quizQuestions[quizStep].correct ? styles.wrong : ''
                                        }`}
                                    disabled={quizChecked[quizStep]}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>

                        {!quizChecked[quizStep] ? (
                            <button
                                className={styles.quizBtn}
                                onClick={checkQuiz}
                                disabled={quizAnswers[quizStep] === null}
                            >
                                Check Answer
                            </button>
                        ) : quizAnswers[quizStep] !== quizQuestions[quizStep].correct ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.quizFeedback} ${styles.error}`}
                            >
                                <h4>Not quite!</h4>
                                <p>
                                    {quizStep === 0 && "== uses two equals signs to ask 'are these the same?'"}
                                    {quizStep === 1 && "> means greater than - is the left number bigger?"}
                                    {quizStep === 2 && "!= means not equal - are these different?"}
                                </p>
                                <button
                                    className={styles.quizBtn}
                                    onClick={() => {
                                        const newChecked = [...quizChecked];
                                        newChecked[quizStep] = false;
                                        setQuizChecked(newChecked);
                                        const newAnswers = [...quizAnswers];
                                        newAnswers[quizStep] = null;
                                        setQuizAnswers(newAnswers);
                                    }}
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
                                <p>{quizStep < 2 ? 'Moving to next question...' : 'Great job!'}</p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
