'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Dice5, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL6_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL6_LESSONS[2]; // Lesson 3
const LESSON_ID = 78;

export default function Lesson3() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('import random\n\n# Roll a dice!\ndice = random.randint(1, 6)\nprint(dice)\n');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasUsedRandint, setHasUsedRandint] = useState(false);
    const [hasUsedChoice, setHasUsedChoice] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            let hasRandom = false;
            let variables: Record<string, { type: string; value: unknown }> = {};

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || trimmed === '') continue;

                // Import statement
                if (trimmed.match(/^import\s+random$/)) {
                    hasRandom = true;
                    continue;
                }

                if (!hasRandom && trimmed.includes('random.')) {
                    outputLines.push("Error: You need to 'import random' first!");
                    break;
                }

                // Variable assignment with randint
                const randintAssignMatch = trimmed.match(/^(\w+)\s*=\s*random\.randint\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)$/);
                if (randintAssignMatch && hasRandom) {
                    const varName = randintAssignMatch[1];
                    const min = parseInt(randintAssignMatch[2]);
                    const max = parseInt(randintAssignMatch[3]);
                    const value = Math.floor(Math.random() * (max - min + 1)) + min;
                    variables[varName] = { type: 'number', value };
                    setHasUsedRandint(true);
                    continue;
                }

                // Print variable
                const printVarMatch = trimmed.match(/^print\s*\(\s*(\w+)\s*\)$/);
                if (printVarMatch && variables[printVarMatch[1]]) {
                    outputLines.push(String(variables[printVarMatch[1]].value));
                    continue;
                }

                // Print randint directly
                const printRandintMatch = trimmed.match(/^print\s*\(\s*random\.randint\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)\s*\)$/);
                if (printRandintMatch && hasRandom) {
                    const min = parseInt(printRandintMatch[1]);
                    const max = parseInt(printRandintMatch[2]);
                    outputLines.push(String(Math.floor(Math.random() * (max - min + 1)) + min));
                    setHasUsedRandint(true);
                    continue;
                }

                // List assignment
                const listMatch = trimmed.match(/^(\w+)\s*=\s*\[(.+)\]$/);
                if (listMatch) {
                    const varName = listMatch[1];
                    const items = listMatch[2].split(',').map(item => {
                        const t = item.trim();
                        if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
                            return t.slice(1, -1);
                        }
                        return isNaN(Number(t)) ? t : Number(t);
                    });
                    variables[varName] = { type: 'list', value: items };
                    continue;
                }

                // Variable assignment with choice
                const choiceAssignMatch = trimmed.match(/^(\w+)\s*=\s*random\.choice\s*\(\s*(\w+)\s*\)$/);
                if (choiceAssignMatch && hasRandom) {
                    const varName = choiceAssignMatch[1];
                    const listName = choiceAssignMatch[2];
                    if (variables[listName] && variables[listName].type === 'list') {
                        const list = variables[listName].value as unknown[];
                        const choice = list[Math.floor(Math.random() * list.length)];
                        variables[varName] = { type: typeof choice === 'string' ? 'string' : 'number', value: choice };
                        setHasUsedChoice(true);
                    }
                    continue;
                }

                // Print choice directly
                const printChoiceMatch = trimmed.match(/^print\s*\(\s*random\.choice\s*\(\s*(\w+)\s*\)\s*\)$/);
                if (printChoiceMatch && hasRandom) {
                    const listName = printChoiceMatch[1];
                    if (variables[listName] && variables[listName].type === 'list') {
                        const list = variables[listName].value as unknown[];
                        outputLines.push(String(list[Math.floor(Math.random() * list.length)]));
                        setHasUsedChoice(true);
                    }
                    continue;
                }

                // Print choice with inline list
                const printChoiceInlineMatch = trimmed.match(/^print\s*\(\s*random\.choice\s*\(\s*\[(.+)\]\s*\)\s*\)$/);
                if (printChoiceInlineMatch && hasRandom) {
                    const items = printChoiceInlineMatch[1].split(',').map(item => {
                        const t = item.trim();
                        if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
                            return t.slice(1, -1);
                        }
                        return isNaN(Number(t)) ? t : Number(t);
                    });
                    outputLines.push(String(items[Math.floor(Math.random() * items.length)]));
                    setHasUsedChoice(true);
                    continue;
                }

                // Regular print
                const printMatch = trimmed.match(/^print\s*\(["'](.*)["']\)$/);
                if (printMatch) {
                    outputLines.push(printMatch[1]);
                    continue;
                }
            }

            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code to see output!');
        } catch {
            setOutput('Error! Check your code syntax.');
        }
    };

    const checkQuiz = () => {
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = true;
        setQuizChecked(newChecked);

        // Correct answers: Q1 = 1 (randint), Q2 = 2 (random.choice)
        const correctAnswers = [1, 2];

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
        return (
            <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
                <div className="flex items-center justify-center h-screen">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ fontSize: '3rem' }}>🎲</motion.div>
                </div>
            </div>
        );
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'rgba(0, 0, 0, 0.95)' }}>
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', duration: 0.8 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                    <Check size={50} className="text-white" />
                </motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle} style={{ color: '#3b82f6' }}>
                    Randomness Master! {LESSON.emoji}
                </motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>
                    {LESSON.successMessage}
                </motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className={styles.successXp}>
                    <Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                    <Link href="/level6/lesson4" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                        Next Lesson <ChevronRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
            <header className={styles.header} style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid #3b82f6' }}>
                <Link href="/level6" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 9</span>
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
                            <motion.div className={styles.lessonEmoji} animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }} style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))' }}>
                                {LESSON.emoji}
                            </motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1 style={{ color: '#3b82f6' }}>{LESSON.title}</h1>
                                <p>Learn: <code style={{ color: '#8b5cf6' }}>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Story Introduction */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))', borderColor: '#3b82f6' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Dice5 size={28} style={{ color: '#3b82f6' }} />
                                <Sparkles size={24} style={{ color: '#8b5cf6' }} />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#3b82f6' }}>Time for RANDOM FUN!</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '0.75rem', marginBottom: '1rem' }}>
                                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }} style={{ fontSize: '3rem', marginRight: '1rem' }}>🎲</motion.div>
                                <div style={{ textAlign: 'left' }}>
                                    <p style={{ fontWeight: 700, color: '#3b82f6', marginBottom: '0.25rem' }}>The random module adds surprise!</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Roll dice, pick cards, shuffle lists!</p>
                                </div>
                            </div>

                            <p>
                                Games need randomness! The <code style={{ color: '#8b5cf6' }}>random</code> module lets you
                                pick random numbers, make random choices, and shuffle things up!
                            </p>
                        </motion.div>

                        {/* Random Functions */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: '#8b5cf6' }}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6' }}>
                                <Lightbulb size={20} style={{ color: '#8b5cf6' }} /> Fun Random Functions
                            </h3>

                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <span style={{ fontSize: '1.25rem' }}>🎲</span>
                                        <code style={{ color: '#3b82f6', fontWeight: 700 }}>random.randint(1, 6)</code>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Random integer between 1 and 6 (like a dice!)</p>
                                </div>

                                <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <span style={{ fontSize: '1.25rem' }}>🎯</span>
                                        <code style={{ color: '#8b5cf6', fontWeight: 700 }}>random.choice(list)</code>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Pick a random item from a list!</p>
                                </div>

                                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <span style={{ fontSize: '1.25rem' }}>🔀</span>
                                        <code style={{ color: '#3b82f6', fontWeight: 700 }}>random.shuffle(list)</code>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Mix up a list randomly (like shuffling cards!)</p>
                                </div>
                            </div>
                        </div>

                        {/* Example Code */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: '#8b5cf6' }}>Example: Dice Rolling Game</h3>
                            <div className={styles.codeBlock} style={{ borderColor: '#3b82f6' }}>
                                <div className={styles.codeHeader}><span>main.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    <span style={{ color: '#ff79c6' }}>import</span> random{'\n\n'}
                                    <span className={styles.comment}># Roll a dice (1-6)</span>{'\n'}
                                    dice = random.randint(1, 6){'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"You rolled:"</span>, dice){'\n\n'}
                                    <span className={styles.comment}># Pick a random snack</span>{'\n'}
                                    snacks = [<span className={styles.string}>"chips"</span>, <span className={styles.string}>"cookies"</span>, <span className={styles.string}>"fruit"</span>]{'\n'}
                                    pick = random.choice(snacks){'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"Snack:"</span>, pick)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output (changes each time!):</div>
                                <div className={styles.outputText}>You rolled: 4{'\n'}Snack: cookies</div>
                            </div>
                        </div>

                        {/* Real World Examples */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: '#3b82f6' }}>
                            <h3 style={{ marginBottom: '1rem', color: '#3b82f6' }}>Real World Uses!</h3>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>🎮</span>
                                    <span><strong>Video Games:</strong> Random loot drops, enemy spawns</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '0.5rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>🎰</span>
                                    <span><strong>Games of Chance:</strong> Lottery numbers, card games</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>🤖</span>
                                    <span><strong>AI Chatbots:</strong> Random responses for variety</span>
                                </div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: '#8b5cf6' }}>Your Turn - Roll Some Dice!</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                Try randint for dice and choice for picking items!
                            </p>
                            <div className={styles.editor} style={{ borderColor: '#3b82f6' }}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '150px' }} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                <Play size={18} /> Run Code
                            </button>

                            {output && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.outputBox}>
                                    <div className={styles.outputLabel}>Output:</div>
                                    <div className={styles.outputText}>{output}</div>
                                </motion.div>
                            )}
                        </div>

                        {/* Challenges */}
                        <div className={styles.challenges} style={{ background: 'var(--bg-secondary)', borderColor: '#3b82f6' }}>
                            <h3 style={{ color: '#3b82f6' }}>Try These Challenges:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasUsedRandint ? styles.done : ''}`}>
                                        {hasUsedRandint && <Check size={14} />}
                                    </div>
                                    Roll a dice with <code style={{ color: '#8b5cf6' }}>random.randint(1, 6)</code>
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasUsedChoice ? styles.done : ''}`}>
                                        {hasUsedChoice && <Check size={14} />}
                                    </div>
                                    Pick a random item with <code style={{ color: '#8b5cf6' }}>random.choice()</code>
                                </li>
                            </ul>
                        </div>

                        {/* Tip */}
                        <div className={styles.tipBox} style={{ background: 'rgba(139, 92, 246, 0.15)', borderColor: '#8b5cf6' }}>
                            <Lightbulb size={20} style={{ color: '#8b5cf6', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#8b5cf6' }}>Quick Reference:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li><code>randint(a, b)</code> - random integer from a to b (inclusive!)</li>
                                    <li><code>choice(list)</code> - picks one random item</li>
                                    <li><code>shuffle(list)</code> - mixes up the list in place</li>
                                    <li>Run code multiple times to see different results!</li>
                                </ul>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className={styles.navBar}>
                            <Link href="/level6/lesson2" className={`${styles.navBtn} ${styles.secondary}`}>
                                <ChevronLeft size={18} /> Previous
                            </Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                Quiz Time! <ChevronRight size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    /* Quiz Section */
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection} style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))', borderColor: '#3b82f6' }}>
                        <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎲</motion.div>
                        <h2 className={styles.quizTitle} style={{ color: '#3b82f6' }}>Brain Check! (Question {currentQuiz + 1}/2)</h2>

                        {currentQuiz === 0 ? (
                            <>
                                <p className={styles.quizQuestion}>Which function gives a random INTEGER between two numbers?</p>
                                <div className={styles.quizOptions}>
                                    {['random.choice()', 'random.randint()', 'random.shuffle()'].map((option, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[0]) { const newAnswers = [...quizAnswers]; newAnswers[0] = idx; setQuizAnswers(newAnswers); } }}
                                            className={`${styles.quizOption} ${quizAnswers[0] === idx ? styles.selected : ''} ${quizChecked[0] && idx === 1 ? styles.correct : ''} ${quizChecked[0] && quizAnswers[0] === idx && idx !== 1 ? styles.wrong : ''}`}
                                            disabled={quizChecked[0]}>
                                            <code>{option}</code>
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>How do you pick a random item from a list?</p>
                                <div className={styles.quizOptions}>
                                    {['random.randint(list)', 'random.shuffle(list)', 'random.choice(list)'].map((option, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[1]) { const newAnswers = [...quizAnswers]; newAnswers[1] = idx; setQuizAnswers(newAnswers); } }}
                                            className={`${styles.quizOption} ${quizAnswers[1] === idx ? styles.selected : ''} ${quizChecked[1] && idx === 2 ? styles.correct : ''} ${quizChecked[1] && quizAnswers[1] === idx && idx !== 2 ? styles.wrong : ''}`}
                                            disabled={quizChecked[1]}>
                                            <code>{option}</code>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {!quizChecked[currentQuiz] ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswers[currentQuiz] === null} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                Check Answer
                            </button>
                        ) : quizAnswers[currentQuiz] !== (currentQuiz === 0 ? 1 : 2) ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>{currentQuiz === 0 ? 'randint() gives a random integer! choice() picks from a list, shuffle() mixes up a list.' : 'choice() picks ONE random item from a list!'}</p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>Try Again</button>
                            </motion.div>
                        ) : currentQuiz === 0 ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${styles.quizFeedback} ${styles.success}`}>
                                <h4>Correct!</h4>
                                <p>randint() is perfect for dice rolls and random numbers! Moving to the next question...</p>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
