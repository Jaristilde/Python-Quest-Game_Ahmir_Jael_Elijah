'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL7_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL7_LESSONS[7];
const LESSON_ID = 92;

export default function Lesson8() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# List Slicing - Like Cutting Pizza!
numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

# Get first 3 items
print(numbers[0:3])

# Get last 3 items
print(numbers[-3:])

# Get every 2nd item
print(numbers[::2])

# Reverse the list!
print(numbers[::-1])

# Get items from index 2 to 7
print(numbers[2:7])
`);
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasSliced, setHasSliced] = useState(false);
    const [hasUsedStep, setHasUsedStep] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            let variables: Record<string, number[]> = {};

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || trimmed === '') continue;

                const listAssign = trimmed.match(/^(\w+)\s*=\s*\[([\d,\s]*)\]$/);
                if (listAssign) {
                    variables[listAssign[1]] = listAssign[2].split(',').map(n => parseInt(n.trim()));
                    continue;
                }

                // Print slice: print(list[start:end:step])
                const sliceMatch = trimmed.match(/^print\s*\(\s*(\w+)\[(-?\d*):(-?\d*)(?::(-?\d*))?\]\s*\)$/);
                if (sliceMatch && variables[sliceMatch[1]]) {
                    const arr = variables[sliceMatch[1]];
                    const start = sliceMatch[2] ? parseInt(sliceMatch[2]) : undefined;
                    const end = sliceMatch[3] ? parseInt(sliceMatch[3]) : undefined;
                    const step = sliceMatch[4] ? parseInt(sliceMatch[4]) : 1;

                    let result: number[];
                    if (step === -1) {
                        result = [...arr].reverse();
                        setHasUsedStep(true);
                    } else {
                        let s = start !== undefined ? (start < 0 ? arr.length + start : start) : 0;
                        let e = end !== undefined ? (end < 0 ? arr.length + end : end) : arr.length;
                        result = [];
                        for (let i = s; i < e; i += step) {
                            if (arr[i] !== undefined) result.push(arr[i]);
                        }
                        if (step !== 1) setHasUsedStep(true);
                    }

                    outputLines.push(`[${result.join(', ')}]`);
                    setHasSliced(true);
                    continue;
                }

                const printVar = trimmed.match(/^print\s*\(\s*(\w+)\s*\)$/);
                if (printVar && variables[printVar[1]]) {
                    outputLines.push(`[${variables[printVar[1]].join(', ')}]`);
                }
            }
            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code!');
        } catch { setOutput('Error!'); }
    };

    const checkQuiz = () => {
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = true;
        setQuizChecked(newChecked);
        const correct = [0, 2];
        if (quizAnswers[currentQuiz] === correct[currentQuiz]) {
            if (currentQuiz === 0) setTimeout(() => setCurrentQuiz(1), 1000);
            else setTimeout(() => { addXpAndCoins(LESSON.xpReward, 5); completeLevel(LESSON_ID, LESSON.xpReward, 5, 1, 60); setLessonComplete(true); }, 1000);
        }
    };

    const retryQuiz = () => {
        const na = [...quizAnswers]; na[currentQuiz] = null; setQuizAnswers(na);
        const nc = [...quizChecked]; nc[currentQuiz] = false; setQuizChecked(nc);
    };

    if (isLoading || !user) return <div className={styles.container}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🍕</motion.div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}><Check size={50} /></motion.div>
                <motion.h2 className={styles.successTitle} style={{ color: '#a855f7' }}>List Slicer! 🍕</motion.h2>
                <motion.p className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div className={styles.successXp}><Zap size={20} /> +{LESSON.xpReward} XP</motion.div>
                <Link href="/level7/lesson9" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>Next Lesson <ChevronRight size={18} /></Link>
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
                            <motion.div className={styles.lessonEmoji} animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>{LESSON.emoji}</motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1 style={{ color: '#a855f7' }}>{LESSON.title}</h1>
                                <p>Learn: <code style={{ color: '#ec4899' }}>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        <motion.div className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15))', borderColor: '#a855f7' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '1.75rem' }}>🍕</span>
                                <Sparkles size={24} style={{ color: '#ec4899' }} />
                                <span style={{ fontWeight: 700, color: '#a855f7' }}>Slice Lists Like Pizza!</span>
                            </div>
                            <p>Just like strings, you can slice lists to get portions. Plus, you can use a <strong style={{ color: '#ec4899' }}>step</strong> to skip items!</p>
                        </motion.div>

                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: '#ec4899' }}>
                            <h3 style={{ color: '#a855f7', marginBottom: '1rem' }}><Lightbulb size={20} /> List Slicing Syntax</h3>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
                                    <code style={{ color: '#a855f7', fontWeight: 700 }}>list[start:end]</code> - Basic slice
                                    <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', marginTop: '0.5rem' }}>[0,1,2,3,4][1:4] → <span style={{ color: '#50fa7b' }}>[1, 2, 3]</span></div>
                                </div>
                                <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
                                    <code style={{ color: '#ec4899', fontWeight: 700 }}>list[::2]</code> - Every 2nd item
                                    <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', marginTop: '0.5rem' }}>[0,1,2,3,4][::2] → <span style={{ color: '#50fa7b' }}>[0, 2, 4]</span></div>
                                </div>
                                <div style={{ background: 'rgba(139, 233, 253, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
                                    <code style={{ color: '#8be9fd', fontWeight: 700 }}>list[::-1]</code> - Reverse!
                                    <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', marginTop: '0.5rem' }}>[1,2,3][::-1] → <span style={{ color: '#50fa7b' }}>[3, 2, 1]</span></div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.codeSection}>
                            <h3 style={{ color: '#ec4899' }}>Try It!</h3>
                            <div className={styles.editor} style={{ borderColor: '#a855f7' }}>
                                <div className={styles.codeHeader}><span>code.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '280px' }} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}><Play size={18} /> Run</button>
                            {output && <motion.div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></motion.div>}
                        </div>

                        <div className={styles.challenges} style={{ borderColor: '#a855f7' }}>
                            <h3 style={{ color: '#a855f7' }}>Challenges:</h3>
                            <ul className={styles.challengeList}>
                                <li><div className={`${styles.challengeCheck} ${hasSliced ? styles.done : ''}`}>{hasSliced && <Check size={14} />}</div>Slice a list</li>
                                <li><div className={`${styles.challengeCheck} ${hasUsedStep ? styles.done : ''}`}>{hasUsedStep && <Check size={14} />}</div>Use step (::2 or ::-1)</li>
                            </ul>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level7/lesson7" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>Quiz! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div className={styles.quizSection} style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15))', borderColor: '#a855f7' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍕</div>
                        <h2 className={styles.quizTitle} style={{ color: '#a855f7' }}>Quiz ({currentQuiz + 1}/2)</h2>
                        {currentQuiz === 0 ? (
                            <><p className={styles.quizQuestion}>What does [1,2,3,4,5][0:3] return?</p>
                            <div className={styles.quizOptions}>{['[1, 2, 3]', '[1, 2, 3, 4]', '[2, 3, 4]'].map((opt, idx) => (
                                <button key={idx} onClick={() => !quizChecked[0] && setQuizAnswers([idx, quizAnswers[1]])} className={`${styles.quizOption} ${quizAnswers[0] === idx ? styles.selected : ''} ${quizChecked[0] && idx === 0 ? styles.correct : ''} ${quizChecked[0] && quizAnswers[0] === idx && idx !== 0 ? styles.wrong : ''}`} disabled={quizChecked[0]}><code>{opt}</code></button>
                            ))}</div></>
                        ) : (
                            <><p className={styles.quizQuestion}>What does [::-1] do?</p>
                            <div className={styles.quizOptions}>{['Gets first item', 'Gets last item', 'Reverses the list'].map((opt, idx) => (
                                <button key={idx} onClick={() => !quizChecked[1] && setQuizAnswers([quizAnswers[0], idx])} className={`${styles.quizOption} ${quizAnswers[1] === idx ? styles.selected : ''} ${quizChecked[1] && idx === 2 ? styles.correct : ''} ${quizChecked[1] && quizAnswers[1] === idx && idx !== 2 ? styles.wrong : ''}`} disabled={quizChecked[1]}>{opt}</button>
                            ))}</div></>
                        )}
                        {!quizChecked[currentQuiz] ? <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswers[currentQuiz] === null} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>Check</button>
                        : quizAnswers[currentQuiz] !== (currentQuiz === 0 ? 0 : 2) ? <motion.div className={`${styles.quizFeedback} ${styles.error}`}><h4>Not quite!</h4><button className={styles.quizBtn} onClick={retryQuiz}>Try Again</button></motion.div>
                        : currentQuiz === 0 ? <motion.div className={`${styles.quizFeedback} ${styles.success}`}><h4>Correct!</h4></motion.div> : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
