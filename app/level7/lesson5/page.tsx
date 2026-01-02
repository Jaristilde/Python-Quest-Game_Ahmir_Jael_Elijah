'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL7_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL7_LESSONS[4];
const LESSON_ID = 89;

export default function Lesson5() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# Cleaning Up Text!
messy = "   Hello World   "

# Remove extra spaces
clean = messy.strip()
print(clean)

# Check how text starts/ends
filename = "photo.jpg"
print(filename.startswith("photo"))
print(filename.endswith(".jpg"))

# Check if text is all letters or digits
word = "Python3"
print(word.isalpha())
print(word.isalnum())
`);
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasUsedStrip, setHasUsedStrip] = useState(false);
    const [hasUsedCheck, setHasUsedCheck] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            let variables: Record<string, string> = {};

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || trimmed === '') continue;

                const strAssign = trimmed.match(/^(\w+)\s*=\s*["'](.*)["']$/);
                if (strAssign) { variables[strAssign[1]] = strAssign[2]; continue; }

                const stripAssign = trimmed.match(/^(\w+)\s*=\s*(\w+)\.strip\(\)$/);
                if (stripAssign && typeof variables[stripAssign[2]] === 'string') {
                    variables[stripAssign[1]] = variables[stripAssign[2]].trim();
                    setHasUsedStrip(true);
                    continue;
                }

                const printStrip = trimmed.match(/^print\s*\(\s*(\w+)\.strip\(\)\s*\)$/);
                if (printStrip && variables[printStrip[1]]) {
                    outputLines.push(variables[printStrip[1]].trim());
                    setHasUsedStrip(true);
                    continue;
                }

                const printStartswith = trimmed.match(/^print\s*\(\s*(\w+)\.startswith\(["'](.*)["']\)\s*\)$/);
                if (printStartswith && variables[printStartswith[1]]) {
                    outputLines.push(variables[printStartswith[1]].startsWith(printStartswith[2]) ? 'True' : 'False');
                    setHasUsedCheck(true);
                    continue;
                }

                const printEndswith = trimmed.match(/^print\s*\(\s*(\w+)\.endswith\(["'](.*)["']\)\s*\)$/);
                if (printEndswith && variables[printEndswith[1]]) {
                    outputLines.push(variables[printEndswith[1]].endsWith(printEndswith[2]) ? 'True' : 'False');
                    setHasUsedCheck(true);
                    continue;
                }

                const printIsalpha = trimmed.match(/^print\s*\(\s*(\w+)\.isalpha\(\)\s*\)$/);
                if (printIsalpha && variables[printIsalpha[1]]) {
                    outputLines.push(/^[a-zA-Z]+$/.test(variables[printIsalpha[1]]) ? 'True' : 'False');
                    continue;
                }

                const printIsalnum = trimmed.match(/^print\s*\(\s*(\w+)\.isalnum\(\)\s*\)$/);
                if (printIsalnum && variables[printIsalnum[1]]) {
                    outputLines.push(/^[a-zA-Z0-9]+$/.test(variables[printIsalnum[1]]) ? 'True' : 'False');
                    continue;
                }

                const printVar = trimmed.match(/^print\s*\(\s*(\w+)\s*\)$/);
                if (printVar && variables[printVar[1]] !== undefined) {
                    outputLines.push(variables[printVar[1]]);
                }
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

    if (isLoading || !user) return <div className={styles.container}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🧹</motion.div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}><Check size={50} /></motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={styles.successTitle} style={{ color: '#a855f7' }}>Text Cleaner! 🧹</motion.h2>
                <motion.p className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div className={styles.successXp}><Zap size={20} /> +{LESSON.xpReward} XP</motion.div>
                <Link href="/level7/lesson6" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>Next Lesson <ChevronRight size={18} /></Link>
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
                                <span style={{ fontSize: '1.75rem' }}>🧹</span>
                                <Sparkles size={24} style={{ color: '#ec4899' }} />
                                <span style={{ fontWeight: 700, color: '#a855f7' }}>Clean and Check Your Text!</span>
                            </div>
                            <p>Remove messy spaces and check what your text contains!</p>
                        </motion.div>

                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: '#ec4899' }}>
                            <h3 style={{ marginBottom: '1rem', color: '#a855f7' }}><Lightbulb size={20} /> Cleaning & Checking Methods</h3>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
                                    <code style={{ color: '#a855f7', fontWeight: 700 }}>.strip()</code> - Remove whitespace from both ends
                                    <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', marginTop: '0.5rem' }}>"  hello  ".strip() → <span style={{ color: '#50fa7b' }}>"hello"</span></div>
                                </div>
                                <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
                                    <code style={{ color: '#ec4899', fontWeight: 700 }}>.startswith("x")</code> - Check if text starts with x
                                    <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', marginTop: '0.5rem' }}>"hello".startswith("he") → <span style={{ color: '#50fa7b' }}>True</span></div>
                                </div>
                                <div style={{ background: 'rgba(139, 233, 253, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
                                    <code style={{ color: '#8be9fd', fontWeight: 700 }}>.endswith("x")</code> - Check if text ends with x
                                    <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', marginTop: '0.5rem' }}>"photo.jpg".endswith(".jpg") → <span style={{ color: '#50fa7b' }}>True</span></div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.codeSection}>
                            <h3 style={{ color: '#ec4899' }}>Try It!</h3>
                            <div className={styles.editor} style={{ borderColor: '#a855f7' }}>
                                <div className={styles.codeHeader}><span>code.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '250px' }} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}><Play size={18} /> Run</button>
                            {output && <motion.div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></motion.div>}
                        </div>

                        <div className={styles.challenges} style={{ borderColor: '#a855f7' }}>
                            <h3 style={{ color: '#a855f7' }}>Challenges:</h3>
                            <ul className={styles.challengeList}>
                                <li><div className={`${styles.challengeCheck} ${hasUsedStrip ? styles.done : ''}`}>{hasUsedStrip && <Check size={14} />}</div>Use .strip() to clean text</li>
                                <li><div className={`${styles.challengeCheck} ${hasUsedCheck ? styles.done : ''}`}>{hasUsedCheck && <Check size={14} />}</div>Use .startswith() or .endswith()</li>
                            </ul>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level7/lesson4" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>Quiz! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div className={styles.quizSection} style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15))', borderColor: '#a855f7' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧹</div>
                        <h2 className={styles.quizTitle} style={{ color: '#a855f7' }}>Quiz ({currentQuiz + 1}/2)</h2>
                        {currentQuiz === 0 ? (
                            <><p className={styles.quizQuestion}>What does .strip() remove?</p>
                            <div className={styles.quizOptions}>{['All spaces', 'Whitespace from ends', 'Letters'].map((opt, idx) => (
                                <button key={idx} onClick={() => !quizChecked[0] && setQuizAnswers([idx, quizAnswers[1]])} className={`${styles.quizOption} ${quizAnswers[0] === idx ? styles.selected : ''} ${quizChecked[0] && idx === 1 ? styles.correct : ''} ${quizChecked[0] && quizAnswers[0] === idx && idx !== 1 ? styles.wrong : ''}`} disabled={quizChecked[0]}>{opt}</button>
                            ))}</div></>
                        ) : (
                            <><p className={styles.quizQuestion}>"test.py".endswith(".py") returns?</p>
                            <div className={styles.quizOptions}>{['True', 'False', '"py"'].map((opt, idx) => (
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
