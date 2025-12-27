'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Target, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL3_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL3_LESSONS[11]; // Lesson 12 (0-indexed)
const LESSON_ID = 45;

interface ChallengeState {
    code: string;
    output: string;
    completed: boolean;
    showHint: boolean;
}

export default function Lesson12() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    // Challenge states
    const [challenge1, setChallenge1] = useState<ChallengeState>({
        code: '',
        output: '',
        completed: false,
        showHint: false
    });
    const [challenge2, setChallenge2] = useState<ChallengeState>({
        code: '',
        output: '',
        completed: false,
        showHint: false
    });
    const [challenge3, setChallenge3] = useState<ChallengeState>({
        code: '',
        output: '',
        completed: false,
        showHint: false
    });

    // Supercharge state
    const [superchargeCode, setSuperchargeCode] = useState('');
    const [superchargeOutput, setSuperchargeOutput] = useState('');
    const [superchargeDone, setSuperchargeDone] = useState(false);
    const [superchargeXpClaimed, setSuperchargeXpClaimed] = useState(false);
    const [showSuperchargeHint, setShowSuperchargeHint] = useState(false);

    // Lesson completion
    const [lessonComplete, setLessonComplete] = useState(false);
    const [xpClaimed, setXpClaimed] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    // Check if all main challenges are completed
    const allChallengesComplete = challenge1.completed && challenge2.completed && challenge3.completed;

    // Python-like interpreter for list operations with min, max, sum, sorted
    const runListCode = (code: string): { output: string; variables: { [key: string]: any } } => {
        const lines = code.trim().split('\n');
        let outputLines: string[] = [];
        const variables: { [key: string]: any } = {};

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            // List creation: my_list = [1, 2, 3] or my_list = ["a", "b"]
            const listMatch = trimmed.match(/^(\w+)\s*=\s*\[(.*)\]$/);
            if (listMatch) {
                const varName = listMatch[1];
                const content = listMatch[2].trim();
                if (content === '') {
                    variables[varName] = [];
                } else {
                    const items: any[] = [];
                    const itemMatches = content.match(/(?:"[^"]*"|'[^']*'|-?\d+(?:\.\d+)?)/g);
                    if (itemMatches) {
                        for (const item of itemMatches) {
                            if (item.startsWith('"') || item.startsWith("'")) {
                                items.push(item.slice(1, -1));
                            } else {
                                items.push(parseFloat(item));
                            }
                        }
                    }
                    variables[varName] = items;
                }
                continue;
            }

            // Variable assignment with function: var = max(list), var = min(list), etc.
            const funcAssignMatch = trimmed.match(/^(\w+)\s*=\s*(max|min|sum|len|sorted)\s*\(\s*(\w+)(?:\s*,\s*reverse\s*=\s*(True|False))?\s*\)$/);
            if (funcAssignMatch) {
                const varName = funcAssignMatch[1];
                const func = funcAssignMatch[2];
                const listName = funcAssignMatch[3];
                const reverseFlag = funcAssignMatch[4];

                if (variables[listName] && Array.isArray(variables[listName])) {
                    const arr = variables[listName];
                    switch (func) {
                        case 'max':
                            variables[varName] = Math.max(...arr);
                            break;
                        case 'min':
                            variables[varName] = Math.min(...arr);
                            break;
                        case 'sum':
                            variables[varName] = arr.reduce((a: number, b: number) => a + b, 0);
                            break;
                        case 'len':
                            variables[varName] = arr.length;
                            break;
                        case 'sorted':
                            const sorted = [...arr].sort((a, b) => a - b);
                            variables[varName] = reverseFlag === 'True' ? sorted.reverse() : sorted;
                            break;
                    }
                }
                continue;
            }

            // Variable assignment with arithmetic: var = sum(list) / len(list)
            const arithMatch = trimmed.match(/^(\w+)\s*=\s*(sum|len)\s*\(\s*(\w+)\s*\)\s*([\/\*\+\-])\s*(sum|len)\s*\(\s*(\w+)\s*\)$/);
            if (arithMatch) {
                const varName = arithMatch[1];
                const func1 = arithMatch[2];
                const list1 = arithMatch[3];
                const op = arithMatch[4];
                const func2 = arithMatch[5];
                const list2 = arithMatch[6];

                let val1 = 0, val2 = 0;
                if (variables[list1] && Array.isArray(variables[list1])) {
                    const arr = variables[list1];
                    val1 = func1 === 'sum' ? arr.reduce((a: number, b: number) => a + b, 0) : arr.length;
                }
                if (variables[list2] && Array.isArray(variables[list2])) {
                    const arr = variables[list2];
                    val2 = func2 === 'sum' ? arr.reduce((a: number, b: number) => a + b, 0) : arr.length;
                }

                switch (op) {
                    case '/': variables[varName] = val1 / val2; break;
                    case '*': variables[varName] = val1 * val2; break;
                    case '+': variables[varName] = val1 + val2; break;
                    case '-': variables[varName] = val1 - val2; break;
                }
                continue;
            }

            // List .sort() method (in-place)
            const sortMethodMatch = trimmed.match(/^(\w+)\.sort\s*\(\s*(?:reverse\s*=\s*(True|False))?\s*\)$/);
            if (sortMethodMatch) {
                const listName = sortMethodMatch[1];
                const reverseFlag = sortMethodMatch[2];
                if (variables[listName] && Array.isArray(variables[listName])) {
                    variables[listName].sort((a: number, b: number) => a - b);
                    if (reverseFlag === 'True') {
                        variables[listName].reverse();
                    }
                }
                continue;
            }

            // Print statement
            const printMatch = trimmed.match(/^print\s*\(\s*(.+)\s*\)$/);
            if (printMatch) {
                let content = printMatch[1].trim();

                // Check for f-string
                const fstringMatch = content.match(/^f["'](.*)["']$/);
                if (fstringMatch) {
                    let result = fstringMatch[1];
                    result = result.replace(/\{([^}]+)\}/g, (_, expr) => {
                        const exprTrimmed = expr.trim();

                        // Check for max/min/sum/len(list)
                        const funcMatch = exprTrimmed.match(/^(max|min|sum|len)\s*\(\s*(\w+)\s*\)$/);
                        if (funcMatch) {
                            const func = funcMatch[1];
                            const listName = funcMatch[2];
                            if (variables[listName] && Array.isArray(variables[listName])) {
                                const arr = variables[listName];
                                switch (func) {
                                    case 'max': return String(Math.max(...arr));
                                    case 'min': return String(Math.min(...arr));
                                    case 'sum': return String(arr.reduce((a: number, b: number) => a + b, 0));
                                    case 'len': return String(arr.length);
                                }
                            }
                        }

                        // Check for sorted(list, reverse=True/False)
                        const sortedMatch = exprTrimmed.match(/^sorted\s*\(\s*(\w+)(?:\s*,\s*reverse\s*=\s*(True|False))?\s*\)$/);
                        if (sortedMatch) {
                            const listName = sortedMatch[1];
                            const reverseFlag = sortedMatch[2];
                            if (variables[listName] && Array.isArray(variables[listName])) {
                                const sorted = [...variables[listName]].sort((a, b) => a - b);
                                const result = reverseFlag === 'True' ? sorted.reverse() : sorted;
                                return '[' + result.join(', ') + ']';
                            }
                        }

                        // Check for variable
                        if (variables[exprTrimmed] !== undefined) {
                            if (Array.isArray(variables[exprTrimmed])) {
                                return '[' + variables[exprTrimmed].join(', ') + ']';
                            }
                            return String(variables[exprTrimmed]);
                        }

                        return expr;
                    });
                    outputLines.push(result);
                    continue;
                }

                // Check for string literal with + concatenation
                if (content.includes('+')) {
                    let result = '';
                    const parts = content.split('+').map(p => p.trim());
                    for (const part of parts) {
                        const strMatch = part.match(/^["'](.*)["']$/);
                        if (strMatch) {
                            result += strMatch[1];
                        } else if (variables[part] !== undefined) {
                            if (Array.isArray(variables[part])) {
                                result += '[' + variables[part].join(', ') + ']';
                            } else {
                                result += String(variables[part]);
                            }
                        } else {
                            // Try to evaluate as function call
                            const funcMatch = part.match(/^str\s*\(\s*(max|min|sum|len)\s*\(\s*(\w+)\s*\)\s*\)$/);
                            if (funcMatch) {
                                const func = funcMatch[1];
                                const listName = funcMatch[2];
                                if (variables[listName] && Array.isArray(variables[listName])) {
                                    const arr = variables[listName];
                                    switch (func) {
                                        case 'max': result += String(Math.max(...arr)); break;
                                        case 'min': result += String(Math.min(...arr)); break;
                                        case 'sum': result += String(arr.reduce((a: number, b: number) => a + b, 0)); break;
                                        case 'len': result += String(arr.length); break;
                                    }
                                }
                            }
                        }
                    }
                    outputLines.push(result);
                    continue;
                }

                // Check for string literal
                const strMatch = content.match(/^["'](.*)["']$/);
                if (strMatch) {
                    outputLines.push(strMatch[1]);
                    continue;
                }

                // Check for max/min/sum/len/sorted function call
                const funcCallMatch = content.match(/^(max|min|sum|len)\s*\(\s*(\w+)\s*\)$/);
                if (funcCallMatch) {
                    const func = funcCallMatch[1];
                    const listName = funcCallMatch[2];
                    if (variables[listName] && Array.isArray(variables[listName])) {
                        const arr = variables[listName];
                        switch (func) {
                            case 'max': outputLines.push(String(Math.max(...arr))); break;
                            case 'min': outputLines.push(String(Math.min(...arr))); break;
                            case 'sum': outputLines.push(String(arr.reduce((a: number, b: number) => a + b, 0))); break;
                            case 'len': outputLines.push(String(arr.length)); break;
                        }
                    }
                    continue;
                }

                // Check for sorted function call
                const sortedCallMatch = content.match(/^sorted\s*\(\s*(\w+)(?:\s*,\s*reverse\s*=\s*(True|False))?\s*\)$/);
                if (sortedCallMatch) {
                    const listName = sortedCallMatch[1];
                    const reverseFlag = sortedCallMatch[2];
                    if (variables[listName] && Array.isArray(variables[listName])) {
                        const sorted = [...variables[listName]].sort((a, b) => a - b);
                        const result = reverseFlag === 'True' ? sorted.reverse() : sorted;
                        outputLines.push('[' + result.join(', ') + ']');
                    }
                    continue;
                }

                // Check for variable
                if (variables[content]) {
                    if (Array.isArray(variables[content])) {
                        outputLines.push('[' + variables[content].join(', ') + ']');
                    } else {
                        outputLines.push(String(variables[content]));
                    }
                    continue;
                }
            }
        }

        const output = outputLines.length > 0 ? outputLines.join('\n') : '(No output)';
        return { output, variables };
    };

    // Challenge 1: Find the Champion (use max())
    const runChallenge1 = () => {
        try {
            const result = runListCode(challenge1.code);
            const output = result.output;

            // Check if they used max() and got 96
            const usedMax = challenge1.code.includes('max(');
            const hasCorrectOutput = output.includes('96');

            const completed = usedMax && hasCorrectOutput;
            setChallenge1({ ...challenge1, output, completed });
        } catch {
            setChallenge1({ ...challenge1, output: 'Error in code!' });
        }
    };

    // Challenge 2: Sort the Scores
    const runChallenge2 = () => {
        try {
            const result = runListCode(challenge2.code);
            const output = result.output;

            // Check if they used sorted() or .sort() and output is sorted
            const usedSort = challenge2.code.includes('sorted(') || challenge2.code.includes('.sort(');
            const hasPrint = challenge2.code.includes('print');
            const outputHasList = output.includes('[') && output.includes(']');

            const completed = usedSort && hasPrint && outputHasList;
            setChallenge2({ ...challenge2, output, completed });
        } catch {
            setChallenge2({ ...challenge2, output: 'Error in code!' });
        }
    };

    // Challenge 3: Total Points (use sum())
    const runChallenge3 = () => {
        try {
            const result = runListCode(challenge3.code);
            const output = result.output;

            // Check if they used sum() and got 850
            const usedSum = challenge3.code.includes('sum(');
            const hasCorrectOutput = output.includes('850');

            const completed = usedSum && hasCorrectOutput;
            setChallenge3({ ...challenge3, output, completed });
        } catch {
            setChallenge3({ ...challenge3, output: 'Error in code!' });
        }
    };

    // Supercharge: Game Stats Calculator
    const runSupercharge = () => {
        try {
            const result = runListCode(superchargeCode);
            const output = result.output;

            // Check requirements:
            // 1. Used max(), min(), sum()
            // 2. Calculated average (sum/len)
            // 3. Sorted from best to worst (reverse)
            // Expected outputs: 95, 78, 438, 87.6, and sorted [95, 92, 88, 85, 78]

            const usedMax = superchargeCode.includes('max(');
            const usedMin = superchargeCode.includes('min(');
            const usedSum = superchargeCode.includes('sum(');
            const usedLen = superchargeCode.includes('len(');
            const usedSorted = superchargeCode.includes('sorted(') || superchargeCode.includes('.sort(');

            const has95 = output.includes('95');
            const has78 = output.includes('78');
            const has438 = output.includes('438');
            const hasAverage = output.includes('87.6') || output.includes('87');
            const hasSortedList = output.includes('[95') || output.includes('95, 92') || output.includes('[95, 92, 88, 85, 78]');

            const completed = usedMax && usedMin && usedSum && usedLen && usedSorted &&
                             has95 && has78 && has438 && hasAverage && hasSortedList;

            setSuperchargeOutput(output);
            if (completed) {
                setSuperchargeDone(true);
            }
        } catch {
            setSuperchargeOutput('Error in code!');
        }
    };

    // Claim main XP
    const claimMainXp = () => {
        if (!xpClaimed && allChallengesComplete) {
            addXpAndCoins(LESSON.xpReward, 5);
            completeLevel(LESSON_ID, LESSON.xpReward, 5, 1, 60);
            setXpClaimed(true);
            setLessonComplete(true);
        }
    };

    // Claim supercharge XP
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
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        style={{ fontSize: '3rem' }}
                    >
                        {LESSON.emoji}
                    </motion.div>
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
                    className={styles.successIcon}
                >
                    <Check size={50} className="text-white" />
                </motion.div>
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={styles.successTitle}
                >
                    LIST PRO!
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
                    <Link href="/level3/lesson13" className={`${styles.navBtn} ${styles.primary}`}>
                        Next Lesson <ChevronRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/level3" className={styles.backBtn}>
                    <ArrowLeft size={18} /> Back
                </Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 16</span>
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
                {/* Title */}
                <div className={styles.lessonTitle}>
                    <motion.div
                        className={styles.lessonEmoji}
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        {LESSON.emoji}
                    </motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1>{LESSON.title}</h1>
                        <p>{LESSON.subtitle}: <code>{LESSON.concept}</code></p>
                    </div>
                </div>

                {/* Story/Mission Box */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.explainBox}
                    style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <Target size={24} className="text-purple-400" />
                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Time to Practice List Functions!</span>
                    </div>
                    <p style={{ fontSize: '1.1rem' }}>
                        You've learned <code>min()</code>, <code>max()</code>, <code>sum()</code>, and <code>sorted()</code>!
                        Now put them all together!
                    </p>
                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                        Complete all 3 challenges to earn <strong>+{LESSON.xpReward} XP</strong>!
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
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Champion</span>
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
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sort</span>
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
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total</span>
                    </div>
                </div>

                {/* Challenge 1: Find the Champion */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={styles.codeSection}
                    style={{
                        border: challenge1.completed ? '2px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 'var(--radius)',
                        padding: '1.5rem',
                        marginBottom: '1.5rem',
                        background: challenge1.completed ? 'rgba(16, 185, 129, 0.05)' : 'transparent'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>1. Find the Champion</span>
                            {challenge1.completed && <Check size={20} className="text-emerald-400" />}
                        </div>
                        <button
                            onClick={() => setChallenge1({ ...challenge1, showHint: !challenge1.showHint })}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.5rem 0.75rem',
                                background: 'rgba(251, 191, 36, 0.2)',
                                border: '1px solid rgba(251, 191, 36, 0.4)',
                                borderRadius: '0.5rem',
                                color: '#fbbf24',
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                            }}
                        >
                            <HelpCircle size={16} /> Hint
                        </button>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        <p style={{ margin: 0, fontWeight: 600 }}>Your mission:</p>
                        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <li>Create: <code>scores = [78, 92, 85, 96, 88]</code></li>
                            <li>Find and print the <strong>highest score</strong> using <code>max()</code></li>
                        </ul>
                    </div>

                    {challenge1.showHint && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{
                                background: 'rgba(251, 191, 36, 0.1)',
                                border: '1px solid rgba(251, 191, 36, 0.3)',
                                borderRadius: '0.5rem',
                                padding: '1rem',
                                marginBottom: '1rem'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Lightbulb size={16} className="text-amber-400" />
                                <span style={{ color: '#fbbf24', fontWeight: 600 }}>Hint:</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>
                                Use <code>max(scores)</code> to find the biggest number in the list!
                            </p>
                            <pre style={{
                                margin: '0.5rem 0 0',
                                padding: '0.5rem',
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '0.25rem',
                                fontSize: '0.85rem'
                            }}>
{`scores = [78, 92, 85, 96, 88]
print(max(scores))  # Prints the highest`}
                            </pre>
                        </motion.div>
                    )}

                    <div className={styles.editor}>
                        <div className={styles.codeHeader}><span>champion.py</span><span>Python</span></div>
                        <textarea
                            value={challenge1.code}
                            onChange={(e) => setChallenge1({ ...challenge1, code: e.target.value })}
                            placeholder={'scores = [78, 92, 85, 96, 88]\nprint(max(scores))'}
                            spellCheck={false}
                            style={{ minHeight: '100px' }}
                            disabled={challenge1.completed}
                        />
                    </div>

                    {!challenge1.completed && (
                        <button className={styles.runBtn} onClick={runChallenge1}>
                            <Play size={18} /> Run Code
                        </button>
                    )}

                    {challenge1.output && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.outputBox}
                            style={{ borderColor: challenge1.completed ? 'rgba(16, 185, 129, 0.5)' : undefined }}
                        >
                            <div className={styles.outputLabel}>{challenge1.completed ? 'Perfect! The champion scored 96!' : 'Output:'}</div>
                            <div className={styles.outputText}>{challenge1.output}</div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Challenge 2: Sort the Scores */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className={styles.codeSection}
                    style={{
                        border: challenge2.completed ? '2px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 'var(--radius)',
                        padding: '1.5rem',
                        marginBottom: '1.5rem',
                        background: challenge2.completed ? 'rgba(16, 185, 129, 0.05)' : 'transparent'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>2. Sort the Scores</span>
                            {challenge2.completed && <Check size={20} className="text-emerald-400" />}
                        </div>
                        <button
                            onClick={() => setChallenge2({ ...challenge2, showHint: !challenge2.showHint })}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.5rem 0.75rem',
                                background: 'rgba(251, 191, 36, 0.2)',
                                border: '1px solid rgba(251, 191, 36, 0.4)',
                                borderRadius: '0.5rem',
                                color: '#fbbf24',
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                            }}
                        >
                            <HelpCircle size={16} /> Hint
                        </button>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        <p style={{ margin: 0, fontWeight: 600 }}>Your mission:</p>
                        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <li>Create a list of 5 numbers (any numbers you like!)</li>
                            <li>Sort them from <strong>smallest to largest</strong></li>
                            <li>Print the sorted result</li>
                        </ul>
                    </div>

                    {challenge2.showHint && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{
                                background: 'rgba(251, 191, 36, 0.1)',
                                border: '1px solid rgba(251, 191, 36, 0.3)',
                                borderRadius: '0.5rem',
                                padding: '1rem',
                                marginBottom: '1rem'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Lightbulb size={16} className="text-amber-400" />
                                <span style={{ color: '#fbbf24', fontWeight: 600 }}>Hint:</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>
                                Use <code>sorted(numbers)</code> to get a sorted copy, or <code>numbers.sort()</code> to sort in place!
                            </p>
                            <pre style={{
                                margin: '0.5rem 0 0',
                                padding: '0.5rem',
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '0.25rem',
                                fontSize: '0.85rem'
                            }}>
{`numbers = [50, 20, 40, 10, 30]
print(sorted(numbers))  # [10, 20, 30, 40, 50]`}
                            </pre>
                        </motion.div>
                    )}

                    <div className={styles.editor}>
                        <div className={styles.codeHeader}><span>sort.py</span><span>Python</span></div>
                        <textarea
                            value={challenge2.code}
                            onChange={(e) => setChallenge2({ ...challenge2, code: e.target.value })}
                            placeholder={'numbers = [50, 20, 40, 10, 30]\nprint(sorted(numbers))'}
                            spellCheck={false}
                            style={{ minHeight: '100px' }}
                            disabled={challenge2.completed}
                        />
                    </div>

                    {!challenge2.completed && (
                        <button className={styles.runBtn} onClick={runChallenge2}>
                            <Play size={18} /> Run Code
                        </button>
                    )}

                    {challenge2.output && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.outputBox}
                            style={{ borderColor: challenge2.completed ? 'rgba(16, 185, 129, 0.5)' : undefined }}
                        >
                            <div className={styles.outputLabel}>{challenge2.completed ? 'Sorted perfectly!' : 'Output:'}</div>
                            <div className={styles.outputText}>{challenge2.output}</div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Challenge 3: Total Points */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className={styles.codeSection}
                    style={{
                        border: challenge3.completed ? '2px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 'var(--radius)',
                        padding: '1.5rem',
                        marginBottom: '1.5rem',
                        background: challenge3.completed ? 'rgba(16, 185, 129, 0.05)' : 'transparent'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>3. Total Points</span>
                            {challenge3.completed && <Check size={20} className="text-emerald-400" />}
                        </div>
                        <button
                            onClick={() => setChallenge3({ ...challenge3, showHint: !challenge3.showHint })}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.5rem 0.75rem',
                                background: 'rgba(251, 191, 36, 0.2)',
                                border: '1px solid rgba(251, 191, 36, 0.4)',
                                borderRadius: '0.5rem',
                                color: '#fbbf24',
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                            }}
                        >
                            <HelpCircle size={16} /> Hint
                        </button>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        <p style={{ margin: 0, fontWeight: 600 }}>Your mission:</p>
                        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <li>Create: <code>points = [100, 250, 175, 325]</code></li>
                            <li>Calculate the <strong>sum of all points</strong></li>
                            <li>Print the total</li>
                        </ul>
                    </div>

                    {challenge3.showHint && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{
                                background: 'rgba(251, 191, 36, 0.1)',
                                border: '1px solid rgba(251, 191, 36, 0.3)',
                                borderRadius: '0.5rem',
                                padding: '1rem',
                                marginBottom: '1rem'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Lightbulb size={16} className="text-amber-400" />
                                <span style={{ color: '#fbbf24', fontWeight: 600 }}>Hint:</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>
                                Use <code>sum(points)</code> to add up all numbers in the list!
                            </p>
                            <pre style={{
                                margin: '0.5rem 0 0',
                                padding: '0.5rem',
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '0.25rem',
                                fontSize: '0.85rem'
                            }}>
{`points = [100, 250, 175, 325]
print(sum(points))  # Adds them all up!`}
                            </pre>
                        </motion.div>
                    )}

                    <div className={styles.editor}>
                        <div className={styles.codeHeader}><span>total.py</span><span>Python</span></div>
                        <textarea
                            value={challenge3.code}
                            onChange={(e) => setChallenge3({ ...challenge3, code: e.target.value })}
                            placeholder={'points = [100, 250, 175, 325]\nprint(sum(points))'}
                            spellCheck={false}
                            style={{ minHeight: '100px' }}
                            disabled={challenge3.completed}
                        />
                    </div>

                    {!challenge3.completed && (
                        <button className={styles.runBtn} onClick={runChallenge3}>
                            <Play size={18} /> Run Code
                        </button>
                    )}

                    {challenge3.output && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.outputBox}
                            style={{ borderColor: challenge3.completed ? 'rgba(16, 185, 129, 0.5)' : undefined }}
                        >
                            <div className={styles.outputLabel}>{challenge3.completed ? 'Total calculated: 850 points!' : 'Output:'}</div>
                            <div className={styles.outputText}>{challenge3.output}</div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Claim Main XP Button */}
                {allChallengesComplete && !xpClaimed && (
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
                        <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>List Function Cheat Sheet:</p>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                            <li><code>max(list)</code> - Find the biggest value</li>
                            <li><code>min(list)</code> - Find the smallest value</li>
                            <li><code>sum(list)</code> - Add all values together</li>
                            <li><code>sorted(list)</code> - Sort smallest to largest</li>
                            <li><code>sorted(list, reverse=True)</code> - Sort largest to smallest</li>
                        </ul>
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
                        >
                            <Zap size={28} className="text-amber-400" fill="currentColor" />
                        </motion.span>
                        <div>
                            <h3 style={{ margin: 0, color: '#fbbf24', fontWeight: 800 }}>SUPERCHARGE - Game Stats Calculator</h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Optional +25 XP - Not required to advance</p>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        <p style={{ margin: 0, fontWeight: 600, marginBottom: '0.5rem' }}>Build a Complete Stats Calculator!</p>
                        <p style={{ margin: 0, marginBottom: '0.75rem' }}>
                            Given <code>scores = [85, 92, 78, 95, 88]</code>, calculate and print:
                        </p>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <li>Highest score (using <code>max()</code>)</li>
                            <li>Lowest score (using <code>min()</code>)</li>
                            <li>Total of all scores (using <code>sum()</code>)</li>
                            <li>Average score (hint: <code>sum(scores) / len(scores)</code>)</li>
                            <li>Sorted scores from best to worst (using <code>sorted()</code> with <code>reverse=True</code>)</li>
                        </ul>
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '0.5rem', marginTop: '1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            <span style={{ color: '#6272a4' }}># Expected output:</span>{'\n'}
                            Highest: 95{'\n'}
                            Lowest: 78{'\n'}
                            Total: 438{'\n'}
                            Average: 87.6{'\n'}
                            Sorted: [95, 92, 88, 85, 78]
                        </div>
                    </div>

                    <button
                        onClick={() => setShowSuperchargeHint(!showSuperchargeHint)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.5rem 0.75rem',
                            background: 'rgba(251, 191, 36, 0.2)',
                            border: '1px solid rgba(251, 191, 36, 0.4)',
                            borderRadius: '0.5rem',
                            color: '#fbbf24',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            marginBottom: '1rem'
                        }}
                    >
                        <HelpCircle size={16} /> {showSuperchargeHint ? 'Hide Hint' : 'Show Hint'}
                    </button>

                    {showSuperchargeHint && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '0.5rem',
                                padding: '1rem',
                                marginBottom: '1rem'
                            }}
                        >
                            <pre style={{ margin: 0, fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
{`scores = [85, 92, 78, 95, 88]

print(f"Highest: {max(scores)}")
print(f"Lowest: {min(scores)}")
print(f"Total: {sum(scores)}")

average = sum(scores) / len(scores)
print(f"Average: {average}")

print(f"Sorted: {sorted(scores, reverse=True)}")`}
                            </pre>
                        </motion.div>
                    )}

                    <div className={styles.editor}>
                        <div className={styles.codeHeader}>
                            <span>stats.py</span>
                            <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Zap size={14} fill="currentColor" /> BONUS
                            </span>
                        </div>
                        <textarea
                            value={superchargeCode}
                            onChange={(e) => setSuperchargeCode(e.target.value)}
                            placeholder={`scores = [85, 92, 78, 95, 88]

# Calculate and print all stats!
print(f"Highest: {max(scores)}")
print(f"Lowest: {min(scores)}")
print(f"Total: {sum(scores)}")

average = sum(scores) / len(scores)
print(f"Average: {average}")

print(f"Sorted: {sorted(scores, reverse=True)}")`}
                            spellCheck={false}
                            style={{ minHeight: '240px' }}
                            disabled={superchargeDone}
                        />
                    </div>

                    <button
                        className={styles.runBtn}
                        onClick={runSupercharge}
                        style={{ background: superchargeDone ? '#10b981' : '#f59e0b' }}
                        disabled={superchargeDone}
                    >
                        <Play size={18} /> {superchargeDone ? 'Stats Complete!' : 'Calculate Stats'}
                    </button>

                    {superchargeOutput && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.outputBox}
                            style={{ borderColor: superchargeDone ? 'rgba(16, 185, 129, 0.5)' : 'rgba(251, 191, 36, 0.5)' }}
                        >
                            <div className={styles.outputLabel}>
                                {superchargeDone ? 'STATS MASTER!' : 'Output:'}
                            </div>
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
                            <Check size={20} /> +25 XP Claimed! Stats Wizard!
                        </motion.div>
                    )}
                </motion.div>

                {/* Navigation */}
                <div className={styles.navBar}>
                    <Link href="/level3/lesson11" className={`${styles.navBtn} ${styles.secondary}`}>
                        <ChevronLeft size={18} /> Previous
                    </Link>
                    {allChallengesComplete ? (
                        <Link href="/level3/lesson13" className={`${styles.navBtn} ${styles.primary}`}>
                            Next Lesson <ChevronRight size={18} />
                        </Link>
                    ) : (
                        <button className={`${styles.navBtn} ${styles.secondary}`} disabled style={{ opacity: 0.5 }}>
                            Complete All Challenges <ChevronRight size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
