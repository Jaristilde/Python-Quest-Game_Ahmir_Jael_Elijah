'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Trophy, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL3_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL3_LESSONS[14]; // Lesson 15 (0-indexed)
const LESSON_ID = 48;

interface ChallengeState {
    code: string;
    output: string;
    completed: boolean;
    showHint: boolean;
}

export default function Lesson15() {
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

    // Enhanced Python-like interpreter for list operations
    const runListCode = (code: string): { output: string; variables: { [key: string]: any } } => {
        const lines = code.trim().split('\n');
        let outputLines: string[] = [];
        const variables: { [key: string]: any } = {};

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            // List creation: my_list = [1, 2, 3] or my_list = ["a", "b", "c"]
            const listMatch = trimmed.match(/^(\w+)\s*=\s*\[(.*)\]$/);
            if (listMatch) {
                const varName = listMatch[1];
                const content = listMatch[2].trim();
                if (content === '') {
                    variables[varName] = [];
                } else {
                    const items: any[] = [];
                    const itemMatches = content.match(/(?:"[^"]*"|'[^']*'|-?\d+)/g);
                    if (itemMatches) {
                        for (const item of itemMatches) {
                            if (item.startsWith('"') || item.startsWith("'")) {
                                items.push(item.slice(1, -1));
                            } else {
                                items.push(parseInt(item));
                            }
                        }
                    }
                    variables[varName] = items;
                }
                continue;
            }

            // List append: my_list.append("item") or my_list.append(5)
            const appendMatch = trimmed.match(/^(\w+)\.append\s*\(\s*(?:"([^"]*)"|'([^']*)'|(-?\d+))\s*\)$/);
            if (appendMatch) {
                const varName = appendMatch[1];
                const value = appendMatch[2] || appendMatch[3] || (appendMatch[4] ? parseInt(appendMatch[4]) : '');
                if (variables[varName] && Array.isArray(variables[varName])) {
                    variables[varName].push(value);
                }
                continue;
            }

            // List remove: my_list.remove("item") or my_list.remove(5)
            const removeMatch = trimmed.match(/^(\w+)\.remove\s*\(\s*(?:"([^"]*)"|'([^']*)'|(-?\d+))\s*\)$/);
            if (removeMatch) {
                const varName = removeMatch[1];
                const value = removeMatch[2] || removeMatch[3] || (removeMatch[4] ? parseInt(removeMatch[4]) : '');
                if (variables[varName] && Array.isArray(variables[varName])) {
                    const idx = variables[varName].indexOf(value);
                    if (idx > -1) {
                        variables[varName].splice(idx, 1);
                    }
                }
                continue;
            }

            // List extend: list1.extend(list2)
            const extendMatch = trimmed.match(/^(\w+)\.extend\s*\(\s*(\w+)\s*\)$/);
            if (extendMatch) {
                const varName = extendMatch[1];
                const sourceVar = extendMatch[2];
                if (variables[varName] && Array.isArray(variables[varName]) &&
                    variables[sourceVar] && Array.isArray(variables[sourceVar])) {
                    variables[varName].push(...variables[sourceVar]);
                }
                continue;
            }

            // List concatenation: combined = list1 + list2
            const concatMatch = trimmed.match(/^(\w+)\s*=\s*(\w+)\s*\+\s*(\w+)$/);
            if (concatMatch) {
                const varName = concatMatch[1];
                const list1 = concatMatch[2];
                const list2 = concatMatch[3];
                if (variables[list1] && Array.isArray(variables[list1]) &&
                    variables[list2] && Array.isArray(variables[list2])) {
                    variables[varName] = [...variables[list1], ...variables[list2]];
                }
                continue;
            }

            // List concatenation with inline list: combined = list1 + [50, 60]
            const concatInlineMatch = trimmed.match(/^(\w+)\s*=\s*(\w+)\s*\+\s*\[(.*)\]$/);
            if (concatInlineMatch) {
                const varName = concatInlineMatch[1];
                const list1 = concatInlineMatch[2];
                const inlineContent = concatInlineMatch[3].trim();
                if (variables[list1] && Array.isArray(variables[list1])) {
                    const inlineItems: any[] = [];
                    const itemMatches = inlineContent.match(/(?:"[^"]*"|'[^']*'|-?\d+)/g);
                    if (itemMatches) {
                        for (const item of itemMatches) {
                            if (item.startsWith('"') || item.startsWith("'")) {
                                inlineItems.push(item.slice(1, -1));
                            } else {
                                inlineItems.push(parseInt(item));
                            }
                        }
                    }
                    variables[varName] = [...variables[list1], ...inlineItems];
                }
                continue;
            }

            // Print statement with various formats
            const printMatch = trimmed.match(/^print\s*\(\s*(.+)\s*\)$/);
            if (printMatch) {
                let content = printMatch[1].trim();

                // Check for f-string
                const fstringMatch = content.match(/^f["'](.*)["']$/);
                if (fstringMatch) {
                    let fstring = fstringMatch[1];
                    // Replace {var} with variable values
                    fstring = fstring.replace(/\{(\w+)\}/g, (_, varName) => {
                        if (variables[varName] !== undefined) {
                            if (Array.isArray(variables[varName])) {
                                return '[' + variables[varName].map((v: any) => typeof v === 'string' ? `'${v}'` : v).join(', ') + ']';
                            }
                            return String(variables[varName]);
                        }
                        return `{${varName}}`;
                    });
                    // Replace {expression} like {len(var)}
                    fstring = fstring.replace(/\{len\((\w+)\)\}/g, (_, varName) => {
                        if (variables[varName] && Array.isArray(variables[varName])) {
                            return String(variables[varName].length);
                        }
                        return '{len()}';
                    });
                    // Replace {var.count("x")}
                    fstring = fstring.replace(/\{(\w+)\.count\(["']([^"']*)["']\)\}/g, (_, varName, searchVal) => {
                        if (variables[varName] && Array.isArray(variables[varName])) {
                            return String(variables[varName].filter((x: any) => x === searchVal).length);
                        }
                        return '{count}';
                    });
                    // Replace {sum(var)}
                    fstring = fstring.replace(/\{sum\((\w+)\)\}/g, (_, varName) => {
                        if (variables[varName] && Array.isArray(variables[varName])) {
                            return String(variables[varName].reduce((a: number, b: number) => a + b, 0));
                        }
                        return '{sum()}';
                    });
                    outputLines.push(fstring);
                    continue;
                }

                // Check for string literal
                const strMatch = content.match(/^["'](.*)["']$/);
                if (strMatch) {
                    outputLines.push(strMatch[1]);
                    continue;
                }

                // Check for len(variable)
                const lenMatch = content.match(/^len\s*\(\s*(\w+)\s*\)$/);
                if (lenMatch) {
                    const varName = lenMatch[1];
                    if (variables[varName] && Array.isArray(variables[varName])) {
                        outputLines.push(String(variables[varName].length));
                    }
                    continue;
                }

                // Check for sum(variable)
                const sumMatch = content.match(/^sum\s*\(\s*(\w+)\s*\)$/);
                if (sumMatch) {
                    const varName = sumMatch[1];
                    if (variables[varName] && Array.isArray(variables[varName])) {
                        const total = variables[varName].reduce((a: number, b: number) => a + b, 0);
                        outputLines.push(String(total));
                    }
                    continue;
                }

                // Check for variable.count("x")
                const countMatch = content.match(/^(\w+)\.count\s*\(\s*["']([^"']*)["']\s*\)$/);
                if (countMatch) {
                    const varName = countMatch[1];
                    const searchVal = countMatch[2];
                    if (variables[varName] && Array.isArray(variables[varName])) {
                        const count = variables[varName].filter((x: any) => x === searchVal).length;
                        outputLines.push(String(count));
                    }
                    continue;
                }

                // Check for list index: var[index]
                const indexMatch = content.match(/^(\w+)\[(\d+)\]$/);
                if (indexMatch) {
                    const varName = indexMatch[1];
                    const index = parseInt(indexMatch[2]);
                    if (variables[varName] && Array.isArray(variables[varName]) && index < variables[varName].length) {
                        outputLines.push(String(variables[varName][index]));
                    }
                    continue;
                }

                // Check for variable name
                if (variables[content] !== undefined) {
                    if (Array.isArray(variables[content])) {
                        const formatted = '[' + variables[content].map((v: any) => typeof v === 'string' ? `'${v}'` : v).join(', ') + ']';
                        outputLines.push(formatted);
                    } else {
                        outputLines.push(String(variables[content]));
                    }
                }
                continue;
            }
        }

        const output = outputLines.length > 0 ? outputLines.join('\n') : '(No output)';
        return { output, variables };
    };

    // Challenge 1: Count and Combine
    const runChallenge1 = () => {
        try {
            const result = runListCode(challenge1.code);
            const output = result.output;
            const vars = result.variables;

            // Check for combined list and length printed
            let hasList1 = vars['list1'] && Array.isArray(vars['list1']) && vars['list1'].length >= 3;
            let hasList2 = vars['list2'] && Array.isArray(vars['list2']) && vars['list2'].length >= 3;
            let hasCombined = false;
            let printedLength = false;

            // Check if they combined the lists
            for (const key of Object.keys(vars)) {
                if (Array.isArray(vars[key]) && vars[key].length >= 6) {
                    hasCombined = true;
                }
            }

            // Check if output contains 6 (the total length)
            if (output.includes('6')) {
                printedLength = true;
            }

            const completed = hasList1 && hasList2 && hasCombined && printedLength;
            setChallenge1({ ...challenge1, output, completed });
        } catch {
            setChallenge1({ ...challenge1, output: 'Error in code!' });
        }
    };

    // Challenge 2: Find Duplicates
    const runChallenge2 = () => {
        try {
            const result = runListCode(challenge2.code);
            const output = result.output;
            const vars = result.variables;

            // Check for items list and count of "a"
            let hasItems = vars['items'] && Array.isArray(vars['items']);
            let printedCount = output.includes('3'); // "a" appears 3 times

            const completed = hasItems && printedCount;
            setChallenge2({ ...challenge2, output, completed });
        } catch {
            setChallenge2({ ...challenge2, output: 'Error in code!' });
        }
    };

    // Challenge 3: List Stats
    const runChallenge3 = () => {
        try {
            const result = runListCode(challenge3.code);
            const output = result.output;
            const vars = result.variables;

            // Check for data list, length (4), sum (100), and combined list
            let hasData = vars['data'] && Array.isArray(vars['data']);
            let printedLength = output.includes('4');
            let printedSum = output.includes('100');
            let hasCombined = false;

            // Check if they made a combined list with 50, 60
            for (const key of Object.keys(vars)) {
                if (Array.isArray(vars[key]) && vars[key].includes(50) && vars[key].includes(60)) {
                    hasCombined = true;
                }
            }

            // Also check output for the combined list
            if (output.includes('50') && output.includes('60')) {
                hasCombined = true;
            }

            const completed = hasData && printedLength && printedSum && hasCombined;
            setChallenge3({ ...challenge3, output, completed });
        } catch {
            setChallenge3({ ...challenge3, output: 'Error in code!' });
        }
    };

    // Supercharge: Ultimate List Master
    const runSupercharge = () => {
        try {
            const result = runListCode(superchargeCode);
            const output = result.output;
            const vars = result.variables;

            // Requirements:
            // 1. Start with inventory with sword, shield, potion, potion, gold
            // 2. Print total items (len) - should be 5 initially
            // 3. Print potion count - should be 2 initially
            // 4. Add "armor" (.append)
            // 5. Remove one "potion" (.remove)
            // 6. Print final inventory
            // 7. Print final count

            const hasInventory = vars['inventory'] && Array.isArray(vars['inventory']);
            const usedLen = challenge1.code.includes('len(') || superchargeCode.includes('len(');
            const usedCount = superchargeCode.includes('.count(');
            const usedAppend = superchargeCode.includes('.append(');
            const usedRemove = superchargeCode.includes('.remove(');

            // Check output for expected values
            const outputLines = output.split('\n');
            const printed5 = output.includes('5'); // Initial count
            const printed2 = output.includes('2'); // Potion count
            const printedArmor = output.includes('armor');
            const printedFinal = output.includes('[') && output.includes(']');

            const completed = hasInventory && usedAppend && usedRemove && usedCount &&
                             printed5 && printed2 && printedArmor && printedFinal;

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
                    style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}
                >
                    <Trophy size={50} className="text-white" />
                </motion.div>
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={styles.successTitle}
                    style={{
                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    LIST LEGEND!
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
                    style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}
                >
                    <Link href="/level3" className={`${styles.navBtn} ${styles.secondary}`}>
                        <ArrowLeft size={18} /> Back to Level 3
                    </Link>
                    <Link href="/level3/lesson16" className={`${styles.navBtn} ${styles.primary}`}>
                        Final Project <ChevronRight size={18} />
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
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 16 - FINAL PRACTICE</span>
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
                        style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.3))' }}
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
                    style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2))' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <Trophy size={24} className="text-amber-400" />
                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Final List Practice!</span>
                    </div>
                    <p style={{ fontSize: '1.1rem' }}>
                        You've learned ALL the list methods! Now combine them: <code>len()</code>, <code>.count()</code>, <code>sum()</code>, <code>+</code> combining, <code>.append()</code>, and <code>.remove()</code>!
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
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Combine</span>
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
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Count</span>
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
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stats</span>
                    </div>
                </div>

                {/* Challenge 1: Count and Combine */}
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
                            <span style={{ fontSize: '1.5rem' }}>1. Count and Combine</span>
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
                            <li>Create <code>list1 = [1, 2, 3]</code> and <code>list2 = [4, 5, 6]</code></li>
                            <li>Combine them into a new list using <code>+</code></li>
                            <li>Print the total length using <code>len()</code></li>
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
                            <pre style={{
                                margin: '0.5rem 0 0',
                                padding: '0.5rem',
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '0.25rem',
                                fontSize: '0.85rem'
                            }}>
{`list1 = [1, 2, 3]
list2 = [4, 5, 6]
combined = list1 + list2
print(len(combined))`}
                            </pre>
                        </motion.div>
                    )}

                    <div className={styles.editor}>
                        <div className={styles.codeHeader}><span>combine.py</span><span>Python</span></div>
                        <textarea
                            value={challenge1.code}
                            onChange={(e) => setChallenge1({ ...challenge1, code: e.target.value })}
                            placeholder={'list1 = [1, 2, 3]\nlist2 = [4, 5, 6]\ncombined = list1 + list2\nprint(len(combined))'}
                            spellCheck={false}
                            style={{ minHeight: '120px' }}
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
                            <div className={styles.outputLabel}>{challenge1.completed ? 'Perfect!' : 'Output:'}</div>
                            <div className={styles.outputText}>{challenge1.output}</div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Challenge 2: Find Duplicates */}
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
                            <span style={{ fontSize: '1.5rem' }}>2. Find Duplicates</span>
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
                            <li>Create <code>items = ["a", "b", "a", "c", "a"]</code></li>
                            <li>Count how many times <code>"a"</code> appears using <code>.count()</code></li>
                            <li>Print the count (should be 3)</li>
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
                            <pre style={{
                                margin: '0.5rem 0 0',
                                padding: '0.5rem',
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '0.25rem',
                                fontSize: '0.85rem'
                            }}>
{`items = ["a", "b", "a", "c", "a"]
print(items.count("a"))`}
                            </pre>
                        </motion.div>
                    )}

                    <div className={styles.editor}>
                        <div className={styles.codeHeader}><span>count.py</span><span>Python</span></div>
                        <textarea
                            value={challenge2.code}
                            onChange={(e) => setChallenge2({ ...challenge2, code: e.target.value })}
                            placeholder={'items = ["a", "b", "a", "c", "a"]\nprint(items.count("a"))'}
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
                            <div className={styles.outputLabel}>{challenge2.completed ? 'Perfect!' : 'Output:'}</div>
                            <div className={styles.outputText}>{challenge2.output}</div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Challenge 3: List Stats */}
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
                            <span style={{ fontSize: '1.5rem' }}>3. List Stats</span>
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
                            <li>Create <code>data = [10, 20, 30, 40]</code></li>
                            <li>Print the length (4)</li>
                            <li>Print the sum (100)</li>
                            <li>Combine with <code>[50, 60]</code> and print it</li>
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
                            <pre style={{
                                margin: '0.5rem 0 0',
                                padding: '0.5rem',
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '0.25rem',
                                fontSize: '0.85rem'
                            }}>
{`data = [10, 20, 30, 40]
print(len(data))
print(sum(data))
extended = data + [50, 60]
print(extended)`}
                            </pre>
                        </motion.div>
                    )}

                    <div className={styles.editor}>
                        <div className={styles.codeHeader}><span>stats.py</span><span>Python</span></div>
                        <textarea
                            value={challenge3.code}
                            onChange={(e) => setChallenge3({ ...challenge3, code: e.target.value })}
                            placeholder={'data = [10, 20, 30, 40]\nprint(len(data))\nprint(sum(data))\nextended = data + [50, 60]\nprint(extended)'}
                            spellCheck={false}
                            style={{ minHeight: '140px' }}
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
                            <div className={styles.outputLabel}>{challenge3.completed ? 'Perfect!' : 'Output:'}</div>
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
                        <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>List Methods Cheat Sheet:</p>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                            <li><code>len(list)</code> - Get number of items</li>
                            <li><code>list.count("x")</code> - Count occurrences</li>
                            <li><code>sum(list)</code> - Add all numbers</li>
                            <li><code>list1 + list2</code> - Combine lists</li>
                            <li><code>list.append("x")</code> - Add to end</li>
                            <li><code>list.remove("x")</code> - Remove item</li>
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
                            {String.fromCodePoint(0x26A1)}
                        </motion.span>
                        <div>
                            <h3 style={{ margin: 0, color: '#fbbf24', fontWeight: 800 }}>SUPERCHARGE - Ultimate List Master (+25 XP)</h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Optional - Build a complete inventory system!</p>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        <p style={{ margin: 0, fontWeight: 600, marginBottom: '0.5rem' }}>Build an Inventory Manager!</p>
                        <p style={{ margin: 0, marginBottom: '0.75rem' }}>
                            Use ALL your list skills in one challenge:
                        </p>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <li>Start with <code>inventory = ["sword", "shield", "potion", "potion", "gold"]</code></li>
                            <li>Print how many items total using <code>len()</code> (should be 5)</li>
                            <li>Print how many potions using <code>.count()</code> (should be 2)</li>
                            <li>Add <code>"armor"</code> using <code>.append()</code></li>
                            <li>Remove one <code>"potion"</code> using <code>.remove()</code></li>
                            <li>Print the final inventory</li>
                            <li>Print the final item count</li>
                        </ul>
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
{`inventory = ["sword", "shield", "potion", "potion", "gold"]
print(len(inventory))
print(inventory.count("potion"))
inventory.append("armor")
inventory.remove("potion")
print(inventory)
print(len(inventory))`}
                            </pre>
                        </motion.div>
                    )}

                    <div className={styles.editor}>
                        <div className={styles.codeHeader}>
                            <span>inventory_master.py</span>
                            <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                {String.fromCodePoint(0x26A1)} BONUS
                            </span>
                        </div>
                        <textarea
                            value={superchargeCode}
                            onChange={(e) => setSuperchargeCode(e.target.value)}
                            placeholder={`inventory = ["sword", "shield", "potion", "potion", "gold"]

# Print total items
print(len(inventory))

# Print potion count
print(inventory.count("potion"))

# Add armor
inventory.append("armor")

# Remove one potion
inventory.remove("potion")

# Print final inventory
print(inventory)

# Print final count
print(len(inventory))`}
                            spellCheck={false}
                            style={{ minHeight: '280px' }}
                            disabled={superchargeDone}
                        />
                    </div>

                    <button
                        className={styles.runBtn}
                        onClick={runSupercharge}
                        style={{ background: superchargeDone ? '#10b981' : '#f59e0b' }}
                        disabled={superchargeDone}
                    >
                        <Play size={18} /> {superchargeDone ? 'Inventory Master!' : 'Test Inventory System'}
                    </button>

                    {superchargeOutput && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.outputBox}
                            style={{ borderColor: superchargeDone ? 'rgba(16, 185, 129, 0.5)' : 'rgba(251, 191, 36, 0.5)' }}
                        >
                            <div className={styles.outputLabel}>
                                {superchargeDone ? `${String.fromCodePoint(0x26A1)} ULTIMATE LIST MASTER!` : 'Output:'}
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
                            <Check size={20} /> +25 XP Claimed! Ultimate List Master! {String.fromCodePoint(0x26A1)}
                        </motion.div>
                    )}
                </motion.div>

                {/* Navigation */}
                <div className={styles.navBar}>
                    <Link href="/level3/lesson14" className={`${styles.navBtn} ${styles.secondary}`}>
                        <ChevronLeft size={18} /> Previous
                    </Link>
                    {allChallengesComplete ? (
                        <Link href="/level3/lesson16" className={`${styles.navBtn} ${styles.primary}`}>
                            Final Project <ChevronRight size={18} />
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
