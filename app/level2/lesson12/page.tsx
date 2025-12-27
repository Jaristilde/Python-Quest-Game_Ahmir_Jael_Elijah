'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Target, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL2_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL2_LESSONS[11]; // Lesson 12
const LESSON_ID = 27;

interface Challenge {
    id: number;
    title: string;
    description: string;
    starterCode: string;
    expectedOutput: string[];
    hint: string;
}

const challenges: Challenge[] = [
    {
        id: 1,
        title: "Count to 5",
        description: "Print numbers 1 to 5 using a while loop",
        starterCode: `count = 1

while count <= 5:
    print(count)
    count += 1`,
        expectedOutput: ['1', '2', '3', '4', '5'],
        hint: "Start at 1, keep going while count <= 5, add 1 each time!"
    },
    {
        id: 2,
        title: "Countdown!",
        description: "Count down from 10 to 1, then print 'GO!'",
        starterCode: `count = 10

while count >= 1:
    print(count)
    count -= 1

print("GO!")`,
        expectedOutput: ['10', '9', '8', '7', '6', '5', '4', '3', '2', '1', 'GO!'],
        hint: "Start at 10, keep going while count >= 1, subtract 1 each time!"
    },
    {
        id: 3,
        title: "Double Up!",
        description: "Double a number (start at 1) until it's over 100",
        starterCode: `num = 1

while num <= 100:
    print(num)
    num *= 2`,
        expectedOutput: ['1', '2', '4', '8', '16', '32', '64', '128'],
        hint: "Start at 1, keep doubling (*= 2) while num <= 100!"
    }
];

export default function Lesson12() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [challengeCode, setChallengeCode] = useState<{ [key: number]: string }>({
        1: '',
        2: '',
        3: ''
    });
    const [challengeOutput, setChallengeOutput] = useState<{ [key: number]: string }>({});
    const [challengesDone, setChallengesDone] = useState<boolean[]>([false, false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [superchargeCode, setSuperchargeCode] = useState('');
    const [superchargeOutput, setSuperchargeOutput] = useState('');
    const [superchargeDone, setSuperchargeDone] = useState(false);
    const [superchargeXpClaimed, setSuperchargeXpClaimed] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    // Check if all challenges complete to unlock lesson completion
    useEffect(() => {
        if (challengesDone.every(done => done) && !lessonComplete) {
            setTimeout(() => {
                addXpAndCoins(LESSON.xpReward, 5);
                completeLevel(LESSON_ID, LESSON.xpReward, 5, 1, 60);
                setLessonComplete(true);
            }, 500);
        }
    }, [challengesDone, lessonComplete, addXpAndCoins, completeLevel]);

    const runWhileLoop = (code: string): string[] => {
        const lines = code.trim().split('\n');
        const outputLines: string[] = [];
        const variables: { [key: string]: number } = {};
        let loopCount = 0;
        const maxLoops = 200; // Prevent infinite loops

        // Helper to evaluate expressions with variables
        const evalWithVars = (expr: string): number | string => {
            let evalExpr = expr;
            for (const [k, v] of Object.entries(variables)) {
                evalExpr = evalExpr.replace(new RegExp(`\\b${k}\\b`, 'g'), String(v));
            }
            try {
                return eval(evalExpr);
            } catch {
                return expr;
            }
        };

        // Helper to print content
        const handlePrint = (content: string) => {
            // String literal
            if ((content.startsWith('"') && content.endsWith('"')) ||
                (content.startsWith("'") && content.endsWith("'"))) {
                outputLines.push(content.slice(1, -1));
            }
            // f-string
            else if (content.startsWith('f"') || content.startsWith("f'")) {
                let result = content.slice(2, -1);
                result = result.replace(/\{([^}]+)\}/g, (_, expr) => {
                    return String(evalWithVars(expr));
                });
                outputLines.push(result);
            }
            // Variable or expression
            else {
                outputLines.push(String(evalWithVars(content)));
            }
        };

        // First pass: collect variable assignments before while
        let whileLineIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            const trimmed = lines[i].trim();
            if (trimmed.startsWith('while ')) {
                whileLineIndex = i;
                break;
            }
            if (!trimmed || trimmed.startsWith('#')) continue;

            // Variable assignment
            const varMatch = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
            if (varMatch) {
                const value = varMatch[2].trim();
                if (!isNaN(Number(value))) {
                    variables[varMatch[1]] = Number(value);
                }
            }
        }

        if (whileLineIndex === -1) {
            return ['Add a while loop!'];
        }

        // Get while condition
        const whileLine = lines[whileLineIndex].trim();
        const whileMatch = whileLine.match(/^while\s+(.+)\s*:$/);
        if (!whileMatch) {
            return ['Check your while loop syntax!'];
        }

        // Get loop body with original indentation levels
        const loopBodyLines: { line: string; indent: number }[] = [];
        let j = whileLineIndex + 1;
        while (j < lines.length) {
            const line = lines[j];
            const trimmed = line.trim();
            // Check if still in loop body (indented)
            if (!trimmed) {
                j++;
                continue;
            }
            if (!line.startsWith('    ') && !line.startsWith('\t') && trimmed) {
                break;
            }
            // Count indent level (each 4 spaces or tab = 1 level)
            const spaces = line.match(/^(\s*)/)?.[1] || '';
            const indent = Math.floor(spaces.replace(/\t/g, '    ').length / 4);
            loopBodyLines.push({ line: trimmed, indent });
            j++;
        }

        // Get code after loop
        const afterLoop: string[] = [];
        while (j < lines.length) {
            if (lines[j].trim()) {
                afterLoop.push(lines[j].trim());
            }
            j++;
        }

        // Execute while loop
        const evaluateCondition = (condition: string): boolean => {
            let evalCond = condition;
            for (const [k, v] of Object.entries(variables)) {
                evalCond = evalCond.replace(new RegExp(`\\b${k}\\b`, 'g'), String(v));
            }
            // Replace Python operators
            evalCond = evalCond.replace(/\bor\b/g, '||').replace(/\band\b/g, '&&').replace(/\bnot\s+/g, '!');
            try {
                return eval(evalCond);
            } catch {
                return false;
            }
        };

        while (evaluateCondition(whileMatch[1]) && loopCount < maxLoops) {
            loopCount++;

            // Process loop body with if/elif/else support
            let i = 0;
            while (i < loopBodyLines.length) {
                const { line: bodyLine, indent } = loopBodyLines[i];

                // Skip comments
                if (bodyLine.startsWith('#')) {
                    i++;
                    continue;
                }

                // Handle if statement
                const ifMatch = bodyLine.match(/^if\s+(.+)\s*:$/);
                if (ifMatch) {
                    let conditionMet = false;
                    let foundTrueBlock = false;

                    // Evaluate if condition
                    if (evaluateCondition(ifMatch[1])) {
                        foundTrueBlock = true;
                        conditionMet = true;
                    }

                    // Get if body
                    i++;
                    while (i < loopBodyLines.length && loopBodyLines[i].indent > indent) {
                        if (conditionMet) {
                            const innerLine = loopBodyLines[i].line;
                            // Execute if body
                            const printMatch = innerLine.match(/^print\s*\(\s*(.+)\s*\)$/);
                            if (printMatch) {
                                handlePrint(printMatch[1].trim());
                            }
                            // Handle variable updates
                            const updateMatch = innerLine.match(/^(\w+)\s*(\+|-|\*|\/)=\s*(.+)$/);
                            if (updateMatch) {
                                const varName = updateMatch[1];
                                const op = updateMatch[2];
                                const numValue = Number(evalWithVars(updateMatch[3].trim()));
                                if (variables[varName] !== undefined) {
                                    switch (op) {
                                        case '+': variables[varName] += numValue; break;
                                        case '-': variables[varName] -= numValue; break;
                                        case '*': variables[varName] *= numValue; break;
                                        case '/': variables[varName] /= numValue; break;
                                    }
                                }
                            }
                            // Simple assignment
                            const assignMatch = innerLine.match(/^(\w+)\s*=\s*(.+)$/);
                            if (assignMatch && !updateMatch) {
                                variables[assignMatch[1]] = Number(evalWithVars(assignMatch[2].trim()));
                            }
                        }
                        i++;
                    }

                    // Check for elif/else
                    while (i < loopBodyLines.length) {
                        const nextLine = loopBodyLines[i].line;

                        // Check elif
                        const elifMatch = nextLine.match(/^elif\s+(.+)\s*:$/);
                        if (elifMatch) {
                            conditionMet = !foundTrueBlock && evaluateCondition(elifMatch[1]);
                            if (conditionMet) foundTrueBlock = true;
                            i++;
                            while (i < loopBodyLines.length && loopBodyLines[i].indent > indent) {
                                if (conditionMet) {
                                    const innerLine = loopBodyLines[i].line;
                                    const printMatch = innerLine.match(/^print\s*\(\s*(.+)\s*\)$/);
                                    if (printMatch) {
                                        handlePrint(printMatch[1].trim());
                                    }
                                }
                                i++;
                            }
                            continue;
                        }

                        // Check else
                        if (nextLine === 'else:') {
                            conditionMet = !foundTrueBlock;
                            i++;
                            while (i < loopBodyLines.length && loopBodyLines[i].indent > indent) {
                                if (conditionMet) {
                                    const innerLine = loopBodyLines[i].line;
                                    const printMatch = innerLine.match(/^print\s*\(\s*(.+)\s*\)$/);
                                    if (printMatch) {
                                        handlePrint(printMatch[1].trim());
                                    }
                                }
                                i++;
                            }
                            break;
                        }

                        // Not part of if/elif/else chain
                        break;
                    }
                    continue;
                }

                // Print statement
                const printMatch = bodyLine.match(/^print\s*\(\s*(.+)\s*\)$/);
                if (printMatch) {
                    handlePrint(printMatch[1].trim());
                    i++;
                    continue;
                }

                // Variable update with += -= *= /=
                const updateMatch = bodyLine.match(/^(\w+)\s*(\+|-|\*|\/)=\s*(.+)$/);
                if (updateMatch) {
                    const varName = updateMatch[1];
                    const op = updateMatch[2];
                    const numValue = Number(evalWithVars(updateMatch[3].trim()));

                    if (variables[varName] !== undefined) {
                        switch (op) {
                            case '+': variables[varName] += numValue; break;
                            case '-': variables[varName] -= numValue; break;
                            case '*': variables[varName] *= numValue; break;
                            case '/': variables[varName] /= numValue; break;
                        }
                    }
                    i++;
                    continue;
                }

                // Simple assignment
                const assignMatch = bodyLine.match(/^(\w+)\s*=\s*(.+)$/);
                if (assignMatch) {
                    variables[assignMatch[1]] = Number(evalWithVars(assignMatch[2].trim()));
                    i++;
                    continue;
                }

                i++;
            }
        }

        // Execute code after loop
        for (const afterLine of afterLoop) {
            const printMatch = afterLine.match(/^print\s*\(\s*(.+)\s*\)$/);
            if (printMatch) {
                handlePrint(printMatch[1].trim());
            }
        }

        return outputLines.length > 0 ? outputLines : ['Run your while loop!'];
    };

    const runChallenge = (challengeId: number) => {
        const code = challengeCode[challengeId] || '';
        const output = runWhileLoop(code);
        setChallengeOutput(prev => ({ ...prev, [challengeId]: output.join('\n') }));

        // Check if output matches expected
        const challenge = challenges.find(c => c.id === challengeId);
        if (challenge) {
            const outputMatches = JSON.stringify(output) === JSON.stringify(challenge.expectedOutput);
            if (outputMatches) {
                const newDone = [...challengesDone];
                newDone[challengeId - 1] = true;
                setChallengesDone(newDone);
            }
        }
    };

    const runSupercharge = () => {
        const output = runWhileLoop(superchargeCode);
        setSuperchargeOutput(output.join('\n'));

        // Check if the guessing game works correctly
        const expectedOutput = [
            '1 is too low!',
            '2 is too low!',
            '3 is too low!',
            '4 is too low!',
            '5 is too low!',
            '6 is too low!',
            'Got it in 7 tries!'
        ];

        if (JSON.stringify(output) === JSON.stringify(expectedOutput)) {
            setSuperchargeDone(true);
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
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ fontSize: '3rem' }}>
                        <RefreshCw size={48} className="text-cyan-400" />
                    </motion.div>
                </div>
            </div>
        );
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', duration: 0.8 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}>
                    <Check size={50} className="text-white" />
                </motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle}>{LESSON.successMessage}</motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>You've mastered while loops! Keep looping forward!</motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                    <Link href="/level2/lesson13" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link>
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
                    <motion.div className={styles.lessonEmoji} animate={{ rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>{LESSON.emoji}</motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1>{LESSON.title}</h1>
                        <p>Practice: <code>{LESSON.concept}</code></p>
                    </div>
                </div>

                {/* Mission */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(59, 130, 246, 0.15))' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Target size={28} className="text-cyan-400" />
                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Time to master while loops!</span>
                    </div>
                    <p>Complete these challenges to prove your skills! Each challenge tests a different while loop pattern.</p>
                </motion.div>

                {/* Progress Tracker */}
                <div className={styles.challenges}>
                    <h3>Challenge Progress:</h3>
                    <ul className={styles.challengeList}>
                        {challenges.map((challenge, idx) => (
                            <li key={challenge.id}>
                                <div className={`${styles.challengeCheck} ${challengesDone[idx] ? styles.done : ''}`}>
                                    {challengesDone[idx] && <Check size={14} />}
                                </div>
                                {challenge.title}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Challenges */}
                {challenges.map((challenge, idx) => (
                    <motion.div
                        key={challenge.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={styles.codeSection}
                        style={{
                            border: challengesDone[idx] ? '2px solid rgba(16, 185, 129, 0.5)' : undefined,
                            background: challengesDone[idx] ? 'rgba(16, 185, 129, 0.05)' : undefined
                        }}
                    >
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {challengesDone[idx] ? (
                                <Check size={20} className="text-emerald-400" />
                            ) : (
                                <span style={{
                                    background: 'rgba(6, 182, 212, 0.2)',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.8rem',
                                    fontWeight: 700
                                }}>{challenge.id}</span>
                            )}
                            Challenge {challenge.id}: {challenge.title}
                        </h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{challenge.description}</p>

                        <div className={styles.editor}>
                            <div className={styles.codeHeader}>
                                <span>challenge{challenge.id}.py</span>
                                <span>Python</span>
                            </div>
                            <textarea
                                value={challengeCode[challenge.id]}
                                onChange={(e) => setChallengeCode(prev => ({ ...prev, [challenge.id]: e.target.value }))}
                                placeholder={challenge.starterCode}
                                spellCheck={false}
                                style={{ minHeight: '120px' }}
                            />
                        </div>

                        <button
                            className={styles.runBtn}
                            onClick={() => runChallenge(challenge.id)}
                            style={{ background: challengesDone[idx] ? '#10b981' : undefined }}
                        >
                            <Play size={18} /> {challengesDone[idx] ? 'Completed!' : 'Run Code'}
                        </button>

                        {challengeOutput[challenge.id] && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={styles.outputBox}
                                style={{ borderColor: challengesDone[idx] ? 'rgba(16, 185, 129, 0.5)' : undefined }}
                            >
                                <div className={styles.outputLabel}>
                                    {challengesDone[idx] ? 'Perfect!' : 'Output:'}
                                </div>
                                <div className={styles.outputText}>{challengeOutput[challenge.id]}</div>
                            </motion.div>
                        )}

                        {!challengesDone[idx] && (
                            <div className={styles.tipBox} style={{ marginTop: '0.5rem' }}>
                                <Lightbulb size={16} className="text-amber-400 flex-shrink-0" />
                                <p style={{ fontSize: '0.85rem' }}><strong>Hint:</strong> {challenge.hint}</p>
                            </div>
                        )}
                    </motion.div>
                ))}

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
                            <Zap size={28} className="text-amber-400" fill="currentColor" />
                        </motion.span>
                        <div>
                            <h3 style={{ margin: 0, color: '#fbbf24', fontWeight: 800 }}>SUPERCHARGE - Bonus Challenge</h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Optional - +25 XP - Build a Number Guessing Game!</p>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        <p style={{ margin: 0, fontWeight: 600, marginBottom: '0.5rem' }}>The Challenge: Guessing Game Framework!</p>
                        <p style={{ margin: 0, marginBottom: '1rem' }}>
                            Build a simple number guessing game. The secret number is 7, and we simulate guessing 1, 2, 3... until we find it!
                        </p>
                        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            <span style={{ color: '#6272a4' }}># Expected output:</span>{'\n'}
                            1 is too low!{'\n'}
                            2 is too low!{'\n'}
                            3 is too low!{'\n'}
                            4 is too low!{'\n'}
                            5 is too low!{'\n'}
                            6 is too low!{'\n'}
                            Got it in 7 tries!
                        </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        <p style={{ margin: 0, fontWeight: 600, marginBottom: '0.5rem', fontFamily: 'inherit', color: '#fbbf24' }}>Starter Code:</p>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`secret = 7
guess = 0
attempts = 0

while guess != secret:
    # Simulate guessing (we'll pretend user enters numbers)
    guess = attempts + 1  # This simulates guesses 1, 2, 3...
    attempts += 1

    if guess < secret:
        print(f"{guess} is too low!")
    elif guess > secret:
        print(f"{guess} is too high!")

print(f"Got it in {attempts} tries!")`}
                        </pre>
                    </div>

                    <div className={styles.editor}>
                        <div className={styles.codeHeader}>
                            <span>supercharge.py</span>
                            <span style={{ color: '#fbbf24' }}>BONUS</span>
                        </div>
                        <textarea
                            value={superchargeCode}
                            onChange={(e) => setSuperchargeCode(e.target.value)}
                            placeholder={`secret = 7
guess = 0
attempts = 0

while guess != secret:
    guess = attempts + 1
    attempts += 1

    if guess < secret:
        print(f"{guess} is too low!")
    elif guess > secret:
        print(f"{guess} is too high!")

print(f"Got it in {attempts} tries!")`}
                            spellCheck={false}
                            style={{ minHeight: '200px' }}
                        />
                    </div>

                    <button
                        className={styles.runBtn}
                        onClick={runSupercharge}
                        style={{ background: superchargeDone ? '#10b981' : '#f59e0b' }}
                    >
                        <Play size={18} /> {superchargeDone ? 'Game Complete!' : 'Test Guessing Game'}
                    </button>

                    {superchargeOutput && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.outputBox}
                            style={{ borderColor: superchargeDone ? 'rgba(16, 185, 129, 0.5)' : undefined }}
                        >
                            <div className={styles.outputLabel}>{superchargeDone ? 'GAME WORKING!' : 'Output:'}</div>
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
                            <Check size={20} /> +25 XP Claimed! Game Developer!
                        </motion.div>
                    )}
                </motion.div>

                {/* Tip Box */}
                <div className={styles.tipBox} style={{ marginTop: '1.5rem' }}>
                    <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                    <div>
                        <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>While Loop Patterns:</p>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                            <li><strong>Count up:</strong> Start low, use +=, check {"<="}</li>
                            <li><strong>Count down:</strong> Start high, use -=, check {">="}</li>
                            <li><strong>Until condition:</strong> Keep going while != target</li>
                        </ul>
                    </div>
                </div>

                <div className={styles.navBar}>
                    <Link href="/level2/lesson11" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                    <Link href="/level2/lesson13" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link>
                </div>
            </div>
        </div>
    );
}
