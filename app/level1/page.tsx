'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Play, Check, ChevronRight, ChevronLeft, Award, HelpCircle, AlertCircle, Home, Lock, RefreshCcw, Heart, Zap, Coins } from 'lucide-react';
import Link from 'next/link';
import styles from './level1.module.css';

// Types for Game State
type Step = 'intro' | 'lesson' | 'challenge' | 'quiz' | 'complete';

export default function Level1() {
    const [step, setStep] = useState<Step>('intro');
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [robotMood, setRobotMood] = useState<'neutral' | 'happy' | 'error'>('neutral');
    const [showHint, setShowHint] = useState(false);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

    // Game Stats
    const [hearts, setHearts] = useState(5);
    const [xp, setXp] = useState(0);
    const [coins, setCoins] = useState(0);
    const [levelProgress, setLevelProgress] = useState(0); // 0-100
    const [failedAttempts, setFailedAttempts] = useState(0);

    // Messages based on state
    const [dialogue, setDialogue] = useState({
        title: "System Alert",
        text: "Initializing..."
    });

    useEffect(() => {
        switch (step) {
            case 'intro':
                setDialogue({
                    title: "⚠️ CRITICAL ALERT",
                    text: "🧠 Robo-1’s brain is frozen! Can you type the right code to wake him up?"
                });
                setRobotMood('error');
                setLevelProgress(0);
                break;
            case 'lesson':
                setDialogue({
                    title: "Robo-1 says:",
                    text: "Thanks for the reboot! To speak, I need the Python command: print()."
                });
                setRobotMood('neutral');
                setLevelProgress(25);
                break;
            case 'challenge':
                setDialogue({
                    title: "Mission Objective:",
                    text: "Write code to make me say exactly: \"Hello World\""
                });
                setRobotMood('neutral');
                setLevelProgress(50);
                break;
            case 'quiz':
                setDialogue({
                    title: "Knowledge Check",
                    text: "Excellent! My voice circuits are active. Now, let's verify your understanding."
                });
                setRobotMood('happy');
                setLevelProgress(75);
                break;
            case 'complete':
                setDialogue({
                    title: "🎉 MISSION SUCCESS",
                    text: "Level 1 Complete! You are now a Python Ranger."
                });
                setRobotMood('happy');
                setLevelProgress(100);
                break;
        }
        // content reset on step change
        setShowHint(false);
        setOutput('');
        setFailedAttempts(0);
    }, [step]);

    const handleIncorrectAttempt = (msg: string) => {
        setRobotMood('error');
        setOutput(msg);
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        if (newAttempts >= 3) {
            if (hearts > 0) {
                setHearts(h => h - 1);
                setDialogue({
                    title: "Give it another shot!",
                    text: "Don't give up! I lost a heart, but we can do this. Check the hint!"
                });
            } else {
                setDialogue({
                    title: "Out of Power",
                    text: "I'm out of juice! Try restarting the level to recharge."
                });
            }
        } else {
            setDialogue({
                title: "Oops! Try again.",
                text: "Remember to use parentheses () and quotation marks \"\"."
            });
        }
    };

    const handleSkip = () => {
        if (hearts > 0) {
            setHearts(h => h - 1);
            setIsSuccess(true);
            setRobotMood('happy');
            setDialogue({
                title: "Skipped!",
                text: "We used a heart to bypass this lock. Let's keep moving!"
            });
        }
    };

    const runCode = () => {
        setOutput("Running...");
        setRobotMood('neutral');

        setTimeout(() => {
            if (step === 'challenge') {
                const normalizedCode = code.trim();
                const printMatch = normalizedCode.match(/^print\s*\(['"](.+?)['"]\)$/);

                if (printMatch) {
                    const content = printMatch[1];
                    setOutput(content);

                    if (content === "Hello World") {
                        setIsSuccess(true);
                        setRobotMood('happy');
                        setXp(x => x + 25);
                        setCoins(c => c + 10);
                        setDialogue({
                            title: "🎉 Nice! Robo-1 is unlocked.",
                            text: "Awesome work! I'm back online. On to the next mission!"
                        });
                    } else if (content === "Hello") {
                        setRobotMood('neutral');
                        setDialogue({
                            title: "Almost there!",
                            text: "I heard \"Hello\", but the mission requires \"Hello World\". Try again!"
                        });
                    } else {
                        handleIncorrectAttempt(`I said "${content}", but I need to say "Hello World"!`);
                    }
                }
                else if (normalizedCode.startsWith('print')) {
                    handleIncorrectAttempt("SyntaxError: Check your quotes \"\" and parentheses ()");
                }
                else {
                    handleIncorrectAttempt("NameError: Try checking the Hint!");
                }
            }
            else if (step === 'lesson') {
                if (code.includes('print')) {
                    setOutput("Code executed! (Click 'Next' to start the mission)");
                } else {
                    setOutput("Try typing: print(\"Hi\")");
                }
            }
        }, 600);
    };

    const navNext = () => {
        if (step === 'intro') setStep('lesson');
        else if (step === 'lesson') {
            setCode('print("")');
            setStep('challenge');
        }
        else if (step === 'challenge' && isSuccess) setStep('quiz');
        else if (step === 'quiz' && quizAnswer === 1) setStep('complete');
    };

    const navBack = () => {
        if (step === 'lesson') setStep('intro');
        else if (step === 'challenge') setStep('lesson');
        else if (step === 'quiz') setStep('challenge');
    };

    return (
        <div className={styles.container}>
            {/* HUD Header */}
            <header className={styles.header}>
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-slate-400 hover:text-white transition p-2 hover:bg-slate-800 rounded-full">
                        <Home size={20} />
                    </Link>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                            <span>Level 1</span>
                            <div className="h-2 w-24 bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-indigo-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${levelProgress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gamification Stats */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1 text-red-400 font-bold bg-red-400/10 px-3 py-1 rounded-full border border-red-400/20">
                        <Heart size={18} fill="currentColor" />
                        <span>{hearts}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 font-bold bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                        <Coins size={18} />
                        <span>{coins}</span>
                    </div>
                    <div className="flex items-center gap-1 text-purple-400 font-bold bg-purple-400/10 px-3 py-1 rounded-full border border-purple-400/20">
                        <Zap size={18} fill="currentColor" />
                        <span>{xp} XP</span>
                    </div>
                </div>
            </header>

            <div className={styles.layout}>
                {/* Left: Story & Robot */}
                <div className={styles.storyPanel}>
                    <div className={`${styles.robotContainer} ${robotMood === 'happy' ? styles.robotHappy :
                            robotMood === 'error' ? styles.robotError : styles.robotNeutral
                        }`}>
                        <motion.div
                            className="relative w-48 h-48 rounded-full flex items-center justify-center border-4 backdrop-blur-md transition-colors duration-500 robotBg"
                            animate={{
                                y: [0, -10, 0],
                                scale: robotMood === 'happy' ? [1, 1.1, 1] : 1
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            style={{
                                borderColor: robotMood === 'happy' ? '#10B981' : robotMood === 'error' ? '#EF4444' : '#60A5FA',
                                backgroundColor: robotMood === 'happy' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                            }}
                        >
                            <Bot size={120} className={`transition-colors duration-300 ${robotMood === 'happy' ? "text-green-400" :
                                    robotMood === 'error' ? "text-red-400" : "text-blue-400"
                                }`} />

                            {/* Status Indicator */}
                            <div className={`absolute top-0 right-0 p-2 rounded-full border-2 ${robotMood === 'happy' ? "bg-green-500 border-green-300" :
                                    robotMood === 'error' ? "bg-red-500 border-red-300" : "bg-blue-500 border-blue-300"
                                }`}>
                                {robotMood === 'happy' ? <Check size={16} className="text-white" /> :
                                    robotMood === 'error' ? <AlertCircle size={16} className="text-white" /> :
                                        <div className="w-4 h-4 rounded-full bg-white animate-pulse" />}
                            </div>
                        </motion.div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={dialogue.title}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={styles.dialogBox}
                        >
                            <h3 className={`font-bold text-sm uppercase mb-2 ${robotMood === 'error' ? 'text-red-400' : 'text-indigo-400'
                                }`}>
                                {dialogue.title}
                            </h3>
                            <p className="text-lg leading-relaxed text-slate-200">
                                {dialogue.text}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Right: Task Area */}
                <div className={styles.taskPanel}>

                    {step === 'intro' && (
                        <div className="flex flex-col items-center justify-center h-full text-center gap-6">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
                                <AlertCircle size={32} className="text-red-500" />
                            </div>
                            <h2 className="text-2xl font-bold">System Frozen!</h2>
                            <p className="text-slate-400 max-w-md">
                                Robo-1 needs a reboot! Are you ready to use your coding powers to wake him up?
                            </p>
                            <button onClick={navNext} className="btn btn-primary text-lg px-8">
                                Lets Go! <ChevronRight size={20} />
                            </button>
                        </div>
                    )}

                    {step === 'lesson' && (
                        <div className="text-left h-full flex flex-col">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <div className="bg-indigo-500 w-8 h-8 rounded flex items-center justify-center text-sm">1</div>
                                The print() Command
                            </h2>
                            <div className="prose prose-invert text-slate-300 mb-6">
                                <p>Computers don't speak English — they speak Code! Use <code className="text-pink-400">print()</code> to make the robot talk.</p>
                            </div>

                            <div className="bg-slate-900 p-4 rounded-lg border-l-4 border-pink-500 font-mono mb-6 text-lg">
                                <span className="text-pink-400">print</span>(<span className="text-green-400">"Hello"</span>)
                            </div>

                            <div className="flex gap-2 mb-8">
                                <div className="bg-slate-800 p-3 rounded flex-1 border border-slate-700">
                                    <span className="block text-xs text-slate-500 uppercase font-bold mb-1">Rule 1</span>
                                    LOWERCASE <code className="text-pink-400 bg-slate-900 px-1 rounded">print</code>
                                </div>
                                <div className="bg-slate-800 p-3 rounded flex-1 border border-slate-700">
                                    <span className="block text-xs text-slate-500 uppercase font-bold mb-1">Rule 2</span>
                                    PARENTHESES <code className="text-slate-200 bg-slate-900 px-1 rounded">()</code>
                                </div>
                                <div className="bg-slate-800 p-3 rounded flex-1 border border-slate-700">
                                    <span className="block text-xs text-slate-500 uppercase font-bold mb-1">Rule 3</span>
                                    QUOTES <code className="text-green-400 bg-slate-900 px-1 rounded">""</code>
                                </div>
                            </div>

                            <div className={styles.navBar}>
                                <button onClick={navBack} className="btn btn-secondary text-sm">
                                    <ChevronLeft size={16} /> Back
                                </button>
                                <button onClick={navNext} className="btn btn-primary">
                                    Try it Out <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'challenge' && (
                        <div className="flex flex-col h-full relative">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full animate-pulse ${isSuccess ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                    Mission Control
                                </h2>
                                {(failedAttempts >= 2 || showHint) && (
                                    <button
                                        onClick={() => setShowHint(!showHint)}
                                        className={styles.hintButton}
                                    >
                                        <HelpCircle size={16} /> Need help?
                                    </button>
                                )}
                            </div>

                            {showHint && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className={styles.hintBox}
                                >
                                    <strong>💡 Hint:</strong> Type this code: <code className="bg-black/20 px-2 py-1 rounded select-all">print("Hello World")</code>
                                </motion.div>
                            )}

                            <div className={`${styles.editor} mt-4`}>
                                <div className={styles.editorHeader}>
                                    <span>main.py</span>
                                    <span>Python 3.10</span>
                                </div>
                                <textarea
                                    spellCheck={false}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    disabled={isSuccess}
                                    placeholder="# Write your magic code..."
                                />
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={runCode}
                                    className={`btn flex-1 ${isSuccess ? 'btn-success' : 'btn-primary'}`}
                                    disabled={isSuccess}
                                >
                                    {isSuccess ? <Check /> : <Play size={18} />}
                                    {isSuccess ? 'Success!' : 'Run Code'}
                                </button>

                                {!isSuccess && failedAttempts >= 3 && (
                                    <button onClick={handleSkip} className="btn btn-secondary text-red-300" title="Skip using a Heart">
                                        Skip (-1 <Heart size={14} className="inline" />)
                                    </button>
                                )}

                                <button
                                    onClick={() => setCode('print("Hello World")')}
                                    className="btn btn-secondary p-3"
                                    title="Reset Code"
                                >
                                    <RefreshCcw size={18} />
                                </button>
                            </div>

                            <div className={`${styles.console} mt-4`}>
                                <div className={styles.consoleTitle}>Terminal Output</div>
                                <div className={`${output.includes('Error') ? 'text-red-400' : 'text-green-400'} font-mono`}>
                                    {output || <span className="text-slate-600 opacity-50">Waiting for code...</span>}
                                </div>
                            </div>

                            {isSuccess && (
                                <div className={styles.successOverlay}>
                                    <Award size={64} className="text-amber-400 mb-4 animate-bounce" />
                                    <h2 className="text-3xl font-bold mb-2">Code Verified!</h2>
                                    <p className="text-slate-300 mb-6">+25 XP | +10 Coins</p>
                                    <button onClick={navNext} className="btn btn-primary w-full max-w-xs">
                                        Continue <ChevronRight />
                                    </button>
                                </div>
                            )}

                            <div className={styles.navBar}>
                                <button onClick={navBack} className="btn btn-secondary text-sm">
                                    <ChevronLeft size={16} /> Back
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'quiz' && (
                        <div className="flex flex-col h-full">
                            <h2 className="text-xl font-bold mb-6">Bonus Challenge</h2>
                            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 mb-6">
                                <p className="text-lg mb-4">Which code makes the robot say "Hi"?</p>

                                <div className="flex flex-col gap-3">
                                    {[
                                        { code: 'print("Hi")', correct: true },
                                        { code: 'shout(Hi)', correct: false },
                                        { code: 'Text("Hi")', correct: false }
                                    ].map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setQuizAnswer(idx)}
                                            className={`p-4 rounded-lg text-left font-mono border transition-all flex justify-between items-center ${quizAnswer === idx
                                                    ? 'border-indigo-500 bg-indigo-500/20 text-white'
                                                    : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-slate-400'
                                                }`}
                                        >
                                            {opt.code}
                                            {quizAnswer === idx && <Check size={16} className="text-indigo-400" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.navBar}>
                                <button onClick={navBack} className="btn btn-secondary text-sm">
                                    <ChevronLeft size={16} /> Review
                                </button>
                                <button
                                    disabled={quizAnswer === null}
                                    onClick={() => {
                                        if (quizAnswer === 0) {
                                            setXp(x => x + 50);
                                            setCoins(c => c + 20);
                                            navNext();
                                        }
                                        else alert("Not quite! Remember: print(\"Message\")");
                                    }}
                                    className="btn btn-success disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Submit Answer <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'complete' && (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full"></div>
                                <Award size={100} className="text-yellow-400 relative z-10 drop-shadow-lg" />
                            </div>
                            <h2 className="text-4xl font-black mb-2 text-white">Level Complete!</h2>
                            <p className="text-xl text-slate-300 mb-8 max-w-lg">
                                You earned <span className="text-purple-400 font-bold">{xp} XP</span> and <span className="text-amber-400 font-bold">{coins} Coins</span>!
                            </p>

                            <div className="flex flex-col gap-3 w-full max-w-sm">
                                <button className="btn btn-primary text-lg py-4 opacity-50 cursor-not-allowed" title="Coming Soon">
                                    <Lock size={18} className="mr-2" /> Start Level 2: Math Ninja
                                </button>
                                <Link href="/" className="btn btn-secondary text-sm">
                                    Return to Base
                                </Link>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
