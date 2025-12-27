'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Music } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL3_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL3_LESSONS[4]; // Lesson 5 (0-indexed)
const LESSON_ID = 38;

export default function Lesson5() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('# Try looping through a list!\n');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);

    // Animation states for loop visualization
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentItemIndex, setCurrentItemIndex] = useState(-1);
    const [animatedOutput, setAnimatedOutput] = useState<string[]>([]);

    const quizQuestions = [
        {
            question: 'In "for pet in pets:", what does \'pet\' hold?',
            options: ['The whole list', 'The current item', 'The list length'],
            correct: 1
        },
        {
            question: 'How many times does the loop run for a list with 4 items?',
            options: ['1 time', '4 times', 'Infinite'],
            correct: 1
        }
    ];

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            const variables: { [key: string]: string[] | string | number } = {};

            let i = 0;
            while (i < lines.length) {
                const line = lines[i];
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) { i++; continue; }

                // List assignment: playlist = ["item1", "item2", ...]
                const listMatch = trimmed.match(/^(\w+)\s*=\s*\[(.*)\]$/);
                if (listMatch) {
                    const varName = listMatch[1];
                    const itemsStr = listMatch[2];
                    const items = itemsStr.split(',').map(item => {
                        const match = item.trim().match(/^["'](.*)["']$/);
                        return match ? match[1] : item.trim();
                    }).filter(item => item);
                    variables[varName] = items;
                    i++;
                    continue;
                }

                // Simple print: print("...")
                const simplePrintMatch = trimmed.match(/^print\s*\(\s*["'](.*)["']\s*\)$/);
                if (simplePrintMatch) {
                    outputLines.push(simplePrintMatch[1]);
                    i++;
                    continue;
                }

                // For loop: for item in list:
                const forMatch = trimmed.match(/^for\s+(\w+)\s+in\s+(\w+)\s*:$/);
                if (forMatch) {
                    const loopVar = forMatch[1];
                    const listName = forMatch[2];
                    const list = variables[listName];

                    if (Array.isArray(list)) {
                        // Collect loop body
                        let bodyLines: string[] = [];
                        let j = i + 1;
                        while (j < lines.length && (lines[j].startsWith('    ') || lines[j].startsWith('\t') || lines[j].trim() === '')) {
                            if (lines[j].trim()) {
                                bodyLines.push(lines[j].trim());
                            }
                            j++;
                        }

                        // Execute loop for each item
                        for (const item of list) {
                            for (const bodyLine of bodyLines) {
                                // Handle print with concatenation: print("emoji " + var)
                                const printConcatMatch = bodyLine.match(/^print\s*\(\s*["'](.*)["']\s*\+\s*(\w+)\s*\)$/);
                                if (printConcatMatch) {
                                    const prefix = printConcatMatch[1];
                                    const varRef = printConcatMatch[2];
                                    if (varRef === loopVar) {
                                        outputLines.push(prefix + item);
                                    }
                                    continue;
                                }

                                // Handle print with variable only: print(var)
                                const printVarMatch = bodyLine.match(/^print\s*\(\s*(\w+)\s*\)$/);
                                if (printVarMatch && printVarMatch[1] === loopVar) {
                                    outputLines.push(item);
                                    continue;
                                }

                                // Handle simple print in loop
                                const loopPrintMatch = bodyLine.match(/^print\s*\(\s*["'](.*)["']\s*\)$/);
                                if (loopPrintMatch) {
                                    outputLines.push(loopPrintMatch[1]);
                                }
                            }
                        }
                        i = j;
                        continue;
                    }
                    i++;
                    continue;
                }

                i++;
            }

            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code!');
        } catch {
            setOutput('Error in code! Check your syntax.');
        }
    };

    // Animated loop visualization
    const runAnimatedDemo = () => {
        setIsAnimating(true);
        setAnimatedOutput([]);
        setCurrentItemIndex(-1);

        const playlist = ["Happy", "Dance", "Rock On"];

        // First show "Now playing:"
        setTimeout(() => {
            setAnimatedOutput(['Now playing:']);
        }, 500);

        // Then iterate through each song
        playlist.forEach((song, index) => {
            setTimeout(() => {
                setCurrentItemIndex(index);
            }, 1000 + index * 1200);

            setTimeout(() => {
                setAnimatedOutput(prev => [...prev, '  ' + song]);
            }, 1500 + index * 1200);
        });

        // Finally show "Playlist complete!"
        setTimeout(() => {
            setCurrentItemIndex(-1);
            setAnimatedOutput(prev => [...prev, 'Playlist complete!']);
            setIsAnimating(false);
        }, 1000 + playlist.length * 1200 + 500);
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
                <p className={styles.successMessage}>You can now loop through lists like a pro DJ!</p>
                <div className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</div>
                <Link href="/level3/lesson6" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link>
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
                            <motion.div className={styles.lessonEmoji} animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>{LESSON.emoji}</motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* DJ Robot Story Box */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15))' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                {/* Animated DJ Robot with Spinning Records */}
                                <div style={{ position: 'relative', width: '120px', height: '100px', flexShrink: 0 }}>
                                    {/* Left Record */}
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        style={{
                                            position: 'absolute',
                                            left: '5px',
                                            top: '30px',
                                            width: '45px',
                                            height: '45px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                                            border: '3px solid #333',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <div style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            background: '#c084fc'
                                        }} />
                                    </motion.div>

                                    {/* Right Record */}
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        style={{
                                            position: 'absolute',
                                            right: '5px',
                                            top: '30px',
                                            width: '45px',
                                            height: '45px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                                            border: '3px solid #333',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <div style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            background: '#f472b6'
                                        }} />
                                    </motion.div>

                                    {/* DJ Robot */}
                                    <motion.div
                                        animate={{ y: [0, -3, 0] }}
                                        transition={{ duration: 0.5, repeat: Infinity }}
                                        style={{
                                            position: 'absolute',
                                            left: '50%',
                                            top: '0',
                                            transform: 'translateX(-50%)',
                                            fontSize: '2.5rem',
                                            textShadow: '0 0 20px rgba(168, 85, 247, 0.5)'
                                        }}
                                    >
                                        <span role="img" aria-label="robot">🤖</span>
                                    </motion.div>

                                    {/* Headphones */}
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        style={{
                                            position: 'absolute',
                                            left: '50%',
                                            top: '-5px',
                                            transform: 'translateX(-50%)',
                                            fontSize: '1.2rem'
                                        }}
                                    >
                                        <span role="img" aria-label="headphones">🎧</span>
                                    </motion.div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
                                        <Music size={20} className="text-purple-400" />
                                        DJ Time!
                                    </div>
                                    <p style={{ marginTop: '0.25rem', color: 'var(--text-muted)' }}>
                                        You have a playlist and want to announce each song. Instead of writing <code>print()</code> for every song, use a <strong>FOR LOOP</strong> to go through each item automatically!
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Concept Explanation Box */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem' }}>How For Loops Work</h3>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(168, 85, 247, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>1</span>
                                    <p><code>for item in list:</code> visits <strong>each item</strong> one by one</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(168, 85, 247, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>2</span>
                                    <p>The variable (<code>item</code>) holds the <strong>current item</strong> each time through</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(168, 85, 247, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>3</span>
                                    <p>The loop runs <strong>once for EACH item</strong> in the list</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(168, 85, 247, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>4</span>
                                    <p>You can use <strong>any variable name</strong> (song, pet, name, etc.)</p>
                                </div>
                            </div>
                        </div>

                        {/* Symbol Explanations */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            style={{
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: 'var(--radius)',
                                padding: '1.25rem',
                                marginBottom: '2rem'
                            }}
                        >
                            <h3 style={{ marginBottom: '0.75rem', color: '#10b981' }}>Symbol Guide</h3>
                            <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.95rem' }}>
                                <div><code style={{ color: '#f472b6' }}>for</code> = "Start a loop - do something for each item"</div>
                                <div><code style={{ color: '#f472b6' }}>in</code> = "Go through each thing inside the list"</div>
                                <div><code style={{ color: '#f472b6' }}>:</code> = "Colon starts the loop body (indented code)"</div>
                            </div>
                        </motion.div>

                        {/* Visual Loop Animation */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{
                                background: 'var(--surface)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius)',
                                padding: '1.5rem',
                                marginBottom: '2rem'
                            }}
                        >
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Play size={18} /> Watch the Loop in Action
                            </h3>

                            {/* Playlist visualization */}
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>playlist = </div>
                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                                    {["Happy", "Dance", "Rock On"].map((song, idx) => (
                                        <motion.div
                                            key={idx}
                                            animate={{
                                                scale: currentItemIndex === idx ? 1.15 : 1,
                                                borderColor: currentItemIndex === idx ? '#c084fc' : 'rgba(255,255,255,0.2)',
                                                boxShadow: currentItemIndex === idx ? '0 0 20px rgba(192, 132, 252, 0.5)' : 'none'
                                            }}
                                            style={{
                                                padding: '0.75rem 1.25rem',
                                                background: currentItemIndex === idx ? 'rgba(168, 85, 247, 0.2)' : 'rgba(0,0,0,0.3)',
                                                border: '2px solid',
                                                borderRadius: '0.5rem',
                                                fontFamily: 'monospace',
                                                position: 'relative'
                                            }}
                                        >
                                            "{song}"
                                            {currentItemIndex === idx && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-25px',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        fontSize: '0.75rem',
                                                        color: '#c084fc',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    song = "{song}"
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={runAnimatedDemo}
                                disabled={isAnimating}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1.5rem',
                                    background: isAnimating ? 'rgba(168, 85, 247, 0.3)' : 'linear-gradient(135deg, #a855f7, #ec4899)',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    color: 'white',
                                    fontWeight: 600,
                                    cursor: isAnimating ? 'not-allowed' : 'pointer',
                                    margin: '0 auto 1rem'
                                }}
                            >
                                <Play size={18} /> {isAnimating ? 'Playing...' : 'Watch Loop Animation'}
                            </button>

                            {/* Animated Output */}
                            <AnimatePresence>
                                {animatedOutput.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        style={{
                                            background: '#1a1a2e',
                                            borderRadius: '0.5rem',
                                            padding: '1rem',
                                            fontFamily: 'monospace'
                                        }}
                                    >
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Output:</div>
                                        {animatedOutput.map((line, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                style={{ color: '#50fa7b' }}
                                            >
                                                {line}
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Code Example */}
                        <div className={styles.codeSection}>
                            <h3>Code Example</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>dj_playlist.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    playlist = [<span className={styles.string}>"Happy"</span>, <span className={styles.string}>"Dance"</span>, <span className={styles.string}>"Rock On"</span>]{'\n\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"Now playing:"</span>){'\n'}
                                    <span className={styles.keyword}>for</span> song <span className={styles.keyword}>in</span> playlist:{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"  "</span> + song){'\n\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"Playlist complete!"</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>Now playing:{'\n'}  Happy{'\n'}  Dance{'\n'}  Rock On{'\n'}Playlist complete!</div>
                            </div>
                        </div>

                        {/* Interactive Code Editor */}
                        <div className={styles.codeSection}>
                            <h3>Your Turn!</h3>
                            <p style={{ marginBottom: '0.75rem', color: 'var(--text-muted)' }}>Try changing the playlist songs! Add more songs or change the names.</p>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    spellCheck={false}
                                    style={{ minHeight: '180px' }}
                                />
                            </div>
                            <button className={styles.runBtn} onClick={runCode}><Play size={18} /> Run Code</button>
                            {output && <div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></div>}
                        </div>

                        {/* Tip Box */}
                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <div>
                                <p style={{ fontWeight: 600 }}>Variable Names Matter!</p>
                                <p style={{ fontSize: '0.9rem' }}>Choose variable names that make sense: <code>for song in playlist</code> is clearer than <code>for x in y</code>. Good names make your code easier to read!</p>
                            </div>
                        </div>

                        {/* Bonus: range(len(list)) mention */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: 'var(--radius)',
                                padding: '1.25rem',
                                marginBottom: '2rem'
                            }}
                        >
                            <h4 style={{ marginBottom: '0.5rem', color: '#3b82f6' }}>Advanced Tip: Getting the Index</h4>
                            <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                                Sometimes you need the position (index) of each item. Use <code>range(len(list))</code>:
                            </p>
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                <span style={{ color: '#ff79c6' }}>for</span> i <span style={{ color: '#ff79c6' }}>in</span> range(len(playlist)):{'\n'}
                                {'    '}print(i, playlist[i])  <span style={{ color: '#6272a4' }}># 0 Happy, 1 Dance, etc.</span>
                            </div>
                        </motion.div>

                        <div className={styles.navBar}>
                            <Link href="/level3/lesson4" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
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
                                    {currentQuiz === 0 && 'In a for loop, the variable (like "pet") holds the current item being looked at, not the whole list or its length.'}
                                    {currentQuiz === 1 && 'The loop runs once for EACH item. 4 items = 4 times through the loop!'}
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
