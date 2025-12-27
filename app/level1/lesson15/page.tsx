'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Bot, Send, RefreshCw, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL1_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL1_LESSONS[14]; // Lesson 15

interface ChatMessage {
    role: 'bot' | 'user';
    text: string;
}

export default function Lesson15() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# Build your own chatbot!
name = input("Hey! What's your name? ")
print(f"Nice to meet you, {name}! I'm Robo-1!")

age = input("How old are you? ")
print(f"Wow, {age} is a great age to learn coding!")

game = input("What's your favorite video game? ")
print(f"Cool! I wish I could play {game}!")

print(f"Thanks for chatting, {name}! Keep coding! 🤖")`);

    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [currentPrompt, setCurrentPrompt] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [codeLines, setCodeLines] = useState<string[]>([]);
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [variables, setVariables] = useState<{ [key: string]: string }>({});
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizChecked, setQuizChecked] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [challengesDone, setChallengesDone] = useState<boolean[]>([false, false, false]);
    const [superchargeDone, setSuperchargeDone] = useState(false);
    const [superchargeXpClaimed, setSuperchargeXpClaimed] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const startBot = () => {
        const lines = code.trim().split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
        setCodeLines(lines);
        setCurrentLineIndex(0);
        setChatHistory([]);
        setVariables({});
        setIsRunning(true);
        processLine(lines, 0, {});
    };

    const processLine = (lines: string[], index: number, vars: { [key: string]: string }) => {
        if (index >= lines.length) {
            setIsRunning(false);
            // Check if completed all challenges
            const newChallenges = [...challengesDone];
            if (chatHistory.length >= 2) newChallenges[0] = true;
            if (Object.keys(vars).length >= 2) newChallenges[1] = true;
            if (chatHistory.some(m => m.role === 'bot' && Object.values(vars).some(v => m.text.includes(v)))) {
                newChallenges[2] = true;
            }
            setChallengesDone(newChallenges);
            return;
        }

        const line = lines[index].trim();

        // input() line
        const inputMatch = line.match(/^(\w+)\s*=\s*input\s*\(["'](.*)["']\)$/);
        if (inputMatch) {
            const varName = inputMatch[1];
            const prompt = inputMatch[2];

            // Replace variables in prompt
            let displayPrompt = prompt;
            for (const [name, value] of Object.entries(vars)) {
                displayPrompt = displayPrompt.replace(new RegExp(`\\{${name}\\}`, 'g'), value);
            }

            setChatHistory(prev => [...prev, { role: 'bot', text: displayPrompt }]);
            setCurrentPrompt(varName);
            setCurrentLineIndex(index);
            return;
        }

        // print() line
        const printMatch = line.match(/^print\s*\((.+)\)$/);
        if (printMatch) {
            let content = printMatch[1].trim();

            // f-string
            const fStringMatch = content.match(/^f["'](.*)["']$/);
            if (fStringMatch) {
                let result = fStringMatch[1];
                for (const [name, value] of Object.entries(vars)) {
                    result = result.replace(new RegExp(`\\{${name}\\}`, 'g'), value);
                }
                setChatHistory(prev => [...prev, { role: 'bot', text: result }]);
            } else {
                // Regular string
                const strMatch = content.match(/^["'](.*)["']$/);
                if (strMatch) {
                    setChatHistory(prev => [...prev, { role: 'bot', text: strMatch[1] }]);
                }
            }

            // Continue to next line
            setTimeout(() => processLine(lines, index + 1, vars), 500);
            return;
        }

        // Unknown line, skip
        processLine(lines, index + 1, vars);
    };

    const submitInput = () => {
        if (!userInput.trim() || !currentPrompt) return;

        const newVars = { ...variables, [currentPrompt]: userInput };
        setVariables(newVars);
        setChatHistory(prev => [...prev, { role: 'user', text: userInput }]);
        setUserInput('');
        setCurrentPrompt('');

        // Continue processing
        setTimeout(() => processLine(codeLines, currentLineIndex + 1, newVars), 300);
    };

    const checkQuiz = () => {
        setQuizChecked(true);
        if (quizAnswer === 2) {
            setTimeout(() => {
                addXpAndCoins(LESSON.xpReward, 10);
                completeLevel(LESSON.id, LESSON.xpReward, 10, 1, 120);
                setLessonComplete(true);
            }, 1000);
        }
    };

    // Check for supercharge completion when chat history updates
    useEffect(() => {
        if (!isRunning && chatHistory.length > 0) {
            const botMessages = chatHistory.filter(m => m.role === 'bot').length;
            const userMessages = chatHistory.filter(m => m.role === 'user').length;
            const varCount = Object.keys(variables).length;

            // Supercharge: 4+ inputs, 5+ bot messages, using responses
            if (userMessages >= 4 && botMessages >= 5 && varCount >= 4) {
                setSuperchargeDone(true);
            }
        }
    }, [chatHistory, isRunning, variables]);

    const claimSuperchargeXp = () => {
        if (!superchargeXpClaimed && superchargeDone) {
            addXpAndCoins(25, 0);
            setSuperchargeXpClaimed(true);
        }
    };

    if (isLoading || !user) {
        return (
            <div className={styles.container}>
                <div className="flex items-center justify-center h-screen">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ fontSize: '3rem' }}>🤖</motion.div>
                </div>
            </div>
        );
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.8 }}>
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0], y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ fontSize: '5rem', marginBottom: '1rem' }}
                    >
                        🤖
                    </motion.div>
                </motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle}>
                    🎉 BOT BUILDER SUPREME! 🎉
                </motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>
                    You built an interactive chatbot! You've completed Level 1!
                </motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className={styles.successXp}>
                    <Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP
                </motion.div>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: 'spring' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2))',
                        border: '1px solid rgba(251, 191, 36, 0.5)',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '9999px',
                        marginBottom: '1.5rem'
                    }}>
                        <Trophy size={20} className="text-amber-400" />
                        <span style={{ fontWeight: 700, color: '#fbbf24' }}>LEVEL 1 COMPLETE!</span>
                    </div>
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Link href="/level1" className={`${styles.navBtn} ${styles.secondary}`}>Review Lessons</Link>
                    <Link href="/level2" className={`${styles.navBtn} ${styles.primary}`}>Go to Level 2 <ChevronRight size={18} /></Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/level1" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 15</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                {!showQuiz ? (
                    <>
                        <div className={styles.lessonTitle}>
                            <motion.div className={styles.lessonEmoji} animate={{ rotate: [-5, 5, -5], y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>{LESSON.emoji}</motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Story */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Bot size={28} className="text-purple-400" />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Final Mission: Bring Robo-1 to Life!</span>
                            </div>
                            <p>
                                You've learned so much! Now put it ALL together to make Robo-1 actually <strong>talk with people</strong>! 🎉
                            </p>
                            <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>
                                Combine: <code>print()</code> + <code>input()</code> + <code>f-strings</code> + <code>variables</code>
                            </p>
                        </motion.div>

                        {/* Code Editor */}
                        <div className={styles.codeSection}>
                            <h3>📝 Your Chatbot Code</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Edit this code to customize what Robo-1 says and asks!
                            </p>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>chatbot.py</span><span>Python</span></div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    spellCheck={false}
                                    style={{ minHeight: '200px', fontSize: '0.9rem' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                <button className={styles.runBtn} onClick={startBot} disabled={isRunning && !currentPrompt}>
                                    {isRunning ? <RefreshCw size={18} /> : <Play size={18} />}
                                    {isRunning ? 'Running...' : 'Start Bot'}
                                </button>
                            </div>
                        </div>

                        {/* Chat Interface */}
                        <div style={{
                            background: 'var(--surface)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 'var(--radius)',
                            overflow: 'hidden',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))',
                                padding: '0.75rem 1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <Bot size={20} />
                                <span style={{ fontWeight: 600 }}>Chat with Robo-1</span>
                            </div>

                            <div style={{
                                padding: '1rem',
                                minHeight: '200px',
                                maxHeight: '300px',
                                overflowY: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem'
                            }}>
                                {chatHistory.length === 0 && !isRunning && (
                                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                                        Click "Start Bot" to begin chatting! 🤖
                                    </div>
                                )}

                                {chatHistory.map((msg, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            display: 'flex',
                                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                                        }}
                                    >
                                        <div style={{
                                            maxWidth: '80%',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '1rem',
                                            background: msg.role === 'user'
                                                ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                                                : 'rgba(255,255,255,0.1)',
                                            borderBottomRightRadius: msg.role === 'user' ? '0.25rem' : '1rem',
                                            borderBottomLeftRadius: msg.role === 'bot' ? '0.25rem' : '1rem'
                                        }}>
                                            {msg.role === 'bot' && <span style={{ marginRight: '0.5rem' }}>🤖</span>}
                                            {msg.text}
                                        </div>
                                    </motion.div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>

                            {currentPrompt && (
                                <div style={{
                                    padding: '1rem',
                                    borderTop: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    gap: '0.5rem'
                                }}>
                                    <input
                                        type="text"
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && submitInput()}
                                        placeholder="Type your response..."
                                        autoFocus
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem 1rem',
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(139, 92, 246, 0.5)',
                                            borderRadius: '0.5rem',
                                            color: 'white',
                                            fontSize: '1rem'
                                        }}
                                    />
                                    <button
                                        onClick={submitInput}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                                            border: 'none',
                                            borderRadius: '0.5rem',
                                            color: 'white',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Challenges */}
                        <div className={styles.challenges}>
                            <h3>🎯 Bot Builder Challenges:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${challengesDone[0] ? styles.done : ''}`}>{challengesDone[0] && <Check size={14} />}</div>
                                    Have a conversation with at least 2 exchanges
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${challengesDone[1] ? styles.done : ''}`}>{challengesDone[1] && <Check size={14} />}</div>
                                    Ask for 2+ different pieces of information
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${challengesDone[2] ? styles.done : ''}`}>{challengesDone[2] && <Check size={14} />}</div>
                                    Use the user's responses in your replies
                                </li>
                            </ul>
                        </div>

                        <div className={styles.tipBox}>
                 <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Ideas to Customize:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li>Ask about their favorite food, color, or pet</li>
                                    <li>Make Robo-1 tell jokes</li>
                                    <li>Create a quiz bot that asks questions</li>
                                </ul>
                            </div>
                        </div>

                        {/* SUPERCHARGE Bonus Challenge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            style={{
                                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.25))',
                                border: '2px solid rgba(251, 191, 36, 0.4)',
                                borderRadius: 'var(--radius)',
                                padding: '1.5rem',
                                marginTop: '2rem'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <motion.span
                                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{ fontSize: '1.5rem' }}
                                >⚡</motion.span>
                                <div>
                                    <h3 style={{ margin: 0, color: '#fbbf24', fontWeight: 800 }}>SUPERCHARGE - Ultimate Challenge</h3>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Optional • +25 XP • The ultimate test!</p>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                                <p style={{ margin: 0, fontWeight: 600, marginBottom: '0.5rem' }}>🎯 The Ultimate Challenge: Super Bot!</p>
                                <p style={{ margin: 0 }}>
                                    Create a <strong>super-powered chatbot</strong> that asks <strong>at least 4 questions</strong> and has a full conversation!
                                </p>
                                <ul style={{ margin: '0.75rem 0 0', paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <li>Ask 4+ different questions with input()</li>
                                    <li>Have 5+ bot messages total</li>
                                    <li>Use all responses in your replies</li>
                                    <li>Make it fun and personalized!</li>
                                </ul>
                            </div>

                            <div style={{
                                padding: '1rem',
                                background: 'rgba(139, 92, 246, 0.1)',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                borderRadius: '0.5rem',
                                marginBottom: '1rem'
                            }}>
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                                    💡 <strong>Tip:</strong> Edit the code above to add more input() questions and print() responses, then run your bot!
                                </p>
                            </div>

                            {superchargeDone && !superchargeXpClaimed && (
                                <motion.button
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    onClick={claimSuperchargeXp}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        width: '100%',
                                        padding: '1rem',
                                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                        border: 'none',
                                        borderRadius: 'var(--radius)',
                                        color: 'white',
                                        fontWeight: 700,
                                        fontSize: '1.1rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Zap size={20} fill="currentColor" /> Claim +25 Bonus XP!
                                </motion.button>
                            )}

                            {superchargeXpClaimed && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        padding: '1rem',
                                        background: 'rgba(16, 185, 129, 0.2)',
                                        border: '1px solid rgba(16, 185, 129, 0.4)',
                                        borderRadius: 'var(--radius)',
                                        color: '#10b981',
                                        fontWeight: 600
                                    }}
                                >
                                    <Check size={20} /> +25 XP Claimed! ULTIMATE BOT BUILDER! 🤖⚡
                                </motion.div>
                            )}

                            {!superchargeDone && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '0.75rem',
                                    background: 'rgba(0,0,0,0.2)',
                                    borderRadius: '0.5rem'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Progress</div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.85rem' }}>Questions: {Object.keys(variables).length}/4</span>
                                            <span style={{ fontSize: '0.85rem' }}>•</span>
                                            <span style={{ fontSize: '0.85rem' }}>Messages: {chatHistory.filter(m => m.role === 'bot').length}/5</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        <div className={styles.navBar}>
                            <Link href="/level1/lesson14" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)}>Final Quiz! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection}>
                        <motion.div animate={{ rotate: [-5, 5, -5], y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤖</motion.div>
                        <h2 className={styles.quizTitle}>Final Brain Check!</h2>
                        <p className={styles.quizQuestion}>
                            To build an interactive chatbot, you combine:
                        </p>
                        <div className={styles.quizOptions}>
                            {[
                                'print() only',
                                'print() and variables only',
                                'print(), input(), variables, and f-strings'
                            ].map((option, idx) => (
                                <button key={idx} onClick={() => !quizChecked && setQuizAnswer(idx)} className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''} ${quizChecked && idx === 2 ? styles.correct : ''} ${quizChecked && quizAnswer === idx && idx !== 2 ? styles.wrong : ''}`} disabled={quizChecked}>{option}</button>
                            ))}
                        </div>
                        {!quizChecked ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswer === null}>Check Answer</button>
                        ) : quizAnswer !== 2 ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite! 🤔</h4>
                                <p>An interactive bot needs ALL the skills: print() to talk, input() to listen, variables to remember, and f-strings to personalize!</p>
                                <button className={styles.quizBtn} onClick={() => { setQuizChecked(false); setQuizAnswer(null); }} style={{ marginTop: '1rem' }}>Try Again</button>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
