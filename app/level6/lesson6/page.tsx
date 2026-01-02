'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Globe, ArrowRightLeft, Server, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL6_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL6_LESSONS[5]; // Lesson 6 (index 5)
const LESSON_ID = 81;

export default function Lesson6() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# Understanding APIs - Like Ordering at a Restaurant!
# Your code makes a REQUEST, the API sends a RESPONSE

# Imagine you're at a restaurant:
# 1. You (the client) look at the menu
# 2. You tell the waiter what you want (REQUEST)
# 3. Kitchen prepares your food (SERVER processes)
# 4. Waiter brings your food (RESPONSE)

# In Python, we use the 'requests' library
# import requests

# Example API request (conceptual):
# response = requests.get("https://api.weather.com/today")
# data = response.json()
# print(data["temperature"])

# Let's simulate an API call!
print("=== Weather API Simulation ===")
print("Sending request to weather API...")
print("Response received!")
print("")
print("Weather data:")
print("  City: New York")
print("  Temperature: 72F")
print("  Condition: Sunny")
`);
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [codeRun, setCodeRun] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || trimmed === '') continue;

                // Simple print statement
                const printMatch = trimmed.match(/^print\s*\(\s*["'](.*)["']\s*\)$/);
                if (printMatch) {
                    outputLines.push(printMatch[1]);
                }
            }

            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code to see output!');
            setCodeRun(true);
        } catch {
            setOutput('Error! Check your code syntax.');
        }
    };

    const checkQuiz = () => {
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = true;
        setQuizChecked(newChecked);
        const correctAnswers = [1, 2]; // Q1=request/response, Q2=json format

        if (quizAnswers[currentQuiz] === correctAnswers[currentQuiz]) {
            if (currentQuiz === 0) {
                setTimeout(() => setCurrentQuiz(1), 1000);
            } else {
                setTimeout(() => {
                    addXpAndCoins(LESSON.xpReward, 10);
                    completeLevel(LESSON_ID, LESSON.xpReward, 10, 1, 60);
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
        return <div className={styles.container} style={{ background: 'var(--bg-primary)' }}><div className="flex items-center justify-center h-screen"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🌐</motion.div></div></div>;
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'rgba(0, 0, 0, 0.95)' }}>
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', duration: 0.8 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                    <Globe size={50} className="text-white" />
                </motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle} style={{ color: '#3b82f6' }}>
                    Connected! 🌐
                </motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>
                    {LESSON.successMessage}
                </motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className={styles.successXp}>
                    <Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                    <Link href="/level6/lesson7" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                        Next Lesson <ChevronRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
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
                        <div className={styles.lessonTitle}>
                            <motion.div className={styles.lessonEmoji} animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>{LESSON.emoji}</motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1 style={{ color: '#3b82f6' }}>{LESSON.title}</h1>
                                <p style={{ color: 'var(--text-muted)' }}>Learn: <code style={{ color: '#8b5cf6' }}>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* API Visual Explanation */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))', border: '2px solid rgba(59, 130, 246, 0.3)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem' }}>
                            <h3 style={{ color: '#3b82f6', marginBottom: '1rem', textAlign: 'center' }}>What is an API?</h3>
                            <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                                <strong style={{ color: '#8b5cf6' }}>API</strong> = Application Programming Interface
                                <br />It's how programs talk to each other!
                            </p>

                            {/* Restaurant Analogy Visual */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <motion.div initial={{ x: -20 }} animate={{ x: 0 }} style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                                    <Smartphone size={32} style={{ color: '#3b82f6', margin: '0 auto 0.5rem' }} />
                                    <div style={{ fontWeight: 700, color: '#3b82f6' }}>You</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(Customer)</div>
                                </motion.div>

                                <motion.div animate={{ x: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                                    <ArrowRightLeft size={24} style={{ color: '#8b5cf6' }} />
                                </motion.div>

                                <motion.div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>🍽️</div>
                                    <div style={{ fontWeight: 700, color: '#8b5cf6' }}>API</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(Waiter)</div>
                                </motion.div>

                                <motion.div animate={{ x: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}>
                                    <ArrowRightLeft size={24} style={{ color: '#8b5cf6' }} />
                                </motion.div>

                                <motion.div initial={{ x: 20 }} animate={{ x: 0 }} style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                                    <Server size={32} style={{ color: '#10b981', margin: '0 auto 0.5rem' }} />
                                    <div style={{ fontWeight: 700, color: '#10b981' }}>Server</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(Kitchen)</div>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Request/Response Explanation */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: '#3b82f6' }}>
                            <h3 style={{ color: '#3b82f6', marginBottom: '1rem' }}>How APIs Work:</h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <motion.div whileHover={{ scale: 1.02 }} style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <span style={{ background: '#3b82f6', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 700 }}>1</span>
                                        <span style={{ fontWeight: 700, color: '#3b82f6' }}>REQUEST</span>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        Your code asks for something: "Give me today's weather"
                                    </p>
                                    <code style={{ fontSize: '0.85rem', color: '#50fa7b' }}>requests.get("api.weather.com/today")</code>
                                </motion.div>

                                <motion.div whileHover={{ scale: 1.02 }} style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <span style={{ background: '#8b5cf6', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 700 }}>2</span>
                                        <span style={{ fontWeight: 700, color: '#8b5cf6' }}>PROCESSING</span>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        Server receives request, finds the data you need
                                    </p>
                                </motion.div>

                                <motion.div whileHover={{ scale: 1.02 }} style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <span style={{ background: '#10b981', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 700 }}>3</span>
                                        <span style={{ fontWeight: 700, color: '#10b981' }}>RESPONSE</span>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        Server sends back data (usually in JSON format)
                                    </p>
                                    <code style={{ fontSize: '0.85rem', color: '#50fa7b' }}>{"{ \"temp\": 72, \"condition\": \"sunny\" }"}</code>
                                </motion.div>
                            </div>
                        </div>

                        {/* Real World Examples */}
                        <div style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem' }}>
                            <h3 style={{ color: '#8b5cf6', marginBottom: '1rem' }}>Real World API Examples:</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌤️</div>
                                    <div style={{ fontWeight: 600, color: '#3b82f6' }}>Weather Apps</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Get live weather data</div>
                                </div>
                                <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎮</div>
                                    <div style={{ fontWeight: 600, color: '#8b5cf6' }}>Game Leaderboards</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fetch player scores</div>
                                </div>
                                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📱</div>
                                    <div style={{ fontWeight: 600, color: '#10b981' }}>Social Media</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Load posts and comments</div>
                                </div>
                                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛒</div>
                                    <div style={{ fontWeight: 600, color: '#f59e0b' }}>Shopping Apps</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Check product prices</div>
                                </div>
                            </div>
                        </div>

                        {/* Code Editor */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: '#3b82f6' }}>Try It - API Simulation:</h3>
                            <div className={styles.editor} style={{ borderColor: '#3b82f6' }}>
                                <div className={styles.codeHeader}><span>api_example.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '320px' }} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                <Play size={18} /> Run Code
                            </button>
                            {output && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.outputBox}>
                                    <div className={styles.outputLabel}>API Response:</div>
                                    <div className={styles.outputText} style={{ whiteSpace: 'pre-wrap' }}>{output}</div>
                                </motion.div>
                            )}
                        </div>

                        <div className={styles.tipBox} style={{ background: 'rgba(59, 130, 246, 0.15)', borderColor: '#3b82f6' }}>
                            <Lightbulb size={20} style={{ color: '#3b82f6', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, color: '#3b82f6' }}>Remember:</p>
                                <p style={{ fontSize: '0.9rem' }}>
                                    APIs are everywhere! Every time you use an app that shows live data
                                    (weather, news, scores), it's using APIs to fetch that information.
                                </p>
                            </div>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level6/lesson5" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                Quiz Time! <ChevronRight size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection} style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))', borderColor: '#3b82f6' }}>
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌐</motion.div>
                        <h2 className={styles.quizTitle} style={{ color: '#3b82f6' }}>API Quiz! (Question {currentQuiz + 1}/2)</h2>

                        {currentQuiz === 0 ? (
                            <>
                                <p className={styles.quizQuestion}>What are the two main parts of API communication?</p>
                                <div className={styles.quizOptions}>
                                    {['Upload and Download', 'Request and Response', 'Input and Output'].map((opt, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[0]) { const a = [...quizAnswers]; a[0] = idx; setQuizAnswers(a); } }}
                                            className={`${styles.quizOption} ${quizAnswers[0] === idx ? styles.selected : ''} ${quizChecked[0] && idx === 1 ? styles.correct : ''} ${quizChecked[0] && quizAnswers[0] === idx && idx !== 1 ? styles.wrong : ''}`}
                                            disabled={quizChecked[0]}>{opt}</button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>What format do APIs usually send data in?</p>
                                <div className={styles.quizOptions}>
                                    {['Plain text only', 'HTML pages', 'JSON (JavaScript Object Notation)'].map((opt, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[1]) { const a = [...quizAnswers]; a[1] = idx; setQuizAnswers(a); } }}
                                            className={`${styles.quizOption} ${quizAnswers[1] === idx ? styles.selected : ''} ${quizChecked[1] && idx === 2 ? styles.correct : ''} ${quizChecked[1] && quizAnswers[1] === idx && idx !== 2 ? styles.wrong : ''}`}
                                            disabled={quizChecked[1]}>{opt}</button>
                                    ))}
                                </div>
                            </>
                        )}

                        {!quizChecked[currentQuiz] ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswers[currentQuiz] === null} style={{ background: '#3b82f6' }}>Check Answer</button>
                        ) : quizAnswers[currentQuiz] !== (currentQuiz === 0 ? 1 : 2) ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>{currentQuiz === 0 ? 'APIs work with Requests (asking) and Responses (receiving)!' : 'APIs use JSON format - you\'ll learn about it next!'}</p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem', background: '#3b82f6' }}>Try Again</button>
                            </motion.div>
                        ) : currentQuiz === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${styles.quizFeedback} ${styles.success}`}>
                                <h4>Correct!</h4><p>Request and Response - that's how APIs communicate! Next question...</p>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
