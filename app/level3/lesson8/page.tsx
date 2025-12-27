'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Trophy, Star, ClipboardList, Plus, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL3_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL3_LESSONS[7]; // Lesson 8 (0-indexed)
const LESSON_ID = 41; // Level 3 lessons start at 34, so lesson 8 = 34 + 7 = 41

export default function Lesson8() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [currentBuildStep, setCurrentBuildStep] = useState(0);
    const [stepsCompleted, setStepsCompleted] = useState<boolean[]>([false, false, false]);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizStage, setQuizStage] = useState(1);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizChecked, setQuizChecked] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);

    // Task list simulation
    const [tasks, setTasks] = useState<string[]>([]);
    const [simulationStep, setSimulationStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Confetti state
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const buildSteps = [
        {
            title: 'Step 1: Create an Empty List',
            description: 'Every ToDo list starts empty! We use [] to create an empty list.',
            code: `tasks = []`,
            explanation: 'This creates a variable called "tasks" that holds an empty list. Think of it like a blank notepad!',
            action: () => {
                setTasks([]);
                setSimulationStep(1);
            }
        },
        {
            title: 'Step 2: Add Tasks with .append()',
            description: 'Use .append() to add new tasks to your list one at a time!',
            code: `tasks.append("Do homework")
tasks.append("Clean room")
tasks.append("Walk dog")`,
            explanation: '.append() adds a new item to the END of your list. Each time you call it, the list grows!',
            action: () => {
                setIsAnimating(true);
                setTasks([]);
                setTimeout(() => {
                    setTasks(['Do homework']);
                    setTimeout(() => {
                        setTasks(['Do homework', 'Clean room']);
                        setTimeout(() => {
                            setTasks(['Do homework', 'Clean room', 'Walk dog']);
                            setIsAnimating(false);
                            setSimulationStep(2);
                        }, 600);
                    }, 600);
                }, 600);
            }
        },
        {
            title: 'Step 3: Display Tasks with Numbers',
            description: 'Use a for loop with range() to show each task with its number!',
            code: `print("My ToDo List:")
for i in range(len(tasks)):
    print(f"{i + 1}. {tasks[i]}")`,
            explanation: 'range(len(tasks)) creates numbers 0, 1, 2... We use i + 1 to show 1, 2, 3 instead (human-friendly counting!).',
            action: () => {
                setSimulationStep(3);
            }
        }
    ];

    const runBuildStep = (stepIndex: number) => {
        buildSteps[stepIndex].action();
        const newCompleted = [...stepsCompleted];
        newCompleted[stepIndex] = true;
        setStepsCompleted(newCompleted);
    };

    const allStepsCompleted = stepsCompleted.every(step => step);

    const checkQuiz = () => {
        setQuizChecked(true);
        const correctAnswer = quizStage === 1 ? 1 : 1; // B is correct for both

        if (quizAnswer === correctAnswer) {
            if (quizStage === 1) {
                setTimeout(() => {
                    setQuizStage(2);
                    setQuizAnswer(null);
                    setQuizChecked(false);
                }, 1000);
            } else {
                setTimeout(() => {
                    addXpAndCoins(LESSON.xpReward, 10);
                    completeLevel(LESSON_ID, LESSON.xpReward, 10, 1, 120);
                    setLessonComplete(true);
                    setShowConfetti(true);
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
                        <ClipboardList size={48} className="text-emerald-400" />
                    </motion.div>
                </div>
            </div>
        );
    }

    // Success screen
    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(20, 30, 50, 0.98))' }}>
                {/* Confetti Animation */}
                <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                    {[...Array(25)].map((_, i) => (
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
                                fontSize: '2rem',
                            }}
                        >
                            {['✅', '📝', '⭐', '🎉', '✨', '📋', '🏆', '💫'][Math.floor(Math.random() * 8)]}
                        </motion.div>
                    ))}
                </div>

                {/* Trophy Icon */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', duration: 0.8 }}
                    className={styles.successIcon}
                    style={{
                        background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                        width: '100px',
                        height: '100px',
                        boxShadow: '0 0 40px rgba(16, 185, 129, 0.4)'
                    }}
                >
                    <ClipboardList size={50} className="text-white" />
                </motion.div>

                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={styles.successTitle}
                    style={{
                        background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    APP BUILDER!
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

                {/* Stars */}
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring' }}
                    style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', marginBottom: '1rem' }}
                >
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ rotate: -180, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ delay: 0.7 + i * 0.15, type: 'spring' }}
                        >
                            <Star size={28} fill="#fbbf24" className="text-amber-400" />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Achievement Badge */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.0 }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2))',
                        border: '2px solid rgba(16, 185, 129, 0.5)',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '9999px',
                        marginBottom: '1.5rem'
                    }}
                >
                    <ListChecks size={20} className="text-emerald-400" />
                    <span style={{ fontWeight: 700 }}>ToDo App Part 1 Complete!</span>
                    <Check size={20} className="text-blue-400" />
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}
                >
                    <Link href="/level3" className={`${styles.navBtn} ${styles.secondary}`}>
                        <ArrowLeft size={18} /> Back to Level 3
                    </Link>
                    <Link href="/level3/lesson9" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
                        Next Lesson <ChevronRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/level3" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 16 - GUIDED PROJECT</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                {!showQuiz ? (
                    <>
                        {/* Title Section */}
                        <div className={styles.lessonTitle}>
                            <motion.div
                                className={styles.lessonEmoji}
                                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(59, 130, 246, 0.3))' }}
                            >
                                <span style={{ fontSize: '2.5rem' }}>{LESSON.emoji}</span>
                            </motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p style={{ color: '#10b981' }}><strong>GUIDED PROJECT:</strong> <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Mission Banner */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2))',
                                border: '2px solid rgba(16, 185, 129, 0.4)',
                                textAlign: 'center'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <ClipboardList size={28} className="text-emerald-400" />
                                <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Time to build your first REAL app!</h3>
                            </div>
                            <p style={{ fontSize: '1.1rem', margin: 0 }}>
                                Create a ToDo list that stores your tasks, lets you add new ones, and displays them all with numbers!
                            </p>
                        </motion.div>

                        {/* Build Progress Tracker */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '1.5rem',
                            marginBottom: '2rem',
                            padding: '1rem',
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: 'var(--radius)'
                        }}>
                            {buildSteps.map((step, idx) => (
                                <div key={idx} style={{ textAlign: 'center' }}>
                                    <motion.div
                                        animate={stepsCompleted[idx] ? { scale: [1, 1.2, 1] } : {}}
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '50%',
                                            background: stepsCompleted[idx] ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.1)',
                                            border: stepsCompleted[idx] ? 'none' : currentBuildStep === idx ? '3px solid #10b981' : '2px solid rgba(255,255,255,0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 0.5rem',
                                            boxShadow: stepsCompleted[idx] ? '0 0 20px rgba(16, 185, 129, 0.4)' : 'none'
                                        }}
                                    >
                                        {stepsCompleted[idx] ? <Check size={24} /> : <span style={{ fontWeight: 700 }}>{idx + 1}</span>}
                                    </motion.div>
                                    <span style={{ fontSize: '0.75rem', color: stepsCompleted[idx] ? '#10b981' : 'var(--text-muted)' }}>
                                        Step {idx + 1}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Interactive ToDo Preview */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                background: 'linear-gradient(135deg, #1a1a2e, #0f172a)',
                                border: '2px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: 'var(--radius)',
                                padding: '1.5rem',
                                marginBottom: '2rem'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <ListChecks size={20} className="text-emerald-400" />
                                <h3 style={{ margin: 0, fontWeight: 700 }}>Live Preview: Your ToDo App</h3>
                            </div>

                            <div style={{
                                background: 'rgba(0,0,0,0.4)',
                                borderRadius: '0.5rem',
                                padding: '1rem',
                                fontFamily: 'monospace',
                                minHeight: '150px'
                            }}>
                                {simulationStep === 0 && (
                                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                                        Click "Run Step 1" to start building!
                                    </div>
                                )}

                                {simulationStep >= 1 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        style={{ marginBottom: '0.5rem' }}
                                    >
                                        <span style={{ color: '#6272a4' }}># tasks = [] created!</span>
                                    </motion.div>
                                )}

                                {simulationStep >= 2 && (
                                    <>
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            style={{ color: '#50fa7b', marginBottom: '0.5rem' }}
                                        >
                                            tasks = [
                                        </motion.div>
                                        <AnimatePresence>
                                            {tasks.map((task, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    style={{
                                                        color: '#f1fa8c',
                                                        paddingLeft: '1rem',
                                                        marginBottom: '0.25rem'
                                                    }}
                                                >
                                                    "{task}"{idx < tasks.length - 1 ? ',' : ''}
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                        <div style={{ color: '#50fa7b' }}>]</div>
                                    </>
                                )}

                                {simulationStep >= 3 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}
                                    >
                                        <div style={{ color: '#f8f8f2', marginBottom: '0.5rem' }}>My ToDo List:</div>
                                        {tasks.map((task, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.2 }}
                                                style={{ color: '#50fa7b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                            >
                                                <span style={{ color: '#bd93f9' }}>{idx + 1}.</span> {task}
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>

                        {/* Build Steps */}
                        {buildSteps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                style={{
                                    background: stepsCompleted[idx] ? 'rgba(16, 185, 129, 0.1)' : currentBuildStep === idx ? 'var(--surface)' : 'rgba(0,0,0,0.2)',
                                    border: stepsCompleted[idx] ? '2px solid rgba(16, 185, 129, 0.4)' : currentBuildStep === idx ? '2px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: 'var(--radius)',
                                    padding: '1.5rem',
                                    marginBottom: '1.5rem',
                                    opacity: idx > currentBuildStep && !stepsCompleted[idx] ? 0.5 : 1
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        background: stepsCompleted[idx] ? '#10b981' : idx === 0 ? '#10b981' : idx === 1 ? '#3b82f6' : '#8b5cf6',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 700
                                    }}>
                                        {stepsCompleted[idx] ? <Check size={20} /> : idx + 1}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontWeight: 700 }}>{step.title}</h3>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{step.description}</p>
                                    </div>
                                </div>

                                {/* Code Block */}
                                <div className={styles.codeBlock}>
                                    <div className={styles.codeHeader}>
                                        <span>todo_app.py</span>
                                        <span style={{ color: stepsCompleted[idx] ? '#10b981' : 'var(--text-muted)' }}>
                                            {stepsCompleted[idx] ? 'Complete!' : `Step ${idx + 1}`}
                                        </span>
                                    </div>
                                    <div className={styles.codeContent}>
                                        {step.code.split('\n').map((line, lineIdx) => (
                                            <div key={lineIdx}>
                                                {line.includes('tasks = []') && (
                                                    <>
                                                        <span className={styles.keyword}>tasks</span>
                                                        <span> = </span>
                                                        <span className={styles.string}>[]</span>
                                                    </>
                                                )}
                                                {line.includes('.append(') && (
                                                    <>
                                                        <span className={styles.keyword}>tasks</span>
                                                        <span>.</span>
                                                        <span style={{ color: '#8be9fd' }}>append</span>
                                                        <span>(</span>
                                                        <span className={styles.string}>"{line.match(/"([^"]+)"/)?.[1]}"</span>
                                                        <span>)</span>
                                                    </>
                                                )}
                                                {line.includes('print("My ToDo') && (
                                                    <>
                                                        <span className={styles.keyword}>print</span>
                                                        <span>(</span>
                                                        <span className={styles.string}>"My ToDo List:"</span>
                                                        <span>)</span>
                                                    </>
                                                )}
                                                {line.includes('for i in range') && (
                                                    <>
                                                        <span className={styles.keyword}>for</span>
                                                        <span> i </span>
                                                        <span className={styles.keyword}>in</span>
                                                        <span> </span>
                                                        <span style={{ color: '#8be9fd' }}>range</span>
                                                        <span>(</span>
                                                        <span style={{ color: '#8be9fd' }}>len</span>
                                                        <span>(tasks)):</span>
                                                    </>
                                                )}
                                                {line.includes('print(f"{i + 1}') && (
                                                    <>
                                                        {'    '}
                                                        <span className={styles.keyword}>print</span>
                                                        <span>(</span>
                                                        <span className={styles.string}>f"{'{'}i + 1{'}'}. {'{'}tasks[i]{'}'}"</span>
                                                        <span>)</span>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Explanation */}
                                <div style={{
                                    background: 'rgba(251, 191, 36, 0.1)',
                                    border: '1px solid rgba(251, 191, 36, 0.3)',
                                    borderRadius: '0.5rem',
                                    padding: '0.75rem 1rem',
                                    marginTop: '1rem',
                                    display: 'flex',
                                    gap: '0.75rem',
                                    alignItems: 'flex-start'
                                }}>
                                    <Lightbulb size={18} className="text-amber-400 flex-shrink-0" style={{ marginTop: '2px' }} />
                                    <p style={{ margin: 0, fontSize: '0.9rem' }}>{step.explanation}</p>
                                </div>

                                {/* Run Button */}
                                {idx === currentBuildStep && !stepsCompleted[idx] && (
                                    <motion.button
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        onClick={() => runBuildStep(idx)}
                                        disabled={isAnimating}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.75rem 1.5rem',
                                            marginTop: '1rem',
                                            background: 'linear-gradient(135deg, #10b981, #059669)',
                                            border: 'none',
                                            borderRadius: '0.5rem',
                                            color: 'white',
                                            fontWeight: 600,
                                            cursor: isAnimating ? 'not-allowed' : 'pointer',
                                            opacity: isAnimating ? 0.7 : 1
                                        }}
                                    >
                                        <Play size={18} /> {isAnimating ? 'Running...' : `Run Step ${idx + 1}`}
                                    </motion.button>
                                )}

                                {stepsCompleted[idx] && idx < buildSteps.length - 1 && !stepsCompleted[idx + 1] && (
                                    <motion.button
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        onClick={() => setCurrentBuildStep(idx + 1)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.75rem 1.5rem',
                                            marginTop: '1rem',
                                            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                                            border: 'none',
                                            borderRadius: '0.5rem',
                                            color: 'white',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <ChevronRight size={18} /> Continue to Step {idx + 2}
                                    </motion.button>
                                )}
                            </motion.div>
                        ))}

                        {/* Complete Code Section */}
                        {allStepsCompleted && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={styles.codeSection}
                            >
                                <h3>Complete ToDo App Code</h3>
                                <div className={styles.codeBlock}>
                                    <div className={styles.codeHeader}>
                                        <span>todo_app.py</span>
                                        <span style={{ color: '#10b981' }}>Complete!</span>
                                    </div>
                                    <div className={styles.codeContent}>
                                        <span className={styles.comment}># Create empty list</span>{'\n'}
                                        <span className={styles.keyword}>tasks</span> = []{'\n\n'}

                                        <span className={styles.comment}># Add tasks</span>{'\n'}
                                        <span className={styles.keyword}>tasks</span>.<span style={{ color: '#8be9fd' }}>append</span>(<span className={styles.string}>"Do homework"</span>){'\n'}
                                        <span className={styles.keyword}>tasks</span>.<span style={{ color: '#8be9fd' }}>append</span>(<span className={styles.string}>"Clean room"</span>){'\n'}
                                        <span className={styles.keyword}>tasks</span>.<span style={{ color: '#8be9fd' }}>append</span>(<span className={styles.string}>"Walk dog"</span>){'\n\n'}

                                        <span className={styles.comment}># Display all tasks</span>{'\n'}
                                        <span className={styles.keyword}>print</span>(<span className={styles.string}>"My ToDo List:"</span>){'\n'}
                                        <span className={styles.keyword}>for</span> i <span className={styles.keyword}>in</span> <span style={{ color: '#8be9fd' }}>range</span>(<span style={{ color: '#8be9fd' }}>len</span>(tasks)):{'\n'}
                                        {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>f"{'{'}i + 1{'}'}. {'{'}tasks[i]{'}'}"</span>)
                                    </div>
                                </div>

                                {/* Expected Output */}
                                <div style={{ marginTop: '1rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Expected Output:</h4>
                                    <div className={styles.outputBox} style={{ borderColor: 'rgba(16, 185, 129, 0.5)' }}>
                                        <div className={styles.outputText}>
                                            My ToDo List:{'\n'}
                                            1. Do homework{'\n'}
                                            2. Clean room{'\n'}
                                            3. Walk dog
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Key Concepts Summary */}
                        {allStepsCompleted && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={styles.tipBox}
                                style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))' }}
                            >
                                <Lightbulb size={24} className="text-amber-400 flex-shrink-0" />
                                <div>
                                    <p style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '1.1rem' }}>Key Concepts You Learned:</p>
                                    <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'grid', gap: '0.5rem' }}>
                                        <li><code>range(len(tasks))</code> - Creates numbers 0, 1, 2... up to list length minus 1</li>
                                        <li><code>i + 1</code> - Makes it show 1, 2, 3... instead of 0, 1, 2 (human-friendly!)</li>
                                        <li><code>f-string</code> - Formats the output nicely with {'{}'} placeholders</li>
                                    </ul>
                                </div>
                            </motion.div>
                        )}

                        {/* Navigation */}
                        <div className={styles.navBar}>
                            <Link href="/level3/lesson7" className={`${styles.navBtn} ${styles.secondary}`}>
                                <ChevronLeft size={18} /> Previous
                            </Link>
                            {allStepsCompleted ? (
                                <button
                                    className={`${styles.navBtn} ${styles.primary}`}
                                    onClick={() => setShowQuiz(true)}
                                    style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}
                                >
                                    Take Quiz! <Trophy size={18} />
                                </button>
                            ) : (
                                <button className={`${styles.navBtn} ${styles.secondary}`} disabled style={{ opacity: 0.5 }}>
                                    Complete All Steps <ChevronRight size={18} />
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    /* Quiz Section */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={styles.quizSection}
                        style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))' }}
                    >
                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{
                                background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.85rem',
                                fontWeight: 600
                            }}>
                                Question {quizStage} of 2
                            </span>
                        </div>

                        <h2 className={styles.quizTitle}>Quick Check!</h2>

                        {quizStage === 1 ? (
                            <>
                                <p className={styles.quizQuestion}>Why do we use <code>i + 1</code> instead of just <code>i</code>?</p>
                                <div className={styles.quizOptions}>
                                    {[
                                        'A) To fix an error',
                                        'B) To show 1, 2, 3 instead of 0, 1, 2',
                                        'C) To add extra tasks'
                                    ].map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => !quizChecked && setQuizAnswer(idx)}
                                            className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''} ${quizChecked && idx === 1 ? styles.correct : ''} ${quizChecked && quizAnswer === idx && idx !== 1 ? styles.wrong : ''}`}
                                            disabled={quizChecked}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>What does <code>range(len(tasks))</code> do?</p>
                                <div className={styles.quizOptions}>
                                    {[
                                        'A) Counts items in the list',
                                        'B) Creates numbers from 0 to list length-1',
                                        'C) Removes tasks'
                                    ].map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => !quizChecked && setQuizAnswer(idx)}
                                            className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''} ${quizChecked && idx === 1 ? styles.correct : ''} ${quizChecked && quizAnswer === idx && idx !== 1 ? styles.wrong : ''}`}
                                            disabled={quizChecked}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {!quizChecked ? (
                            <button
                                className={styles.quizBtn}
                                onClick={checkQuiz}
                                disabled={quizAnswer === null}
                            >
                                Check Answer
                            </button>
                        ) : quizAnswer !== 1 ? (
                            <div className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>
                                    {quizStage === 1
                                        ? 'Python lists start counting at 0, but humans prefer 1, 2, 3! Adding 1 makes it friendlier.'
                                        : 'range(len(tasks)) creates a sequence of numbers: if tasks has 3 items, it creates 0, 1, 2!'}
                                </p>
                                <button
                                    className={styles.quizBtn}
                                    onClick={() => { setQuizChecked(false); setQuizAnswer(null); }}
                                    style={{ marginTop: '1rem' }}
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : quizStage === 1 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.quizFeedback} ${styles.success}`}
                            >
                                <h4>Correct!</h4>
                                <p>Exactly! Adding 1 converts from computer counting (0, 1, 2) to human counting (1, 2, 3)!</p>
                            </motion.div>
                        ) : null}

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
