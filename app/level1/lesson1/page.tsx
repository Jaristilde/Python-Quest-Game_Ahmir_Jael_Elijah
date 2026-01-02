'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Sparkles, Bot } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, getAvatarEmoji } from '../../context/AuthContext';
import { LEVEL1_LESSONS } from '../lessonData';
import { detectKidFriendlyError, KidFriendlyError } from '../../utils/errorDetector';
import KidFriendlyErrorComponent from '../../components/KidFriendlyError';
import SuccessCelebration from '../../components/SuccessCelebration';
import { getRandomCelebration } from '../../utils/celebrationMessages';
import styles from '../lessons.module.css';

const LESSON = LEVEL1_LESSONS[0]; // Lesson 1

export default function Lesson1() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizChecked, setQuizChecked] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [challengesDone, setChallengesDone] = useState<boolean[]>([false, false, false]);
    const [kidError, setKidError] = useState<KidFriendlyError | null>(null);
    const [showCelebration, setShowCelebration] = useState(false);
    const [celebrationData, setCelebrationData] = useState({ message: '', subMessage: '' });
    const editorRef = useRef<HTMLTextAreaElement>(null);

    // Reset all state when lesson loads/reloads (fixes navigation back bug)
    useEffect(() => {
        setCode('');
        setOutput('');
        setShowQuiz(false);
        setQuizAnswer(null);
        setQuizChecked(false);
        setKidError(null);
        setShowCelebration(false);
        setCelebrationData({ message: '', subMessage: '' });
        // Don't reset challengesDone or lessonComplete - those should persist
    }, []);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    // Clear previous results when code changes (user starts typing new code)
    const handleCodeChange = (newCode: string) => {
        setCode(newCode);
        // Clear previous success/error when user modifies code
        if (showCelebration || kidError || output) {
            setShowCelebration(false);
            setKidError(null);
            setOutput('');
        }
    };

    const runCode = () => {
        const trimmed = code.trim();

        // Always clear previous state before evaluating
        setKidError(null);
        setOutput('');
        setShowCelebration(false);

        // More flexible regex that handles apostrophes inside double quotes
        const printMatch = trimmed.match(/^print\s*\(["'](.*)["']\)$/);

        if (printMatch) {
            const message = printMatch[1];
            setOutput(message);

            // Check challenges
            const newChallenges = [...challengesDone];
            if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
                newChallenges[0] = true;
            }
            if (message.length > 0) {
                newChallenges[1] = true;
            }
            if (message.includes('!')) {
                newChallenges[2] = true;
            }
            setChallengesDone(newChallenges);

            // Show celebration for successful code execution!
            const celebration = getRandomCelebration();
            setCelebrationData(celebration);
            setShowCelebration(true);
        } else if (trimmed === '') {
            setOutput('Type some code and click Run!');
        } else {
            // Determine the error type and show kid-friendly message
            let errorMessage = '';

            if (!trimmed.toLowerCase().startsWith('print')) {
                errorMessage = 'invalid syntax';
            } else if (!trimmed.includes('(') || !trimmed.includes(')')) {
                errorMessage = 'unexpected eof';
            } else if (!trimmed.includes('"') && !trimmed.includes("'")) {
                errorMessage = 'name error not defined';
            } else {
                errorMessage = 'syntaxerror';
            }

            const friendlyError = detectKidFriendlyError(trimmed, errorMessage);
            setKidError(friendlyError);
            setOutput('');
        }
    };

    const handleTryAgain = () => {
        setKidError(null);
        setOutput('');
        // Focus the editor
        if (editorRef.current) {
            editorRef.current.focus();
        }
    };

    const handleCelebrationContinue = () => {
        setShowCelebration(false);
    };

    const checkQuiz = () => {
        setQuizChecked(true);
        if (quizAnswer === 0) {
            setTimeout(() => {
                addXpAndCoins(LESSON.xpReward, 5);
                completeLevel(LESSON.id, LESSON.xpReward, 5, 1, 60);
                setLessonComplete(true);
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
                >
                    <Check size={50} className="text-white" />
                </motion.div>
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={styles.successTitle}
                >
                    🎉 AWESOME JOB! 🎉
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={styles.successMessage}
                >
                    You taught Robo-1 to talk! {LESSON.successMessage}
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
                    <Link href="/level1/lesson2" className={`${styles.navBtn} ${styles.primary}`}>
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
                <Link href="/level1" className={styles.backBtn}>
                    <ArrowLeft size={18} /> Back
                </Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 15</span>
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

                        {/* Story Introduction */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Bot size={28} className="text-indigo-400" />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Mission: Wake Up Robo-1!</span>
                            </div>
                            <p>
                                Robo-1 is a friendly robot who just woke up, but he forgot how to talk! 🤖
                            </p>
                            <p style={{ marginTop: '0.75rem' }}>
                                <strong>Your job:</strong> Teach Robo-1 to say things using the magic word <code>print</code>
                            </p>
                        </motion.div>

                        {/* Main Explanation */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Sparkles size={20} className="text-amber-400" /> How It Works
                            </h3>
                            <p>
                                To make your computer say something, use this magic spell:
                            </p>
                            <div style={{
                                background: 'rgba(0,0,0,0.3)',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                margin: '1rem 0',
                                fontFamily: 'monospace',
                                fontSize: '1.2rem',
                                textAlign: 'center'
                            }}>
                                <span style={{ color: '#ff79c6' }}>print</span>
                                <span style={{ color: '#f8f8f2' }}>(</span>
                                <span style={{ color: '#50fa7b' }}>"Hello!"</span>
                                <span style={{ color: '#f8f8f2' }}>)</span>
                            </div>

                            <div style={{ marginTop: '1rem' }}>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Let's break it down:</p>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <span>📢</span>
                                        <span><code style={{ color: '#ff79c6' }}>print</code> = the command that tells the computer to speak</span>
                                    </li>
                                    <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <span>🤲</span>
                                        <span><code>()</code> = parentheses are like hands holding the message</span>
                                    </li>
                                    <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <span>💬</span>
                                        <span><code>""</code> = quotation marks wrap around your message like a gift box</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Example Code */}
                        <div className={styles.codeSection}>
                            <h3>📝 Examples</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}>
                                    <span>main.py</span>
                                    <span>Python</span>
                                </div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># Say hello to the world!</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"Hello, World!"</span>){'\n\n'}
                                    <span className={styles.comment}># Tell everyone your favorite game</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"I love Minecraft!"</span>){'\n\n'}
                                    <span className={styles.comment}># Make robot sounds!</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"Beep boop! 🤖"</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>
                                    Hello, World!{'\n'}
                                    I love Minecraft!{'\n'}
                                    Beep boop! 🤖
                                </div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3>🎮 Your Turn - Wake Up Robo-1!</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                Type your first Python code below. Make Robo-1 say something!
                            </p>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}>
                                    <span>your_code.py</span>
                                    <span>Python</span>
                                </div>
                                <textarea
                                    ref={editorRef}
                                    value={code}
                                    onChange={(e) => handleCodeChange(e.target.value)}
                                    placeholder='print("Hello, I am Robo-1!")'
                                    spellCheck={false}
                                />
                            </div>
                            <button className={styles.runBtn} onClick={runCode}>
                                <Play size={18} /> Run Code
                            </button>

                            {/* Kid-Friendly Error Display */}
                            {kidError && (
                                <KidFriendlyErrorComponent
                                    title={kidError.title}
                                    explanation={kidError.explanation}
                                    tip={kidError.tip}
                                    emoji={kidError.emoji}
                                    onTryAgain={handleTryAgain}
                                />
                            )}

                            {/* Success Output */}
                            {output && !kidError && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={styles.outputBox}
                                    style={{ borderColor: '#50FA7B' }}
                                >
                                    <div className={styles.outputLabel} style={{ color: '#50FA7B' }}>
                                        Robo-1 says:
                                    </div>
                                    <div className={styles.outputText}>
                                        {output}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Mini Challenges */}
                        <div className={styles.challenges}>
                            <h3>🎯 Mini Challenges:</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Complete these to master the lesson!
                            </p>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${challengesDone[0] ? styles.done : ''}`}>
                                        {challengesDone[0] && <Check size={14} />}
                                    </div>
                                    Make Robo-1 say "Hello" or "Hi"
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${challengesDone[1] ? styles.done : ''}`}>
                                        {challengesDone[1] && <Check size={14} />}
                                    </div>
                                    Print your own custom message
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${challengesDone[2] ? styles.done : ''}`}>
                                        {challengesDone[2] && <Check size={14} />}
                                    </div>
                                    Use an exclamation mark ! in your message
                                </li>
                            </ul>
                        </div>

                        {/* Common Mistakes */}
                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Watch Out For:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li><code>Print</code> won't work - use lowercase <code>print</code></li>
                                    <li>Don't forget the parentheses <code>()</code></li>
                                    <li>Put quotes <code>""</code> around your message</li>
                                </ul>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className={styles.navBar}>
                            <Link href="/level1" className={`${styles.navBtn} ${styles.secondary}`}>
                                <ChevronLeft size={18} /> Back to Lessons
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
                        <h2 className={styles.quizTitle}>Brain Check!</h2>
                        <p className={styles.quizQuestion}>
                            Which code makes Robo-1 say <strong>"Wow"</strong>?
                        </p>

                        <div className={styles.quizOptions}>
                            {[
                                'print("Wow")',
                                'say("Wow")',
                                'Print("Wow")'
                            ].map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => !quizChecked && setQuizAnswer(idx)}
                                    className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''
                                        } ${quizChecked && idx === 0 ? styles.correct : ''
                                        } ${quizChecked && quizAnswer === idx && idx !== 0 ? styles.wrong : ''
                                        }`}
                                    disabled={quizChecked}
                                >
                                    <code>{option}</code>
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
                        ) : quizAnswer !== 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.quizFeedback} ${styles.error}`}
                            >
                                <h4>Not quite! 🤔</h4>
                                <p>
                                    {quizAnswer === 1
                                        ? 'Python doesn\'t have a "say" command. We use print()!'
                                        : 'Remember: Python commands are lowercase. Use print, not Print!'}
                                </p>
                                <button
                                    className={styles.quizBtn}
                                    onClick={() => { setQuizChecked(false); setQuizAnswer(null); }}
                                    style={{ marginTop: '1rem' }}
                                >
                                    Try Again
                                </button>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>

            {/* Success Celebration Popup */}
            {showCelebration && (
                <SuccessCelebration
                    message={celebrationData.message}
                    subMessage={celebrationData.subMessage}
                    xpEarned={5}
                    coinsEarned={2}
                    onContinue={handleCelebrationContinue}
                />
            )}
        </div>
    );
}
