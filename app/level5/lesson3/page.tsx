'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Bot, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL5_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL5_LESSONS[2];
const LESSON_ID = 65;

export default function Lesson3() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('# Create your first dictionary!\npet = {\n    "name": "Buddy",\n    "type": "dog",\n    "age": 3\n}\n\nprint(pet["name"])\nprint(pet["age"])\n');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasCreatedDict, setHasCreatedDict] = useState(false);
    const [hasAccessedValue, setHasAccessedValue] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const dictPattern = /(\w+)\s*=\s*\{([^}]*)\}/g;
            const accessPattern = /print\s*\(\s*(\w+)\[["'](\w+)["']\]\s*\)/g;

            let match;
            const dicts: Record<string, Record<string, string | number>> = {};
            let outputLines: string[] = [];

            // Parse dictionaries
            while ((match = dictPattern.exec(code)) !== null) {
                const varName = match[1];
                const content = match[2];
                const dict: Record<string, string | number> = {};

                const pairs = content.match(/["'](\w+)["']\s*:\s*(?:["']([^"']+)["']|(\d+))/g);
                if (pairs) {
                    pairs.forEach(pair => {
                        const keyMatch = pair.match(/["'](\w+)["']\s*:\s*(?:["']([^"']+)["']|(\d+))/);
                        if (keyMatch) {
                            const key = keyMatch[1];
                            const value = keyMatch[2] || Number(keyMatch[3]);
                            dict[key] = value;
                        }
                    });
                }
                dicts[varName] = dict;
                setHasCreatedDict(true);
            }

            // Parse access patterns
            while ((match = accessPattern.exec(code)) !== null) {
                const varName = match[1];
                const key = match[2];
                if (dicts[varName] && dicts[varName][key] !== undefined) {
                    outputLines.push(String(dicts[varName][key]));
                    setHasAccessedValue(true);
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
        const correctAnswers = [1, 0]; // Q1=curly braces, Q2=key-value

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
        return <div className={styles.container} style={{ background: 'var(--bg-primary)' }}><div className="flex items-center justify-center h-screen"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🗄️</motion.div></div></div>;
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'rgba(0, 0, 0, 0.95)' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}><Check size={50} /></motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle} style={{ color: 'var(--accent-primary)' }}>Dictionary Discoverer! 🗄️</motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}><Link href="/level5/lesson4" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link></motion.div>
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
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>Meet DICTIONARIES!</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '0.75rem', marginBottom: '1rem' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🗄️</div>
                                    <p style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>Like labeled drawers!</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Each item has a name (KEY) and something inside (VALUE)</p>
                                </div>
                            </div>

                            <p>
                                📁 Imagine a filing cabinet with <strong style={{ color: 'var(--accent-secondary)' }}>labeled drawers</strong>.
                                Instead of remembering "item 0, item 1, item 2" like lists, you use <strong style={{ color: 'var(--accent-primary)' }}>names</strong>!
                            </p>
                        </motion.div>

                        {/* Key-Value Explanation */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-secondary)' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>🔑 KEY-VALUE PAIRS</h3>
                            <div style={{ background: 'rgba(139, 233, 253, 0.1)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1rem' }}>
                                <code style={{ fontSize: '1rem' }}>
                                    <span style={{ color: '#6272a4' }}>{"{"}</span>
                                    <span style={{ color: '#50fa7b' }}>"name"</span>
                                    <span style={{ color: '#6272a4' }}>:</span>
                                    <span style={{ color: '#f1fa8c' }}> "Buddy"</span>
                                    <span style={{ color: '#6272a4' }}>{"}"}</span>
                                </code>
                                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '1rem', fontSize: '0.85rem' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ color: '#50fa7b', fontWeight: 700 }}>KEY</div>
                                        <div style={{ color: 'var(--text-muted)' }}>(the label)</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ color: '#6272a4', fontWeight: 700 }}>:</div>
                                        <div style={{ color: 'var(--text-muted)' }}>(separator)</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ color: '#f1fa8c', fontWeight: 700 }}>VALUE</div>
                                        <div style={{ color: 'var(--text-muted)' }}>(what's inside)</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vocabulary */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>🔤 New Vocabulary</h3>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255, 121, 198, 0.1)', borderRadius: '0.5rem' }}>
                                    <code style={{ color: '#ff79c6', fontSize: '1rem', fontWeight: 700 }}>DICTIONARY</code>
                                    <span>A collection of labeled data (key-value pairs)</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(80, 250, 123, 0.1)', borderRadius: '0.5rem' }}>
                                    <code style={{ color: '#50fa7b', fontSize: '1rem', fontWeight: 700 }}>KEY</code>
                                    <span>The label/name you use to find data</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(241, 250, 140, 0.1)', borderRadius: '0.5rem' }}>
                                    <code style={{ color: '#f1fa8c', fontSize: '1rem', fontWeight: 700 }}>VALUE</code>
                                    <span>The actual data stored at that key</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(189, 147, 249, 0.1)', borderRadius: '0.5rem' }}>
                                    <code style={{ color: '#bd93f9', fontSize: '1rem', fontWeight: 700 }}>{"{ }"}</code>
                                    <span>Curly braces - use these to make a dictionary</span>
                                </div>
                            </div>
                        </div>

                        {/* Example */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: 'var(--accent-secondary)' }}>Example: Pet Dictionary</h3>
                            <div className={styles.codeBlock} style={{ borderColor: 'var(--accent-primary)' }}>
                                <div className={styles.codeHeader}><span>main.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># Create a DICTIONARY with curly braces {"{}"}</span>{'\n'}
                                    pet = {"{"}{'\n'}
                                    {'    '}<span style={{ color: '#50fa7b' }}>"name"</span>: <span className={styles.string}>"Buddy"</span>,{'\n'}
                                    {'    '}<span style={{ color: '#50fa7b' }}>"type"</span>: <span className={styles.string}>"dog"</span>,{'\n'}
                                    {'    '}<span style={{ color: '#50fa7b' }}>"age"</span>: <span style={{ color: '#bd93f9' }}>3</span>{'\n'}
                                    {"}"}{'\n\n'}
                                    <span className={styles.comment}># Access values using the KEY</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(pet[<span className={styles.string}>"name"</span>])  <span className={styles.comment}># Buddy</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(pet[<span className={styles.string}>"age"</span>])   <span className={styles.comment}># 3</span>
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>Buddy{'\n'}3</div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: 'var(--accent-secondary)' }}>Your Turn - Create a Dictionary!</h3>
                            <div className={styles.editor} style={{ borderColor: 'var(--accent-primary)' }}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '200px' }} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode} style={{ background: 'var(--accent-primary)' }}><Play size={18} /> Run Code</button>
                            {output && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></motion.div>}
                        </div>

                        {/* Challenges */}
                        <div className={styles.challenges} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
                            <h3 style={{ color: 'var(--accent-primary)' }}>Challenges:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasCreatedDict ? styles.done : ''}`}>{hasCreatedDict && <Check size={14} />}</div>
                                    Create a dictionary with <code style={{ color: 'var(--accent-secondary)' }}>{"{ }"}</code>
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasAccessedValue ? styles.done : ''}`}>{hasAccessedValue && <Check size={14} />}</div>
                                    Access a value with <code style={{ color: 'var(--accent-secondary)' }}>dict["key"]</code>
                                </li>
                            </ul>
                        </div>

                        <div className={styles.tipBox} style={{ background: 'rgba(251, 191, 36, 0.15)', borderColor: 'var(--accent-secondary)' }}>
                            <Lightbulb size={20} style={{ color: 'var(--accent-secondary)', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>Remember:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li>Use <code>{"{ }"}</code> curly braces for dictionaries</li>
                                    <li>Format: <code>"key": value</code></li>
                                    <li>Access with: <code>dict["key"]</code></li>
                                    <li>Keys are usually strings (in quotes)</li>
                                </ul>
                            </div>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level5/lesson2" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)} style={{ background: 'var(--accent-primary)' }}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection} style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))', borderColor: 'var(--accent-primary)' }}>
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗄️</motion.div>
                        <h2 className={styles.quizTitle} style={{ color: 'var(--accent-primary)' }}>Brain Check! (Question {currentQuiz + 1}/2)</h2>

                        {currentQuiz === 0 ? (
                            <>
                                <p className={styles.quizQuestion}>Which brackets create a DICTIONARY?</p>
                                <div className={styles.quizOptions}>
                                    {['[ ] Square brackets', '{ } Curly braces', '( ) Parentheses'].map((opt, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[0]) { const a = [...quizAnswers]; a[0] = idx; setQuizAnswers(a); } }}
                                            className={`${styles.quizOption} ${quizAnswers[0] === idx ? styles.selected : ''} ${quizChecked[0] && idx === 1 ? styles.correct : ''} ${quizChecked[0] && quizAnswers[0] === idx && idx !== 1 ? styles.wrong : ''}`}
                                            disabled={quizChecked[0]}><code>{opt}</code></button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>In <code>{"pet = {\"name\": \"Buddy\"}"}</code>, what is "name"?</p>
                                <div className={styles.quizOptions}>
                                    {['The KEY (label)', 'The VALUE (data)', 'A variable'].map((opt, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[1]) { const a = [...quizAnswers]; a[1] = idx; setQuizAnswers(a); } }}
                                            className={`${styles.quizOption} ${quizAnswers[1] === idx ? styles.selected : ''} ${quizChecked[1] && idx === 0 ? styles.correct : ''} ${quizChecked[1] && quizAnswers[1] === idx && idx !== 0 ? styles.wrong : ''}`}
                                            disabled={quizChecked[1]}>{opt}</button>
                                    ))}
                                </div>
                            </>
                        )}

                        {!quizChecked[currentQuiz] ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswers[currentQuiz] === null} style={{ background: 'var(--accent-primary)' }}>Check Answer</button>
                        ) : quizAnswers[currentQuiz] !== (currentQuiz === 0 ? 1 : 0) ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>{currentQuiz === 0 ? 'Dictionaries use curly braces { }! Lists use [ ] and tuples use ( ).' : '"name" is the KEY - the label you use to find the value "Buddy"!'}</p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem', background: 'var(--accent-primary)' }}>Try Again</button>
                            </motion.div>
                        ) : currentQuiz === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${styles.quizFeedback} ${styles.success}`}>
                                <h4>Correct!</h4><p>Dictionaries use curly braces! Next question...</p>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
