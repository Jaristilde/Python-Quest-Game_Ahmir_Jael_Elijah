'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, StopCircle, Bot, AlertTriangle, Cookie } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL2_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL2_LESSONS[10]; // Lesson 11
const LESSON_ID = 26;

export default function Lesson11() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizStep, setQuizStep] = useState(0);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizChecked, setQuizChecked] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);

    // Visual animation state
    const [cookieCount, setCookieCount] = useState(5);
    const [animating, setAnimating] = useState(false);
    const [loopIteration, setLoopIteration] = useState(0);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    // Cookie eating animation
    useEffect(() => {
        if (animating && cookieCount > 0) {
            const timer = setTimeout(() => {
                setCookieCount(prev => prev - 1);
                setLoopIteration(prev => prev + 1);
            }, 800);
            return () => clearTimeout(timer);
        } else if (cookieCount === 0) {
            setAnimating(false);
        }
    }, [animating, cookieCount]);

    const startAnimation = () => {
        setCookieCount(5);
        setLoopIteration(0);
        setAnimating(true);
    };

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            let variables: { [key: string]: number | boolean | string } = {};
            let maxIterations = 50;
            let iterations = 0;

            for (let i = 0; i < lines.length && iterations < maxIterations; i++) {
                const line = lines[i];
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) continue;

                // Variable assignment (simple number or boolean)
                const varMatch = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
                if (varMatch && !trimmed.includes('-=') && !trimmed.includes('+=')) {
                    const varName = varMatch[1];
                    const value = varMatch[2].trim();
                    if (value === 'True') variables[varName] = true;
                    else if (value === 'False') variables[varName] = false;
                    else if (!isNaN(Number(value))) variables[varName] = Number(value);
                    else if (value.startsWith('"') || value.startsWith("'")) variables[varName] = value.slice(1, -1);
                    continue;
                }

                // While loop
                const whileMatch = trimmed.match(/^while\s+(.+)\s*:$/);
                if (whileMatch) {
                    let condition = whileMatch[1];

                    // Collect loop body
                    let bodyLines: string[] = [];
                    let j = i + 1;
                    while (j < lines.length && (lines[j].startsWith('    ') || lines[j].startsWith('\t') || !lines[j].trim())) {
                        if (lines[j].trim()) {
                            bodyLines.push(lines[j].trim());
                        }
                        j++;
                    }

                    // Execute while loop
                    while (iterations < maxIterations) {
                        // Evaluate condition
                        let evalCondition = condition;
                        for (const [k, v] of Object.entries(variables)) {
                            const regex = new RegExp(`\\b${k}\\b`, 'g');
                            if (typeof v === 'boolean') {
                                evalCondition = evalCondition.replace(regex, v ? 'true' : 'false');
                            } else if (typeof v === 'number') {
                                evalCondition = evalCondition.replace(regex, String(v));
                            } else {
                                evalCondition = evalCondition.replace(regex, `"${v}"`);
                            }
                        }
                        evalCondition = evalCondition.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false');
                        evalCondition = evalCondition.replace(/\band\b/g, '&&').replace(/\bor\b/g, '||');

                        let result = false;
                        try {
                            result = eval(evalCondition);
                        } catch {
                            result = false;
                        }

                        if (!result) break;
                        iterations++;

                        // Execute body
                        for (const bodyLine of bodyLines) {
                            // Print with f-string
                            const printFMatch = bodyLine.match(/^print\s*\(\s*f["'](.+)["']\s*\)$/);
                            if (printFMatch) {
                                let result = printFMatch[1];
                                result = result.replace(/\{(\w+)\}/g, (_, varName) => {
                                    return variables[varName] !== undefined ? String(variables[varName]) : varName;
                                });
                                outputLines.push(result);
                                continue;
                            }

                            // Simple print
                            const printMatch = bodyLine.match(/^print\s*\(\s*["'](.+)["']\s*\)$/);
                            if (printMatch) {
                                outputLines.push(printMatch[1]);
                                continue;
                            }

                            // Decrement: var -= 1
                            const decrementMatch = bodyLine.match(/^(\w+)\s*-=\s*(\d+)$/);
                            if (decrementMatch) {
                                const varName = decrementMatch[1];
                                const amount = parseInt(decrementMatch[2]);
                                if (typeof variables[varName] === 'number') {
                                    variables[varName] = (variables[varName] as number) - amount;
                                }
                                continue;
                            }

                            // Increment: var += 1
                            const incrementMatch = bodyLine.match(/^(\w+)\s*\+=\s*(\d+)$/);
                            if (incrementMatch) {
                                const varName = incrementMatch[1];
                                const amount = parseInt(incrementMatch[2]);
                                if (typeof variables[varName] === 'number') {
                                    variables[varName] = (variables[varName] as number) + amount;
                                }
                                continue;
                            }

                            // Boolean assignment: var = True/False
                            const boolMatch = bodyLine.match(/^(\w+)\s*=\s*(True|False)$/);
                            if (boolMatch) {
                                variables[boolMatch[1]] = boolMatch[2] === 'True';
                                continue;
                            }
                        }
                    }

                    i = j - 1;
                    continue;
                }

                // Print outside loop
                const printMatch = trimmed.match(/^print\s*\(\s*["'](.+)["']\s*\)$/);
                if (printMatch) {
                    outputLines.push(printMatch[1]);
                }
            }

            if (iterations >= maxIterations) {
                setOutput('Loop ran too many times! Check your exit condition.');
            } else {
                setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Try running a while loop!');
            }
        } catch {
            setOutput('Error in code!');
        }
    };

    const quizQuestions = [
        {
            question: 'What makes a while loop stop?',
            options: ['Condition becomes False', 'Condition becomes True', 'Time runs out'],
            correct: 0,
            explanation: 'A while loop stops when its condition becomes False. The loop keeps running as long as the condition is True!'
        },
        {
            question: "What's an infinite loop?",
            options: ['A loop that never stops', 'A loop that runs 100 times', 'A very fast loop'],
            correct: 0,
            explanation: "An infinite loop is a loop that never stops because the condition never becomes False. Always make sure to update your variable!"
        }
    ];

    const checkQuiz = () => {
        setQuizChecked(true);
        if (quizAnswer === quizQuestions[quizStep].correct) {
            if (quizStep < quizQuestions.length - 1) {
                setTimeout(() => {
                    setQuizStep(prev => prev + 1);
                    setQuizAnswer(null);
                    setQuizChecked(false);
                }, 1000);
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
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}><Check size={50} className="text-white" /></motion.div>
                <h2 className={styles.successTitle}>{LESSON.successMessage}</h2>
                <p className={styles.successMessage}>You know how to make loops stop safely!</p>
                <div className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</div>
                <Link href="/level2/lesson12" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link>
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
                        <div className={styles.lessonTitle}>
                            <motion.div className={styles.lessonEmoji} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>{LESSON.emoji}</motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(249, 115, 22, 0.15))' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                {/* Cookie jar animation */}
                                <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                                    {/* Cookie jar */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '0',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        fontSize: '2.5rem'
                                    }}>
                                        {cookieCount > 0 ? '🍪' : '🫙'}
                                    </div>
                                    {/* Robo eating */}
                                    <motion.div
                                        animate={animating ? { y: [0, -5, 0], rotate: [-5, 5, -5] } : {}}
                                        transition={{ duration: 0.3, repeat: animating ? Infinity : 0 }}
                                        style={{ position: 'absolute', top: '0', right: '0' }}
                                    >
                                        <span style={{ fontSize: '1.5rem' }}>🤖</span>
                                    </motion.div>
                                    {/* Cookie count */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-5px',
                                        right: '0',
                                        background: 'rgba(239, 68, 68, 0.8)',
                                        borderRadius: '50%',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {cookieCount}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
                                        <Bot size={20} className="text-orange-400" />
                                        Robo's Cookie Problem!
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        Robo is eating cookies but should stop when the jar is empty!
                                    </p>
                                </div>
                            </div>
                            <p>How do we make sure loops know when to stop? Every while loop needs an <strong>EXIT CONDITION!</strong></p>
                            <button
                                onClick={startAnimation}
                                disabled={animating}
                                style={{
                                    marginTop: '1rem',
                                    padding: '0.5rem 1rem',
                                    background: animating ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.6)',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    color: 'white',
                                    cursor: animating ? 'not-allowed' : 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {animating ? `Eating... (Loop #{loopIteration + 1})` : 'Watch Robo Eat'}
                            </button>
                        </motion.div>

                        {/* Loop Iteration Visual */}
                        <div className={styles.explainBox} style={{ background: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <StopCircle size={20} className="text-blue-400" /> Loop Iteration Tracker
                            </h3>
                            <div style={{
                                display: 'flex',
                                gap: '0.5rem',
                                flexWrap: 'wrap',
                                marginBottom: '0.5rem'
                            }}>
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <div
                                        key={num}
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexDirection: 'column',
                                            background: num <= loopIteration ? 'rgba(16, 185, 129, 0.3)' : 'rgba(100, 116, 139, 0.2)',
                                            border: num === loopIteration + 1 && animating ? '2px solid #f97316' : '1px solid rgba(100, 116, 139, 0.3)',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Loop</span>
                                        <span style={{ fontWeight: 'bold' }}>{num}</span>
                                    </div>
                                ))}
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Cookies left: {5 - loopIteration} {5 - loopIteration === 0 ? '(STOP!)' : ''}
                            </p>
                        </div>

                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem' }}>Common Exit Condition Patterns:</h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                    <code style={{ color: '#50fa7b', fontSize: '1rem' }}>while count {'<'} 10:</code>
                                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Counter: Count UP to a limit</p>
                                </div>
                                <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                    <code style={{ color: '#8be9fd', fontSize: '1rem' }}>while lives {'>'} 0:</code>
                                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Countdown: Count DOWN to zero</p>
                                </div>
                                <div style={{ background: 'rgba(168, 85, 247, 0.2)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                                    <code style={{ color: '#bd93f9', fontSize: '1rem' }}>while playing == True:</code>
                                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Flag: Until something changes</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.codeSection}>
                            <h3>Example - Cookie Eating Loop</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>main.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    cookies = <span className={styles.number}>5</span>{'\n\n'}
                                    <span className={styles.keyword}>while</span> cookies {'>'} <span className={styles.number}>0</span>:{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(f<span className={styles.string}>"Yum! {'{cookies}'} cookies left"</span>){'\n'}
                                    {'    '}cookies -= <span className={styles.number}>1</span>  <span className={styles.comment}># This makes cookies smaller!</span>{'\n\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"Jar is empty!"</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>Yum! 5 cookies left{'\n'}Yum! 4 cookies left{'\n'}Yum! 3 cookies left{'\n'}Yum! 2 cookies left{'\n'}Yum! 1 cookies left{'\n'}Jar is empty!</div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className={styles.explainBox} style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.5)', border: '2px dashed' }}>
                            <h3 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
                                <AlertTriangle size={24} className="text-red-400" /> DANGER ZONE - Infinite Loop!
                            </h3>
                            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '0.5rem', fontFamily: 'monospace', marginBottom: '1rem' }}>
                                <span style={{ color: '#ff5555' }}># DON'T DO THIS!</span>{'\n'}
                                x = <span style={{ color: '#bd93f9' }}>5</span>{'\n'}
                                <span style={{ color: '#ff79c6' }}>while</span> x {'>'} <span style={{ color: '#bd93f9' }}>0</span>:{'\n'}
                                {'    '}<span style={{ color: '#ff79c6' }}>print</span>(<span style={{ color: '#f1fa8c' }}>x</span>){'\n'}
                                {'    '}<span style={{ color: '#ff5555' }}># Forgot to change x! Loops forever!</span>
                            </div>
                            <p style={{ color: '#fca5a5' }}>
                                Without <code>x -= 1</code>, x stays at 5 forever and the loop NEVER stops!
                            </p>
                        </div>

                        <div className={styles.codeSection}>
                            <h3>Your Turn! Build a Lives Counter</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                Start with 3 lives. Print "Playing..." while lives {'>'} 0. Lose 1 life each round. Print "Game Over!" when done.
                            </p>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} placeholder={'lives = 3\n\nwhile lives > 0:\n    print("Playing...")\n    lives -= 1\n\nprint("Game Over!")'} spellCheck={false} style={{ minHeight: '160px' }} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode}><Play size={18} /> Run Code</button>
                            {output && <div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText} style={{ whiteSpace: 'pre-wrap' }}>{output}</div></div>}
                        </div>

                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <p><strong>Golden Rule:</strong> Always make sure your loop variable changes inside the loop so the condition can eventually become False!</p>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level2/lesson10" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection}>
                        <h2 className={styles.quizTitle}>Brain Check! ({quizStep + 1}/{quizQuestions.length})</h2>
                        <p className={styles.quizQuestion}>{quizQuestions[quizStep].question}</p>
                        <div className={styles.quizOptions}>
                            {quizQuestions[quizStep].options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => !quizChecked && setQuizAnswer(idx)}
                                    className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''} ${quizChecked && idx === quizQuestions[quizStep].correct ? styles.correct : ''} ${quizChecked && quizAnswer === idx && idx !== quizQuestions[quizStep].correct ? styles.wrong : ''}`}
                                    disabled={quizChecked}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                        {!quizChecked ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswer === null}>Check Answer</button>
                        ) : quizAnswer !== quizQuestions[quizStep].correct ? (
                            <div className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>{quizQuestions[quizStep].explanation}</p>
                                <button className={styles.quizBtn} onClick={() => { setQuizChecked(false); setQuizAnswer(null); }} style={{ marginTop: '1rem' }}>Try Again</button>
                            </div>
                        ) : (
                            <div className={`${styles.quizFeedback} ${styles.success}`}>
                                <h4>Correct!</h4>
                                <p>{quizStep < quizQuestions.length - 1 ? 'Moving to next question...' : 'Great job!'}</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
