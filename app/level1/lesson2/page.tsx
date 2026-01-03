'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Tag, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL1_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL1_LESSONS[1]; // Lesson 2

export default function Lesson2() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizChecked, setQuizChecked] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [challengesDone, setChallengesDone] = useState<boolean[]>([false, false, false]);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    const runCode = () => {
        const lines = code.trim().split('\n');
        const variables: { [key: string]: string } = {};
        let outputLines: string[] = [];
        let hasError = false;

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            // Variable assignment: name = "value"
            const assignMatch = trimmed.match(/^(\w+)\s*=\s*["'](.*)["']$/);
            if (assignMatch) {
                variables[assignMatch[1]] = assignMatch[2];

                // Check challenges
                const newChallenges = [...challengesDone];
                if (assignMatch[1].includes('name') || assignMatch[1].includes('pet')) {
                    newChallenges[0] = true;
                }
                if (assignMatch[1].includes('game') || assignMatch[1].includes('food') || assignMatch[1].includes('color')) {
                    newChallenges[1] = true;
                }
                setChallengesDone(newChallenges);
                continue;
            }

            // Print variable: print(name)
            const printVarMatch = trimmed.match(/^print\s*\((\w+)\)$/);
            if (printVarMatch) {
                const varName = printVarMatch[1];
                if (variables[varName]) {
                    outputLines.push(variables[varName]);
                    // Challenge 3: printed a variable
                    const newChallenges = [...challengesDone];
                    newChallenges[2] = true;
                    setChallengesDone(newChallenges);
                } else {
                    outputLines.push(`Oops! "${varName}" doesn't exist yet. Create it first with: ${varName} = "something"`);
                    hasError = true;
                }
                continue;
            }

            // Print string: print("text")
            const printStrMatch = trimmed.match(/^print\s*\(["'](.*)["']\)$/);
            if (printStrMatch) {
                outputLines.push(printStrMatch[1]);
                continue;
            }

            // Error cases
            if (trimmed.startsWith('print')) {
                outputLines.push('Tip: To print a variable, use print(variable_name) without quotes!');
                hasError = true;
            }
        }

        if (outputLines.length === 0) {
            setOutput('Type some code! Try: pet_name = "Fluffy"');
        } else {
            setOutput(outputLines.join('\n'));
        }
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

    if (isLoading || !user) {
        return (
            <div className={styles.container}>
                <div className="flex items-center justify-center h-screen">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        style={{ fontSize: '3rem' }}
                    >
                        🏷️
                    </motion.div>
                </div>
            </div>
        );
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', duration: 0.8 }}
                    className={styles.successIcon}
                >
                    <Check size={50} className="text-white" />
                </motion.div>
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={styles.successTitle}
                >
                    🎉 VARIABLE MASTER! 🎉
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={styles.successMessage}
                >
                    {LESSON.successMessage}
                </motion.p>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className={styles.successXp}
                >
                    <Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP
                </motion.div>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <Link href="/level1/lesson3" className={`${styles.navBtn} ${styles.primary}`}>
                        Next Lesson <ChevronRight size={18} />
                    </Link>
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
                        {/* Lesson Title */}
                        <div className={styles.lessonTitle}>
                            <motion.div
                                className={styles.lessonEmoji}
                                animate={{ rotate: [-5, 5, -5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                {LESSON.emoji}
                            </motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Story Introduction */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Tag size={28} className="text-pink-400" />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Mission: Name Tag Factory!</span>
                            </div>
                            <p>
                                Imagine you have a pet goldfish. Instead of saying "my goldfish" every time,
                                you give it a name like "Bubbles"! 🐟
                            </p>
                            <p style={{ marginTop: '0.75rem' }}>
                                <strong>Variables</strong> work the same way - they're nicknames for things your computer remembers!
                            </p>
                        </motion.div>

                        {/* Main Explanation */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Sparkles size={20} className="text-amber-400" /> How Variables Work
                            </h3>

                            <div style={{
                                background: 'rgba(0,0,0,0.3)',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                margin: '1rem 0',
                                fontFamily: 'monospace',
                                fontSize: '1.1rem',
                                textAlign: 'center'
                            }}>
                                <span style={{ color: '#f8f8f2' }}>pet_name</span>
                                <span style={{ color: '#ff79c6' }}> = </span>
                                <span style={{ color: '#50fa7b' }}>"Bubbles"</span>
                            </div>

                            <div style={{ marginTop: '1rem' }}>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Breaking it down:</p>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <span>🏷️</span>
                                        <span><code style={{ color: '#f8f8f2' }}>pet_name</code> = the nickname (variable name)</span>
                                    </li>
                                    <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <span>👉</span>
                                        <span><code style={{ color: '#ff79c6' }}>=</code> = means "remember this as" (not equals in math!)</span>
                                    </li>
                                    <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <span>📦</span>
                                        <span><code style={{ color: '#50fa7b' }}>"Bubbles"</code> = the value being stored</span>
                                    </li>
                                </ul>
                            </div>

                            <div style={{
                                marginTop: '1rem',
                                padding: '0.75rem',
                                background: 'rgba(16, 185, 129, 0.15)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: '0.5rem'
                            }}>
                                <p style={{ margin: 0 }}>
                                    💡 <strong>Think of it like:</strong> "Hey computer, whenever I say <code>pet_name</code>, I mean Bubbles!"
                                </p>
                            </div>
                        </div>

                        {/* Example Code */}
                        <div className={styles.codeSection}>
                            <h3>📝 Examples</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>main.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># Create a variable for your pet's name</span>{'\n'}
                                    pet_name = <span className={styles.string}>"Fluffy"</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(pet_name){'\n\n'}
                                    <span className={styles.comment}># Store your favorite game</span>{'\n'}
                                    fave_game = <span className={styles.string}>"Roblox"</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(fave_game){'\n\n'}
                                    <span className={styles.comment}># Your age (as text for now!)</span>{'\n'}
                                    my_age = <span className={styles.string}>"10"</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(my_age)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>Fluffy{'\n'}Roblox{'\n'}10</div>
                            </div>
                        </div>

                        {/* Important Rule */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(249, 115, 22, 0.15))',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: 'var(--radius)',
                            padding: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                🚨 Important Rule!
                            </h4>
                            <p style={{ margin: 0 }}>
                                Variable names can't have <strong>spaces</strong>! Use underscores instead:
                            </p>
                            <div style={{ marginTop: '0.5rem', fontFamily: 'monospace' }}>
                                <span style={{ color: '#ef4444' }}>❌ my name</span> → <span style={{ color: '#10b981' }}>✅ my_name</span><br/>
                                <span style={{ color: '#ef4444' }}>❌ favorite food</span> → <span style={{ color: '#10b981' }}>✅ favorite_food</span>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3>🎮 Your Turn - Create Your Own Variables!</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                Create a variable and then print it. Try naming your favorite things!
                            </p>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder={'my_pet = "Max"\nprint(my_pet)'}
                                    spellCheck={false}
                                    style={{ minHeight: '100px' }}
                                />
                            </div>
                            <button className={styles.runBtn} onClick={runCode}><Play size={18} /> Run Code</button>
                            {output && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={styles.outputBox}
                                >
                                    <div className={styles.outputLabel}>
                                        {output.includes('Oops') || output.includes('Tip') ? '❌ Oops:' : '✨ Output:'}
                                    </div>
                                    <div className={`${styles.outputText} ${output.includes('Oops') || output.includes('Tip') ? 'error' : ''}`}>
                                        {output}
                                    </div>
                                    {(output.includes('Oops') || output.includes('Tip')) && (
                                        <motion.button
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            onClick={() => setOutput('')}
                                            style={{
                                                marginTop: '1rem',
                                                padding: '0.75rem 1.5rem',
                                                background: 'linear-gradient(135deg, #f97316, #ef4444)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            💪 Try Again - You've got this!
                                        </motion.button>
                                    )}
                                </motion.div>
                            )}
                        </div>

                        {/* Mini Challenges */}
                        <div className={styles.challenges}>
                            <h3>🎯 Mini Challenges:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${challengesDone[0] ? styles.done : ''}`}>
                                        {challengesDone[0] && <Check size={14} />}
                                    </div>
                                    Create a variable with "name" or "pet" in it
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${challengesDone[1] ? styles.done : ''}`}>
                                        {challengesDone[1] && <Check size={14} />}
                                    </div>
                                    Store your favorite game, food, or color
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${challengesDone[2] ? styles.done : ''}`}>
                                        {challengesDone[2] && <Check size={14} />}
                                    </div>
                                    Print a variable (without quotes around the name!)
                                </li>
                            </ul>
                        </div>

                        {/* Tips */}
                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Pro Tips:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li>Use descriptive names: <code>pet_name</code> is better than <code>x</code></li>
                                    <li>When printing a variable, don't use quotes: <code>print(pet_name)</code></li>
                                    <li>You can change a variable anytime: <code>pet_name = "New Name"</code></li>
                                </ul>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className={styles.navBar}>
                            <Link href="/level1/lesson1" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection}>
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ fontSize: '3rem', marginBottom: '1rem' }}
                        >
                            🧠
                        </motion.div>
                        <h2 className={styles.quizTitle}>Brain Check!</h2>
                        <p className={styles.quizQuestion}>
                            If I write: <code>pet = "Hamster"</code><br/>
                            Then: <code>print(pet)</code><br/><br/>
                            What appears on screen?
                        </p>
                        <div className={styles.quizOptions}>
                            {['pet', 'Hamster', '"Hamster"'].map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => !quizChecked && setQuizAnswer(idx)}
                                    className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''} ${quizChecked && idx === 1 ? styles.correct : ''} ${quizChecked && quizAnswer === idx && idx !== 1 ? styles.wrong : ''}`}
                                    disabled={quizChecked}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                        {!quizChecked ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswer === null}>Check Answer</button>
                        ) : quizAnswer !== 1 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.quizFeedback} ${styles.error}`}
                            >
                                <h4>Not quite! 🤔</h4>
                                <p>
                                    {quizAnswer === 0
                                        ? 'We print the VALUE inside the variable, not the variable name!'
                                        : 'The quotes are just wrapping - they don\'t appear in the output!'}
                                </p>
                                <button className={styles.quizBtn} onClick={() => { setQuizChecked(false); setQuizAnswer(null); }} style={{ marginTop: '1rem' }}>Try Again</button>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
