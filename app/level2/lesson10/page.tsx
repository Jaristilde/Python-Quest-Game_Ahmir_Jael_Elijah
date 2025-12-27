'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, RefreshCw, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL2_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL2_LESSONS[9]; // Lesson 10
const LESSON_ID = 25;

export default function Lesson10() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizStep, setQuizStep] = useState(1);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizChecked, setQuizChecked] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [robotRotation, setRobotRotation] = useState(0);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    // Robot running in circles animation
    useEffect(() => {
        const interval = setInterval(() => {
            setRobotRotation(prev => prev + 15);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            let variables: { [key: string]: number } = {};
            let maxIterations = 50;
            let iterations = 0;

            let i = 0;
            while (i < lines.length) {
                const line = lines[i].trim();

                // Variable assignment: countdown = 5
                const varMatch = line.match(/^(\w+)\s*=\s*(\d+)$/);
                if (varMatch) {
                    variables[varMatch[1]] = parseInt(varMatch[2]);
                    i++;
                    continue;
                }

                // While loop: while countdown > 0:
                const whileMatch = line.match(/^while\s+(\w+)\s*(>|<|>=|<=|==|!=)\s*(\d+)\s*:$/);
                if (whileMatch) {
                    const varName = whileMatch[1];
                    const operator = whileMatch[2];
                    const compareValue = parseInt(whileMatch[3]);

                    // Collect body lines
                    let bodyLines: string[] = [];
                    let j = i + 1;
                    while (j < lines.length) {
                        const bodyLine = lines[j];
                        if (!bodyLine.startsWith('    ') && !bodyLine.startsWith('\t') && bodyLine.trim()) break;
                        if (bodyLine.trim()) bodyLines.push(bodyLine.trim());
                        j++;
                    }

                    // Execute while loop
                    const checkCondition = (val: number): boolean => {
                        switch (operator) {
                            case '>': return val > compareValue;
                            case '<': return val < compareValue;
                            case '>=': return val >= compareValue;
                            case '<=': return val <= compareValue;
                            case '==': return val === compareValue;
                            case '!=': return val !== compareValue;
                            default: return false;
                        }
                    };

                    while (checkCondition(variables[varName] ?? 0) && iterations < maxIterations) {
                        iterations++;

                        for (const bodyLine of bodyLines) {
                            // Print statement with variable
                            const printVarMatch = bodyLine.match(/^print\s*\(\s*(\w+)\s*\)$/);
                            if (printVarMatch) {
                                const printVar = printVarMatch[1];
                                if (variables[printVar] !== undefined) {
                                    outputLines.push(String(variables[printVar]));
                                } else {
                                    outputLines.push(printVar);
                                }
                            }

                            // Print statement with string
                            const printStrMatch = bodyLine.match(/^print\s*\(\s*["'](.*)["']\s*\)$/);
                            if (printStrMatch) {
                                outputLines.push(printStrMatch[1]);
                            }

                            // Print with f-string
                            const printFMatch = bodyLine.match(/^print\s*\(\s*f["'](.*)["']\s*\)$/);
                            if (printFMatch) {
                                let result = printFMatch[1];
                                for (const [vName, vValue] of Object.entries(variables)) {
                                    result = result.replace(new RegExp(`\\{${vName}\\}`, 'g'), String(vValue));
                                }
                                outputLines.push(result);
                            }

                            // Increment: count += 1 or count = count + 1
                            const incMatch = bodyLine.match(/^(\w+)\s*\+=\s*(\d+)$/);
                            if (incMatch) {
                                variables[incMatch[1]] = (variables[incMatch[1]] ?? 0) + parseInt(incMatch[2]);
                            }

                            // Decrement: countdown -= 1
                            const decMatch = bodyLine.match(/^(\w+)\s*-=\s*(\d+)$/);
                            if (decMatch) {
                                variables[decMatch[1]] = (variables[decMatch[1]] ?? 0) - parseInt(decMatch[2]);
                            }
                        }
                    }

                    if (iterations >= maxIterations) {
                        outputLines.push('... (loop stopped - too many iterations!)');
                    }

                    i = j;
                    continue;
                }

                // Simple print outside loop
                const printMatch = line.match(/^print\s*\(\s*["'](.*)["']\s*\)$/);
                if (printMatch) {
                    outputLines.push(printMatch[1]);
                }

                i++;
            }

            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Try the countdown code!');
        } catch {
            setOutput('Error in code!');
        }
    };

    const checkQuiz = () => {
        setQuizChecked(true);
        if (quizStep === 1) {
            if (quizAnswer === 0) {
                setTimeout(() => {
                    setQuizStep(2);
                    setQuizAnswer(null);
                    setQuizChecked(false);
                }, 1000);
            }
        } else if (quizStep === 2) {
            if (quizAnswer === 0) {
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
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon}>
                    <Check size={50} className="text-white" />
                </motion.div>
                <h2 className={styles.successTitle}>{LESSON.successMessage}</h2>
                <p className={styles.successMessage}>You've mastered while loops - repeat until done!</p>
                <div className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</div>
                <Link href="/level2/lesson11" className={`${styles.navBtn} ${styles.primary}`}>
                    Next Lesson <ChevronRight size={18} />
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
                        <div className={styles.lessonTitle}>
                            <motion.div
                                className={styles.lessonEmoji}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                                {LESSON.emoji}
                            </motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.15))' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                {/* Robot running in circles animation */}
                                <div style={{
                                    position: 'relative',
                                    width: '80px',
                                    height: '80px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {/* Circle track */}
                                    <div style={{
                                        position: 'absolute',
                                        width: '70px',
                                        height: '70px',
                                        border: '3px dashed rgba(59, 130, 246, 0.4)',
                                        borderRadius: '50%'
                                    }} />
                                    {/* Robot running around */}
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                        style={{
                                            position: 'absolute',
                                            width: '70px',
                                            height: '70px'
                                        }}
                                    >
                                        <span style={{
                                            position: 'absolute',
                                            top: '-8px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            fontSize: '1.5rem'
                                        }}>
                                            <motion.span
                                                animate={{ scaleX: [1, -1, 1] }}
                                                transition={{ duration: 0.5, repeat: Infinity }}
                                            >
                                                BOT
                                            </motion.span>
                                        </span>
                                    </motion.div>
                                    {/* Center countdown */}
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        style={{
                                            fontSize: '1.5rem',
                                            fontWeight: 'bold',
                                            color: '#3b82f6'
                                        }}
                                    >
                                        5...
                                    </motion.div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
                                        <RefreshCw size={20} className="text-blue-400" />
                                        Robo's Rocket Launch!
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>5... 4... 3... 2... 1... BLAST OFF!</p>
                                </div>
                            </div>
                            <p><code>while</code> = "keep doing this <strong>AS LONG AS</strong> the condition is True"</p>
                            <p style={{ marginTop: '0.5rem' }}>Like a song on repeat - it keeps playing until you stop it!</p>
                        </motion.div>

                        <div className={styles.explainBox} style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <AlertTriangle size={20} className="text-amber-400" />
                                <h3 style={{ color: '#f59e0b' }}>IMPORTANT!</h3>
                            </div>
                            <p>Something <strong>must change</strong> inside the loop, or it runs <strong>FOREVER</strong>!</p>
                            <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>The loop checks the condition BEFORE each run.</p>
                        </div>

                        <div className={styles.codeSection}>
                            <h3>Countdown Example</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>main.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    countdown = <span className={styles.number}>5</span>{'\n\n'}
                                    <span className={styles.keyword}>while</span> countdown {'>'} <span className={styles.number}>0</span>:{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(countdown){'\n'}
                                    {'    '}countdown -= <span className={styles.number}>1</span>{'\n\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"BLAST OFF!"</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>5{'\n'}4{'\n'}3{'\n'}2{'\n'}1{'\n'}BLAST OFF!</div>
                            </div>
                        </div>

                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem' }}>How It Works Step by Step:</h3>
                            <div style={{
                                background: 'rgba(0,0,0,0.3)',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                fontFamily: 'monospace',
                                fontSize: '0.9rem',
                                lineHeight: 1.8
                            }}>
                                <div><span style={{ color: '#10b981' }}>1.</span> Check: Is countdown {'>'} 0? <span style={{ color: '#10b981' }}>Yes (5 {'>'} 0)</span></div>
                                <div><span style={{ color: '#10b981' }}>2.</span> Print 5, then subtract 1 (now 4)</div>
                                <div><span style={{ color: '#10b981' }}>3.</span> Check again: Is 4 {'>'} 0? <span style={{ color: '#10b981' }}>Yes</span></div>
                                <div><span style={{ color: '#10b981' }}>4.</span> Keep going until countdown = 0</div>
                                <div><span style={{ color: '#f59e0b' }}>5.</span> Check: Is 0 {'>'} 0? <span style={{ color: '#ef4444' }}>No! Exit loop</span></div>
                                <div><span style={{ color: '#3b82f6' }}>6.</span> Print "BLAST OFF!"</div>
                            </div>
                        </div>

                        <div className={styles.codeSection}>
                            <h3>Your Turn!</h3>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder={'countdown = 5\n\nwhile countdown > 0:\n    print(countdown)\n    countdown -= 1\n\nprint("BLAST OFF!")'}
                                    spellCheck={false}
                                    style={{ minHeight: '180px' }}
                                />
                            </div>
                            <button className={styles.runBtn} onClick={runCode}><Play size={18} /> Run Code</button>
                            {output && <div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></div>}
                        </div>

                        <div className={styles.challenges}>
                            <h3>Try These!</h3>
                            <ul className={styles.challengeList}>
                                <li><div className={styles.challengeCheck}></div>Change countdown to 10</li>
                                <li><div className={styles.challengeCheck}></div>Try counting UP instead of down (hint: use {'<'} and +=)</li>
                            </ul>
                        </div>

                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <p><strong>Pro Tip:</strong> Always make sure your condition will eventually become False, or your loop will run forever!</p>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level2/lesson9" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection}>
                        <h2 className={styles.quizTitle}>Brain Check! ({quizStep}/2)</h2>

                        {quizStep === 1 ? (
                            <>
                                <p className={styles.quizQuestion}>When does a while loop stop?</p>
                                <div className={styles.quizOptions}>
                                    {['When condition becomes False', 'After 10 times', 'Never'].map((option, idx) => (
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
                                <p className={styles.quizQuestion}>What happens if the condition is always True?</p>
                                <div className={styles.quizOptions}>
                                    {['Loops forever!', 'Runs once', 'Error'].map((option, idx) => (
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
                        )}

                        {!quizChecked ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswer === null}>Check Answer</button>
                        ) : (quizStep === 1 && quizAnswer !== 0) || (quizStep === 2 && quizAnswer !== 0) ? (
                            <div className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>
                                    {quizStep === 1
                                        ? "A while loop stops when its condition becomes False!"
                                        : "If the condition is always True, the loop never stops - it runs forever!"}
                                </p>
                                <button className={styles.quizBtn} onClick={() => { setQuizChecked(false); setQuizAnswer(null); }} style={{ marginTop: '1rem' }}>Try Again</button>
                            </div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
