'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL1_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL1_LESSONS[8]; // Lesson 9

export default function Lesson9() {
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

        for (const line of lines) {
            const trimmed = line.trim();

            // List assignment: name = ["a", "b", "c"]
            const listMatch = trimmed.match(/^(\w+)\s*=\s*\[(.+)\]$/);
            if (listMatch) {
                const items = listMatch[2].match(/["']([^"']+)["']/g);
                if (items) {
                    variables[listMatch[1]] = items.map(i => i.replace(/["']/g, ''));
                }
                continue;
            }

            // Print list item: print(list[0])
            const printIdxMatch = trimmed.match(/^print\s*\((\w+)\[(\d+)\]\)$/);
            if (printIdxMatch) {
                const list = variables[printIdxMatch[1]];
                const idx = parseInt(printIdxMatch[2]);
                if (list && list[idx] !== undefined) {
                    outputLines.push(list[idx]);
                } else {
                    outputLines.push('Error: Index out of range!');
                }
                continue;
            }

            // Print list: print(list)
            const printListMatch = trimmed.match(/^print\s*\((\w+)\)$/);
            if (printListMatch && variables[printListMatch[1]]) {
                outputLines.push('[' + variables[printListMatch[1]].map(i => `"${i}"`).join(', ') + ']');
            }
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
                <Link href="/level1/lesson10" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link>
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
                            <p>Want to remember more than one thing? 📝</p>
                            <p style={{ marginTop: '1rem' }}>Make a <strong>LIST</strong>!</p>
                            <p style={{ marginTop: '0.5rem' }}>Use <code>[square brackets]</code> and commas:</p>
                            <p style={{ marginTop: '0.5rem' }}><code>friends = ["Ahmir", "Jael", "Elijah"]</code></p>
                            <p style={{ marginTop: '1rem' }}>
                                To get one friend, use their number:<br />
                                <code>print(friends[0])</code> → First one: Ahmir<br />
                                <code>print(friends[1])</code> → Second one: Jael
                            </p>
                        </div>

                        <div className={styles.tipBox} style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                            <AlertTriangle size={20} className="text-red-400 flex-shrink-0" />
                            <p><strong>Weird but true:</strong> Computers start counting at <code>0</code>, not 1! So the first item is <code>[0]</code>.</p>
                        </div>

                        <div className={styles.codeSection}>
                            <h3>📝 Example</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>main.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    colors = [<span className={styles.string}>"red"</span>, <span className={styles.string}>"blue"</span>, <span className={styles.string}>"green"</span>]{'\n'}
                                    <span className={styles.keyword}>print</span>(colors[<span className={styles.number}>0</span>]){'\n'}
                                    <span className={styles.keyword}>print</span>(colors[<span className={styles.number}>2</span>])
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>red{'\n'}green</div>
                            </div>
                        </div>

                        <div className={styles.codeSection}>
                            <h3>🎮 Your Turn!</h3>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} placeholder={'games = ["Minecraft", "Roblox", "Fortnite"]\nprint(games[1])'} spellCheck={false} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode}><Play size={18} /> Run Code</button>
                            {output && <div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></div>}
                        </div>

                        <div className={styles.challenges}>
                            <h3>🎯 Now You Try:</h3>
                            <ul className={styles.challengeList}>
                                <li><div className={styles.challengeCheck}></div>Make a list of 3 games you like</li>
                                <li><div className={styles.challengeCheck}></div>Print the second game (remember: that's number 1!)</li>
                            </ul>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level1/lesson8" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection}>
                        <h2 className={styles.quizTitle}>🧠 Brain Check!</h2>
                        <p className={styles.quizQuestion}>In the list <code>snacks = ["chips", "candy", "fruit"]</code>, what is <code>snacks[0]</code>?</p>
                        <div className={styles.quizOptions}>
                            {['candy', 'chips', 'fruit'].map((option, idx) => (
                                <button key={idx} onClick={() => !quizChecked && setQuizAnswer(idx)} className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''} ${quizChecked && idx === 1 ? styles.correct : ''} ${quizChecked && quizAnswer === idx && idx !== 1 ? styles.wrong : ''}`} disabled={quizChecked}>{option}</button>
                            ))}
                        </div>
                        {!quizChecked ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswer === null}>Check Answer</button>
                        ) : quizAnswer !== 1 ? (
                            <div className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Hmm, not quite! 🤔</h4>
                                <p>Remember: Lists start at 0! So <code>[0]</code> is the first item: chips!</p>
                                <button className={styles.quizBtn} onClick={() => { setQuizChecked(false); setQuizAnswer(null); }} style={{ marginTop: '1rem' }}>Try Again</button>
                            </div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
