'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Trophy, Star, Pizza, Award, Sparkles, PartyPopper } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL4_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL4_LESSONS[12]; // Lesson 13 (0-indexed)
const LESSON_ID = 62;

export default function Lesson13() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [currentBuildStep, setCurrentBuildStep] = useState(0);
    const [stepsCompleted, setStepsCompleted] = useState<boolean[]>([false, false, false, false]);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizStage, setQuizStage] = useState(1);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizChecked, setQuizChecked] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [showFinalCode, setShowFinalCode] = useState(false);
    const [consoleOutput, setConsoleOutput] = useState<string[]>([]);

    // Restaurant simulation state
    const [customerName, setCustomerName] = useState('');
    const [orderChoice, setOrderChoice] = useState<string | null>(null);
    const [showReceipt, setShowReceipt] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const buildSteps = [
        {
            title: 'Step 1: Create the take_order Function',
            description: 'Ask the customer what they want to order!',
            code: `def take_order():
    print("What would you like to order?")
    choice = input("Enter 1, 2, 3, or 4: ")
    return choice`,
            explanation: 'This function asks the customer for their choice and returns what they picked!',
            action: () => {
                setConsoleOutput([
                    'What would you like to order?',
                    'Enter 1, 2, 3, or 4: _'
                ]);
            }
        },
        {
            title: 'Step 2: Create the get_price Function',
            description: 'Use if/elif to return the right price!',
            code: `def get_price(choice):
    if choice == "1":
        return 8
    elif choice == "2":
        return 10
    elif choice == "3":
        return 9
    elif choice == "4":
        return 2
    else:
        return 0`,
            explanation: 'This function uses if/elif to check the choice and return the matching price. If they pick something invalid, return 0!',
            action: () => {
                setConsoleOutput([
                    '> Customer picks option 1 (Cheese Pizza)',
                    'get_price("1") returns: $8',
                    '',
                    '> Customer picks option 2 (Pepperoni)',
                    'get_price("2") returns: $10',
                ]);
            }
        },
        {
            title: 'Step 3: Create the process_order Function',
            description: 'Put all the pieces together!',
            code: `def process_order(name):
    greet_customer(name)
    show_menu()
    order = take_order()
    price = get_price(order)
    print(f"That will be \${price}")
    print("Thank you for your order!")`,
            explanation: 'This main function calls ALL our other functions in the right order! It greets, shows menu, takes order, gets price, and thanks the customer!',
            action: () => {
                setConsoleOutput([
                    '> process_order("Alex")',
                    '',
                    'Welcome to Pizza Palace, Alex!',
                    '',
                    '--- PIZZA PALACE MENU ---',
                    '1. Cheese Pizza - $8',
                    '2. Pepperoni Pizza - $10',
                    '3. Veggie Pizza - $9',
                    '4. Drink - $2',
                    '',
                    'What would you like to order?',
                    'Enter 1, 2, 3, or 4: 1',
                    '',
                    'That will be $8',
                    'Thank you for your order!'
                ]);
            }
        },
        {
            title: 'Step 4: Run the Complete Restaurant!',
            description: 'See all your functions working together!',
            code: `# Run the restaurant!
process_order("Alex")`,
            explanation: 'With just ONE line of code, we run our entire restaurant! All our functions work together like a team!',
            action: () => {
                setConsoleOutput([
                    'Welcome to Pizza Palace, Alex!',
                    '',
                    '--- PIZZA PALACE MENU ---',
                    '1. Cheese Pizza - $8',
                    '2. Pepperoni Pizza - $10',
                    '3. Veggie Pizza - $9',
                    '4. Drink - $2',
                    '',
                    'What would you like to order?',
                    'Enter 1, 2, 3, or 4: 2',
                    '',
                    'That will be $10',
                    'Thank you for your order!'
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

    // Interactive restaurant simulation
    const startOrder = () => {
        if (!customerName.trim()) return;
        setConsoleOutput([
            `Welcome to Pizza Palace, ${customerName}!`,
            '',
            '--- PIZZA PALACE MENU ---',
            '1. Cheese Pizza - $8',
            '2. Pepperoni Pizza - $10',
            '3. Veggie Pizza - $9',
            '4. Drink - $2',
            '',
            'What would you like to order?'
        ]);
    };

    const selectOrder = (choice: string) => {
        setOrderChoice(choice);
        const prices: Record<string, number> = { '1': 8, '2': 10, '3': 9, '4': 2 };
        const items: Record<string, string> = { '1': 'Cheese Pizza', '2': 'Pepperoni Pizza', '3': 'Veggie Pizza', '4': 'Drink' };

        setConsoleOutput([
            `Welcome to Pizza Palace, ${customerName}!`,
            '',
            '--- PIZZA PALACE MENU ---',
            '1. Cheese Pizza - $8',
            '2. Pepperoni Pizza - $10',
            '3. Veggie Pizza - $9',
            '4. Drink - $2',
            '',
            `You chose: ${items[choice]}`,
            `That will be $${prices[choice]}`,
            'Thank you for your order!'
        ]);
        setShowReceipt(true);
    };

    const resetOrder = () => {
        setCustomerName('');
        setOrderChoice(null);
        setShowReceipt(false);
        setConsoleOutput([]);
    };

    const checkQuiz = () => {
        setQuizChecked(true);
        const correctAnswers = [1, 1]; // B is correct for both

        if (quizAnswer === correctAnswers[quizStage - 1]) {
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
            <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
                <div className="flex items-center justify-center h-screen">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        style={{ fontSize: '3rem' }}
                    >
                        <Pizza size={48} style={{ color: 'var(--accent-primary)' }} />
                    </motion.div>
                </div>
            </div>
        );
    }

    // GRAND SUCCESS screen - Level 4 Complete!
    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(20, 30, 50, 0.98))' }}>
                {/* Confetti Animation */}
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
                            style={{ position: 'absolute', fontSize: '2rem' }}
                        >
                            {['def', '{', '}', '()', '=>', '!', '?', '+', '*'][Math.floor(Math.random() * 9)]}
                        </motion.div>
                    ))}
                </div>

                {/* Pulsing Background */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                        position: 'absolute',
                        width: '400px', height: '400px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3), transparent)',
                        zIndex: 0
                    }}
                />

                {/* Trophy */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', duration: 0.8 }}
                    style={{
                        position: 'relative', zIndex: 1,
                        width: '120px', height: '120px',
                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
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
                        fontSize: '2.5rem', fontWeight: 900,
                        background: 'linear-gradient(135deg, #fbbf24, #ec4899, #8b5cf6)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        marginBottom: '0.5rem', zIndex: 1
                    }}
                >
                    LEVEL 4 COMPLETE!
                </motion.h2>

                <motion.h3
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ec4899', marginBottom: '1rem', zIndex: 1 }}
                >
                    FUNCTION MASTER Unlocked!
                </motion.h3>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className={styles.successMessage}
                    style={{ zIndex: 1, maxWidth: '500px' }}
                >
                    You've mastered Python Functions! You can now create reusable code, pass parameters, return values, and build complete programs!
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
                        display: 'flex', flexWrap: 'wrap', gap: '0.75rem',
                        justifyContent: 'center', marginBottom: '2rem', zIndex: 1
                    }}
                >
                    {['def', 'parameters', 'return', 'if/else', 'loops', 'lists'].map((skill, i) => (
                        <motion.span
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1.1 + i * 0.1, type: 'spring' }}
                            style={{
                                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(168, 85, 247, 0.2))',
                                border: '1px solid rgba(236, 72, 153, 0.5)',
                                padding: '0.5rem 1rem', borderRadius: '9999px',
                                fontSize: '0.9rem', fontWeight: 600
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
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(236, 72, 153, 0.2))',
                        border: '2px solid rgba(251, 191, 36, 0.5)',
                        padding: '1rem 2rem', borderRadius: '9999px',
                        marginBottom: '2rem', zIndex: 1
                    }}
                >
                    <Award size={24} className="text-amber-400" />
                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Pizza Palace Complete!</span>
                    <Sparkles size={24} style={{ color: '#ec4899' }} />
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.7 }}
                    style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', zIndex: 1 }}
                >
                    <Link href="/level4" className={`${styles.navBtn} ${styles.secondary}`}>
                        <ArrowLeft size={18} /> Back to Level 4
                    </Link>
                    <Link
                        href="/level4/complete"
                        className={`${styles.navBtn} ${styles.primary}`}
                        style={{ background: 'linear-gradient(135deg, #fbbf24, #ec4899)' }}
                    >
                        <PartyPopper size={18} /> Celebrate! <ChevronRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            <header className={styles.header} style={{ background: 'var(--bg-secondary)' }}>
                <Link href="/level4" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 13 - FINAL PROJECT</span>
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
                                style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(236, 72, 153, 0.3))' }}
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
                                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(236, 72, 153, 0.2))',
                                border: '2px solid rgba(251, 191, 36, 0.4)',
                                textAlign: 'center'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>🍕</span>
                                <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Complete Your Pizza Palace Restaurant!</h3>
                                <span style={{ fontSize: '1.5rem' }}>🍕</span>
                            </div>
                            <p style={{ fontSize: '1.1rem', margin: 0 }}>
                                Add the take_order, get_price, and process_order functions to finish your restaurant!
                            </p>
                        </motion.div>

                        {/* Build Progress Tracker */}
                        <div style={{
                            display: 'flex', justifyContent: 'center', gap: '1rem',
                            marginBottom: '2rem', padding: '1rem',
                            background: 'var(--bg-secondary)', borderRadius: 'var(--radius)'
                        }}>
                            {buildSteps.map((step, idx) => (
                                <div key={idx} style={{ textAlign: 'center' }}>
                                    <motion.div
                                        animate={stepsCompleted[idx] ? { scale: [1, 1.2, 1] } : {}}
                                        style={{
                                            width: '50px', height: '50px',
                                            borderRadius: '50%',
                                            background: stepsCompleted[idx] ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.1)',
                                            border: stepsCompleted[idx] ? 'none' : currentBuildStep === idx ? '3px solid var(--accent-primary)' : '2px solid rgba(255,255,255,0.2)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            margin: '0 auto 0.5rem',
                                            boxShadow: stepsCompleted[idx] ? '0 0 20px rgba(16, 185, 129, 0.4)' : 'none'
                                        }}
                                    >
                                        {stepsCompleted[idx] ? <Check size={24} /> : <span style={{ fontWeight: 700 }}>{idx + 1}</span>}
                                    </motion.div>
                                    <span style={{ fontSize: '0.65rem', color: stepsCompleted[idx] ? '#10b981' : 'var(--text-muted)' }}>
                                        Step {idx + 1}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Interactive Restaurant Simulation */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                background: 'linear-gradient(135deg, #1a1a2e, #0f172a)',
                                border: '2px solid rgba(251, 191, 36, 0.3)',
                                borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '2rem'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <Pizza size={20} style={{ color: '#fbbf24' }} />
                                <h3 style={{ margin: 0, fontWeight: 700 }}>Try Your Restaurant!</h3>
                            </div>

                            {!orderChoice ? (
                                <>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                                            Enter customer name:
                                        </label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input
                                                type="text"
                                                value={customerName}
                                                onChange={(e) => setCustomerName(e.target.value)}
                                                placeholder="Your name"
                                                style={{
                                                    flex: 1, padding: '0.75rem',
                                                    background: 'rgba(0,0,0,0.3)',
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                    borderRadius: '0.5rem', color: 'white'
                                                }}
                                            />
                                            <button
                                                onClick={startOrder}
                                                disabled={!customerName.trim()}
                                                style={{
                                                    padding: '0.75rem 1.5rem',
                                                    background: customerName.trim() ? '#fbbf24' : 'rgba(255,255,255,0.1)',
                                                    border: 'none', borderRadius: '0.5rem',
                                                    color: customerName.trim() ? '#000' : 'var(--text-muted)',
                                                    fontWeight: 600, cursor: customerName.trim() ? 'pointer' : 'not-allowed'
                                                }}
                                            >
                                                Start Order
                                            </button>
                                        </div>
                                    </div>

                                    {consoleOutput.length > 0 && !showReceipt && (
                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={{
                                                display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
                                                gap: '0.5rem'
                                            }}>
                                                {['1', '2', '3', '4'].map((choice) => (
                                                    <button
                                                        key={choice}
                                                        onClick={() => selectOrder(choice)}
                                                        style={{
                                                            padding: '1rem',
                                                            background: 'rgba(251, 191, 36, 0.2)',
                                                            border: '1px solid rgba(251, 191, 36, 0.4)',
                                                            borderRadius: '0.5rem', color: 'white',
                                                            fontWeight: 600, cursor: 'pointer',
                                                            textAlign: 'left'
                                                        }}
                                                    >
                                                        {choice === '1' && '1. Cheese Pizza - $8'}
                                                        {choice === '2' && '2. Pepperoni Pizza - $10'}
                                                        {choice === '3' && '3. Veggie Pizza - $9'}
                                                        {choice === '4' && '4. Drink - $2'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div style={{ textAlign: 'center' }}>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        style={{
                                            display: 'inline-block',
                                            padding: '1.5rem 2rem',
                                            background: 'rgba(16, 185, 129, 0.2)',
                                            border: '2px solid rgba(16, 185, 129, 0.4)',
                                            borderRadius: 'var(--radius)', marginBottom: '1rem'
                                        }}
                                    >
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍕</div>
                                        <div style={{ fontWeight: 700, color: '#10b981', marginBottom: '0.25rem' }}>Order Complete!</div>
                                        <div style={{ color: 'var(--text-muted)' }}>Thank you, {customerName}!</div>
                                    </motion.div>
                                    <div>
                                        <button
                                            onClick={resetOrder}
                                            style={{
                                                padding: '0.75rem 1.5rem',
                                                background: 'rgba(251, 191, 36, 0.2)',
                                                border: '1px solid rgba(251, 191, 36, 0.4)',
                                                borderRadius: '0.5rem', color: '#fbbf24',
                                                fontWeight: 600, cursor: 'pointer'
                                            }}
                                        >
                                            New Order
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Console Output */}
                            {consoleOutput.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{
                                        background: 'rgba(0,0,0,0.4)',
                                        borderRadius: '0.5rem', padding: '1rem',
                                        fontFamily: 'monospace', fontSize: '0.9rem', marginTop: '1rem'
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
                                                color: line.includes('Welcome') ? '#fbbf24' :
                                                    line.includes('Thank you') ? '#10b981' :
                                                        line.includes('$') ? '#ec4899' : '#f8f8f2'
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
                                    background: stepsCompleted[idx] ? 'rgba(16, 185, 129, 0.1)' : currentBuildStep === idx ? 'var(--bg-secondary)' : 'rgba(0,0,0,0.2)',
                                    border: stepsCompleted[idx] ? '2px solid rgba(16, 185, 129, 0.4)' : currentBuildStep === idx ? '2px solid var(--accent-primary)' : '1px solid var(--border-primary)',
                                    borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '1.5rem',
                                    opacity: idx > currentBuildStep && !stepsCompleted[idx] ? 0.5 : 1
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div style={{
                                        width: '36px', height: '36px',
                                        borderRadius: '50%',
                                        background: stepsCompleted[idx] ? '#10b981' : idx === 0 ? '#fbbf24' : idx === 1 ? '#ec4899' : idx === 2 ? '#8b5cf6' : '#3b82f6',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
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
                                        <span>pizza_palace.py</span>
                                        <span style={{ color: stepsCompleted[idx] ? '#10b981' : 'var(--text-muted)' }}>
                                            {stepsCompleted[idx] ? 'Complete!' : `Step ${idx + 1}`}
                                        </span>
                                    </div>
                                    <div className={styles.codeContent} style={{ fontSize: '0.85rem' }}>
                                        {step.code.split('\n').map((line, lineIdx) => {
                                            let formattedLine = line
                                                .replace(/\b(def|if|elif|else|return)\b/g, '<span class="keyword">$1</span>')
                                                .replace(/(print|input)/g, '<span style="color: #8be9fd">$1</span>')
                                                .replace(/"([^"]*)"/g, '<span class="string">"$1"</span>')
                                                .replace(/(\d+)/g, '<span class="number">$1</span>')
                                                .replace(/#.*/g, '<span class="comment">$&</span>');
                                            return <div key={lineIdx} dangerouslySetInnerHTML={{ __html: formattedLine || '&nbsp;' }} />;
                                        })}
                                    </div>
                                </div>

                                {/* Explanation */}
                                <div style={{
                                    background: 'rgba(251, 191, 36, 0.1)',
                                    border: '1px solid rgba(251, 191, 36, 0.3)',
                                    borderRadius: '0.5rem', padding: '0.75rem 1rem', marginTop: '1rem',
                                    display: 'flex', gap: '0.75rem', alignItems: 'flex-start'
                                }}>
                                    <Lightbulb size={18} className="text-amber-400" style={{ marginTop: '2px', flexShrink: 0 }} />
                                    <p style={{ margin: 0, fontSize: '0.9rem' }}>{step.explanation}</p>
                                </div>

                                {/* Run Button */}
                                {idx === currentBuildStep && !stepsCompleted[idx] && (
                                    <motion.button
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        onClick={() => runBuildStep(idx)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            padding: '0.75rem 1.5rem', marginTop: '1rem',
                                            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                            border: 'none', borderRadius: '0.5rem',
                                            color: '#000', fontWeight: 600, cursor: 'pointer'
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
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            padding: '0.75rem 1.5rem', marginTop: '1rem',
                                            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                                            border: 'none', borderRadius: '0.5rem',
                                            color: 'white', fontWeight: 600, cursor: 'pointer'
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
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                                        width: '100%', padding: '1rem',
                                        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(236, 72, 153, 0.2))',
                                        border: '2px solid rgba(251, 191, 36, 0.4)',
                                        borderRadius: 'var(--radius)', color: 'white',
                                        fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', marginBottom: '1.5rem'
                                    }}
                                >
                                    <Trophy size={24} className="text-amber-400" />
                                    {showFinalCode ? 'Hide' : 'Show'} Complete Pizza Palace Code
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
                                            <h3>Complete Pizza Palace Restaurant</h3>
                                            <div className={styles.codeBlock}>
                                                <div className={styles.codeHeader}>
                                                    <span>pizza_palace_complete.py</span>
                                                    <span style={{ color: '#fbbf24' }}>FINAL VERSION</span>
                                                </div>
                                                <div className={styles.codeContent} style={{ fontSize: '0.85rem' }}>
                                                    <span className={styles.comment}># Pizza Palace - Complete Restaurant System</span>{'\n\n'}
                                                    <span className={styles.keyword}>def</span> <span style={{ color: '#8be9fd' }}>greet_customer</span>(name):{'\n'}
                                                    {'    '}<span style={{ color: '#8be9fd' }}>print</span>(<span className={styles.string}>f"Welcome to Pizza Palace, {'{'}name{'}'}!"</span>){'\n\n'}
                                                    <span className={styles.keyword}>def</span> <span style={{ color: '#8be9fd' }}>show_menu</span>():{'\n'}
                                                    {'    '}<span style={{ color: '#8be9fd' }}>print</span>(<span className={styles.string}>"--- PIZZA PALACE MENU ---"</span>){'\n'}
                                                    {'    '}<span style={{ color: '#8be9fd' }}>print</span>(<span className={styles.string}>"1. Cheese Pizza - $8"</span>){'\n'}
                                                    {'    '}<span style={{ color: '#8be9fd' }}>print</span>(<span className={styles.string}>"2. Pepperoni Pizza - $10"</span>){'\n'}
                                                    {'    '}<span style={{ color: '#8be9fd' }}>print</span>(<span className={styles.string}>"3. Veggie Pizza - $9"</span>){'\n'}
                                                    {'    '}<span style={{ color: '#8be9fd' }}>print</span>(<span className={styles.string}>"4. Drink - $2"</span>){'\n\n'}
                                                    <span className={styles.keyword}>def</span> <span style={{ color: '#8be9fd' }}>take_order</span>():{'\n'}
                                                    {'    '}<span style={{ color: '#8be9fd' }}>print</span>(<span className={styles.string}>"What would you like?"</span>){'\n'}
                                                    {'    '}choice = <span style={{ color: '#8be9fd' }}>input</span>(<span className={styles.string}>"Enter 1, 2, 3, or 4: "</span>){'\n'}
                                                    {'    '}<span className={styles.keyword}>return</span> choice{'\n\n'}
                                                    <span className={styles.keyword}>def</span> <span style={{ color: '#8be9fd' }}>get_price</span>(choice):{'\n'}
                                                    {'    '}<span className={styles.keyword}>if</span> choice == <span className={styles.string}>"1"</span>:{'\n'}
                                                    {'        '}<span className={styles.keyword}>return</span> <span className={styles.number}>8</span>{'\n'}
                                                    {'    '}<span className={styles.keyword}>elif</span> choice == <span className={styles.string}>"2"</span>:{'\n'}
                                                    {'        '}<span className={styles.keyword}>return</span> <span className={styles.number}>10</span>{'\n'}
                                                    {'    '}<span className={styles.keyword}>elif</span> choice == <span className={styles.string}>"3"</span>:{'\n'}
                                                    {'        '}<span className={styles.keyword}>return</span> <span className={styles.number}>9</span>{'\n'}
                                                    {'    '}<span className={styles.keyword}>elif</span> choice == <span className={styles.string}>"4"</span>:{'\n'}
                                                    {'        '}<span className={styles.keyword}>return</span> <span className={styles.number}>2</span>{'\n'}
                                                    {'    '}<span className={styles.keyword}>else</span>:{'\n'}
                                                    {'        '}<span className={styles.keyword}>return</span> <span className={styles.number}>0</span>{'\n\n'}
                                                    <span className={styles.keyword}>def</span> <span style={{ color: '#8be9fd' }}>process_order</span>(name):{'\n'}
                                                    {'    '}greet_customer(name){'\n'}
                                                    {'    '}show_menu(){'\n'}
                                                    {'    '}order = take_order(){'\n'}
                                                    {'    '}price = get_price(order){'\n'}
                                                    {'    '}<span style={{ color: '#8be9fd' }}>print</span>(<span className={styles.string}>f"That will be ${'{'}price{'}'}"</span>){'\n'}
                                                    {'    '}<span style={{ color: '#8be9fd' }}>print</span>(<span className={styles.string}>"Thank you for your order!"</span>){'\n\n'}
                                                    <span className={styles.comment}># Run the restaurant!</span>{'\n'}
                                                    process_order(<span className={styles.string}>"Alex"</span>)
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
                                style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(236, 72, 153, 0.1))' }}
                            >
                                <Lightbulb size={24} className="text-amber-400" style={{ flexShrink: 0 }} />
                                <div>
                                    <p style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '1.1rem' }}>What You Learned in Level 4:</p>
                                    <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'grid', gap: '0.5rem' }}>
                                        <li><code>def function_name():</code> - Create reusable functions</li>
                                        <li><code>Parameters</code> - Pass information to functions</li>
                                        <li><code>return</code> - Send values back from functions</li>
                                        <li><code>if/elif/else</code> - Make decisions in functions</li>
                                        <li><code>Calling functions</code> - Use your functions together!</li>
                                    </ul>
                                </div>
                            </motion.div>
                        )}

                        {/* Navigation */}
                        <div className={styles.navBar}>
                            <Link href="/level4/lesson12" className={`${styles.navBtn} ${styles.secondary}`}>
                                <ChevronLeft size={18} /> Previous
                            </Link>
                            {allStepsCompleted ? (
                                <button
                                    className={`${styles.navBtn} ${styles.primary}`}
                                    onClick={() => setShowQuiz(true)}
                                    style={{ background: 'linear-gradient(135deg, #fbbf24, #ec4899)' }}
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
                        style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(236, 72, 153, 0.15))' }}
                    >
                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{
                                background: 'linear-gradient(135deg, #fbbf24, #ec4899)',
                                padding: '0.25rem 0.75rem', borderRadius: '9999px',
                                fontSize: '0.85rem', fontWeight: 600
                            }}>
                                Question {quizStage} of 2
                            </span>
                        </div>

                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ fontSize: '3rem', marginBottom: '1rem' }}
                        >
                            🍕
                        </motion.div>

                        <h2 className={styles.quizTitle}>Final Challenge!</h2>

                        {quizStage === 1 ? (
                            <>
                                <p className={styles.quizQuestion}>What does the <code>return</code> statement do in a function?</p>
                                <div className={styles.quizOptions}>
                                    {[
                                        'A) Prints a message',
                                        'B) Sends a value back to the caller'
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
                                <p className={styles.quizQuestion}>Can one function call another function?</p>
                                <div className={styles.quizOptions}>
                                    {[
                                        'A) No, functions work alone',
                                        'B) Yes! Functions can work together!'
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
                                style={{ background: 'linear-gradient(135deg, #fbbf24, #ec4899)' }}
                            >
                                Check Answer
                            </button>
                        ) : quizAnswer !== 1 ? (
                            <div className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>
                                    {quizStage === 1
                                        ? 'The return statement sends a value back to whoever called the function - like get_price returning the price!'
                                        : 'Functions can absolutely call other functions! That\'s how process_order calls greet_customer, show_menu, and more!'}
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
                                <p>Yes! return sends a value back - like get_price returning the price of your order!</p>
                            </motion.div>
                        ) : null}

                        <button
                            onClick={() => setShowQuiz(false)}
                            style={{
                                marginTop: '1.5rem', padding: '0.5rem 1rem',
                                background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '0.5rem', color: 'var(--text-muted)', cursor: 'pointer'
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
