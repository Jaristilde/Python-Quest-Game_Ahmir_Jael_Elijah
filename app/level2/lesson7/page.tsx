'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Target } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL2_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL2_LESSONS[6]; // Lesson 7
const LESSON_ID = 22;

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

    // Run Challenge 1: Weather Advisor
    const runChallenge1 = () => {
        try {
            const lines = challenge1.code.trim().split('\n');
            let sunny = false;
            let warm = false;
            let outputLines: string[] = [];

            for (const line of lines) {
                const trimmed = line.trim();

                // Variable assignments
                const boolMatch = trimmed.match(/^(\w+)\s*=\s*(True|False)$/);
                if (boolMatch) {
                    if (boolMatch[1] === 'sunny') sunny = boolMatch[2] === 'True';
                    if (boolMatch[1] === 'warm') warm = boolMatch[2] === 'True';
                    continue;
                }

                // Check for correct if/elif/else pattern with and
                if (trimmed.startsWith('if ') && trimmed.includes('sunny') && trimmed.includes('and') && trimmed.includes('warm')) {
                    // Check the condition
                    if (sunny && warm) {
                        // Look for print in next line
                        const idx = lines.indexOf(line);
                        if (idx + 1 < lines.length) {
                            const nextLine = lines[idx + 1].trim();
                            const printMatch = nextLine.match(/^print\s*\(["'](.*)["']\)$/);
                            if (printMatch) outputLines.push(printMatch[1]);
                        }
                    }
                }

                if (trimmed.startsWith('elif ') && trimmed.includes('sunny')) {
                    if (sunny && !warm) {
                        const idx = lines.indexOf(line);
                        if (idx + 1 < lines.length) {
                            const nextLine = lines[idx + 1].trim();
                            const printMatch = nextLine.match(/^print\s*\(["'](.*)["']\)$/);
                            if (printMatch) outputLines.push(printMatch[1]);
                        }
                    }
                }

                if (trimmed === 'else:') {
                    if (!sunny) {
                        const idx = lines.indexOf(line);
                        if (idx + 1 < lines.length) {
                            const nextLine = lines[idx + 1].trim();
                            const printMatch = nextLine.match(/^print\s*\(["'](.*)["']\)$/);
                            if (printMatch) outputLines.push(printMatch[1]);
                        }
                    }
                }
            }

            const output = outputLines.length > 0 ? outputLines.join('\n') : 'Try using if sunny and warm:';
            const hasIfAnd = challenge1.code.includes('if') && challenge1.code.includes('and');
            const hasElif = challenge1.code.includes('elif');
            const hasElse = challenge1.code.includes('else:');
            const completed = hasIfAnd && hasElif && hasElse && outputLines.length > 0;

            setChallenge1({ ...challenge1, output, completed });
        } catch {
            setChallenge1({ ...challenge1, output: 'Error in code!' });
        }
    };

    // Run Challenge 2: Game Level Check
    const runChallenge2 = () => {
        try {
            const lines = challenge2.code.trim().split('\n');
            let variables: { [key: string]: number } = {};
            let outputLines: string[] = [];

            for (const line of lines) {
                const trimmed = line.trim();

                // Number assignments
                const numMatch = trimmed.match(/^(\w+)\s*=\s*(\d+)$/);
                if (numMatch) {
                    variables[numMatch[1]] = parseInt(numMatch[2]);
                    continue;
                }
            }

            const score = variables['score'] || 0;
            const lives = variables['lives'] || 0;

            // Check for if with and
            const hasIfAnd = challenge2.code.includes('if') && challenge2.code.includes('and');
            const hasElse = challenge2.code.includes('else:');

            // Simulate the condition
            if (score >= 1000 && lives > 0) {
                // Look for the if block output
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (line.startsWith('if ') && line.includes('and')) {
                        if (i + 1 < lines.length) {
                            const nextLine = lines[i + 1].trim();
                            const printMatch = nextLine.match(/^print\s*\(["'](.*)["']\)$/);
                            if (printMatch) outputLines.push(printMatch[1]);
                        }
                        break;
                    }
                }
            } else {
                // Look for else block output
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (line === 'else:') {
                        if (i + 1 < lines.length) {
                            const nextLine = lines[i + 1].trim();
                            const printMatch = nextLine.match(/^print\s*\(["'](.*)["']\)$/);
                            if (printMatch) outputLines.push(printMatch[1]);
                        }
                        break;
                    }
                }
            }

            const output = outputLines.length > 0 ? outputLines.join('\n') : 'Try using if score >= 1000 and lives > 0:';
            const completed = hasIfAnd && hasElse && outputLines.length > 0;

            setChallenge2({ ...challenge2, output, completed });
        } catch {
            setChallenge2({ ...challenge2, output: 'Error in code!' });
        }
    };

    // Run Challenge 3: Movie Rating
    const runChallenge3 = () => {
        try {
            const lines = challenge3.code.trim().split('\n');
            let age = 0;
            let outputLines: string[] = [];

            for (const line of lines) {
                const trimmed = line.trim();
                const numMatch = trimmed.match(/^age\s*=\s*(\d+)$/);
                if (numMatch) {
                    age = parseInt(numMatch[1]);
                    continue;
                }
            }

            const hasIf = challenge3.code.includes('if ');
            const hasElif = challenge3.code.includes('elif ');
            const hasElse = challenge3.code.includes('else:');

            // Simulate age-based movie rating check
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();

                // Check each condition based on age
                if (line.startsWith('if ') && line.includes('age')) {
                    let condition = line.replace('if ', '').replace(':', '');
                    condition = condition.replace(/age/g, String(age));
                    try {
                        if (eval(condition) && i + 1 < lines.length) {
                            const nextLine = lines[i + 1].trim();
                            const printMatch = nextLine.match(/^print\s*\(["'](.*)["']\)$/);
                            if (printMatch) {
                                outputLines.push(printMatch[1]);
                                break;
                            }
                        }
                    } catch { /* continue */ }
                }

                if (line.startsWith('elif ') && line.includes('age') && outputLines.length === 0) {
                    let condition = line.replace('elif ', '').replace(':', '');
                    condition = condition.replace(/age/g, String(age));
                    try {
                        if (eval(condition) && i + 1 < lines.length) {
                            const nextLine = lines[i + 1].trim();
                            const printMatch = nextLine.match(/^print\s*\(["'](.*)["']\)$/);
                            if (printMatch) {
                                outputLines.push(printMatch[1]);
                                break;
                            }
                        }
                    } catch { /* continue */ }
                }

                if (line === 'else:' && outputLines.length === 0) {
                    if (i + 1 < lines.length) {
                        const nextLine = lines[i + 1].trim();
                        const printMatch = nextLine.match(/^print\s*\(["'](.*)["']\)$/);
                        if (printMatch) {
                            outputLines.push(printMatch[1]);
                            break;
                        }
                    }
                }
            }

            const output = outputLines.length > 0 ? outputLines.join('\n') : 'Try using if/elif/else with age checks!';
            const completed = hasIf && hasElif && hasElse && outputLines.length > 0;

            setChallenge3({ ...challenge3, output, completed });
        } catch {
            setChallenge3({ ...challenge3, output: 'Error in code!' });
        }
    };

    // Run Supercharge: Login Checker
    const runSupercharge = () => {
        try {
            const lines = superchargeCode.trim().split('\n');
            let username = '';
            let password = '';
            let outputLines: string[] = [];

            for (const line of lines) {
                const trimmed = line.trim();

                // String assignments
                const strMatch = trimmed.match(/^(\w+)\s*=\s*["'](.*)["']$/);
                if (strMatch) {
                    if (strMatch[1] === 'username') username = strMatch[2];
                    if (strMatch[1] === 'password') password = strMatch[2];
                    continue;
                }
            }

            const usernameCorrect = username === 'admin';
            const passwordCorrect = password === '1234';

            // Check for all four conditions
            const hasIfAnd = superchargeCode.includes('if') && superchargeCode.includes('and');
            const hasElifUsername = superchargeCode.includes('elif') && (superchargeCode.includes('username') || superchargeCode.includes('user'));
            const hasElifPassword = superchargeCode.includes('password') || superchargeCode.includes('pass');
            const hasElse = superchargeCode.includes('else:');

            // Determine which output to show based on conditions
            if (usernameCorrect && passwordCorrect) {
                // Both correct - look for first if block
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (line.startsWith('if ') && line.includes('and')) {
                        if (i + 1 < lines.length) {
                            const nextLine = lines[i + 1].trim();
                            const printMatch = nextLine.match(/^print\s*\(["'](.*)["']\)$/);
                            if (printMatch) outputLines.push(printMatch[1]);
                        }
                        break;
                    }
                }
            } else if (usernameCorrect && !passwordCorrect) {
                // Only username correct - look for elif about username
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (line.startsWith('elif ') && line.includes('username')) {
                        if (i + 1 < lines.length) {
                            const nextLine = lines[i + 1].trim();
                            const printMatch = nextLine.match(/^print\s*\(["'](.*)["']\)$/);
                            if (printMatch) outputLines.push(printMatch[1]);
                        }
                        break;
                    }
                }
            } else if (!usernameCorrect && passwordCorrect) {
                // Only password correct - look for elif about password
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (line.startsWith('elif ') && line.includes('password')) {
                        if (i + 1 < lines.length) {
                            const nextLine = lines[i + 1].trim();
                            const printMatch = nextLine.match(/^print\s*\(["'](.*)["']\)$/);
                            if (printMatch) outputLines.push(printMatch[1]);
                        }
                        break;
                    }
                }
            } else {
                // Neither correct - look for else block
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (line === 'else:') {
                        if (i + 1 < lines.length) {
                            const nextLine = lines[i + 1].trim();
                            const printMatch = nextLine.match(/^print\s*\(["'](.*)["']\)$/);
                            if (printMatch) outputLines.push(printMatch[1]);
                        }
                        break;
                    }
                }
            }

            const output = outputLines.length > 0 ? outputLines.join('\n') : 'Build the login checker with all 4 conditions!';
            setSuperchargeOutput(output);

            // Check if challenge is complete
            if (hasIfAnd && hasElifUsername && hasElifPassword && hasElse && outputLines.length > 0) {
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
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #f59e0b, #ec4899)' }}><Check size={50} className="text-white" /></motion.div>
                <h2 className={styles.successTitle}>{LESSON.successMessage}</h2>
                <p className={styles.successMessage}>You've mastered if, else, elif, and logic operators!</p>
                <div className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</div>
                <Link href="/level2/lesson8" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link>
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
                <div className={styles.lessonTitle}>
                    <motion.div className={styles.lessonEmoji} animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>{LESSON.emoji}</motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1>{LESSON.title}</h1>
                        <p>Learn: <code>{LESSON.concept}</code></p>
                    </div>
                </div>

                {/* Story/Mission Box */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <Target size={24} className="text-purple-400" />
                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Time to Practice!</span>
                    </div>
                    <p style={{ fontSize: '1.1rem' }}>
                        You've learned <strong>if</strong>, <strong>else</strong>, <strong>elif</strong>, and logic operators like <strong>and</strong>, <strong>or</strong>, <strong>not</strong>!
                    </p>
                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                        Now let's put it ALL together with some fun challenges!
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
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Weather</span>
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
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Game</span>
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
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Movies</span>
                    </div>
                </div>

                {/* Challenge 1: Weather Advisor */}
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
                        <span style={{ fontSize: '1.5rem' }}>1. Weather Advisor</span>
                        {challenge1.completed && <Check size={20} className="text-emerald-400" />}
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        <p style={{ margin: 0, fontWeight: 600 }}>Build a weather advisor:</p>
                        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <li>If sunny AND warm: "Beach day!"</li>
                            <li>Elif sunny (but not warm): "Nice walk!"</li>
                            <li>Else: "Stay inside!"</li>
                        </ul>
                    </div>
                    <div className={styles.editor}>
                        <div className={styles.codeHeader}><span>weather.py</span><span>Python</span></div>
                        <textarea
                            value={challenge1.code}
                            onChange={(e) => setChallenge1({ ...challenge1, code: e.target.value })}
                            placeholder={'sunny = True\nwarm = True\n\nif sunny and warm:\n    print("Beach day!")\nelif sunny:\n    print("Nice walk!")\nelse:\n    print("Stay inside!")'}
                            spellCheck={false}
                            style={{ minHeight: '180px' }}
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

                {/* Challenge 2: Game Level Check */}
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
                        <span style={{ fontSize: '1.5rem' }}>2. Game Level Check</span>
                        {challenge2.completed && <Check size={20} className="text-emerald-400" />}
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        <p style={{ margin: 0, fontWeight: 600 }}>Check if player levels up:</p>
                        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <li>If score &gt;= 1000 AND lives &gt; 0: "Level up!"</li>
                            <li>Else: "Keep playing!"</li>
                        </ul>
                    </div>
                    <div className={styles.editor}>
                        <div className={styles.codeHeader}><span>game.py</span><span>Python</span></div>
                        <textarea
                            value={challenge2.code}
                            onChange={(e) => setChallenge2({ ...challenge2, code: e.target.value })}
                            placeholder={'score = 1500\nlives = 3\n\nif score >= 1000 and lives > 0:\n    print("Level up!")\nelse:\n    print("Keep playing!")'}
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

                {/* Challenge 3: Movie Rating */}
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
                        <span style={{ fontSize: '1.5rem' }}>3. Movie Rating Checker</span>
                        {challenge3.completed && <Check size={20} className="text-emerald-400" />}
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        <p style={{ margin: 0, fontWeight: 600 }}>Check which movies someone can watch based on age:</p>
                        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <li>If age &gt;= 13: "You can watch PG-13 movies!"</li>
                            <li>Elif age &gt;= 8: "You can watch PG movies!"</li>
                            <li>Else: "G-rated movies for you!"</li>
                        </ul>
                    </div>
                    <div className={styles.editor}>
                        <div className={styles.codeHeader}><span>movies.py</span><span>Python</span></div>
                        <textarea
                            value={challenge3.code}
                            onChange={(e) => setChallenge3({ ...challenge3, code: e.target.value })}
                            placeholder={'age = 10\n\nif age >= 13:\n    print("You can watch PG-13 movies!")\nelif age >= 8:\n    print("You can watch PG movies!")\nelse:\n    print("G-rated movies for you!")'}
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
                        <p style={{ margin: 0 }}><code>and</code> = BOTH must be true | <code>or</code> = AT LEAST ONE must be true</p>
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
                            <h3 style={{ margin: 0, color: '#fbbf24', fontWeight: 800 }}>SUPERCHARGE - Bonus Challenge</h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Optional +25 XP</p>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        <p style={{ margin: 0, fontWeight: 600, marginBottom: '0.5rem' }}>Build a Login Checker!</p>
                        <p style={{ margin: 0, marginBottom: '0.75rem' }}>
                            Create a login system that checks username and password with <strong>4 different outcomes</strong>:
                        </p>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <li><strong>If</strong> username == "admin" AND password == "1234": "Welcome admin!"</li>
                            <li><strong>Elif</strong> username == "admin": "Wrong password!"</li>
                            <li><strong>Elif</strong> password == "1234": "Unknown user!"</li>
                            <li><strong>Else</strong>: "Login failed!"</li>
                        </ul>
                    </div>

                    <div className={styles.editor}>
                        <div className={styles.codeHeader}>
                            <span>login.py</span>
                            <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>&#9889; BONUS</span>
                        </div>
                        <textarea
                            value={superchargeCode}
                            onChange={(e) => setSuperchargeCode(e.target.value)}
                            placeholder={'username = "admin"\npassword = "1234"\n\nif username == "admin" and password == "1234":\n    print("Welcome admin!")\nelif username == "admin":\n    print("Wrong password!")\nelif password == "1234":\n    print("Unknown user!")\nelse:\n    print("Login failed!")'}
                            spellCheck={false}
                            style={{ minHeight: '220px' }}
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
                            <div className={styles.outputLabel}>{superchargeDone ? '&#9889; SUPERCHARGED!' : 'Output:'}</div>
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
                            <Check size={20} /> +25 XP Claimed! Decision Pro! &#9889;
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
                    <Link href="/level2/lesson6" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
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
