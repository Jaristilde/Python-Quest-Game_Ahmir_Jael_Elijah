'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Link2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL7_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL7_LESSONS[3];
const LESSON_ID = 88;

export default function Lesson4() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# Split and Join - Break Apart and Combine!
sentence = "Python is awesome"
words = sentence.split()
print(words)

# Split by comma
data = "apple,banana,cherry"
fruits = data.split(",")
print(fruits)

# Join with dash
joined = "-".join(fruits)
print(joined)
`);
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasUsedSplit, setHasUsedSplit] = useState(false);
    const [hasUsedJoin, setHasUsedJoin] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            let variables: Record<string, string | string[]> = {};

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || trimmed === '') continue;

                const strAssign = trimmed.match(/^(\w+)\s*=\s*["'](.*)["']$/);
                if (strAssign) { variables[strAssign[1]] = strAssign[2]; continue; }

                const splitNoArg = trimmed.match(/^(\w+)\s*=\s*(\w+)\.split\(\)$/);
                if (splitNoArg) {
                    if (typeof variables[splitNoArg[2]] === 'string') {
                        variables[splitNoArg[1]] = (variables[splitNoArg[2]] as string).split(/\s+/);
                        setHasUsedSplit(true);
                    }
                    continue;
                }

                const splitArg = trimmed.match(/^(\w+)\s*=\s*(\w+)\.split\(["'](.*)["']\)$/);
                if (splitArg) {
                    if (typeof variables[splitArg[2]] === 'string') {
                        variables[splitArg[1]] = (variables[splitArg[2]] as string).split(splitArg[3]);
                        setHasUsedSplit(true);
                    }
                    continue;
                }

                const joinMatch = trimmed.match(/^(\w+)\s*=\s*["'](.*)["']\.join\((\w+)\)$/);
                if (joinMatch) {
                    if (Array.isArray(variables[joinMatch[3]])) {
                        variables[joinMatch[1]] = (variables[joinMatch[3]] as string[]).join(joinMatch[2]);
                        setHasUsedJoin(true);
                    }
                    continue;
                }

                const printVar = trimmed.match(/^print\s*\(\s*(\w+)\s*\)$/);
                if (printVar && variables[printVar[1]] !== undefined) {
                    const val = variables[printVar[1]];
                    outputLines.push(Array.isArray(val) ? `[${val.map(v => `'${v}'`).join(', ')}]` : String(val));
                }
            }
            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code!');
        } catch { setOutput('Error! Check syntax.'); }
    };

    const checkQuiz = () => {
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = true;
        setQuizChecked(newChecked);
        const correct = [1, 2];
        if (quizAnswers[currentQuiz] === correct[currentQuiz]) {
            if (currentQuiz === 0) setTimeout(() => setCurrentQuiz(1), 1000);
            else setTimeout(() => { addXpAndCoins(LESSON.xpReward, 5); completeLevel(LESSON_ID, LESSON.xpReward, 5, 1, 60); setLessonComplete(true); }, 1000);
        }
    };

    const retryQuiz = () => {
        const newAnswers = [...quizAnswers]; newAnswers[currentQuiz] = null; setQuizAnswers(newAnswers);
        const newChecked = [...quizChecked]; newChecked[currentQuiz] = false; setQuizChecked(newChecked);
    };

    if (isLoading || !user) return <div className={styles.container}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🔗</motion.div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}><Check size={50} /></motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle} style={{ color: '#a855f7' }}>Word Combiner! 🔗</motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className={styles.successXp}><Zap size={20} /> +{LESSON.xpReward} XP</motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}><Link href="/level7/lesson5" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>Next Lesson <ChevronRight size={18} /></Link></motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            <header className={styles.header} style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid #a855f7' }}>
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

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15))', borderColor: '#a855f7' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Link2 size={28} style={{ color: '#a855f7' }} />
                                <Sparkles size={24} style={{ color: '#ec4899' }} />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#a855f7' }}>Split Apart & Join Together!</span>
                            </div>
                            <p><strong style={{ color: '#a855f7' }}>.split()</strong> breaks text into a list. <strong style={{ color: '#ec4899' }}>.join()</strong> combines a list into text!</p>
                        </motion.div>

                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: '#ec4899' }}>
                            <h3 style={{ marginBottom: '1rem', color: '#a855f7' }}><Lightbulb size={20} style={{ color: '#ec4899' }} /> Split & Join Methods</h3>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
                                    <code style={{ color: '#a855f7', fontWeight: 700 }}>.split()</code> - Split by spaces
                                    <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', marginTop: '0.5rem' }}>"a b c".split() → <span style={{ color: '#50fa7b' }}>['a', 'b', 'c']</span></div>
                                </div>
                                <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
                                    <code style={{ color: '#ec4899', fontWeight: 700 }}>.split(",")</code> - Split by character
                                    <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', marginTop: '0.5rem' }}>"a,b,c".split(",") → <span style={{ color: '#50fa7b' }}>['a', 'b', 'c']</span></div>
                                </div>
                                <div style={{ background: 'rgba(139, 233, 253, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
                                    <code style={{ color: '#8be9fd', fontWeight: 700 }}>"-".join(list)</code> - Join with separator
                                    <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', marginTop: '0.5rem' }}>"-".join(['a','b']) → <span style={{ color: '#50fa7b' }}>"a-b"</span></div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.codeSection}>
                            <h3 style={{ color: '#ec4899' }}>Try It!</h3>
                            <div className={styles.editor} style={{ borderColor: '#a855f7' }}>
                                <div className={styles.codeHeader}><span>code.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '220px' }} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}><Play size={18} /> Run</button>
                            {output && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></motion.div>}
                        </div>

                        <div className={styles.challenges} style={{ background: 'var(--bg-secondary)', borderColor: '#a855f7' }}>
                            <h3 style={{ color: '#a855f7' }}>Challenges:</h3>
                            <ul className={styles.challengeList}>
                                <li><div className={`${styles.challengeCheck} ${hasUsedSplit ? styles.done : ''}`}>{hasUsedSplit && <Check size={14} />}</div>Use .split()</li>
                                <li><div className={`${styles.challengeCheck} ${hasUsedJoin ? styles.done : ''}`}>{hasUsedJoin && <Check size={14} />}</div>Use .join()</li>
                            </ul>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level7/lesson3" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>Quiz! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection} style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15))', borderColor: '#a855f7' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔗</div>
                        <h2 className={styles.quizTitle} style={{ color: '#a855f7' }}>Quiz ({currentQuiz + 1}/2)</h2>
                        {currentQuiz === 0 ? (
                            <><p className={styles.quizQuestion}>What does .split() return?</p>
                            <div className={styles.quizOptions}>{['A string', 'A list', 'A number'].map((opt, idx) => (
                                <button key={idx} onClick={() => !quizChecked[0] && setQuizAnswers([idx, quizAnswers[1]])} className={`${styles.quizOption} ${quizAnswers[0] === idx ? styles.selected : ''} ${quizChecked[0] && idx === 1 ? styles.correct : ''} ${quizChecked[0] && quizAnswers[0] === idx && idx !== 1 ? styles.wrong : ''}`} disabled={quizChecked[0]}>{opt}</button>
                            ))}</div></>
                        ) : (
                            <><p className={styles.quizQuestion}>What does "-".join(['a','b','c']) return?</p>
                            <div className={styles.quizOptions}>{['["a-b-c"]', '"abc"', '"a-b-c"'].map((opt, idx) => (
                                <button key={idx} onClick={() => !quizChecked[1] && setQuizAnswers([quizAnswers[0], idx])} className={`${styles.quizOption} ${quizAnswers[1] === idx ? styles.selected : ''} ${quizChecked[1] && idx === 2 ? styles.correct : ''} ${quizChecked[1] && quizAnswers[1] === idx && idx !== 2 ? styles.wrong : ''}`} disabled={quizChecked[1]}><code>{opt}</code></button>
                            ))}</div></>
                        )}
                        {!quizChecked[currentQuiz] ? <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswers[currentQuiz] === null} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>Check</button>
                        : quizAnswers[currentQuiz] !== (currentQuiz === 0 ? 1 : 2) ? <motion.div className={`${styles.quizFeedback} ${styles.error}`}><h4>Not quite!</h4><button className={styles.quizBtn} onClick={retryQuiz}>Try Again</button></motion.div>
                        : currentQuiz === 0 ? <motion.div className={`${styles.quizFeedback} ${styles.success}`}><h4>Correct!</h4></motion.div> : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
