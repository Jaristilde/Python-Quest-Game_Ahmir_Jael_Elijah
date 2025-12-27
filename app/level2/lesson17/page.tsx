'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Trophy, Target, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL2_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL2_LESSONS[16]; // Lesson 17
const LESSON_ID = 32;

export default function Lesson17() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    // Challenge states
    const [challenge1Code, setChallenge1Code] = useState('');
    const [challenge1Output, setChallenge1Output] = useState('');
    const [challenge1Done, setChallenge1Done] = useState(false);

    const [challenge2Code, setChallenge2Code] = useState('');
    const [challenge2Output, setChallenge2Output] = useState('');
    const [challenge2Done, setChallenge2Done] = useState(false);

    const [challenge3Code, setChallenge3Code] = useState('');
    const [challenge3Output, setChallenge3Output] = useState('');
    const [challenge3Done, setChallenge3Done] = useState(false);

    // Supercharge states
    const [superchargeCode, setSuperchargeCode] = useState('');
    const [superchargeOutput, setSuperchargeOutput] = useState('');
    const [superchargeDone, setSuperchargeDone] = useState(false);
    const [superchargeXpClaimed, setSuperchargeXpClaimed] = useState(false);

    // Lesson complete state
    const [lessonComplete, setLessonComplete] = useState(false);
    const [xpClaimed, setXpClaimed] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const allChallengesDone = challenge1Done && challenge2Done && challenge3Done;

    // Challenge 1: Use break to find first number divisible by 7 between 1-50
    const runChallenge1 = () => {
        try {
            const code = challenge1Code.trim();
            let outputLines: string[] = [];
            let foundDivisibleBy7 = false;
            let usesBreak = code.includes('break');
            let usesLoop = code.includes('for') || code.includes('while');

            // Simple simulation: check if code structure looks correct
            const lines = code.split('\n');
            let inLoop = false;
            let checksDivisible = false;
            let foundNumber = 0;

            for (const line of lines) {
                const trimmed = line.trim();

                if (trimmed.includes('for') && trimmed.includes('range')) {
                    inLoop = true;
                }
                if (trimmed.includes('while')) {
                    inLoop = true;
                }
                if (trimmed.includes('% 7') && trimmed.includes('== 0')) {
                    checksDivisible = true;
                }
                if (trimmed.includes('% 7 == 0') || trimmed.includes('%7==0')) {
                    checksDivisible = true;
                }

                // Check for print statement
                const printMatch = trimmed.match(/print\s*\(\s*(.+)\s*\)/);
                if (printMatch) {
                    let content = printMatch[1];
                    // Handle f-string or string with number
                    if (content.includes('7') || content.includes('14') || content.includes('21')) {
                        foundNumber = 7;
                    }
                }
            }

            // The first number divisible by 7 in range 1-50 is 7
            if (usesLoop && usesBreak && checksDivisible) {
                outputLines.push('7');
                outputLines.push('Found it! First number divisible by 7 is: 7');
                foundDivisibleBy7 = true;
            } else if (usesLoop && checksDivisible) {
                outputLines.push('Good loop! But remember to use break to stop early.');
            } else if (usesLoop) {
                outputLines.push('You have a loop. Now check if i % 7 == 0 and use break!');
            } else {
                outputLines.push('Try using a for or while loop with range(1, 51)');
            }

            setChallenge1Output(outputLines.join('\n'));
            if (foundDivisibleBy7 && usesBreak) {
                setChallenge1Done(true);
            }
        } catch {
            setChallenge1Output('Error in code! Check your syntax.');
        }
    };

    // Challenge 2: Use continue to print 1-10 but skip multiples of 3
    const runChallenge2 = () => {
        try {
            const code = challenge2Code.trim();
            let outputLines: string[] = [];
            let usesContinue = code.includes('continue');
            let usesLoop = code.includes('for') || code.includes('while');
            let checksModulo3 = code.includes('% 3') && code.includes('== 0');

            if (usesLoop && usesContinue && checksModulo3) {
                // Expected output: 1, 2, 4, 5, 7, 8, 10 (skipping 3, 6, 9)
                outputLines.push('1');
                outputLines.push('2');
                outputLines.push('4');
                outputLines.push('5');
                outputLines.push('7');
                outputLines.push('8');
                outputLines.push('10');
                setChallenge2Done(true);
            } else if (usesLoop && checksModulo3) {
                outputLines.push('Good! You check for multiples of 3.');
                outputLines.push('Now use continue to skip them!');
            } else if (usesLoop) {
                outputLines.push('You have a loop. Check if i % 3 == 0 and use continue to skip.');
            } else {
                outputLines.push('Try using a for loop with range(1, 11)');
            }

            setChallenge2Output(outputLines.join('\n'));
        } catch {
            setChallenge2Output('Error in code! Check your syntax.');
        }
    };

    // Challenge 3: While loop to double a number until it passes 500
    const runChallenge3 = () => {
        try {
            const code = challenge3Code.trim();
            let outputLines: string[] = [];
            let usesWhile = code.includes('while');
            let checksCondition = code.includes('< 500') || code.includes('<= 500') || code.includes('< 501');
            let doublesNumber = code.includes('*= 2') || code.includes('* 2') || code.includes('= num * 2') || code.includes('= number * 2');

            if (usesWhile && checksCondition && doublesNumber) {
                // Starting from 1, doubling: 1, 2, 4, 8, 16, 32, 64, 128, 256, 512
                outputLines.push('1');
                outputLines.push('2');
                outputLines.push('4');
                outputLines.push('8');
                outputLines.push('16');
                outputLines.push('32');
                outputLines.push('64');
                outputLines.push('128');
                outputLines.push('256');
                outputLines.push('512');
                outputLines.push('Final number: 512 (passed 500!)');
                setChallenge3Done(true);
            } else if (usesWhile && doublesNumber) {
                outputLines.push('Good doubling! Check your while condition: while num < 500');
            } else if (usesWhile) {
                outputLines.push('You have a while loop! Now double the number with num *= 2');
            } else {
                outputLines.push('Use: while number < 500:');
                outputLines.push('    number *= 2');
            }

            setChallenge3Output(outputLines.join('\n'));
        } catch {
            setChallenge3Output('Error in code! Check your syntax.');
        }
    };

    // Supercharge: Search algorithm
    const runSupercharge = () => {
        try {
            const code = superchargeCode.trim();
            let outputLines: string[] = [];

            // Check for key elements
            let hasList = code.includes('names') && (code.includes('[') || code.includes('list'));
            let hasForLoop = code.includes('for') && code.includes('range');
            let hasComparison = code.includes('==') && code.includes('looking_for');
            let hasBreak = code.includes('break');
            let hasFound = code.includes('found') || code.includes('Found');
            let checksNotFound = code.includes('not found') || code.includes('not in list') || code.includes('if not found');

            if (hasList && hasForLoop && hasComparison && hasBreak && hasFound) {
                // Check what name they're searching for
                const lookingForMatch = code.match(/looking_for\s*=\s*["'](\w+)["']/);
                const searchName = lookingForMatch ? lookingForMatch[1] : 'Charlie';

                const knownNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
                const index = knownNames.indexOf(searchName);

                if (index !== -1) {
                    outputLines.push(`Found ${searchName} at position ${index}!`);
                    outputLines.push('Search algorithm working!');
                } else {
                    outputLines.push(`${searchName} not in list`);
                    outputLines.push('Great! You tested with a name not in the list!');
                }

                if (checksNotFound) {
                    outputLines.push('Excellent! You handle both found and not-found cases!');
                }

                setSuperchargeDone(true);
            } else if (hasList && hasForLoop) {
                outputLines.push('Good start! You have the list and loop.');
                outputLines.push('Now compare names[i] == looking_for and use break when found!');
            } else if (hasList) {
                outputLines.push('You have the names list!');
                outputLines.push('Use for i in range(len(names)): to loop through it.');
            } else {
                outputLines.push('Start with: names = ["Alice", "Bob", "Charlie", "Diana", "Eve"]');
                outputLines.push('Then search for a name using a for loop!');
            }

            setSuperchargeOutput(outputLines.join('\n'));
        } catch {
            setSuperchargeOutput('Error in code! Check your syntax.');
        }
    };

    const claimMainXp = () => {
        if (!xpClaimed && allChallengesDone) {
            addXpAndCoins(LESSON.xpReward, 5);
            completeLevel(LESSON_ID, LESSON.xpReward, 5, 1, 60);
            setXpClaimed(true);
            setLessonComplete(true);
        }
    };

    const claimSuperchargeXp = () => {
        if (!superchargeXpClaimed && superchargeDone) {
            addXpAndCoins(25, 0);
            setSuperchargeXpClaimed(true);
        }
    };

    if (isLoading || !user) {
        return (
            <div className={styles.container}>
                <div className="flex items-center justify-center h-screen">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ fontSize: '3rem' }}>🏆</motion.div>
                </div>
            </div>
        );
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', duration: 0.8 }}
                >
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ fontSize: '5rem', marginBottom: '1rem' }}
                    >
                        🏆
                    </motion.div>
                </motion.div>
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={styles.successTitle}
                    style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                    LOOP LEGEND!
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
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring' }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
                        border: '1px solid rgba(139, 92, 246, 0.5)',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '9999px',
                        marginBottom: '1.5rem'
                    }}>
                        <Trophy size={20} className="text-purple-400" />
                        <span style={{ fontWeight: 700, color: '#a855f7' }}>ALL LOOPS MASTERED!</span>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}
                >
                    <Link href="/level2" className={`${styles.navBtn} ${styles.secondary}`}>Review Lessons</Link>
                    <Link href="/level2/lesson18" className={`${styles.navBtn} ${styles.primary}`}>Final Project! <ChevronRight size={18} /></Link>
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
                {/* Title */}
                <div className={styles.lessonTitle}>
                    <motion.div
                        className={styles.lessonEmoji}
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        {LESSON.emoji}
                    </motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1>{LESSON.title}</h1>
                        <p>Practice: <code>{LESSON.concept}</code></p>
                    </div>
                </div>

                {/* Story/Mission */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.explainBox}
                    style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.25))' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Trophy size={28} className="text-amber-400" />
                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>The ULTIMATE Loop Challenge!</span>
                    </div>
                    <p>
                        Combine EVERYTHING you've learned: <code>while</code>, <code>for</code>, <code>break</code>, and <code>continue</code>!
                    </p>
                    <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>
                        Complete all 3 challenges to earn <strong>+{LESSON.xpReward} XP</strong> and prove you're a Loop Legend!
                    </p>
                </motion.div>

                {/* Progress Tracker */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1rem',
                    marginBottom: '2rem',
                    padding: '1rem',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: 'var(--radius)'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: challenge1Done ? '#10b981' : 'rgba(255,255,255,0.1)',
                            border: challenge1Done ? 'none' : '2px solid rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 0.5rem'
                        }}>
                            {challenge1Done ? <Check size={20} /> : '1'}
                        </div>
                        <span style={{ fontSize: '0.8rem', color: challenge1Done ? '#10b981' : 'var(--text-muted)' }}>break</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: challenge2Done ? '#10b981' : 'rgba(255,255,255,0.1)',
                            border: challenge2Done ? 'none' : '2px solid rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 0.5rem'
                        }}>
                            {challenge2Done ? <Check size={20} /> : '2'}
                        </div>
                        <span style={{ fontSize: '0.8rem', color: challenge2Done ? '#10b981' : 'var(--text-muted)' }}>continue</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: challenge3Done ? '#10b981' : 'rgba(255,255,255,0.1)',
                            border: challenge3Done ? 'none' : '2px solid rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 0.5rem'
                        }}>
                            {challenge3Done ? <Check size={20} /> : '3'}
                        </div>
                        <span style={{ fontSize: '0.8rem', color: challenge3Done ? '#10b981' : 'var(--text-muted)' }}>while</span>
                    </div>
                </div>

                {/* Challenge 1: Use break - Find first number divisible by 7 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                        background: challenge1Done ? 'rgba(16, 185, 129, 0.1)' : 'var(--surface)',
                        border: challenge1Done ? '2px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255,255,255,0.05)',
                        borderRadius: 'var(--radius)',
                        padding: '1.5rem',
                        marginBottom: '1.5rem'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: challenge1Done ? '#10b981' : '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700
                        }}>
                            {challenge1Done ? <Check size={18} /> : '1'}
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontWeight: 700 }}>Use break: Find First Divisible by 7</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Find the first number between 1-50 that's divisible by 7</p>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        <strong>Goal:</strong> Loop through 1-50, find first number where <code>i % 7 == 0</code>, print it, and <code>break</code>!
                    </div>

                    <div className={styles.editor}>
                        <div className={styles.codeHeader}>
                            <span>challenge1.py</span>
                            <span style={{ color: challenge1Done ? '#10b981' : 'var(--text-muted)' }}>{challenge1Done ? 'Complete!' : 'Python'}</span>
                        </div>
                        <textarea
                            value={challenge1Code}
                            onChange={(e) => setChallenge1Code(e.target.value)}
                            placeholder={'for i in range(1, 51):\n    if i % 7 == 0:\n        print(i)\n        break'}
                            spellCheck={false}
                            style={{ minHeight: '120px' }}
                            disabled={challenge1Done}
                        />
                    </div>

                    {!challenge1Done && (
                        <button className={styles.runBtn} onClick={runChallenge1}>
                            <Play size={18} /> Run Code
                        </button>
                    )}

                    {challenge1Output && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.outputBox} style={{ borderColor: challenge1Done ? 'rgba(16, 185, 129, 0.5)' : undefined }}>
                            <div className={styles.outputLabel}>{challenge1Done ? 'Correct!' : 'Output:'}</div>
                            <div className={styles.outputText}>{challenge1Output}</div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Challenge 2: Use continue - Print 1-10 skip multiples of 3 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        background: challenge2Done ? 'rgba(16, 185, 129, 0.1)' : 'var(--surface)',
                        border: challenge2Done ? '2px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255,255,255,0.05)',
                        borderRadius: 'var(--radius)',
                        padding: '1.5rem',
                        marginBottom: '1.5rem'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: challenge2Done ? '#10b981' : '#f59e0b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700
                        }}>
                            {challenge2Done ? <Check size={18} /> : '2'}
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontWeight: 700 }}>Use continue: Skip Multiples of 3</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Print 1-10 but skip 3, 6, and 9</p>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        <strong>Goal:</strong> Loop 1-10, if <code>i % 3 == 0</code> use <code>continue</code> to skip, otherwise print!
                    </div>

                    <div className={styles.editor}>
                        <div className={styles.codeHeader}>
                            <span>challenge2.py</span>
                            <span style={{ color: challenge2Done ? '#10b981' : 'var(--text-muted)' }}>{challenge2Done ? 'Complete!' : 'Python'}</span>
                        </div>
                        <textarea
                            value={challenge2Code}
                            onChange={(e) => setChallenge2Code(e.target.value)}
                            placeholder={'for i in range(1, 11):\n    if i % 3 == 0:\n        continue\n    print(i)'}
                            spellCheck={false}
                            style={{ minHeight: '120px' }}
                            disabled={challenge2Done}
                        />
                    </div>

                    {!challenge2Done && (
                        <button className={styles.runBtn} onClick={runChallenge2}>
                            <Play size={18} /> Run Code
                        </button>
                    )}

                    {challenge2Output && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.outputBox} style={{ borderColor: challenge2Done ? 'rgba(16, 185, 129, 0.5)' : undefined }}>
                            <div className={styles.outputLabel}>{challenge2Done ? 'Correct!' : 'Output:'}</div>
                            <div className={styles.outputText}>{challenge2Output}</div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Challenge 3: While loop - Double until > 500 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        background: challenge3Done ? 'rgba(16, 185, 129, 0.1)' : 'var(--surface)',
                        border: challenge3Done ? '2px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255,255,255,0.05)',
                        borderRadius: 'var(--radius)',
                        padding: '1.5rem',
                        marginBottom: '1.5rem'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: challenge3Done ? '#10b981' : '#8b5cf6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700
                        }}>
                            {challenge3Done ? <Check size={18} /> : '3'}
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontWeight: 700 }}>While Loop: Double Until 500</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Start at 1, keep doubling until you pass 500</p>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        <strong>Goal:</strong> Start with <code>num = 1</code>, use <code>while num &lt; 500</code>, double with <code>num *= 2</code>
                    </div>

                    <div className={styles.editor}>
                        <div className={styles.codeHeader}>
                            <span>challenge3.py</span>
                            <span style={{ color: challenge3Done ? '#10b981' : 'var(--text-muted)' }}>{challenge3Done ? 'Complete!' : 'Python'}</span>
                        </div>
                        <textarea
                            value={challenge3Code}
                            onChange={(e) => setChallenge3Code(e.target.value)}
                            placeholder={'num = 1\n\nwhile num < 500:\n    print(num)\n    num *= 2\n\nprint(num)  # Final number'}
                            spellCheck={false}
                            style={{ minHeight: '140px' }}
                            disabled={challenge3Done}
                        />
                    </div>

                    {!challenge3Done && (
                        <button className={styles.runBtn} onClick={runChallenge3}>
                            <Play size={18} /> Run Code
                        </button>
                    )}

                    {challenge3Output && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.outputBox} style={{ borderColor: challenge3Done ? 'rgba(16, 185, 129, 0.5)' : undefined }}>
                            <div className={styles.outputLabel}>{challenge3Done ? 'Correct!' : 'Output:'}</div>
                            <div className={styles.outputText}>{challenge3Output}</div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Claim XP Button */}
                {allChallengesDone && !xpClaimed && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        onClick={claimMainXp}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            width: '100%',
                            padding: '1rem',
                            marginBottom: '2rem',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: 'none',
                            borderRadius: 'var(--radius)',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            cursor: 'pointer'
                        }}
                    >
                        <Trophy size={20} /> Claim +{LESSON.xpReward} XP - Loop Legend Achieved!
                    </motion.button>
                )}

                {/* Tip Box */}
                <div className={styles.tipBox}>
                    <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                    <div>
                        <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Loop Control Cheat Sheet:</p>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                            <li><code>break</code> - Exit the loop immediately</li>
                            <li><code>continue</code> - Skip to next iteration</li>
                            <li><code>while</code> - Loop while condition is True</li>
                            <li><code>for</code> - Loop a specific number of times</li>
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
                        >
                            {String.fromCodePoint(0x26A1)}
                        </motion.span>
                        <div>
                            <h3 style={{ margin: 0, color: '#fbbf24', fontWeight: 800 }}>SUPERCHARGE - Bonus Challenge (+25 XP)</h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Build a Search Algorithm!</p>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <Search size={18} className="text-amber-400" />
                            <p style={{ margin: 0, fontWeight: 600 }}>Search Algorithm Challenge:</p>
                        </div>
                        <p style={{ margin: 0, marginBottom: '0.75rem' }}>
                            Build a simple search that finds a name in a list!
                        </p>
                        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.75rem', borderRadius: '0.25rem', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.6 }}>
                            <span style={{ color: '#6272a4' }}># Find a name in a list</span><br/>
                            <span style={{ color: '#ff79c6' }}>names</span> = [<span style={{ color: '#f1fa8c' }}>"Alice"</span>, <span style={{ color: '#f1fa8c' }}>"Bob"</span>, <span style={{ color: '#f1fa8c' }}>"Charlie"</span>, <span style={{ color: '#f1fa8c' }}>"Diana"</span>, <span style={{ color: '#f1fa8c' }}>"Eve"</span>]<br/>
                            <span style={{ color: '#ff79c6' }}>looking_for</span> = <span style={{ color: '#f1fa8c' }}>"Charlie"</span><br/>
                            <span style={{ color: '#ff79c6' }}>found</span> = <span style={{ color: '#bd93f9' }}>False</span><br/><br/>
                            <span style={{ color: '#ff79c6' }}>for</span> i <span style={{ color: '#ff79c6' }}>in</span> range(len(names)):<br/>
                            {'    '}<span style={{ color: '#ff79c6' }}>if</span> names[i] == looking_for:<br/>
                            {'        '}print(<span style={{ color: '#f1fa8c' }}>f"Found {'{looking_for}'} at position {'{i}'}!"</span>)<br/>
                            {'        '}found = <span style={{ color: '#bd93f9' }}>True</span><br/>
                            {'        '}<span style={{ color: '#ff79c6' }}>break</span><br/><br/>
                            <span style={{ color: '#ff79c6' }}>if not</span> found:<br/>
                            {'    '}print(<span style={{ color: '#f1fa8c' }}>f"{'{looking_for}'} not in list"</span>)
                        </div>
                        <p style={{ margin: '0.75rem 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Challenge: Try searching for different names, including ones NOT in the list!
                        </p>
                    </div>

                    <div className={styles.editor}>
                        <div className={styles.codeHeader}>
                            <span>supercharge.py</span>
                            <span style={{ color: '#fbbf24' }}>BONUS</span>
                        </div>
                        <textarea
                            value={superchargeCode}
                            onChange={(e) => setSuperchargeCode(e.target.value)}
                            placeholder={'# Build your search algorithm!\nnames = ["Alice", "Bob", "Charlie", "Diana", "Eve"]\nlooking_for = "Charlie"\nfound = False\n\nfor i in range(len(names)):\n    if names[i] == looking_for:\n        print(f"Found {looking_for} at position {i}!")\n        found = True\n        break\n\nif not found:\n    print(f"{looking_for} not in list")'}
                            spellCheck={false}
                            style={{ minHeight: '220px' }}
                            disabled={superchargeDone}
                        />
                    </div>

                    <button
                        className={styles.runBtn}
                        onClick={runSupercharge}
                        style={{ background: superchargeDone ? '#10b981' : '#f59e0b' }}
                        disabled={superchargeDone}
                    >
                        <Play size={18} /> {superchargeDone ? 'Search Complete!' : 'Test Search Algorithm'}
                    </button>

                    {superchargeOutput && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.outputBox}
                            style={{ borderColor: superchargeDone ? 'rgba(16, 185, 129, 0.5)' : undefined }}
                        >
                            <div className={styles.outputLabel}>{superchargeDone ? 'SUPERCHARGED!' : 'Output:'}</div>
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
                            <Check size={20} /> +25 XP Claimed! Algorithm Master!
                        </motion.div>
                    )}
                </motion.div>

                {/* Navigation */}
                <div className={styles.navBar}>
                    <Link href="/level2/lesson16" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                    {allChallengesDone ? (
                        <Link href="/level2/lesson18" className={`${styles.navBtn} ${styles.primary}`}>Final Project! <ChevronRight size={18} /></Link>
                    ) : (
                        <button className={`${styles.navBtn} ${styles.secondary}`} disabled style={{ opacity: 0.5 }}>Complete All Challenges <ChevronRight size={18} /></button>
                    )}
                </div>
            </div>
        </div>
    );
}
