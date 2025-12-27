'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Link2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL1_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL1_LESSONS[2]; // Lesson 3

export default function Lesson3() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizChecked, setQuizChecked] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [challengesDone, setChallengesDone] = useState<boolean[]>([false, false, false]);
    const [superchargeCode, setSuperchargeCode] = useState('');
    const [superchargeOutput, setSuperchargeOutput] = useState('');
    const [superchargeDone, setSuperchargeDone] = useState(false);
    const [superchargeXpClaimed, setSuperchargeXpClaimed] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        const lines = code.trim().split('\n');
        const variables: { [key: string]: string } = {};
        let outputLines: string[] = [];

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            // Variable assignment
            const assignMatch = trimmed.match(/^(\w+)\s*=\s*["'](.*)["']$/);
            if (assignMatch) {
                variables[assignMatch[1]] = assignMatch[2];
                continue;
            }

            // Print with concatenation
            const printMatch = trimmed.match(/^print\s*\((.+)\)$/);
            if (printMatch) {
                let content = printMatch[1];
                // Replace variables
                for (const [varName, value] of Object.entries(variables)) {
                    content = content.replace(new RegExp(`\\b${varName}\\b`, 'g'), `"${value}"`);
                }
                // Evaluate string concatenation
                if (content.includes('+')) {
                    const parts = content.split('+').map(p => {
                        const strMatch = p.trim().match(/^["'](.*)["']$/);
                        return strMatch ? strMatch[1] : p.trim();
                    });
                    const result = parts.join('');
                    outputLines.push(result);

                    // Check challenges
                    const newChallenges = [...challengesDone];
                    newChallenges[0] = true;
                    newChallenges[1] = true;
                    if (result.includes(' ')) newChallenges[2] = true;
                    setChallengesDone(newChallenges);
                } else {
                    const strMatch = content.trim().match(/^["'](.*)["']$/);
                    if (strMatch) {
                        outputLines.push(strMatch[1]);
                    }
                }
            }
        }

        setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Try: print("Hello" + " World!")');
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

    const runSupercharge = () => {
        const lines = superchargeCode.trim().split('\n');
        const variables: { [key: string]: string } = {};
        let outputLines: string[] = [];

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            // Variable assignment
            const assignMatch = trimmed.match(/^(\w+)\s*=\s*["'](.*)["']$/);
            if (assignMatch) {
                variables[assignMatch[1]] = assignMatch[2];
                continue;
            }

            // Print with concatenation
            const printMatch = trimmed.match(/^print\s*\((.+)\)$/);
            if (printMatch) {
                let content = printMatch[1];
                for (const [varName, value] of Object.entries(variables)) {
                    content = content.replace(new RegExp(`\\b${varName}\\b`, 'g'), `"${value}"`);
                }
                if (content.includes('+')) {
                    const parts = content.split('+').map(p => {
                        const strMatch = p.trim().match(/^["'](.*)["']$/);
                        return strMatch ? strMatch[1] : p.trim();
                    });
                    outputLines.push(parts.join(''));
                } else {
                    const strMatch = content.trim().match(/^["'](.*)["']$/);
                    if (strMatch) outputLines.push(strMatch[1]);
                }
            }
        }

        const output = outputLines.join('\n');
        setSuperchargeOutput(output);

        // Check if the challenge is complete: must have 3+ variables and use all in one print with spaces
        const varCount = Object.keys(variables).length;
        const hasThreeVars = varCount >= 3;
        const outputHasSpaces = output.includes(' ') && output.split(' ').length >= 3;

        if (hasThreeVars && outputHasSpaces && outputLines.length > 0) {
            setSuperchargeDone(true);
        }
    };

    const claimSuperchargeXp = () => {
        if (!superchargeXpClaimed && superchargeDone) {
            addXpAndCoins(25, 0);
            setSuperchargeXpClaimed(true);
        }
    };

    if (isLoading || !user) {
        return (
            <div className={styles.container}>
                <div className="flex items-center justify-center h-screen">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ fontSize: '3rem' }}>🔗</motion.div>
                </div>
            </div>
        );
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', duration: 0.8 }} className={styles.successIcon}>
                    <Check size={50} className="text-white" />
                </motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle}>🎉 WORD SMOOSHER! 🎉</motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                    <Link href="/level1/lesson4" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link>
                </motion.div>
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
                            <motion.div className={styles.lessonEmoji} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>{LESSON.emoji}</motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: <code>String Concatenation (+)</code></p>
                            </div>
                        </div>

                        {/* Story */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(59, 130, 246, 0.15))' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Link2 size={28} className="text-green-400" />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Mission: Build a Sentence!</span>
                            </div>
                            <p>
                                Ever made friendship bracelets by connecting beads? Or linked train cars together? 🚂
                            </p>
                            <p style={{ marginTop: '0.75rem' }}>
                                In Python, we can <strong>smoosh words together</strong> using the <code>+</code> sign!
                            </p>
                        </motion.div>

                        {/* Explanation */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Sparkles size={20} className="text-amber-400" /> How Word Smooshing Works
                            </h3>

                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', margin: '1rem 0', fontFamily: 'monospace', fontSize: '1.1rem', textAlign: 'center' }}>
                                <span style={{ color: '#50fa7b' }}>"Hello"</span>
                                <span style={{ color: '#ff79c6' }}> + </span>
                                <span style={{ color: '#50fa7b' }}>"World"</span>
                                <span style={{ color: '#f8f8f2' }}> = </span>
                                <span style={{ color: '#8be9fd' }}>"HelloWorld"</span>
                            </div>

                            <p style={{ marginTop: '1rem' }}>
                                The <code>+</code> sign with text doesn't do math - it <strong>glues words together</strong>!
                            </p>

                            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(251, 191, 36, 0.15)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '0.5rem' }}>
                                <p style={{ margin: 0 }}>
                                    ⚠️ <strong>Watch out!</strong> Words smoosh with NO space! Want a space? Add it: <code>"Hello " + "World"</code>
                                </p>
                            </div>
                        </div>

                        {/* Examples */}
                        <div className={styles.codeSection}>
                            <h3>📝 Examples</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>main.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># No space - words stick together</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"Super"</span> + <span className={styles.string}>"Star"</span>){'\n\n'}
                                    <span className={styles.comment}># Add a space with " "</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"Super"</span> + <span className={styles.string}>" "</span> + <span className={styles.string}>"Star"</span>){'\n\n'}
                                    <span className={styles.comment}># Use variables!</span>{'\n'}
                                    name = <span className={styles.string}>"Alex"</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"Hi "</span> + name + <span className={styles.string}>"!"</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>SuperStar{'\n'}Super Star{'\n'}Hi Alex!</div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3>🎮 Your Turn - Smoosh Some Words!</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                Use + to connect words together. Remember to add spaces if you want them!
                            </p>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} placeholder={'print("I " + "love " + "coding!")'} spellCheck={false} style={{ minHeight: '100px' }} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode}><Play size={18} /> Run Code</button>
                            {output && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.outputBox}>
                                    <div className={styles.outputLabel}>✨ Output:</div>
                                    <div className={styles.outputText}>{output}</div>
                                </motion.div>
                            )}
                        </div>

                        {/* Challenges */}
                        <div className={styles.challenges}>
                            <h3>🎯 Mini Challenges:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${challengesDone[0] ? styles.done : ''}`}>{challengesDone[0] && <Check size={14} />}</div>
                                    Use the + sign to combine text
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${challengesDone[1] ? styles.done : ''}`}>{challengesDone[1] && <Check size={14} />}</div>
                                    Print your smooshed words
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${challengesDone[2] ? styles.done : ''}`}>{challengesDone[2] && <Check size={14} />}</div>
                                    Include a space between words
                                </li>
                            </ul>
                        </div>

                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Fun Ideas to Try:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li>Make a greeting: <code>"Hello " + "friend!"</code></li>
                                    <li>Create a silly word: <code>"Mega" + "Awesome" + "Sauce"</code></li>
                                    <li>Build your gamer tag: <code>"Pro_" + "Gamer" + "_123"</code></li>
                                </ul>
                            </div>
                        </div>

                        {/* SUPERCHARGE Bonus Challenge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            style={{
                                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.25))',
                                border: '2px solid rgba(251, 191, 36, 0.4)',
                                borderRadius: 'var(--radius)',
                                padding: '1.5rem',
                                marginTop: '2rem'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <motion.span
                                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{ fontSize: '1.5rem' }}
                                >⚡</motion.span>
                                <div>
                                    <h3 style={{ margin: 0, color: '#fbbf24', fontWeight: 800 }}>SUPERCHARGE - Bonus Challenge</h3>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Optional • +25 XP • Not required to advance</p>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                                <p style={{ margin: 0, fontWeight: 600, marginBottom: '0.5rem' }}>🎯 The Challenge:</p>
                                <p style={{ margin: 0 }}>
                                    Create a <strong>superhero introduction</strong> using <strong>3 different variables</strong> and concatenate them into one sentence with spaces!
                                </p>
                                <p style={{ margin: '0.75rem 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    Example output: <code>"I am Super Lightning from Gotham City!"</code>
                                </p>
                            </div>

                            <div className={styles.editor}>
                                <div className={styles.codeHeader}>
                                    <span>supercharge.py</span>
                                    <span style={{ color: '#fbbf24' }}>⚡ BONUS</span>
                                </div>
                                <textarea
                                    value={superchargeCode}
                                    onChange={(e) => setSuperchargeCode(e.target.value)}
                                    placeholder={'# Create 3 variables for your hero!\nhero_name = "Super Lightning"\npower = "speed"\ncity = "Metro City"\n\n# Combine them all in one print!\nprint("I am " + hero_name + " with " + power + " from " + city + "!")'}
                                    spellCheck={false}
                                    style={{ minHeight: '140px' }}
                                />
                            </div>

                            <button
                                className={styles.runBtn}
                                onClick={runSupercharge}
                                style={{ background: superchargeDone ? '#10b981' : '#f59e0b' }}
                            >
                                <Play size={18} /> {superchargeDone ? 'Challenge Complete!' : 'Test Supercharge'}
                            </button>

                            {superchargeOutput && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={styles.outputBox}
                                    style={{ borderColor: superchargeDone ? 'rgba(16, 185, 129, 0.5)' : undefined }}
                                >
                                    <div className={styles.outputLabel}>{superchargeDone ? '⚡ SUPERCHARGED!' : '✨ Output:'}</div>
                                    <div className={styles.outputText}>{superchargeOutput}</div>
                                </motion.div>
                            )}

                            {superchargeDone && !superchargeXpClaimed && (
                                <motion.button
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    onClick={claimSuperchargeXp}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        width: '100%',
                                        padding: '1rem',
                                        marginTop: '1rem',
                                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                        border: 'none',
                                        borderRadius: 'var(--radius)',
                                        color: 'white',
                                        fontWeight: 700,
                                        fontSize: '1.1rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Zap size={20} fill="currentColor" /> Claim +25 Bonus XP!
                                </motion.button>
                            )}

                            {superchargeXpClaimed && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        padding: '1rem',
                                        marginTop: '1rem',
                                        background: 'rgba(16, 185, 129, 0.2)',
                                        border: '1px solid rgba(16, 185, 129, 0.4)',
                                        borderRadius: 'var(--radius)',
                                        color: '#10b981',
                                        fontWeight: 600
                                    }}
                                >
                                    <Check size={20} /> +25 XP Claimed! You're a superstar! ⭐
                                </motion.div>
                            )}
                        </motion.div>

                        <div className={styles.navBar}>
                            <Link href="/level1/lesson2" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection}>
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧠</motion.div>
                        <h2 className={styles.quizTitle}>Brain Check!</h2>
                        <p className={styles.quizQuestion}>
                            What does <code>print("Game" + "Over")</code> show?
                        </p>
                        <div className={styles.quizOptions}>
                            {['Game Over', 'GameOver', 'Game + Over'].map((option, idx) => (
                                <button key={idx} onClick={() => !quizChecked && setQuizAnswer(idx)} className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''} ${quizChecked && idx === 1 ? styles.correct : ''} ${quizChecked && quizAnswer === idx && idx !== 1 ? styles.wrong : ''}`} disabled={quizChecked}>{option}</button>
                            ))}
                        </div>
                        {!quizChecked ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswer === null}>Check Answer</button>
                        ) : quizAnswer !== 1 ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite! 🤔</h4>
                                <p>{quizAnswer === 0 ? 'There\'s no space - words smoosh right together!' : 'The + sign doesn\'t show up - it just glues words!'}</p>
                                <button className={styles.quizBtn} onClick={() => { setQuizChecked(false); setQuizAnswer(null); }} style={{ marginTop: '1rem' }}>Try Again</button>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
