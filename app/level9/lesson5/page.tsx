'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL9_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL9_LESSONS[4];
const LESSON_ID = 113;

export default function Lesson5() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# API Parameters - Like Ordering Pizza!
# Just like adding toppings to your order!

def search_pokemon(name=None, type=None):
    """Simulated Pokemon API with parameters"""
    pokemon_db = [
        {"name": "Pikachu", "type": "Electric", "power": 55},
        {"name": "Charmander", "type": "Fire", "power": 52},
        {"name": "Squirtle", "type": "Water", "power": 48},
        {"name": "Bulbasaur", "type": "Grass", "power": 49},
        {"name": "Jolteon", "type": "Electric", "power": 65}
    ]

    results = pokemon_db

    # Filter by name if provided
    if name:
        results = [p for p in results if name.lower() in p["name"].lower()]

    # Filter by type if provided
    if type:
        results = [p for p in results if p["type"] == type]

    return results

# Try different parameters!
# No parameters - get all Pokemon
all_pokemon = search_pokemon()
print("All Pokemon:", len(all_pokemon), "found")

# Search by name
pikachu = search_pokemon(name="Pikachu")
print("\\nSearching for Pikachu:", pikachu[0]["name"])

# Search by type
electric_types = search_pokemon(type="Electric")
print("\\nElectric Pokemon:")
for p in electric_types:
    print(f"  - {p['name']} (Power: {p['power']})")
`);
    const [output, setOutput] = useState('');
    const [hasNoParams, setHasNoParams] = useState(false);
    const [hasParams, setHasParams] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        let outputLines: string[] = [];

        if (code.includes('search_pokemon()')) {
            setHasNoParams(true);
            outputLines.push('All Pokemon: 5 found');
        }
        if (code.includes('name="Pikachu"') || code.includes("name='Pikachu'")) {
            setHasParams(true);
            outputLines.push('');
            outputLines.push('Searching for Pikachu: Pikachu');
        }
        if (code.includes('type="Electric"') || code.includes("type='Electric'")) {
            setHasParams(true);
            outputLines.push('');
            outputLines.push('Electric Pokemon:');
            outputLines.push('  - Pikachu (Power: 55)');
            outputLines.push('  - Jolteon (Power: 65)');
        }

        if (hasNoParams && hasParams && !lessonComplete) {
            setTimeout(() => {
                addXpAndCoins(LESSON.xpReward, 5);
                completeLevel(LESSON_ID, LESSON.xpReward, 5, 1, 60);
                setLessonComplete(true);
            }, 1000);
        }

        setOutput(outputLines.join('\n') || 'Try the API with different parameters!');
    };

    if (isLoading || !user) return <div className={styles.container}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🍕</motion.div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #FF79C6, #8BE9FD)' }}>🍕</motion.div>
                <motion.h2 className={styles.successTitle} style={{ color: '#FF79C6' }}>Parameters Mastered!</motion.h2>
                <motion.p className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div className={styles.successXp}><Zap size={20} /> +{LESSON.xpReward} XP</motion.div>
                <Link href="/level9/lesson6" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #FF79C6, #8BE9FD)' }}>Next Lesson <ChevronRight size={18} /></Link>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            <header className={styles.header} style={{ borderBottom: '1px solid #FF79C6' }}>
                <Link href="/level9" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 7</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                <div className={styles.lessonTitle}>
                    <motion.div className={styles.lessonEmoji} animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #FF79C6, #8BE9FD)' }}>{LESSON.emoji}</motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1 style={{ color: '#FF79C6' }}>{LESSON.title}</h1>
                        <p>Learn <code style={{ color: '#8BE9FD' }}>{LESSON.concept}</code></p>
                    </div>
                </div>

                <motion.div className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(255, 121, 198, 0.15), rgba(139, 233, 253, 0.15))', borderColor: '#FF79C6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Lightbulb size={24} style={{ color: '#FF79C6' }} />
                        <span style={{ fontWeight: 700, color: '#FF79C6' }}>Parameters = Custom Orders!</span>
                    </div>
                    <p>Like ordering pizza with toppings, <strong style={{ color: '#8BE9FD' }}>parameters</strong> let you customize your API request!</p>
                    <pre style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '0.5rem', marginTop: '0.75rem', fontSize: '0.85rem' }}>
{`# Real API with parameters:
api.com/weather?city=Paris&units=metric

# Our simulated version:
get_weather(city="Paris", units="metric")`}
                    </pre>
                </motion.div>

                <div className={styles.codeSection}>
                    <h3 style={{ color: '#8BE9FD' }}>Search Pokemon with Parameters!</h3>
                    <div className={styles.editor} style={{ borderColor: '#FF79C6' }}>
                        <div className={styles.codeHeader}><span>api_params.py</span><span>Python</span></div>
                        <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '480px' }} />
                    </div>
                    <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #FF79C6, #8BE9FD)' }}><Play size={18} /> Run Code</button>
                    {output && <motion.div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></motion.div>}
                </div>

                <div className={styles.challenges} style={{ borderColor: '#FF79C6' }}>
                    <h3 style={{ color: '#FF79C6' }}>Goals:</h3>
                    <ul className={styles.challengeList}>
                        <li><div className={`${styles.challengeCheck} ${hasNoParams ? styles.done : ''}`}>{hasNoParams && <Check size={14} />}</div>Call API with no parameters</li>
                        <li><div className={`${styles.challengeCheck} ${hasParams ? styles.done : ''}`}>{hasParams && <Check size={14} />}</div>Call API with parameters</li>
                    </ul>
                </div>

                <div className={styles.navBar}>
                    <Link href="/level9/lesson4" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                    <span style={{ color: 'var(--text-muted)' }}>Complete goals!</span>
                </div>
            </div>
        </div>
    );
}
