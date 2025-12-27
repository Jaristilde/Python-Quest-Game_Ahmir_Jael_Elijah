'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL1_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL1_LESSONS[9]; // Lesson 10

export default function Lesson10() {
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
        const lines = code.trim().split('\n');
        const variables: { [key: string]: string[] } = {};
        let outputLines: string[] = [];
        let i = 0;

        while (i < lines.length) {
            const line = lines[i].trim();

            // List assignment
            const listMatch = line.match(/^(\w+)\s*=\s*\[(.+)\]$/);
            if (listMatch) {
                const items = listMatch[2].match(/["']([^"']+)["']/g);
                if (items) {
                    variables[listMatch[1]] = items.map(it => it.replace(/["']/g, ''));
                }
                i++;
                continue;
            }

            // For loop with range: for i in range(n):
            const rangeMatch = line.match(/^for\s+\w+\s+in\s+range\((\d+)\):$/);
            if (rangeMatch) {
                const count = parseInt(rangeMatch[1]);
                // Get the indented print statement
                if (i + 1 < lines.length) {
                    const bodyLine = lines[i + 1].trim();
                    const printMatch = bodyLine.match(/^print\s*\(["'](.*)["']\)$/);
                    if (printMatch) {
                        for (let j = 0; j < count; j++) {
                            outputLines.push(printMatch[1]);
                        }
                    }
                }
                i += 2;
                continue;
            }

            // For loop with list: for item in list:
            const listLoopMatch = line.match(/^for\s+(\w+)\s+in\s+(\w+):$/);
            if (listLoopMatch) {
                const itemVar = listLoopMatch[1];
                const listName = listLoopMatch[2];
                const list = variables[listName];
                if (list && i + 1 < lines.length) {
                    const bodyLine = lines[i + 1].trim();
                    // Handle f-string print
                    const fPrintMatch = bodyLine.match(/^print\s*\(f["'](.*)["']\)$/);
                    if (fPrintMatch) {
                        for (const item of list) {
                            let result = fPrintMatch[1];
                            result = result.replace(new RegExp(`\\{${itemVar}\\}`, 'g'), item);
                            outputLines.push(result);
                        }
                    }
                    // Handle regular print
                    const printMatch = bodyLine.match(/^print\s*\((\w+)\)$/);
                    if (printMatch && printMatch[1] === itemVar) {
                        for (const item of list) {
                            outputLines.push(item);
                        }
                    }
                }
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
                addXpAndCoins(LESSON.xpReward, 10);
                completeLevel(LESSON.id, LESSON.xpReward, 10, 1, 60);
                setLessonComplete(true);
            }, 1000);
        }
    };

    if (isLoading || !user) return <div className={styles.container}><div className="flex items-center justify-center h-screen text-slate-400">Loading...</div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon}>
                    <Check size={50} className="text-white" />
                </motion.div>
                <h2 className={styles.successTitle}>Lesson Complete!</h2>
                <p className={styles.successMessage}>{LESSON.successMessage}</p>
                <div className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</div>
                <Link href="/level1/lesson11" className={`${styles.navBtn} ${styles.success}`}>
                    Next Lesson <ChevronRight size={18} />
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/level1" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 15</span>
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
                            <p>Don't want to type the same thing 5 times? 🔁</p>
                            <p style={{ marginTop: '1rem' }}>Use a <strong>LOOP</strong>!</p>
                            <p style={{ marginTop: '0.5rem' }}><code>for i in range(5):</code></p>
                            <p style={{ marginTop: '0.25rem' }}><code>&nbsp;&nbsp;&nbsp;&nbsp;print("Hello!")</code></p>
                            <p style={{ marginTop: '1rem' }}>This prints "Hello!" five times!</p>
                            <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}><code>range(5)</code> means: do this 5 times</p>
                        </div>

                        <div className={styles.codeSection}>
                            <h3>📝 Example 1: Repeat with range()</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>main.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    <span className={styles.keyword}>for</span> i <span className={styles.keyword}>in</span> range(<span className={styles.number}>3</span>):{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"I love coding!"</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>I love coding!{'\n'}I love coding!{'\n'}I love coding!</div>
                            </div>
                        </div>

                        <div className={styles.codeSection}>
                            <h3>📝 Example 2: Loop through a list</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>main.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    games = [<span className={styles.string}>"Minecraft"</span>, <span className={styles.string}>"Roblox"</span>, <span className={styles.string}>"Fortnite"</span>]{'\n'}
                                    <span className={styles.keyword}>for</span> game <span className={styles.keyword}>in</span> games:{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(f<span className={styles.string}>"I like {'{'}game{'}'}"</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>I like Minecraft{'\n'}I like Roblox{'\n'}I like Fortnite</div>
                            </div>
                        </div>

                        <div className={styles.codeSection}>
                            <h3>🎮 Your Turn!</h3>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} placeholder={'for i in range(4):\n    print("Level up!")'} spellCheck={false} style={{ minHeight: '120px' }} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode}><Play size={18} /> Run Code</button>
                            {output && <div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></div>}
                        </div>

                        <div className={styles.challenges}>
                            <h3>🎯 Now You Try:</h3>
                            <ul className={styles.challengeList}>
                                <li><div className={styles.challengeCheck}></div>Print "Level up!" 4 times</li>
                                <li><div className={styles.challengeCheck}></div>Make a list of foods and print each one</li>
                            </ul>
                        </div>

                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <p><strong>Remember:</strong> The code inside the loop MUST be indented (use TAB or 4 spaces)!</p>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level1/lesson9" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)}>Final Quiz! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection}>
                        <h2 className={styles.quizTitle}>🧠 Final Brain Check!</h2>
                        <p className={styles.quizQuestion}>How many times does this print "Beep"?<br /><br />
                            <code style={{ display: 'block', textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '0.25rem' }}>
                                for i in range(3):<br />
                                &nbsp;&nbsp;&nbsp;&nbsp;print("Beep")
                            </code>
                        </p>
                        <div className={styles.quizOptions}>
                            {['1 time', '3 times', '0 times'].map((option, idx) => (
                                <button key={idx} onClick={() => !quizChecked && setQuizAnswer(idx)} className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''} ${quizChecked && idx === 1 ? styles.correct : ''} ${quizChecked && quizAnswer === idx && idx !== 1 ? styles.wrong : ''}`} disabled={quizChecked}>{option}</button>
                            ))}
                        </div>
                        {!quizChecked ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswer === null}>Check Answer</button>
                        ) : quizAnswer !== 1 ? (
                            <div className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Hmm, not quite! 🤔</h4>
                                <p><code>range(3)</code> means do it 3 times!</p>
                                <button className={styles.quizBtn} onClick={() => { setQuizChecked(false); setQuizAnswer(null); }} style={{ marginTop: '1rem' }}>Try Again</button>
                            </div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
