'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL1_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL1_LESSONS[7]; // Lesson 8

export default function Lesson8() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizChecked, setQuizChecked] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        // Simplified if/else simulation
        const lines = code.trim().split('\n');
        const variables: { [key: string]: number } = {};
        let outputLines: string[] = [];
        let i = 0;

        while (i < lines.length) {
            const line = lines[i].trim();

            // Variable assignment
            const assignMatch = line.match(/^(\w+)\s*=\s*(\d+)$/);
            if (assignMatch) {
                variables[assignMatch[1]] = parseInt(assignMatch[2]);
                i++;
                continue;
            }

            // If statement
            const ifMatch = line.match(/^if\s+(.+):$/);
            if (ifMatch) {
                let condition = ifMatch[1];
                for (const [varName, value] of Object.entries(variables)) {
                    condition = condition.replace(new RegExp(`\\b${varName}\\b`, 'g'), String(value));
                }
                try {
                    const result = eval(condition);
                    if (result) {
                        // Execute indented line
                        if (i + 1 < lines.length) {
                            const nextLine = lines[i + 1].trim();
                            const printMatch = nextLine.match(/^print\s*\(["'](.*)["']\)$/);
                            if (printMatch) outputLines.push(printMatch[1]);
                        }
                    } else {
                        // Look for else
                        let j = i + 1;
                        while (j < lines.length && !lines[j].trim().startsWith('else')) j++;
                        if (j < lines.length && lines[j].trim() === 'else:') {
                            if (j + 1 < lines.length) {
                                const elseLine = lines[j + 1].trim();
                                const printMatch = elseLine.match(/^print\s*\(["'](.*)["']\)$/);
                                if (printMatch) outputLines.push(printMatch[1]);
                            }
                        }
                    }
                } catch { /* ignore */ }
                // Skip to after else block
                while (i < lines.length && !lines[i].trim().startsWith('else')) i++;
                i += 2;
                continue;
            }

            i++;
        }
        setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code!');
    };

    const checkQuiz = () => {
        setQuizChecked(true);
        if (quizAnswer === 1) {
            setTimeout(() => {
                addXpAndCoins(LESSON.xpReward, 5);
                completeLevel(LESSON.id, LESSON.xpReward, 5, 1, 60);
                setLessonComplete(true);
            }, 1000);
        }
    };

    if (isLoading || !user) return <div className={styles.container}><div className="flex items-center justify-center h-screen text-slate-400">Loading...</div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon}><Check size={50} className="text-white" /></motion.div>
                <h2 className={styles.successTitle}>🎉 CORRECT!</h2>
                <p className={styles.successMessage}>{LESSON.successMessage}</p>
                <div className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</div>
                <Link href="/level1/lesson9" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/level1" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 10</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                {!showQuiz ? (
                    <>
                        <div className={styles.lessonTitle}>
                            <div className={styles.lessonEmoji}>{LESSON.emoji}</div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: {LESSON.concept}</p>
                            </div>
                        </div>

                        <div className={styles.explainBox}>
                            <p>Your computer can make choices! 🔀</p>
                            <p style={{ marginTop: '1rem' }}><strong>IF</strong> something is true, do this.</p>
                            <p><strong>ELSE</strong>, do something different.</p>
                            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
                                It's like:<br />
                                IF it's raining, bring umbrella 🌧️☂️<br />
                                ELSE, wear sunglasses 😎
                            </p>
                        </div>

                        <div className={styles.codeSection}>
                            <h3>📝 Example</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>main.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    coins = <span className={styles.number}>100</span>{'\n\n'}
                                    <span className={styles.keyword}>if</span> coins &gt;= <span className={styles.number}>50</span>:{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"You can buy the sword!"</span>){'\n'}
                                    <span className={styles.keyword}>else</span>:{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"You need more coins!"</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>You can buy the sword!</div>
                            </div>
                        </div>

                        <div className={styles.tipBox} style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                            <AlertTriangle size={20} className="text-red-400 flex-shrink-0" />
                            <p><strong>IMPORTANT:</strong> See those spaces before print? That's called INDENT. Press TAB or 4 spaces. The computer needs this!</p>
                        </div>

                        <div className={styles.codeSection}>
                            <h3>🎮 Your Turn!</h3>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} placeholder={'coins = 30\nif coins >= 50:\n    print("Enough!")\nelse:\n    print("Need more!")'} spellCheck={false} style={{ minHeight: '150px' }} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode}><Play size={18} /> Run Code</button>
                            {output && <div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></div>}
                        </div>

                        <div className={styles.challenges}>
                            <h3>🎯 Now You Try:</h3>
                            <ul className={styles.challengeList}>
                                <li><div className={styles.challengeCheck}></div>If score is over 100, print "You win!"</li>
                                <li><div className={styles.challengeCheck}></div>If age is under 13, print "You're a kid!"</li>
                            </ul>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level1/lesson7" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection}>
                        <h2 className={styles.quizTitle}>🧠 Brain Check!</h2>
                        <p className={styles.quizQuestion}>What prints if <code>coins = 30</code>?<br /><br />
                            <code style={{ display: 'block', textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '0.25rem' }}>
                                if coins &gt;= 50:<br />
                                &nbsp;&nbsp;&nbsp;&nbsp;print("Enough!")<br />
                                else:<br />
                                &nbsp;&nbsp;&nbsp;&nbsp;print("Need more!")
                            </code>
                        </p>
                        <div className={styles.quizOptions}>
                            {['Enough!', 'Need more!', 'Nothing'].map((option, idx) => (
                                <button key={idx} onClick={() => !quizChecked && setQuizAnswer(idx)} className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''} ${quizChecked && idx === 1 ? styles.correct : ''} ${quizChecked && quizAnswer === idx && idx !== 1 ? styles.wrong : ''}`} disabled={quizChecked}>{option}</button>
                            ))}
                        </div>
                        {!quizChecked ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswer === null}>Check Answer</button>
                        ) : quizAnswer !== 1 ? (
                            <div className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Hmm, not quite! 🤔</h4>
                                <p>30 is NOT &gt;= 50, so it goes to the else part!</p>
                                <button className={styles.quizBtn} onClick={() => { setQuizChecked(false); setQuizAnswer(null); }} style={{ marginTop: '1rem' }}>Try Again</button>
                            </div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
