'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Bot } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL2_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL2_LESSONS[4]; // Lesson 5
const LESSON_ID = 20;

export default function Lesson5() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('score = 85\n\nif score >= 90:\n    print("A - Amazing!")\nelif score >= 80:\n    print("B - Great job!")\nelif score >= 70:\n    print("C - Good work!")\nelse:\n    print("Keep practicing!")');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);

    const quizQuestions = [
        {
            question: 'What is elif short for?',
            options: ['else if', 'electric if', 'extra if'],
            correct: 0
        },
        {
            question: 'How many elifs can you have?',
            options: ['As many as you need', 'Only 1', 'Only 2'],
            correct: 0
        },
        {
            question: 'Which condition does Python check first?',
            options: ['The top one', 'The bottom one', 'Random'],
            correct: 0
        }
    ];

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let variables: { [key: string]: number } = {};
            let outputLines: string[] = [];

            let i = 0;
            while (i < lines.length) {
                const line = lines[i];
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) { i++; continue; }

                // Variable assignment: name = number
                const assignMatch = trimmed.match(/^(\w+)\s*=\s*(\d+)$/);
                if (assignMatch) {
                    variables[assignMatch[1]] = parseInt(assignMatch[2]);
                    i++;
                    continue;
                }

                // If/elif/else chain
                const ifMatch = trimmed.match(/^if\s+(.+):$/);
                if (ifMatch) {
                    let foundTrue = false;
                    let j = i;

                    while (j < lines.length) {
                        const currentLine = lines[j].trim();
                        let conditionMatch = currentLine.match(/^(if|elif)\s+(.+):$/);
                        let elseMatch = currentLine.match(/^else\s*:$/);

                        if (conditionMatch || elseMatch) {
                            // Find the body of this block
                            let bodyStart = j + 1;
                            let body: string[] = [];
                            while (bodyStart < lines.length && (lines[bodyStart].startsWith('    ') || lines[bodyStart].startsWith('\t') || lines[bodyStart].trim() === '')) {
                                if (lines[bodyStart].trim()) {
                                    body.push(lines[bodyStart].trim());
                                }
                                bodyStart++;
                            }

                            if (!foundTrue) {
                                let shouldRun = false;

                                if (elseMatch) {
                                    shouldRun = true;
                                } else if (conditionMatch) {
                                    const condition = conditionMatch[2];
                                    // Parse condition like: score >= 90
                                    const compMatch = condition.match(/^(\w+)\s*(>=|<=|>|<|==|!=)\s*(\d+)$/);
                                    if (compMatch) {
                                        const [, varName, op, num] = compMatch;
                                        const val = variables[varName];
                                        const target = parseInt(num);
                                        switch (op) {
                                            case '>=': shouldRun = val >= target; break;
                                            case '<=': shouldRun = val <= target; break;
                                            case '>': shouldRun = val > target; break;
                                            case '<': shouldRun = val < target; break;
                                            case '==': shouldRun = val === target; break;
                                            case '!=': shouldRun = val !== target; break;
                                        }
                                    }
                                }

                                if (shouldRun) {
                                    foundTrue = true;
                                    // Execute body
                                    for (const bodyLine of body) {
                                        const printMatch = bodyLine.match(/^print\s*\(\s*["'](.+)["']\s*\)$/);
                                        if (printMatch) {
                                            outputLines.push(printMatch[1]);
                                        }
                                    }
                                }
                            }

                            j = bodyStart;

                            // Check if next line is elif or else
                            if (j < lines.length) {
                                const nextTrimmed = lines[j].trim();
                                if (!nextTrimmed.startsWith('elif') && !nextTrimmed.startsWith('else')) {
                                    break;
                                }
                            } else {
                                break;
                            }
                        } else {
                            break;
                        }
                    }
                    i = j;
                    continue;
                }

                i++;
            }

            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code!');
        } catch {
            setOutput('Error in code! Check your syntax.');
        }
    };

    const checkQuiz = () => {
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = true;
        setQuizChecked(newChecked);

        if (quizAnswers[currentQuiz] === quizQuestions[currentQuiz].correct) {
            if (currentQuiz < 2) {
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
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #f59e0b, #ec4899)' }}><Check size={50} className="text-white" /></motion.div>
                <h2 className={styles.successTitle}>{LESSON.successMessage}</h2>
                <p className={styles.successMessage}>You can now handle many different choices with elif!</p>
                <div className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</div>
                <Link href="/level2/lesson6" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link>
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
                            <motion.div className={styles.lessonEmoji} animate={{ y: [0, -5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>{LESSON.emoji}</motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Story/Mission Box with Robot and Signposts */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(168, 85, 247, 0.15))' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                {/* Robot with multiple signposts */}
                                <div style={{ position: 'relative', width: '120px', height: '80px', flexShrink: 0 }}>
                                    {/* Signposts */}
                                    <div style={{ position: 'absolute', left: '0', top: '0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <motion.div
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.1 }}
                                            style={{
                                                background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                color: 'white',
                                                transform: 'rotate(-5deg)'
                                            }}
                                        >
                                            A - 90+
                                        </motion.div>
                                        <motion.div
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                            style={{
                                                background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                color: 'white',
                                                transform: 'rotate(-2deg)'
                                            }}
                                        >
                                            B - 80+
                                        </motion.div>
                                        <motion.div
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                            style={{
                                                background: 'linear-gradient(90deg, #eab308, #ca8a04)',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                color: 'white',
                                                transform: 'rotate(2deg)'
                                            }}
                                        >
                                            C - 70+
                                        </motion.div>
                                        <motion.div
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.4 }}
                                            style={{
                                                background: 'linear-gradient(90deg, #ef4444, #dc2626)',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                color: 'white',
                                                transform: 'rotate(5deg)'
                                            }}
                                        >
                                            else...
                                        </motion.div>
                                    </div>
                                    {/* Robot */}
                                    <motion.div
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '2.5rem' }}
                                    >
                                        <Bot size={40} className="text-blue-400" />
                                    </motion.div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
                                        Robo is grading test scores!
                                    </div>
                                    <p style={{ marginTop: '0.25rem', color: 'var(--text-muted)' }}>
                                        But there are MANY grades: A, B, C, D, F. We need more than just <code>if</code> and <code>else</code> - we need <code>elif</code>!
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Explanation Box */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem' }}>What is elif?</h3>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>1</span>
                                    <p><code>elif</code> = <strong>"else if"</strong> = "if the first thing wasn't true, check THIS instead"</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>2</span>
                                    <p>You can have <strong>as many elifs as you want!</strong></p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>3</span>
                                    <p>Python checks from <strong>top to bottom</strong>, stops at the first True one</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>4</span>
                                    <p>End with <code>else</code> to catch anything that didn't match</p>
                                </div>
                            </div>
                        </div>

                        {/* Code Example */}
                        <div className={styles.codeSection}>
                            <h3>Code Example</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>grade_checker.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    score = <span className={styles.number}>85</span>{'\n\n'}
                                    <span className={styles.keyword}>if</span> score {'>='} <span className={styles.number}>90</span>:{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"A - Amazing!"</span>){'\n'}
                                    <span className={styles.keyword}>elif</span> score {'>='} <span className={styles.number}>80</span>:{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"B - Great job!"</span>){'\n'}
                                    <span className={styles.keyword}>elif</span> score {'>='} <span className={styles.number}>70</span>:{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"C - Good work!"</span>){'\n'}
                                    <span className={styles.keyword}>else</span>:{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"Keep practicing!"</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>B - Great job!</div>
                            </div>
                        </div>

                        {/* Interactive Code Editor */}
                        <div className={styles.codeSection}>
                            <h3>Your Turn!</h3>
                            <p style={{ marginBottom: '0.75rem', color: 'var(--text-muted)' }}>Change the score to get different grades. Try: 95, 75, 60</p>
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
                                <p style={{ fontWeight: 600 }}>Order Matters!</p>
                                <p style={{ fontSize: '0.9rem' }}>Python checks conditions from top to bottom. Once it finds a True condition, it runs that code and skips all the rest!</p>
                            </div>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level2/lesson4" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection}>
                        <h2 className={styles.quizTitle}>Brain Check! ({currentQuiz + 1}/3)</h2>
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
                                    {currentQuiz === 0 && 'elif is short for "else if" - it gives you another condition to check!'}
                                    {currentQuiz === 1 && 'You can have as many elifs as you need - there is no limit!'}
                                    {currentQuiz === 2 && 'Python always checks conditions from top to bottom, in order.'}
                                </p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem' }}>Try Again</button>
                            </div>
                        ) : (
                            <div className={`${styles.quizFeedback} ${styles.success}`}>
                                <h4>Correct!</h4>
                                {currentQuiz < 2 && <p>Moving to the next question...</p>}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
