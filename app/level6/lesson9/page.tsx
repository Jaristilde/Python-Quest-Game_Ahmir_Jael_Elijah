'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Sparkles, Star, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL6_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL6_LESSONS[8]; // Lesson 9 (index 8)
const LESSON_ID = 84;

export default function Lesson9() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# FINAL PROJECT: Fortune Teller App!
# Combining everything from Level 6

import random
import math
import datetime
import json

print("========================================")
print("     MYSTICAL FORTUNE TELLER")
print("========================================")
print("")

# Get today's date
today = datetime.date.today()
print("Date:", today)
print("")

# Generate lucky numbers
lucky_num = random.randint(1, 99)
power_num = math.pow(lucky_num, 2)
print("Your Lucky Number:", lucky_num)
print("Power Number:", lucky_num, "squared =", power_num)
print("")

# Luck percentage
luck = random.uniform(50, 100)
luck_rounded = round(luck, 1)
print("Today's Luck Level:", luck_rounded, "%")
print("")

# Fortune messages
fortunes = ["Great success awaits!", "Love is in the air!", "Adventure calls you!", "Wealth comes your way!", "Wisdom guides your path!"]
fortune_index = random.randint(0, 4)
print("Your Fortune:", fortunes[fortune_index])
print("")

# Lucky colors
colors = ["Blue", "Gold", "Purple", "Green", "Red"]
color_index = random.randint(0, 4)
print("Lucky Color:", colors[color_index])

# Create fortune data as JSON
fortune_data = {
    "lucky_number": lucky_num,
    "luck_level": luck_rounded,
    "fortune": fortunes[fortune_index]
}
json_output = json.dumps(fortune_data, indent=2)
print("")
print("Fortune Data (JSON):")
print(json_output)

print("")
print("========================================")
print("    May luck be with you always!")
print("========================================")
`);
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasRandom, setHasRandom] = useState(false);
    const [hasMath, setHasMath] = useState(false);
    const [hasDatetime, setHasDatetime] = useState(false);
    const [hasJson, setHasJson] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            const variables: Record<string, number | string> = {};
            const lists: Record<string, string[]> = {};
            const dictVariables: Record<string, Record<string, unknown>> = {};

            // Check for imports
            if (code.includes('import random')) setHasRandom(true);
            if (code.includes('import math')) setHasMath(true);
            if (code.includes('import datetime')) setHasDatetime(true);
            if (code.includes('import json')) setHasJson(true);

            // Simulate functions
            const simulateRandom = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
            const simulateUniform = (min: number, max: number) => Math.random() * (max - min) + min;

            let inDict = false;
            let currentDictName = '';
            let dictContent = '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || trimmed === '' || trimmed.startsWith('import')) continue;

                // List definition
                const listMatch = trimmed.match(/^(\w+)\s*=\s*\[(.+)\]$/);
                if (listMatch) {
                    const varName = listMatch[1];
                    const items = listMatch[2].split(',').map(i => i.trim().replace(/['"]/g, ''));
                    lists[varName] = items;
                    continue;
                }

                // Start dictionary
                const dictStartMatch = trimmed.match(/^(\w+)\s*=\s*\{$/);
                if (dictStartMatch) {
                    currentDictName = dictStartMatch[1];
                    dictContent = '{';
                    inDict = true;
                    continue;
                }

                if (inDict) {
                    dictContent += trimmed;
                    if (trimmed.includes('}')) {
                        inDict = false;
                        try {
                            // Process dictionary content
                            const processedDict: Record<string, unknown> = {};
                            const pairs = dictContent.slice(1, -1).split(',');
                            for (const pair of pairs) {
                                const kv = pair.split(':');
                                if (kv.length === 2) {
                                    const key = kv[0].trim().replace(/['"]/g, '');
                                    let val = kv[1].trim();
                                    // Check if value is a variable
                                    if (variables[val] !== undefined) {
                                        processedDict[key] = variables[val];
                                    } else if (lists[val] !== undefined) {
                                        processedDict[key] = lists[val];
                                    } else if (val.includes('[')) {
                                        // Handle list access like fortunes[fortune_index]
                                        const accessMatch = val.match(/(\w+)\[(\w+)\]/);
                                        if (accessMatch && lists[accessMatch[1]] && variables[accessMatch[2]] !== undefined) {
                                            processedDict[key] = lists[accessMatch[1]][Number(variables[accessMatch[2]])];
                                        }
                                    } else {
                                        processedDict[key] = isNaN(Number(val)) ? val.replace(/['"]/g, '') : Number(val);
                                    }
                                }
                            }
                            dictVariables[currentDictName] = processedDict;
                        } catch {
                            // Silent fail
                        }
                        continue;
                    }
                    continue;
                }

                // datetime.date.today()
                const todayMatch = trimmed.match(/^(\w+)\s*=\s*datetime\.date\.today\s*\(\s*\)$/);
                if (todayMatch) {
                    const varName = todayMatch[1];
                    const today = new Date();
                    variables[varName] = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                    continue;
                }

                // random.randint
                const randintMatch = trimmed.match(/^(\w+)\s*=\s*random\.randint\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)$/);
                if (randintMatch) {
                    const varName = randintMatch[1];
                    const min = parseInt(randintMatch[2]);
                    const max = parseInt(randintMatch[3]);
                    variables[varName] = simulateRandom(min, max);
                    continue;
                }

                // random.uniform
                const uniformMatch = trimmed.match(/^(\w+)\s*=\s*random\.uniform\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*\)$/);
                if (uniformMatch) {
                    const varName = uniformMatch[1];
                    const min = parseFloat(uniformMatch[2]);
                    const max = parseFloat(uniformMatch[3]);
                    variables[varName] = simulateUniform(min, max);
                    continue;
                }

                // round
                const roundMatch = trimmed.match(/^(\w+)\s*=\s*round\s*\(\s*(\w+)\s*,\s*(\d+)\s*\)$/);
                if (roundMatch) {
                    const varName = roundMatch[1];
                    const sourceVar = roundMatch[2];
                    const decimals = parseInt(roundMatch[3]);
                    if (variables[sourceVar] !== undefined) {
                        variables[varName] = Number(Number(variables[sourceVar]).toFixed(decimals));
                    }
                    continue;
                }

                // math.pow
                const powMatch = trimmed.match(/^(\w+)\s*=\s*math\.pow\s*\(\s*(\w+)\s*,\s*(\d+)\s*\)$/);
                if (powMatch) {
                    const varName = powMatch[1];
                    const base = powMatch[2];
                    const exp = parseInt(powMatch[3]);
                    if (variables[base] !== undefined) {
                        variables[varName] = Math.pow(Number(variables[base]), exp);
                    }
                    continue;
                }

                // json.dumps with indent
                const dumpsMatch = trimmed.match(/^(\w+)\s*=\s*json\.dumps\s*\(\s*(\w+)\s*,\s*indent\s*=\s*(\d+)\s*\)$/);
                if (dumpsMatch) {
                    const varName = dumpsMatch[1];
                    const dictName = dumpsMatch[2];
                    const indent = parseInt(dumpsMatch[3]);
                    if (dictVariables[dictName]) {
                        variables[varName] = JSON.stringify(dictVariables[dictName], null, indent);
                    }
                    continue;
                }

                // Print statements
                // Simple string
                const printStrMatch = trimmed.match(/^print\s*\(\s*["'](.*)["']\s*\)$/);
                if (printStrMatch) {
                    outputLines.push(printStrMatch[1]);
                    continue;
                }

                // print("label", var)
                const printLabelVarMatch = trimmed.match(/^print\s*\(\s*["'](.+)["']\s*,\s*(\w+)\s*\)$/);
                if (printLabelVarMatch) {
                    const label = printLabelVarMatch[1];
                    const varName = printLabelVarMatch[2];
                    if (variables[varName] !== undefined) {
                        outputLines.push(`${label} ${variables[varName]}`);
                    }
                    continue;
                }

                // print("label", var, "text", var)
                const printMultiMatch = trimmed.match(/^print\s*\(\s*["'](.+)["']\s*,\s*(\w+)\s*,\s*["'](.+)["']\s*,\s*(\w+)\s*\)$/);
                if (printMultiMatch) {
                    const label = printMultiMatch[1];
                    const v1 = printMultiMatch[2];
                    const text = printMultiMatch[3];
                    const v2 = printMultiMatch[4];
                    outputLines.push(`${label} ${variables[v1]} ${text} ${variables[v2]}`);
                    continue;
                }

                // print("label", var, "suffix")
                const printVarSuffixMatch = trimmed.match(/^print\s*\(\s*["'](.+)["']\s*,\s*(\w+)\s*,\s*["'](.+)["']\s*\)$/);
                if (printVarSuffixMatch) {
                    const label = printVarSuffixMatch[1];
                    const varName = printVarSuffixMatch[2];
                    const suffix = printVarSuffixMatch[3];
                    if (variables[varName] !== undefined) {
                        outputLines.push(`${label} ${variables[varName]} ${suffix}`);
                    }
                    continue;
                }

                // print("label", list[index])
                const printListMatch = trimmed.match(/^print\s*\(\s*["'](.+)["']\s*,\s*(\w+)\s*\[\s*(\w+)\s*\]\s*\)$/);
                if (printListMatch) {
                    const label = printListMatch[1];
                    const listName = printListMatch[2];
                    const indexVar = printListMatch[3];
                    if (lists[listName] && variables[indexVar] !== undefined) {
                        const idx = Number(variables[indexVar]);
                        if (lists[listName][idx]) {
                            outputLines.push(`${label} ${lists[listName][idx]}`);
                        }
                    }
                    continue;
                }

                // print(var) - just variable
                const printVarOnlyMatch = trimmed.match(/^print\s*\(\s*(\w+)\s*\)$/);
                if (printVarOnlyMatch) {
                    const varName = printVarOnlyMatch[1];
                    if (variables[varName] !== undefined) {
                        outputLines.push(String(variables[varName]));
                    }
                    continue;
                }
            }

            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code to see output!');
        } catch {
            setOutput('Error! Check your code syntax.');
        }
    };

    const checkQuiz = () => {
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = true;
        setQuizChecked(newChecked);
        const correctAnswers = [2, 1]; // Q1=all four modules, Q2=json.dumps

        if (quizAnswers[currentQuiz] === correctAnswers[currentQuiz]) {
            if (currentQuiz === 0) {
                setTimeout(() => setCurrentQuiz(1), 1000);
            } else {
                setTimeout(() => {
                    addXpAndCoins(LESSON.xpReward, 20);
                    completeLevel(LESSON_ID, LESSON.xpReward, 20, 1, 150);
                    setLessonComplete(true);
                }, 1000);
            }
        }
    };

    const retryQuiz = () => {
        const newAnswers = [...quizAnswers];
        newAnswers[currentQuiz] = null;
        setQuizAnswers(newAnswers);
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = false;
        setQuizChecked(newChecked);
    };

    if (isLoading || !user) {
        return <div className={styles.container} style={{ background: 'var(--bg-primary)' }}><div className="flex items-center justify-center h-screen"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🔮</motion.div></div></div>;
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'rgba(0, 0, 0, 0.95)' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.8 }}>
                    <motion.div animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '5rem', marginBottom: '1rem' }}>
                        🎉
                    </motion.div>
                </motion.div>
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', duration: 0.8, delay: 0.3 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
                    <Trophy size={50} className="text-white" />
                </motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className={styles.successTitle} style={{ color: '#8b5cf6', fontSize: '2rem' }}>
                    MODULE MASTER!
                </motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className={styles.successMessage} style={{ fontSize: '1.2rem' }}>
                    {LESSON.successMessage}
                </motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7, type: 'spring' }} className={styles.successXp} style={{ background: 'rgba(139, 92, 246, 0.2)', borderColor: 'rgba(139, 92, 246, 0.4)', fontSize: '1.3rem' }}>
                    <Zap size={24} fill="currentColor" /> +{LESSON.xpReward} XP
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }} style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '1rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>You've mastered:</p>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <span style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.25rem 0.75rem', borderRadius: '9999px', color: '#3b82f6', fontSize: '0.85rem' }}>random</span>
                        <span style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '0.25rem 0.75rem', borderRadius: '9999px', color: '#8b5cf6', fontSize: '0.85rem' }}>math</span>
                        <span style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.25rem 0.75rem', borderRadius: '9999px', color: '#10b981', fontSize: '0.85rem' }}>datetime</span>
                        <span style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '0.25rem 0.75rem', borderRadius: '9999px', color: '#f59e0b', fontSize: '0.85rem' }}>json</span>
                        <span style={{ background: 'rgba(236, 72, 153, 0.2)', padding: '0.25rem 0.75rem', borderRadius: '9999px', color: '#ec4899', fontSize: '0.85rem' }}>APIs</span>
                    </div>
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }}>
                    <Link href="/level6/complete" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', marginTop: '1.5rem' }}>
                        Complete Level 6! <ChevronRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            <header className={styles.header} style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid #8b5cf6' }}>
                <Link href="/level6" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 9 - FINAL PROJECT</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                {!showQuiz ? (
                    <>
                        <div className={styles.lessonTitle}>
                            <motion.div className={styles.lessonEmoji} animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>{LESSON.emoji}</motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1 style={{ color: '#8b5cf6' }}>{LESSON.title}</h1>
                                <p style={{ color: 'var(--text-muted)' }}>Final Project: <code style={{ color: '#ec4899' }}>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Final Project Banner */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))', border: '2px solid rgba(139, 92, 246, 0.4)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <Sparkles size={24} style={{ color: '#8b5cf6' }} />
                                <Star size={28} style={{ color: '#ec4899' }} />
                                <span style={{ fontWeight: 800, fontSize: '1.3rem', color: '#8b5cf6' }}>FINAL PROJECT</span>
                                <Star size={28} style={{ color: '#ec4899' }} />
                                <Sparkles size={24} style={{ color: '#8b5cf6' }} />
                            </div>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                Combine ALL modules you've learned to build a complete Fortune Teller App!
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <motion.span animate={hasRandom ? { scale: [1, 1.1, 1] } : {}} style={{ background: hasRandom ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.1)', padding: '0.35rem 0.75rem', borderRadius: '9999px', color: hasRandom ? '#3b82f6' : 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                                    {hasRandom ? '✓' : ''} random
                                </motion.span>
                                <motion.span animate={hasMath ? { scale: [1, 1.1, 1] } : {}} style={{ background: hasMath ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.1)', padding: '0.35rem 0.75rem', borderRadius: '9999px', color: hasMath ? '#8b5cf6' : 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                                    {hasMath ? '✓' : ''} math
                                </motion.span>
                                <motion.span animate={hasDatetime ? { scale: [1, 1.1, 1] } : {}} style={{ background: hasDatetime ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)', padding: '0.35rem 0.75rem', borderRadius: '9999px', color: hasDatetime ? '#10b981' : 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                                    {hasDatetime ? '✓' : ''} datetime
                                </motion.span>
                                <motion.span animate={hasJson ? { scale: [1, 1.1, 1] } : {}} style={{ background: hasJson ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.1)', padding: '0.35rem 0.75rem', borderRadius: '9999px', color: hasJson ? '#f59e0b' : 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                                    {hasJson ? '✓' : ''} json
                                </motion.span>
                            </div>
                        </motion.div>

                        {/* What to Include */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: '#8b5cf6' }}>
                            <h3 style={{ marginBottom: '1rem', color: '#8b5cf6' }}>Your Fortune Teller Should Include:</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                    <span style={{ color: '#3b82f6', fontWeight: 600 }}>random</span>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lucky numbers & fortune selection</p>
                                </div>
                                <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                    <span style={{ color: '#8b5cf6', fontWeight: 600 }}>math</span>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Power calculations</p>
                                </div>
                                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                    <span style={{ color: '#10b981', fontWeight: 600 }}>datetime</span>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Today's date</p>
                                </div>
                                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>json</span>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Export fortune data</p>
                                </div>
                            </div>
                        </div>

                        {/* Code Editor */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: '#8b5cf6' }}>Build Your Fortune Teller:</h3>
                            <div className={styles.editor} style={{ borderColor: '#8b5cf6' }}>
                                <div className={styles.codeHeader}><span>fortune_teller.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '500px' }} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
                                <Play size={18} /> Tell My Fortune!
                            </button>
                            {output && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.outputBox}>
                                    <div className={styles.outputLabel}>Fortune Reading:</div>
                                    <div className={styles.outputText} style={{ whiteSpace: 'pre-wrap' }}>{output}</div>
                                </motion.div>
                            )}
                        </div>

                        {/* Progress */}
                        <div className={styles.challenges} style={{ background: 'var(--bg-secondary)', borderColor: '#8b5cf6' }}>
                            <h3 style={{ color: '#8b5cf6' }}>Module Checklist:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasRandom ? styles.done : ''}`} style={hasRandom ? { background: '#3b82f6', borderColor: '#3b82f6' } : {}}>
                                        {hasRandom && <Check size={14} />}
                                    </div>
                                    Using random module for lucky numbers
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasMath ? styles.done : ''}`} style={hasMath ? { background: '#8b5cf6', borderColor: '#8b5cf6' } : {}}>
                                        {hasMath && <Check size={14} />}
                                    </div>
                                    Using math module for calculations
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasDatetime ? styles.done : ''}`} style={hasDatetime ? { background: '#10b981', borderColor: '#10b981' } : {}}>
                                        {hasDatetime && <Check size={14} />}
                                    </div>
                                    Using datetime module for today's date
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasJson ? styles.done : ''}`} style={hasJson ? { background: '#f59e0b', borderColor: '#f59e0b' } : {}}>
                                        {hasJson && <Check size={14} />}
                                    </div>
                                    Using json module to export data
                                </li>
                            </ul>
                        </div>

                        <div className={styles.tipBox} style={{ background: 'rgba(139, 92, 246, 0.15)', borderColor: '#8b5cf6' }}>
                            <Lightbulb size={20} style={{ color: '#8b5cf6', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, color: '#8b5cf6' }}>Final Project Tip:</p>
                                <p style={{ fontSize: '0.9rem' }}>
                                    Make it your own! Add more fortunes, colors, or even zodiac signs.
                                    The more creative, the better!
                                </p>
                            </div>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level6/lesson8" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)} style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>Final Quiz! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection} style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15))', borderColor: '#8b5cf6' }}>
                        <motion.div animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔮</motion.div>
                        <h2 className={styles.quizTitle} style={{ color: '#8b5cf6' }}>Final Quiz! (Question {currentQuiz + 1}/2)</h2>

                        {currentQuiz === 0 ? (
                            <>
                                <p className={styles.quizQuestion}>Which modules did we use in Level 6?</p>
                                <div className={styles.quizOptions}>
                                    {['Only random and math', 'random, math, and datetime', 'random, math, datetime, and json'].map((opt, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[0]) { const a = [...quizAnswers]; a[0] = idx; setQuizAnswers(a); } }}
                                            className={`${styles.quizOption} ${quizAnswers[0] === idx ? styles.selected : ''} ${quizChecked[0] && idx === 2 ? styles.correct : ''} ${quizChecked[0] && quizAnswers[0] === idx && idx !== 2 ? styles.wrong : ''}`}
                                            disabled={quizChecked[0]}>{opt}</button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>How do you convert a Python dictionary to a JSON string?</p>
                                <div className={styles.quizOptions}>
                                    {['json.loads()', 'json.dumps()', 'json.convert()'].map((opt, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[1]) { const a = [...quizAnswers]; a[1] = idx; setQuizAnswers(a); } }}
                                            className={`${styles.quizOption} ${quizAnswers[1] === idx ? styles.selected : ''} ${quizChecked[1] && idx === 1 ? styles.correct : ''} ${quizChecked[1] && quizAnswers[1] === idx && idx !== 1 ? styles.wrong : ''}`}
                                            disabled={quizChecked[1]}><code>{opt}</code></button>
                                    ))}
                                </div>
                            </>
                        )}

                        {!quizChecked[currentQuiz] ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswers[currentQuiz] === null} style={{ background: '#8b5cf6' }}>Check Answer</button>
                        ) : quizAnswers[currentQuiz] !== (currentQuiz === 0 ? 2 : 1) ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>{currentQuiz === 0 ? 'We learned all four: random, math, datetime, and json!' : 'json.dumps() converts dictionary to string!'}</p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem', background: '#8b5cf6' }}>Try Again</button>
                            </motion.div>
                        ) : currentQuiz === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${styles.quizFeedback} ${styles.success}`}>
                                <h4>Perfect!</h4><p>All four modules mastered! One more question...</p>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
