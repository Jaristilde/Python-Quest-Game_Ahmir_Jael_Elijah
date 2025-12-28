'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Gift, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL4_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL4_LESSONS[1]; // Lesson 2
const LESSON_ID = 51;

export default function Lesson2() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('# Create a function with a parameter!\n');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasCreatedParamFunction, setHasCreatedParamFunction] = useState(false);
    const [hasCalledWithArg, setHasCalledWithArg] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            let functions: Record<string, { params: string[], body: string[] }> = {};
            let currentFunction: string | null = null;
            let currentParams: string[] = [];
            let functionBody: string[] = [];

            // First pass: collect function definitions with parameters
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();

                if (trimmed.startsWith('#') || trimmed === '') continue;

                // Function definition with parameter: def greet(name):
                const defMatch = trimmed.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*:$/);
                if (defMatch) {
                    currentFunction = defMatch[1];
                    const paramStr = defMatch[2].trim();
                    currentParams = paramStr ? paramStr.split(',').map(p => p.trim()) : [];
                    functionBody = [];
                    if (currentParams.length > 0) {
                        setHasCreatedParamFunction(true);
                    }
                    continue;
                }

                // Check if we're inside a function (indented code)
                if (currentFunction && (line.startsWith('    ') || line.startsWith('\t'))) {
                    functionBody.push(trimmed);
                    functions[currentFunction] = { params: [...currentParams], body: [...functionBody] };
                    continue;
                }

                // End of function body (non-indented line)
                if (currentFunction && !line.startsWith('    ') && !line.startsWith('\t')) {
                    currentFunction = null;
                    currentParams = [];
                }
            }

            // Second pass: execute top-level code and function calls
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || trimmed === '') continue;
                if (trimmed.startsWith('def ')) continue;
                if (line.startsWith('    ') || line.startsWith('\t')) continue;

                // Function call with argument: greet("Ahmir") or greet("Jael")
                const callMatch = trimmed.match(/^(\w+)\s*\((.+)\)$/);
                if (callMatch) {
                    const funcName = callMatch[1];
                    const argStr = callMatch[2].trim();

                    if (funcName === 'print') {
                        // Handle print statements
                        const stringMatch = argStr.match(/^["'](.*)["']$/);
                        if (stringMatch) {
                            outputLines.push(stringMatch[1]);
                        }
                        continue;
                    }

                    if (functions[funcName]) {
                        setHasCalledWithArg(true);
                        const func = functions[funcName];

                        // Parse argument value
                        let argValue = argStr;
                        const stringArgMatch = argStr.match(/^["'](.*)["']$/);
                        if (stringArgMatch) {
                            argValue = stringArgMatch[1];
                        }

                        // Execute the function body with parameter substitution
                        for (const bodyLine of func.body) {
                            let processedLine = bodyLine;

                            // Replace parameter with argument value
                            if (func.params.length > 0) {
                                const paramName = func.params[0];
                                // Handle f-string: print(f"Hello, {name}!")
                                const fstringMatch = processedLine.match(/^print\s*\(f["'](.*)["']\)$/);
                                if (fstringMatch) {
                                    let text = fstringMatch[1];
                                    text = text.replace(new RegExp(`\\{${paramName}\\}`, 'g'), argValue);
                                    outputLines.push(text);
                                    continue;
                                }

                                // Handle concatenation: print("Hello, " + name + "!")
                                const concatMatch = processedLine.match(/^print\s*\((.+)\)$/);
                                if (concatMatch) {
                                    let expr = concatMatch[1];
                                    // Simple string concatenation
                                    if (expr.includes('+')) {
                                        const parts = expr.split('+').map(p => {
                                            const stripped = p.trim();
                                            const strMatch = stripped.match(/^["'](.*)["']$/);
                                            if (strMatch) return strMatch[1];
                                            if (stripped === paramName) return argValue;
                                            return stripped;
                                        });
                                        outputLines.push(parts.join(''));
                                        continue;
                                    }
                                    // Just the parameter
                                    if (expr.trim() === paramName) {
                                        outputLines.push(argValue);
                                        continue;
                                    }
                                    // Just a string
                                    const justStringMatch = expr.match(/^["'](.*)["']$/);
                                    if (justStringMatch) {
                                        outputLines.push(justStringMatch[1]);
                                        continue;
                                    }
                                }
                            }
                        }
                    }
                    continue;
                }

                // Function call without arguments
                const noArgCallMatch = trimmed.match(/^(\w+)\s*\(\s*\)$/);
                if (noArgCallMatch) {
                    const funcName = noArgCallMatch[1];
                    if (funcName === 'print') continue;

                    if (functions[funcName]) {
                        for (const bodyLine of functions[funcName].body) {
                            const printMatch = bodyLine.match(/^print\s*\(["'](.*)["']\)$/);
                            if (printMatch) {
                                outputLines.push(printMatch[1]);
                            }
                        }
                    }
                    continue;
                }
            }

            if (outputLines.length > 0) {
                setOutput(outputLines.join('\n'));
            } else {
                setOutput('Run your code to see what happens!');
            }
        } catch {
            setOutput('Error in code! Check your syntax.');
        }
    };

    const checkQuiz = () => {
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = true;
        setQuizChecked(newChecked);

        // Correct answers: Q1 = 1 (A parameter), Q2 = 0 (greet("Maya"))
        const correctAnswers = [1, 0];

        if (quizAnswers[currentQuiz] === correctAnswers[currentQuiz]) {
            if (currentQuiz === 0) {
                setTimeout(() => {
                    setCurrentQuiz(1);
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
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        style={{ fontSize: '3rem' }}
                    >
                        🎁
                    </motion.div>
                </div>
            </div>
        );
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'rgba(0, 0, 0, 0.95)' }}>
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', duration: 0.8 }}
                    className={styles.successIcon}
                    style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
                >
                    <Check size={50} className="text-white" />
                </motion.div>
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={styles.successTitle}
                    style={{ color: 'var(--accent-primary)' }}
                >
                    Parameter Master Unlocked!
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={styles.successMessage}
                >
                    {LESSON.successMessage} Your functions can now accept different inputs!
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
                    <Link href="/level4/lesson3" className={`${styles.navBtn} ${styles.primary}`}>
                        Next Lesson <ChevronRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    // Names for the animated visual
    const names = ['Ahmir', 'Jael', 'Elijah'];

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
            <header className={styles.header} style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--accent-primary)' }}>
                <Link href="/level4" className={styles.backBtn}>
                    <ArrowLeft size={18} /> Back
                </Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 13</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}>
                        <Heart size={14} fill="currentColor" /> {user.progress.lives}
                    </div>
                    <div className={`${styles.statBadge} ${styles.xp}`}>
                        <Zap size={14} fill="currentColor" /> {user.progress.xp}
                    </div>
                </div>
            </header>

            <div className={styles.content}>
                {!showQuiz ? (
                    <>
                        {/* Lesson Title */}
                        <div className={styles.lessonTitle}>
                            <motion.div
                                className={styles.lessonEmoji}
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
                            >
                                {LESSON.emoji}
                            </motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1 style={{ color: 'var(--accent-primary)' }}>{LESSON.title}</h1>
                                <p>Learn: <code style={{ color: 'var(--accent-secondary)' }}>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Story Introduction */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))', borderColor: 'var(--accent-primary)' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Gift size={28} style={{ color: 'var(--accent-primary)' }} />
                                <MessageCircle size={24} style={{ color: 'var(--accent-secondary)' }} />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>Mission: Personalized Greetings!</span>
                            </div>

                            <p>
                                🍭 What if you want your function to say hello to <strong style={{ color: 'var(--accent-secondary)' }}>DIFFERENT</strong> people?
                                You need to give it information! A <strong style={{ color: 'var(--accent-primary)' }}>PARAMETER</strong> is like a gift box that catches the information you send!
                            </p>
                        </motion.div>

                        {/* Animated Visual - Parameter as Gift Box */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{
                                background: 'var(--bg-secondary)',
                                borderRadius: '1rem',
                                padding: '1.5rem',
                                marginBottom: '2rem',
                                border: '1px solid var(--accent-primary)'
                            }}
                        >
                            <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--accent-secondary)' }}>
                                Parameters Catch Information Like a Gift!
                            </h3>

                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                {names.map((name, idx) => (
                                    <motion.div
                                        key={name}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + idx * 0.2 }}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <motion.div
                                            animate={{ y: [0, -5, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.3 }}
                                            style={{
                                                fontSize: '2rem',
                                                background: 'var(--accent-primary)',
                                                padding: '0.75rem 1rem',
                                                borderRadius: '0.75rem',
                                                color: 'white'
                                            }}
                                        >
                                            🎁 "{name}"
                                        </motion.div>
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.8 + idx * 0.2 }}
                                            style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}
                                        >
                                            greet("{name}")
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </div>

                            <div style={{
                                marginTop: '1.5rem',
                                textAlign: 'center',
                                padding: '1rem',
                                background: 'rgba(80, 250, 123, 0.1)',
                                borderRadius: '0.75rem'
                            }}>
                                <p style={{ fontFamily: 'Fira Code, monospace', color: '#50fa7b' }}>
                                    def greet(<span style={{ color: '#ff79c6', fontWeight: 700 }}>name</span>):  <span style={{ color: '#6272a4' }}># name catches the gift!</span>
                                </p>
                            </div>
                        </motion.div>

                        {/* Main Explanation */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-secondary)' }}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
                                <Lightbulb size={20} style={{ color: 'var(--accent-secondary)' }} /> How Parameters Work
                            </h3>

                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255, 121, 198, 0.1)', borderRadius: '0.5rem' }}>
                                    <code style={{ color: '#ff79c6', fontSize: '1.1rem', fontWeight: 700 }}>parameter</code>
                                    <span>= A variable inside the () that catches information you send to the function</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(80, 250, 123, 0.1)', borderRadius: '0.5rem' }}>
                                    <code style={{ color: '#50fa7b', fontSize: '1.1rem', fontWeight: 700 }}>argument</code>
                                    <span>= The actual value you send when calling the function (like "Ahmir")</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(189, 147, 249, 0.1)', borderRadius: '0.5rem' }}>
                                    <span>Think of it like: <strong>parameter</strong> = the mailbox, <strong>argument</strong> = the letter you put in it!</span>
                                </div>
                            </div>
                        </div>

                        {/* Example Code */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: 'var(--accent-secondary)' }}>Example: Greet Different People</h3>
                            <div className={styles.codeBlock} style={{ borderColor: 'var(--accent-primary)' }}>
                                <div className={styles.codeHeader}>
                                    <span>main.py</span>
                                    <span>Python</span>
                                </div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># Create a function with a parameter</span>{'\n'}
                                    <span className={styles.keyword}>def</span> <span style={{ color: '#50fa7b' }}>greet</span>(<span style={{ color: '#ff79c6' }}>name</span>):{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>f"Hello, </span><span style={{ color: '#ff79c6' }}>{'{'}name{'}'}</span><span className={styles.string}>!"</span>){'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"Welcome to Candy Land!"</span>){'\n\n'}
                                    <span className={styles.comment}># Call with different names!</span>{'\n'}
                                    <span style={{ color: '#50fa7b' }}>greet</span>(<span className={styles.string}>"Ahmir"</span>){'\n'}
                                    <span style={{ color: '#50fa7b' }}>greet</span>(<span className={styles.string}>"Jael"</span>){'\n'}
                                    <span style={{ color: '#50fa7b' }}>greet</span>(<span className={styles.string}>"Elijah"</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>
                                    Hello, Ahmir!{'\n'}
                                    Welcome to Candy Land!{'\n'}
                                    Hello, Jael!{'\n'}
                                    Welcome to Candy Land!{'\n'}
                                    Hello, Elijah!{'\n'}
                                    Welcome to Candy Land!
                                </div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: 'var(--accent-secondary)' }}>Your Turn - Create a Compliment Function!</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                Create a function called <code style={{ color: 'var(--accent-primary)' }}>compliment(person)</code> that gives someone a nice compliment, then call it with different names!
                            </p>
                            <div className={styles.editor} style={{ borderColor: 'var(--accent-primary)' }}>
                                <div className={styles.codeHeader}>
                                    <span>your_code.py</span>
                                    <span>Python</span>
                                </div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder='# Create a compliment function!
def compliment(person):
    print(f"{person} is awesome!")
    print(f"{person} is a coding star!")

# Try it with different names
compliment("Maya")
compliment("Jordan")'
                                    spellCheck={false}
                                    style={{ minHeight: '200px' }}
                                />
                            </div>
                            <button className={styles.runBtn} onClick={runCode} style={{ background: 'var(--accent-primary)' }}>
                                <Play size={18} /> Run Code
                            </button>

                            {output && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={styles.outputBox}
                                >
                                    <div className={styles.outputLabel}>
                                        Output:
                                    </div>
                                    <div className={styles.outputText}>
                                        {output}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Challenge Tracker */}
                        <div className={styles.challenges} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
                            <h3 style={{ color: 'var(--accent-primary)' }}>Try These Challenges:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasCreatedParamFunction ? styles.done : ''}`}>
                                        {hasCreatedParamFunction && <Check size={14} />}
                                    </div>
                                    Create a function with a parameter <code style={{ color: 'var(--accent-secondary)' }}>def name(param):</code>
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasCalledWithArg ? styles.done : ''}`}>
                                        {hasCalledWithArg && <Check size={14} />}
                                    </div>
                                    Call your function with an argument <code style={{ color: 'var(--accent-secondary)' }}>name("value")</code>
                                </li>
                            </ul>
                        </div>

                        {/* Tip Box */}
                        <div className={styles.tipBox} style={{ background: 'rgba(251, 191, 36, 0.15)', borderColor: 'var(--accent-secondary)' }}>
                            <Lightbulb size={20} style={{ color: 'var(--accent-secondary)', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--accent-secondary)' }}>Remember:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li>Parameters go inside the <code>()</code> when you define the function</li>
                                    <li>Use <code>f"..."</code> and <code>{'{'}parameter{'}'}</code> to include the parameter in text</li>
                                    <li>Each time you call the function, you can send different information!</li>
                                </ul>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className={styles.navBar}>
                            <Link href="/level4/lesson1" className={`${styles.navBtn} ${styles.secondary}`}>
                                <ChevronLeft size={18} /> Previous
                            </Link>
                            <button
                                className={`${styles.navBtn} ${styles.primary}`}
                                onClick={() => setShowQuiz(true)}
                                style={{ background: 'var(--accent-primary)' }}
                            >
                                Quiz Time! <ChevronRight size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    /* Quiz Section */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={styles.quizSection}
                        style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))', borderColor: 'var(--accent-primary)' }}
                    >
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ fontSize: '3rem', marginBottom: '1rem' }}
                        >
                            🎁
                        </motion.div>
                        <h2 className={styles.quizTitle} style={{ color: 'var(--accent-primary)' }}>Brain Check! (Question {currentQuiz + 1}/2)</h2>

                        {currentQuiz === 0 ? (
                            <>
                                <p className={styles.quizQuestion}>
                                    In <code>def sing(song):</code>, what is <code>song</code>?
                                </p>
                                <div className={styles.quizOptions}>
                                    {[
                                        'A function',
                                        'A parameter',
                                        'A loop'
                                    ].map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                if (!quizChecked[0]) {
                                                    const newAnswers = [...quizAnswers];
                                                    newAnswers[0] = idx;
                                                    setQuizAnswers(newAnswers);
                                                }
                                            }}
                                            className={`${styles.quizOption} ${quizAnswers[0] === idx ? styles.selected : ''
                                                } ${quizChecked[0] && idx === 1 ? styles.correct : ''
                                                } ${quizChecked[0] && quizAnswers[0] === idx && idx !== 1 ? styles.wrong : ''
                                                }`}
                                            disabled={quizChecked[0]}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>
                                    If you have <code>def greet(name):</code>, how do you greet Maya?
                                </p>
                                <div className={styles.quizOptions}>
                                    {[
                                        'greet("Maya")',
                                        'greet(Maya)',
                                        'def greet("Maya")'
                                    ].map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                if (!quizChecked[1]) {
                                                    const newAnswers = [...quizAnswers];
                                                    newAnswers[1] = idx;
                                                    setQuizAnswers(newAnswers);
                                                }
                                            }}
                                            className={`${styles.quizOption} ${quizAnswers[1] === idx ? styles.selected : ''
                                                } ${quizChecked[1] && idx === 0 ? styles.correct : ''
                                                } ${quizChecked[1] && quizAnswers[1] === idx && idx !== 0 ? styles.wrong : ''
                                                }`}
                                            disabled={quizChecked[1]}
                                        >
                                            <code>{option}</code>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {!quizChecked[currentQuiz] ? (
                            <button
                                className={styles.quizBtn}
                                onClick={checkQuiz}
                                disabled={quizAnswers[currentQuiz] === null}
                                style={{ background: 'var(--accent-primary)' }}
                            >
                                Check Answer
                            </button>
                        ) : quizAnswers[currentQuiz] !== (currentQuiz === 0 ? 1 : 0) ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.quizFeedback} ${styles.error}`}
                            >
                                <h4>Not quite!</h4>
                                <p>
                                    {currentQuiz === 0
                                        ? '"song" is a parameter - it\'s a variable that catches the information sent to the function!'
                                        : 'To call a function with a string argument, put the string in quotes inside the parentheses: greet("Maya")'
                                    }
                                </p>
                                <button
                                    className={styles.quizBtn}
                                    onClick={retryQuiz}
                                    style={{ marginTop: '1rem', background: 'var(--accent-primary)' }}
                                >
                                    Try Again
                                </button>
                            </motion.div>
                        ) : currentQuiz === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.quizFeedback} ${styles.success}`}
                            >
                                <h4>Correct!</h4>
                                <p>"song" is a parameter - it's like a container waiting to receive information! Moving to the next question...</p>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
