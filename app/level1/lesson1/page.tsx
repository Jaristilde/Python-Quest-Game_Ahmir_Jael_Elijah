'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, getAvatarEmoji } from '../../context/AuthContext';
import { LEVEL1_LESSONS } from '../lessonData';
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

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    const runCode = () => {
        // Simulate Python execution
        const trimmed = code.trim();
        const printMatch = trimmed.match(/^print\s*\(["'](.*)["']\)$/);

        if (printMatch) {
            setOutput(printMatch[1]);
        } else if (trimmed.startsWith('print')) {
            setOutput('Error: Check your quotes "" and parentheses ()');
        } else if (trimmed === '') {
            setOutput('Type some code first!');
        } else {
            setOutput('Error: Try using print("your message")');
        }
    };

    const checkQuiz = () => {
        setQuizChecked(true);
        if (quizAnswer === 0) {
            // Correct!
            setTimeout(() => {
                addXpAndCoins(LESSON.xpReward, 5);
                completeLevel(LESSON.id, LESSON.xpReward, 5, 1, 60);
                setLessonComplete(true);
            }, 1000);
        }
    };

    if (isLoading || !user) {
        return <div className={styles.container}><div className="flex items-center justify-center h-screen text-slate-400">Loading...</div></div>;
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={styles.successIcon}
                >
                    <Check size={50} className="text-white" />
                </motion.div>
                <h2 className={styles.successTitle}>🎉 CORRECT!</h2>
                <p className={styles.successMessage}>{LESSON.successMessage}</p>
                <div className={styles.successXp}>
                    <Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP
                </div>
                <Link href="/level1/lesson2" className={`${styles.navBtn} ${styles.primary}`}>
                    Next Lesson <ChevronRight size={18} />
                </Link>
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
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 10</span>
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
                            <div className={styles.lessonEmoji}>{LESSON.emoji}</div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: {LESSON.concept}</p>
                            </div>
                        </div>

                        {/* Explanation */}
                        <div className={styles.explainBox}>
                            <p>Your computer can talk! 🗣️</p>
                            <p style={{ marginTop: '1rem' }}>
                                To make it say something, type: <code>print("Hello!")</code>
                            </p>
                            <p style={{ marginTop: '1rem' }}>
                                Whatever you put inside the quotes, your computer says it!
                            </p>
                            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
                                It's like texting - but to your computer 📱
                            </p>
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
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"Hello!"</span>)
                                </div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3>🎮 Your Turn - Try It!</h3>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}>
                                    <span>your_code.py</span>
                                    <span>Python</span>
                                </div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder='Type: print("Hi there!")'
                                    spellCheck={false}
                                />
                            </div>
                            <button className={styles.runBtn} onClick={runCode}>
                                <Play size={18} /> Run Code
                            </button>

                            {output && (
                                <div className={styles.outputBox}>
                                    <div className={styles.outputLabel}>Output:</div>
                                    <div className={`${styles.outputText} ${output.includes('Error') ? 'error' : ''}`}>
                                        {output}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Challenges */}
                        <div className={styles.challenges}>
                            <h3>🎯 Now You Try:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={styles.challengeCheck}></div>
                                    Make your computer say "Hi there!"
                                </li>
                                <li>
                                    <div className={styles.challengeCheck}></div>
                                    Make your computer say your name
                                </li>
                            </ul>
                        </div>

                        {/* Tip */}
                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <p>
                                <strong>Remember:</strong> Always use lowercase <code>print</code>, parentheses <code>()</code>, and quotes <code>""</code> around your message!
                            </p>
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
                        <h2 className={styles.quizTitle}>🧠 Brain Check!</h2>
                        <p className={styles.quizQuestion}>
                            Which one makes the computer say "Wow"?
                        </p>

                        <div className={styles.quizOptions}>
                            {[
                                'print("Wow")',
                                'say("Wow")',
                                'talk("Wow")'
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
                            <div className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Hmm, not quite! 🤔</h4>
                                <p>Remember: We use <code>print()</code> to make the computer talk!</p>
                                <button
                                    className={styles.quizBtn}
                                    onClick={() => { setQuizChecked(false); setQuizAnswer(null); }}
                                    style={{ marginTop: '1rem' }}
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
