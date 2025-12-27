'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, StopCircle, SkipForward } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL2_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL2_LESSONS[15]; // Lesson 16
const LESSON_ID = 31;

export default function Lesson16() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizStep, setQuizStep] = useState(1);
    const [quizAnswer1, setQuizAnswer1] = useState<number | null>(null);
    const [quizAnswer2, setQuizAnswer2] = useState<number | null>(null);
    const [quiz1Checked, setQuiz1Checked] = useState(false);
    const [quiz2Checked, setQuiz2Checked] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);

    // Visual demo state
    const [demoRunning, setDemoRunning] = useState(false);
    const [demoType, setDemoType] = useState<'break' | 'continue' | null>(null);
    const [currentNum, setCurrentNum] = useState(0);
    const [demoOutput, setDemoOutput] = useState<string[]>([]);
    const [demoComplete, setDemoComplete] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    // Visual demo animation
    useEffect(() => {
        if (!demoRunning || !demoType) return;

        const runDemo = async () => {
            setDemoOutput([]);
            setDemoComplete(false);

            if (demoType === 'break') {
                // Break demo: stop at 5
                for (let i = 1; i <= 10; i++) {
                    setCurrentNum(i);
                    await new Promise(r => setTimeout(r, 600));
                    if (i === 5) {
                        setDemoOutput(prev => [...prev, `${i} - Found it! STOP!`]);
                        break;
                    }
                    setDemoOutput(prev => [...prev, `${i}`]);
                }
            } else {
                // Continue demo: skip even numbers
                for (let i = 1; i <= 6; i++) {
                    setCurrentNum(i);
                    await new Promise(r => setTimeout(r, 600));
                    if (i % 2 === 0) {
                        setDemoOutput(prev => [...prev, `${i} - Skip!`]);
                        continue;
                    }
                    setDemoOutput(prev => [...prev, `${i}`]);
                }
            }
            setDemoComplete(true);
            setDemoRunning(false);
        };

        runDemo();
    }, [demoRunning, demoType]);

    const startDemo = (type: 'break' | 'continue') => {
        setDemoType(type);
        setDemoRunning(true);
        setCurrentNum(0);
        setDemoOutput([]);
        setDemoComplete(false);
    };

    const runCode = () => {
        const lines = code.trim().split('\n');
        let outputLines: string[] = [];
        let i = 0;

        while (i < lines.length) {
            const line = lines[i].trim();

            // For loop with range: for num in range(1, 11):
            const rangeMatch = line.match(/^for\s+(\w+)\s+in\s+range\((\d+),\s*(\d+)\):$/);
            if (rangeMatch) {
                const varName = rangeMatch[1];
                const start = parseInt(rangeMatch[2]);
                const end = parseInt(rangeMatch[3]);

                // Collect loop body
                let bodyLines: string[] = [];
                let j = i + 1;
                while (j < lines.length && (lines[j].startsWith('    ') || lines[j].startsWith('\t'))) {
                    bodyLines.push(lines[j].trim());
                    j++;
                }

                // Execute loop with break/continue support
                for (let num = start; num < end; num++) {
                    let shouldBreak = false;
                    let shouldContinue = false;

                    for (const bodyLine of bodyLines) {
                        // Check for if num == X: break
                        const breakIfMatch = bodyLine.match(/^if\s+\w+\s*==\s*(\d+):$/);
                        if (breakIfMatch && num === parseInt(breakIfMatch[1])) {
                            // Check next line for break
                            const nextIdx = bodyLines.indexOf(bodyLine) + 1;
                            if (nextIdx < bodyLines.length && bodyLines[nextIdx] === 'break') {
                                outputLines.push(`Found ${num}! Stopping!`);
                                shouldBreak = true;
                                break;
                            }
                        }

                        // Check for if num % 2 == 0: continue
                        const continueIfMatch = bodyLine.match(/^if\s+\w+\s*%\s*2\s*==\s*0:$/);
                        if (continueIfMatch && num % 2 === 0) {
                            // Check next line for continue
                            const nextIdx = bodyLines.indexOf(bodyLine) + 1;
                            if (nextIdx < bodyLines.length && bodyLines[nextIdx] === 'continue') {
                                shouldContinue = true;
                                break;
                            }
                        }

                        // Print statement
                        const printVarMatch = bodyLine.match(/^print\((\w+)\)$/);
                        if (printVarMatch && printVarMatch[1] === varName && !shouldContinue) {
                            outputLines.push(`${num}`);
                        }

                        const printStrMatch = bodyLine.match(/^print\(["'](.*)["']\)$/);
                        if (printStrMatch && !shouldContinue) {
                            outputLines.push(printStrMatch[1]);
                        }
                    }

                    if (shouldBreak) break;
                }

                i = j;
                continue;
            }

            i++;
        }

        if (outputLines.length > 0) {
            setOutput(outputLines.join('\n'));
        } else {
            setOutput('Try writing a loop with break or continue!\n\nExample:\nfor num in range(1, 11):\n    if num == 7:\n        break\n    print(num)');
        }
    };

    const checkQuiz1 = () => {
        setQuiz1Checked(true);
        if (quizAnswer1 === 0) {
            setTimeout(() => setQuizStep(2), 1000);
        }
    };

    const checkQuiz2 = () => {
        setQuiz2Checked(true);
        if (quizAnswer2 === 0) {
            setTimeout(() => {
                addXpAndCoins(LESSON.xpReward, 5);
                completeLevel(LESSON_ID, LESSON.xpReward, 5, 1, 60);
                setLessonComplete(true);
            }, 1000);
        }
    };

    if (isLoading || !user) return <div className={styles.container}><div className="flex items-center justify-center h-screen text-slate-400">Loading...</div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}><Check size={50} className="text-white" /></motion.div>
                <h2 className={styles.successTitle}>Loop Commander!</h2>
                <p className={styles.successMessage}>{LESSON.successMessage}</p>
                <div className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</div>
                <Link href="/level2/lesson17" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link>
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
                            <motion.div className={styles.lessonEmoji} animate={{ x: [0, 10, 0] }} transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1.5 }}>{LESSON.emoji}</motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(249, 115, 22, 0.15))' }}>
                            <p>Robo is collecting coins but should skip the fake ones and stop when finding the treasure!</p>
                            <p style={{ marginTop: '0.75rem' }}>Two special commands control your loops: <strong>break</strong> and <strong>continue</strong></p>
                        </motion.div>

                        {/* Visual Comparison */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Break vs Continue</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '0.75rem', border: '2px solid rgba(239, 68, 68, 0.5)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                        <StopCircle size={24} style={{ color: '#ef4444' }} />
                                        <strong style={{ color: '#ef4444' }}>break</strong>
                                    </div>
                                    <p style={{ fontSize: '0.9rem' }}>"STOP the loop completely right now!"</p>
                                    <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>Like finding a treasure chest - game over, stop searching!</p>
                                </div>
                                <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '0.75rem', border: '2px solid rgba(59, 130, 246, 0.5)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                        <SkipForward size={24} style={{ color: '#3b82f6' }} />
                                        <strong style={{ color: '#3b82f6' }}>continue</strong>
                                    </div>
                                    <p style={{ fontSize: '0.9rem' }}>"Skip the rest of this round, go to the next one"</p>
                                    <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>Like stepping on a banana peel - skip this turn, keep going!</p>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Demo */}
                        <div className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))' }}>
                            <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Watch It Work!</h3>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <button
                                    onClick={() => startDemo('break')}
                                    disabled={demoRunning}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '0.5rem',
                                        background: demoType === 'break' ? '#ef4444' : 'rgba(239, 68, 68, 0.3)',
                                        color: 'white',
                                        border: '2px solid #ef4444',
                                        cursor: demoRunning ? 'not-allowed' : 'pointer',
                                        opacity: demoRunning ? 0.6 : 1
                                    }}
                                >
                                    <StopCircle size={16} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />
                                    Demo break
                                </button>
                                <button
                                    onClick={() => startDemo('continue')}
                                    disabled={demoRunning}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '0.5rem',
                                        background: demoType === 'continue' ? '#3b82f6' : 'rgba(59, 130, 246, 0.3)',
                                        color: 'white',
                                        border: '2px solid #3b82f6',
                                        cursor: demoRunning ? 'not-allowed' : 'pointer',
                                        opacity: demoRunning ? 0.6 : 1
                                    }}
                                >
                                    <SkipForward size={16} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />
                                    Demo continue
                                </button>
                            </div>

                            {/* Loop visualization */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                {(demoType === 'break' ? [1,2,3,4,5,6,7,8,9,10] : [1,2,3,4,5,6]).map(num => (
                                    <motion.div
                                        key={num}
                                        animate={{
                                            scale: currentNum === num ? 1.3 : 1,
                                            backgroundColor: currentNum === num
                                                ? (demoType === 'break' && num === 5 ? '#ef4444' : demoType === 'continue' && num % 2 === 0 ? '#3b82f6' : '#8b5cf6')
                                                : 'rgba(255,255,255,0.1)'
                                        }}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            border: '2px solid rgba(255,255,255,0.2)'
                                        }}
                                    >
                                        {num}
                                    </motion.div>
                                ))}
                            </div>

                            {/* Demo output */}
                            {demoOutput.length > 0 && (
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                    <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Output:</div>
                                    {demoOutput.map((line, idx) => (
                                        <div key={idx} style={{ color: line.includes('STOP') ? '#ef4444' : line.includes('Skip') ? '#3b82f6' : '#4ade80' }}>
                                            {line}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {demoComplete && (
                                <p style={{ textAlign: 'center', marginTop: '0.75rem', color: '#4ade80', fontWeight: 'bold' }}>
                                    {demoType === 'break' ? 'Loop stopped at 5!' : 'Skipped all even numbers!'}
                                </p>
                            )}
                        </div>

                        {/* Code Example - break */}
                        <div className={styles.codeSection}>
                            <h3>Example 1: Using break</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>break_example.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    <span className={styles.keyword}>for</span> num <span className={styles.keyword}>in</span> range(<span className={styles.number}>1</span>, <span className={styles.number}>10</span>):{'\n'}
                                    {'    '}<span className={styles.keyword}>if</span> num == <span className={styles.number}>5</span>:{'\n'}
                                    {'        '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"Found it! Stopping!"</span>){'\n'}
                                    {'        '}<span className={styles.keyword}>break</span>{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(num)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>1{'\n'}2{'\n'}3{'\n'}4{'\n'}Found it! Stopping!</div>
                            </div>
                        </div>

                        {/* Code Example - continue */}
                        <div className={styles.codeSection}>
                            <h3>Example 2: Using continue</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>continue_example.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    <span className={styles.keyword}>for</span> num <span className={styles.keyword}>in</span> range(<span className={styles.number}>1</span>, <span className={styles.number}>6</span>):{'\n'}
                                    {'    '}<span className={styles.keyword}>if</span> num == <span className={styles.number}>3</span>:{'\n'}
                                    {'        '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"Skip 3!"</span>){'\n'}
                                    {'        '}<span className={styles.keyword}>continue</span>{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(num)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>1{'\n'}2{'\n'}Skip 3!{'\n'}4{'\n'}5</div>
                            </div>
                        </div>

                        {/* Your Turn */}
                        <div className={styles.codeSection}>
                            <h3>Your Turn!</h3>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder={'# Try these challenges:\n\n# 1. Loop 1-10, break when you find 7\nfor num in range(1, 11):\n    if num == 7:\n        break\n    print(num)\n\n# 2. Loop 1-10, skip all even numbers\n# (Hint: use num % 2 == 0)'}
                                    spellCheck={false}
                                    style={{ minHeight: '180px' }}
                                />
                            </div>
                            <button className={styles.runBtn} onClick={runCode}><Play size={18} /> Run Code</button>
                            {output && <div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></div>}
                        </div>

                        <div className={styles.challenges}>
                            <h3>Challenges:</h3>
                            <ul className={styles.challengeList}>
                                <li><div className={styles.challengeCheck}></div>Loop 1-10, break when you find 7</li>
                                <li><div className={styles.challengeCheck}></div>Loop 1-10, skip all even numbers (use num % 2 == 0)</li>
                            </ul>
                        </div>

                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Pro Tip:</p>
                                <p style={{ fontSize: '0.9rem' }}>Use <code>break</code> when searching for something - once you find it, stop looking! Use <code>continue</code> when you want to skip certain items but keep checking the rest.</p>
                            </div>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level2/lesson15" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection}>
                        {quizStep === 1 ? (
                            <>
                                <h2 className={styles.quizTitle}>Brain Check 1/2</h2>
                                <p className={styles.quizQuestion}>What does <code>break</code> do?</p>
                                <div className={styles.quizOptions}>
                                    {['Stops the loop completely', 'Skips to next iteration', 'Pauses the loop'].map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => !quiz1Checked && setQuizAnswer1(idx)}
                                            className={`${styles.quizOption} ${quizAnswer1 === idx ? styles.selected : ''} ${quiz1Checked && idx === 0 ? styles.correct : ''} ${quiz1Checked && quizAnswer1 === idx && idx !== 0 ? styles.wrong : ''}`}
                                            disabled={quiz1Checked}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                                {!quiz1Checked ? (
                                    <button className={styles.quizBtn} onClick={checkQuiz1} disabled={quizAnswer1 === null}>Check Answer</button>
                                ) : quizAnswer1 !== 0 ? (
                                    <div className={`${styles.quizFeedback} ${styles.error}`}>
                                        <h4>Not quite!</h4>
                                        <p><code>break</code> completely stops the loop - like hitting an emergency stop button!</p>
                                        <button className={styles.quizBtn} onClick={() => { setQuiz1Checked(false); setQuizAnswer1(null); }} style={{ marginTop: '1rem' }}>Try Again</button>
                                    </div>
                                ) : (
                                    <div className={`${styles.quizFeedback} ${styles.success}`}>
                                        <h4>Correct!</h4>
                                        <p>Moving to the next question...</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <h2 className={styles.quizTitle}>Brain Check 2/2</h2>
                                <p className={styles.quizQuestion}>What does <code>continue</code> do?</p>
                                <div className={styles.quizOptions}>
                                    {['Skips to next iteration', 'Stops the loop', 'Does nothing'].map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => !quiz2Checked && setQuizAnswer2(idx)}
                                            className={`${styles.quizOption} ${quizAnswer2 === idx ? styles.selected : ''} ${quiz2Checked && idx === 0 ? styles.correct : ''} ${quiz2Checked && quizAnswer2 === idx && idx !== 0 ? styles.wrong : ''}`}
                                            disabled={quiz2Checked}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                                {!quiz2Checked ? (
                                    <button className={styles.quizBtn} onClick={checkQuiz2} disabled={quizAnswer2 === null}>Check Answer</button>
                                ) : quizAnswer2 !== 0 ? (
                                    <div className={`${styles.quizFeedback} ${styles.error}`}>
                                        <h4>Not quite!</h4>
                                        <p><code>continue</code> skips the rest of the current loop round and moves to the next one!</p>
                                        <button className={styles.quizBtn} onClick={() => { setQuiz2Checked(false); setQuizAnswer2(null); }} style={{ marginTop: '1rem' }}>Try Again</button>
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
