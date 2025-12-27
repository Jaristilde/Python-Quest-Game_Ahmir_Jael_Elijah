'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Target } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL2_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL2_LESSONS[2]; // Lesson 3
const LESSON_ID = 18;

export default function Lesson3() {
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

    // Simple Python-like interpreter for if statements
    const runIfCode = (code: string, expectedOutput: string): { output: string; correct: boolean } => {
        const lines = code.trim().split('\n');
        let outputLines: string[] = [];
        const variables: { [key: string]: string | number | boolean } = {};

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            // Variable assignment: number = 5
            const numAssignMatch = trimmed.match(/^(\w+)\s*=\s*(-?\d+)$/);
            if (numAssignMatch) {
                variables[numAssignMatch[1]] = parseInt(numAssignMatch[2]);
                continue;
            }

            // Variable assignment: name = "Robo"
            const strAssignMatch = trimmed.match(/^(\w+)\s*=\s*["'](.*)["']$/);
            if (strAssignMatch) {
                variables[strAssignMatch[1]] = strAssignMatch[2];
                continue;
            }

            // If statement: if condition:
            const ifMatch = trimmed.match(/^if\s+(.+):$/);
            if (ifMatch) {
                const condition = ifMatch[1].trim();
                let conditionResult = false;

                // Evaluate condition
                // Check for: variable > 0
                const gtZeroMatch = condition.match(/^(\w+)\s*>\s*(\d+)$/);
                if (gtZeroMatch) {
                    const varName = gtZeroMatch[1];
                    const compareVal = parseInt(gtZeroMatch[2]);
                    if (typeof variables[varName] === 'number') {
                        conditionResult = (variables[varName] as number) > compareVal;
                    }
                }

                // Check for: variable >= value
                const gteMatch = condition.match(/^(\w+)\s*>=\s*(\d+)$/);
                if (gteMatch) {
                    const varName = gteMatch[1];
                    const compareVal = parseInt(gteMatch[2]);
                    if (typeof variables[varName] === 'number') {
                        conditionResult = (variables[varName] as number) >= compareVal;
                    }
                }

                // Check for: variable == "string"
                const eqStrMatch = condition.match(/^(\w+)\s*==\s*["'](.+)["']$/);
                if (eqStrMatch) {
                    const varName = eqStrMatch[1];
                    const compareVal = eqStrMatch[2];
                    conditionResult = variables[varName] === compareVal;
                }

                // Check for: len(variable) >= number
                const lenMatch = condition.match(/^len\s*\(\s*(\w+)\s*\)\s*>=\s*(\d+)$/);
                if (lenMatch) {
                    const varName = lenMatch[1];
                    const minLen = parseInt(lenMatch[2]);
                    if (typeof variables[varName] === 'string') {
                        conditionResult = (variables[varName] as string).length >= minLen;
                    }
                }

                // If condition is true, look for print on next indented line
                if (conditionResult && i + 1 < lines.length) {
                    const nextLine = lines[i + 1].trim();
                    const printMatch = nextLine.match(/^print\s*\((.+)\)$/);
                    if (printMatch) {
                        let content = printMatch[1].trim();
                        // Handle string literal
                        const strMatch = content.match(/^["'](.*)["']$/);
                        if (strMatch) {
                            outputLines.push(strMatch[1]);
                        }
                    }
                }
                continue;
            }
        }

        const output = outputLines.length > 0 ? outputLines.join('\n') : '(No output)';
        const correct = output.toLowerCase().includes(expectedOutput.toLowerCase());
        return { output, correct };
    };

    // Challenge 1: Check if number is positive
    const runChallenge1 = () => {
        const result = runIfCode(challenge1Code, 'Positive');
        setChallenge1Output(result.output);
        if (result.correct) {
            setChallenge1Done(true);
        }
    };

    // Challenge 2: Check if name equals "Robo"
    const runChallenge2 = () => {
        const result = runIfCode(challenge2Code, 'Hello Robo');
        setChallenge2Output(result.output);
        if (result.correct) {
            setChallenge2Done(true);
        }
    };

    // Challenge 3: Check if score >= 100
    const runChallenge3 = () => {
        const result = runIfCode(challenge3Code, 'You win');
        setChallenge3Output(result.output);
        if (result.correct) {
            setChallenge3Done(true);
        }
    };

    // Supercharge: Password checker
    const runSupercharge = () => {
        const lines = superchargeCode.trim().split('\n');
        let outputLines: string[] = [];
        const variables: { [key: string]: string | number } = {};
        let hasPasswordCheck = false;
        let hasLengthCheck = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            // Variable assignment
            const strAssignMatch = trimmed.match(/^(\w+)\s*=\s*["'](.*)["']$/);
            if (strAssignMatch) {
                variables[strAssignMatch[1]] = strAssignMatch[2];
                continue;
            }

            // If statement
            const ifMatch = trimmed.match(/^if\s+(.+):$/);
            if (ifMatch) {
                const condition = ifMatch[1].trim();
                let conditionResult = false;

                // Check for: password == "secret123"
                const eqMatch = condition.match(/^(\w+)\s*==\s*["'](.+)["']$/);
                if (eqMatch) {
                    const varName = eqMatch[1];
                    const compareVal = eqMatch[2];
                    if (variables[varName] === compareVal) {
                        conditionResult = true;
                        hasPasswordCheck = true;
                    }
                }

                // Check for: len(password) >= 8
                const lenMatch = condition.match(/^len\s*\(\s*(\w+)\s*\)\s*>=\s*(\d+)$/);
                if (lenMatch) {
                    const varName = lenMatch[1];
                    const minLen = parseInt(lenMatch[2]);
                    if (typeof variables[varName] === 'string' && (variables[varName] as string).length >= minLen) {
                        conditionResult = true;
                        hasLengthCheck = true;
                    }
                }

                // Combined condition with 'and'
                const andMatch = condition.match(/^(\w+)\s*==\s*["'](.+)["']\s+and\s+len\s*\(\s*(\w+)\s*\)\s*>=\s*(\d+)$/);
                if (andMatch) {
                    const varName1 = andMatch[1];
                    const compareVal = andMatch[2];
                    const varName2 = andMatch[3];
                    const minLen = parseInt(andMatch[4]);
                    const passCheck = variables[varName1] === compareVal;
                    const lenCheck = typeof variables[varName2] === 'string' && (variables[varName2] as string).length >= minLen;
                    if (passCheck && lenCheck) {
                        conditionResult = true;
                        hasPasswordCheck = true;
                        hasLengthCheck = true;
                    }
                }

                // If condition is true, look for print on next indented line
                if (conditionResult && i + 1 < lines.length) {
                    const nextLine = lines[i + 1].trim();
                    const printMatch = nextLine.match(/^print\s*\((.+)\)$/);
                    if (printMatch) {
                        let content = printMatch[1].trim();
                        const strMatch = content.match(/^["'](.*)["']$/);
                        if (strMatch) {
                            outputLines.push(strMatch[1]);
                        }
                    }
                }
                continue;
            }
        }

        const output = outputLines.length > 0 ? outputLines.join('\n') : '(No output - password not matching or too short)';
        setSuperchargeOutput(output);

        // Check if both conditions are used and output contains "Access granted"
        if ((hasPasswordCheck || hasLengthCheck) && output.toLowerCase().includes('access granted')) {
            setSuperchargeDone(true);
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
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ fontSize: '3rem' }}>🎯</motion.div>
                </div>
            </div>
        );
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', duration: 0.8 }} className={styles.successIcon}>
                    <Check size={50} className="text-white" />
                </motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle}>PRACTICE CHAMPION!</motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                    <Link href="/level2/lesson4" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link>
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
                    <motion.div className={styles.lessonEmoji} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>{LESSON.emoji}</motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1>{LESSON.title}</h1>
                        <p>Practice: <code>{LESSON.concept}</code></p>
                    </div>
                </div>

                {/* Story/Mission */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(236, 72, 153, 0.15))' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Target size={28} className="text-indigo-400" />
                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Time to Test Your Skills!</span>
                    </div>
                    <p>
                        Robo has <strong>3 challenges</strong> for you to solve using <code>if</code> statements and conditions.
                    </p>
                    <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>
                        Complete all 3 to earn <strong>+{LESSON.xpReward} XP</strong>!
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
                        <span style={{ fontSize: '0.8rem', color: challenge1Done ? '#10b981' : 'var(--text-muted)' }}>Positive</span>
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
                        <span style={{ fontSize: '0.8rem', color: challenge2Done ? '#10b981' : 'var(--text-muted)' }}>Name</span>
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
                        <span style={{ fontSize: '0.8rem', color: challenge3Done ? '#10b981' : 'var(--text-muted)' }}>Score</span>
                    </div>
                </div>

                {/* Challenge 1: Check if positive */}
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
                            background: challenge1Done ? '#10b981' : 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700
                        }}>
                            {challenge1Done ? <Check size={18} /> : '1'}
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontWeight: 700 }}>Check if a Number is Positive</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Print "Positive!" if number is greater than 0</p>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        <strong>Expected Output:</strong> <code style={{ color: '#50fa7b' }}>Positive!</code>
                    </div>

                    <div className={styles.editor}>
                        <div className={styles.codeHeader}>
                            <span>challenge1.py</span>
                            <span style={{ color: challenge1Done ? '#10b981' : 'var(--text-muted)' }}>{challenge1Done ? 'Complete!' : 'Python'}</span>
                        </div>
                        <textarea
                            value={challenge1Code}
                            onChange={(e) => setChallenge1Code(e.target.value)}
                            placeholder={'number = 5\n\nif number > 0:\n    print("Positive!")'}
                            spellCheck={false}
                            style={{ minHeight: '100px' }}
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

                {/* Challenge 2: Check if name equals Robo */}
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
                            background: challenge2Done ? '#10b981' : 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700
                        }}>
                            {challenge2Done ? <Check size={18} /> : '2'}
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontWeight: 700 }}>Check if Name equals "Robo"</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Print "Hello Robo!" if name is exactly "Robo"</p>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        <strong>Expected Output:</strong> <code style={{ color: '#50fa7b' }}>Hello Robo!</code>
                    </div>

                    <div className={styles.editor}>
                        <div className={styles.codeHeader}>
                            <span>challenge2.py</span>
                            <span style={{ color: challenge2Done ? '#10b981' : 'var(--text-muted)' }}>{challenge2Done ? 'Complete!' : 'Python'}</span>
                        </div>
                        <textarea
                            value={challenge2Code}
                            onChange={(e) => setChallenge2Code(e.target.value)}
                            placeholder={'name = "Robo"\n\nif name == "Robo":\n    print("Hello Robo!")'}
                            spellCheck={false}
                            style={{ minHeight: '100px' }}
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

                {/* Challenge 3: Check if score >= 100 */}
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
                            background: challenge3Done ? '#10b981' : 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700
                        }}>
                            {challenge3Done ? <Check size={18} /> : '3'}
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontWeight: 700 }}>Check if Score is High Enough</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Print "You win!" if score is 100 or more</p>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        <strong>Expected Output:</strong> <code style={{ color: '#50fa7b' }}>You win!</code>
                    </div>

                    <div className={styles.editor}>
                        <div className={styles.codeHeader}>
                            <span>challenge3.py</span>
                            <span style={{ color: challenge3Done ? '#10b981' : 'var(--text-muted)' }}>{challenge3Done ? 'Complete!' : 'Python'}</span>
                        </div>
                        <textarea
                            value={challenge3Code}
                            onChange={(e) => setChallenge3Code(e.target.value)}
                            placeholder={'score = 150\n\nif score >= 100:\n    print("You win!")'}
                            spellCheck={false}
                            style={{ minHeight: '100px' }}
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
                        <Zap size={20} fill="currentColor" /> Claim +{LESSON.xpReward} XP - All Challenges Complete!
                    </motion.button>
                )}

                {/* Tip Box */}
                <div className={styles.tipBox}>
                    <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                    <div>
                        <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Remember:</p>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                            <li><code>&gt;</code> means "greater than"</li>
                            <li><code>&gt;=</code> means "greater than or equal"</li>
                            <li><code>==</code> means "equals" (use two equal signs!)</li>
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
                            <h3 style={{ margin: 0, color: '#fbbf24', fontWeight: 800 }}>SUPERCHARGE - Bonus Challenge</h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Optional  +25 XP  Not required to advance</p>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        <p style={{ margin: 0, fontWeight: 600, marginBottom: '0.5rem' }}>Password Checker Challenge:</p>
                        <p style={{ margin: 0 }}>
                            Create a password checker that:
                        </p>
                        <ul style={{ margin: '0.5rem 0', paddingLeft: '1.25rem' }}>
                            <li>Checks if password equals <code>"secret123"</code></li>
                            <li>Checks if password length is at least 8 characters using <code>len()</code></li>
                            <li>Prints <code>"Access granted!"</code> if correct</li>
                        </ul>
                        <p style={{ margin: '0.75rem 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Hint: Use <code>len(password) &gt;= 8</code> to check length, or combine with <code>and</code>!
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
                            placeholder={'password = "secret123"\n\nif password == "secret123":\n    print("Access granted!")\n\n# Bonus: Also check length!\n# if len(password) >= 8:\n#     print("Password is long enough!")'}
                            spellCheck={false}
                            style={{ minHeight: '160px' }}
                            disabled={superchargeDone}
                        />
                    </div>

                    <button
                        className={styles.runBtn}
                        onClick={runSupercharge}
                        style={{ background: superchargeDone ? '#10b981' : '#f59e0b' }}
                        disabled={superchargeDone}
                    >
                        <Play size={18} /> {superchargeDone ? 'Access Granted!' : 'Test Password Checker'}
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
                            <Check size={20} /> +25 XP Claimed! Security Expert!
                        </motion.div>
                    )}
                </motion.div>

                {/* Navigation */}
                <div className={styles.navBar}>
                    <Link href="/level2/lesson2" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                    {allChallengesDone ? (
                        <Link href="/level2/lesson4" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link>
                    ) : (
                        <button className={`${styles.navBtn} ${styles.secondary}`} disabled style={{ opacity: 0.5 }}>Complete All Challenges <ChevronRight size={18} /></button>
                    )}
                </div>
            </div>
        </div>
    );
}
