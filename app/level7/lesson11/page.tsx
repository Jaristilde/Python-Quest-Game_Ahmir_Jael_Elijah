'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Unlock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL7_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL7_LESSONS[10];
const LESSON_ID = 95;

export default function Lesson11() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# SECRET CODE MAKER - Part 2: The Decoder!

def encode_message(message):
    upper_msg = message.upper()
    reversed_msg = upper_msg[::-1]
    coded = reversed_msg.replace("A", "4")
    coded = coded.replace("E", "3")
    coded = coded.replace("I", "1")
    coded = coded.replace("O", "0")
    coded = coded.replace("U", "9")
    return coded

def decode_message(coded):
    # Step 1: Replace numbers back to vowels
    decoded = coded.replace("4", "A")
    decoded = decoded.replace("3", "E")
    decoded = decoded.replace("1", "I")
    decoded = decoded.replace("0", "O")
    decoded = decoded.replace("9", "U")

    # Step 2: Reverse back to original
    original = decoded[::-1]

    # Step 3: Convert to title case
    final = original.title()
    return final

# Test the complete system!
original = "Hello World"
print("Original:", original)

encoded = encode_message(original)
print("Encoded:", encoded)

decoded = decode_message(encoded)
print("Decoded:", decoded)

# Try your own secret message!
my_secret = "Python Is Amazing"
my_encoded = encode_message(my_secret)
my_decoded = decode_message(my_encoded)
print("\\nMy message:", my_secret)
print("Encoded:", my_encoded)
print("Decoded:", my_decoded)
`);
    const [output, setOutput] = useState('');
    const [hasDecoded, setHasDecoded] = useState(false);
    const [hasCustom, setHasCustom] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const encode = (msg: string) => {
        let upper = msg.toUpperCase();
        let reversed = upper.split('').reverse().join('');
        return reversed.replace(/A/g, '4').replace(/E/g, '3').replace(/I/g, '1').replace(/O/g, '0').replace(/U/g, '9');
    };

    const decode = (coded: string) => {
        let decoded = coded.replace(/4/g, 'A').replace(/3/g, 'E').replace(/1/g, 'I').replace(/0/g, 'O').replace(/9/g, 'U');
        let reversed = decoded.split('').reverse().join('');
        return reversed.split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
    };

    const runCode = () => {
        try {
            let outputLines: string[] = [];

            const original = "Hello World";
            const encoded = encode(original);
            const decoded = decode(encoded);

            outputLines.push(`Original: ${original}`);
            outputLines.push(`Encoded: ${encoded}`);
            outputLines.push(`Decoded: ${decoded}`);
            setHasDecoded(true);

            const customMatch = code.match(/my_secret\s*=\s*["']([^"']+)["']/);
            if (customMatch) {
                const mySecret = customMatch[1];
                const myEncoded = encode(mySecret);
                const myDecoded = decode(myEncoded);
                outputLines.push('');
                outputLines.push(`My message: ${mySecret}`);
                outputLines.push(`Encoded: ${myEncoded}`);
                outputLines.push(`Decoded: ${myDecoded}`);
                setHasCustom(true);
            }

            if (hasDecoded && hasCustom && !lessonComplete) {
                setTimeout(() => {
                    addXpAndCoins(LESSON.xpReward, 15);
                    completeLevel(LESSON_ID, LESSON.xpReward, 15, 1, 120);
                    setLessonComplete(true);
                }, 1000);
            }

            setOutput(outputLines.join('\n'));
        } catch { setOutput('Error!'); }
    };

    if (isLoading || !user) return <div className={styles.container}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🔓</motion.div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}><Unlock size={50} /></motion.div>
                <motion.h2 className={styles.successTitle} style={{ color: '#10b981' }}>Secret Code Master! 🔓</motion.h2>
                <motion.p className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div className={styles.successXp}><Zap size={20} /> +{LESSON.xpReward} XP</motion.div>
                <Link href="/level7/lesson12" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>Final Quiz! <ChevronRight size={18} /></Link>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            <header className={styles.header} style={{ borderBottom: '1px solid #10b981' }}>
                <Link href="/level7" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 12</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                <div className={styles.lessonTitle}>
                    <motion.div className={styles.lessonEmoji} animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>{LESSON.emoji}</motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1 style={{ color: '#10b981' }}>{LESSON.title}</h1>
                        <p>Project: <code style={{ color: '#3b82f6' }}>{LESSON.concept}</code></p>
                    </div>
                </div>

                <motion.div className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))', borderColor: '#10b981' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Unlock size={28} style={{ color: '#10b981' }} />
                        <Sparkles size={24} style={{ color: '#3b82f6' }} />
                        <span style={{ fontWeight: 700, color: '#10b981' }}>Complete Your Decoder!</span>
                    </div>
                    <p>Now add the <strong style={{ color: '#3b82f6' }}>decode</strong> function to reverse the encoding process!</p>
                </motion.div>

                <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: '#3b82f6' }}>
                    <h3 style={{ color: '#10b981', marginBottom: '1rem' }}><Lightbulb size={20} /> How Decoding Works:</h3>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                            <strong>Step 1:</strong> Replace numbers back to vowels (4→A, 3→E, etc.)
                        </div>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                            <strong>Step 2:</strong> Reverse the text back to normal order
                        </div>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                            <strong>Step 3:</strong> Convert to Title Case for readability
                        </div>
                    </div>
                </div>

                <div className={styles.codeSection}>
                    <h3 style={{ color: '#3b82f6' }}>Complete Encoder + Decoder:</h3>
                    <div className={styles.editor} style={{ borderColor: '#10b981' }}>
                        <div className={styles.codeHeader}><span>secret_code.py</span><span>Python</span></div>
                        <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '550px' }} />
                    </div>
                    <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}><Play size={18} /> Run Complete System</button>
                    {output && <motion.div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></motion.div>}
                </div>

                <div className={styles.challenges} style={{ borderColor: '#10b981' }}>
                    <h3 style={{ color: '#10b981' }}>Project Goals:</h3>
                    <ul className={styles.challengeList}>
                        <li><div className={`${styles.challengeCheck} ${hasDecoded ? styles.done : ''}`}>{hasDecoded && <Check size={14} />}</div>Decode the sample message</li>
                        <li><div className={`${styles.challengeCheck} ${hasCustom ? styles.done : ''}`}>{hasCustom && <Check size={14} />}</div>Encode & decode your own message</li>
                    </ul>
                </div>

                <div className={styles.navBar}>
                    <Link href="/level7/lesson10" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                    <span style={{ color: 'var(--text-muted)' }}>Complete both goals!</span>
                </div>
            </div>
        </div>
    );
}
