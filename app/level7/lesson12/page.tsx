'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, ChevronRight, ChevronLeft, Check, Award, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL7_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL7_LESSONS[11];
const LESSON_ID = 96;

const QUIZ_QUESTIONS = [
    {
        question: 'What does "hello"[1:4] return?',
        options: ['"ell"', '"hel"', '"ello"'],
        correct: 0
    },
    {
        question: 'What does .upper() do?',
        options: ['Removes spaces', 'Makes text UPPERCASE', 'Reverses text'],
        correct: 1
    },
    {
        question: 'What does .split() return?',
        options: ['A string', 'A list', 'A number'],
        correct: 1
    },
    {
        question: 'What does [::-1] do to a string?',
        options: ['Copies it', 'Reverses it', 'Deletes it'],
        correct: 1
    },
    {
        question: 'What does [x*2 for x in [1,2,3]] create?',
        options: ['[1,2,3]', '[2,4,6]', '[1,4,9]'],
        correct: 1
    },
    {
        question: 'What does .strip() remove?',
        options: ['All letters', 'Whitespace from ends', 'Numbers'],
        correct: 1
    },
    {
        question: 'What does "-".join(["a","b","c"]) return?',
        options: ['"abc"', '"a-b-c"', '["a-b-c"]'],
        correct: 1
    },
    {
        question: 'Which checks if text starts with "py"?',
        options: ['.find("py")', '.startswith("py")', '.has("py")'],
        correct: 1
    }
];

export default function Lesson12() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>(new Array(QUIZ_QUESTIONS.length).fill(null));
    const [checked, setChecked] = useState<boolean[]>(new Array(QUIZ_QUESTIONS.length).fill(false));
    const [score, setScore] = useState(0);
    const [lessonComplete, setLessonComplete] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const checkAnswer = () => {
        const newChecked = [...checked];
        newChecked[currentQuestion] = true;
        setChecked(newChecked);

        if (answers[currentQuestion] === QUIZ_QUESTIONS[currentQuestion].correct) {
            setScore(score + 1);
        }

        setTimeout(() => {
            if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
            } else {
                const finalScore = answers[currentQuestion] === QUIZ_QUESTIONS[currentQuestion].correct ? score + 1 : score;
                if (finalScore >= 6) {
                    addXpAndCoins(LESSON.xpReward, 10);
                    completeLevel(LESSON_ID, LESSON.xpReward, 10, 1, 120);
                }
                setLessonComplete(true);
            }
        }, 1500);
    };

    const retryQuiz = () => {
        setCurrentQuestion(0);
        setAnswers(new Array(QUIZ_QUESTIONS.length).fill(null));
        setChecked(new Array(QUIZ_QUESTIONS.length).fill(false));
        setScore(0);
        setLessonComplete(false);
    };

    if (isLoading || !user) return <div className={styles.container}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🧙</motion.div></div>;

    if (lessonComplete) {
        const passed = score >= 6;
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: passed ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'linear-gradient(135deg, #ef4444, #f59e0b)' }}>
                    {passed ? <Award size={50} /> : <span style={{ fontSize: '2.5rem' }}>📚</span>}
                </motion.div>
                <motion.h2 className={styles.successTitle} style={{ color: passed ? '#a855f7' : '#ef4444' }}>
                    {passed ? 'TEXT WIZARD MASTER! 🧙' : 'Keep Practicing!'}
                </motion.h2>
                <motion.p className={styles.successMessage}>
                    You got {score} out of {QUIZ_QUESTIONS.length} correct!
                    {passed ? ' Level 7 Complete!' : ' You need 6 correct to pass.'}
                </motion.p>
                {passed ? (
                    <>
                        <motion.div className={styles.successXp}><Zap size={20} /> +{LESSON.xpReward} XP</motion.div>
                        <Link href="/level7/complete" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                            Claim Your Badge! <ChevronRight size={18} />
                        </Link>
                    </>
                ) : (
                    <button onClick={retryQuiz} className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #ef4444, #f59e0b)' }}>
                        Try Again <ChevronRight size={18} />
                    </button>
                )}
            </div>
        );
    }

    const q = QUIZ_QUESTIONS[currentQuestion];

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            <header className={styles.header} style={{ borderBottom: '1px solid #a855f7' }}>
                <Link href="/level7" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Final Quiz</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                <div className={styles.lessonTitle}>
                    <motion.div className={styles.lessonEmoji} animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>{LESSON.emoji}</motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1 style={{ color: '#a855f7' }}>{LESSON.title}</h1>
                        <p>Test your <code style={{ color: '#ec4899' }}>Text Wizardry</code> knowledge!</p>
                    </div>
                </div>

                {/* Progress */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                    {QUIZ_QUESTIONS.map((_, idx) => (
                        <div key={idx} style={{
                            width: '30px', height: '30px', borderRadius: '50%',
                            background: checked[idx]
                                ? answers[idx] === QUIZ_QUESTIONS[idx].correct
                                    ? '#50fa7b'
                                    : '#ff5555'
                                : idx === currentQuestion
                                    ? 'linear-gradient(135deg, #a855f7, #ec4899)'
                                    : 'rgba(255,255,255,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 700, fontSize: '0.8rem'
                        }}>
                            {checked[idx] ? (answers[idx] === QUIZ_QUESTIONS[idx].correct ? <Check size={16} /> : '✕') : idx + 1}
                        </div>
                    ))}
                </div>

                <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={styles.quizSection}
                    style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15))', borderColor: '#a855f7' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Sparkles size={20} style={{ color: '#ec4899' }} />
                        <span style={{ color: 'var(--text-muted)' }}>Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}</span>
                        <Sparkles size={20} style={{ color: '#ec4899' }} />
                    </div>

                    <h2 className={styles.quizTitle} style={{ color: '#a855f7', marginBottom: '1.5rem' }}>{q.question}</h2>

                    <div className={styles.quizOptions}>
                        {q.options.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => !checked[currentQuestion] && setAnswers([...answers.slice(0, currentQuestion), idx, ...answers.slice(currentQuestion + 1)])}
                                className={`${styles.quizOption} ${answers[currentQuestion] === idx ? styles.selected : ''} ${checked[currentQuestion] && idx === q.correct ? styles.correct : ''} ${checked[currentQuestion] && answers[currentQuestion] === idx && idx !== q.correct ? styles.wrong : ''}`}
                                disabled={checked[currentQuestion]}
                            >
                                <code>{opt}</code>
                            </button>
                        ))}
                    </div>

                    {!checked[currentQuestion] ? (
                        <button
                            className={styles.quizBtn}
                            onClick={checkAnswer}
                            disabled={answers[currentQuestion] === null}
                            style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}
                        >
                            Check Answer
                        </button>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`${styles.quizFeedback} ${answers[currentQuestion] === q.correct ? styles.success : styles.error}`}
                        >
                            <h4>{answers[currentQuestion] === q.correct ? 'Correct!' : 'Not quite!'}</h4>
                            <p>{answers[currentQuestion] === q.correct ? 'Great job!' : `The answer was: ${q.options[q.correct]}`}</p>
                        </motion.div>
                    )}
                </motion.div>

                <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)' }}>
                    Current Score: {score} / {currentQuestion + (checked[currentQuestion] ? 1 : 0)}
                </div>

                <div className={styles.navBar}>
                    <Link href="/level7/lesson11" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                    <span style={{ color: 'var(--text-muted)' }}>Pass with 6+ correct!</span>
                </div>
            </div>
        </div>
    );
}
