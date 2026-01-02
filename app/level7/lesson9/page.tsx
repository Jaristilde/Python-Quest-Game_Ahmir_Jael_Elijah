'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL7_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL7_LESSONS[8];
const LESSON_ID = 93;

export default function Lesson9() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# List Comprehensions - One-Line Magic!

# Old way - multiple lines
numbers = [1, 2, 3, 4, 5]
doubled = []
for n in numbers:
    doubled.append(n * 2)
print("Doubled:", doubled)

# NEW way - one line!
doubled_magic = [n * 2 for n in numbers]
print("Magic:", doubled_magic)

# Square all numbers
squared = [n ** 2 for n in numbers]
print("Squared:", squared)

# Only even numbers
evens = [n for n in numbers if n % 2 == 0]
print("Evens:", evens)

# Transform words to uppercase
words = ["hello", "world", "python"]
upper_words = [w.upper() for w in words]
print("Upper:", upper_words)
`);
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasComprehension, setHasComprehension] = useState(false);
    const [hasFilter, setHasFilter] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            let outputLines: string[] = [];

            // Simple simulation for demo
            if (code.includes('[n * 2 for n in')) {
                setHasComprehension(true);
                outputLines.push("Doubled: [2, 4, 6, 8, 10]");
                outputLines.push("Magic: [2, 4, 6, 8, 10]");
            }
            if (code.includes('[n ** 2 for n in')) {
                outputLines.push("Squared: [1, 4, 9, 16, 25]");
            }
            if (code.includes('if n % 2 == 0')) {
                setHasFilter(true);
                outputLines.push("Evens: [2, 4]");
            }
            if (code.includes('[w.upper() for w in')) {
                outputLines.push("Upper: ['HELLO', 'WORLD', 'PYTHON']");
            }

            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code!');
        } catch { setOutput('Error!'); }
    };

    const checkQuiz = () => {
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = true;
        setQuizChecked(newChecked);
        const correct = [1, 0];
        if (quizAnswers[currentQuiz] === correct[currentQuiz]) {
            if (currentQuiz === 0) setTimeout(() => setCurrentQuiz(1), 1000);
            else setTimeout(() => { addXpAndCoins(LESSON.xpReward, 5); completeLevel(LESSON_ID, LESSON.xpReward, 5, 1, 60); setLessonComplete(true); }, 1000);
        }
    };

    const retryQuiz = () => {
        const na = [...quizAnswers]; na[currentQuiz] = null; setQuizAnswers(na);
        const nc = [...quizChecked]; nc[currentQuiz] = false; setQuizChecked(nc);
    };

    if (isLoading || !user) return <div className={styles.container}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>✨</motion.div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}><Check size={50} /></motion.div>
                <motion.h2 className={styles.successTitle} style={{ color: '#a855f7' }}>Comprehension Wizard! ✨</motion.h2>
                <motion.p className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div className={styles.successXp}><Zap size={20} /> +{LESSON.xpReward} XP</motion.div>
                <Link href="/level7/lesson10" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>Next Lesson <ChevronRight size={18} /></Link>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            <header className={styles.header} style={{ borderBottom: '1px solid #a855f7' }}>
                <Link href="/level7" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 12</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                {!showQuiz ? (
                    <>
                        <div className={styles.lessonTitle}>
                            <motion.div className={styles.lessonEmoji} animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>{LESSON.emoji}</motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1 style={{ color: '#a855f7' }}>{LESSON.title}</h1>
                                <p>Learn: <code style={{ color: '#ec4899' }}>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        <motion.div className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15))', borderColor: '#a855f7' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '1.75rem' }}>✨</span>
                                <Sparkles size={24} style={{ color: '#ec4899' }} />
                                <span style={{ fontWeight: 700, color: '#a855f7' }}>Create Lists in One Line!</span>
                            </div>
                            <p>List comprehensions are a <strong style={{ color: '#ec4899' }}>magical shortcut</strong> to create lists. What normally takes 3-4 lines can be done in ONE!</p>
                        </motion.div>

                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: '#ec4899' }}>
                            <h3 style={{ color: '#a855f7', marginBottom: '1rem' }}><Lightbulb size={20} /> Comprehension Syntax</h3>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
                                    <code style={{ color: '#a855f7', fontWeight: 700 }}>[expression for item in list]</code>
                                    <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', marginTop: '0.5rem' }}>[x*2 for x in [1,2,3]] → <span style={{ color: '#50fa7b' }}>[2, 4, 6]</span></div>
                                </div>
                                <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
                                    <code style={{ color: '#ec4899', fontWeight: 700 }}>[expression for item in list if condition]</code>
                                    <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', marginTop: '0.5rem' }}>[x for x in [1,2,3,4] if x{">"} 2] → <span style={{ color: '#50fa7b' }}>[3, 4]</span></div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.codeSection}>
                            <h3 style={{ color: '#ec4899' }}>Try It!</h3>
                            <div className={styles.editor} style={{ borderColor: '#a855f7' }}>
                                <div className={styles.codeHeader}><span>code.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '350px' }} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}><Play size={18} /> Run</button>
                            {output && <motion.div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></motion.div>}
                        </div>

                        <div className={styles.challenges} style={{ borderColor: '#a855f7' }}>
                            <h3 style={{ color: '#a855f7' }}>Challenges:</h3>
                            <ul className={styles.challengeList}>
                                <li><div className={`${styles.challengeCheck} ${hasComprehension ? styles.done : ''}`}>{hasComprehension && <Check size={14} />}</div>Use a list comprehension</li>
                                <li><div className={`${styles.challengeCheck} ${hasFilter ? styles.done : ''}`}>{hasFilter && <Check size={14} />}</div>Add a filter condition (if)</li>
                            </ul>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level7/lesson8" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>Quiz! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div className={styles.quizSection} style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15))', borderColor: '#a855f7' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
                        <h2 className={styles.quizTitle} style={{ color: '#a855f7' }}>Quiz ({currentQuiz + 1}/2)</h2>
                        {currentQuiz === 0 ? (
                            <><p className={styles.quizQuestion}>What does [x*2 for x in [1,2,3]] create?</p>
                            <div className={styles.quizOptions}>{['[1, 2, 3]', '[2, 4, 6]', '[1, 4, 9]'].map((opt, idx) => (
                                <button key={idx} onClick={() => !quizChecked[0] && setQuizAnswers([idx, quizAnswers[1]])} className={`${styles.quizOption} ${quizAnswers[0] === idx ? styles.selected : ''} ${quizChecked[0] && idx === 1 ? styles.correct : ''} ${quizChecked[0] && quizAnswers[0] === idx && idx !== 1 ? styles.wrong : ''}`} disabled={quizChecked[0]}><code>{opt}</code></button>
                            ))}</div></>
                        ) : (
                            <><p className={styles.quizQuestion}>What does "if x {">"} 2" do in a comprehension?</p>
                            <div className={styles.quizOptions}>{['Filters items', 'Adds items', 'Removes the list'].map((opt, idx) => (
                                <button key={idx} onClick={() => !quizChecked[1] && setQuizAnswers([quizAnswers[0], idx])} className={`${styles.quizOption} ${quizAnswers[1] === idx ? styles.selected : ''} ${quizChecked[1] && idx === 0 ? styles.correct : ''} ${quizChecked[1] && quizAnswers[1] === idx && idx !== 0 ? styles.wrong : ''}`} disabled={quizChecked[1]}>{opt}</button>
                            ))}</div></>
                        )}
                        {!quizChecked[currentQuiz] ? <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswers[currentQuiz] === null} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>Check</button>
                        : quizAnswers[currentQuiz] !== (currentQuiz === 0 ? 1 : 0) ? <motion.div className={`${styles.quizFeedback} ${styles.error}`}><h4>Not quite!</h4><button className={styles.quizBtn} onClick={retryQuiz}>Try Again</button></motion.div>
                        : currentQuiz === 0 ? <motion.div className={`${styles.quizFeedback} ${styles.success}`}><h4>Correct!</h4></motion.div> : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
