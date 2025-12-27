'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Gauge, Flag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL2_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL2_LESSONS[12]; // Lesson 13
const LESSON_ID = 28;

export default function Lesson13() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizStep, setQuizStep] = useState(0);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizChecked, setQuizChecked] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            let variables: { [key: string]: number | boolean } = {};
            let i = 0;

            while (i < lines.length) {
                const line = lines[i].trim();
                if (!line || line.startsWith('#')) {
                    i++;
                    continue;
                }

                // Variable assignment (number or boolean)
                const varMatch = line.match(/^(\w+)\s*=\s*(.+)$/);
                if (varMatch && !line.includes('while')) {
                    const varName = varMatch[1];
                    const value = varMatch[2].trim();
                    if (value === 'True') {
                        variables[varName] = true;
                    } else if (value === 'False') {
                        variables[varName] = false;
                    } else if (!isNaN(Number(value))) {
                        variables[varName] = Number(value);
                    }
                    i++;
                    continue;
                }

                // While loop
                const whileMatch = line.match(/^while\s+(.+)\s*:$/);
                if (whileMatch) {
                    let condition = whileMatch[1];
                    let loopCount = 0;
                    const maxIterations = 100;

                    // Collect loop body
                    const bodyLines: string[] = [];
                    let j = i + 1;
                    while (j < lines.length && (lines[j].startsWith('    ') || lines[j].startsWith('\t') || !lines[j].trim())) {
                        if (lines[j].trim()) {
                            bodyLines.push(lines[j].trim());
                        }
                        j++;
                    }

                    // Evaluate condition
                    const evalCondition = () => {
                        let cond = condition;
                        for (const [k, v] of Object.entries(variables)) {
                            const regex = new RegExp(`\\b${k}\\b`, 'g');
                            if (typeof v === 'boolean') {
                                cond = cond.replace(regex, String(v));
                            } else {
                                cond = cond.replace(regex, String(v));
                            }
                        }
                        // Handle Python True/False
                        cond = cond.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false');
                        try {
                            return eval(cond);
                        } catch {
                            return false;
                        }
                    };

                    while (evalCondition() && loopCount < maxIterations) {
                        for (const bodyLine of bodyLines) {
                            // Print f-string
                            const fPrintMatch = bodyLine.match(/^print\s*\(\s*f["'](.+)["']\s*\)$/);
                            if (fPrintMatch) {
                                let result = fPrintMatch[1];
                                result = result.replace(/\{([^}]+)\}/g, (_, expr) => {
                                    // Handle simple expressions like count + 1
                                    let evalExpr = expr.trim();
                                    for (const [k, v] of Object.entries(variables)) {
                                        const regex = new RegExp(`\\b${k}\\b`, 'g');
                                        evalExpr = evalExpr.replace(regex, String(v));
                                    }
                                    try {
                                        return String(eval(evalExpr));
                                    } catch {
                                        return expr;
                                    }
                                });
                                outputLines.push(result);
                                continue;
                            }

                            // Print regular string
                            const printMatch = bodyLine.match(/^print\s*\(\s*["'](.+)["']\s*\)$/);
                            if (printMatch) {
                                outputLines.push(printMatch[1]);
                                continue;
                            }

                            // Assignment operators +=, -=, *=
                            const opMatch = bodyLine.match(/^(\w+)\s*(\+|-|\*)=\s*(.+)$/);
                            if (opMatch) {
                                const varName = opMatch[1];
                                const op = opMatch[2];
                                let val = opMatch[3].trim();
                                // Replace variables in value
                                for (const [k, v] of Object.entries(variables)) {
                                    const regex = new RegExp(`\\b${k}\\b`, 'g');
                                    val = val.replace(regex, String(v));
                                }
                                const numVal = eval(val);
                                if (op === '+') variables[varName] = (variables[varName] as number) + numVal;
                                else if (op === '-') variables[varName] = (variables[varName] as number) - numVal;
                                else if (op === '*') variables[varName] = (variables[varName] as number) * numVal;
                                continue;
                            }

                            // Simple assignment inside loop
                            const assignMatch = bodyLine.match(/^(\w+)\s*=\s*(.+)$/);
                            if (assignMatch) {
                                const varName = assignMatch[1];
                                const value = assignMatch[2].trim();
                                if (value === 'True') {
                                    variables[varName] = true;
                                } else if (value === 'False') {
                                    variables[varName] = false;
                                } else if (!isNaN(Number(value))) {
                                    variables[varName] = Number(value);
                                }
                                continue;
                            }

                            // If statement inside loop
                            const ifMatch = bodyLine.match(/^if\s+(.+)\s*:$/);
                            if (ifMatch) {
                                let cond = ifMatch[1];
                                for (const [k, v] of Object.entries(variables)) {
                                    const regex = new RegExp(`\\b${k}\\b`, 'g');
                                    cond = cond.replace(regex, String(v));
                                }
                                try {
                                    if (eval(cond)) {
                                        // Find next line which should be indented body of if
                                        const ifBodyIndex = bodyLines.indexOf(bodyLine) + 1;
                                        if (ifBodyIndex < bodyLines.length) {
                                            const ifBody = bodyLines[ifBodyIndex];
                                            const assignMatch = ifBody.match(/^(\w+)\s*=\s*(.+)$/);
                                            if (assignMatch) {
                                                const varName = assignMatch[1];
                                                const value = assignMatch[2].trim();
                                                if (value === 'True') variables[varName] = true;
                                                else if (value === 'False') variables[varName] = false;
                                            }
                                        }
                                    }
                                } catch {
                                    // Ignore if condition errors
                                }
                            }
                        }
                        loopCount++;
                    }

                    i = j;
                    continue;
                }

                // Print after loop
                const printMatch = line.match(/^print\s*\(\s*f?["'](.+)["']\s*\)$/);
                if (printMatch) {
                    let result = printMatch[1];
                    result = result.replace(/\{([^}]+)\}/g, (_, expr) => {
                        let evalExpr = expr.trim();
                        for (const [k, v] of Object.entries(variables)) {
                            const regex = new RegExp(`\\b${k}\\b`, 'g');
                            evalExpr = evalExpr.replace(regex, String(v));
                        }
                        try {
                            return String(eval(evalExpr));
                        } catch {
                            return expr;
                        }
                    });
                    outputLines.push(result);
                }

                i++;
            }

            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code to see the output!');
        } catch {
            setOutput('Error in code!');
        }
    };

    const checkQuiz = () => {
        setQuizChecked(true);
        const correctAnswers = [0, 0]; // First quiz: 0, Second quiz: 0
        if (quizAnswer === correctAnswers[quizStep]) {
            if (quizStep === 0) {
                setTimeout(() => {
                    setQuizStep(1);
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
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}><Check size={50} className="text-white" /></motion.div>
                <h2 className={styles.successTitle}>Loop Controller!</h2>
                <p className={styles.successMessage}>{LESSON.successMessage}</p>
                <div className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</div>
                <Link href="/level2/lesson14" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link>
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
                            <motion.div className={styles.lessonEmoji} animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 1, repeat: Infinity }}>{LESSON.emoji}</motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.15))' }}>
                            {/* Race car animation */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ position: 'relative', width: '120px', height: '60px', overflow: 'hidden' }}>
                                    {/* Race track */}
                                    <div style={{ position: 'absolute', bottom: '10px', left: 0, right: 0, height: '4px', background: '#374151', borderRadius: '2px' }}>
                                        <div style={{ position: 'absolute', top: '50%', left: '20%', width: '10px', height: '2px', background: '#fff', transform: 'translateY(-50%)' }} />
                                        <div style={{ position: 'absolute', top: '50%', left: '50%', width: '10px', height: '2px', background: '#fff', transform: 'translateY(-50%)' }} />
                                        <div style={{ position: 'absolute', top: '50%', left: '80%', width: '10px', height: '2px', background: '#fff', transform: 'translateY(-50%)' }} />
                                    </div>
                                    {/* Steering wheel */}
                                    <motion.div
                                        animate={{ rotate: [-20, 20, -20] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        style={{ position: 'absolute', top: '5px', left: '10px' }}
                                    >
                                        <Gauge size={28} className="text-amber-400" />
                                    </motion.div>
                                    {/* Race car */}
                                    <motion.div
                                        animate={{ x: [0, 70, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                        style={{ position: 'absolute', bottom: '12px', left: '5px', fontSize: '1.5rem' }}
                                    >
                                        <span role="img" aria-label="race car">&#128663;</span>
                                    </motion.div>
                                    {/* Checkered flag */}
                                    <motion.div
                                        animate={{ y: [0, -3, 0] }}
                                        transition={{ duration: 0.5, repeat: Infinity }}
                                        style={{ position: 'absolute', bottom: '15px', right: '5px' }}
                                    >
                                        <Flag size={20} className="text-emerald-400" fill="currentColor" />
                                    </motion.div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
                                        Robo is Driving a Race Car!
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>The loop is the engine - now let's steer it!</p>
                                </div>
                            </div>
                            <p>Just like driving a car, we need ways to <strong>control</strong> our loops - speed up, slow down, and know when to stop!</p>
                        </motion.div>

                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem' }}>Three Loop Control Patterns:</h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#f59e0b' }}>
                                        <span style={{ fontSize: '1.25rem' }}>1.</span> Counter Pattern
                                    </div>
                                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Track how many times the loop runs</p>
                                </div>
                                <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#3b82f6' }}>
                                        <span style={{ fontSize: '1.25rem' }}>2.</span> Accumulator Pattern
                                    </div>
                                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Build up a total (add things together)</p>
                                </div>
                                <div style={{ background: 'rgba(34, 197, 94, 0.15)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#22c55e' }}>
                                        <span style={{ fontSize: '1.25rem' }}>3.</span> Flag/Sentinel Pattern
                                    </div>
                                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Use True/False to control when to stop</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.codeSection}>
                            <h3>Pattern 1: Counter</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>counter.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    count = <span className={styles.number}>0</span>{'\n'}
                                    <span className={styles.keyword}>while</span> count {'<'} <span className={styles.number}>3</span>:{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(f<span className={styles.string}>"Lap {'{'}count + 1{'}'}"</span>){'\n'}
                                    {'    '}count += <span className={styles.number}>1</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"Race finished!"</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>Lap 1{'\n'}Lap 2{'\n'}Lap 3{'\n'}Race finished!</div>
                            </div>
                        </div>

                        <div className={styles.codeSection}>
                            <h3>Pattern 2: Accumulator</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>accumulator.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    total = <span className={styles.number}>0</span>{'\n'}
                                    num = <span className={styles.number}>1</span>{'\n'}
                                    <span className={styles.keyword}>while</span> num {'<='} <span className={styles.number}>5</span>:{'\n'}
                                    {'    '}total += num  <span className={styles.comment}># Add num to total</span>{'\n'}
                                    {'    '}num += <span className={styles.number}>1</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(f<span className={styles.string}>"Sum of 1-5 is: {'{'}total{'}'}"</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>Sum of 1-5 is: 15</div>
                            </div>
                        </div>

                        <div className={styles.codeSection}>
                            <h3>Pattern 3: Flag</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>flag.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    racing = <span className={styles.keyword}>True</span>{'\n'}
                                    laps = <span className={styles.number}>0</span>{'\n'}
                                    <span className={styles.keyword}>while</span> racing:{'\n'}
                                    {'    '}laps += <span className={styles.number}>1</span>{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(f<span className={styles.string}>"Completed lap {'{'}laps{'}'}"</span>){'\n'}
                                    {'    '}<span className={styles.keyword}>if</span> laps {'>='} <span className={styles.number}>3</span>:{'\n'}
                                    {'        '}racing = <span className={styles.keyword}>False</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"Race over!"</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>Completed lap 1{'\n'}Completed lap 2{'\n'}Completed lap 3{'\n'}Race over!</div>
                            </div>
                        </div>

                        <div className={styles.codeSection}>
                            <h3>Your Turn: Build a Factorial Calculator!</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                Factorial means multiplying: 5! = 5 x 4 x 3 x 2 x 1 = 120
                                <br />Use an accumulator that <strong>multiplies</strong> instead of adds!
                            </p>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>factorial.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} placeholder={'# Build a factorial calculator!\n# Multiply 1 * 2 * 3 * 4 * 5\n\nresult = 1\nnum = 1\nwhile num <= 5:\n    result *= num  # Multiply!\n    num += 1\nprint(f"5! = {result}")'} spellCheck={false} style={{ minHeight: '180px' }} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode}><Play size={18} /> Run Code</button>
                            {output && <div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></div>}
                        </div>

                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Pro Tip:</p>
                                <p style={{ fontSize: '0.9rem' }}>
                                    For accumulation, start with <code>0</code> when adding, but start with <code>1</code> when multiplying! (Adding 0 does nothing, multiplying by 1 does nothing)
                                </p>
                            </div>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level2/lesson12" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection}>
                        <h2 className={styles.quizTitle}>Brain Check! ({quizStep + 1}/2)</h2>
                        {quizStep === 0 ? (
                            <>
                                <p className={styles.quizQuestion}>What is a <strong>counter variable</strong> used for?</p>
                                <div className={styles.quizOptions}>
                                    {['Tracking how many times the loop ran', 'Storing text', 'Making decisions'].map((option, idx) => (
                                        <button key={idx} onClick={() => !quizChecked && setQuizAnswer(idx)} className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''} ${quizChecked && idx === 0 ? styles.correct : ''} ${quizChecked && quizAnswer === idx && idx !== 0 ? styles.wrong : ''}`} disabled={quizChecked}>{option}</button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>What is an <strong>accumulator</strong>?</p>
                                <div className={styles.quizOptions}>
                                    {['A variable that builds up a total', 'A car part', 'A type of loop'].map((option, idx) => (
                                        <button key={idx} onClick={() => !quizChecked && setQuizAnswer(idx)} className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''} ${quizChecked && idx === 0 ? styles.correct : ''} ${quizChecked && quizAnswer === idx && idx !== 0 ? styles.wrong : ''}`} disabled={quizChecked}>{option}</button>
                                    ))}
                                </div>
                            </>
                        )}
                        {!quizChecked ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswer === null}>Check Answer</button>
                        ) : quizAnswer !== 0 ? (
                            <div className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                {quizStep === 0 ? (
                                    <p>A counter variable keeps track of how many times something has happened - like counting laps in a race!</p>
                                ) : (
                                    <p>An accumulator is a variable that collects or builds up a total - adding or multiplying values together!</p>
                                )}
                                <button className={styles.quizBtn} onClick={() => { setQuizChecked(false); setQuizAnswer(null); }} style={{ marginTop: '1rem' }}>Try Again</button>
                            </div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
