'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, ClipboardList, UserCheck, UserX } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL3_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL3_LESSONS[5]; // Lesson 6
const LESSON_ID = 39;

export default function Lesson6() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('# Check if someone is on the list!\n');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);

    // Animation states for bouncer robot
    const [currentGuest, setCurrentGuest] = useState(0);
    const [checkingGuest, setCheckingGuest] = useState(false);
    const [guestResult, setGuestResult] = useState<boolean | null>(null);

    const vipList = ["Alice", "Bob", "Charlie"];
    const guestQueue = ["Alice", "David", "Bob", "Eve", "Charlie"];

    const quizQuestions = [
        {
            question: 'What does "in" return when checking a list?',
            options: ["The item's position", "True or False", "The list length"],
            correct: 1
        },
        {
            question: 'If fruits = ["apple", "banana"], what is "grape" in fruits?',
            options: ["True", "False", "Error"],
            correct: 1
        }
    ];

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    // Animate through guests
    useEffect(() => {
        const interval = setInterval(() => {
            setCheckingGuest(true);
            setGuestResult(null);

            setTimeout(() => {
                const guest = guestQueue[currentGuest];
                const isVIP = vipList.includes(guest);
                setGuestResult(isVIP);
                setCheckingGuest(false);

                setTimeout(() => {
                    setCurrentGuest((prev) => (prev + 1) % guestQueue.length);
                    setGuestResult(null);
                }, 1500);
            }, 1000);
        }, 3500);

        return () => clearInterval(interval);
    }, [currentGuest]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            let variables: { [key: string]: string[] | string } = {};

            let i = 0;
            while (i < lines.length) {
                const line = lines[i];
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) { i++; continue; }

                // List assignment: name = ["item1", "item2", ...]
                const listMatch = trimmed.match(/^(\w+)\s*=\s*\[(.*)\]$/);
                if (listMatch) {
                    const items = listMatch[2].split(',').map(item => {
                        const match = item.trim().match(/^["'](.*)["']$/);
                        return match ? match[1] : item.trim();
                    }).filter(item => item !== '');
                    variables[listMatch[1]] = items;
                    i++;
                    continue;
                }

                // String variable assignment: name = "value"
                const stringMatch = trimmed.match(/^(\w+)\s*=\s*["'](.*)["']$/);
                if (stringMatch) {
                    variables[stringMatch[1]] = stringMatch[2];
                    i++;
                    continue;
                }

                // If statement with "in" or "not in"
                const ifInMatch = trimmed.match(/^if\s+(\w+)\s+(not\s+in|in)\s+(\w+)\s*:$/);
                if (ifInMatch) {
                    const [, itemVar, operator, listVar] = ifInMatch;
                    const item = variables[itemVar] as string;
                    const list = variables[listVar] as string[];

                    let condition = false;
                    if (operator === 'in') {
                        condition = list.includes(item);
                    } else {
                        condition = !list.includes(item);
                    }

                    // Find the if block body
                    let j = i + 1;
                    let ifBody: string[] = [];
                    let elseBody: string[] = [];
                    let inElse = false;

                    while (j < lines.length) {
                        const currentLine = lines[j];
                        const currentTrimmed = currentLine.trim();

                        if (currentTrimmed.startsWith('else:')) {
                            inElse = true;
                            j++;
                            continue;
                        }

                        if (currentTrimmed && !currentLine.startsWith('    ') && !currentLine.startsWith('\t')) {
                            break;
                        }

                        if (currentTrimmed) {
                            if (inElse) {
                                elseBody.push(currentTrimmed);
                            } else {
                                ifBody.push(currentTrimmed);
                            }
                        }
                        j++;
                    }

                    const bodyToRun = condition ? ifBody : elseBody;
                    for (const bodyLine of bodyToRun) {
                        const printMatch = bodyLine.match(/^print\s*\(\s*["'](.+)["']\s*\)$/);
                        if (printMatch) {
                            outputLines.push(printMatch[1]);
                        }
                    }

                    i = j;
                    continue;
                }

                // Simple print
                const printMatch = trimmed.match(/^print\s*\(\s*(.+)\s*\)$/);
                if (printMatch) {
                    const expr = printMatch[1].trim();

                    // Check for "item in list" expression
                    const inExprMatch = expr.match(/^["'](.+)["']\s+(not\s+in|in)\s+(\w+)$/);
                    if (inExprMatch) {
                        const [, item, operator, listVar] = inExprMatch;
                        const list = variables[listVar] as string[];
                        if (list) {
                            const result = operator === 'in' ? list.includes(item) : !list.includes(item);
                            outputLines.push(result ? 'True' : 'False');
                        }
                        i++;
                        continue;
                    }

                    // Check for variable in list expression
                    const varInExprMatch = expr.match(/^(\w+)\s+(not\s+in|in)\s+(\w+)$/);
                    if (varInExprMatch) {
                        const [, itemVar, operator, listVar] = varInExprMatch;
                        const item = variables[itemVar] as string;
                        const list = variables[listVar] as string[];
                        if (item && list) {
                            const result = operator === 'in' ? list.includes(item) : !list.includes(item);
                            outputLines.push(result ? 'True' : 'False');
                        }
                        i++;
                        continue;
                    }

                    // Quoted string
                    const stringMatch = expr.match(/^["'](.*)["']$/);
                    if (stringMatch) {
                        outputLines.push(stringMatch[1]);
                    }
                    i++;
                    continue;
                }

                i++;
            }

            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Try using "in" with a list!');
        } catch {
            setOutput('Error in code! Check your syntax.');
        }
    };

    const checkQuiz = () => {
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = true;
        setQuizChecked(newChecked);

        if (quizAnswers[currentQuiz] === quizQuestions[currentQuiz].correct) {
            if (currentQuiz < 1) {
                setTimeout(() => {
                    setCurrentQuiz(currentQuiz + 1);
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

    const retryQuiz = () => {
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = false;
        setQuizChecked(newChecked);
        const newAnswers = [...quizAnswers];
        newAnswers[currentQuiz] = null;
        setQuizAnswers(newAnswers);
    };

    if (isLoading || !user) return <div className={styles.container}><div className="flex items-center justify-center h-screen text-slate-400">Loading...</div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}><Check size={50} className="text-white" /></motion.div>
                <h2 className={styles.successTitle}>{LESSON.successMessage}</h2>
                <p className={styles.successMessage}>You can now check if items are in a list like a pro!</p>
                <div className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</div>
                <Link href="/level3/lesson7" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/level3" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 16</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                {!showQuiz ? (
                    <>
                        <div className={styles.lessonTitle}>
                            <motion.div className={styles.lessonEmoji} animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>{LESSON.emoji}</motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Story/Mission Box with Bouncer Robot Animation */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{
                                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))',
                                textAlign: 'center',
                                padding: '1.5rem'
                            }}
                        >
                            <div style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>🎟️</span> VIP Check! You're the bouncer at a cool party!
                            </div>

                            {/* Animated Bouncer Scene */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '1.5rem',
                                marginBottom: '1rem',
                                flexWrap: 'wrap'
                            }}>
                                {/* Guest */}
                                <motion.div
                                    key={currentGuest}
                                    initial={{ x: -50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}
                                >
                                    <motion.div
                                        animate={checkingGuest ? { scale: [1, 1.1, 1] } : {}}
                                        transition={{ duration: 0.5, repeat: checkingGuest ? Infinity : 0 }}
                                        style={{ fontSize: '2.5rem' }}
                                    >
                                        🧑
                                    </motion.div>
                                    <span style={{
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        background: 'rgba(0,0,0,0.3)',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '9999px'
                                    }}>
                                        {guestQueue[currentGuest]}
                                    </span>
                                </motion.div>

                                {/* Arrow */}
                                <motion.div
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                    style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}
                                >
                                    →
                                </motion.div>

                                {/* Bouncer Robot */}
                                <motion.div
                                    animate={{ y: [0, -3, 0] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <div style={{ fontSize: '2.5rem' }}>🤖</div>
                                    <ClipboardList size={20} className="text-purple-400" />
                                </motion.div>

                                {/* VIP Clipboard */}
                                <div style={{
                                    background: 'rgba(0,0,0,0.4)',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '2px solid rgba(168, 85, 247, 0.5)'
                                }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#c084fc', marginBottom: '0.5rem' }}>VIP LIST</div>
                                    {vipList.map((name, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.8rem',
                                            marginBottom: '0.25rem'
                                        }}>
                                            <Check size={12} className="text-green-400" />
                                            <span>{name}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Result */}
                                <motion.div
                                    key={`result-${currentGuest}-${guestResult}`}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{
                                        scale: guestResult !== null ? 1 : 0,
                                        opacity: guestResult !== null ? 1 : 0
                                    }}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}
                                >
                                    {guestResult === true && (
                                        <>
                                            <UserCheck size={32} className="text-green-400" />
                                            <span style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: 700 }}>Welcome!</span>
                                        </>
                                    )}
                                    {guestResult === false && (
                                        <>
                                            <UserX size={32} className="text-red-400" />
                                            <span style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: 700 }}>Not on list</span>
                                        </>
                                    )}
                                </motion.div>
                            </div>

                            <div style={{
                                color: checkingGuest ? '#c084fc' : (guestResult === true ? '#4ade80' : guestResult === false ? '#f87171' : 'var(--text-muted)'),
                                fontWeight: 700,
                                fontSize: '0.95rem'
                            }}>
                                {checkingGuest ? (
                                    `Checking if "${guestQueue[currentGuest]}" in vip_list...`
                                ) : guestResult !== null ? (
                                    `"${guestQueue[currentGuest]}" in vip_list = ${guestResult ? 'True' : 'False'}`
                                ) : (
                                    'Waiting for next guest...'
                                )}
                            </div>
                        </motion.div>

                        {/* Symbol Explanations */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem' }}>The Membership Keywords:</h3>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{
                                    background: 'rgba(16, 185, 129, 0.15)',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(16, 185, 129, 0.3)'
                                }}>
                                    <code style={{ color: '#10b981', fontWeight: 700, fontSize: '1.1rem' }}>in</code>
                                    <span style={{ marginLeft: '0.75rem' }}>=</span>
                                    <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>
                                        Checks if something is INSIDE the list (returns True or False)
                                    </span>
                                </div>
                                <div style={{
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(239, 68, 68, 0.3)'
                                }}>
                                    <code style={{ color: '#ef4444', fontWeight: 700, fontSize: '1.1rem' }}>not in</code>
                                    <span style={{ marginLeft: '0.75rem' }}>=</span>
                                    <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>
                                        Checks if something is NOT inside the list (returns True or False)
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Key Concepts */}
                        <div className={styles.explainBox} style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                            <h3 style={{ marginBottom: '0.75rem', color: '#3b82f6' }}>Key Concepts:</h3>
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>1</span>
                                    <p><code>in</code> checks if an item exists in a list</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>2</span>
                                    <p><code>not in</code> checks if item is NOT in the list</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>3</span>
                                    <p>Returns <code>True</code> or <code>False</code></p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>4</span>
                                    <p>Use with <code>if</code> statements to make decisions</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>5</span>
                                    <p>Works with strings and numbers!</p>
                                </div>
                            </div>
                        </div>

                        {/* Code Example */}
                        <div className={styles.codeSection}>
                            <h3>Code Example</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>vip_check.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># VIP list at the party</span>{'\n'}
                                    vip_list = [<span className={styles.string}>"Alice"</span>, <span className={styles.string}>"Bob"</span>, <span className={styles.string}>"Charlie"</span>]{'\n\n'}
                                    guest = <span className={styles.string}>"Alice"</span>{'\n\n'}
                                    <span className={styles.keyword}>if</span> guest <span style={{ color: '#10b981' }}>in</span> vip_list:{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"Welcome VIP! 🌟"</span>){'\n'}
                                    <span className={styles.keyword}>else</span>:{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"Sorry, not on the list"</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>Welcome VIP! 🌟</div>
                            </div>
                        </div>

                        {/* Interactive Code Editor */}
                        <div className={styles.codeSection}>
                            <h3>Your Turn!</h3>
                            <p style={{ marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Try different guest names! Change "Alice" to "David" or "Eve" and see what happens. You can also try using <code>not in</code>!
                            </p>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    spellCheck={false}
                                    style={{ minHeight: '200px' }}
                                />
                            </div>
                            <button className={styles.runBtn} onClick={runCode}><Play size={18} /> Run Code</button>
                            {output && <div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></div>}
                        </div>

                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <div>
                                <p style={{ fontWeight: 600 }}>Works with Numbers Too!</p>
                                <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                    <code>numbers = [1, 2, 3]</code> then <code>2 in numbers</code> returns <code>True</code>!
                                </p>
                            </div>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level3/lesson5" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection}>
                        <h2 className={styles.quizTitle}>Brain Check! ({currentQuiz + 1}/2)</h2>
                        <p className={styles.quizQuestion}>{quizQuestions[currentQuiz].question}</p>
                        <div className={styles.quizOptions}>
                            {quizQuestions[currentQuiz].options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        if (!quizChecked[currentQuiz]) {
                                            const newAnswers = [...quizAnswers];
                                            newAnswers[currentQuiz] = idx;
                                            setQuizAnswers(newAnswers);
                                        }
                                    }}
                                    className={`${styles.quizOption} ${quizAnswers[currentQuiz] === idx ? styles.selected : ''} ${quizChecked[currentQuiz] && idx === quizQuestions[currentQuiz].correct ? styles.correct : ''} ${quizChecked[currentQuiz] && quizAnswers[currentQuiz] === idx && idx !== quizQuestions[currentQuiz].correct ? styles.wrong : ''}`}
                                    disabled={quizChecked[currentQuiz]}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                        {!quizChecked[currentQuiz] ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswers[currentQuiz] === null}>Check Answer</button>
                        ) : quizAnswers[currentQuiz] !== quizQuestions[currentQuiz].correct ? (
                            <div className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>
                                    {currentQuiz === 0 && 'The "in" keyword always returns True or False - it checks if an item exists in the list!'}
                                    {currentQuiz === 1 && '"grape" is not in the list ["apple", "banana"], so "grape" in fruits returns False!'}
                                </p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem' }}>Try Again</button>
                            </div>
                        ) : (
                            <div className={`${styles.quizFeedback} ${styles.success}`}>
                                <h4>Correct!</h4>
                                {currentQuiz < 1 && <p>Moving to the next question...</p>}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
