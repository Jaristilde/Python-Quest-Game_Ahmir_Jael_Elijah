'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL2_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL2_LESSONS[13]; // Lesson 14
const LESSON_ID = 29;

export default function Lesson14() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null, null]);
    const [quizChecked, setQuizChecked] = useState([false, false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);

    // Animation state for stepping through loop
    const [animationStep, setAnimationStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    // Stepping animation for the loop visualization
    const startAnimation = () => {
        setAnimationStep(0);
        setIsAnimating(true);
    };

    useEffect(() => {
        if (isAnimating && animationStep < 5) {
            const timer = setTimeout(() => {
                setAnimationStep(prev => prev + 1);
            }, 800);
            return () => clearTimeout(timer);
        } else if (animationStep >= 5) {
            setIsAnimating(false);
        }
    }, [isAnimating, animationStep]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            const variables: { [key: string]: string[] } = {};
            let outputLines: string[] = [];
            let i = 0;

            while (i < lines.length) {
                const line = lines[i].trim();
                if (!line || line.startsWith('#')) {
                    i++;
                    continue;
                }

                // List assignment: friends = ["Jael", "Ahmir"]
                const listMatch = line.match(/^(\w+)\s*=\s*\[(.+)\]$/);
                if (listMatch) {
                    const items = listMatch[2].match(/["']([^"']+)["']/g);
                    if (items) {
                        variables[listMatch[1]] = items.map(it => it.replace(/["']/g, ''));
                    }
                    i++;
                    continue;
                }

                // For loop with range(start, end): for num in range(10, 16):
                const rangeStartEndMatch = line.match(/^for\s+(\w+)\s+in\s+range\((\d+)\s*,\s*(\d+)\):$/);
                if (rangeStartEndMatch) {
                    const loopVar = rangeStartEndMatch[1];
                    const start = parseInt(rangeStartEndMatch[2]);
                    const end = parseInt(rangeStartEndMatch[3]);

                    if (i + 1 < lines.length) {
                        const bodyLine = lines[i + 1].trim();
                        // Handle print(variable)
                        const printVarMatch = bodyLine.match(/^print\s*\((\w+)\)$/);
                        if (printVarMatch && printVarMatch[1] === loopVar) {
                            for (let j = start; j < end; j++) {
                                outputLines.push(String(j));
                            }
                        }
                        // Handle f-string with loop variable
                        const fPrintMatch = bodyLine.match(/^print\s*\(f["'](.*)["']\)$/);
                        if (fPrintMatch) {
                            for (let j = start; j < end; j++) {
                                let result = fPrintMatch[1];
                                result = result.replace(new RegExp(`\\{${loopVar}\\}`, 'g'), String(j));
                                result = result.replace(new RegExp(`\\{${loopVar}\\s*\\+\\s*1\\}`, 'g'), String(j + 1));
                                outputLines.push(result);
                            }
                        }
                        // Handle simple string print
                        const simplePrintMatch = bodyLine.match(/^print\s*\(["'](.*)["']\)$/);
                        if (simplePrintMatch) {
                            for (let j = start; j < end; j++) {
                                outputLines.push(simplePrintMatch[1]);
                            }
                        }
                    }
                    i += 2;
                    continue;
                }

                // For loop with range(n): for i in range(5):
                const rangeMatch = line.match(/^for\s+(\w+)\s+in\s+range\((\d+)\):$/);
                if (rangeMatch) {
                    const loopVar = rangeMatch[1];
                    const count = parseInt(rangeMatch[2]);

                    if (i + 1 < lines.length) {
                        const bodyLine = lines[i + 1].trim();
                        // Handle simple string print
                        const printMatch = bodyLine.match(/^print\s*\(["'](.*)["']\)$/);
                        if (printMatch) {
                            for (let j = 0; j < count; j++) {
                                outputLines.push(printMatch[1]);
                            }
                        }
                        // Handle print(variable)
                        const printVarMatch = bodyLine.match(/^print\s*\((\w+)\)$/);
                        if (printVarMatch && printVarMatch[1] === loopVar) {
                            for (let j = 0; j < count; j++) {
                                outputLines.push(String(j));
                            }
                        }
                        // Handle f-string print
                        const fPrintMatch = bodyLine.match(/^print\s*\(f["'](.*)["']\)$/);
                        if (fPrintMatch) {
                            for (let j = 0; j < count; j++) {
                                let result = fPrintMatch[1];
                                result = result.replace(new RegExp(`\\{${loopVar}\\}`, 'g'), String(j));
                                result = result.replace(new RegExp(`\\{${loopVar}\\s*\\+\\s*1\\}`, 'g'), String(j + 1));
                                outputLines.push(result);
                            }
                        }
                    }
                    i += 2;
                    continue;
                }

                // For loop with list: for item in list:
                const listLoopMatch = line.match(/^for\s+(\w+)\s+in\s+(\w+):$/);
                if (listLoopMatch) {
                    const itemVar = listLoopMatch[1];
                    const listName = listLoopMatch[2];
                    const list = variables[listName];
                    if (list && i + 1 < lines.length) {
                        const bodyLine = lines[i + 1].trim();
                        // Handle f-string print
                        const fPrintMatch = bodyLine.match(/^print\s*\(f["'](.*)["']\)$/);
                        if (fPrintMatch) {
                            for (const item of list) {
                                let result = fPrintMatch[1];
                                result = result.replace(new RegExp(`\\{${itemVar}\\}`, 'g'), item);
                                outputLines.push(result);
                            }
                        }
                        // Handle regular print(item)
                        const printMatch = bodyLine.match(/^print\s*\((\w+)\)$/);
                        if (printMatch && printMatch[1] === itemVar) {
                            for (const item of list) {
                                outputLines.push(item);
                            }
                        }
                    }
                    i += 2;
                    continue;
                }

                i++;
            }
            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code!');
        } catch {
            setOutput('Error in code!');
        }
    };

    const quizQuestions = [
        {
            question: 'What does range(3) give you?',
            options: ['0, 1, 2', '1, 2, 3', '3, 3, 3'],
            correct: 0,
            explanation: 'range(3) gives you 0, 1, 2 - three numbers starting from 0!'
        },
        {
            question: 'What does range(2, 5) give you?',
            options: ['2, 3, 4', '2, 3, 4, 5', '1, 2, 3, 4, 5'],
            correct: 0,
            explanation: 'range(2, 5) starts at 2 and stops BEFORE 5, giving you 2, 3, 4!'
        },
        {
            question: 'How many times does `for i in range(4)` loop?',
            options: ['4 times', '3 times', '5 times'],
            correct: 0,
            explanation: 'range(4) creates 4 numbers (0, 1, 2, 3), so it loops 4 times!'
        }
    ];

    const checkQuiz = () => {
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = true;
        setQuizChecked(newChecked);

        if (quizAnswers[currentQuiz] === quizQuestions[currentQuiz].correct) {
            // If correct and last question, complete lesson
            if (currentQuiz === 2) {
                setTimeout(() => {
                    addXpAndCoins(LESSON.xpReward, 5);
                    completeLevel(LESSON_ID, LESSON.xpReward, 5, 1, 60);
                    setLessonComplete(true);
                }, 1000);
            }
        }
    };

    const nextQuiz = () => {
        if (currentQuiz < 2) {
            setCurrentQuiz(currentQuiz + 1);
        }
    };

    const retryQuiz = () => {
        const newChecked = [...quizChecked];
        const newAnswers = [...quizAnswers];
        newChecked[currentQuiz] = false;
        newAnswers[currentQuiz] = null;
        setQuizChecked(newChecked);
        setQuizAnswers(newAnswers);
    };

    if (isLoading || !user) return <div className={styles.container}><div className="flex items-center justify-center h-screen text-slate-400">Loading...</div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', duration: 0.8 }}
                    className={styles.successIcon}
                    style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}
                >
                    <Check size={50} className="text-white" />
                </motion.div>
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={styles.successTitle}
                >
                    For Loop Hero!
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={styles.successMessage}
                >
                    {LESSON.successMessage}
                </motion.p>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className={styles.successXp}
                >
                    <Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP
                </motion.div>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <Link href="/level2/lesson15" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link>
                </motion.div>
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
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            >
                                {LESSON.emoji}
                            </motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Story/Mission */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(16, 185, 129, 0.15))' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '2rem' }}>🤖</span>
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Mission: High-Five Party!</span>
                            </div>
                            <p>
                                Robo wants to high-five exactly 5 friends! With <code>for</code> loops, we can say &quot;do this EXACTLY this many times!&quot;
                            </p>
                        </motion.div>

                        {/* Main Explanation */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                How For Loops Work:
                            </h3>

                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '0.5rem' }}>
                                    <code style={{ fontSize: '1.1rem', color: '#60a5fa' }}>for</code> loops are for when you KNOW how many times to repeat
                                </div>

                                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '0.5rem' }}>
                                    <code style={{ fontSize: '1.1rem', color: '#34d399' }}>range(5)</code>
                                    <span style={{ marginLeft: '0.75rem' }}>creates numbers: 0, 1, 2, 3, 4 (that&apos;s 5 numbers!)</span>
                                </div>

                                <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '1rem', borderRadius: '0.5rem' }}>
                                    <code style={{ fontSize: '1.1rem', color: '#c084fc' }}>range(1, 6)</code>
                                    <span style={{ marginLeft: '0.75rem' }}>creates: 1, 2, 3, 4, 5 (start at 1, stop BEFORE 6)</span>
                                </div>

                                <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '1rem', borderRadius: '0.5rem' }}>
                                    The loop variable (<code style={{ color: '#fbbf24' }}>i</code>) changes each time!
                                </div>
                            </div>
                        </div>

                        {/* Interactive Animation */}
                        <div className={styles.codeSection}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <RefreshCw size={18} /> Watch the Loop Step by Step
                            </h3>
                            <div style={{
                                background: '#0d1117',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '0.75rem',
                                padding: '1.5rem',
                                marginBottom: '1rem'
                            }}>
                                <div style={{ fontFamily: 'monospace', fontSize: '1rem', marginBottom: '1rem' }}>
                                    <span style={{ color: '#ff79c6' }}>for</span> i <span style={{ color: '#ff79c6' }}>in</span> <span style={{ color: '#50fa7b' }}>range(5)</span>:
                                    <br />
                                    {'    '}<span style={{ color: '#ff79c6' }}>print</span>(<span style={{ color: '#f1fa8c' }}>f&quot;High five #{'{'}i + 1{'}'}!&quot;</span>)
                                </div>

                                <div style={{
                                    display: 'flex',
                                    gap: '0.5rem',
                                    flexWrap: 'wrap',
                                    marginTop: '1rem',
                                    marginBottom: '1rem'
                                }}>
                                    {[0, 1, 2, 3, 4].map((num) => (
                                        <motion.div
                                            key={num}
                                            initial={{ scale: 0.8, opacity: 0.5 }}
                                            animate={{
                                                scale: animationStep > num ? 1.1 : 0.8,
                                                opacity: animationStep > num ? 1 : 0.5,
                                                backgroundColor: animationStep > num ? '#10b981' : '#1e293b'
                                            }}
                                            transition={{ duration: 0.3 }}
                                            style={{
                                                width: '60px',
                                                height: '60px',
                                                borderRadius: '0.5rem',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: animationStep === num + 1 ? '2px solid #fbbf24' : '2px solid transparent',
                                                color: 'white'
                                            }}
                                        >
                                            <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>i = {num}</span>
                                            <span style={{ fontSize: '1.2rem' }}>#{num + 1}</span>
                                        </motion.div>
                                    ))}
                                </div>

                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={animationStep}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        style={{
                                            background: 'rgba(80, 250, 123, 0.1)',
                                            padding: '0.75rem',
                                            borderRadius: '0.5rem',
                                            fontFamily: 'monospace',
                                            color: '#50fa7b',
                                            minHeight: '40px'
                                        }}
                                    >
                                        {animationStep === 0 && 'Click "Run Animation" to start!'}
                                        {animationStep > 0 && animationStep <= 5 && (
                                            <>High five #{animationStep}!</>
                                        )}
                                    </motion.div>
                                </AnimatePresence>

                                <button
                                    onClick={startAnimation}
                                    disabled={isAnimating}
                                    style={{
                                        marginTop: '1rem',
                                        padding: '0.75rem 1.5rem',
                                        background: isAnimating ? '#4b5563' : '#6366f1',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        fontWeight: 600,
                                        cursor: isAnimating ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <RefreshCw size={16} className={isAnimating ? 'animate-spin' : ''} />
                                    {isAnimating ? 'Running...' : 'Run Animation'}
                                </button>
                            </div>
                        </div>

                        {/* Code Example 1 */}
                        <div className={styles.codeSection}>
                            <h3>Example 1: Print 5 Times</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>main.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># Print &quot;High five!&quot; 5 times</span>{'\n'}
                                    <span className={styles.keyword}>for</span> i <span className={styles.keyword}>in</span> range(<span className={styles.number}>5</span>):{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(f<span className={styles.string}>&quot;High five #{'{'}i + 1{'}'}!&quot;</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>High five #1!{'\n'}High five #2!{'\n'}High five #3!{'\n'}High five #4!{'\n'}High five #5!</div>
                            </div>
                        </div>

                        {/* Code Example 2 */}
                        <div className={styles.codeSection}>
                            <h3>Example 2: Range with Start</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>main.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># Count from 1 to 5</span>{'\n'}
                                    <span className={styles.keyword}>for</span> num <span className={styles.keyword}>in</span> range(<span className={styles.number}>1</span>, <span className={styles.number}>6</span>):{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(num)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>1{'\n'}2{'\n'}3{'\n'}4{'\n'}5</div>
                            </div>
                        </div>

                        {/* Code Example 3 */}
                        <div className={styles.codeSection}>
                            <h3>Example 3: Loop Through a List</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>main.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    friends = [<span className={styles.string}>&quot;Jael&quot;</span>, <span className={styles.string}>&quot;Ahmir&quot;</span>, <span className={styles.string}>&quot;Elijah&quot;</span>]{'\n'}
                                    <span className={styles.keyword}>for</span> friend <span className={styles.keyword}>in</span> friends:{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(f<span className={styles.string}>&quot;Hi, {'{'}friend{'}'}!&quot;</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>Hi, Jael!{'\n'}Hi, Ahmir!{'\n'}Hi, Elijah!</div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3>Your Turn!</h3>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder={'# Try these:\n\n# Print numbers 10 to 15\nfor num in range(10, 16):\n    print(num)\n\n# Or loop through foods!\nfoods = ["Pizza", "Tacos", "Ice Cream"]\nfor food in foods:\n    print(f"I love {food}!")'}
                                    spellCheck={false}
                                    style={{ minHeight: '180px' }}
                                />
                            </div>
                            <button className={styles.runBtn} onClick={runCode}><Play size={18} /> Run Code</button>
                            {output && <div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></div>}
                        </div>

                        {/* Challenges */}
                        <div className={styles.challenges}>
                            <h3>Now You Try:</h3>
                            <ul className={styles.challengeList}>
                                <li><div className={styles.challengeCheck}></div>Print numbers 10 to 15 using for and range</li>
                                <li><div className={styles.challengeCheck}></div>Loop through a list of your favorite foods</li>
                            </ul>
                        </div>

                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Remember:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li><code>range(5)</code> gives 0, 1, 2, 3, 4 (starts at 0!)</li>
                                    <li><code>range(1, 6)</code> gives 1, 2, 3, 4, 5 (stops BEFORE 6!)</li>
                                    <li>The code inside the loop MUST be indented!</li>
                                </ul>
                            </div>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level2/lesson13" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection}>
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ fontSize: '3rem', marginBottom: '1rem' }}
                        >
                            🧠
                        </motion.div>
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
                                    <code>{option}</code>
                                </button>
                            ))}
                        </div>

                        {!quizChecked[currentQuiz] ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswers[currentQuiz] === null}>Check Answer</button>
                        ) : quizAnswers[currentQuiz] !== quizQuestions[currentQuiz].correct ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.quizFeedback} ${styles.error}`}
                            >
                                <h4>Not quite!</h4>
                                <p>{quizQuestions[currentQuiz].explanation}</p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem' }}>Try Again</button>
                            </motion.div>
                        ) : currentQuiz < 2 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.quizFeedback} ${styles.success}`}
                            >
                                <h4>Correct!</h4>
                                <p>{quizQuestions[currentQuiz].explanation}</p>
                                <button className={styles.quizBtn} onClick={nextQuiz} style={{ marginTop: '1rem' }}>Next Question <ChevronRight size={16} /></button>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
