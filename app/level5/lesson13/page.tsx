'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Bot, Sparkles, Trophy, Gamepad2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL5_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL5_LESSONS[12]; // Lesson 13 (0-indexed)
const LESSON_ID = 75;

export default function Lesson13() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [currentStep, setCurrentStep] = useState(0);
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [stepComplete, setStepComplete] = useState([false, false, false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);

    const steps = [
        {
            title: "Step 1: Player Stats (Dictionary)",
            description: "Create a dictionary for player stats with name, health, and level",
            explanation: "Use a DICTIONARY because we need labeled data (name, health, level)",
            starterCode: '# Step 1: Player Stats\n# Use a dictionary for labeled data\nplayer_stats = {\n    "name": "HeroPlayer",\n    "health": 100,\n    "level": 5\n}\n\nprint("Player:", player_stats["name"])\nprint("Health:", player_stats["health"])\nprint("Level:", player_stats["level"])\n',
            checkCode: (code: string, output: string) => {
                return code.includes('player_stats') && code.includes('{') && code.includes(':') &&
                    output.includes('Player:') && output.includes('Health:') && output.includes('Level:');
            }
        },
        {
            title: "Step 2: Inventory (Dictionary with Lists)",
            description: "Create an inventory with categories of items",
            explanation: "Use a DICTIONARY with LISTS inside - categories as keys, items as lists!",
            starterCode: '# Step 2: Inventory System\n# Dictionary with lists inside!\ninventory = {\n    "weapons": ["sword", "bow"],\n    "potions": ["health_potion", "mana_potion"],\n    "keys": ["gold_key"]\n}\n\nprint("Weapons:", inventory["weapons"])\nprint("First weapon:", inventory["weapons"][0])\nprint("Number of potions:", len(inventory["potions"]))\n',
            checkCode: (code: string, output: string) => {
                return code.includes('inventory') && code.includes('[') && code.includes(':') &&
                    output.includes('Weapons:') && output.includes('First weapon:');
            }
        },
        {
            title: "Step 3: Achievements (Set)",
            description: "Track unique achievements - no duplicates allowed!",
            explanation: "Use a SET because each achievement should only appear once!",
            starterCode: '# Step 3: Achievements\n# Use a set - no duplicate badges!\nachievements = {"first_kill", "treasure_hunter", "first_kill"}\n\n# Notice: "first_kill" only appears once!\nprint("Achievements:", achievements)\nprint("Number of badges:", len(achievements))\n\n# Add a new achievement\nachievements.add("dragon_slayer")\nprint("New achievements:", achievements)\n\n# Check if we have a badge\nprint("Has treasure_hunter?", "treasure_hunter" in achievements)\n',
            checkCode: (code: string, output: string) => {
                return code.includes('achievements') && code.includes('{') && !code.includes(':') &&
                    (code.includes('.add(') || code.includes(' in ')) && output.includes('Achievements:');
            }
        },
        {
            title: "Step 4: High Scores (Tuple)",
            description: "Store the top 3 high scores that should never change",
            explanation: "Use a TUPLE because high scores for a game version are permanent records!",
            starterCode: '# Step 4: High Scores\n# Use a tuple - these records are permanent!\nhigh_scores = (9999, 8500, 7200)\n\nprint("High Scores:")\nprint("1st Place:", high_scores[0])\nprint("2nd Place:", high_scores[1])\nprint("3rd Place:", high_scores[2])\n\n# Can\'t change high scores - they\'re locked!\n# high_scores[0] = 10000  # This would ERROR!\n',
            checkCode: (code: string, output: string) => {
                return code.includes('high_scores') && code.includes('(') && code.includes(')') &&
                    !code.includes('{') && output.includes('High Scores:') && output.includes('1st Place:');
            }
        }
    ];

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
        setCode(steps[0].starterCode);
    }, [user, isLoading, router]);

    useEffect(() => {
        setCode(steps[currentStep].starterCode);
        setOutput('');
    }, [currentStep]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];

            // Simple parser for demonstration
            let variables: Record<string, { type: string; value: unknown }> = {};

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || trimmed === '') continue;

                // Dict with nested lists - single line
                const dictMatch = trimmed.match(/^(\w+)\s*=\s*\{(.+)\}$/);
                if (dictMatch && trimmed.includes(':')) {
                    const varName = dictMatch[1];
                    const content = dictMatch[2];

                    // Parse key-value pairs
                    const dict: Record<string, unknown> = {};

                    // Simple parsing for demo purposes
                    const nameMatch = content.match(/"name"\s*:\s*"([^"]+)"/);
                    const healthMatch = content.match(/"health"\s*:\s*(\d+)/);
                    const levelMatch = content.match(/"level"\s*:\s*(\d+)/);

                    if (nameMatch) dict['name'] = nameMatch[1];
                    if (healthMatch) dict['health'] = parseInt(healthMatch[1]);
                    if (levelMatch) dict['level'] = parseInt(levelMatch[1]);

                    // Lists
                    const weaponsMatch = content.match(/"weapons"\s*:\s*\[([^\]]+)\]/);
                    const potionsMatch = content.match(/"potions"\s*:\s*\[([^\]]+)\]/);
                    const keysMatch = content.match(/"keys"\s*:\s*\[([^\]]+)\]/);

                    if (weaponsMatch) dict['weapons'] = weaponsMatch[1].split(',').map(s => s.trim().replace(/['"]/g, ''));
                    if (potionsMatch) dict['potions'] = potionsMatch[1].split(',').map(s => s.trim().replace(/['"]/g, ''));
                    if (keysMatch) dict['keys'] = keysMatch[1].split(',').map(s => s.trim().replace(/['"]/g, ''));

                    variables[varName] = { type: 'dict', value: dict };
                    continue;
                }

                // Multiline dict
                const dictStartMatch = trimmed.match(/^(\w+)\s*=\s*\{$/);
                if (dictStartMatch) {
                    let fullDict = '';
                    const varName = dictStartMatch[1];
                    const startIdx = lines.indexOf(line);
                    let braceCount = 1;

                    for (let i = startIdx + 1; i < lines.length && braceCount > 0; i++) {
                        const l = lines[i];
                        fullDict += l;
                        braceCount += (l.match(/\{/g) || []).length;
                        braceCount -= (l.match(/\}/g) || []).length;
                    }

                    const dict: Record<string, unknown> = {};
                    const nameMatch = fullDict.match(/"name"\s*:\s*"([^"]+)"/);
                    const healthMatch = fullDict.match(/"health"\s*:\s*(\d+)/);
                    const levelMatch = fullDict.match(/"level"\s*:\s*(\d+)/);
                    const weaponsMatch = fullDict.match(/"weapons"\s*:\s*\[([^\]]+)\]/);
                    const potionsMatch = fullDict.match(/"potions"\s*:\s*\[([^\]]+)\]/);
                    const keysMatch = fullDict.match(/"keys"\s*:\s*\[([^\]]+)\]/);

                    if (nameMatch) dict['name'] = nameMatch[1];
                    if (healthMatch) dict['health'] = parseInt(healthMatch[1]);
                    if (levelMatch) dict['level'] = parseInt(levelMatch[1]);
                    if (weaponsMatch) dict['weapons'] = weaponsMatch[1].split(',').map(s => s.trim().replace(/['"]/g, ''));
                    if (potionsMatch) dict['potions'] = potionsMatch[1].split(',').map(s => s.trim().replace(/['"]/g, ''));
                    if (keysMatch) dict['keys'] = keysMatch[1].split(',').map(s => s.trim().replace(/['"]/g, ''));

                    variables[varName] = { type: 'dict', value: dict };
                    continue;
                }

                // Set assignment
                const setMatch = trimmed.match(/^(\w+)\s*=\s*\{([^}]*)\}$/);
                if (setMatch && !trimmed.includes(':')) {
                    const varName = setMatch[1];
                    const items = setMatch[2].split(',').map(i => i.trim().replace(/['"]/g, '')).filter(i => i);
                    variables[varName] = { type: 'set', value: new Set(items) };
                    continue;
                }

                // Tuple assignment
                const tupleMatch = trimmed.match(/^(\w+)\s*=\s*\((.+)\)$/);
                if (tupleMatch) {
                    const varName = tupleMatch[1];
                    const items = tupleMatch[2].split(',').map(i => {
                        const t = i.trim();
                        return isNaN(Number(t)) ? t.replace(/['"]/g, '') : Number(t);
                    });
                    variables[varName] = { type: 'tuple', value: items };
                    continue;
                }

                // Set add
                const addMatch = trimmed.match(/^(\w+)\.add\s*\(\s*["'](.+)["']\s*\)$/);
                if (addMatch && variables[addMatch[1]]?.type === 'set') {
                    (variables[addMatch[1]].value as Set<string>).add(addMatch[2]);
                    continue;
                }

                // Print with label and nested access
                const printLabelNestedMatch = trimmed.match(/^print\s*\(\s*["'](.+)["']\s*,\s*(\w+)\[["'](\w+)["']\]\[(\d+)\]\s*\)$/);
                if (printLabelNestedMatch) {
                    const label = printLabelNestedMatch[1];
                    const varName = printLabelNestedMatch[2];
                    const key = printLabelNestedMatch[3];
                    const idx = parseInt(printLabelNestedMatch[4]);
                    if (variables[varName]) {
                        const dict = variables[varName].value as Record<string, unknown>;
                        if (dict[key] && Array.isArray(dict[key])) {
                            outputLines.push(`${label} ${(dict[key] as string[])[idx]}`);
                        }
                    }
                    continue;
                }

                // Print with label and dict access
                const printLabelDictMatch = trimmed.match(/^print\s*\(\s*["'](.+)["']\s*,\s*(\w+)\[["'](\w+)["']\]\s*\)$/);
                if (printLabelDictMatch) {
                    const label = printLabelDictMatch[1];
                    const varName = printLabelDictMatch[2];
                    const key = printLabelDictMatch[3];
                    if (variables[varName]) {
                        const dict = variables[varName].value as Record<string, unknown>;
                        if (dict[key] !== undefined) {
                            if (Array.isArray(dict[key])) {
                                outputLines.push(`${label} ['${(dict[key] as string[]).join("', '")}']`);
                            } else {
                                outputLines.push(`${label} ${dict[key]}`);
                            }
                        }
                    }
                    continue;
                }

                // Print with label and tuple access
                const printLabelTupleMatch = trimmed.match(/^print\s*\(\s*["'](.+)["']\s*,\s*(\w+)\[(\d+)\]\s*\)$/);
                if (printLabelTupleMatch) {
                    const label = printLabelTupleMatch[1];
                    const varName = printLabelTupleMatch[2];
                    const idx = parseInt(printLabelTupleMatch[3]);
                    if (variables[varName]) {
                        const arr = variables[varName].value as unknown[];
                        if (idx < arr.length) {
                            outputLines.push(`${label} ${arr[idx]}`);
                        }
                    }
                    continue;
                }

                // Print len with label
                const printLenMatch = trimmed.match(/^print\s*\(\s*["'](.+)["']\s*,\s*len\s*\(\s*(\w+)(?:\[["'](\w+)["']\])?\s*\)\s*\)$/);
                if (printLenMatch) {
                    const label = printLenMatch[1];
                    const varName = printLenMatch[2];
                    const key = printLenMatch[3];
                    if (variables[varName]) {
                        if (key) {
                            const dict = variables[varName].value as Record<string, unknown>;
                            if (dict[key] && Array.isArray(dict[key])) {
                                outputLines.push(`${label} ${(dict[key] as unknown[]).length}`);
                            }
                        } else {
                            if (variables[varName].type === 'set') {
                                outputLines.push(`${label} ${(variables[varName].value as Set<unknown>).size}`);
                            } else if (Array.isArray(variables[varName].value)) {
                                outputLines.push(`${label} ${(variables[varName].value as unknown[]).length}`);
                            }
                        }
                    }
                    continue;
                }

                // Print with label and set
                const printLabelSetMatch = trimmed.match(/^print\s*\(\s*["'](.+)["']\s*,\s*(\w+)\s*\)$/);
                if (printLabelSetMatch) {
                    const label = printLabelSetMatch[1];
                    const varName = printLabelSetMatch[2];
                    if (variables[varName]) {
                        if (variables[varName].type === 'set') {
                            const setVal = Array.from(variables[varName].value as Set<string>);
                            outputLines.push(`${label} {'${setVal.join("', '")}'}`);
                        }
                    }
                    continue;
                }

                // Print in check with label
                const printInMatch = trimmed.match(/^print\s*\(\s*["'](.+)["']\s*,\s*["'](.+)["']\s+in\s+(\w+)\s*\)$/);
                if (printInMatch) {
                    const label = printInMatch[1];
                    const item = printInMatch[2];
                    const varName = printInMatch[3];
                    if (variables[varName]?.type === 'set') {
                        outputLines.push(`${label} ${(variables[varName].value as Set<string>).has(item)}`);
                    }
                    continue;
                }

                // Regular print with variable
                const printVarMatch = trimmed.match(/^print\s*\(\s*["'](.+)["']\s*,\s*(\w+)\s*\)$/);
                if (printVarMatch && variables[printVarMatch[2]]) {
                    const v = variables[printVarMatch[2]];
                    if (v.type === 'set') {
                        const arr = Array.from(v.value as Set<string>);
                        outputLines.push(`${printVarMatch[1]} {'${arr.join("', '")}'}`);
                    }
                    continue;
                }

                // Simple print
                const printMatch = trimmed.match(/^print\s*\(\s*["'](.*)["']\s*\)$/);
                if (printMatch) {
                    outputLines.push(printMatch[1]);
                }
            }

            const result = outputLines.length > 0 ? outputLines.join('\n') : 'Run your code!';
            setOutput(result);

            // Check step completion
            if (steps[currentStep].checkCode(code, result)) {
                const newComplete = [...stepComplete];
                newComplete[currentStep] = true;
                setStepComplete(newComplete);
            }
        } catch {
            setOutput('Error! Check syntax.');
        }
    };

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        } else {
            // Complete the project!
            addXpAndCoins(LESSON.xpReward, 15);
            completeLevel(LESSON_ID, LESSON.xpReward, 15, 1, 120);
            setLessonComplete(true);
        }
    };

    if (isLoading || !user) {
        return <div className={styles.container} style={{ background: 'var(--bg-primary)' }}><div className="flex items-center justify-center h-screen"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🏆</motion.div></div></div>;
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'rgba(0, 0, 0, 0.95)' }}>
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', duration: 0.8 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                    <Trophy size={50} />
                </motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle} style={{ color: '#fbbf24' }}>
                    LEVEL 5 COMPLETE! 🏆
                </motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>
                    {LESSON.successMessage}
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '1.5rem', maxWidth: '400px', textAlign: 'left' }}>
                    <h4 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>Your Complete Inventory System Uses:</h4>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>🗄️</span> <span><strong>Dictionary</strong> for player stats</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>📦</span> <span><strong>Dict + Lists</strong> for inventory</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>🎯</span> <span><strong>Set</strong> for achievements</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>🔒</span> <span><strong>Tuple</strong> for high scores</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }} className={styles.successXp}>
                    <Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} style={{ display: 'flex', gap: '1rem' }}>
                    <Link href="/level5/complete" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                        Complete Level 5! <ChevronRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            <header className={styles.header} style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--accent-primary)' }}>
                <Link href="/level5" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Project: Step {currentStep + 1} of 4</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                <div className={styles.lessonTitle}>
                    <motion.div className={styles.lessonEmoji} animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                        <Gamepad2 size={40} />
                    </motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1 style={{ color: '#fbbf24' }}>Video Game Inventory - Part 2</h1>
                        <p>Complete your inventory system!</p>
                    </div>
                </div>

                {/* Progress */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: stepComplete[i] ? '#50fa7b' : i === currentStep ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                            border: i === currentStep ? '2px solid var(--accent-secondary)' : 'none',
                            color: stepComplete[i] ? '#1a1a2e' : 'white',
                            fontWeight: 700
                        }}>
                            {stepComplete[i] ? <Check size={20} /> : i + 1}
                        </div>
                    ))}
                </div>

                {/* Step Card */}
                <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.15))', borderColor: stepComplete[currentStep] ? '#50fa7b' : '#fbbf24' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Bot size={28} style={{ color: '#fbbf24' }} />
                        <Sparkles size={24} style={{ color: '#f59e0b' }} />
                        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fbbf24' }}>{steps[currentStep].title}</span>
                        {stepComplete[currentStep] && <Check size={24} style={{ color: '#50fa7b', marginLeft: 'auto' }} />}
                    </div>
                    <p style={{ marginBottom: '0.75rem' }}>{steps[currentStep].description}</p>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                        <Lightbulb size={16} style={{ display: 'inline', marginRight: '0.5rem', color: '#fbbf24' }} />
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{steps[currentStep].explanation}</span>
                    </div>
                </motion.div>

                {/* Code Editor */}
                <div className={styles.codeSection}>
                    <div className={styles.editor} style={{ borderColor: stepComplete[currentStep] ? '#50fa7b' : '#fbbf24' }}>
                        <div className={styles.codeHeader}><span>inventory.py</span><span>Python</span></div>
                        <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '250px' }} />
                    </div>
                    <button className={styles.runBtn} onClick={runCode} style={{ background: '#fbbf24', color: '#1a1a2e' }}><Play size={18} /> Run Code</button>
                    {output && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.outputBox}>
                            <div className={styles.outputLabel}>Output:</div>
                            <div className={styles.outputText}>{output}</div>
                        </motion.div>
                    )}
                </div>

                {/* Navigation */}
                <div className={styles.navBar}>
                    {currentStep > 0 ? (
                        <button className={`${styles.navBtn} ${styles.secondary}`} onClick={() => setCurrentStep(currentStep - 1)}>
                            <ChevronLeft size={18} /> Previous Step
                        </button>
                    ) : (
                        <Link href="/level5/lesson12" className={`${styles.navBtn} ${styles.secondary}`}>
                            <ChevronLeft size={18} /> Previous Lesson
                        </Link>
                    )}
                    {stepComplete[currentStep] ? (
                        <button className={`${styles.navBtn} ${styles.primary}`} onClick={handleNext} style={{ background: '#50fa7b', color: '#1a1a2e' }}>
                            {currentStep < 3 ? 'Next Step' : 'Complete Project!'} <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button className={`${styles.navBtn} ${styles.secondary}`} disabled style={{ opacity: 0.5 }}>
                            Run code to continue
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
