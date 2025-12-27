'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL3_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL3_LESSONS[2]; // Lesson 3
const LESSON_ID = 36; // Level 3 lessons start at 34, so lesson 3 = 36

export default function Lesson3() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('# Try adding and removing items!\n');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);

    // Animation states for the shopping cart demo
    const [cartItems, setCartItems] = useState<string[]>(['milk', 'eggs']);
    const [animatingItem, setAnimatingItem] = useState<string | null>(null);
    const [animationType, setAnimationType] = useState<'add' | 'remove' | null>(null);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    // Demo animations for shopping cart
    const demoAppend = () => {
        if (!cartItems.includes('bread')) {
            setAnimatingItem('bread');
            setAnimationType('add');
            setTimeout(() => {
                setCartItems([...cartItems, 'bread']);
                setAnimatingItem(null);
                setAnimationType(null);
            }, 500);
        }
    };

    const demoRemove = () => {
        if (cartItems.includes('eggs')) {
            setAnimatingItem('eggs');
            setAnimationType('remove');
            setTimeout(() => {
                setCartItems(cartItems.filter(i => i !== 'eggs'));
                setAnimatingItem(null);
                setAnimationType(null);
            }, 500);
        }
    };

    const demoPop = () => {
        if (cartItems.length > 0) {
            const lastItem = cartItems[cartItems.length - 1];
            setAnimatingItem(lastItem);
            setAnimationType('remove');
            setTimeout(() => {
                setCartItems(cartItems.slice(0, -1));
                setAnimatingItem(null);
                setAnimationType(null);
            }, 500);
        }
    };

    const resetCart = () => {
        setCartItems(['milk', 'eggs']);
    };

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            let variables: Record<string, (string | number)[]> = {};

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) continue;

                // List creation: shopping = ["milk", "eggs"]
                const listMatch = trimmed.match(/^(\w+)\s*=\s*\[(.*)\]$/);
                if (listMatch) {
                    const [, varName, items] = listMatch;
                    if (items.trim() === '') {
                        variables[varName] = [];
                    } else {
                        const itemList = items.split(',').map(item => {
                            const strMatch = item.trim().match(/^["'](.*)["']$/);
                            if (strMatch) return strMatch[1];
                            const numMatch = item.trim().match(/^(-?\d+)$/);
                            if (numMatch) return parseInt(numMatch[1]);
                            return item.trim();
                        });
                        variables[varName] = itemList;
                    }
                    continue;
                }

                // .append() method: shopping.append("bread")
                const appendMatch = trimmed.match(/^(\w+)\.append\s*\(\s*["'](.+)["']\s*\)$/);
                if (appendMatch) {
                    const [, varName, item] = appendMatch;
                    if (variables[varName] && Array.isArray(variables[varName])) {
                        variables[varName].push(item);
                    }
                    continue;
                }

                // .remove() method: shopping.remove("eggs")
                const removeMatch = trimmed.match(/^(\w+)\.remove\s*\(\s*["'](.+)["']\s*\)$/);
                if (removeMatch) {
                    const [, varName, item] = removeMatch;
                    if (variables[varName] && Array.isArray(variables[varName])) {
                        const index = variables[varName].indexOf(item);
                        if (index > -1) {
                            variables[varName].splice(index, 1);
                        }
                    }
                    continue;
                }

                // .pop() method: shopping.pop() or item = shopping.pop()
                const popMatch = trimmed.match(/^(?:(\w+)\s*=\s*)?(\w+)\.pop\s*\(\s*(\d*)\s*\)$/);
                if (popMatch) {
                    const [, resultVar, varName, indexStr] = popMatch;
                    if (variables[varName] && Array.isArray(variables[varName]) && variables[varName].length > 0) {
                        const index = indexStr ? parseInt(indexStr) : variables[varName].length - 1;
                        const poppedItem = variables[varName].splice(index, 1)[0];
                        if (resultVar) {
                            // Store as single-element array for consistency
                            variables[resultVar] = [poppedItem];
                        }
                    }
                    continue;
                }

                // .insert() method: shopping.insert(0, "cookies")
                const insertMatch = trimmed.match(/^(\w+)\.insert\s*\(\s*(\d+)\s*,\s*["'](.+)["']\s*\)$/);
                if (insertMatch) {
                    const [, varName, indexStr, item] = insertMatch;
                    if (variables[varName] && Array.isArray(variables[varName])) {
                        const index = parseInt(indexStr);
                        variables[varName].splice(index, 0, item);
                    }
                    continue;
                }

                // print() function
                const printMatch = trimmed.match(/^print\s*\((.+)\)$/);
                if (printMatch) {
                    let content = printMatch[1].trim();

                    // Check if it's a variable
                    if (variables[content]) {
                        const arr = variables[content];
                        const formatted = '[' + arr.map(item =>
                            typeof item === 'string' ? `'${item}'` : item
                        ).join(', ') + ']';
                        outputLines.push(formatted);
                    }
                    // Check if it's a string
                    else if (content.match(/^["'](.*)["']$/)) {
                        const strMatch = content.match(/^["'](.*)["']$/);
                        if (strMatch) outputLines.push(strMatch[1]);
                    }
                    // Check for len()
                    else if (content.match(/^len\s*\(\s*(\w+)\s*\)$/)) {
                        const lenMatch = content.match(/^len\s*\(\s*(\w+)\s*\)$/);
                        if (lenMatch && variables[lenMatch[1]]) {
                            outputLines.push(String(variables[lenMatch[1]].length));
                        }
                    }
                    continue;
                }
            }

            if (outputLines.length > 0) {
                setOutput(outputLines.join('\n'));
            } else {
                setOutput('Run your code to see the output!');
            }
        } catch {
            setOutput('Error in code! Check your syntax.');
        }
    };

    const checkQuiz = () => {
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = true;
        setQuizChecked(newChecked);

        const correctAnswers = [1, 1, 1]; // B, B, B (0-indexed)

        if (quizAnswers[currentQuiz] === correctAnswers[currentQuiz]) {
            if (currentQuiz < 2) {
                // Move to next question
                setTimeout(() => {
                    setCurrentQuiz(currentQuiz + 1);
                }, 1000);
            } else {
                // All questions correct - complete lesson
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
            <div className={styles.container}>
                <div className="flex items-center justify-center h-screen">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        style={{ fontSize: '3rem' }}
                    >
                        <ShoppingCart />
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
                    List Editor Unlocked!
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={styles.successMessage}
                >
                    {LESSON.successMessage} You can now add and remove items from any list!
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
                    <Link href="/level3/lesson4" className={`${styles.navBtn} ${styles.primary}`}>
                        Next Lesson <ChevronRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <Link href="/level3" className={styles.backBtn}>
                    <ArrowLeft size={18} /> Back
                </Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 16</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}>
                        <Heart size={14} fill="currentColor" /> {user.progress.lives}
                    </div>
                    <div className={`${styles.statBadge} ${styles.xp}`}>
                        <Zap size={14} fill="currentColor" /> {user.progress.xp}
                    </div>
                </div>
            </header>

            <div className={styles.content}>
                {!showQuiz ? (
                    <>
                        {/* Lesson Title */}
                        <div className={styles.lessonTitle}>
                            <motion.div
                                className={styles.lessonEmoji}
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                {LESSON.emoji}
                            </motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Story Introduction - Shopping Mission */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <ShoppingCart size={28} className="text-emerald-400" />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Mission: Shopping List Manager!</span>
                            </div>

                            {/* Animated Shopping Cart */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: '1.5rem',
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: '0.75rem',
                                marginBottom: '1rem'
                            }}>
                                <motion.div
                                    animate={{ x: [-3, 3, -3] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    style={{ fontSize: '2.5rem', marginBottom: '1rem' }}
                                >
                                    <ShoppingCart size={48} className="text-emerald-400" />
                                </motion.div>

                                {/* Cart Items Display */}
                                <div style={{
                                    display: 'flex',
                                    gap: '0.75rem',
                                    flexWrap: 'wrap',
                                    justifyContent: 'center',
                                    marginBottom: '1rem',
                                    minHeight: '60px'
                                }}>
                                    <AnimatePresence>
                                        {cartItems.map((item, idx) => (
                                            <motion.div
                                                key={`${item}-${idx}`}
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{
                                                    scale: animatingItem === item && animationType === 'remove' ? 0 : 1,
                                                    opacity: animatingItem === item && animationType === 'remove' ? 0 : 1
                                                }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: 'rgba(99, 102, 241, 0.3)',
                                                    borderRadius: '9999px',
                                                    fontSize: '1rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}
                                            >
                                                {item === 'milk' && '🥛'}
                                                {item === 'eggs' && '🥚'}
                                                {item === 'bread' && '🍞'}
                                                {item === 'cookies' && '🍪'}
                                                {item}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    {animatingItem && animationType === 'add' && (
                                        <motion.div
                                            initial={{ scale: 0, y: -20 }}
                                            animate={{ scale: 1, y: 0 }}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: 'rgba(16, 185, 129, 0.4)',
                                                borderRadius: '9999px',
                                                fontSize: '1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            {animatingItem === 'bread' && '🍞'}
                                            {animatingItem}
                                        </motion.div>
                                    )}
                                </div>

                                {/* Demo Buttons */}
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                                    <button
                                        onClick={demoAppend}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: 'rgba(16, 185, 129, 0.3)',
                                            border: '1px solid rgba(16, 185, 129, 0.5)',
                                            borderRadius: '0.5rem',
                                            color: '#10b981',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        <Plus size={14} /> .append("bread")
                                    </button>
                                    <button
                                        onClick={demoRemove}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: 'rgba(239, 68, 68, 0.3)',
                                            border: '1px solid rgba(239, 68, 68, 0.5)',
                                            borderRadius: '0.5rem',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        <Minus size={14} /> .remove("eggs")
                                    </button>
                                    <button
                                        onClick={demoPop}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: 'rgba(251, 191, 36, 0.3)',
                                            border: '1px solid rgba(251, 191, 36, 0.5)',
                                            borderRadius: '0.5rem',
                                            color: '#fbbf24',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        <Trash2 size={14} /> .pop()
                                    </button>
                                    <button
                                        onClick={resetCart}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: 'rgba(99, 102, 241, 0.3)',
                                            border: '1px solid rgba(99, 102, 241, 0.5)',
                                            borderRadius: '0.5rem',
                                            color: '#818cf8',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>

                            <p>
                                Shopping time! Your shopping list keeps changing. Learn to <strong>ADD</strong> items when you need something new, and <strong>REMOVE</strong> items when you're done!
                            </p>
                        </motion.div>

                        {/* Main Explanation */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Lightbulb size={20} className="text-amber-400" /> List Methods - Your Editing Tools!
                            </h3>
                            <p>
                                Lists in Python can grow and shrink! Use these special methods to change your lists:
                            </p>

                            <div style={{ marginTop: '1.5rem' }}>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.2rem' }}>+</span>
                                        <div>
                                            <code style={{ color: '#10b981' }}>.append(item)</code>
                                            <span style={{ color: 'var(--text-muted)' }}> - Adds item to the END of the list</span>
                                            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                                "The dot connects to the list, append means 'add to the end'"
                                            </div>
                                        </div>
                                    </li>
                                    <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.2rem' }}>-</span>
                                        <div>
                                            <code style={{ color: '#ef4444' }}>.remove(item)</code>
                                            <span style={{ color: 'var(--text-muted)' }}> - Removes a specific item by its VALUE</span>
                                            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                                "Takes out the item you name"
                                            </div>
                                        </div>
                                    </li>
                                    <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.2rem' }}>*</span>
                                        <div>
                                            <code style={{ color: '#fbbf24' }}>.pop()</code>
                                            <span style={{ color: 'var(--text-muted)' }}> - Removes and returns the LAST item</span>
                                            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                                "Pops off the last item like a bubble!"
                                            </div>
                                        </div>
                                    </li>
                                    <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.2rem' }}>0</span>
                                        <div>
                                            <code style={{ color: '#fbbf24' }}>.pop(0)</code>
                                            <span style={{ color: 'var(--text-muted)' }}> - Removes and returns the FIRST item</span>
                                        </div>
                                    </li>
                                    <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.2rem' }}>#</span>
                                        <div>
                                            <code style={{ color: '#818cf8' }}>.insert(index, item)</code>
                                            <span style={{ color: 'var(--text-muted)' }}> - Adds item at a specific position</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <div style={{
                                marginTop: '1rem',
                                padding: '0.75rem',
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: '0.5rem',
                                fontSize: '0.9rem'
                            }}>
                                <strong>Symbol Guide:</strong> The <code>( )</code> parentheses hold what you want to add or remove!
                            </div>
                        </div>

                        {/* Example Code */}
                        <div className={styles.codeSection}>
                            <h3>Example Code</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}>
                                    <span>shopping.py</span>
                                    <span>Python</span>
                                </div>
                                <div className={styles.codeContent}>
                                    <span className={styles.variable}>shopping</span> = [<span className={styles.string}>"milk"</span>, <span className={styles.string}>"eggs"</span>]{'\n\n'}
                                    <span className={styles.variable}>shopping</span>.<span className={styles.keyword}>append</span>(<span className={styles.string}>"bread"</span>)  <span className={styles.comment}># Add bread to end</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.variable}>shopping</span>)  <span className={styles.comment}># ['milk', 'eggs', 'bread']</span>{'\n\n'}
                                    <span className={styles.variable}>shopping</span>.<span className={styles.keyword}>remove</span>(<span className={styles.string}>"eggs"</span>)   <span className={styles.comment}># Got the eggs!</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.variable}>shopping</span>)  <span className={styles.comment}># ['milk', 'bread']</span>
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>
                                    ['milk', 'eggs', 'bread']{'\n'}
                                    ['milk', 'bread']
                                </div>
                            </div>
                        </div>

                        {/* More Examples */}
                        <div className={styles.codeSection}>
                            <h3>More Methods</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}>
                                    <span>more_methods.py</span>
                                    <span>Python</span>
                                </div>
                                <div className={styles.codeContent}>
                                    <span className={styles.variable}>fruits</span> = [<span className={styles.string}>"apple"</span>, <span className={styles.string}>"banana"</span>, <span className={styles.string}>"cherry"</span>]{'\n\n'}
                                    <span className={styles.comment}># .pop() removes and returns the LAST item</span>{'\n'}
                                    <span className={styles.variable}>last</span> = <span className={styles.variable}>fruits</span>.<span className={styles.keyword}>pop</span>(){'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.variable}>last</span>)    <span className={styles.comment}># cherry</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.variable}>fruits</span>)  <span className={styles.comment}># ['apple', 'banana']</span>{'\n\n'}
                                    <span className={styles.comment}># .insert(index, item) adds at a specific position</span>{'\n'}
                                    <span className={styles.variable}>fruits</span>.<span className={styles.keyword}>insert</span>(<span className={styles.number}>0</span>, <span className={styles.string}>"mango"</span>)  <span className={styles.comment}># Add at start</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.variable}>fruits</span>)  <span className={styles.comment}># ['mango', 'apple', 'banana']</span>
                                </div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3>Your Turn - Try the List Methods!</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                Experiment with <code>.append()</code>, <code>.remove()</code>, and <code>.pop()</code>!
                            </p>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}>
                                    <span>your_code.py</span>
                                    <span>Python</span>
                                </div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder='shopping = ["milk", "eggs"]

shopping.append("bread")  # Add bread
print(shopping)

shopping.remove("eggs")   # Got the eggs!
print(shopping)'
                                    spellCheck={false}
                                    style={{ minHeight: '180px' }}
                                />
                            </div>
                            <button className={styles.runBtn} onClick={runCode}>
                                <Play size={18} /> Run Code
                            </button>

                            {output && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={styles.outputBox}
                                >
                                    <div className={styles.outputLabel}>Output:</div>
                                    <div className={styles.outputText}>{output}</div>
                                </motion.div>
                            )}
                        </div>

                        {/* Tip Box */}
                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Remember:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li><code>.append()</code> always adds to the END</li>
                                    <li><code>.remove()</code> looks for the VALUE, not the index</li>
                                    <li><code>.pop()</code> removes from the END (or use <code>.pop(0)</code> for the start)</li>
                                    <li>All methods use the dot <code>.</code> to connect to your list!</li>
                                </ul>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className={styles.navBar}>
                            <Link href="/level3/lesson2" className={`${styles.navBtn} ${styles.secondary}`}>
                                <ChevronLeft size={18} /> Previous
                            </Link>
                            <button
                                className={`${styles.navBtn} ${styles.primary}`}
                                onClick={() => setShowQuiz(true)}
                            >
                                Quiz Time! <ChevronRight size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    /* Quiz Section */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={styles.quizSection}
                    >
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ fontSize: '3rem', marginBottom: '1rem' }}
                        >
                            <ShoppingCart size={48} />
                        </motion.div>
                        <h2 className={styles.quizTitle}>Shopping Quiz! (Question {currentQuiz + 1}/3)</h2>

                        {currentQuiz === 0 && (
                            <>
                                <p className={styles.quizQuestion}>
                                    Which method adds an item to the <strong>END</strong> of a list?
                                </p>
                                <div className={styles.quizOptions}>
                                    {[
                                        '.add()',
                                        '.append()',
                                        '.insert()'
                                    ].map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                if (!quizChecked[0]) {
                                                    const newAnswers = [...quizAnswers];
                                                    newAnswers[0] = idx;
                                                    setQuizAnswers(newAnswers);
                                                }
                                            }}
                                            className={`${styles.quizOption} ${quizAnswers[0] === idx ? styles.selected : ''
                                                } ${quizChecked[0] && idx === 1 ? styles.correct : ''
                                                } ${quizChecked[0] && quizAnswers[0] === idx && idx !== 1 ? styles.wrong : ''
                                                }`}
                                            disabled={quizChecked[0]}
                                        >
                                            <code>{option}</code>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {currentQuiz === 1 && (
                            <>
                                <p className={styles.quizQuestion}>
                                    What does <code>.pop()</code> do?
                                </p>
                                <div className={styles.quizOptions}>
                                    {[
                                        'Adds an item to the list',
                                        'Removes the last item from the list',
                                        'Sorts the list in order'
                                    ].map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                if (!quizChecked[1]) {
                                                    const newAnswers = [...quizAnswers];
                                                    newAnswers[1] = idx;
                                                    setQuizAnswers(newAnswers);
                                                }
                                            }}
                                            className={`${styles.quizOption} ${quizAnswers[1] === idx ? styles.selected : ''
                                                } ${quizChecked[1] && idx === 1 ? styles.correct : ''
                                                } ${quizChecked[1] && quizAnswers[1] === idx && idx !== 1 ? styles.wrong : ''
                                                }`}
                                            disabled={quizChecked[1]}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {currentQuiz === 2 && (
                            <>
                                <p className={styles.quizQuestion}>
                                    <code>shopping.remove("milk")</code> removes milk by its:
                                </p>
                                <div className={styles.quizOptions}>
                                    {[
                                        'Index number (position)',
                                        'Value/name',
                                        'Size'
                                    ].map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                if (!quizChecked[2]) {
                                                    const newAnswers = [...quizAnswers];
                                                    newAnswers[2] = idx;
                                                    setQuizAnswers(newAnswers);
                                                }
                                            }}
                                            className={`${styles.quizOption} ${quizAnswers[2] === idx ? styles.selected : ''
                                                } ${quizChecked[2] && idx === 1 ? styles.correct : ''
                                                } ${quizChecked[2] && quizAnswers[2] === idx && idx !== 1 ? styles.wrong : ''
                                                }`}
                                            disabled={quizChecked[2]}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {!quizChecked[currentQuiz] ? (
                            <button
                                className={styles.quizBtn}
                                onClick={checkQuiz}
                                disabled={quizAnswers[currentQuiz] === null}
                            >
                                Check Answer
                            </button>
                        ) : quizAnswers[currentQuiz] !== 1 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.quizFeedback} ${styles.error}`}
                            >
                                <h4>Not quite!</h4>
                                <p>
                                    {currentQuiz === 0
                                        ? '.append() is the method that adds items to the END of a list. The name even sounds like "add"!'
                                        : currentQuiz === 1
                                        ? '.pop() removes and returns the LAST item from the list, like popping a bubble off the end!'
                                        : '.remove() finds and removes an item by its VALUE (the actual content), not by its position number.'
                                    }
                                </p>
                                <button
                                    className={styles.quizBtn}
                                    onClick={retryQuiz}
                                    style={{ marginTop: '1rem' }}
                                >
                                    Try Again
                                </button>
                            </motion.div>
                        ) : currentQuiz < 2 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.quizFeedback} ${styles.success}`}
                            >
                                <h4>Correct!</h4>
                                <p>Moving to the next question...</p>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
