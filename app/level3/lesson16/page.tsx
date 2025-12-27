'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Trophy, Star, ClipboardList, Plus, Trash2, Eye, LogOut, Menu, PartyPopper, Award, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL3_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL3_LESSONS[15]; // Lesson 16 (0-indexed)
const LESSON_ID = 49; // Level 3 lessons start at 34, so lesson 16 = 34 + 15 = 49

export default function Lesson16() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [currentBuildStep, setCurrentBuildStep] = useState(0);
    const [stepsCompleted, setStepsCompleted] = useState<boolean[]>([false, false, false]);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizStage, setQuizStage] = useState(1);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizChecked, setQuizChecked] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);

    // Interactive ToDo simulation
    const [tasks, setTasks] = useState<string[]>(['Do homework', 'Clean room', 'Walk dog']);
    const [simulationRunning, setSimulationRunning] = useState(false);
    const [currentAction, setCurrentAction] = useState<string | null>(null);
    const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
    const [showFinalCode, setShowFinalCode] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const buildSteps = [
        {
            title: 'Step 1: Create the Menu Loop',
            description: 'Set up a while loop that shows the menu and keeps running!',
            code: `tasks = []
running = True

while running:
    print("\\n📝 ToDo Menu:")
    print("1. Add task")
    print("2. View tasks")
    print("3. Delete task")
    print("4. Quit")`,
            explanation: 'We use running = True to keep the app going. The while loop shows the menu over and over until the user quits!',
            action: () => {
                setConsoleOutput([
                    '',
                    '📝 ToDo Menu:',
                    '1. Add task',
                    '2. View tasks',
                    '3. Delete task',
                    '4. Quit'
                ]);
            }
        },
        {
            title: 'Step 2: Get User Choice',
            description: 'Ask the user which option they want!',
            code: `    choice = input("Choose (1-4): ")`,
            explanation: 'input() waits for the user to type something. We store their choice in a variable to check what they picked!',
            action: () => {
                setConsoleOutput([
                    '',
                    '📝 ToDo Menu:',
                    '1. Add task',
                    '2. View tasks',
                    '3. Delete task',
                    '4. Quit',
                    'Choose (1-4): _'
                ]);
            }
        },
        {
            title: 'Step 3: Handle Each Option',
            description: 'Use if/elif to do different things based on the choice!',
            code: `    if choice == "1":
        task = input("Enter task: ")
        tasks.append(task)
        print("✅ Added!")

    elif choice == "2":
        print("\\n📋 Your Tasks:")
        for i in range(len(tasks)):
            print(f"{i + 1}. {tasks[i]}")

    elif choice == "3":
        num = int(input("Task number to delete: "))
        if 1 <= num <= len(tasks):
            removed = tasks.pop(num - 1)
            print(f"🗑️ Removed: {removed}")

    elif choice == "4":
        print("Goodbye! 👋")
        running = False`,
            explanation: 'Each if/elif handles one menu option. Notice num - 1 when deleting: users see 1,2,3 but Python uses 0,1,2!',
            action: () => {
                setConsoleOutput([
                    '> User picks option 1...',
                    'Enter task: Buy groceries',
                    '✅ Added!',
                    '',
                    '> User picks option 2...',
                    '📋 Your Tasks:',
                    '1. Buy groceries',
                    '',
                    '> User picks option 4...',
                    'Goodbye! 👋'
                ]);
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

    // Interactive simulation functions
    const simulateAddTask = () => {
        setCurrentAction('add');
        setSimulationRunning(true);
        setConsoleOutput([
            '📝 ToDo Menu:',
            '1. Add task',
            '2. View tasks',
            '3. Delete task',
            '4. Quit',
            'Choose (1-4): 1',
            'Enter task: Practice Python'
        ]);
        setTimeout(() => {
            setTasks(prev => [...prev, 'Practice Python']);
            setConsoleOutput(prev => [...prev, '✅ Added!']);
            setTimeout(() => {
                setSimulationRunning(false);
                setCurrentAction(null);
            }, 1000);
        }, 1500);
    };

    const simulateViewTasks = () => {
        setCurrentAction('view');
        setSimulationRunning(true);
        setConsoleOutput([
            '📝 ToDo Menu:',
            '1. Add task',
            '2. View tasks',
            '3. Delete task',
            '4. Quit',
            'Choose (1-4): 2',
            '',
            '📋 Your Tasks:'
        ]);
        setTimeout(() => {
            const taskLines = tasks.map((task, i) => `${i + 1}. ${task}`);
            setConsoleOutput(prev => [...prev, ...taskLines]);
            setTimeout(() => {
                setSimulationRunning(false);
                setCurrentAction(null);
            }, 1000);
        }, 1000);
    };

    const simulateDeleteTask = () => {
        if (tasks.length === 0) return;
        setCurrentAction('delete');
        setSimulationRunning(true);
        setConsoleOutput([
            '📝 ToDo Menu:',
            '1. Add task',
            '2. View tasks',
            '3. Delete task',
            '4. Quit',
            'Choose (1-4): 3',
            'Task number to delete: 1'
        ]);
        setTimeout(() => {
            const removed = tasks[0];
            setTasks(prev => prev.slice(1));
            setConsoleOutput(prev => [...prev, `🗑️ Removed: ${removed}`]);
            setTimeout(() => {
                setSimulationRunning(false);
                setCurrentAction(null);
            }, 1000);
        }, 1500);
    };

    const simulateQuit = () => {
        setCurrentAction('quit');
        setSimulationRunning(true);
        setConsoleOutput([
            '📝 ToDo Menu:',
            '1. Add task',
            '2. View tasks',
            '3. Delete task',
            '4. Quit',
            'Choose (1-4): 4',
            'Goodbye! 👋'
        ]);
        setTimeout(() => {
            setSimulationRunning(false);
            setCurrentAction(null);
        }, 1500);
    };

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
                    addXpAndCoins(LESSON.xpReward, 15);
                    completeLevel(LESSON_ID, LESSON.xpReward, 15, 1, 180);
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
                        <ClipboardList size={48} className="text-emerald-400" />
                    </motion.div>
                </div>
            </div>
        );
    }

    // GRAND SUCCESS screen - Level 3 Complete!
    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(20, 30, 50, 0.98))' }}>
                {/* Confetti Animation - Extra celebration! */}
                <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                    {[...Array(50)].map((_, i) => (
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
                                delay: Math.random() * 3,
                                repeat: Infinity,
                                ease: 'linear'
                            }}
                            style={{
                                position: 'absolute',
                                fontSize: '2rem',
                            }}
                        >
                            {['✅', '📝', '⭐', '🎉', '✨', '📋', '🏆', '🚀', '👑', '🔥'][Math.floor(Math.random() * 10)]}
                        </motion.div>
                    ))}
                </div>

                {/* Pulsing Background Effect */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                        position: 'absolute',
                        width: '400px',
                        height: '400px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3), transparent)',
                        zIndex: 0
                    }}
                />

                {/* Trophy Icon with Glow */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', duration: 0.8 }}
                    style={{
                        position: 'relative',
                        zIndex: 1,
                        width: '120px',
                        height: '120px',
                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 60px rgba(251, 191, 36, 0.5), 0 0 120px rgba(251, 191, 36, 0.3)',
                        marginBottom: '1.5rem'
                    }}
                >
                    <Trophy size={60} className="text-white" />
                </motion.div>

                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        fontSize: '2.5rem',
                        fontWeight: 900,
                        background: 'linear-gradient(135deg, #fbbf24, #10b981, #3b82f6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '0.5rem',
                        zIndex: 1
                    }}
                >
                    LEVEL 3 COMPLETE!
                </motion.h2>

                <motion.h3
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: '#10b981',
                        marginBottom: '1rem',
                        zIndex: 1
                    }}
                >
                    APP DEVELOPER Unlocked!
                </motion.h3>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className={styles.successMessage}
                    style={{ zIndex: 1, maxWidth: '500px' }}
                >
                    You've mastered Python Lists and built a complete interactive ToDo App! You can now store, organize, and manage data like a pro!
                </motion.p>

                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring' }}
                    className={styles.successXp}
                    style={{ zIndex: 1 }}
                >
                    <Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP
                </motion.div>

                {/* Stars */}
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7, type: 'spring' }}
                    style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', marginBottom: '1.5rem', zIndex: 1 }}
                >
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ rotate: -180, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ delay: 0.8 + i * 0.15, type: 'spring' }}
                        >
                            <Star size={36} fill="#fbbf24" className="text-amber-400" />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Skills Unlocked */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.0 }}
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        justifyContent: 'center',
                        marginBottom: '2rem',
                        zIndex: 1
                    }}
                >
                    {['Lists []', '.append()', '.pop()', 'for loops', 'while loops', 'Menu Systems'].map((skill, i) => (
                        <motion.span
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1.1 + i * 0.1, type: 'spring' }}
                            style={{
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2))',
                                border: '1px solid rgba(16, 185, 129, 0.5)',
                                padding: '0.5rem 1rem',
                                borderRadius: '9999px',
                                fontSize: '0.9rem',
                                fontWeight: 600
                            }}
                        >
                            {skill}
                        </motion.span>
                    ))}
                </motion.div>

                {/* Achievement Badge */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(16, 185, 129, 0.2))',
                        border: '2px solid rgba(251, 191, 36, 0.5)',
                        padding: '1rem 2rem',
                        borderRadius: '9999px',
                        marginBottom: '2rem',
                        zIndex: 1
                    }}
                >
                    <Award size={24} className="text-amber-400" />
                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>ToDo List App Complete!</span>
                    <Sparkles size={24} className="text-emerald-400" />
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.7 }}
                    style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', zIndex: 1 }}
                >
                    <Link href="/level3" className={`${styles.navBtn} ${styles.secondary}`}>
                        <ArrowLeft size={18} /> Back to Level 3
                    </Link>
                    <Link
                        href="/level3/complete"
                        className={`${styles.navBtn} ${styles.primary}`}
                        style={{ background: 'linear-gradient(135deg, #fbbf24, #10b981)' }}
                    >
                        <PartyPopper size={18} /> Celebrate! <ChevronRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/level3" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 16 - FINAL PROJECT</span>
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
                                style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(251, 191, 36, 0.3))' }}
                            >
                                <span style={{ fontSize: '2.5rem' }}>{LESSON.emoji}</span>
                            </motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p style={{ color: '#fbbf24' }}><strong>FINAL PROJECT:</strong> <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Mission Banner */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(251, 191, 36, 0.2))',
                                border: '2px solid rgba(16, 185, 129, 0.4)',
                                textAlign: 'center'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>✅</span>
                                <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Time to make your ToDo app INTERACTIVE!</h3>
                            </div>
                            <p style={{ fontSize: '1.1rem', margin: 0 }}>
                                Add a menu so users can add tasks, view their list, delete tasks, and quit when done!
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

                        {/* Interactive ToDo App Simulation */}
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
                                <Menu size={20} className="text-emerald-400" />
                                <h3 style={{ margin: 0, fontWeight: 700 }}>Try Your ToDo App!</h3>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                                    Tasks: {tasks.length}
                                </span>
                            </div>

                            {/* Current Task List */}
                            <div style={{
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '0.5rem',
                                padding: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#60a5fa' }}>
                                    <ClipboardList size={16} />
                                    <span style={{ fontWeight: 600 }}>Current Tasks:</span>
                                </div>
                                {tasks.length === 0 ? (
                                    <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No tasks yet!</div>
                                ) : (
                                    <AnimatePresence>
                                        {tasks.map((task, idx) => (
                                            <motion.div
                                                key={task + idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    padding: '0.5rem',
                                                    background: 'rgba(16, 185, 129, 0.1)',
                                                    borderRadius: '0.25rem',
                                                    marginBottom: '0.25rem'
                                                }}
                                            >
                                                <span style={{ color: '#bd93f9', fontWeight: 600 }}>{idx + 1}.</span>
                                                <span>{task}</span>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                <button
                                    onClick={simulateAddTask}
                                    disabled={simulationRunning}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem 1rem',
                                        background: currentAction === 'add' ? '#10b981' : 'rgba(16, 185, 129, 0.2)',
                                        border: '1px solid rgba(16, 185, 129, 0.5)',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        cursor: simulationRunning ? 'not-allowed' : 'pointer',
                                        opacity: simulationRunning && currentAction !== 'add' ? 0.5 : 1
                                    }}
                                >
                                    <Plus size={16} /> Add Task
                                </button>
                                <button
                                    onClick={simulateViewTasks}
                                    disabled={simulationRunning}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem 1rem',
                                        background: currentAction === 'view' ? '#3b82f6' : 'rgba(59, 130, 246, 0.2)',
                                        border: '1px solid rgba(59, 130, 246, 0.5)',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        cursor: simulationRunning ? 'not-allowed' : 'pointer',
                                        opacity: simulationRunning && currentAction !== 'view' ? 0.5 : 1
                                    }}
                                >
                                    <Eye size={16} /> View Tasks
                                </button>
                                <button
                                    onClick={simulateDeleteTask}
                                    disabled={simulationRunning || tasks.length === 0}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem 1rem',
                                        background: currentAction === 'delete' ? '#ef4444' : 'rgba(239, 68, 68, 0.2)',
                                        border: '1px solid rgba(239, 68, 68, 0.5)',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        cursor: simulationRunning || tasks.length === 0 ? 'not-allowed' : 'pointer',
                                        opacity: (simulationRunning && currentAction !== 'delete') || tasks.length === 0 ? 0.5 : 1
                                    }}
                                >
                                    <Trash2 size={16} /> Delete Task
                                </button>
                                <button
                                    onClick={simulateQuit}
                                    disabled={simulationRunning}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem 1rem',
                                        background: currentAction === 'quit' ? '#8b5cf6' : 'rgba(139, 92, 246, 0.2)',
                                        border: '1px solid rgba(139, 92, 246, 0.5)',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        cursor: simulationRunning ? 'not-allowed' : 'pointer',
                                        opacity: simulationRunning && currentAction !== 'quit' ? 0.5 : 1
                                    }}
                                >
                                    <LogOut size={16} /> Quit
                                </button>
                            </div>

                            {/* Console Output */}
                            {consoleOutput.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{
                                        background: 'rgba(0,0,0,0.4)',
                                        borderRadius: '0.5rem',
                                        padding: '1rem',
                                        fontFamily: 'monospace',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.75rem' }}>Console Output:</div>
                                    {consoleOutput.map((line, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            style={{
                                                color: line.includes('✅') ? '#10b981' :
                                                    line.includes('🗑️') ? '#ef4444' :
                                                        line.includes('Goodbye') ? '#8b5cf6' :
                                                            line.includes('📋') || line.includes('📝') ? '#60a5fa' : '#f8f8f2'
                                            }}
                                        >
                                            {line}
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
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
                                        background: stepsCompleted[idx] ? '#10b981' : idx === 0 ? '#10b981' : idx === 1 ? '#3b82f6' : '#fbbf24',
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
                                        <span>todo_menu.py</span>
                                        <span style={{ color: stepsCompleted[idx] ? '#10b981' : 'var(--text-muted)' }}>
                                            {stepsCompleted[idx] ? 'Complete!' : `Step ${idx + 1}`}
                                        </span>
                                    </div>
                                    <div className={styles.codeContent} style={{ fontSize: '0.85rem' }}>
                                        {step.code.split('\n').map((line, lineIdx) => {
                                            // Syntax highlighting
                                            let formattedLine = line;
                                            formattedLine = formattedLine
                                                .replace(/\b(while|if|elif|else|for|in|True|False|and|or|not)\b/g, '<span class="keyword">$1</span>')
                                                .replace(/(print|input|int|len|range|append|pop)/g, '<span style="color: #8be9fd">$1</span>')
                                                .replace(/"([^"]*)"/g, '<span class="string">"$1"</span>')
                                                .replace(/(\d+)/g, '<span class="number">$1</span>')
                                                .replace(/#.*/g, '<span class="comment">$&</span>');
                                            return (
                                                <div key={lineIdx} dangerouslySetInnerHTML={{ __html: formattedLine || '&nbsp;' }} />
                                            );
                                        })}
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
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Play size={18} /> Run Step {idx + 1}
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
                            <>
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => setShowFinalCode(!showFinalCode)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.75rem',
                                        width: '100%',
                                        padding: '1rem',
                                        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(16, 185, 129, 0.2))',
                                        border: '2px solid rgba(251, 191, 36, 0.4)',
                                        borderRadius: 'var(--radius)',
                                        color: 'white',
                                        fontWeight: 700,
                                        fontSize: '1.1rem',
                                        cursor: 'pointer',
                                        marginBottom: '1.5rem'
                                    }}
                                >
                                    <Trophy size={24} className="text-amber-400" />
                                    {showFinalCode ? 'Hide' : 'Show'} Complete ToDo App Code
                                    <ChevronRight size={20} style={{ transform: showFinalCode ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                                </motion.button>

                                <AnimatePresence>
                                    {showFinalCode && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className={styles.codeSection}
                                        >
                                            <h3>Complete Interactive ToDo App</h3>
                                            <div className={styles.codeBlock}>
                                                <div className={styles.codeHeader}>
                                                    <span>todo_app_complete.py</span>
                                                    <span style={{ color: '#fbbf24' }}>FINAL VERSION</span>
                                                </div>
                                                <div className={styles.codeContent} style={{ fontSize: '0.85rem' }}>
                                                    <span className={styles.keyword}>tasks</span> = []{'\n'}
                                                    <span className={styles.keyword}>running</span> = <span className={styles.keyword}>True</span>{'\n\n'}
                                                    <span className={styles.keyword}>while</span> running:{'\n'}
                                                    {'    '}<span style={{ color: '#8be9fd' }}>print</span>(<span className={styles.string}>{'"\\n📝 ToDo Menu:"'}</span>){'\n'}
                                                    {'    '}<span style={{ color: '#8be9fd' }}>print</span>(<span className={styles.string}>"1. Add task"</span>){'\n'}
                                                    {'    '}<span style={{ color: '#8be9fd' }}>print</span>(<span className={styles.string}>"2. View tasks"</span>){'\n'}
                                                    {'    '}<span style={{ color: '#8be9fd' }}>print</span>(<span className={styles.string}>"3. Delete task"</span>){'\n'}
                                                    {'    '}<span style={{ color: '#8be9fd' }}>print</span>(<span className={styles.string}>"4. Quit"</span>){'\n\n'}
                                                    {'    '}choice = <span style={{ color: '#8be9fd' }}>input</span>(<span className={styles.string}>"Choose (1-4): "</span>){'\n\n'}
                                                    {'    '}<span className={styles.keyword}>if</span> choice == <span className={styles.string}>"1"</span>:{'\n'}
                                                    {'        '}task = <span style={{ color: '#8be9fd' }}>input</span>(<span className={styles.string}>"Enter task: "</span>){'\n'}
                                                    {'        '}tasks.<span style={{ color: '#8be9fd' }}>append</span>(task){'\n'}
                                                    {'        '}<span style={{ color: '#8be9fd' }}>print</span>(<span className={styles.string}>"✅ Added!"</span>){'\n'}
                                                    {'    '}<span className={styles.keyword}>elif</span> choice == <span className={styles.string}>"2"</span>:{'\n'}
                                                    {'        '}<span className={styles.keyword}>if</span> <span style={{ color: '#8be9fd' }}>len</span>(tasks) == <span className={styles.number}>0</span>:{'\n'}
                                                    {'            '}<span style={{ color: '#8be9fd' }}>print</span>(<span className={styles.string}>"No tasks yet!"</span>){'\n'}
                                                    {'        '}<span className={styles.keyword}>else</span>:{'\n'}
                                                    {'            '}<span style={{ color: '#8be9fd' }}>print</span>(<span className={styles.string}>{'"\\n📋 Your Tasks:"'}</span>){'\n'}
                                                    {'            '}<span className={styles.keyword}>for</span> i <span className={styles.keyword}>in</span> <span style={{ color: '#8be9fd' }}>range</span>(<span style={{ color: '#8be9fd' }}>len</span>(tasks)):{'\n'}
                                                    {'                '}<span style={{ color: '#8be9fd' }}>print</span>(<span className={styles.string}>f"{'{'}i + 1{'}'}. {'{'}tasks[i]{'}'}"</span>){'\n'}
                                                    {'    '}<span className={styles.keyword}>elif</span> choice == <span className={styles.string}>"3"</span>:{'\n'}
                                                    {'        '}<span className={styles.keyword}>if</span> <span style={{ color: '#8be9fd' }}>len</span>(tasks) == <span className={styles.number}>0</span>:{'\n'}
                                                    {'            '}<span style={{ color: '#8be9fd' }}>print</span>(<span className={styles.string}>"No tasks to delete!"</span>){'\n'}
                                                    {'        '}<span className={styles.keyword}>else</span>:{'\n'}
                                                    {'            '}num = <span style={{ color: '#8be9fd' }}>int</span>(<span style={{ color: '#8be9fd' }}>input</span>(<span className={styles.string}>"Task number to delete: "</span>)){'\n'}
                                                    {'            '}<span className={styles.keyword}>if</span> <span className={styles.number}>1</span> {'<='} num {'<='} <span style={{ color: '#8be9fd' }}>len</span>(tasks):{'\n'}
                                                    {'                '}removed = tasks.<span style={{ color: '#8be9fd' }}>pop</span>(num - <span className={styles.number}>1</span>){'\n'}
                                                    {'                '}<span style={{ color: '#8be9fd' }}>print</span>(<span className={styles.string}>{"f\"🗑️ Removed: {removed}\""}</span>){'\n'}
                                                    {'    '}<span className={styles.keyword}>elif</span> choice == <span className={styles.string}>"4"</span>:{'\n'}
                                                    {'        '}<span style={{ color: '#8be9fd' }}>print</span>(<span className={styles.string}>"Goodbye! 👋"</span>){'\n'}
                                                    {'        '}running = <span className={styles.keyword}>False</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        )}

                        {/* Key Concepts Summary */}
                        {allStepsCompleted && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={styles.tipBox}
                                style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(251, 191, 36, 0.1))' }}
                            >
                                <Lightbulb size={24} className="text-amber-400 flex-shrink-0" />
                                <div>
                                    <p style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '1.1rem' }}>Key Concepts You Mastered:</p>
                                    <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'grid', gap: '0.5rem' }}>
                                        <li><code>while running:</code> - Keeps the menu loop going until user quits</li>
                                        <li><code>if/elif/else</code> - Handles different menu choices</li>
                                        <li><code>num - 1</code> - Converts from human counting (1,2,3) to Python (0,1,2)</li>
                                        <li><code>.pop()</code> - Removes and returns an item from the list</li>
                                    </ul>
                                </div>
                            </motion.div>
                        )}

                        {/* Navigation */}
                        <div className={styles.navBar}>
                            <Link href="/level3/lesson15" className={`${styles.navBtn} ${styles.secondary}`}>
                                <ChevronLeft size={18} /> Previous
                            </Link>
                            {allStepsCompleted ? (
                                <button
                                    className={`${styles.navBtn} ${styles.primary}`}
                                    onClick={() => setShowQuiz(true)}
                                    style={{ background: 'linear-gradient(135deg, #fbbf24, #10b981)' }}
                                >
                                    Final Quiz! <Trophy size={18} />
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
                        style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(16, 185, 129, 0.15))' }}
                    >
                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{
                                background: 'linear-gradient(135deg, #fbbf24, #10b981)',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.85rem',
                                fontWeight: 600
                            }}>
                                Question {quizStage} of 2
                            </span>
                        </div>

                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ fontSize: '3rem', marginBottom: '1rem' }}
                        >
                            🧠
                        </motion.div>

                        <h2 className={styles.quizTitle}>Final Challenge!</h2>

                        {quizStage === 1 ? (
                            <>
                                <p className={styles.quizQuestion}>Why do we use <code>num - 1</code> when deleting a task?</p>
                                <div className={styles.quizOptions}>
                                    {[
                                        'A) To fix an error',
                                        'B) User sees 1,2,3 but Python uses 0,1,2',
                                        'C) To delete multiple items'
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
                                <p className={styles.quizQuestion}>What keeps the menu running?</p>
                                <div className={styles.quizOptions}>
                                    {[
                                        'A) for loop',
                                        'B) while running:',
                                        'C) if statement'
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
                                        ? 'When users see task 1, Python stores it at index 0. Subtracting 1 converts from human counting to Python counting!'
                                        : 'The while running: loop keeps going as long as running is True. Setting running = False makes the loop stop!'}
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
                                <p>Exactly! Python uses 0-based indexing, but humans prefer counting from 1. Great understanding!</p>
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
