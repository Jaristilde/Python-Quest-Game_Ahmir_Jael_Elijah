'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Package, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL6_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL6_LESSONS[0]; // Lesson 1
const LESSON_ID = 76; // Level 6 lessons start at 76

export default function Lesson1() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('# Try importing a module!\nimport math\nprint(math.pi)\n');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasImportedModule, setHasImportedModule] = useState(false);
    const [hasUsedModuleFunction, setHasUsedModuleFunction] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            let importedModules: string[] = [];

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || trimmed === '') continue;

                // Import statement
                const importMatch = trimmed.match(/^import\s+(\w+)$/);
                if (importMatch) {
                    importedModules.push(importMatch[1]);
                    setHasImportedModule(true);
                    continue;
                }

                // math.pi
                if (trimmed.includes('math.pi') && importedModules.includes('math')) {
                    const printMatch = trimmed.match(/^print\s*\(\s*math\.pi\s*\)$/);
                    if (printMatch) {
                        outputLines.push('3.141592653589793');
                        setHasUsedModuleFunction(true);
                    }
                    continue;
                }

                // math.sqrt()
                const sqrtMatch = trimmed.match(/^print\s*\(\s*math\.sqrt\s*\(\s*(\d+)\s*\)\s*\)$/);
                if (sqrtMatch && importedModules.includes('math')) {
                    const num = parseFloat(sqrtMatch[1]);
                    outputLines.push(String(Math.sqrt(num)));
                    setHasUsedModuleFunction(true);
                    continue;
                }

                // random.randint()
                const randintMatch = trimmed.match(/^print\s*\(\s*random\.randint\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)\s*\)$/);
                if (randintMatch && importedModules.includes('random')) {
                    const min = parseInt(randintMatch[1]);
                    const max = parseInt(randintMatch[2]);
                    outputLines.push(String(Math.floor(Math.random() * (max - min + 1)) + min));
                    setHasUsedModuleFunction(true);
                    continue;
                }

                // Regular print
                const printMatch = trimmed.match(/^print\s*\(["'](.*)["']\)$/);
                if (printMatch) {
                    outputLines.push(printMatch[1]);
                    continue;
                }
            }

            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code to see output!');
        } catch {
            setOutput('Error! Check your code syntax.');
        }
    };

    const checkQuiz = () => {
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = true;
        setQuizChecked(newChecked);

        // Correct answers: Q1 = 1 (toolbox), Q2 = 0 (import)
        const correctAnswers = [1, 0];

        if (quizAnswers[currentQuiz] === correctAnswers[currentQuiz]) {
            if (currentQuiz === 0) {
                setTimeout(() => setCurrentQuiz(1), 1000);
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
        const newAnswers = [...quizAnswers];
        newAnswers[currentQuiz] = null;
        setQuizAnswers(newAnswers);
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = false;
        setQuizChecked(newChecked);
    };

    if (isLoading || !user) {
        return (
            <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
                <div className="flex items-center justify-center h-screen">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ fontSize: '3rem' }}>📦</motion.div>
                </div>
            </div>
        );
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'rgba(0, 0, 0, 0.95)' }}>
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', duration: 0.8 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                    <Check size={50} className="text-white" />
                </motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle} style={{ color: '#3b82f6' }}>
                    Module Explorer! {LESSON.emoji}
                </motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>
                    {LESSON.successMessage}
                </motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className={styles.successXp}>
                    <Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                    <Link href="/level6/lesson2" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                        Next Lesson <ChevronRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
            <header className={styles.header} style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid #3b82f6' }}>
                <Link href="/level6" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 9</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                {!showQuiz ? (
                    <>
                        {/* Lesson Title */}
                        <div className={styles.lessonTitle}>
                            <motion.div className={styles.lessonEmoji} animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))' }}>
                                {LESSON.emoji}
                            </motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1 style={{ color: '#3b82f6' }}>{LESSON.title}</h1>
                                <p>Learn: <code style={{ color: '#8b5cf6' }}>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Story Introduction */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))', borderColor: '#3b82f6' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Package size={28} style={{ color: '#3b82f6' }} />
                                <Sparkles size={24} style={{ color: '#8b5cf6' }} />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#3b82f6' }}>Welcome to the world of MODULES!</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '0.75rem', marginBottom: '1rem' }}>
                                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '3rem', marginRight: '1rem' }}>🧰</motion.div>
                                <div style={{ textAlign: 'left' }}>
                                    <p style={{ fontWeight: 700, color: '#3b82f6', marginBottom: '0.25rem' }}>Modules are like TOOLBOXES!</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pre-made tools you can use in your code.</p>
                                </div>
                            </div>

                            <p>
                                Imagine you want to build a treehouse. Would you make your own hammer? No way! You'd use a
                                <strong style={{ color: '#8b5cf6' }}> toolbox</strong> with ready-made tools. Python modules work the same way -
                                they're <strong style={{ color: '#3b82f6' }}>collections of pre-built code</strong> that you can use!
                            </p>
                        </motion.div>

                        {/* The Import Statement */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: '#8b5cf6' }}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6' }}>
                                <Lightbulb size={20} style={{ color: '#8b5cf6' }} /> The Magic Word: import
                            </h3>

                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                    <p style={{ fontWeight: 700, color: '#3b82f6', marginBottom: '0.5rem' }}>To use a module, you IMPORT it:</p>
                                    <div style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.9rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                        <span style={{ color: '#ff79c6' }}>import</span> math  <span style={{ color: '#6272a4' }}># Now you can use math tools!</span>
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                                    <p style={{ fontWeight: 700, color: '#8b5cf6', marginBottom: '0.5rem' }}>Popular Python Modules:</p>
                                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                        <li><code style={{ color: '#3b82f6' }}>math</code> - Calculator superpowers!</li>
                                        <li><code style={{ color: '#3b82f6' }}>random</code> - Make random choices!</li>
                                        <li><code style={{ color: '#3b82f6' }}>datetime</code> - Work with dates and times!</li>
                                        <li><code style={{ color: '#3b82f6' }}>turtle</code> - Draw cool graphics!</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Vocabulary */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: '#3b82f6' }}>
                            <h3 style={{ marginBottom: '1rem', color: '#3b82f6' }}>New Vocabulary</h3>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem' }}>
                                    <code style={{ color: '#3b82f6', fontSize: '1.1rem', fontWeight: 700 }}>MODULE</code>
                                    <span>A file with pre-written Python code you can reuse</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '0.5rem' }}>
                                    <code style={{ color: '#8b5cf6', fontSize: '1.1rem', fontWeight: 700 }}>import</code>
                                    <span>The keyword to bring a module into your program</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem' }}>
                                    <code style={{ color: '#3b82f6', fontSize: '1.1rem', fontWeight: 700 }}>module.function()</code>
                                    <span>How you use tools from a module (dot notation)</span>
                                </div>
                            </div>
                        </div>

                        {/* Example Code */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: '#8b5cf6' }}>Example: Using the math Module</h3>
                            <div className={styles.codeBlock} style={{ borderColor: '#3b82f6' }}>
                                <div className={styles.codeHeader}><span>main.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># Step 1: Import the module</span>{'\n'}
                                    <span style={{ color: '#ff79c6' }}>import</span> math{'\n\n'}
                                    <span className={styles.comment}># Step 2: Use module.tool()</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(math.pi)  <span className={styles.comment}># Pi = 3.14159...</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(math.sqrt(16))  <span className={styles.comment}># Square root of 16</span>
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>3.141592653589793{'\n'}4.0</div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: '#8b5cf6' }}>Your Turn - Import a Module!</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                Try importing the math module and using math.pi or math.sqrt()!
                            </p>
                            <div className={styles.editor} style={{ borderColor: '#3b82f6' }}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '150px' }} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                <Play size={18} /> Run Code
                            </button>

                            {output && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.outputBox}>
                                    <div className={styles.outputLabel}>Output:</div>
                                    <div className={styles.outputText}>{output}</div>
                                </motion.div>
                            )}
                        </div>

                        {/* Challenges */}
                        <div className={styles.challenges} style={{ background: 'var(--bg-secondary)', borderColor: '#3b82f6' }}>
                            <h3 style={{ color: '#3b82f6' }}>Try These Challenges:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasImportedModule ? styles.done : ''}`}>
                                        {hasImportedModule && <Check size={14} />}
                                    </div>
                                    Import a module using <code style={{ color: '#8b5cf6' }}>import</code>
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasUsedModuleFunction ? styles.done : ''}`}>
                                        {hasUsedModuleFunction && <Check size={14} />}
                                    </div>
                                    Use a module function like <code style={{ color: '#8b5cf6' }}>math.pi</code>
                                </li>
                            </ul>
                        </div>

                        {/* Tip */}
                        <div className={styles.tipBox} style={{ background: 'rgba(139, 92, 246, 0.15)', borderColor: '#8b5cf6' }}>
                            <Lightbulb size={20} style={{ color: '#8b5cf6', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#8b5cf6' }}>Remember:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li>Always <code>import</code> at the TOP of your file</li>
                                    <li>Use dot notation: <code>module.function()</code></li>
                                    <li>Modules save you from writing code from scratch!</li>
                                </ul>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className={styles.navBar}>
                            <Link href="/level6" className={`${styles.navBtn} ${styles.secondary}`}>
                                <ChevronLeft size={18} /> Level Hub
                            </Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                Quiz Time! <ChevronRight size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    /* Quiz Section */
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection} style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))', borderColor: '#3b82f6' }}>
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</motion.div>
                        <h2 className={styles.quizTitle} style={{ color: '#3b82f6' }}>Brain Check! (Question {currentQuiz + 1}/2)</h2>

                        {currentQuiz === 0 ? (
                            <>
                                <p className={styles.quizQuestion}>What is a Python module most like?</p>
                                <div className={styles.quizOptions}>
                                    {['A video game', 'A toolbox with pre-made tools', 'A type of variable'].map((option, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[0]) { const newAnswers = [...quizAnswers]; newAnswers[0] = idx; setQuizAnswers(newAnswers); } }}
                                            className={`${styles.quizOption} ${quizAnswers[0] === idx ? styles.selected : ''} ${quizChecked[0] && idx === 1 ? styles.correct : ''} ${quizChecked[0] && quizAnswers[0] === idx && idx !== 1 ? styles.wrong : ''}`}
                                            disabled={quizChecked[0]}>
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>Which keyword brings a module into your program?</p>
                                <div className={styles.quizOptions}>
                                    {['import', 'use', 'get'].map((option, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[1]) { const newAnswers = [...quizAnswers]; newAnswers[1] = idx; setQuizAnswers(newAnswers); } }}
                                            className={`${styles.quizOption} ${quizAnswers[1] === idx ? styles.selected : ''} ${quizChecked[1] && idx === 0 ? styles.correct : ''} ${quizChecked[1] && quizAnswers[1] === idx && idx !== 0 ? styles.wrong : ''}`}
                                            disabled={quizChecked[1]}>
                                            <code>{option}</code>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {!quizChecked[currentQuiz] ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswers[currentQuiz] === null} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                Check Answer
                            </button>
                        ) : quizAnswers[currentQuiz] !== (currentQuiz === 0 ? 1 : 0) ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>{currentQuiz === 0 ? 'Modules are like toolboxes - collections of pre-made code you can use!' : 'The import keyword brings modules into your program!'}</p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>Try Again</button>
                            </motion.div>
                        ) : currentQuiz === 0 ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${styles.quizFeedback} ${styles.success}`}>
                                <h4>Correct!</h4>
                                <p>Modules are exactly like toolboxes! Moving to the next question...</p>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
