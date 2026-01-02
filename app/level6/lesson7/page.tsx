'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, FileJson, Code } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL6_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL6_LESSONS[6]; // Lesson 7 (index 6)
const LESSON_ID = 82;

export default function Lesson7() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# JSON: The Universal Data Language!
import json

# JSON looks like Python dictionaries!
# Here's a player profile as JSON text:
player_json = '{"name": "Hero", "level": 10, "health": 100}'

# Convert JSON string to Python dictionary
player = json.loads(player_json)
print("Player name:", player["name"])
print("Level:", player["level"])

# Create a Python dictionary
game_data = {
    "score": 5000,
    "coins": 250,
    "items": ["sword", "shield"]
}

# Convert Python dictionary to JSON string
json_string = json.dumps(game_data)
print("")
print("As JSON:", json_string)

# Pretty print with indentation
pretty_json = json.dumps(game_data, indent=2)
print("")
print("Pretty JSON:")
print(pretty_json)
`);
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            const variables: Record<string, string | number | object> = {};
            const dictVariables: Record<string, Record<string, unknown>> = {};

            let inDict = false;
            let currentDictName = '';
            let currentDictContent = '';

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || trimmed === '' || trimmed.startsWith('import')) continue;

                // JSON string assignment
                const jsonStrMatch = trimmed.match(/^(\w+)\s*=\s*'(\{.+\})'$/);
                if (jsonStrMatch) {
                    const varName = jsonStrMatch[1];
                    const jsonStr = jsonStrMatch[2];
                    variables[varName] = jsonStr;
                    continue;
                }

                // json.loads() - parse JSON string
                const loadsMatch = trimmed.match(/^(\w+)\s*=\s*json\.loads\s*\(\s*(\w+)\s*\)$/);
                if (loadsMatch) {
                    const varName = loadsMatch[1];
                    const sourceVar = loadsMatch[2];
                    if (variables[sourceVar] && typeof variables[sourceVar] === 'string') {
                        try {
                            const parsed = JSON.parse(variables[sourceVar] as string);
                            dictVariables[varName] = parsed;
                        } catch {
                            outputLines.push('Error parsing JSON');
                        }
                    }
                    continue;
                }

                // Start of dictionary definition
                const dictStartMatch = trimmed.match(/^(\w+)\s*=\s*\{$/);
                if (dictStartMatch) {
                    currentDictName = dictStartMatch[1];
                    currentDictContent = '{';
                    inDict = true;
                    continue;
                }

                // Inside dictionary
                if (inDict) {
                    currentDictContent += trimmed;
                    if (trimmed.includes('}')) {
                        inDict = false;
                        try {
                            // Convert Python-like dict to valid JSON
                            let jsonContent = currentDictContent
                                .replace(/'/g, '"')
                                .replace(/True/g, 'true')
                                .replace(/False/g, 'false')
                                .replace(/None/g, 'null');
                            dictVariables[currentDictName] = JSON.parse(jsonContent);
                        } catch {
                            // Try simpler parsing
                        }
                        currentDictContent = '';
                    }
                    continue;
                }

                // json.dumps() - convert to JSON string
                const dumpsMatch = trimmed.match(/^(\w+)\s*=\s*json\.dumps\s*\(\s*(\w+)\s*\)$/);
                if (dumpsMatch) {
                    const varName = dumpsMatch[1];
                    const sourceVar = dumpsMatch[2];
                    if (dictVariables[sourceVar]) {
                        variables[varName] = JSON.stringify(dictVariables[sourceVar]);
                    }
                    continue;
                }

                // json.dumps with indent
                const dumpsPrettyMatch = trimmed.match(/^(\w+)\s*=\s*json\.dumps\s*\(\s*(\w+)\s*,\s*indent\s*=\s*(\d+)\s*\)$/);
                if (dumpsPrettyMatch) {
                    const varName = dumpsPrettyMatch[1];
                    const sourceVar = dumpsPrettyMatch[2];
                    const indent = parseInt(dumpsPrettyMatch[3]);
                    if (dictVariables[sourceVar]) {
                        variables[varName] = JSON.stringify(dictVariables[sourceVar], null, indent);
                    }
                    continue;
                }

                // Print with label and dict access
                const printDictMatch = trimmed.match(/^print\s*\(\s*["'](.+)["']\s*,\s*(\w+)\s*\[\s*["'](\w+)["']\s*\]\s*\)$/);
                if (printDictMatch) {
                    const label = printDictMatch[1];
                    const dictName = printDictMatch[2];
                    const key = printDictMatch[3];
                    if (dictVariables[dictName] && dictVariables[dictName][key] !== undefined) {
                        outputLines.push(`${label} ${dictVariables[dictName][key]}`);
                    }
                    continue;
                }

                // Print with label and variable
                const printVarMatch = trimmed.match(/^print\s*\(\s*["'](.+)["']\s*,\s*(\w+)\s*\)$/);
                if (printVarMatch) {
                    const label = printVarMatch[1];
                    const varName = printVarMatch[2];
                    if (variables[varName] !== undefined) {
                        outputLines.push(`${label} ${variables[varName]}`);
                    }
                    continue;
                }

                // Print variable only
                const printOnlyVarMatch = trimmed.match(/^print\s*\(\s*(\w+)\s*\)$/);
                if (printOnlyVarMatch) {
                    const varName = printOnlyVarMatch[1];
                    if (variables[varName] !== undefined) {
                        outputLines.push(String(variables[varName]));
                    }
                    continue;
                }

                // Simple print string
                const printStrMatch = trimmed.match(/^print\s*\(\s*["'](.*)["']\s*\)$/);
                if (printStrMatch) {
                    outputLines.push(printStrMatch[1]);
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
        const correctAnswers = [1, 0]; // Q1=json.loads, Q2=json.dumps

        if (quizAnswers[currentQuiz] === correctAnswers[currentQuiz]) {
            if (currentQuiz === 0) {
                setTimeout(() => setCurrentQuiz(1), 1000);
            } else {
                setTimeout(() => {
                    addXpAndCoins(LESSON.xpReward, 10);
                    completeLevel(LESSON_ID, LESSON.xpReward, 10, 1, 60);
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
        return <div className={styles.container} style={{ background: 'var(--bg-primary)' }}><div className="flex items-center justify-center h-screen"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>📋</motion.div></div></div>;
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'rgba(0, 0, 0, 0.95)' }}>
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', duration: 0.8 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                    <FileJson size={50} className="text-white" />
                </motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle} style={{ color: '#3b82f6' }}>
                    Data Decoder! 📋
                </motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>
                    {LESSON.successMessage}
                </motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className={styles.successXp}>
                    <Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                    <Link href="/level6/lesson8" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                        Next Lesson <ChevronRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            <header className={styles.header} style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid #3b82f6' }}>
                <Link href="/level6" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 9</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                {!showQuiz ? (
                    <>
                        <div className={styles.lessonTitle}>
                            <motion.div className={styles.lessonEmoji} animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>{LESSON.emoji}</motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1 style={{ color: '#3b82f6' }}>{LESSON.title}</h1>
                                <p style={{ color: 'var(--text-muted)' }}>Learn: <code style={{ color: '#8b5cf6' }}>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* JSON Explanation */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))', border: '2px solid rgba(59, 130, 246, 0.3)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem' }}>
                            <h3 style={{ color: '#3b82f6', marginBottom: '1rem', textAlign: 'center' }}>What is JSON?</h3>
                            <p style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                <strong style={{ color: '#8b5cf6' }}>JSON</strong> = JavaScript Object Notation
                                <br />The universal language for sharing data!
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', alignItems: 'center' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <Code size={40} style={{ color: '#3b82f6', marginBottom: '0.5rem' }} />
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Any Language</div>
                                </div>
                                <motion.div animate={{ x: [0, 10, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                                    <span style={{ fontSize: '1.5rem' }}>⟷</span>
                                </motion.div>
                                <div style={{ textAlign: 'center' }}>
                                    <FileJson size={40} style={{ color: '#8b5cf6', marginBottom: '0.5rem' }} />
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>JSON Format</div>
                                </div>
                                <motion.div animate={{ x: [0, 10, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}>
                                    <span style={{ fontSize: '1.5rem' }}>⟷</span>
                                </motion.div>
                                <div style={{ textAlign: 'center' }}>
                                    <Code size={40} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Any Language</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* JSON vs Python Dictionary */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: '#3b82f6' }}>
                            <h3 style={{ color: '#3b82f6', marginBottom: '1rem' }}>JSON Looks Like Python Dictionaries!</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '1rem', borderRadius: '0.75rem' }}>
                                    <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: '0.5rem' }}>Python Dictionary</div>
                                    <code style={{ fontSize: '0.85rem', display: 'block', whiteSpace: 'pre' }}>
{`player = {
  "name": "Hero",
  "level": 10,
  "active": True
}`}
                                    </code>
                                </div>
                                <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '1rem', borderRadius: '0.75rem' }}>
                                    <div style={{ fontWeight: 700, color: '#8b5cf6', marginBottom: '0.5rem' }}>JSON String</div>
                                    <code style={{ fontSize: '0.85rem', display: 'block', whiteSpace: 'pre' }}>
{`{
  "name": "Hero",
  "level": 10,
  "active": true
}`}
                                    </code>
                                </div>
                            </div>
                            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                Main difference: JSON uses <code style={{ color: '#50fa7b' }}>true/false</code> instead of <code style={{ color: '#f472b6' }}>True/False</code>
                            </p>
                        </div>

                        {/* Key Functions */}
                        <div style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem' }}>
                            <h3 style={{ color: '#8b5cf6', marginBottom: '1rem' }}>Two Key Functions:</h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <motion.div whileHover={{ scale: 1.02 }} style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                    <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: '0.5rem' }}>
                                        <code>json.loads()</code> - Load String
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                        Converts JSON text into a Python dictionary
                                    </p>
                                    <code style={{ fontSize: '0.85rem', color: '#50fa7b' }}>
                                        {`data = json.loads('{"name": "Hero"}')`}
                                    </code>
                                </motion.div>

                                <motion.div whileHover={{ scale: 1.02 }} style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                                    <div style={{ fontWeight: 700, color: '#8b5cf6', marginBottom: '0.5rem' }}>
                                        <code>json.dumps()</code> - Dump String
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                        Converts Python dictionary into JSON text
                                    </p>
                                    <code style={{ fontSize: '0.85rem', color: '#50fa7b' }}>
                                        text = json.dumps({"{"}"name": "Hero"{"}"})
                                    </code>
                                </motion.div>
                            </div>
                        </div>

                        {/* Code Editor */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: '#3b82f6' }}>Try JSON:</h3>
                            <div className={styles.editor} style={{ borderColor: '#3b82f6' }}>
                                <div className={styles.codeHeader}><span>json_example.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '380px' }} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                <Play size={18} /> Run Code
                            </button>
                            {output && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.outputBox}>
                                    <div className={styles.outputLabel}>Output:</div>
                                    <div className={styles.outputText} style={{ whiteSpace: 'pre-wrap' }}>{output}</div>
                                </motion.div>
                            )}
                        </div>

                        <div className={styles.tipBox} style={{ background: 'rgba(59, 130, 246, 0.15)', borderColor: '#3b82f6' }}>
                            <Lightbulb size={20} style={{ color: '#3b82f6', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, color: '#3b82f6' }}>Memory Trick:</p>
                                <p style={{ fontSize: '0.9rem' }}>
                                    <strong>loads</strong> = Load String (JSON text → dictionary)
                                    <br />
                                    <strong>dumps</strong> = Dump to String (dictionary → JSON text)
                                </p>
                            </div>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level6/lesson6" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                Quiz Time! <ChevronRight size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection} style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))', borderColor: '#3b82f6' }}>
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</motion.div>
                        <h2 className={styles.quizTitle} style={{ color: '#3b82f6' }}>JSON Quiz! (Question {currentQuiz + 1}/2)</h2>

                        {currentQuiz === 0 ? (
                            <>
                                <p className={styles.quizQuestion}>Which function converts a JSON string into a Python dictionary?</p>
                                <div className={styles.quizOptions}>
                                    {['json.dumps()', 'json.loads()', 'json.parse()'].map((opt, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[0]) { const a = [...quizAnswers]; a[0] = idx; setQuizAnswers(a); } }}
                                            className={`${styles.quizOption} ${quizAnswers[0] === idx ? styles.selected : ''} ${quizChecked[0] && idx === 1 ? styles.correct : ''} ${quizChecked[0] && quizAnswers[0] === idx && idx !== 1 ? styles.wrong : ''}`}
                                            disabled={quizChecked[0]}><code>{opt}</code></button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>Which function converts a Python dictionary into a JSON string?</p>
                                <div className={styles.quizOptions}>
                                    {['json.dumps()', 'json.loads()', 'json.stringify()'].map((opt, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[1]) { const a = [...quizAnswers]; a[1] = idx; setQuizAnswers(a); } }}
                                            className={`${styles.quizOption} ${quizAnswers[1] === idx ? styles.selected : ''} ${quizChecked[1] && idx === 0 ? styles.correct : ''} ${quizChecked[1] && quizAnswers[1] === idx && idx !== 0 ? styles.wrong : ''}`}
                                            disabled={quizChecked[1]}><code>{opt}</code></button>
                                    ))}
                                </div>
                            </>
                        )}

                        {!quizChecked[currentQuiz] ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswers[currentQuiz] === null} style={{ background: '#3b82f6' }}>Check Answer</button>
                        ) : quizAnswers[currentQuiz] !== (currentQuiz === 0 ? 1 : 0) ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>{currentQuiz === 0 ? 'json.loads() LOADS a string into Python!' : 'json.dumps() DUMPS to a string!'}</p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem', background: '#3b82f6' }}>Try Again</button>
                            </motion.div>
                        ) : currentQuiz === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${styles.quizFeedback} ${styles.success}`}>
                                <h4>Correct!</h4><p>json.loads() loads JSON into Python! Next question...</p>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
