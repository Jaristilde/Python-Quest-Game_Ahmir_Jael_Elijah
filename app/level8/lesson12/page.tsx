'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, ChevronRight, ChevronLeft, Check, Award, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL8_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL8_LESSONS[11];
const LESSON_ID = 108;

const QUIZ_QUESTIONS = [
    {
        question: 'What is a class in Python?',
        options: ['A type of loop', 'A blueprint for creating objects', 'A built-in function'],
        correct: 1
    },
    {
        question: 'What does __init__ do?',
        options: ['Deletes an object', 'Initializes a new object', 'Prints output'],
        correct: 1
    },
    {
        question: 'What does "self" refer to?',
        options: ['The class itself', 'The current object instance', 'A global variable'],
        correct: 1
    },
    {
        question: 'How do you create an object from class Pet?',
        options: ['Pet.new()', 'create Pet()', 'my_pet = Pet()'],
        correct: 2
    },
    {
        question: 'What is inheritance?',
        options: ['Copying code', 'Child class gets parent features', 'Deleting classes'],
        correct: 1
    },
    {
        question: 'How do you create Dog that inherits from Pet?',
        options: ['class Dog(Pet):', 'class Dog inherits Pet:', 'Dog = Pet.child()'],
        correct: 0
    },
    {
        question: 'What is a method?',
        options: ['A variable in a class', 'A function inside a class', 'A type of loop'],
        correct: 1
    },
    {
        question: 'What is the difference between class and instance attributes?',
        options: ['No difference', 'Class = shared, Instance = unique', 'Instance = shared'],
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
                    addXpAndCoins(LESSON.xpReward, 15);
                    completeLevel(LESSON_ID, LESSON.xpReward, 15, 1, 120);
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

    if (isLoading || !user) return <div className={styles.container}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🏆</motion.div></div>;

    if (lessonComplete) {
        const passed = score >= 6;
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: passed ? 'linear-gradient(135deg, #f97316, #ef4444)' : 'linear-gradient(135deg, #ef4444, #f59e0b)' }}>
                    {passed ? <Award size={50} /> : <span style={{ fontSize: '2.5rem' }}>📚</span>}
                </motion.div>
                <motion.h2 className={styles.successTitle} style={{ color: passed ? '#f97316' : '#ef4444' }}>
                    {passed ? 'CLASS MASTER! 🏆' : 'Keep Practicing!'}
                </motion.h2>
                <motion.p className={styles.successMessage}>
                    You got {score} out of {QUIZ_QUESTIONS.length} correct!
                    {passed ? ' Level 8 Complete!' : ' You need 6 correct to pass.'}
                </motion.p>
                {passed ? (
                    <>
                        <motion.div className={styles.successXp}><Zap size={20} /> +{LESSON.xpReward} XP</motion.div>
                        <Link href="/level8/complete" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>
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
            <header className={styles.header} style={{ borderBottom: '1px solid #f97316' }}>
                <Link href="/level8" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Final Quiz</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                <div className={styles.lessonTitle}>
                    <motion.div className={styles.lessonEmoji} animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>{LESSON.emoji}</motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1 style={{ color: '#f97316' }}>{LESSON.title}</h1>
                        <p>Test your <code style={{ color: '#ef4444' }}>OOP</code> knowledge!</p>
                    </div>
                </div>

                {/* Progress */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                    {QUIZ_QUESTIONS.map((_, idx) => (
                        <div key={idx} style={{
                            width: '30px', height: '30px', borderRadius: '50%',
                            background: checked[idx]
                                ? answers[idx] === QUIZ_QUESTIONS[idx].correct
                                    ? '#22c55e'
                                    : '#ef4444'
                                : idx === currentQuestion
                                    ? 'linear-gradient(135deg, #f97316, #ef4444)'
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
                    style={{ background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(239, 68, 68, 0.15))', borderColor: '#f97316' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Sparkles size={20} style={{ color: '#ef4444' }} />
                        <span style={{ color: 'var(--text-muted)' }}>Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}</span>
                        <Sparkles size={20} style={{ color: '#ef4444' }} />
                    </div>

                    <h2 className={styles.quizTitle} style={{ color: '#f97316', marginBottom: '1.5rem' }}>{q.question}</h2>

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
                            style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}
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
                    <Link href="/level8/lesson11" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                    <span style={{ color: 'var(--text-muted)' }}>Pass with 6+ correct!</span>
                </div>
            </div>
        </div>
    );
}
