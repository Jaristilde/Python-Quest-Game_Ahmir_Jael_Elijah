'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL7_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL7_LESSONS[5];
const LESSON_ID = 90;

export default function Lesson6() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# String Operations Practice!

# Challenge 1: Slice to get first 5 letters
text = "Programming"
first_five = text[0:5]
print(first_five)

# Challenge 2: Convert to uppercase
message = "hello world"
shouting = message.upper()
print(shouting)

# Challenge 3: Replace a word
sentence = "I love pizza"
new_sentence = sentence.replace("pizza", "coding")
print(new_sentence)

# Challenge 4: Split into words
phrase = "Python is awesome"
words = phrase.split()
print(words)

# Challenge 5: Join with dashes
joined = "-".join(words)
print(joined)
`);
    const [output, setOutput] = useState('');
    const [challengesComplete, setChallengesComplete] = useState<boolean[]>([false, false, false, false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [supercharged, setSupercharged] = useState(false);

    const challenges = [
        { id: 1, title: "Slice text", check: (code: string) => /\w+\[\d+:\d+\]/.test(code) },
        { id: 2, title: "Use .upper()", check: (code: string) => /\.upper\(\)/.test(code) },
        { id: 3, title: "Use .replace()", check: (code: string) => /\.replace\(/.test(code) },
        { id: 4, title: "Use .split()", check: (code: string) => /\.split\(/.test(code) },
        { id: 5, title: "Use .join()", check: (code: string) => /\.join\(/.test(code) },
    ];

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

                const sliceAssign = trimmed.match(/^(\w+)\s*=\s*(\w+)\[(\d+):(\d+)\]$/);
                if (sliceAssign && typeof variables[sliceAssign[2]] === 'string') {
                    variables[sliceAssign[1]] = (variables[sliceAssign[2]] as string).slice(parseInt(sliceAssign[3]), parseInt(sliceAssign[4]));
                    continue;
                }

                const upperAssign = trimmed.match(/^(\w+)\s*=\s*(\w+)\.upper\(\)$/);
                if (upperAssign && typeof variables[upperAssign[2]] === 'string') {
                    variables[upperAssign[1]] = (variables[upperAssign[2]] as string).toUpperCase();
                    continue;
                }

                const lowerAssign = trimmed.match(/^(\w+)\s*=\s*(\w+)\.lower\(\)$/);
                if (lowerAssign && typeof variables[lowerAssign[2]] === 'string') {
                    variables[lowerAssign[1]] = (variables[lowerAssign[2]] as string).toLowerCase();
                    continue;
                }

                const replaceAssign = trimmed.match(/^(\w+)\s*=\s*(\w+)\.replace\(["'](.*)["'],\s*["'](.*)["']\)$/);
                if (replaceAssign && typeof variables[replaceAssign[2]] === 'string') {
                    variables[replaceAssign[1]] = (variables[replaceAssign[2]] as string).split(replaceAssign[3]).join(replaceAssign[4]);
                    continue;
                }

                const splitAssign = trimmed.match(/^(\w+)\s*=\s*(\w+)\.split\(\)$/);
                if (splitAssign && typeof variables[splitAssign[2]] === 'string') {
                    variables[splitAssign[1]] = (variables[splitAssign[2]] as string).split(/\s+/);
                    continue;
                }

                const joinAssign = trimmed.match(/^(\w+)\s*=\s*["'](.*)["']\.join\((\w+)\)$/);
                if (joinAssign && Array.isArray(variables[joinAssign[3]])) {
                    variables[joinAssign[1]] = (variables[joinAssign[3]] as string[]).join(joinAssign[2]);
                    continue;
                }

                const printVar = trimmed.match(/^print\s*\(\s*(\w+)\s*\)$/);
                if (printVar && variables[printVar[1]] !== undefined) {
                    const val = variables[printVar[1]];
                    outputLines.push(Array.isArray(val) ? `[${val.map(v => `'${v}'`).join(', ')}]` : String(val));
                }
            }

            const newComplete = challenges.map(c => c.check(code));
            setChallengesComplete(newComplete);

            if (newComplete.every(c => c) && !lessonComplete) {
                setSupercharged(true);
                setTimeout(() => {
                    addXpAndCoins(LESSON.xpReward, 10);
                    completeLevel(LESSON_ID, LESSON.xpReward, 10, 1, 90);
                    setLessonComplete(true);
                }, 1500);
            }

            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code!');
        } catch { setOutput('Error!'); }
    };

    if (isLoading || !user) return <div className={styles.container}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>💪</motion.div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}><Trophy size={50} /></motion.div>
                <motion.h2 className={styles.successTitle} style={{ color: '#f59e0b' }}>SUPERCHARGED! 💪</motion.h2>
                <motion.p className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div className={styles.successXp} style={{ background: 'rgba(245, 158, 11, 0.2)' }}><Zap size={20} /> +{LESSON.xpReward} XP (BONUS!)</motion.div>
                <Link href="/level7/lesson7" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>Next Lesson <ChevronRight size={18} /></Link>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            <header className={styles.header} style={{ borderBottom: '1px solid #f59e0b' }}>
                <Link href="/level7" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 12</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                <div className={styles.lessonTitle}>
                    <motion.div className={styles.lessonEmoji} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>{LESSON.emoji}</motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1 style={{ color: '#f59e0b' }}>{LESSON.title}</h1>
                        <p>Practice: <code style={{ color: '#ef4444' }}>{LESSON.concept}</code></p>
                    </div>
                </div>

                <motion.div style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.2))', border: '2px solid rgba(245, 158, 11, 0.4)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Sparkles size={24} style={{ color: '#f59e0b' }} />
                        <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#f59e0b' }}>SUPERCHARGE CHALLENGE!</span>
                        <Sparkles size={24} style={{ color: '#f59e0b' }} />
                    </div>
                    <p style={{ color: 'var(--text-muted)' }}>Complete all 5 challenges for BONUS XP!</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                        {challengesComplete.map((done, idx) => (
                            <motion.div key={idx} animate={done ? { scale: [1, 1.2, 1] } : {}} style={{ width: '40px', height: '40px', borderRadius: '50%', background: done ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                                {done ? <Check size={20} /> : idx + 1}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <div className={styles.challenges} style={{ borderColor: '#f59e0b' }}>
                    <h3 style={{ color: '#f59e0b' }}>Complete These Challenges:</h3>
                    <ul className={styles.challengeList}>
                        {challenges.map((c, idx) => (
                            <li key={idx}>
                                <div className={`${styles.challengeCheck} ${challengesComplete[idx] ? styles.done : ''}`} style={challengesComplete[idx] ? { background: '#f59e0b' } : {}}>
                                    {challengesComplete[idx] && <Check size={14} />}
                                </div>
                                {c.title}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className={styles.codeSection}>
                    <h3 style={{ color: '#f59e0b' }}>Your Code:</h3>
                    <div className={styles.editor} style={{ borderColor: '#f59e0b' }}>
                        <div className={styles.codeHeader}><span>practice.py</span><span>Python</span></div>
                        <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '380px' }} />
                    </div>
                    <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}><Play size={18} /> Run & Check</button>
                    {output && <motion.div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></motion.div>}
                </div>

                {supercharged && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                        <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: 2 }} style={{ fontSize: '6rem' }}>⚡</motion.div>
                        <motion.h2 style={{ color: '#f59e0b', fontSize: '2.5rem', fontWeight: 800 }}>SUPERCHARGED!</motion.h2>
                    </motion.div>
                )}

                <div className={styles.navBar}>
                    <Link href="/level7/lesson5" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                    <span style={{ color: 'var(--text-muted)' }}>Complete all challenges!</span>
                </div>
            </div>
        </div>
    );
}
