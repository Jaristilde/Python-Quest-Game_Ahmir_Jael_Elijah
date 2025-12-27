'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, MessageCircle, Sparkles, Send } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL1_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL1_LESSONS[13]; // Lesson 14

export default function Lesson14() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [userInput, setUserInput] = useState('');
    const [waitingForInput, setWaitingForInput] = useState(false);
    const [inputPrompt, setInputPrompt] = useState('');
    const [pendingCode, setPendingCode] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizChecked, setQuizChecked] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [challengesDone, setChallengesDone] = useState<boolean[]>([false, false, false]);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        const lines = code.trim().split('\n');
        let outputLines: string[] = [];

        // Check for input() calls
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            // Variable with input
            const inputMatch = trimmed.match(/^(\w+)\s*=\s*input\s*\(["'](.*)["']\)$/);
            if (inputMatch) {
                setInputPrompt(inputMatch[2]);
                setPendingCode(code);
                setWaitingForInput(true);
                setOutput(inputMatch[2]);
                return;
            }

            // Just input() without variable
            const simpleInputMatch = trimmed.match(/^input\s*\(["'](.*)["']\)$/);
            if (simpleInputMatch) {
                setInputPrompt(simpleInputMatch[1]);
                setPendingCode(code);
                setWaitingForInput(true);
                setOutput(simpleInputMatch[1]);

                const newChallenges = [...challengesDone];
                newChallenges[0] = true;
                setChallengesDone(newChallenges);
                return;
            }

            // Print
            const printMatch = trimmed.match(/^print\s*\((.+)\)$/);
            if (printMatch) {
                const content = printMatch[1].trim();
                const strMatch = content.match(/^["'](.*)["']$/);
                if (strMatch) {
                    outputLines.push(strMatch[1]);
                }
            }
        }

        if (outputLines.length > 0) {
            setOutput(outputLines.join('\n'));
        } else {
            setOutput('Try: name = input("What is your name? ")');
        }
    };

    const submitInput = () => {
        if (!userInput.trim()) return;

        const lines = pendingCode.trim().split('\n');
        let outputLines: string[] = [];
        let variables: { [key: string]: string } = {};

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            // Variable with input
            const inputMatch = trimmed.match(/^(\w+)\s*=\s*input\s*\(["'](.*)["']\)$/);
            if (inputMatch) {
                variables[inputMatch[1]] = userInput;
                outputLines.push(`${inputMatch[2]}${userInput}`);

                const newChallenges = [...challengesDone];
                newChallenges[0] = true;
                if (inputMatch[1].toLowerCase().includes('name')) newChallenges[1] = true;
                setChallengesDone(newChallenges);
                continue;
            }

            // Print with variable
            const printMatch = trimmed.match(/^print\s*\((.+)\)$/);
            if (printMatch) {
                let content = printMatch[1].trim();

                // f-string
                const fStringMatch = content.match(/^f["'](.*)["']$/);
                if (fStringMatch) {
                    let result = fStringMatch[1];
                    result = result.replace(/\{(\w+)\}/g, (_, varName) => variables[varName] || `{${varName}}`);
                    outputLines.push(result);

                    const newChallenges = [...challengesDone];
                    newChallenges[2] = true;
                    setChallengesDone(newChallenges);
                    continue;
                }

                // Concatenation
                if (content.includes('+')) {
                    let result = '';
                    const parts = content.split('+').map(p => p.trim());
                    for (const part of parts) {
                        const strMatch = part.match(/^["'](.*)["']$/);
                        if (strMatch) {
                            result += strMatch[1];
                        } else if (variables[part]) {
                            result += variables[part];
                        }
                    }
                    outputLines.push(result);
                    continue;
                }

                // Simple string or variable
                const strMatch = content.match(/^["'](.*)["']$/);
                if (strMatch) {
                    outputLines.push(strMatch[1]);
                } else if (variables[content]) {
                    outputLines.push(variables[content]);
                }
            }
        }

        setOutput(outputLines.join('\n'));
        setWaitingForInput(false);
        setUserInput('');
        setInputPrompt('');
        setPendingCode('');
    };

    const checkQuiz = () => {
        setQuizChecked(true);
        if (quizAnswer === 1) {
            setTimeout(() => {
                addXpAndCoins(LESSON.xpReward, 5);
                completeLevel(LESSON.id, LESSON.xpReward, 5, 1, 60);
                setLessonComplete(true);
            }, 1000);
        }
    };

    if (isLoading || !user) {
        return (
            <div className={styles.container}>
                <div className="flex items-center justify-center h-screen">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ fontSize: '3rem' }}>💬</motion.div>
                </div>
            </div>
        );
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', duration: 0.8 }} className={styles.successIcon}>
                    <Check size={50} className="text-white" />
                </motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle}>🎉 INPUT MASTER! 🎉</motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                    <Link href="/level1/lesson15" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link>
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
                            <motion.div className={styles.lessonEmoji} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>{LESSON.emoji}</motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Story */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <MessageCircle size={28} className="text-green-400" />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Mission: Let Users Talk to Your Code!</span>
                            </div>
                            <p>
                                So far, your programs just talk AT people. But what if they could listen? 👂
                            </p>
                            <p style={{ marginTop: '0.75rem' }}>
                                The <code>input()</code> function lets your program <strong>ask questions and wait for answers</strong>!
                            </p>
                        </motion.div>

                        {/* How It Works */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Sparkles size={20} className="text-amber-400" /> How input() Works
                            </h3>

                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', margin: '1rem 0', fontFamily: 'monospace', fontSize: '1rem' }}>
                                <span style={{ color: '#f8f8f2' }}>name</span>
                                <span style={{ color: '#ff79c6' }}> = </span>
                                <span style={{ color: '#8be9fd' }}>input</span>
                                <span style={{ color: '#f8f8f2' }}>(</span>
                                <span style={{ color: '#50fa7b' }}>"What's your name? "</span>
                                <span style={{ color: '#f8f8f2' }}>)</span>
                            </div>

                            <div style={{ marginTop: '1rem' }}>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>What happens:</p>
                                <ol style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
                                    <li style={{ marginBottom: '0.5rem' }}>Shows the message: "What's your name? "</li>
                                    <li style={{ marginBottom: '0.5rem' }}>Waits for the user to type something</li>
                                    <li style={{ marginBottom: '0.5rem' }}>Saves their answer in the variable <code>name</code></li>
                                </ol>
                            </div>

                            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(251, 191, 36, 0.15)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '0.5rem' }}>
                                <p style={{ margin: 0 }}>
                                    ⚠️ <strong>Remember:</strong> input() ALWAYS returns a string! Use int() if you need a number.
                                </p>
                            </div>
                        </div>

                        {/* Examples */}
                        <div className={styles.codeSection}>
                            <h3>📝 Examples</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>main.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># Ask for their name</span>{'\n'}
                                    name = <span className={styles.keyword}>input</span>(<span className={styles.string}>"What's your name? "</span>){'\n'}
                                    <span className={styles.keyword}>print</span>(f<span className={styles.string}>"Hello, {'{'}name{'}'}!"</span>){'\n\n'}
                                    <span className={styles.comment}># Ask for their age (convert to number!)</span>{'\n'}
                                    age_text = <span className={styles.keyword}>input</span>(<span className={styles.string}>"How old are you? "</span>){'\n'}
                                    age = <span className={styles.keyword}>int</span>(age_text){'\n'}
                                    <span className={styles.keyword}>print</span>(f<span className={styles.string}>"You will be {'{'}age + 1{'}'} next year!"</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Example Run:</div>
                                <div className={styles.outputText}>
                                    What's your name? <span style={{ color: '#8be9fd' }}>Alex</span>{'\n'}
                                    Hello, Alex!{'\n'}
                                    How old are you? <span style={{ color: '#8be9fd' }}>10</span>{'\n'}
                                    You will be 11 next year!
                                </div>
                            </div>
                        </div>

                        {/* Interactive Try It */}
                        <div className={styles.codeSection}>
                            <h3>🎮 Your Turn - Get User Input!</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                Write code with input() and see the magic happen!
                            </p>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder={'name = input("What is your name? ")\nprint(f"Nice to meet you, {name}!")'}
                                    spellCheck={false}
                                    style={{ minHeight: '100px' }}
                                />
                            </div>

                            {!waitingForInput ? (
                                <button className={styles.runBtn} onClick={runCode}><Play size={18} /> Run Code</button>
                            ) : (
                                <div style={{ marginTop: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && submitInput()}
                                            placeholder="Type your answer here..."
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem 1rem',
                                                background: 'rgba(0,0,0,0.3)',
                                                border: '1px solid rgba(139, 233, 253, 0.5)',
                                                borderRadius: '0.5rem',
                                                color: 'white',
                                                fontSize: '1rem'
                                            }}
                                        />
                                        <button
                                            onClick={submitInput}
                                            style={{
                                                padding: '0.75rem 1.5rem',
                                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                                border: 'none',
                                                borderRadius: '0.5rem',
                                                color: 'white',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <Send size={18} /> Submit
                                        </button>
                                    </div>
                                </div>
                            )}

                            {output && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.outputBox}>
                                    <div className={styles.outputLabel}>{waitingForInput ? '💬 Question:' : '✨ Output:'}</div>
                                    <div className={styles.outputText}>{output}</div>
                                </motion.div>
                            )}
                        </div>

                        {/* Challenges */}
                        <div className={styles.challenges}>
                            <h3>🎯 Mini Challenges:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${challengesDone[0] ? styles.done : ''}`}>{challengesDone[0] && <Check size={14} />}</div>
                                    Use input() to ask a question
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${challengesDone[1] ? styles.done : ''}`}>{challengesDone[1] && <Check size={14} />}</div>
                                    Save the answer in a variable called "name"
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${challengesDone[2] ? styles.done : ''}`}>{challengesDone[2] && <Check size={14} />}</div>
                                    Use an f-string to include the answer
                                </li>
                            </ul>
                        </div>

                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Pro Tips:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li>Add a space at the end of your prompt: <code>"Name: "</code></li>
                                    <li>input() always returns text (string)</li>
                                    <li>Use <code>int(input(...))</code> for numbers</li>
                                </ul>
                            </div>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level1/lesson13" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection}>
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧠</motion.div>
                        <h2 className={styles.quizTitle}>Brain Check!</h2>
                        <p className={styles.quizQuestion}>
                            What type does <code>input()</code> always return?
                        </p>
                        <div className={styles.quizOptions}>
                            {['int', 'str', 'bool'].map((option, idx) => (
                                <button key={idx} onClick={() => !quizChecked && setQuizAnswer(idx)} className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''} ${quizChecked && idx === 1 ? styles.correct : ''} ${quizChecked && quizAnswer === idx && idx !== 1 ? styles.wrong : ''}`} disabled={quizChecked}>{option}</button>
                            ))}
                        </div>
                        {!quizChecked ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswer === null}>Check Answer</button>
                        ) : quizAnswer !== 1 ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite! 🤔</h4>
                                <p>input() ALWAYS returns a string (str), even if the user types a number! Use int() to convert if needed.</p>
                                <button className={styles.quizBtn} onClick={() => { setQuizChecked(false); setQuizAnswer(null); }} style={{ marginTop: '1rem' }}>Try Again</button>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
