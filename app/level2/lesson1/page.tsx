'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Bot, Signpost } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL2_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL2_LESSONS[0]; // Lesson 1
const LESSON_ID = 16; // Level 2 lessons start at 16 for tracking

export default function Lesson1() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('has_key = True\n\nif has_key:\n    print("Robo goes forward!")\n    print("Robo found the treasure!")');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasTriedFalse, setHasTriedFalse] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            let variables: Record<string, boolean | string | number> = {};
            let inIfBlock = false;
            let ifConditionTrue = false;

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) continue;

                // Variable assignment (True/False)
                const assignMatch = trimmed.match(/^(\w+)\s*=\s*(True|False)$/);
                if (assignMatch) {
                    const [, varName, value] = assignMatch;
                    variables[varName] = value === 'True';
                    continue;
                }

                // If statement
                const ifMatch = trimmed.match(/^if\s+(\w+)\s*:$/);
                if (ifMatch) {
                    const varName = ifMatch[1];
                    inIfBlock = true;
                    ifConditionTrue = variables[varName] === true;
                    continue;
                }

                // Indented print (inside if block)
                if (line.startsWith('    ') || line.startsWith('\t')) {
                    const printMatch = trimmed.match(/^print\s*\(["'](.*)["']\)$/);
                    if (printMatch && inIfBlock) {
                        if (ifConditionTrue) {
                            outputLines.push(printMatch[1]);
                        }
                    }
                    continue;
                }

                // Non-indented line ends if block
                if (!line.startsWith('    ') && !line.startsWith('\t')) {
                    inIfBlock = false;
                }

                // Regular print
                const printMatch = trimmed.match(/^print\s*\(["'](.*)["']\)$/);
                if (printMatch) {
                    outputLines.push(printMatch[1]);
                }
            }

            if (outputLines.length > 0) {
                setOutput(outputLines.join('\n'));
            } else {
                // Check if they changed to False
                if (code.includes('has_key = False') || code.includes('has_key=False')) {
                    setHasTriedFalse(true);
                    setOutput('(Nothing printed! The condition was False, so Python skipped the indented code.)');
                } else {
                    setOutput('Run your code to see what happens!');
                }
            }
        } catch {
            setOutput('Error in code! Check your syntax.');
        }
    };

    const checkQuiz = () => {
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = true;
        setQuizChecked(newChecked);

        const correctAnswers = [0, 0]; // First quiz: answer 0, Second quiz: answer 0

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
                    Decision Maker Unlocked!
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={styles.successMessage}
                >
                    {LESSON.successMessage} You taught Robo how to make choices!
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
                    <Link href="/level2/lesson2" className={`${styles.navBtn} ${styles.primary}`}>
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

                        {/* Story Introduction - Robot at Crossroads */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Bot size={28} className="text-indigo-400" />
                                <Signpost size={24} className="text-amber-400" />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Mission: Help Robo Choose!</span>
                            </div>

                            {/* Robot at Crossroads Animation */}
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
                                    animate={{ x: [-5, 5, -5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{ fontSize: '2.5rem', marginRight: '1rem' }}
                                >
                                    🤖
                                </motion.div>
                                <div style={{ textAlign: 'center' }}>
                                    <motion.div
                                        animate={{ rotate: [0, 5, -5, 0] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        style={{ fontSize: '2rem' }}
                                    >
                                        🪧
                                    </motion.div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                        "TREASURE AHEAD"
                                    </div>
                                </div>
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    style={{ fontSize: '2rem', marginLeft: '1rem' }}
                                >
                                    💎
                                </motion.div>
                            </div>

                            <p>
                                Robo is standing at a crossroads! There's a sign that says <strong>"TREASURE AHEAD"</strong> but only if you have a key.
                            </p>
                            <p style={{ marginTop: '0.75rem' }}>
                                Help Robo decide whether to go forward or turn back!
                            </p>
                        </motion.div>

                        {/* Main Explanation */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Lightbulb size={20} className="text-amber-400" /> How Computers Make Decisions
                            </h3>
                            <p>
                                Just like you decide things every day ("If it's raining, I'll bring an umbrella"),
                                computers can make decisions too! We use the magic word <code>if</code>.
                            </p>

                            <div style={{ marginTop: '1.5rem' }}>
                                <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Let's break it down:</p>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <span>🔑</span>
                                        <span><code style={{ color: '#ff79c6' }}>if</code> = "if this is true, do this"</span>
                                    </li>
                                    <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <span>:</span>
                                        <span>The <code>:</code> colon means "here's what to do"</span>
                                    </li>
                                    <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <span>➡️</span>
                                        <span><strong>Indentation</strong> = code pushed to the right belongs to the if</span>
                                    </li>
                                    <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <span>✅</span>
                                        <span><code>True</code> / <code>False</code> = the computer's way of saying yes or no</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Example Code */}
                        <div className={styles.codeSection}>
                            <h3>📝 Example</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}>
                                    <span>main.py</span>
                                    <span>Python</span>
                                </div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># Does Robo have the key?</span>{'\n'}
                                    <span className={styles.variable}>has_key</span> = <span className={styles.keyword}>True</span>{'\n\n'}
                                    <span className={styles.keyword}>if</span> <span className={styles.variable}>has_key</span>:{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"Robo goes forward!"</span>){'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"Robo found the treasure!"</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>
                                    Robo goes forward!{'\n'}
                                    Robo found the treasure!
                                </div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3>🎮 Your Turn - Help Robo Decide!</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                Try changing <code>has_key = True</code> to <code>has_key = False</code> and see what happens!
                            </p>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}>
                                    <span>your_code.py</span>
                                    <span>Python</span>
                                </div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder='has_key = True

if has_key:
    print("Robo goes forward!")
    print("Robo found the treasure!")'
                                    spellCheck={false}
                                    style={{ minHeight: '140px' }}
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
                                        {output.includes('Nothing printed') ? '🤔 Result:' : '🤖 Output:'}
                                    </div>
                                    <div className={`${styles.outputText} ${output.includes('Nothing printed') ? '' : ''}`}
                                        style={{ color: output.includes('Nothing printed') ? '#fbbf24' : '#50fa7b' }}
                                    >
                                        {output}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Challenge Tracker */}
                        <div className={styles.challenges}>
                            <h3>🎯 Your Turn Challenge:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasTriedFalse ? styles.done : ''}`}>
                                        {hasTriedFalse && <Check size={14} />}
                                    </div>
                                    Change <code>has_key = True</code> to <code>has_key = False</code>
                                </li>
                                <li style={{ color: 'var(--text-muted)', paddingLeft: '2.5rem' }}>
                                    See what happens - nothing prints! Python skips the indented code when the condition is False.
                                </li>
                            </ul>
                        </div>

                        {/* Tip Box */}
                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Remember:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li>The indented code ONLY runs when the condition is <code>True</code></li>
                                    <li>Always use a colon <code>:</code> after your if statement</li>
                                    <li>Use 4 spaces (or Tab) to indent the code that belongs to the if</li>
                                </ul>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className={styles.navBar}>
                            <Link href="/level2" className={`${styles.navBtn} ${styles.secondary}`}>
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
                                    What does <code>if</code> do in Python?
                                </p>
                                <div className={styles.quizOptions}>
                                    {[
                                        'Checks if something is true',
                                        'Prints text to the screen',
                                        'Makes a list of items'
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
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>
                                    What symbol comes after an <code>if</code> condition?
                                </p>
                                <div className={styles.quizOptions}>
                                    {[
                                        ': (colon)',
                                        '; (semicolon)',
                                        '. (period)'
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
                                                } ${quizChecked[1] && idx === 0 ? styles.correct : ''
                                                } ${quizChecked[1] && quizAnswers[1] === idx && idx !== 0 ? styles.wrong : ''
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
                        ) : quizAnswers[currentQuiz] !== (currentQuiz === 0 ? 0 : 0) ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.quizFeedback} ${styles.error}`}
                            >
                                <h4>Not quite!</h4>
                                <p>
                                    {currentQuiz === 0
                                        ? 'The "if" keyword checks if something is true, then runs the indented code if it is!'
                                        : 'In Python, we use a colon : after the if condition to say "here\'s what to do"'
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
