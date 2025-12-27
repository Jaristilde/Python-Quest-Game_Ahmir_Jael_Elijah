'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Trophy, Star, Gamepad2, RefreshCw, Award } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL2_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL2_LESSONS[17]; // Lesson 18
const LESSON_ID = 33;

type Choice = 'rock' | 'paper' | 'scissors';

interface RoundResult {
    round: number;
    playerChoice: Choice;
    computerChoice: Choice;
    winner: 'player' | 'computer' | 'tie';
}

export default function Lesson18() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [currentStep, setCurrentStep] = useState(0);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizStage, setQuizStage] = useState(1);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizChecked, setQuizChecked] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);

    // Game simulation state
    const [gameActive, setGameActive] = useState(false);
    const [playerScore, setPlayerScore] = useState(0);
    const [computerScore, setComputerScore] = useState(0);
    const [currentRound, setCurrentRound] = useState(0);
    const [roundHistory, setRoundHistory] = useState<RoundResult[]>([]);
    const [gameOutput, setGameOutput] = useState<string[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);

    // Confetti state
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const choices: Choice[] = ['rock', 'paper', 'scissors'];
    const choiceEmojis: Record<Choice, string> = { rock: '🪨', paper: '📄', scissors: '✂️' };

    const determineWinner = (player: Choice, computer: Choice): 'player' | 'computer' | 'tie' => {
        if (player === computer) return 'tie';
        if (
            (player === 'rock' && computer === 'scissors') ||
            (player === 'paper' && computer === 'rock') ||
            (player === 'scissors' && computer === 'paper')
        ) return 'player';
        return 'computer';
    };

    const startGame = () => {
        setGameActive(true);
        setPlayerScore(0);
        setComputerScore(0);
        setCurrentRound(0);
        setRoundHistory([]);
        setGameOutput(['Best of 3! First to 2 wins!', '']);
    };

    const playRound = (playerChoice: Choice) => {
        if (isAnimating || playerScore >= 2 || computerScore >= 2) return;

        setIsAnimating(true);
        const computerChoice = choices[Math.floor(Math.random() * 3)];
        const winner = determineWinner(playerChoice, computerChoice);
        const newRound = currentRound + 1;

        const result: RoundResult = {
            round: newRound,
            playerChoice,
            computerChoice,
            winner
        };

        setRoundHistory([...roundHistory, result]);
        setCurrentRound(newRound);

        let newPlayerScore = playerScore;
        let newComputerScore = computerScore;

        const newOutput = [...gameOutput];
        newOutput.push(`=== Round ${newRound} ===`);
        newOutput.push(`You: ${choiceEmojis[playerChoice]} ${playerChoice}`);
        newOutput.push(`Computer: ${choiceEmojis[computerChoice]} ${computerChoice}`);

        if (winner === 'tie') {
            newOutput.push('Tie! No points.');
        } else if (winner === 'player') {
            newPlayerScore++;
            setPlayerScore(newPlayerScore);
            newOutput.push('You win this round!');
        } else {
            newComputerScore++;
            setComputerScore(newComputerScore);
            newOutput.push('Computer wins this round!');
        }

        newOutput.push(`Score: You ${newPlayerScore} - ${newComputerScore} Computer`);
        newOutput.push('');

        // Check for game end
        if (newPlayerScore >= 2 || newComputerScore >= 2) {
            newOutput.push('GAME OVER!');
            if (newPlayerScore >= 2) {
                newOutput.push('YOU ARE THE CHAMPION!');
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 3000);
            } else {
                newOutput.push('Computer wins this time. Try again!');
            }
        }

        setGameOutput(newOutput);
        setTimeout(() => setIsAnimating(false), 300);
    };

    const resetGame = () => {
        setGameActive(false);
        setPlayerScore(0);
        setComputerScore(0);
        setCurrentRound(0);
        setRoundHistory([]);
        setGameOutput([]);
    };

    const gameEnded = playerScore >= 2 || computerScore >= 2;

    const checkQuiz = () => {
        setQuizChecked(true);
        const correctAnswer = quizStage === 1 ? 0 : 1;

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
                    setShowConfetti(true);
                }, 1000);
            }
        }
    };

    if (isLoading || !user) return <div className={styles.container}><div className="flex items-center justify-center h-screen text-slate-400">Loading...</div></div>;

    // Big celebration screen for completing Level 2!
    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 20, 50, 0.98))' }}>
                {/* Confetti Animation */}
                <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                    {[...Array(30)].map((_, i) => (
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
                            {['🎉', '⭐', '🎮', '🏆', '✨', '🥇', '🎊', '💎'][Math.floor(Math.random() * 8)]}
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
                        background: 'linear-gradient(135deg, #f59e0b, #ef4444, #ec4899)',
                        width: '120px',
                        height: '120px',
                        boxShadow: '0 0 60px rgba(245, 158, 11, 0.5), 0 0 100px rgba(236, 72, 153, 0.3)'
                    }}
                >
                    <Trophy size={60} className="text-white" />
                </motion.div>

                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={styles.successTitle}
                    style={{
                        fontSize: '2.5rem',
                        background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    LEVEL 2 COMPLETE!
                </motion.h2>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={styles.successMessage}
                    style={{ fontSize: '1.25rem' }}
                >
                    {LESSON.successMessage}
                </motion.p>

                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className={styles.successXp}
                    style={{ fontSize: '1.5rem' }}
                >
                    <Zap size={24} fill="currentColor" /> +{LESSON.xpReward} XP
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
                            <Star size={32} fill="#fbbf24" className="text-amber-400" />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Achievement Badge */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(236, 72, 153, 0.2))',
                        border: '2px solid rgba(245, 158, 11, 0.5)',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '9999px',
                        marginBottom: '1.5rem'
                    }}
                >
                    <Award size={20} className="text-amber-400" />
                    <span style={{ fontWeight: 700 }}>Game Developer Badge Earned!</span>
                    <Gamepad2 size={20} className="text-pink-400" />
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.4 }}
                    style={{ textAlign: 'center', marginBottom: '1.5rem' }}
                >
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                        You built a complete game with loops, conditions, and score tracking!
                    </p>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.6 }}
                >
                    <Link
                        href="/level2/complete"
                        className={`${styles.navBtn} ${styles.primary}`}
                        style={{
                            background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                            padding: '1rem 2rem',
                            fontSize: '1.1rem'
                        }}
                    >
                        See Your Achievement <ChevronRight size={20} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    const steps = [
        {
            title: 'Step 1: Set Up Scores',
            description: 'First, we need variables to track the score and rounds!',
            code: `import random

player_score = 0
computer_score = 0
rounds = 0`
        },
        {
            title: 'Step 2: Game Loop (Best of 3)',
            description: 'The game continues until someone wins 2 rounds!',
            code: `while player_score < 2 and computer_score < 2:
    rounds += 1
    print(f"\\n=== Round {rounds} ===")`
        },
        {
            title: 'Step 3: Get Choices',
            description: 'Computer picks randomly, you set your choice!',
            code: `    choices = ["rock", "paper", "scissors"]
    computer = random.choice(choices)
    player = "rock"  # Change this each round!

    print(f"You: {player}")
    print(f"Computer: {computer}")`
        },
        {
            title: 'Step 4: Determine Round Winner',
            description: 'Check all winning combinations using conditions!',
            code: `    if player == computer:
        print("Tie! No points.")
    elif (player == "rock" and computer == "scissors") or \\
         (player == "paper" and computer == "rock") or \\
         (player == "scissors" and computer == "paper"):
        print("You win this round!")
        player_score += 1
    else:
        print("Computer wins this round!")
        computer_score += 1

    print(f"Score: You {player_score} - {computer_score} Computer")`
        },
        {
            title: 'Step 5: Announce Winner',
            description: 'When the loop ends, declare the champion!',
            code: `print("\\nGAME OVER!")
if player_score > computer_score:
    print("YOU ARE THE CHAMPION!")
else:
    print("Computer wins this time. Try again!")`
        }
    ];

    return (
        <div className={styles.container}>
            {/* Confetti for winning */}
            <AnimatePresence>
                {showConfetti && (
                    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1000 }}>
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ y: -50, x: `${Math.random() * 100}vw`, opacity: 1 }}
                                animate={{ y: '100vh', opacity: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 2 + Math.random(), delay: Math.random() * 0.5 }}
                                style={{ position: 'absolute', fontSize: '2rem' }}
                            >
                                {['🎉', '⭐', '🏆', '✨'][Math.floor(Math.random() * 4)]}
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            <header className={styles.header}>
                <Link href="/level2" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 18 - FINAL PROJECT!</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                {!showQuiz ? (
                    <>
                        <div className={styles.lessonTitle}>
                            <motion.div
                                className={styles.lessonEmoji}
                                animate={{ rotate: [0, -10, 10, -10, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(236, 72, 153, 0.3))' }}
                            >
                                <Gamepad2 size={40} className="text-amber-400" />
                            </motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p style={{ color: '#ec4899' }}><strong>FINAL PROJECT:</strong> <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Mission Banner */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{
                                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(236, 72, 153, 0.2), rgba(139, 92, 246, 0.2))',
                                border: '2px solid rgba(245, 158, 11, 0.4)',
                                textAlign: 'center'
                            }}
                        >
                            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Let's make Rock, Paper, Scissors EPIC!</h3>
                            <p style={{ fontSize: '1.1rem' }}>Best of 3 rounds with score tracking!</p>
                        </motion.div>

                        {/* Step-by-Step Code Building */}
                        <div className={styles.explainBox} style={{ background: 'rgba(15, 23, 42, 0.5)' }}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1.2rem' }}>Build Step by Step</span>
                            </h3>

                            {/* Step Navigation */}
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                                {steps.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentStep(idx)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '0.5rem',
                                            border: currentStep === idx ? '2px solid #f59e0b' : '2px solid rgba(255,255,255,0.1)',
                                            background: currentStep === idx ? 'rgba(245, 158, 11, 0.2)' : 'rgba(0,0,0,0.2)',
                                            color: currentStep === idx ? '#fbbf24' : 'var(--text-muted)',
                                            cursor: 'pointer',
                                            fontWeight: currentStep === idx ? 700 : 400,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Step {idx + 1}
                                    </button>
                                ))}
                            </div>

                            {/* Current Step Content */}
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h4 style={{ color: '#fbbf24', marginBottom: '0.5rem' }}>{steps[currentStep].title}</h4>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.95rem' }}>{steps[currentStep].description}</p>

                                <div className={styles.codeBlock}>
                                    <div className={styles.codeHeader}><span>rps_game.py</span><span>Step {currentStep + 1}/5</span></div>
                                    <div className={styles.codeContent}>
                                        {steps[currentStep].code.split('\n').map((line, idx) => (
                                            <div key={idx}>
                                                {line.includes('import') && <><span className={styles.keyword}>import</span> {line.replace('import ', '')}</>}
                                                {line.includes('while') && <><span className={styles.keyword}>while</span> {line.replace('while ', '')}</>}
                                                {line.includes('if ') && !line.includes('elif') && <><span className={styles.keyword}>if</span> {line.replace(/^\s*if /, '')}</>}
                                                {line.includes('elif') && <><span className={styles.keyword}>elif</span> {line.replace(/^\s*elif /, '')}</>}
                                                {line.includes('else:') && <span className={styles.keyword}>else:</span>}
                                                {line.includes('print') && line}
                                                {line.includes(' = ') && !line.includes('if') && !line.includes('elif') && line}
                                                {line.includes('+=') && line}
                                                {line.trim() === '' && '\n'}
                                                {!line.includes('import') && !line.includes('while') && !line.includes('if') && !line.includes('elif') && !line.includes('else:') && !line.includes('print') && !line.includes(' = ') && !line.includes('+=') && line.trim() !== '' && line}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Complete Game Code */}
                        <div className={styles.codeSection}>
                            <h3>Complete Game Code</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>rock_paper_scissors.py</span><span>Python</span></div>
                                <div className={styles.codeContent} style={{ fontSize: '0.85rem' }}>
                                    <span className={styles.keyword}>import</span> random{'\n\n'}
                                    <span className={styles.comment}># Set up scores</span>{'\n'}
                                    player_score = <span className={styles.number}>0</span>{'\n'}
                                    computer_score = <span className={styles.number}>0</span>{'\n'}
                                    rounds = <span className={styles.number}>0</span>{'\n\n'}
                                    <span className={styles.comment}># Simulated player choices for each round</span>{'\n'}
                                    player_choices = [<span className={styles.string}>"rock"</span>, <span className={styles.string}>"paper"</span>, <span className={styles.string}>"scissors"</span>]{'\n'}
                                    round_num = <span className={styles.number}>0</span>{'\n\n'}
                                    <span className={styles.keyword}>while</span> player_score {'<'} <span className={styles.number}>2</span> <span className={styles.keyword}>and</span> computer_score {'<'} <span className={styles.number}>2</span>:{'\n'}
                                    {'    '}rounds += <span className={styles.number}>1</span>{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>f"\\n=== Round {'{'}rounds{'}'} ==="</span>){'\n\n'}
                                    {'    '}choices = [<span className={styles.string}>"rock"</span>, <span className={styles.string}>"paper"</span>, <span className={styles.string}>"scissors"</span>]{'\n'}
                                    {'    '}computer = random.choice(choices){'\n'}
                                    {'    '}player = player_choices[round_num % <span className={styles.number}>3</span>]{'\n'}
                                    {'    '}round_num += <span className={styles.number}>1</span>{'\n\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>f"You: {'{'}player{'}'}"</span>){'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>f"Computer: {'{'}computer{'}'}"</span>){'\n\n'}
                                    {'    '}<span className={styles.keyword}>if</span> player == computer:{'\n'}
                                    {'        '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"Tie! No points."</span>){'\n'}
                                    {'    '}<span className={styles.keyword}>elif</span> (player == <span className={styles.string}>"rock"</span> <span className={styles.keyword}>and</span> computer == <span className={styles.string}>"scissors"</span>) <span className={styles.keyword}>or</span> \{'\n'}
                                    {'         '}(player == <span className={styles.string}>"paper"</span> <span className={styles.keyword}>and</span> computer == <span className={styles.string}>"rock"</span>) <span className={styles.keyword}>or</span> \{'\n'}
                                    {'         '}(player == <span className={styles.string}>"scissors"</span> <span className={styles.keyword}>and</span> computer == <span className={styles.string}>"paper"</span>):{'\n'}
                                    {'        '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"You win this round!"</span>){'\n'}
                                    {'        '}player_score += <span className={styles.number}>1</span>{'\n'}
                                    {'    '}<span className={styles.keyword}>else</span>:{'\n'}
                                    {'        '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"Computer wins this round!"</span>){'\n'}
                                    {'        '}computer_score += <span className={styles.number}>1</span>{'\n\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>f"Score: You {'{'}player_score{'}'} - {'{'}computer_score{'}'} Computer"</span>){'\n\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"\\nGAME OVER!"</span>){'\n'}
                                    <span className={styles.keyword}>if</span> player_score {'>'} computer_score:{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"YOU ARE THE CHAMPION!"</span>){'\n'}
                                    <span className={styles.keyword}>else</span>:{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"Computer wins this time. Try again!"</span>)
                                </div>
                            </div>
                        </div>

                        {/* Interactive Game Simulation */}
                        <div className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2))', border: '2px solid rgba(16, 185, 129, 0.3)' }}>
                            <h3 style={{ marginBottom: '1rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <Gamepad2 size={24} className="text-emerald-400" />
                                Play the Game!
                            </h3>

                            {!gameActive ? (
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Click to start a best-of-3 match!</p>
                                    <button
                                        onClick={startGame}
                                        style={{
                                            padding: '1rem 2rem',
                                            background: 'linear-gradient(135deg, #10b981, #059669)',
                                            border: 'none',
                                            borderRadius: '0.75rem',
                                            color: 'white',
                                            fontWeight: 700,
                                            fontSize: '1.1rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            margin: '0 auto'
                                        }}
                                    >
                                        <Play size={20} /> Start Game!
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Score Display */}
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>YOU</div>
                                            <motion.div
                                                key={`p-${playerScore}`}
                                                initial={{ scale: 1.5 }}
                                                animate={{ scale: 1 }}
                                                style={{
                                                    fontSize: '2.5rem',
                                                    fontWeight: 800,
                                                    color: '#10b981',
                                                    textShadow: playerScore >= 2 ? '0 0 20px rgba(16, 185, 129, 0.5)' : 'none'
                                                }}
                                            >
                                                {playerScore}
                                            </motion.div>
                                        </div>
                                        <div style={{ fontSize: '2rem', color: 'var(--text-muted)', alignSelf: 'center' }}>-</div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>COMPUTER</div>
                                            <motion.div
                                                key={`c-${computerScore}`}
                                                initial={{ scale: 1.5 }}
                                                animate={{ scale: 1 }}
                                                style={{
                                                    fontSize: '2.5rem',
                                                    fontWeight: 800,
                                                    color: '#ef4444',
                                                    textShadow: computerScore >= 2 ? '0 0 20px rgba(239, 68, 68, 0.5)' : 'none'
                                                }}
                                            >
                                                {computerScore}
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Choice Buttons */}
                                    {!gameEnded && (
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                            {choices.map((choice) => (
                                                <motion.button
                                                    key={choice}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => playRound(choice)}
                                                    disabled={isAnimating}
                                                    style={{
                                                        padding: '1rem 1.5rem',
                                                        background: 'rgba(0,0,0,0.3)',
                                                        border: '2px solid rgba(255,255,255,0.2)',
                                                        borderRadius: '1rem',
                                                        cursor: isAnimating ? 'not-allowed' : 'pointer',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        opacity: isAnimating ? 0.5 : 1,
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <span style={{ fontSize: '2rem' }}>{choiceEmojis[choice]}</span>
                                                    <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{choice}</span>
                                                </motion.button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Game Output */}
                                    <div style={{
                                        background: 'rgba(0,0,0,0.4)',
                                        padding: '1rem',
                                        borderRadius: '0.5rem',
                                        fontFamily: 'monospace',
                                        fontSize: '0.9rem',
                                        maxHeight: '200px',
                                        overflowY: 'auto'
                                    }}>
                                        {gameOutput.map((line, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                style={{
                                                    color: line.includes('CHAMPION') ? '#10b981' :
                                                           line.includes('Computer wins this time') ? '#ef4444' :
                                                           line.includes('You win') ? '#10b981' :
                                                           line.includes('Computer wins this round') ? '#ef4444' :
                                                           line.includes('Tie') ? '#fbbf24' :
                                                           line.includes('===') ? '#60a5fa' :
                                                           'var(--text)',
                                                    fontWeight: line.includes('CHAMPION') || line.includes('GAME OVER') ? 700 : 400
                                                }}
                                            >
                                                {line || '\u00A0'}
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Play Again Button */}
                                    {gameEnded && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            style={{ textAlign: 'center', marginTop: '1rem' }}
                                        >
                                            <button
                                                onClick={resetGame}
                                                style={{
                                                    padding: '0.75rem 1.5rem',
                                                    background: 'rgba(99, 102, 241, 0.2)',
                                                    border: '2px solid rgba(99, 102, 241, 0.5)',
                                                    borderRadius: '0.5rem',
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    margin: '0 auto'
                                                }}
                                            >
                                                <RefreshCw size={18} /> Play Again
                                            </button>
                                        </motion.div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Your Turn Section */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem' }}>Your Turn!</h3>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.75rem' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ color: '#10b981' }}>1.</span>
                                    Run the game multiple times to see different outcomes
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ color: '#10b981' }}>2.</span>
                                    In the code, change the player_choices list to try different strategies
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ color: '#10b981' }}>3.</span>
                                    Try to beat the computer 3 times in a row!
                                </li>
                            </ul>
                        </div>

                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Pro Game Dev Tip:</p>
                                <p style={{ fontSize: '0.9rem' }}>This game uses everything from Level 2: loops, conditions, random numbers, and score tracking! You're ready to build even bigger games!</p>
                            </div>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level2/lesson17" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button
                                className={`${styles.navBtn} ${styles.primary}`}
                                onClick={() => setShowQuiz(true)}
                                style={{ background: 'linear-gradient(135deg, #f59e0b, #ec4899)' }}
                            >
                                Final Quiz! <Trophy size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection} style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(236, 72, 153, 0.15))' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{
                                background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.85rem',
                                fontWeight: 600
                            }}>
                                Question {quizStage} of 2
                            </span>
                        </div>

                        <h2 className={styles.quizTitle}>Final Challenge!</h2>

                        {quizStage === 1 ? (
                            <>
                                <p className={styles.quizQuestion}>Why do we use <code>while player_score {'<'} 2 and computer_score {'<'} 2</code>?</p>
                                <div className={styles.quizOptions}>
                                    {[
                                        'Game ends when someone gets 2 wins (best of 3)',
                                        'It counts to 2',
                                        'It makes the game faster'
                                    ].map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => !quizChecked && setQuizAnswer(idx)}
                                            className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''} ${quizChecked && idx === 0 ? styles.correct : ''} ${quizChecked && quizAnswer === idx && idx !== 0 ? styles.wrong : ''}`}
                                            disabled={quizChecked}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>What happens when there's a tie (both choose the same)?</p>
                                <div className={styles.quizOptions}>
                                    {[
                                        'Both players get a point',
                                        'No points are given',
                                        'The game ends'
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
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswer === null}>Check Answer</button>
                        ) : (quizStage === 1 && quizAnswer !== 0) || (quizStage === 2 && quizAnswer !== 1) ? (
                            <div className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>
                                    {quizStage === 1
                                        ? 'The while loop continues UNTIL someone reaches 2 wins. Once either player hits 2, the condition becomes false and the game ends!'
                                        : 'In a tie, neither player wins the round, so no points are awarded. The game continues until someone wins!'}
                                </p>
                                <button className={styles.quizBtn} onClick={() => { setQuizChecked(false); setQuizAnswer(null); }} style={{ marginTop: '1rem' }}>Try Again</button>
                            </div>
                        ) : quizStage === 1 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.quizFeedback} ${styles.success}`}
                                style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
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
