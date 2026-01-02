'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Bot, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL5_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL5_LESSONS[4]; // Lesson 5
const LESSON_ID = 67;

export default function Lesson5() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# Loop through a dictionary!
scores = {
    "Alice": 95,
    "Bob": 87,
    "Charlie": 92
}

# Loop through keys
print("Players:")
for name in scores:
    print(name)

# Loop through values
print("Scores:")
for score in scores.values():
    print(score)
`);
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasLoopedKeys, setHasLoopedKeys] = useState(false);
    const [hasLoopedValues, setHasLoopedValues] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            const dicts: Record<string, Record<string, string | number>> = {};
            let currentDict = '';
            let inDict = false;
            let inForLoop = false;
            let loopVar = '';
            let loopType = ''; // 'keys', 'values', 'items'
            let loopDictName = '';

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || trimmed === '') continue;

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

                // For loop - keys only
                const forKeysMatch = trimmed.match(/^for\s+(\w+)\s+in\s+(\w+):$/);
                if (forKeysMatch) {
                    loopVar = forKeysMatch[1];
                    loopDictName = forKeysMatch[2];
                    loopType = 'keys';
                    inForLoop = true;
                    setHasLoopedKeys(true);
                    continue;
                }

                // For loop - values
                const forValuesMatch = trimmed.match(/^for\s+(\w+)\s+in\s+(\w+)\.values\(\):$/);
                if (forValuesMatch) {
                    loopVar = forValuesMatch[1];
                    loopDictName = forValuesMatch[2];
                    loopType = 'values';
                    inForLoop = true;
                    setHasLoopedValues(true);
                    continue;
                }

                // For loop - items
                const forItemsMatch = trimmed.match(/^for\s+(\w+),\s*(\w+)\s+in\s+(\w+)\.items\(\):$/);
                if (forItemsMatch) {
                    loopVar = forItemsMatch[1];
                    const valueVar = forItemsMatch[2];
                    loopDictName = forItemsMatch[3];
                    loopType = 'items';
                    inForLoop = true;
                    setHasLoopedKeys(true);
                    setHasLoopedValues(true);

                    // Look for print in next line(s)
                    const dict = dicts[loopDictName];
                    if (dict) {
                        for (let j = i + 1; j < lines.length; j++) {
                            const nextLine = lines[j].trim();
                            if (nextLine === '' || nextLine.startsWith('#')) continue;
                            if (!nextLine.startsWith('    ') && !nextLine.startsWith('\t') && !lines[j].match(/^\s+/)) break;

                            // Check for print with both variables
                            const printBothMatch = nextLine.match(/print\s*\(\s*(\w+),\s*(\w+)\s*\)/);
                            if (printBothMatch) {
                                for (const [k, v] of Object.entries(dict)) {
                                    outputLines.push(`${k} ${v}`);
                                }
                            }
                            // Check for f-string or formatted print
                            const fstringMatch = nextLine.match(/print\s*\(f["'](.+)["']\)/);
                            if (fstringMatch) {
                                const template = fstringMatch[1];
                                for (const [k, v] of Object.entries(dict)) {
                                    let result = template.replace(`{${loopVar}}`, k).replace(`{${valueVar}}`, String(v));
                                    outputLines.push(result);
                                }
                            }
                        }
                    }
                    continue;
                }

                // Print inside loop
                if (inForLoop && (trimmed.startsWith('print(') && line.match(/^\s+/))) {
                    const dict = dicts[loopDictName];
                    if (dict) {
                        if (loopType === 'keys') {
                            // Print the loop variable (key)
                            const printVarMatch = trimmed.match(/print\s*\(\s*(\w+)\s*\)/);
                            if (printVarMatch && printVarMatch[1] === loopVar) {
                                for (const key of Object.keys(dict)) {
                                    outputLines.push(key);
                                }
                            }
                        } else if (loopType === 'values') {
                            // Print the loop variable (value)
                            const printVarMatch = trimmed.match(/print\s*\(\s*(\w+)\s*\)/);
                            if (printVarMatch && printVarMatch[1] === loopVar) {
                                for (const val of Object.values(dict)) {
                                    outputLines.push(String(val));
                                }
                            }
                        }
                    }
                    continue;
                }

                // Regular print (not in loop)
                if (!line.match(/^\s+/) || !inForLoop) {
                    inForLoop = false;
                    const printStrMatch = trimmed.match(/^print\s*\(["'](.+)["']\)$/);
                    if (printStrMatch) {
                        outputLines.push(printStrMatch[1]);
                        continue;
                    }
                }
            }

            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code!');
        } catch {
            setOutput('Error! Check syntax.');
        }
    };

    const checkQuiz = () => {
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = true;
        setQuizChecked(newChecked);
        const correctAnswers = [0, 2]; // Q1=for key in dict, Q2=.items()

        if (quizAnswers[currentQuiz] === correctAnswers[currentQuiz]) {
            if (currentQuiz === 0) {
                setTimeout(() => setCurrentQuiz(1), 1000);
            } else {
                setTimeout(() => {
                    addXpAndCoins(LESSON.xpReward, 5);
                    completeLevel(LESSON_ID, LESSON.xpReward, 5, 1, 60);
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
        return <div className={styles.container} style={{ background: 'var(--bg-primary)' }}><div className="flex items-center justify-center h-screen"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🔍</motion.div></div></div>;
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'rgba(0, 0, 0, 0.95)' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}><Check size={50} /></motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle} style={{ color: 'var(--accent-primary)' }}>Loop Explorer! 🔍</motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}><Link href="/level5/lesson6" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link></motion.div>
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
                {!showQuiz ? (
                    <>
                        <div className={styles.lessonTitle}>
                            <motion.div className={styles.lessonEmoji} animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>{LESSON.emoji}</motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1 style={{ color: 'var(--accent-primary)' }}>{LESSON.title}</h1>
                                <p>Learn: <code style={{ color: 'var(--accent-secondary)' }}>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))', borderColor: 'var(--accent-primary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Bot size={28} style={{ color: 'var(--accent-primary)' }} />
                                <Sparkles size={24} style={{ color: 'var(--accent-secondary)' }} />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>Looping Through Dictionaries!</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '0.75rem', marginBottom: '1rem' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔍</div>
                                    <p style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>Look through every drawer!</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loop through keys, values, or both!</p>
                                </div>
                            </div>

                            <p>
                                Just like lists, you can <strong style={{ color: 'var(--accent-secondary)' }}>loop through</strong> dictionaries!
                                But dictionaries give you <strong style={{ color: 'var(--accent-primary)' }}>THREE options</strong>: keys only, values only, or both!
                            </p>
                        </motion.div>

                        {/* Three Loop Types */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-secondary)' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Three Ways to Loop</h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ background: 'rgba(80, 250, 123, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(80, 250, 123, 0.3)' }}>
                                    <p style={{ fontWeight: 700, color: '#50fa7b', marginBottom: '0.5rem' }}>1. Loop through KEYS</p>
                                    <code style={{ fontSize: '0.9rem' }}>
                                        <span style={{ color: '#ff79c6' }}>for</span> key <span style={{ color: '#ff79c6' }}>in</span> dict:
                                    </code>
                                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Gets each label/name</p>
                                </div>

                                <div style={{ background: 'rgba(139, 233, 253, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(139, 233, 253, 0.3)' }}>
                                    <p style={{ fontWeight: 700, color: '#8be9fd', marginBottom: '0.5rem' }}>2. Loop through VALUES</p>
                                    <code style={{ fontSize: '0.9rem' }}>
                                        <span style={{ color: '#ff79c6' }}>for</span> value <span style={{ color: '#ff79c6' }}>in</span> dict<span style={{ color: '#f1fa8c' }}>.values()</span>:
                                    </code>
                                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Gets each stored value</p>
                                </div>

                                <div style={{ background: 'rgba(255, 121, 198, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 121, 198, 0.3)' }}>
                                    <p style={{ fontWeight: 700, color: '#ff79c6', marginBottom: '0.5rem' }}>3. Loop through BOTH</p>
                                    <code style={{ fontSize: '0.9rem' }}>
                                        <span style={{ color: '#ff79c6' }}>for</span> key, value <span style={{ color: '#ff79c6' }}>in</span> dict<span style={{ color: '#f1fa8c' }}>.items()</span>:
                                    </code>
                                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Gets key AND value together!</p>
                                </div>
                            </div>
                        </div>

                        {/* Example */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: 'var(--accent-secondary)' }}>Example: Game Scores</h3>
                            <div className={styles.codeBlock} style={{ borderColor: 'var(--accent-primary)' }}>
                                <div className={styles.codeHeader}><span>main.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    scores = {"{"}{'\n'}
                                    {'    '}<span style={{ color: '#50fa7b' }}>"Alice"</span>: <span style={{ color: '#bd93f9' }}>95</span>,{'\n'}
                                    {'    '}<span style={{ color: '#50fa7b' }}>"Bob"</span>: <span style={{ color: '#bd93f9' }}>87</span>,{'\n'}
                                    {'    '}<span style={{ color: '#50fa7b' }}>"Charlie"</span>: <span style={{ color: '#bd93f9' }}>92</span>{'\n'}
                                    {"}"}{'\n\n'}
                                    <span className={styles.comment}># Loop through keys only</span>{'\n'}
                                    <span className={styles.keyword}>for</span> name <span className={styles.keyword}>in</span> scores:{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(name){'\n\n'}
                                    <span className={styles.comment}># Loop through values only</span>{'\n'}
                                    <span className={styles.keyword}>for</span> score <span className={styles.keyword}>in</span> scores.values():{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(score){'\n\n'}
                                    <span className={styles.comment}># Loop through both!</span>{'\n'}
                                    <span className={styles.keyword}>for</span> name, score <span className={styles.keyword}>in</span> scores.items():{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(f<span className={styles.string}>"{'{'}name{'}'}: {'{'}score{'}'}"</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>Alice{'\n'}Bob{'\n'}Charlie{'\n'}95{'\n'}87{'\n'}92{'\n'}Alice: 95{'\n'}Bob: 87{'\n'}Charlie: 92</div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: 'var(--accent-secondary)' }}>Your Turn!</h3>
                            <div className={styles.editor} style={{ borderColor: 'var(--accent-primary)' }}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '280px' }} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode} style={{ background: 'var(--accent-primary)' }}><Play size={18} /> Run Code</button>
                            {output && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></motion.div>}
                        </div>

                        {/* Challenges */}
                        <div className={styles.challenges} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
                            <h3 style={{ color: 'var(--accent-primary)' }}>Challenges:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasLoopedKeys ? styles.done : ''}`}>{hasLoopedKeys && <Check size={14} />}</div>
                                    Loop through keys with <code style={{ color: 'var(--accent-secondary)' }}>for key in dict:</code>
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasLoopedValues ? styles.done : ''}`}>{hasLoopedValues && <Check size={14} />}</div>
                                    Loop through values with <code style={{ color: 'var(--accent-secondary)' }}>.values()</code>
                                </li>
                            </ul>
                        </div>

                        <div className={styles.tipBox} style={{ background: 'rgba(251, 191, 36, 0.15)', borderColor: 'var(--accent-secondary)' }}>
                            <Lightbulb size={20} style={{ color: 'var(--accent-secondary)', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>Pro Tip:</p>
                                <p style={{ fontSize: '0.9rem' }}>
                                    Use <code>.items()</code> when you need BOTH the key and value together.
                                    It's the most common way to loop through dictionaries!
                                </p>
                            </div>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level5/lesson4" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)} style={{ background: 'var(--accent-primary)' }}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection} style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))', borderColor: 'var(--accent-primary)' }}>
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</motion.div>
                        <h2 className={styles.quizTitle} style={{ color: 'var(--accent-primary)' }}>Brain Check! (Question {currentQuiz + 1}/2)</h2>

                        {currentQuiz === 0 ? (
                            <>
                                <p className={styles.quizQuestion}>What does <code>for name in students:</code> loop through?</p>
                                <div className={styles.quizOptions}>
                                    {['The KEYS (labels)', 'The VALUES (data)', 'Both keys and values'].map((opt, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[0]) { const a = [...quizAnswers]; a[0] = idx; setQuizAnswers(a); } }}
                                            className={`${styles.quizOption} ${quizAnswers[0] === idx ? styles.selected : ''} ${quizChecked[0] && idx === 0 ? styles.correct : ''} ${quizChecked[0] && quizAnswers[0] === idx && idx !== 0 ? styles.wrong : ''}`}
                                            disabled={quizChecked[0]}>{opt}</button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>Which method lets you loop through BOTH keys and values?</p>
                                <div className={styles.quizOptions}>
                                    {['.keys()', '.values()', '.items()'].map((opt, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[1]) { const a = [...quizAnswers]; a[1] = idx; setQuizAnswers(a); } }}
                                            className={`${styles.quizOption} ${quizAnswers[1] === idx ? styles.selected : ''} ${quizChecked[1] && idx === 2 ? styles.correct : ''} ${quizChecked[1] && quizAnswers[1] === idx && idx !== 2 ? styles.wrong : ''}`}
                                            disabled={quizChecked[1]}><code>{opt}</code></button>
                                    ))}
                                </div>
                            </>
                        )}

                        {!quizChecked[currentQuiz] ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswers[currentQuiz] === null} style={{ background: 'var(--accent-primary)' }}>Check Answer</button>
                        ) : quizAnswers[currentQuiz] !== (currentQuiz === 0 ? 0 : 2) ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>{currentQuiz === 0 ? 'By default, looping through a dict gives you the KEYS!' : '.items() gives you both key and value as a pair!'}</p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem', background: 'var(--accent-primary)' }}>Try Again</button>
                            </motion.div>
                        ) : currentQuiz === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${styles.quizFeedback} ${styles.success}`}>
                                <h4>Correct!</h4><p>By default you get the keys! Next question...</p>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
