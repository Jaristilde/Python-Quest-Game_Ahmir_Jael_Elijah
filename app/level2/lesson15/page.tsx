'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL2_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL2_LESSONS[14]; // Lesson 15
const LESSON_ID = 30;

export default function Lesson15() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    // Challenge 1: Print "Hello!" 4 times
    const [code1, setCode1] = useState('# Print "Hello!" exactly 4 times\nfor i in range(4):\n    print("Hello!")');
    const [output1, setOutput1] = useState('');
    const [challenge1Done, setChallenge1Done] = useState(false);

    // Challenge 2: Print numbers 5 to 10
    const [code2, setCode2] = useState('# Print all numbers from 5 to 10\nfor num in range(5, 11):\n    print(num)');
    const [output2, setOutput2] = useState('');
    const [challenge2Done, setChallenge2Done] = useState(false);

    // Challenge 3: Loop through colors list
    const [code3, setCode3] = useState('# Loop through a list of colors\ncolors = ["red", "blue", "green", "yellow"]\nfor color in colors:\n    print(color)');
    const [output3, setOutput3] = useState('');
    const [challenge3Done, setChallenge3Done] = useState(false);

    // Supercharge
    const [superchargeCode, setSuperchargeCode] = useState(`# Times table printer!
number = 7  # Try different numbers!

print(f"Times table for {number}:")
for i in range(1, 11):
    result = number * i
    print(f"{number} x {i} = {result}")`);
    const [superchargeOutput, setSuperchargeOutput] = useState('');
    const [superchargeDone, setSuperchargeDone] = useState(false);
    const [superchargeXpClaimed, setSuperchargeXpClaimed] = useState(false);

    const [showQuiz, setShowQuiz] = useState(false);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizChecked, setQuizChecked] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    // Run Challenge 1
    const runCode1 = () => {
        try {
            const lines = code1.trim().split('\n');
            let outputLines: string[] = [];
            let inLoop = false;
            let loopCount = 0;
            let printStatement = '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) continue;

                // Check for for loop with range
                const forMatch = trimmed.match(/^for\s+\w+\s+in\s+range\s*\(\s*(\d+)\s*\)\s*:$/);
                if (forMatch) {
                    loopCount = parseInt(forMatch[1]);
                    inLoop = true;
                    continue;
                }

                // Check for print inside loop
                if (inLoop && (line.startsWith('    ') || line.startsWith('\t'))) {
                    const printMatch = trimmed.match(/^print\s*\(\s*["'](.*)["']\s*\)$/);
                    if (printMatch) {
                        printStatement = printMatch[1];
                    }
                }
            }

            // Execute the loop
            if (inLoop && printStatement) {
                for (let i = 0; i < loopCount; i++) {
                    outputLines.push(printStatement);
                }
            }

            setOutput1(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code!');

            // Check if challenge is done (prints "Hello!" 4 times)
            if (outputLines.length === 4 && outputLines.every(line => line.toLowerCase().includes('hello'))) {
                setChallenge1Done(true);
            }
        } catch {
            setOutput1('Error in code!');
        }
    };

    // Run Challenge 2
    const runCode2 = () => {
        try {
            const lines = code2.trim().split('\n');
            let outputLines: string[] = [];
            let inLoop = false;
            let rangeStart = 0;
            let rangeEnd = 0;

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) continue;

                // Check for for loop with range(start, end)
                const forMatch = trimmed.match(/^for\s+(\w+)\s+in\s+range\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)\s*:$/);
                if (forMatch) {
                    rangeStart = parseInt(forMatch[2]);
                    rangeEnd = parseInt(forMatch[3]);
                    inLoop = true;
                    continue;
                }

                // Check for print inside loop
                if (inLoop && (line.startsWith('    ') || line.startsWith('\t'))) {
                    const printMatch = trimmed.match(/^print\s*\(\s*(\w+)\s*\)$/);
                    if (printMatch) {
                        for (let i = rangeStart; i < rangeEnd; i++) {
                            outputLines.push(String(i));
                        }
                        inLoop = false;
                    }
                }
            }

            setOutput2(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code!');

            // Check if challenge is done (prints 5, 6, 7, 8, 9, 10)
            const expected = ['5', '6', '7', '8', '9', '10'];
            if (outputLines.length === 6 && outputLines.every((line, idx) => line === expected[idx])) {
                setChallenge2Done(true);
            }
        } catch {
            setOutput2('Error in code!');
        }
    };

    // Run Challenge 3
    const runCode3 = () => {
        try {
            const lines = code3.trim().split('\n');
            let outputLines: string[] = [];
            let listItems: string[] = [];
            let inLoop = false;
            let loopVar = '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) continue;

                // Check for list assignment
                const listMatch = trimmed.match(/^(\w+)\s*=\s*\[(.+)\]$/);
                if (listMatch) {
                    const items = listMatch[2].split(',').map(item => {
                        const strMatch = item.trim().match(/^["'](.*)["']$/);
                        return strMatch ? strMatch[1] : item.trim();
                    });
                    listItems = items;
                    continue;
                }

                // Check for for loop over list
                const forMatch = trimmed.match(/^for\s+(\w+)\s+in\s+(\w+)\s*:$/);
                if (forMatch && listItems.length > 0) {
                    loopVar = forMatch[1];
                    inLoop = true;
                    continue;
                }

                // Check for print inside loop
                if (inLoop && (line.startsWith('    ') || line.startsWith('\t'))) {
                    const printMatch = trimmed.match(/^print\s*\(\s*(\w+)\s*\)$/);
                    if (printMatch && printMatch[1] === loopVar) {
                        outputLines = [...listItems];
                        inLoop = false;
                    }
                }
            }

            setOutput3(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code!');

            // Check if challenge is done (printed at least 3 colors)
            if (outputLines.length >= 3) {
                setChallenge3Done(true);
            }
        } catch {
            setOutput3('Error in code!');
        }
    };

    // Run Supercharge
    const runSupercharge = () => {
        try {
            const lines = superchargeCode.trim().split('\n');
            let outputLines: string[] = [];
            let numberValue = 0;
            let foundTimesTable = false;

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) continue;

                // Check for number assignment
                const numMatch = trimmed.match(/^number\s*=\s*(\d+)/);
                if (numMatch) {
                    numberValue = parseInt(numMatch[1]);
                    continue;
                }

                // Check for header print
                const headerMatch = trimmed.match(/^print\s*\(\s*f["']Times table for \{number\}:["']\s*\)$/);
                if (headerMatch) {
                    outputLines.push(`Times table for ${numberValue}:`);
                    continue;
                }

                // Check for for loop
                const forMatch = trimmed.match(/^for\s+(\w+)\s+in\s+range\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)\s*:$/);
                if (forMatch) {
                    const rangeStart = parseInt(forMatch[2]);
                    const rangeEnd = parseInt(forMatch[3]);

                    // Look for print in next lines
                    for (let i = rangeStart; i < rangeEnd; i++) {
                        const result = numberValue * i;
                        outputLines.push(`${numberValue} x ${i} = ${result}`);
                    }
                    foundTimesTable = true;
                }
            }

            setSuperchargeOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Run your times table code!');

            // Check if supercharge is done (at least 10 multiplication results)
            if (foundTimesTable && outputLines.length >= 10) {
                setSuperchargeDone(true);
            }
        } catch {
            setSuperchargeOutput('Error in code!');
        }
    };

    const claimSuperchargeXp = () => {
        if (!superchargeXpClaimed && superchargeDone) {
            addXpAndCoins(25, 0);
            setSuperchargeXpClaimed(true);
        }
    };

    const checkQuiz = () => {
        setQuizChecked(true);
        if (quizAnswer === 1) {
            setTimeout(() => {
                addXpAndCoins(LESSON.xpReward, 5);
                completeLevel(LESSON_ID, LESSON.xpReward, 5, 1, 60);
                setLessonComplete(true);
            }, 1000);
        }
    };

    const allChallengesDone = challenge1Done && challenge2Done && challenge3Done;
    const challengeProgress = [challenge1Done, challenge2Done, challenge3Done].filter(Boolean).length;

    if (isLoading || !user) {
        return (
            <div className={styles.container}>
                <div className="flex items-center justify-center h-screen">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ fontSize: '3rem' }}>💪</motion.div>
                </div>
            </div>
        );
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', duration: 0.8 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
                    <Check size={50} className="text-white" />
                </motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle}>Loop Master!</motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                    <Link href="/level2/lesson16" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link>
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
                            <motion.div className={styles.lessonEmoji} animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>{LESSON.emoji}</motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Story/Mission */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <motion.span
                                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    style={{ fontSize: '2rem' }}
                                >💪</motion.span>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Time to master for loops!</div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Show what you've learned!</p>
                                </div>
                            </div>
                            <p>Complete all 3 challenges below to prove you're a loop expert!</p>
                        </motion.div>

                        {/* Progress Tracker */}
                        <div style={{
                            background: 'var(--surface)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 'var(--radius)',
                            padding: '1rem 1.5rem',
                            marginBottom: '2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ fontWeight: 600 }}>Challenge Progress:</span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {[challenge1Done, challenge2Done, challenge3Done].map((done, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ scale: 0.8 }}
                                            animate={{ scale: done ? 1 : 0.8 }}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                background: done ? '#10b981' : 'rgba(255,255,255,0.1)',
                                                border: done ? '2px solid #10b981' : '2px solid rgba(255,255,255,0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: done ? 'white' : 'var(--text-muted)',
                                                fontWeight: 700,
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            {done ? <Check size={16} /> : idx + 1}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                            <span style={{ color: allChallengesDone ? '#10b981' : 'var(--text-muted)', fontWeight: 600 }}>
                                {challengeProgress}/3 Complete
                            </span>
                        </div>

                        {/* Challenge 1 */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            style={{
                                background: challenge1Done ? 'rgba(16, 185, 129, 0.1)' : 'var(--surface)',
                                border: challenge1Done ? '2px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius)',
                                padding: '1.5rem',
                                marginBottom: '1.5rem'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        background: challenge1Done ? '#10b981' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 700
                                    }}>
                                        {challenge1Done ? <Check size={18} /> : '1'}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontWeight: 700 }}>Challenge 1: Hello Loop</h3>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Print "Hello!" exactly 4 times using for loop</p>
                                    </div>
                                </div>
                                {challenge1Done && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                    >
                                        <Check size={16} /> Done!
                                    </motion.span>
                                )}
                            </div>

                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>challenge1.py</span><span>Python</span></div>
                                <textarea
                                    value={code1}
                                    onChange={(e) => setCode1(e.target.value)}
                                    spellCheck={false}
                                    style={{ minHeight: '100px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                <button className={styles.runBtn} onClick={runCode1} style={{ background: challenge1Done ? '#10b981' : undefined }}>
                                    <Play size={18} /> {challenge1Done ? 'Completed!' : 'Run Code'}
                                </button>
                                <button
                                    onClick={() => setCode1('# Print "Hello!" exactly 4 times\nfor i in range(4):\n    print("Hello!")')}
                                    style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '0.5rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                                    title="Reset code"
                                >
                                    <RotateCcw size={18} />
                                </button>
                            </div>
                            {output1 && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.outputBox}>
                                    <div className={styles.outputLabel}>Output:</div>
                                    <div className={styles.outputText}>{output1}</div>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Challenge 2 */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{
                                background: challenge2Done ? 'rgba(16, 185, 129, 0.1)' : 'var(--surface)',
                                border: challenge2Done ? '2px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius)',
                                padding: '1.5rem',
                                marginBottom: '1.5rem'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        background: challenge2Done ? '#10b981' : 'linear-gradient(135deg, #f59e0b, #ef4444)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 700
                                    }}>
                                        {challenge2Done ? <Check size={18} /> : '2'}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontWeight: 700 }}>Challenge 2: Number Range</h3>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Print all numbers from 5 to 10 using range(5, 11)</p>
                                    </div>
                                </div>
                                {challenge2Done && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                    >
                                        <Check size={16} /> Done!
                                    </motion.span>
                                )}
                            </div>

                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>challenge2.py</span><span>Python</span></div>
                                <textarea
                                    value={code2}
                                    onChange={(e) => setCode2(e.target.value)}
                                    spellCheck={false}
                                    style={{ minHeight: '100px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                <button className={styles.runBtn} onClick={runCode2} style={{ background: challenge2Done ? '#10b981' : undefined }}>
                                    <Play size={18} /> {challenge2Done ? 'Completed!' : 'Run Code'}
                                </button>
                                <button
                                    onClick={() => setCode2('# Print all numbers from 5 to 10\nfor num in range(5, 11):\n    print(num)')}
                                    style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '0.5rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                                    title="Reset code"
                                >
                                    <RotateCcw size={18} />
                                </button>
                            </div>
                            {output2 && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.outputBox}>
                                    <div className={styles.outputLabel}>Output:</div>
                                    <div className={styles.outputText}>{output2}</div>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Challenge 3 */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            style={{
                                background: challenge3Done ? 'rgba(16, 185, 129, 0.1)' : 'var(--surface)',
                                border: challenge3Done ? '2px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius)',
                                padding: '1.5rem',
                                marginBottom: '1.5rem'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        background: challenge3Done ? '#10b981' : 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 700
                                    }}>
                                        {challenge3Done ? <Check size={18} /> : '3'}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontWeight: 700 }}>Challenge 3: Color Loop</h3>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Loop through a list of colors and print each one</p>
                                    </div>
                                </div>
                                {challenge3Done && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                    >
                                        <Check size={16} /> Done!
                                    </motion.span>
                                )}
                            </div>

                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>challenge3.py</span><span>Python</span></div>
                                <textarea
                                    value={code3}
                                    onChange={(e) => setCode3(e.target.value)}
                                    spellCheck={false}
                                    style={{ minHeight: '120px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                <button className={styles.runBtn} onClick={runCode3} style={{ background: challenge3Done ? '#10b981' : undefined }}>
                                    <Play size={18} /> {challenge3Done ? 'Completed!' : 'Run Code'}
                                </button>
                                <button
                                    onClick={() => setCode3('# Loop through a list of colors\ncolors = ["red", "blue", "green", "yellow"]\nfor color in colors:\n    print(color)')}
                                    style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '0.5rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                                    title="Reset code"
                                >
                                    <RotateCcw size={18} />
                                </button>
                            </div>
                            {output3 && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.outputBox}>
                                    <div className={styles.outputLabel}>Output:</div>
                                    <div className={styles.outputText}>{output3}</div>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Tip Box */}
                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Loop Tips:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li><code>range(4)</code> gives you 0, 1, 2, 3 (4 numbers)</li>
                                    <li><code>range(5, 11)</code> gives you 5, 6, 7, 8, 9, 10</li>
                                    <li><code>for item in list:</code> goes through each item</li>
                                </ul>
                            </div>
                        </div>

                        {/* SUPERCHARGE Bonus Challenge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            style={{
                                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.25))',
                                border: '2px solid rgba(251, 191, 36, 0.4)',
                                borderRadius: 'var(--radius)',
                                padding: '1.5rem',
                                marginTop: '2rem'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <motion.span
                                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{ fontSize: '1.5rem' }}
                                >&#9889;</motion.span>
                                <div>
                                    <h3 style={{ margin: 0, color: '#fbbf24', fontWeight: 800 }}>SUPERCHARGE - Bonus Challenge (+25 XP)</h3>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Optional - Build a times table printer!</p>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                                <p style={{ margin: 0, fontWeight: 600, marginBottom: '0.5rem' }}>The Challenge:</p>
                                <p style={{ margin: 0, fontSize: '0.95rem' }}>
                                    Create a times table printer! Run the code below, then try changing the <code>number</code> variable to print different times tables.
                                </p>
                                <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '0.5rem' }}>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        <strong>Bonus idea:</strong> Try printing times tables for numbers 1-5 by copying the loop 5 times with different numbers! (Preview of nested loops coming soon!)
                                    </p>
                                </div>
                            </div>

                            <div className={styles.editor}>
                                <div className={styles.codeHeader}>
                                    <span>supercharge.py</span>
                                    <span style={{ color: '#fbbf24' }}>&#9889; BONUS</span>
                                </div>
                                <textarea
                                    value={superchargeCode}
                                    onChange={(e) => setSuperchargeCode(e.target.value)}
                                    spellCheck={false}
                                    style={{ minHeight: '180px' }}
                                />
                            </div>

                            <button
                                className={styles.runBtn}
                                onClick={runSupercharge}
                                style={{ background: superchargeDone ? '#10b981' : '#f59e0b', marginTop: '0.75rem' }}
                            >
                                <Play size={18} /> {superchargeDone ? 'Times Table Complete!' : 'Run Times Table'}
                            </button>

                            {superchargeOutput && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={styles.outputBox}
                                    style={{ borderColor: superchargeDone ? 'rgba(16, 185, 129, 0.5)' : undefined }}
                                >
                                    <div className={styles.outputLabel}>{superchargeDone ? '&#9889; Times Table Generated!' : 'Output:'}</div>
                                    <div className={styles.outputText}>{superchargeOutput}</div>
                                </motion.div>
                            )}

                            {superchargeDone && !superchargeXpClaimed && (
                                <motion.button
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    onClick={claimSuperchargeXp}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        width: '100%',
                                        padding: '1rem',
                                        marginTop: '1rem',
                                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                        border: 'none',
                                        borderRadius: 'var(--radius)',
                                        color: 'white',
                                        fontWeight: 700,
                                        fontSize: '1.1rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Zap size={20} fill="currentColor" /> Claim +25 Bonus XP!
                                </motion.button>
                            )}

                            {superchargeXpClaimed && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        padding: '1rem',
                                        marginTop: '1rem',
                                        background: 'rgba(16, 185, 129, 0.2)',
                                        border: '1px solid rgba(16, 185, 129, 0.4)',
                                        borderRadius: 'var(--radius)',
                                        color: '#10b981',
                                        fontWeight: 600
                                    }}
                                >
                                    <Check size={20} /> +25 XP Claimed! Math Wizard!
                                </motion.div>
                            )}
                        </motion.div>

                        <div className={styles.navBar}>
                            <Link href="/level2/lesson14" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection}>
                        <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>💪</motion.div>
                        <h2 className={styles.quizTitle}>Brain Check!</h2>
                        <p className={styles.quizQuestion}>
                            What does <code>range(1, 6)</code> give you?
                        </p>
                        <div className={styles.quizOptions}>
                            {[
                                '1, 2, 3, 4, 5, 6',
                                '1, 2, 3, 4, 5',
                                '0, 1, 2, 3, 4, 5'
                            ].map((option, idx) => (
                                <button key={idx} onClick={() => !quizChecked && setQuizAnswer(idx)} className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''} ${quizChecked && idx === 1 ? styles.correct : ''} ${quizChecked && quizAnswer === idx && idx !== 1 ? styles.wrong : ''}`} disabled={quizChecked}>{option}</button>
                            ))}
                        </div>
                        {!quizChecked ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswer === null}>Check Answer</button>
                        ) : quizAnswer !== 1 ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p><code>range(1, 6)</code> starts at 1 and stops BEFORE 6, giving you: 1, 2, 3, 4, 5. Remember, the end number is NOT included!</p>
                                <button className={styles.quizBtn} onClick={() => { setQuizChecked(false); setQuizAnswer(null); }} style={{ marginTop: '1rem' }}>Try Again</button>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
