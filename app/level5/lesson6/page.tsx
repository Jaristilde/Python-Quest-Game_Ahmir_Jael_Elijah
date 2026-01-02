'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Bot, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL5_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL5_LESSONS[5]; // Lesson 6
const LESSON_ID = 68;

export default function Lesson6() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# Practice: Tuples and Dictionaries
# Challenge 1: Create a tuple for a game coordinate
position = (10, 25)

# Challenge 2: Create a player dictionary
player = {
    "name": "Hero",
    "level": 5,
    "health": 100
}

# Challenge 3: Add a new stat
player["gold"] = 50

# Challenge 4: Update health
player["health"] = 85

# Challenge 5: Print player info
print("Position:", position)
print("Player name:", player["name"])
print("Gold:", player["gold"])
`);
    const [output, setOutput] = useState('');
    const [currentChallenge, setCurrentChallenge] = useState(0);
    const [challengesComplete, setChallengesComplete] = useState<boolean[]>([false, false, false, false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [supercharged, setSupercharged] = useState(false);

    const challenges = [
        { id: 1, title: "Create a tuple", description: "Make a tuple with coordinates (x, y)", check: (code: string) => /\w+\s*=\s*\(\s*\d+\s*,\s*\d+\s*\)/.test(code) },
        { id: 2, title: "Create a dictionary", description: "Make a player dictionary with name, level, and health", check: (code: string) => /\w+\s*=\s*\{[^}]*"name"[^}]*"level"[^}]*"health"[^}]*\}/.test(code) || /\w+\s*=\s*\{[^}]*\}/.test(code) },
        { id: 3, title: "Add a new key", description: "Add \"gold\" to the player dictionary", check: (code: string) => /\w+\["gold"\]\s*=/.test(code) },
        { id: 4, title: "Update a value", description: "Change the health value", check: (code: string) => /\w+\["health"\]\s*=\s*\d+/.test(code) && code.includes('player["health"] = 85') },
        { id: 5, title: "Print values", description: "Print player info using dictionary access", check: (code: string) => /print.*\w+\[".*"\]/.test(code) },
    ];

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            const dicts: Record<string, Record<string, string | number>> = {};
            const tuples: Record<string, (string | number)[]> = {};
            let currentDict = '';
            let inDict = false;

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || trimmed === '') continue;

                // Tuple assignment
                const tupleMatch = trimmed.match(/^(\w+)\s*=\s*\((.+)\)$/);
                if (tupleMatch) {
                    const varName = tupleMatch[1];
                    const items = tupleMatch[2].split(',').map(i => {
                        const t = i.trim();
                        return isNaN(Number(t)) ? t.replace(/['"]/g, '') : Number(t);
                    });
                    tuples[varName] = items;
                    continue;
                }

                // Dictionary creation start
                const dictStartMatch = trimmed.match(/^(\w+)\s*=\s*\{$/);
                if (dictStartMatch) {
                    currentDict = dictStartMatch[1];
                    dicts[currentDict] = {};
                    inDict = true;
                    continue;
                }

                // Key-value pair inside dict
                if (inDict) {
                    const kvMatch = trimmed.match(/^["'](\w+)["']\s*:\s*(?:["']([^"']+)["']|(\d+)),?$/);
                    if (kvMatch) {
                        const key = kvMatch[1];
                        const value = kvMatch[2] || Number(kvMatch[3]);
                        dicts[currentDict][key] = value;
                        continue;
                    }
                    if (trimmed === '}') {
                        inDict = false;
                        continue;
                    }
                }

                // Add or update key
                const updateMatch = trimmed.match(/^(\w+)\[["'](\w+)["']\]\s*=\s*(?:["']([^"']+)["']|(\d+))$/);
                if (updateMatch) {
                    const dictName = updateMatch[1];
                    const key = updateMatch[2];
                    const value = updateMatch[3] || Number(updateMatch[4]);
                    if (dicts[dictName]) {
                        dicts[dictName][key] = value;
                    }
                    continue;
                }

                // Print with label and tuple
                const printTupleMatch = trimmed.match(/^print\s*\(["'](.+)["'],\s*(\w+)\)$/);
                if (printTupleMatch) {
                    const label = printTupleMatch[1];
                    const varName = printTupleMatch[2];
                    if (tuples[varName]) {
                        outputLines.push(`${label} (${tuples[varName].join(', ')})`);
                    } else if (dicts[varName]) {
                        outputLines.push(`${label} ${JSON.stringify(dicts[varName])}`);
                    }
                    continue;
                }

                // Print with label and dict access
                const printDictMatch = trimmed.match(/^print\s*\(["'](.+)["'],\s*(\w+)\[["'](\w+)["']\]\)$/);
                if (printDictMatch) {
                    const label = printDictMatch[1];
                    const dictName = printDictMatch[2];
                    const key = printDictMatch[3];
                    if (dicts[dictName] && dicts[dictName][key] !== undefined) {
                        outputLines.push(`${label} ${dicts[dictName][key]}`);
                    }
                    continue;
                }

                // Print string only
                const printStrMatch = trimmed.match(/^print\s*\(["'](.+)["']\)$/);
                if (printStrMatch) {
                    outputLines.push(printStrMatch[1]);
                }
            }

            // Check challenges
            const newComplete = [...challengesComplete];
            challenges.forEach((challenge, idx) => {
                if (challenge.check(code)) {
                    newComplete[idx] = true;
                }
            });
            setChallengesComplete(newComplete);

            // Check if all complete
            if (newComplete.every(c => c) && !lessonComplete) {
                setSupercharged(true);
                setTimeout(() => {
                    addXpAndCoins(LESSON.xpReward, 10);
                    completeLevel(LESSON_ID, LESSON.xpReward, 10, 1, 90);
                    setLessonComplete(true);
                }, 1500);
            }

            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code to see output!');
        } catch {
            setOutput('Error! Check your code syntax.');
        }
    };

    if (isLoading || !user) {
        return <div className={styles.container} style={{ background: 'var(--bg-primary)' }}><div className="flex items-center justify-center h-screen"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>💪</motion.div></div></div>;
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'rgba(0, 0, 0, 0.95)' }}>
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', duration: 0.8 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
                    <Trophy size={50} className="text-white" />
                </motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle} style={{ color: '#f59e0b' }}>
                    SUPERCHARGED! 💪
                </motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>
                    {LESSON.successMessage}
                </motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className={styles.successXp} style={{ background: 'rgba(245, 158, 11, 0.2)', borderColor: 'rgba(245, 158, 11, 0.4)' }}>
                    <Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP (BONUS!)
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                    <Link href="/level5/lesson7" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
                        Next Lesson <ChevronRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            <header className={styles.header} style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--accent-primary)' }}>
                <Link href="/level5" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 13</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                <div className={styles.lessonTitle}>
                    <motion.div className={styles.lessonEmoji} animate={{ y: [0, -5, 0], scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>{LESSON.emoji}</motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1 style={{ color: '#f59e0b' }}>{LESSON.title}</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Practice: <code style={{ color: '#ef4444' }}>{LESSON.concept}</code></p>
                    </div>
                </div>

                {/* Supercharge Banner */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.2))', border: '2px solid rgba(245, 158, 11, 0.4)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Sparkles size={24} style={{ color: '#f59e0b' }} />
                        <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#f59e0b' }}>SUPERCHARGE CHALLENGE!</span>
                        <Sparkles size={24} style={{ color: '#f59e0b' }} />
                    </div>
                    <p style={{ color: 'var(--text-muted)' }}>Complete all 5 challenges for BONUS XP!</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                        {challengesComplete.map((done, idx) => (
                            <motion.div key={idx} animate={done ? { scale: [1, 1.2, 1] } : {}} style={{ width: '40px', height: '40px', borderRadius: '50%', background: done ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                                {done ? <Check size={20} /> : idx + 1}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Challenges List */}
                <div className={styles.challenges} style={{ background: 'var(--bg-secondary)', borderColor: '#f59e0b' }}>
                    <h3 style={{ color: '#f59e0b', marginBottom: '1rem' }}>Complete These Challenges:</h3>
                    <ul className={styles.challengeList}>
                        {challenges.map((challenge, idx) => (
                            <li key={idx}>
                                <div className={`${styles.challengeCheck} ${challengesComplete[idx] ? styles.done : ''}`} style={challengesComplete[idx] ? { background: '#f59e0b', borderColor: '#f59e0b' } : {}}>
                                    {challengesComplete[idx] && <Check size={14} />}
                                </div>
                                <div>
                                    <span style={{ fontWeight: 600, color: challengesComplete[idx] ? '#f59e0b' : 'inherit' }}>{challenge.title}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>- {challenge.description}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Code Editor */}
                <div className={styles.codeSection}>
                    <h3 style={{ color: '#f59e0b' }}>Your Code:</h3>
                    <div className={styles.editor} style={{ borderColor: '#f59e0b' }}>
                        <div className={styles.codeHeader}><span>practice.py</span><span>Python</span></div>
                        <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '350px' }} />
                    </div>
                    <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
                        <Play size={18} /> Run & Check
                    </button>
                    {output && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.outputBox}>
                            <div className={styles.outputLabel}>Output:</div>
                            <div className={styles.outputText}>{output}</div>
                        </motion.div>
                    )}
                </div>

                {/* Supercharged Animation */}
                {supercharged && (
                    <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                        <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: 2 }} style={{ fontSize: '6rem' }}>
                            ⚡
                        </motion.div>
                        <motion.h2 animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5, repeat: 2 }} style={{ color: '#f59e0b', fontSize: '2.5rem', fontWeight: 800 }}>
                            SUPERCHARGED!
                        </motion.h2>
                    </motion.div>
                )}

                <div className={styles.tipBox} style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: '#f59e0b' }}>
                    <Lightbulb size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
                    <div>
                        <p style={{ fontWeight: 600, color: '#f59e0b' }}>Remember:</p>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                            <li>Tuples use <code>( )</code> and can't change</li>
                            <li>Dictionaries use <code>{"{ }"}</code> and CAN change</li>
                            <li>Add/update with <code>dict["key"] = value</code></li>
                        </ul>
                    </div>
                </div>

                <div className={styles.navBar}>
                    <Link href="/level5/lesson5" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Complete all challenges to continue!</span>
                </div>
            </div>
        </div>
    );
}
