'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Target, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL3_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL3_LESSONS[3]; // Lesson 4
const LESSON_ID = 37;

interface ChallengeState {
    code: string;
    output: string;
    completed: boolean;
    showHint: boolean;
}

export default function Lesson4() {
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

    // Simple Python-like interpreter for list operations
    const runListCode = (code: string): { output: string; variables: { [key: string]: any } } => {
        const lines = code.trim().split('\n');
        let outputLines: string[] = [];
        const variables: { [key: string]: any } = {};

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            // List creation: my_list = ["a", "b", "c"]
            const listMatch = trimmed.match(/^(\w+)\s*=\s*\[(.*)\]$/);
            if (listMatch) {
                const varName = listMatch[1];
                const content = listMatch[2].trim();
                if (content === '') {
                    variables[varName] = [];
                } else {
                    // Parse list items
                    const items: any[] = [];
                    const itemMatches = content.match(/(?:"[^"]*"|'[^']*'|\d+)/g);
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

            // List append: my_list.append("item")
            const appendMatch = trimmed.match(/^(\w+)\.append\s*\(\s*(?:"([^"]*)"|'([^']*)'|(\d+))\s*\)$/);
            if (appendMatch) {
                const varName = appendMatch[1];
                const value = appendMatch[2] || appendMatch[3] || (appendMatch[4] ? parseInt(appendMatch[4]) : '');
                if (variables[varName] && Array.isArray(variables[varName])) {
                    variables[varName].push(value);
                }
                continue;
            }

            // List remove: my_list.remove("item")
            const removeMatch = trimmed.match(/^(\w+)\.remove\s*\(\s*(?:"([^"]*)"|'([^']*)'|(\d+))\s*\)$/);
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

            // List index assignment: my_list[0] = "new_value"
            const indexAssignMatch = trimmed.match(/^(\w+)\[(\d+)\]\s*=\s*(?:"([^"]*)"|'([^']*)'|(\d+))$/);
            if (indexAssignMatch) {
                const varName = indexAssignMatch[1];
                const index = parseInt(indexAssignMatch[2]);
                const value = indexAssignMatch[3] || indexAssignMatch[4] || (indexAssignMatch[5] ? parseInt(indexAssignMatch[5]) : '');
                if (variables[varName] && Array.isArray(variables[varName]) && index < variables[varName].length) {
                    variables[varName][index] = value;
                }
                continue;
            }

            // Print statement: print(variable) or print(variable[index])
            const printMatch = trimmed.match(/^print\s*\(\s*(.+)\s*\)$/);
            if (printMatch) {
                let content = printMatch[1].trim();

                // Check for string literal
                const strMatch = content.match(/^["'](.*)["']$/);
                if (strMatch) {
                    outputLines.push(strMatch[1]);
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
                if (variables[content]) {
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

    // Challenge 1: Create a Pet List
    const runChallenge1 = () => {
        try {
            const result = runListCode(challenge1.code);
            const output = result.output;
            const vars = result.variables;

            // Check for a list with 3 pet names and printing the second one
            let hasList = false;
            let hasThreeItems = false;
            let printedSecond = false;

            for (const key of Object.keys(vars)) {
                if (Array.isArray(vars[key])) {
                    hasList = true;
                    if (vars[key].length >= 3) {
                        hasThreeItems = true;
                        // Check if output contains the second item (index 1)
                        if (output.includes(String(vars[key][1])) && !output.includes('[')) {
                            printedSecond = true;
                        }
                    }
                }
            }

            const completed = hasList && hasThreeItems && printedSecond;
            setChallenge1({ ...challenge1, output, completed });
        } catch {
            setChallenge1({ ...challenge1, output: 'Error in code!' });
        }
    };

    // Challenge 2: Update the Menu
    const runChallenge2 = () => {
        try {
            const result = runListCode(challenge2.code);
            const output = result.output;
            const vars = result.variables;

            // Check: menu should have "soup", should NOT have "pasta", should have "pizza" and "salad"
            let completed = false;
            if (vars['menu'] && Array.isArray(vars['menu'])) {
                const menu = vars['menu'];
                const hasSoup = menu.includes('soup');
                const noPasta = !menu.includes('pasta');
                const hasPizza = menu.includes('pizza');
                const hasSalad = menu.includes('salad');
                completed = hasSoup && noPasta && hasPizza && hasSalad;
            }

            setChallenge2({ ...challenge2, output, completed });
        } catch {
            setChallenge2({ ...challenge2, output: 'Error in code!' });
        }
    };

    // Challenge 3: Swap the First
    const runChallenge3 = () => {
        try {
            const result = runListCode(challenge3.code);
            const output = result.output;

            // Check if user used index assignment [0] =
            const usedIndexAssign = challenge3.code.includes('[0]') && challenge3.code.includes('=');
            const hasPrint = challenge3.code.includes('print');
            const hasOutput = output !== '(No output)' && output.includes('[');

            const completed = usedIndexAssign && hasPrint && hasOutput;
            setChallenge3({ ...challenge3, output, completed });
        } catch {
            setChallenge3({ ...challenge3, output: 'Error in code!' });
        }
    };

    // Supercharge: Inventory Manager
    const runSupercharge = () => {
        try {
            const result = runListCode(superchargeCode);
            const output = result.output;
            const vars = result.variables;

            // Check requirements:
            // 1. Created a list (inventory)
            // 2. Used append twice
            // 3. Used remove once
            // 4. Changed first item with [0] =
            // 5. Printed the final inventory

            const appendCount = (superchargeCode.match(/\.append\s*\(/g) || []).length;
            const removeCount = (superchargeCode.match(/\.remove\s*\(/g) || []).length;
            const hasIndexAssign = superchargeCode.includes('[0]') && superchargeCode.includes('=');
            const hasPrintList = output.includes('[') && output.includes(']');

            let hasInventory = false;
            for (const key of Object.keys(vars)) {
                if (Array.isArray(vars[key])) {
                    hasInventory = true;
                    break;
                }
            }

            const completed = hasInventory && appendCount >= 2 && removeCount >= 1 && hasIndexAssign && hasPrintList;

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
                    PRACTICE CHAMPION!
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
                    <Link href="/level3/lesson5" className={`${styles.navBtn} ${styles.primary}`}>
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
                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Time to Practice Lists!</span>
                    </div>
                    <p style={{ fontSize: '1.1rem' }}>
                        You've learned how to create lists, access items with <code>[index]</code>, and modify them with <code>.append()</code> and <code>.remove()</code>!
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
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pet List</span>
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
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Menu</span>
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
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Swap</span>
                    </div>
                </div>

                {/* Challenge 1: Create a Pet List */}
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
                            <span style={{ fontSize: '1.5rem' }}>1. Create a Pet List</span>
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
                            <li>Create a list called <code>pets</code> with 3 pet names</li>
                            <li>Print the <strong>second</strong> pet (remember: lists start at index 0!)</li>
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
                                The second item is at index <code>[1]</code> because we start counting from 0!
                            </p>
                            <pre style={{
                                margin: '0.5rem 0 0',
                                padding: '0.5rem',
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '0.25rem',
                                fontSize: '0.85rem'
                            }}>
{`pets = ["dog", "cat", "bird"]
print(pets[1])  # Prints the second pet`}
                            </pre>
                        </motion.div>
                    )}

                    <div className={styles.editor}>
                        <div className={styles.codeHeader}><span>pets.py</span><span>Python</span></div>
                        <textarea
                            value={challenge1.code}
                            onChange={(e) => setChallenge1({ ...challenge1, code: e.target.value })}
                            placeholder={'pets = ["dog", "cat", "hamster"]\nprint(pets[1])'}
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
                            <div className={styles.outputLabel}>{challenge1.completed ? 'Perfect!' : 'Output:'}</div>
                            <div className={styles.outputText}>{challenge1.output}</div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Challenge 2: Update the Menu */}
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
                            <span style={{ fontSize: '1.5rem' }}>2. Update the Menu</span>
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
                            <li>Start with: <code>menu = ["pizza", "pasta", "salad"]</code></li>
                            <li>Add <code>"soup"</code> to the menu</li>
                            <li>Remove <code>"pasta"</code> from the menu</li>
                            <li>Print the updated menu</li>
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
                                Use <code>.append()</code> to add and <code>.remove()</code> to remove items!
                            </p>
                            <pre style={{
                                margin: '0.5rem 0 0',
                                padding: '0.5rem',
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '0.25rem',
                                fontSize: '0.85rem'
                            }}>
{`menu.append("soup")    # Adds "soup"
menu.remove("pasta")   # Removes "pasta"`}
                            </pre>
                        </motion.div>
                    )}

                    <div className={styles.editor}>
                        <div className={styles.codeHeader}><span>menu.py</span><span>Python</span></div>
                        <textarea
                            value={challenge2.code}
                            onChange={(e) => setChallenge2({ ...challenge2, code: e.target.value })}
                            placeholder={'menu = ["pizza", "pasta", "salad"]\nmenu.append("soup")\nmenu.remove("pasta")\nprint(menu)'}
                            spellCheck={false}
                            style={{ minHeight: '140px' }}
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

                {/* Challenge 3: Swap the First */}
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
                            <span style={{ fontSize: '1.5rem' }}>3. Swap the First</span>
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
                            <li>Create any list with at least 3 items</li>
                            <li>Change the <strong>first</strong> item to something new</li>
                            <li>Print the updated list</li>
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
                                The first item is at index <code>[0]</code>. Assign a new value to it!
                            </p>
                            <pre style={{
                                margin: '0.5rem 0 0',
                                padding: '0.5rem',
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '0.25rem',
                                fontSize: '0.85rem'
                            }}>
{`colors = ["red", "blue", "green"]
colors[0] = "yellow"  # Changes first item
print(colors)`}
                            </pre>
                        </motion.div>
                    )}

                    <div className={styles.editor}>
                        <div className={styles.codeHeader}><span>swap.py</span><span>Python</span></div>
                        <textarea
                            value={challenge3.code}
                            onChange={(e) => setChallenge3({ ...challenge3, code: e.target.value })}
                            placeholder={'colors = ["red", "blue", "green"]\ncolors[0] = "purple"\nprint(colors)'}
                            spellCheck={false}
                            style={{ minHeight: '120px' }}
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
                        <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>List Cheat Sheet:</p>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                            <li><code>my_list[0]</code> - First item (index 0)</li>
                            <li><code>my_list.append("x")</code> - Add to end</li>
                            <li><code>my_list.remove("x")</code> - Remove item</li>
                            <li><code>my_list[0] = "y"</code> - Change first item</li>
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
                            <h3 style={{ margin: 0, color: '#fbbf24', fontWeight: 800 }}>SUPERCHARGE - Inventory Manager</h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Optional +25 XP - Not required to advance</p>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        <p style={{ margin: 0, fontWeight: 600, marginBottom: '0.5rem' }}>Build a Game Inventory!</p>
                        <p style={{ margin: 0, marginBottom: '0.75rem' }}>
                            Use ALL your list skills to manage a game inventory:
                        </p>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <li>Create an <code>inventory</code> list with at least 1 starting item</li>
                            <li>Use <code>.append()</code> <strong>twice</strong> to add 2 new items</li>
                            <li>Use <code>.remove()</code> to remove one item</li>
                            <li>Change the <strong>first</strong> item using <code>[0] =</code></li>
                            <li>Print your final inventory</li>
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
{`inventory = ["sword"]
inventory.append("shield")
inventory.append("potion")
inventory.remove("sword")
inventory[0] = "magic staff"
print(inventory)`}
                            </pre>
                        </motion.div>
                    )}

                    <div className={styles.editor}>
                        <div className={styles.codeHeader}>
                            <span>inventory.py</span>
                            <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                {String.fromCodePoint(0x26A1)} BONUS
                            </span>
                        </div>
                        <textarea
                            value={superchargeCode}
                            onChange={(e) => setSuperchargeCode(e.target.value)}
                            placeholder={'inventory = ["sword"]\n\n# Add 2 items with .append()\ninventory.append("shield")\ninventory.append("potion")\n\n# Remove one item\ninventory.remove("sword")\n\n# Change the first item\ninventory[0] = "magic staff"\n\nprint(inventory)'}
                            spellCheck={false}
                            style={{ minHeight: '200px' }}
                            disabled={superchargeDone}
                        />
                    </div>

                    <button
                        className={styles.runBtn}
                        onClick={runSupercharge}
                        style={{ background: superchargeDone ? '#10b981' : '#f59e0b' }}
                        disabled={superchargeDone}
                    >
                        <Play size={18} /> {superchargeDone ? 'Challenge Complete!' : 'Test Inventory Manager'}
                    </button>

                    {superchargeOutput && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.outputBox}
                            style={{ borderColor: superchargeDone ? 'rgba(16, 185, 129, 0.5)' : 'rgba(251, 191, 36, 0.5)' }}
                        >
                            <div className={styles.outputLabel}>
                                {superchargeDone ? `${String.fromCodePoint(0x26A1)} SUPERCHARGED!` : 'Output:'}
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
                            <Check size={20} /> +25 XP Claimed! Inventory Master! {String.fromCodePoint(0x26A1)}
                        </motion.div>
                    )}
                </motion.div>

                {/* Navigation */}
                <div className={styles.navBar}>
                    <Link href="/level3/lesson3" className={`${styles.navBtn} ${styles.secondary}`}>
                        <ChevronLeft size={18} /> Previous
                    </Link>
                    {allChallengesComplete ? (
                        <Link href="/level3/lesson5" className={`${styles.navBtn} ${styles.primary}`}>
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
