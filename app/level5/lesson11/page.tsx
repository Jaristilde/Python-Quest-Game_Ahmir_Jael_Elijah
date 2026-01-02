'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Bot, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL5_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL5_LESSONS[10]; // Lesson 11 (0-indexed)
const LESSON_ID = 73;

export default function Lesson11() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [currentChallenge, setCurrentChallenge] = useState(0);
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [challengeComplete, setChallengeComplete] = useState([false, false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [showSupercharge, setShowSupercharge] = useState(false);

    const challenges = [
        {
            title: "Challenge 1: Create a Set",
            description: "Create a set called 'colors' with 'red', 'blue', and 'red' (duplicate). Print it to see duplicates removed!",
            hint: "Use curly braces { } without colons",
            starterCode: '# Create a set with duplicates\ncolors = {"red", "blue", "red"}\nprint(colors)\n',
            checkCode: (code: string, output: string) => {
                return code.includes('{') && code.includes('}') && !code.includes(':') &&
                    code.includes('colors') && output.includes('red') && output.includes('blue');
            }
        },
        {
            title: "Challenge 2: Set Operations",
            description: "Start with a set of fruits. Add 'mango' using add(), then check if 'apple' is in the set.",
            hint: "Use .add() and 'item' in set",
            starterCode: '# Start with some fruits\nfruits = {"apple", "banana"}\n\n# Add mango\nfruits.add("mango")\n\n# Check if apple exists\nprint("apple" in fruits)\n',
            checkCode: (code: string, output: string) => {
                return code.includes('.add(') && code.includes(' in ') && output.includes('True');
            }
        },
        {
            title: "Challenge 3: Nested Structure",
            description: "Create a game character with name, level, and a list of items. Access the first item!",
            hint: "Put a list inside a dictionary, access with dict['key'][index]",
            starterCode: '# Create a game character\nplayer = {\n    "name": "Hero",\n    "level": 5,\n    "items": ["sword", "shield", "potion"]\n}\n\n# Print the first item\nprint(player["items"][0])\n',
            checkCode: (code: string, output: string) => {
                return code.includes('[') && code.includes(']') && code.includes(':') &&
                    code.includes('items') && (output.includes('sword') || output.length > 0);
            }
        }
    ];

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
        setCode(challenges[0].starterCode);
    }, [user, isLoading, router]);

    useEffect(() => {
        setCode(challenges[currentChallenge].starterCode);
        setOutput('');
    }, [currentChallenge]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            let variables: Record<string, { type: string; value: unknown }> = {};

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || trimmed === '') continue;

                // Set assignment
                const setMatch = trimmed.match(/^(\w+)\s*=\s*\{([^}]*)\}$/);
                if (setMatch && !trimmed.includes(':')) {
                    const varName = setMatch[1];
                    const items = setMatch[2].split(',').map(i => {
                        const t = i.trim();
                        if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
                            return t.slice(1, -1);
                        }
                        return t;
                    }).filter(i => i !== '');
                    variables[varName] = { type: 'set', value: new Set(items) };
                    continue;
                }

                // Nested dict with list - multiline start
                const dictStartMatch = trimmed.match(/^(\w+)\s*=\s*\{$/);
                if (dictStartMatch) {
                    // Collect until closing brace - simplified
                    let fullDict = trimmed;
                    let foundClose = false;
                    const startIdx = lines.indexOf(line);
                    for (let i = startIdx + 1; i < lines.length; i++) {
                        fullDict += lines[i];
                        if (lines[i].includes('}')) {
                            foundClose = true;
                            break;
                        }
                    }
                    if (foundClose) {
                        const nameMatch = fullDict.match(/"name"\s*:\s*"([^"]+)"/);
                        const levelMatch = fullDict.match(/"level"\s*:\s*(\d+)/);
                        const itemsMatch = fullDict.match(/"items"\s*:\s*\[([^\]]+)\]/);

                        const dict: Record<string, unknown> = {};
                        if (nameMatch) dict['name'] = nameMatch[1];
                        if (levelMatch) dict['level'] = parseInt(levelMatch[1]);
                        if (itemsMatch) {
                            dict['items'] = itemsMatch[1].split(',').map(s => s.trim().replace(/['"]/g, ''));
                        }
                        variables[dictStartMatch[1]] = { type: 'nested_dict', value: dict };
                    }
                    continue;
                }

                // add()
                const addMatch = trimmed.match(/^(\w+)\.add\s*\(\s*["'](.+)["']\s*\)$/);
                if (addMatch && variables[addMatch[1]]?.type === 'set') {
                    (variables[addMatch[1]].value as Set<string>).add(addMatch[2]);
                    continue;
                }

                // Print "item" in set
                const inMatch = trimmed.match(/^print\s*\(\s*["'](.+)["']\s+in\s+(\w+)\s*\)$/);
                if (inMatch) {
                    const item = inMatch[1];
                    const varName = inMatch[2];
                    if (variables[varName]?.type === 'set') {
                        outputLines.push((variables[varName].value as Set<string>).has(item) ? 'True' : 'False');
                    }
                    continue;
                }

                // Print nested access
                const nestedMatch = trimmed.match(/^print\s*\(\s*(\w+)\[["'](\w+)["']\]\[(\d+)\]\s*\)$/);
                if (nestedMatch) {
                    const varName = nestedMatch[1];
                    const key = nestedMatch[2];
                    const idx = parseInt(nestedMatch[3]);
                    if (variables[varName]?.type === 'nested_dict') {
                        const dict = variables[varName].value as Record<string, unknown>;
                        if (dict[key] && Array.isArray(dict[key])) {
                            outputLines.push((dict[key] as string[])[idx]);
                        }
                    }
                    continue;
                }

                // Print set
                const printSetMatch = trimmed.match(/^print\s*\(\s*(\w+)\s*\)$/);
                if (printSetMatch && variables[printSetMatch[1]]?.type === 'set') {
                    const setVal = Array.from(variables[printSetMatch[1]].value as Set<string>);
                    outputLines.push(`{${setVal.map(v => `'${v}'`).join(', ')}}`);
                    continue;
                }

                // Regular print
                const printMatch = trimmed.match(/^print\s*\(["'](.*)["']\)$/);
                if (printMatch) outputLines.push(printMatch[1]);
            }

            const result = outputLines.length > 0 ? outputLines.join('\n') : 'Run your code!';
            setOutput(result);

            // Check if challenge complete
            if (challenges[currentChallenge].checkCode(code, result)) {
                const newComplete = [...challengeComplete];
                newComplete[currentChallenge] = true;
                setChallengeComplete(newComplete);
            }
        } catch {
            setOutput('Error! Check your syntax.');
        }
    };

    const handleNext = () => {
        if (currentChallenge < 2) {
            setCurrentChallenge(currentChallenge + 1);
        } else {
            // All challenges done - show supercharge
            setShowSupercharge(true);
        }
    };

    const completePractice = () => {
        addXpAndCoins(LESSON.xpReward, 10);
        completeLevel(LESSON_ID, LESSON.xpReward, 10, 1, 90);
        setLessonComplete(true);
    };

    if (isLoading || !user) {
        return <div className={styles.container} style={{ background: 'var(--bg-primary)' }}><div className="flex items-center justify-center h-screen"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🏋️</motion.div></div></div>;
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'rgba(0, 0, 0, 0.95)' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}><Trophy size={50} /></motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle} style={{ color: 'var(--accent-primary)' }}>Practice Champion! 🏋️</motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}><Link href="/level5/lesson12" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link></motion.div>
            </div>
        );
    }

    if (showSupercharge) {
        return (
            <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
                <div className={styles.content}>
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '2rem' }}>
                        <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>⚡</motion.div>
                        <h2 style={{ fontSize: '2rem', color: 'var(--accent-primary)', marginBottom: '1rem' }}>SUPERCHARGE MODE!</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>
                            You've mastered all the challenges! You're ready to combine everything you've learned!
                        </p>

                        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem', textAlign: 'left' }}>
                            <h3 style={{ color: 'var(--accent-secondary)', marginBottom: '1rem' }}>What You've Practiced:</h3>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Check size={20} style={{ color: '#50fa7b' }} />
                                    <span>Creating sets with {"{ }"} (no duplicates!)</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Check size={20} style={{ color: '#50fa7b' }} />
                                    <span>Using add() and "in" with sets</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Check size={20} style={{ color: '#50fa7b' }} />
                                    <span>Nested structures (dict with list)</span>
                                </div>
                            </div>
                        </div>

                        <button onClick={completePractice} className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', padding: '1rem 2rem', fontSize: '1.1rem' }}>
                            <Zap size={20} /> Claim {LESSON.xpReward} XP!
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            <header className={styles.header} style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--accent-primary)' }}>
                <Link href="/level5" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Practice: Challenge {currentChallenge + 1} of 3</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                <div className={styles.lessonTitle}>
                    <motion.div className={styles.lessonEmoji} animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>{LESSON.emoji}</motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1 style={{ color: 'var(--accent-primary)' }}>{LESSON.title}</h1>
                        <p>Practice sets and nested structures!</p>
                    </div>
                </div>

                {/* Progress Dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                    {[0, 1, 2].map(i => (
                        <div key={i} style={{
                            width: '12px', height: '12px', borderRadius: '50%',
                            background: challengeComplete[i] ? '#50fa7b' : i === currentChallenge ? 'var(--accent-primary)' : 'rgba(255,255,255,0.2)',
                            transition: 'all 0.3s'
                        }} />
                    ))}
                </div>

                {/* Challenge Card */}
                <motion.div key={currentChallenge} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))', borderColor: challengeComplete[currentChallenge] ? '#50fa7b' : 'var(--accent-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Bot size={28} style={{ color: 'var(--accent-primary)' }} />
                        <Sparkles size={24} style={{ color: 'var(--accent-secondary)' }} />
                        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>{challenges[currentChallenge].title}</span>
                        {challengeComplete[currentChallenge] && <Check size={24} style={{ color: '#50fa7b', marginLeft: 'auto' }} />}
                    </div>
                    <p style={{ marginBottom: '0.5rem' }}>{challenges[currentChallenge].description}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <Lightbulb size={16} style={{ display: 'inline', marginRight: '0.5rem', color: 'var(--accent-secondary)' }} />
                        Hint: {challenges[currentChallenge].hint}
                    </p>
                </motion.div>

                {/* Code Editor */}
                <div className={styles.codeSection}>
                    <div className={styles.editor} style={{ borderColor: challengeComplete[currentChallenge] ? '#50fa7b' : 'var(--accent-primary)' }}>
                        <div className={styles.codeHeader}><span>practice.py</span><span>Python</span></div>
                        <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '180px' }} />
                    </div>
                    <button className={styles.runBtn} onClick={runCode} style={{ background: 'var(--accent-primary)' }}><Play size={18} /> Run Code</button>
                    {output && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.outputBox}>
                            <div className={styles.outputLabel}>Output:</div>
                            <div className={styles.outputText}>{output}</div>
                        </motion.div>
                    )}
                </div>

                {/* Navigation */}
                <div className={styles.navBar}>
                    <Link href="/level5/lesson10" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                    {challengeComplete[currentChallenge] ? (
                        <button className={`${styles.navBtn} ${styles.primary}`} onClick={handleNext} style={{ background: '#50fa7b', color: '#1a1a2e' }}>
                            {currentChallenge < 2 ? 'Next Challenge' : 'Complete!'} <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button className={`${styles.navBtn} ${styles.secondary}`} disabled style={{ opacity: 0.5 }}>
                            Complete challenge to continue
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
