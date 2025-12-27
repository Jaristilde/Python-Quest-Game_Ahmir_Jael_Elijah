'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Gamepad2, Trophy, Sparkles, Code, Target } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL2_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL2_LESSONS[7]; // Lesson 8
const LESSON_ID = 23;

export default function Lesson8() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [currentStep, setCurrentStep] = useState(0);
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizStep, setQuizStep] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [playerChoice, setPlayerChoice] = useState<'rock' | 'paper' | 'scissors'>('rock');
    const [computerChoice, setComputerChoice] = useState<string>('');
    const [gameResult, setGameResult] = useState<string>('');
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const steps = [
        {
            title: "Step 1: Import the Random Module",
            description: "First, we need Python's random module to make the computer pick randomly!",
            code: `import random`,
            explanation: "This gives us access to random.choice() which picks a random item from a list."
        },
        {
            title: "Step 2: Create the Choices List",
            description: "We need a list of all possible moves in the game.",
            code: `import random

choices = ["rock", "paper", "scissors"]`,
            explanation: "This list contains all three options the computer can pick from!"
        },
        {
            title: "Step 3: Computer Makes a Choice",
            description: "Now let the computer pick randomly from our choices!",
            code: `import random

choices = ["rock", "paper", "scissors"]
computer = random.choice(choices)`,
            explanation: "random.choice(choices) picks one random item from our list. Every time you run it, it could be different!"
        },
        {
            title: "Step 4: Set the Player's Choice",
            description: "For now, we'll set the player's choice directly (in Part 2, we'll make it interactive!)",
            code: `import random

choices = ["rock", "paper", "scissors"]
computer = random.choice(choices)
player = "rock"  # Try changing this!`,
            explanation: "We set the player's choice manually. You can change 'rock' to 'paper' or 'scissors'!"
        },
        {
            title: "Step 5: Show Both Choices",
            description: "Let's print out what both players chose!",
            code: `import random

choices = ["rock", "paper", "scissors"]
computer = random.choice(choices)
player = "rock"

print(f"You chose: {player}")
print(f"Computer chose: {computer}")`,
            explanation: "Using f-strings, we can show exactly what each player picked!"
        },
        {
            title: "Step 6: Determine the Winner!",
            description: "This is where the magic happens - using if/elif/else to decide who wins!",
            code: `import random

choices = ["rock", "paper", "scissors"]
computer = random.choice(choices)
player = "rock"

print(f"You chose: {player}")
print(f"Computer chose: {computer}")

if player == computer:
    print("It's a tie!")
elif player == "rock" and computer == "scissors":
    print("You win! Rock crushes scissors!")
elif player == "paper" and computer == "rock":
    print("You win! Paper covers rock!")
elif player == "scissors" and computer == "paper":
    print("You win! Scissors cut paper!")
else:
    print("Computer wins!")`,
            explanation: "We check every possible outcome! First ties, then all ways the player wins, and else = computer wins."
        }
    ];

    const runGame = () => {
        setIsRunning(true);
        const choices = ["rock", "paper", "scissors"];
        const computer = choices[Math.floor(Math.random() * choices.length)];
        setComputerChoice(computer);

        let result = '';
        if (playerChoice === computer) {
            result = "It's a tie!";
        } else if (
            (playerChoice === "rock" && computer === "scissors") ||
            (playerChoice === "paper" && computer === "rock") ||
            (playerChoice === "scissors" && computer === "paper")
        ) {
            result = `You win! ${playerChoice.charAt(0).toUpperCase() + playerChoice.slice(1)} beats ${computer}!`;
        } else {
            result = `Computer wins! ${computer.charAt(0).toUpperCase() + computer.slice(1)} beats ${playerChoice}!`;
        }

        setGameResult(result);
        setOutput(`You chose: ${playerChoice}\nComputer chose: ${computer}\n\n${result}`);

        setTimeout(() => setIsRunning(false), 500);
    };

    const getHandEmoji = (choice: string) => {
        switch (choice) {
            case 'rock': return '';
            case 'paper': return '';
            case 'scissors': return '';
            default: return '?';
        }
    };

    const checkQuiz = (questionIndex: number) => {
        const newChecked = [...quizChecked];
        newChecked[questionIndex] = true;
        setQuizChecked(newChecked);

        const correctAnswers = [1, 0]; // Question 1: index 1, Question 2: index 0

        if (quizAnswers[questionIndex] === correctAnswers[questionIndex]) {
            if (questionIndex === 0) {
                setTimeout(() => setQuizStep(1), 1000);
            } else {
                setTimeout(() => {
                    addXpAndCoins(LESSON.xpReward, 5);
                    completeLevel(LESSON_ID, LESSON.xpReward, 5, 1, 60);
                    setLessonComplete(true);
                }, 1000);
            }
        }
    };

    if (isLoading || !user) return <div className={styles.container}><div className="flex items-center justify-center h-screen text-slate-400">Loading...</div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                    style={{
                        fontSize: '6rem',
                        marginBottom: '1rem'
                    }}
                >

                </motion.div>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className={styles.successIcon}
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
                >
                    <Trophy size={50} className="text-white" />
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className={styles.successTitle}
                >
                    {LESSON.successMessage}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className={styles.successMessage}
                >
                    You built your FIRST REAL GAME! In Part 2, you'll add loops for best-of-3!
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 }}
                    className={styles.successXp}
                >
                    <Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', fontSize: '3rem' }}
                >
                    <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 1 }}></motion.span>
                    <motion.span animate={{ rotate: [0, -15, 15, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}></motion.span>
                    <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}></motion.span>
                </motion.div>
                <Link href="/level2/lesson9" className={`${styles.navBtn} ${styles.primary}`}>
                    Continue Adventure <ChevronRight size={18} />
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/level2" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 18</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                {!showQuiz ? (
                    <>
                        {/* Project Banner */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                background: 'linear-gradient(135deg, #f59e0b, #ef4444, #ec4899)',
                                borderRadius: '1rem',
                                padding: '1.5rem',
                                marginBottom: '2rem',
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                style={{
                                    position: 'absolute',
                                    top: '-50%',
                                    right: '-50%',
                                    width: '100%',
                                    height: '200%',
                                    background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)',
                                }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '2rem' }}>
                                <motion.span animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.5 }}></motion.span>
                                <motion.span animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }}></motion.span>
                                <motion.span animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }}></motion.span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <Gamepad2 size={24} />
                                <span style={{ fontWeight: 800, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Guided Project</span>
                                <Gamepad2 size={24} />
                            </div>
                            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.25rem' }}>Rock, Paper, Scissors</h1>
                            <p style={{ opacity: 0.9 }}>Part 1: Build Your First Real Game!</p>
                        </motion.div>

                        {/* Mission Box */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.15))', borderColor: 'rgba(245, 158, 11, 0.3)' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <Target size={24} className="text-amber-400" />
                                <span style={{ fontWeight: 700 }}>Your Mission</span>
                                <Sparkles size={20} className="text-amber-400" />
                            </div>
                            <p>Time to build your FIRST REAL GAME! We'll create Rock, Paper, Scissors step by step!</p>
                            <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                                You'll combine everything you've learned: variables, lists, random, and if/elif/else!
                            </p>
                        </motion.div>

                        {/* Step Progress */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Progress</span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Step {currentStep + 1} of {steps.length}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                {steps.map((_, idx) => (
                                    <motion.div
                                        key={idx}
                                        style={{
                                            flex: 1,
                                            height: '8px',
                                            borderRadius: '4px',
                                            background: idx <= currentStep ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'rgba(255,255,255,0.1)',
                                            cursor: 'pointer'
                                        }}
                                        whileHover={{ scale: 1.1 }}
                                        onClick={() => setCurrentStep(idx)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Current Step */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className={styles.explainBox}
                                style={{ background: 'rgba(0,0,0,0.3)' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    <Code size={20} className="text-emerald-400" />
                                    <h3 style={{ fontWeight: 700 }}>{steps[currentStep].title}</h3>
                                </div>
                                <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>{steps[currentStep].description}</p>

                                <div className={styles.codeBlock}>
                                    <div className={styles.codeHeader}>
                                        <span>game.py</span>
                                        <span>Python</span>
                                    </div>
                                    <div className={styles.codeContent} style={{ fontSize: '0.9rem' }}>
                                        {steps[currentStep].code.split('\n').map((line, idx) => {
                                            let formattedLine = line;

                                            // Comments
                                            if (line.trim().startsWith('#')) {
                                                return <span key={idx} style={{ color: '#6272a4' }}>{line}{'\n'}</span>;
                                            }

                                            // Keywords
                                            formattedLine = line
                                                .replace(/^(import|if|elif|else|and|or)(\s)/g, '<kw>$1</kw>$2')
                                                .replace(/(\s)(import|if|elif|else|and|or)(\s|:)/g, '$1<kw>$2</kw>$3');

                                            // Function names
                                            formattedLine = formattedLine
                                                .replace(/(print|random\.choice)/g, '<fn>$1</fn>');

                                            // Strings
                                            formattedLine = formattedLine
                                                .replace(/(f?"[^"]*"|'[^']*')/g, '<str>$1</str>');

                                            return (
                                                <span key={idx}>
                                                    {formattedLine.split(/(<kw>|<\/kw>|<fn>|<\/fn>|<str>|<\/str>)/).map((part, i) => {
                                                        if (part === '<kw>' || part === '</kw>' || part === '<fn>' || part === '</fn>' || part === '<str>' || part === '</str>') return null;
                                                        const prevParts = formattedLine.split(/(<kw>|<\/kw>|<fn>|<\/fn>|<str>|<\/str>)/);
                                                        const idx2 = prevParts.indexOf(part);
                                                        const isKeyword = idx2 > 0 && prevParts[idx2 - 1] === '<kw>';
                                                        const isFunction = idx2 > 0 && prevParts[idx2 - 1] === '<fn>';
                                                        const isString = idx2 > 0 && prevParts[idx2 - 1] === '<str>';

                                                        if (isKeyword) return <span key={i} style={{ color: '#ff79c6' }}>{part}</span>;
                                                        if (isFunction) return <span key={i} style={{ color: '#50fa7b' }}>{part}</span>;
                                                        if (isString) return <span key={i} style={{ color: '#f1fa8c' }}>{part}</span>;
                                                        return <span key={i}>{part}</span>;
                                                    })}
                                                    {'\n'}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div style={{
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    borderRadius: '0.5rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <Lightbulb size={16} className="text-emerald-400" />
                                        <span style={{ fontWeight: 600, color: '#10b981' }}>What this does:</span>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{steps[currentStep].explanation}</p>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Step Navigation */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <button
                                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                                disabled={currentStep === 0}
                                style={{
                                    padding: '0.75rem 1.25rem',
                                    background: currentStep === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    color: currentStep === 0 ? 'var(--text-muted)' : 'white',
                                    cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontWeight: 600
                                }}
                            >
                                <ChevronLeft size={18} /> Previous Step
                            </button>
                            <button
                                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                                disabled={currentStep === steps.length - 1}
                                style={{
                                    padding: '0.75rem 1.25rem',
                                    background: currentStep === steps.length - 1 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #f59e0b, #ef4444)',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    color: currentStep === steps.length - 1 ? 'var(--text-muted)' : 'white',
                                    cursor: currentStep === steps.length - 1 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontWeight: 600
                                }}
                            >
                                Next Step <ChevronRight size={18} />
                            </button>
                        </div>

                        {/* Interactive Game Section */}
                        {currentStep === steps.length - 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
                                    border: '2px solid rgba(99, 102, 241, 0.3)',
                                    borderRadius: '1rem',
                                    padding: '1.5rem',
                                    marginBottom: '2rem'
                                }}
                            >
                                <h3 style={{ textAlign: 'center', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <Gamepad2 size={24} className="text-indigo-400" />
                                    Try Your Game!
                                </h3>

                                {/* Player Choice */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <p style={{ textAlign: 'center', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>Choose your move:</p>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                        {(['rock', 'paper', 'scissors'] as const).map((choice) => (
                                            <motion.button
                                                key={choice}
                                                onClick={() => setPlayerChoice(choice)}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                style={{
                                                    padding: '1rem 1.5rem',
                                                    fontSize: '2.5rem',
                                                    background: playerChoice === choice
                                                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                                        : 'rgba(0,0,0,0.3)',
                                                    border: playerChoice === choice
                                                        ? '2px solid #8b5cf6'
                                                        : '2px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '1rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {getHandEmoji(choice)}
                                            </motion.button>
                                        ))}
                                    </div>
                                    <p style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        Selected: <strong style={{ color: '#8b5cf6' }}>{playerChoice.charAt(0).toUpperCase() + playerChoice.slice(1)}</strong>
                                    </p>
                                </div>

                                {/* Run Game Button */}
                                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                    <motion.button
                                        onClick={runGame}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        disabled={isRunning}
                                        style={{
                                            padding: '1rem 2rem',
                                            background: 'linear-gradient(135deg, #10b981, #059669)',
                                            border: 'none',
                                            borderRadius: '0.75rem',
                                            color: 'white',
                                            fontSize: '1.1rem',
                                            fontWeight: 700,
                                            cursor: isRunning ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            margin: '0 auto'
                                        }}
                                    >
                                        <Play size={20} /> {isRunning ? 'Running...' : 'Play Game!'}
                                    </motion.button>
                                </div>

                                {/* Game Output */}
                                {output && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            background: '#0d1117',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '0.75rem',
                                            padding: '1rem',
                                            marginTop: '1rem'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '3rem' }}>{getHandEmoji(playerChoice)}</div>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>You</div>
                                            </div>
                                            <div style={{ fontSize: '2rem', color: 'var(--text-muted)', alignSelf: 'center' }}>VS</div>
                                            <div style={{ textAlign: 'center' }}>
                                                <motion.div
                                                    style={{ fontSize: '3rem' }}
                                                    animate={isRunning ? { rotate: [0, 360] } : {}}
                                                    transition={{ duration: 0.5 }}
                                                >
                                                    {computerChoice ? getHandEmoji(computerChoice) : '?'}
                                                </motion.div>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Computer</div>
                                            </div>
                                        </div>
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '0.75rem',
                                            borderRadius: '0.5rem',
                                            background: gameResult.includes('win') && !gameResult.includes('Computer')
                                                ? 'rgba(16, 185, 129, 0.2)'
                                                : gameResult.includes('tie')
                                                    ? 'rgba(245, 158, 11, 0.2)'
                                                    : 'rgba(239, 68, 68, 0.2)',
                                            color: gameResult.includes('win') && !gameResult.includes('Computer')
                                                ? '#10b981'
                                                : gameResult.includes('tie')
                                                    ? '#f59e0b'
                                                    : '#ef4444',
                                            fontWeight: 700,
                                            fontSize: '1.1rem'
                                        }}>
                                            {gameResult}
                                        </div>
                                    </motion.div>
                                )}

                                <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    Run it multiple times to see the random computer choices!
                                </p>
                            </motion.div>
                        )}

                        {/* Complete Code Section */}
                        <div className={styles.codeSection}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Sparkles size={18} className="text-amber-400" />
                                Complete Game Code
                            </h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}>
                                    <span>rock_paper_scissors.py</span>
                                    <span>Python</span>
                                </div>
                                <div className={styles.codeContent} style={{ fontSize: '0.85rem' }}>
                                    <span className={styles.comment}># Rock, Paper, Scissors Game!</span>{'\n'}
                                    <span className={styles.keyword}>import</span> random{'\n\n'}
                                    <span className={styles.comment}># All possible choices</span>{'\n'}
                                    choices = [<span className={styles.string}>"rock"</span>, <span className={styles.string}>"paper"</span>, <span className={styles.string}>"scissors"</span>]{'\n\n'}
                                    <span className={styles.comment}># Computer picks randomly</span>{'\n'}
                                    computer = random.choice(choices){'\n\n'}
                                    <span className={styles.comment}># Player's choice (change this!)</span>{'\n'}
                                    player = <span className={styles.string}>"rock"</span>{'\n\n'}
                                    <span className={styles.comment}># Show choices</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>f"You chose: {'{player}'}"</span>){'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>f"Computer chose: {'{computer}'}"</span>){'\n\n'}
                                    <span className={styles.comment}># Determine winner</span>{'\n'}
                                    <span className={styles.keyword}>if</span> player == computer:{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"It's a tie!"</span>){'\n'}
                                    <span className={styles.keyword}>elif</span> player == <span className={styles.string}>"rock"</span> <span className={styles.keyword}>and</span> computer == <span className={styles.string}>"scissors"</span>:{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"You win! Rock crushes scissors!"</span>){'\n'}
                                    <span className={styles.keyword}>elif</span> player == <span className={styles.string}>"paper"</span> <span className={styles.keyword}>and</span> computer == <span className={styles.string}>"rock"</span>:{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"You win! Paper covers rock!"</span>){'\n'}
                                    <span className={styles.keyword}>elif</span> player == <span className={styles.string}>"scissors"</span> <span className={styles.keyword}>and</span> computer == <span className={styles.string}>"paper"</span>:{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"You win! Scissors cut paper!"</span>){'\n'}
                                    <span className={styles.keyword}>else</span>:{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"Computer wins!"</span>)
                                </div>
                            </div>
                        </div>

                        {/* Tips Box */}
                        <div className={styles.tipBox} style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                            <Lightbulb size={20} className="text-indigo-400 flex-shrink-0" />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Your Turn to Experiment!</p>
                                <ul style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginLeft: '1rem' }}>
                                    <li>Change the player choice to "paper" or "scissors"</li>
                                    <li>Run multiple times to see random computer choices</li>
                                    <li>Try to win against the computer!</li>
                                </ul>
                            </div>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level2/lesson7" className={`${styles.navBtn} ${styles.secondary}`}>
                                <ChevronLeft size={18} /> Previous
                            </Link>
                            <button
                                className={`${styles.navBtn} ${styles.primary}`}
                                onClick={() => setShowQuiz(true)}
                                style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
                            >
                                Quiz Time! <ChevronRight size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={styles.quizSection}
                        style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(239, 68, 68, 0.1))', borderColor: 'rgba(245, 158, 11, 0.3)' }}
                    >
                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}></div>
                        <h2 className={styles.quizTitle}>Game Developer Quiz!</h2>

                        {quizStep === 0 ? (
                            <>
                                <p className={styles.quizQuestion}>
                                    What does <code>random.choice(choices)</code> do?
                                </p>
                                <div className={styles.quizOptions}>
                                    {[
                                        'Always picks the first item',
                                        'Picks a random item from the list',
                                        'Shuffles the entire list'
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
                                            className={`${styles.quizOption} ${quizAnswers[0] === idx ? styles.selected : ''} ${quizChecked[0] && idx === 1 ? styles.correct : ''} ${quizChecked[0] && quizAnswers[0] === idx && idx !== 1 ? styles.wrong : ''}`}
                                            disabled={quizChecked[0]}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                                {!quizChecked[0] ? (
                                    <button className={styles.quizBtn} onClick={() => checkQuiz(0)} disabled={quizAnswers[0] === null}>
                                        Check Answer
                                    </button>
                                ) : quizAnswers[0] !== 1 ? (
                                    <div className={`${styles.quizFeedback} ${styles.error}`}>
                                        <h4>Not quite!</h4>
                                        <p><code>random.choice()</code> picks ONE random item from a list - perfect for the computer's move!</p>
                                        <button
                                            className={styles.quizBtn}
                                            onClick={() => {
                                                const newChecked = [...quizChecked];
                                                newChecked[0] = false;
                                                setQuizChecked(newChecked);
                                                const newAnswers = [...quizAnswers];
                                                newAnswers[0] = null;
                                                setQuizAnswers(newAnswers);
                                            }}
                                            style={{ marginTop: '1rem' }}
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                ) : (
                                    <div className={`${styles.quizFeedback} ${styles.success}`} style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                        <h4 style={{ color: '#10b981' }}>Correct!</h4>
                                        <p>Moving to next question...</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>
                                    How do we check for a tie in the game?
                                </p>
                                <div className={styles.quizOptions}>
                                    {[
                                        'if player == computer',
                                        'if player = computer',
                                        'if player != computer'
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
                                            className={`${styles.quizOption} ${quizAnswers[1] === idx ? styles.selected : ''} ${quizChecked[1] && idx === 0 ? styles.correct : ''} ${quizChecked[1] && quizAnswers[1] === idx && idx !== 0 ? styles.wrong : ''}`}
                                            disabled={quizChecked[1]}
                                        >
                                            <code>{option}</code>
                                        </button>
                                    ))}
                                </div>
                                {!quizChecked[1] ? (
                                    <button className={styles.quizBtn} onClick={() => checkQuiz(1)} disabled={quizAnswers[1] === null}>
                                        Check Answer
                                    </button>
                                ) : quizAnswers[1] !== 0 ? (
                                    <div className={`${styles.quizFeedback} ${styles.error}`}>
                                        <h4>Not quite!</h4>
                                        <p>We use <code>==</code> to check if two values are equal. If player and computer picked the same thing, it's a tie!</p>
                                        <button
                                            className={styles.quizBtn}
                                            onClick={() => {
                                                const newChecked = [...quizChecked];
                                                newChecked[1] = false;
                                                setQuizChecked(newChecked);
                                                const newAnswers = [...quizAnswers];
                                                newAnswers[1] = null;
                                                setQuizAnswers(newAnswers);
                                            }}
                                            style={{ marginTop: '1rem' }}
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                ) : null}
                            </>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
