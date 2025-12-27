'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Target } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL3_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL3_LESSONS[6]; // Lesson 7 (index 6)
const LESSON_ID = 40;

interface ChallengeState {
    code: string;
    output: string;
    completed: boolean;
}

export default function Lesson7() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    // Challenge states
    const [challenge1, setChallenge1] = useState<ChallengeState>({ code: '', output: '', completed: false });
    const [challenge2, setChallenge2] = useState<ChallengeState>({ code: '', output: '', completed: false });
    const [challenge3, setChallenge3] = useState<ChallengeState>({ code: '', output: '', completed: false });

    // Supercharge state
    const [superchargeCode, setSuperchargeCode] = useState('');
    const [superchargeOutput, setSuperchargeOutput] = useState('');
    const [superchargeDone, setSuperchargeDone] = useState(false);
    const [superchargeXpClaimed, setSuperchargeXpClaimed] = useState(false);

    // Lesson completion
    const [lessonComplete, setLessonComplete] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    // Check if all main challenges are completed
    const allChallengesComplete = challenge1.completed && challenge2.completed && challenge3.completed;

    // Run Challenge 1: Print All Names
    const runChallenge1 = () => {
        try {
            const code = challenge1.code.trim();
            const lines = code.split('\n');
            let names: string[] = [];
            let outputLines: string[] = [];
            let hasForLoop = false;
            let hasHelloPrefix = false;

            // Parse the code
            for (const line of lines) {
                const trimmed = line.trim();

                // Check for list assignment
                const listMatch = trimmed.match(/^(\w+)\s*=\s*\[(.+)\]$/);
                if (listMatch) {
                    const listContent = listMatch[2];
                    // Extract strings from the list
                    const stringMatches = listContent.match(/["']([^"']+)["']/g);
                    if (stringMatches) {
                        names = stringMatches.map(s => s.replace(/["']/g, ''));
                    }
                    continue;
                }

                // Check for for loop
                if (trimmed.startsWith('for ') && trimmed.includes(' in ')) {
                    hasForLoop = true;
                }

                // Check for print with Hello
                if (trimmed.includes('print') && (trimmed.includes('Hello') || trimmed.includes('hello'))) {
                    hasHelloPrefix = true;
                }
            }

            // Simulate the output
            if (hasForLoop && names.length >= 4) {
                for (const name of names) {
                    if (hasHelloPrefix) {
                        outputLines.push(`Hello, ${name}`);
                    } else {
                        outputLines.push(name);
                    }
                }
            }

            const output = outputLines.length > 0 ? outputLines.join('\n') : 'Create a list of 4 names and loop through them with "Hello, "!';
            const completed = hasForLoop && names.length >= 4 && hasHelloPrefix && outputLines.length >= 4;

            setChallenge1({ ...challenge1, output, completed });
        } catch {
            setChallenge1({ ...challenge1, output: 'Error in code!' });
        }
    };

    // Run Challenge 2: Find the Number
    const runChallenge2 = () => {
        try {
            const code = challenge2.code.trim();
            const lines = code.split('\n');
            let numbers: number[] = [];
            let outputLines: string[] = [];
            let hasForLoop = false;
            let hasIfCondition = false;

            // Parse the code
            for (const line of lines) {
                const trimmed = line.trim();

                // Check for list assignment with numbers
                const listMatch = trimmed.match(/^(\w+)\s*=\s*\[(.+)\]$/);
                if (listMatch) {
                    const listContent = listMatch[2];
                    const numMatches = listContent.match(/\d+/g);
                    if (numMatches) {
                        numbers = numMatches.map(n => parseInt(n));
                    }
                    continue;
                }

                // Check for for loop
                if (trimmed.startsWith('for ') && trimmed.includes(' in ')) {
                    hasForLoop = true;
                }

                // Check for if with > 10
                if (trimmed.includes('if ') && trimmed.includes('> 10')) {
                    hasIfCondition = true;
                }
            }

            // Simulate the output - print numbers > 10
            if (hasForLoop && hasIfCondition && numbers.length > 0) {
                for (const num of numbers) {
                    if (num > 10) {
                        outputLines.push(String(num));
                    }
                }
            }

            // Check for correct list [5, 10, 15, 20]
            const hasCorrectList = numbers.includes(5) && numbers.includes(10) && numbers.includes(15) && numbers.includes(20);

            const output = outputLines.length > 0 ? outputLines.join('\n') : 'Use numbers = [5, 10, 15, 20] and loop to find numbers > 10!';
            const completed = hasForLoop && hasIfCondition && hasCorrectList && outputLines.length === 2; // 15 and 20

            setChallenge2({ ...challenge2, output, completed });
        } catch {
            setChallenge2({ ...challenge2, output: 'Error in code!' });
        }
    };

    // Run Challenge 3: Guest Checker
    const runChallenge3 = () => {
        try {
            const code = challenge3.code.trim();
            let outputLines: string[] = [];
            let hasGuestList = false;
            let hasIfIn = false;
            let hasSamCheck = false;

            // Check for guest list
            if (code.includes('[') && code.includes(']')) {
                hasGuestList = true;
            }

            // Check for if with in
            if (code.includes('if ') && code.includes(' in ')) {
                hasIfIn = true;
            }

            // Check for Sam check
            if (code.includes('"Sam"') || code.includes("'Sam'")) {
                hasSamCheck = true;
            }

            // Simulate output
            if (hasIfIn && hasSamCheck) {
                // Check if Sam is in the guest list
                const listMatch = code.match(/\[([^\]]+)\]/);
                if (listMatch) {
                    const listContent = listMatch[1];
                    const isSamInList = listContent.includes('"Sam"') || listContent.includes("'Sam'");

                    // Find the print statement
                    const lines = code.split('\n');
                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (line.includes('if ') && (line.includes('"Sam"') || line.includes("'Sam'"))) {
                            // Look for the if block print
                            if (i + 1 < lines.length) {
                                const nextLine = lines[i + 1].trim();
                                const printMatch = nextLine.match(/print\s*\(\s*["'](.*)["']\s*\)/);
                                if (printMatch && isSamInList) {
                                    outputLines.push(printMatch[1]);
                                }
                            }
                        }
                        if (line === 'else:' && !isSamInList) {
                            if (i + 1 < lines.length) {
                                const nextLine = lines[i + 1].trim();
                                const printMatch = nextLine.match(/print\s*\(\s*["'](.*)["']\s*\)/);
                                if (printMatch) {
                                    outputLines.push(printMatch[1]);
                                }
                            }
                        }
                    }
                }
            }

            const output = outputLines.length > 0 ? outputLines.join('\n') : 'Check if "Sam" is in your guest list using "if ... in ..."!';
            const completed = hasGuestList && hasIfIn && hasSamCheck && outputLines.length > 0;

            setChallenge3({ ...challenge3, output, completed });
        } catch {
            setChallenge3({ ...challenge3, output: 'Error in code!' });
        }
    };

    // Run Supercharge: Party Planner
    const runSupercharge = () => {
        try {
            const code = superchargeCode.trim();
            const lines = code.split('\n');
            let vips: string[] = [];
            let guests: string[] = [];
            let outputLines: string[] = [];
            let hasVipList = false;
            let hasGuestList = false;
            let hasForLoop = false;
            let hasIfIn = false;

            // Parse lists
            for (const line of lines) {
                const trimmed = line.trim();

                // VIP list
                const vipMatch = trimmed.match(/^vips?\s*=\s*\[(.+)\]$/i);
                if (vipMatch) {
                    const listContent = vipMatch[1];
                    const stringMatches = listContent.match(/["']([^"']+)["']/g);
                    if (stringMatches) {
                        vips = stringMatches.map(s => s.replace(/["']/g, ''));
                        hasVipList = true;
                    }
                    continue;
                }

                // Guest list
                const guestMatch = trimmed.match(/^guests?\s*=\s*\[(.+)\]$/i);
                if (guestMatch) {
                    const listContent = guestMatch[1];
                    const stringMatches = listContent.match(/["']([^"']+)["']/g);
                    if (stringMatches) {
                        guests = stringMatches.map(s => s.replace(/["']/g, ''));
                        hasGuestList = true;
                    }
                    continue;
                }

                // Check for for loop
                if (trimmed.startsWith('for ') && trimmed.includes(' in ')) {
                    hasForLoop = true;
                }

                // Check for if with in (for VIP check)
                if (trimmed.includes('if ') && trimmed.includes(' in ') && trimmed.includes('vip')) {
                    hasIfIn = true;
                }
            }

            // Simulate the output
            if (hasForLoop && hasVipList && hasGuestList && guests.length > 0) {
                for (const guest of guests) {
                    if (vips.includes(guest)) {
                        outputLines.push(`${guest} - VIP!`);
                    } else {
                        outputLines.push(`${guest} - Regular`);
                    }
                }
            }

            const output = outputLines.length > 0
                ? outputLines.join('\n')
                : 'Create vips and guests lists, then loop through guests to check VIP status!';
            setSuperchargeOutput(output);

            // Check if challenge is complete
            const hasCorrectVips = vips.length >= 2;
            const hasCorrectGuests = guests.length >= 4;
            const hasVipOutput = outputLines.some(line => line.includes('VIP'));
            const hasRegularOutput = outputLines.some(line => line.includes('Regular'));

            if (hasForLoop && hasIfIn && hasCorrectVips && hasCorrectGuests && hasVipOutput && hasRegularOutput) {
                setSuperchargeDone(true);
            }
        } catch {
            setSuperchargeOutput('Error in code!');
        }
    };

    // Complete lesson when all challenges are done
    const completeLessonHandler = () => {
        addXpAndCoins(LESSON.xpReward, 5);
        completeLevel(LESSON_ID, LESSON.xpReward, 5, 1, 60);
        setLessonComplete(true);
    };

    const claimSuperchargeXp = () => {
        if (!superchargeXpClaimed && superchargeDone) {
            addXpAndCoins(25, 0);
            setSuperchargeXpClaimed(true);
        }
    };

    if (isLoading || !user) return <div className={styles.container}><div className="flex items-center justify-center h-screen text-slate-400">Loading...</div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}><Check size={50} className="text-white" /></motion.div>
                <h2 className={styles.successTitle}>{LESSON.successMessage}</h2>
                <p className={styles.successMessage}>You've mastered combining loops and lists together!</p>
                <div className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</div>
                <Link href="/level3/lesson8" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link>
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
                <div className={styles.lessonTitle}>
                    <motion.div className={styles.lessonEmoji} animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>{LESSON.emoji}</motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1>{LESSON.title}</h1>
                        <p>Practice: <code>{LESSON.concept}</code></p>
                    </div>
                </div>

                {/* Story/Mission Box */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <Target size={24} className="text-purple-400" />
                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Time to Practice!</span>
                    </div>
                    <p style={{ fontSize: '1.1rem' }}>
                        You've learned <strong>for loops</strong> and how to check <strong>if items are in lists</strong>!
                    </p>
                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                        Now let's combine these powerful tools with some fun challenges!
                    </p>
                </motion.div>

                {/* Progress Tracker */}
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: 'var(--radius)'
                }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            margin: '0 auto 0.25rem',
                            borderRadius: '50%',
                            background: challenge1.completed ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {challenge1.completed ? <Check size={18} /> : '1'}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Names</span>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            margin: '0 auto 0.25rem',
                            borderRadius: '50%',
                            background: challenge2.completed ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {challenge2.completed ? <Check size={18} /> : '2'}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Numbers</span>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            margin: '0 auto 0.25rem',
                            borderRadius: '50%',
                            background: challenge3.completed ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {challenge3.completed ? <Check size={18} /> : '3'}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Guests</span>
                    </div>
                </div>

                {/* Challenge 1: Print All Names */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={styles.codeSection}
                    style={{
                        border: challenge1.completed ? '2px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 'var(--radius)',
                        padding: '1.5rem',
                        marginBottom: '1.5rem'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>1. Print All Names</span>
                        {challenge1.completed && <Check size={20} className="text-emerald-400" />}
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        <p style={{ margin: 0, fontWeight: 600 }}>Loop through a list of 4 names and greet each one:</p>
                        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <li>Create a list with 4 names</li>
                            <li>Use a for loop to go through each name</li>
                            <li>Print "Hello, " followed by each name</li>
                        </ul>
                    </div>
                    <div className={styles.editor}>
                        <div className={styles.codeHeader}><span>names.py</span><span>Python</span></div>
                        <textarea
                            value={challenge1.code}
                            onChange={(e) => setChallenge1({ ...challenge1, code: e.target.value })}
                            placeholder={'names = ["Alice", "Bob", "Charlie", "Diana"]\n\nfor name in names:\n    print("Hello, " + name)'}
                            spellCheck={false}
                            style={{ minHeight: '140px' }}
                        />
                    </div>
                    <button className={styles.runBtn} onClick={runChallenge1} style={{ background: challenge1.completed ? '#10b981' : undefined }}>
                        <Play size={18} /> {challenge1.completed ? 'Completed!' : 'Run Code'}
                    </button>
                    {challenge1.output && (
                        <div className={styles.outputBox} style={{ borderColor: challenge1.completed ? 'rgba(16, 185, 129, 0.5)' : undefined }}>
                            <div className={styles.outputLabel}>{challenge1.completed ? 'Perfect!' : 'Output:'}</div>
                            <div className={styles.outputText}>{challenge1.output}</div>
                        </div>
                    )}
                </motion.div>

                {/* Challenge 2: Find the Number */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className={styles.codeSection}
                    style={{
                        border: challenge2.completed ? '2px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 'var(--radius)',
                        padding: '1.5rem',
                        marginBottom: '1.5rem'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>2. Find the Number</span>
                        {challenge2.completed && <Check size={20} className="text-emerald-400" />}
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        <p style={{ margin: 0, fontWeight: 600 }}>Filter numbers greater than 10:</p>
                        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <li>Use: <code>numbers = [5, 10, 15, 20]</code></li>
                            <li>Loop through the list</li>
                            <li>Only print numbers greater than 10</li>
                        </ul>
                    </div>
                    <div className={styles.editor}>
                        <div className={styles.codeHeader}><span>filter.py</span><span>Python</span></div>
                        <textarea
                            value={challenge2.code}
                            onChange={(e) => setChallenge2({ ...challenge2, code: e.target.value })}
                            placeholder={'numbers = [5, 10, 15, 20]\n\nfor num in numbers:\n    if num > 10:\n        print(num)'}
                            spellCheck={false}
                            style={{ minHeight: '140px' }}
                        />
                    </div>
                    <button className={styles.runBtn} onClick={runChallenge2} style={{ background: challenge2.completed ? '#10b981' : undefined }}>
                        <Play size={18} /> {challenge2.completed ? 'Completed!' : 'Run Code'}
                    </button>
                    {challenge2.output && (
                        <div className={styles.outputBox} style={{ borderColor: challenge2.completed ? 'rgba(16, 185, 129, 0.5)' : undefined }}>
                            <div className={styles.outputLabel}>{challenge2.completed ? 'Perfect!' : 'Output:'}</div>
                            <div className={styles.outputText}>{challenge2.output}</div>
                        </div>
                    )}
                </motion.div>

                {/* Challenge 3: Guest Checker */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className={styles.codeSection}
                    style={{
                        border: challenge3.completed ? '2px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 'var(--radius)',
                        padding: '1.5rem',
                        marginBottom: '1.5rem'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>3. Guest Checker</span>
                        {challenge3.completed && <Check size={20} className="text-emerald-400" />}
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        <p style={{ margin: 0, fontWeight: 600 }}>Check if "Sam" is on the guest list:</p>
                        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <li>Create a guest list (include or exclude Sam!)</li>
                            <li>Use <code>if "Sam" in guests:</code> to check</li>
                            <li>Print a welcome or "not on list" message</li>
                        </ul>
                    </div>
                    <div className={styles.editor}>
                        <div className={styles.codeHeader}><span>guests.py</span><span>Python</span></div>
                        <textarea
                            value={challenge3.code}
                            onChange={(e) => setChallenge3({ ...challenge3, code: e.target.value })}
                            placeholder={'guests = ["Alex", "Sam", "Jordan", "Taylor"]\n\nif "Sam" in guests:\n    print("Welcome to the party, Sam!")\nelse:\n    print("Sorry, Sam is not on the list")'}
                            spellCheck={false}
                            style={{ minHeight: '160px' }}
                        />
                    </div>
                    <button className={styles.runBtn} onClick={runChallenge3} style={{ background: challenge3.completed ? '#10b981' : undefined }}>
                        <Play size={18} /> {challenge3.completed ? 'Completed!' : 'Run Code'}
                    </button>
                    {challenge3.output && (
                        <div className={styles.outputBox} style={{ borderColor: challenge3.completed ? 'rgba(16, 185, 129, 0.5)' : undefined }}>
                            <div className={styles.outputLabel}>{challenge3.completed ? 'Perfect!' : 'Output:'}</div>
                            <div className={styles.outputText}>{challenge3.output}</div>
                        </div>
                    )}
                </motion.div>

                {/* Tip Box */}
                <div className={styles.tipBox}>
                    <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                    <div>
                        <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Remember:</p>
                        <p style={{ margin: 0 }}><code>for item in list:</code> visits every item | <code>if x in list:</code> checks membership</p>
                    </div>
                </div>

                {/* SUPERCHARGE Bonus Challenge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
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
                            <h3 style={{ margin: 0, color: '#fbbf24', fontWeight: 800 }}>SUPERCHARGE - Party Planner</h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Optional +25 XP</p>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        <p style={{ margin: 0, fontWeight: 600, marginBottom: '0.5rem' }}>VIP Guest Checker!</p>
                        <p style={{ margin: 0, marginBottom: '0.75rem' }}>
                            You have a VIP list and a guest list. Loop through guests and identify who's a VIP!
                        </p>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <li>Create a <code>vips</code> list with at least 2 VIPs</li>
                            <li>Create a <code>guests</code> list with at least 4 guests</li>
                            <li>Loop through guests and check if each is in vips</li>
                            <li>Print "Name - VIP!" or "Name - Regular" for each</li>
                        </ul>
                        <div style={{
                            marginTop: '0.75rem',
                            padding: '0.75rem',
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '0.5rem',
                            fontFamily: 'monospace',
                            fontSize: '0.85rem'
                        }}>
                            <div style={{ color: '#6272a4' }}># Expected output example:</div>
                            <div style={{ color: '#50fa7b' }}>Alice - VIP!</div>
                            <div style={{ color: '#50fa7b' }}>Charlie - Regular</div>
                            <div style={{ color: '#50fa7b' }}>Bob - VIP!</div>
                            <div style={{ color: '#50fa7b' }}>Dave - Regular</div>
                        </div>
                    </div>

                    <div className={styles.editor}>
                        <div className={styles.codeHeader}>
                            <span>party.py</span>
                            <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>&#9889; BONUS</span>
                        </div>
                        <textarea
                            value={superchargeCode}
                            onChange={(e) => setSuperchargeCode(e.target.value)}
                            placeholder={'vips = ["Alice", "Bob"]\nguests = ["Alice", "Charlie", "Bob", "Dave"]\n\nfor guest in guests:\n    if guest in vips:\n        print(guest + " - VIP!")\n    else:\n        print(guest + " - Regular")'}
                            spellCheck={false}
                            style={{ minHeight: '200px' }}
                        />
                    </div>

                    <button
                        className={styles.runBtn}
                        onClick={runSupercharge}
                        style={{ background: superchargeDone ? '#10b981' : '#f59e0b' }}
                    >
                        <Play size={18} /> {superchargeDone ? 'Challenge Complete!' : 'Test Supercharge'}
                    </button>

                    {superchargeOutput && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.outputBox}
                            style={{ borderColor: superchargeDone ? 'rgba(16, 185, 129, 0.5)' : 'rgba(251, 191, 36, 0.5)' }}
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
                            <Check size={20} /> +25 XP Claimed! Party Planner Pro!
                        </motion.div>
                    )}
                </motion.div>

                {/* Complete Lesson Button */}
                {allChallengesComplete && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ marginTop: '2rem', textAlign: 'center' }}
                    >
                        <button
                            onClick={completeLessonHandler}
                            className={`${styles.navBtn} ${styles.primary}`}
                            style={{
                                padding: '1rem 2rem',
                                fontSize: '1.1rem',
                                background: 'linear-gradient(135deg, #10b981, #059669)'
                            }}
                        >
                            <Check size={20} /> Complete Lesson & Claim {LESSON.xpReward} XP <ChevronRight size={18} />
                        </button>
                    </motion.div>
                )}

                <div className={styles.navBar}>
                    <Link href="/level3/lesson6" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                    {!allChallengesComplete && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Complete all 3 challenges to continue
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
