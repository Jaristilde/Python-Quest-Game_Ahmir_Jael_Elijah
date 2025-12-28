'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, UtensilsCrossed, Pizza } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL4_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL4_LESSONS[6]; // Lesson 7 (index 6)
const LESSON_ID = 56; // Level 4 lessons 50-62, lesson 7 = 56

export default function Lesson7() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# Welcome to Pizza Palace! Let's build the restaurant!
# Step 1: Create the show_menu function

def show_menu():
    print("PIZZA PALACE MENU")
    print("1. Cheese Pizza - $8")
    print("2. Pepperoni Pizza - $10")
    print("3. Veggie Pizza - $9")
    print("4. Drink - $2")

# Call the function to test it!
show_menu()
`);
    const [output, setOutput] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizChecked, setQuizChecked] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.split('\n');
            let outputLines: string[] = [];
            const functions: Record<string, { params: string[]; body: string[] }> = {};
            const variables: Record<string, string | number> = {};
            let inFunction = false;
            let currentFuncName = '';
            let currentFuncParams: string[] = [];
            let currentFuncBody: string[] = [];
            let indentLevel = 0;

            // First pass: collect function definitions
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();

                if (!trimmed || trimmed.startsWith('#')) continue;

                // Check for function definition
                const funcMatch = trimmed.match(/^def\s+(\w+)\s*\((.*)\)\s*:/);
                if (funcMatch) {
                    if (inFunction) {
                        // Save previous function
                        functions[currentFuncName] = { params: currentFuncParams, body: currentFuncBody };
                    }
                    inFunction = true;
                    currentFuncName = funcMatch[1];
                    currentFuncParams = funcMatch[2].split(',').map(p => p.trim()).filter(p => p);
                    currentFuncBody = [];
                    indentLevel = line.search(/\S/);
                    continue;
                }

                if (inFunction) {
                    const currentIndent = line.search(/\S/);
                    if (currentIndent > indentLevel && trimmed) {
                        currentFuncBody.push(trimmed);
                    } else if (trimmed) {
                        // End of function
                        functions[currentFuncName] = { params: currentFuncParams, body: currentFuncBody };
                        inFunction = false;
                    }
                }
            }

            // Save last function if still in one
            if (inFunction) {
                functions[currentFuncName] = { params: currentFuncParams, body: currentFuncBody };
            }

            // Execute a function
            const executeFunction = (funcName: string, args: (string | number)[]): string | number | undefined => {
                const func = functions[funcName];
                if (!func) return undefined;

                const localVars: Record<string, string | number> = { ...variables };
                func.params.forEach((param, idx) => {
                    localVars[param] = args[idx];
                });

                let returnValue: string | number | undefined = undefined;

                for (const bodyLine of func.body) {
                    // Handle print statements
                    const printMatch = bodyLine.match(/^print\s*\((.+)\)$/);
                    if (printMatch) {
                        let content = printMatch[1].trim();

                        // f-string
                        const fstringMatch = content.match(/^f["'](.*)["']$/);
                        if (fstringMatch) {
                            let text = fstringMatch[1];
                            text = text.replace(/\{(\w+)\}/g, (match, varName) => {
                                if (localVars[varName] !== undefined) return String(localVars[varName]);
                                return match;
                            });
                            outputLines.push(text);
                            continue;
                        }

                        // Regular string
                        const stringMatch = content.match(/^["'](.*)["']$/);
                        if (stringMatch) {
                            outputLines.push(stringMatch[1]);
                            continue;
                        }

                        // Variable
                        if (localVars[content] !== undefined) {
                            outputLines.push(String(localVars[content]));
                            continue;
                        }
                    }

                    // Handle variable assignment
                    const assignMatch = bodyLine.match(/^(\w+)\s*=\s*(.+)$/);
                    if (assignMatch) {
                        const [, varName, expr] = assignMatch;
                        // Simple arithmetic
                        let result = expr;

                        // Replace variables with values
                        result = result.replace(/\b(\w+)\b/g, (match, word) => {
                            if (localVars[word] !== undefined) return String(localVars[word]);
                            return word;
                        });

                        try {
                            // Try to evaluate as arithmetic
                            const evalResult = Function(`"use strict"; return (${result})`)();
                            localVars[varName] = evalResult;
                        } catch {
                            localVars[varName] = result;
                        }
                        continue;
                    }

                    // Handle return statement
                    const returnMatch = bodyLine.match(/^return\s+(.+)$/);
                    if (returnMatch) {
                        let expr = returnMatch[1].trim();

                        // Replace variables with values
                        expr = expr.replace(/\b(\w+)\b/g, (match, word) => {
                            if (localVars[word] !== undefined) return String(localVars[word]);
                            return word;
                        });

                        try {
                            returnValue = Function(`"use strict"; return (${expr})`)();
                        } catch {
                            returnValue = expr;
                        }
                        break;
                    }
                }

                return returnValue;
            };

            // Second pass: execute code outside functions
            inFunction = false;
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();

                if (!trimmed || trimmed.startsWith('#')) continue;

                // Skip function definitions
                const funcDefMatch = trimmed.match(/^def\s+(\w+)\s*\((.*)\)\s*:/);
                if (funcDefMatch) {
                    inFunction = true;
                    indentLevel = line.search(/\S/);
                    continue;
                }

                if (inFunction) {
                    const currentIndent = line.search(/\S/);
                    if (currentIndent <= indentLevel && trimmed && !trimmed.startsWith('def ')) {
                        inFunction = false;
                    } else {
                        continue;
                    }
                }

                // Function call
                const funcCallMatch = trimmed.match(/^(\w+)\s*\((.*)\)$/);
                if (funcCallMatch && functions[funcCallMatch[1]]) {
                    const [, funcName, argsStr] = funcCallMatch;
                    const args: (string | number)[] = argsStr.split(',').map(arg => {
                        const t = arg.trim();
                        const strMatch = t.match(/^["'](.*)["']$/);
                        if (strMatch) return strMatch[1];
                        const num = Number(t);
                        if (!isNaN(num)) return num;
                        if (variables[t] !== undefined) return variables[t];
                        return t;
                    }).filter(a => a !== '');
                    executeFunction(funcName, args);
                    continue;
                }

                // Variable assignment with function call
                const assignFuncMatch = trimmed.match(/^(\w+)\s*=\s*(\w+)\s*\((.*)\)$/);
                if (assignFuncMatch) {
                    const [, varName, funcName, argsStr] = assignFuncMatch;
                    if (functions[funcName]) {
                        const args: (string | number)[] = argsStr.split(',').map(arg => {
                            const t = arg.trim();
                            const strMatch = t.match(/^["'](.*)["']$/);
                            if (strMatch) return strMatch[1];
                            const num = Number(t);
                            if (!isNaN(num)) return num;
                            if (variables[t] !== undefined) return variables[t];
                            return t;
                        }).filter(a => a !== '');
                        const result = executeFunction(funcName, args);
                        if (result !== undefined) {
                            variables[varName] = result;
                        }
                    }
                    continue;
                }

                // Print function call result
                const printFuncMatch = trimmed.match(/^print\s*\((\w+)\s*\((.*)\)\)$/);
                if (printFuncMatch && functions[printFuncMatch[1]]) {
                    const [, funcName, argsStr] = printFuncMatch;
                    const args: (string | number)[] = argsStr.split(',').map(arg => {
                        const t = arg.trim();
                        const strMatch = t.match(/^["'](.*)["']$/);
                        if (strMatch) return strMatch[1];
                        const num = Number(t);
                        if (!isNaN(num)) return num;
                        if (variables[t] !== undefined) return variables[t];
                        return t;
                    }).filter(a => a !== '');
                    const result = executeFunction(funcName, args);
                    if (result !== undefined) {
                        outputLines.push(String(result));
                    }
                    continue;
                }

                // Print variable
                const printVarMatch = trimmed.match(/^print\s*\((\w+)\)$/);
                if (printVarMatch) {
                    const varName = printVarMatch[1];
                    if (variables[varName] !== undefined) {
                        outputLines.push(String(variables[varName]));
                    }
                    continue;
                }

                // Print string
                const printStrMatch = trimmed.match(/^print\s*\(["'](.*)["']\)$/);
                if (printStrMatch) {
                    outputLines.push(printStrMatch[1]);
                    continue;
                }

                // Print f-string
                const printFStrMatch = trimmed.match(/^print\s*\(f["'](.*)["']\)$/);
                if (printFStrMatch) {
                    let text = printFStrMatch[1];
                    text = text.replace(/\{(\w+)\}/g, (match, varName) => {
                        if (variables[varName] !== undefined) return String(variables[varName]);
                        return match;
                    });
                    outputLines.push(text);
                    continue;
                }
            }

            // Check for step completion
            const hasShowMenu = code.includes('def show_menu()') && code.includes('show_menu()');
            const hasGreetCustomer = code.includes('def greet_customer(') && code.includes('greet_customer(');
            const hasCalculateTotal = code.includes('def calculate_total(') && code.includes('return');

            const newCompletedSteps = [...completedSteps];
            if (hasShowMenu && !newCompletedSteps.includes(1)) newCompletedSteps.push(1);
            if (hasGreetCustomer && !newCompletedSteps.includes(2)) newCompletedSteps.push(2);
            if (hasCalculateTotal && !newCompletedSteps.includes(3)) newCompletedSteps.push(3);
            setCompletedSteps(newCompletedSteps);

            if (outputLines.length > 0) {
                setOutput(outputLines.join('\n'));
            } else {
                setOutput('Run your code to see the output!');
            }
        } catch (error) {
            setOutput('Error in code! Check your syntax.');
        }
    };

    const loadStep = (step: number) => {
        setCurrentStep(step);
        if (step === 1) {
            setCode(`# Welcome to Pizza Palace! Let's build the restaurant!
# Step 1: Create the show_menu function

def show_menu():
    print("PIZZA PALACE MENU")
    print("1. Cheese Pizza - $8")
    print("2. Pepperoni Pizza - $10")
    print("3. Veggie Pizza - $9")
    print("4. Drink - $2")

# Call the function to test it!
show_menu()
`);
        } else if (step === 2) {
            setCode(`# Step 2: Add a greeting function with a parameter!

def show_menu():
    print("PIZZA PALACE MENU")
    print("1. Cheese Pizza - $8")
    print("2. Pepperoni Pizza - $10")
    print("3. Veggie Pizza - $9")
    print("4. Drink - $2")

def greet_customer(name):
    print(f"Welcome to Pizza Palace, {name}!")

# Test both functions!
greet_customer("Alex")
show_menu()
`);
        } else if (step === 3) {
            setCode(`# Step 3: Add a function that calculates the total!

def show_menu():
    print("PIZZA PALACE MENU")
    print("1. Cheese Pizza - $8")
    print("2. Pepperoni Pizza - $10")
    print("3. Veggie Pizza - $9")
    print("4. Drink - $2")

def greet_customer(name):
    print(f"Welcome to Pizza Palace, {name}!")

def calculate_total(pizza_price, drink_count):
    drink_total = drink_count * 2
    total = pizza_price + drink_total
    return total

# Test the complete restaurant system!
greet_customer("Alex")
show_menu()
order_total = calculate_total(10, 2)
print(f"Your total is: ${order_total}")
`);
        }
    };

    const checkQuiz = () => {
        setQuizChecked(true);
        if (quizAnswer === 2) {
            setTimeout(() => {
                addXpAndCoins(LESSON.xpReward, 10);
                completeLevel(LESSON_ID, LESSON.xpReward, 10, 1, 90);
                setLessonComplete(true);
            }, 1000);
        }
    };

    const retryQuiz = () => {
        setQuizAnswer(null);
        setQuizChecked(false);
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
                        Loading...
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
                    Pizza Palace is Open!
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={styles.successMessage}
                >
                    {LESSON.successMessage} You built a complete restaurant system with functions!
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
                    <Link href="/level4/lesson8" className={`${styles.navBtn} ${styles.primary}`}>
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
                <Link href="/level4" className={styles.backBtn}>
                    <ArrowLeft size={18} /> Back
                </Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 13</span>
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
                                <p>{LESSON.subtitle}</p>
                            </div>
                        </div>

                        {/* Project Introduction */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{ background: 'linear-gradient(135deg, rgba(255, 121, 198, 0.15), rgba(189, 147, 249, 0.15))' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <UtensilsCrossed size={28} style={{ color: 'var(--accent-primary)' }} />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>PROJECT: Pizza Palace Restaurant!</span>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '1.5rem',
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: '0.75rem',
                                marginBottom: '1rem',
                                gap: '1rem'
                            }}>
                                <motion.span
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{ fontSize: '3rem' }}
                                >
                                    👨‍🍳
                                </motion.span>
                                <motion.span
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    style={{ fontSize: '3rem' }}
                                >
                                    🍕
                                </motion.span>
                                <motion.span
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    style={{ fontSize: '2.5rem' }}
                                >
                                    🥤
                                </motion.span>
                            </div>

                            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                                <strong>Mission:</strong> You're the head chef at Pizza Palace! Build functions to run your restaurant!
                            </p>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                We'll create a complete ordering system step by step using everything you've learned about functions!
                            </p>
                        </motion.div>

                        {/* Step Progress */}
                        <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            marginBottom: '1.5rem',
                            justifyContent: 'center'
                        }}>
                            {[1, 2, 3].map(step => (
                                <button
                                    key={step}
                                    onClick={() => loadStep(step)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '0.5rem',
                                        border: 'none',
                                        background: currentStep === step
                                            ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
                                            : completedSteps.includes(step)
                                                ? 'rgba(80, 250, 123, 0.2)'
                                                : 'var(--bg-card)',
                                        color: currentStep === step ? '#1E1E2E' : 'var(--text-primary)',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    {completedSteps.includes(step) && <Check size={14} />}
                                    Step {step}
                                </button>
                            ))}
                        </div>

                        {/* Step Instructions */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Lightbulb size={20} style={{ color: 'var(--xp-coins)' }} />
                                {currentStep === 1 && 'Step 1: The Menu Function'}
                                {currentStep === 2 && 'Step 2: Greeting Customers'}
                                {currentStep === 3 && 'Step 3: Calculate the Total'}
                            </h3>

                            {currentStep === 1 && (
                                <div>
                                    <p>First, let's create a function that shows our menu! This function:</p>
                                    <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                                        <li>Has NO parameters - it always shows the same menu</li>
                                        <li>Uses <code style={{ color: 'var(--accent-primary)' }}>print()</code> to display each item</li>
                                        <li>Doesn't return anything - it just prints!</li>
                                    </ul>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div>
                                    <p>Now let's add a function to greet customers! This function:</p>
                                    <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                                        <li>Takes a <code style={{ color: 'var(--accent-primary)' }}>name</code> parameter</li>
                                        <li>Uses an f-string to include the name in the greeting</li>
                                        <li>Makes each customer feel special!</li>
                                    </ul>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div>
                                    <p>Finally, let's calculate the order total! This function:</p>
                                    <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                                        <li>Takes TWO parameters: <code style={{ color: 'var(--accent-primary)' }}>pizza_price</code> and <code style={{ color: 'var(--accent-primary)' }}>drink_count</code></li>
                                        <li>Calculates: drinks cost $2 each</li>
                                        <li><code style={{ color: 'var(--accent-primary)' }}>returns</code> the total amount!</li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Code Editor */}
                        <div className={styles.codeSection}>
                            <h3>Build Your Restaurant!</h3>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}>
                                    <span>pizza_palace.py</span>
                                    <span>Python</span>
                                </div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    spellCheck={false}
                                    style={{ minHeight: '300px' }}
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

                        {/* Challenge Tracker */}
                        <div className={styles.challenges}>
                            <h3>Restaurant Building Progress:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${completedSteps.includes(1) ? styles.done : ''}`}>
                                        {completedSteps.includes(1) && <Check size={14} />}
                                    </div>
                                    Create <code>show_menu()</code> function
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${completedSteps.includes(2) ? styles.done : ''}`}>
                                        {completedSteps.includes(2) && <Check size={14} />}
                                    </div>
                                    Create <code>greet_customer(name)</code> function
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${completedSteps.includes(3) ? styles.done : ''}`}>
                                        {completedSteps.includes(3) && <Check size={14} />}
                                    </div>
                                    Create <code>calculate_total(pizza_price, drink_count)</code> function
                                </li>
                            </ul>
                        </div>

                        {/* Tip Box */}
                        <div className={styles.tipBox}>
                            <Lightbulb size={20} style={{ color: 'var(--xp-coins)', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Chef's Tips:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li><code>show_menu()</code> - No parameters needed, just displays info</li>
                                    <li><code>greet_customer(name)</code> - Uses the name parameter in an f-string</li>
                                    <li><code>calculate_total()</code> - Returns a value that you can use later!</li>
                                </ul>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className={styles.navBar}>
                            <Link href="/level4" className={`${styles.navBtn} ${styles.secondary}`}>
                                <ChevronLeft size={18} /> Level Hub
                            </Link>
                            <button
                                className={`${styles.navBtn} ${styles.primary}`}
                                onClick={() => setShowQuiz(true)}
                                disabled={completedSteps.length < 3}
                            >
                                {completedSteps.length < 3 ? 'Complete All Steps First' : 'Take Quiz!'} <ChevronRight size={18} />
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
                            🍕
                        </motion.div>
                        <h2 className={styles.quizTitle}>Chef's Knowledge Check!</h2>

                        <p className={styles.quizQuestion}>
                            What's the difference between a function that <code>prints</code> and one that <code>returns</code>?
                        </p>
                        <div className={styles.quizOptions}>
                            {[
                                'They do the same thing',
                                'print() shows text, return() saves it',
                                'print() displays output, return sends a value back to use later'
                            ].map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => !quizChecked && setQuizAnswer(idx)}
                                    className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''
                                        } ${quizChecked && idx === 2 ? styles.correct : ''
                                        } ${quizChecked && quizAnswer === idx && idx !== 2 ? styles.wrong : ''
                                        }`}
                                    disabled={quizChecked}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>

                        {!quizChecked ? (
                            <button
                                className={styles.quizBtn}
                                onClick={checkQuiz}
                                disabled={quizAnswer === null}
                            >
                                Check Answer
                            </button>
                        ) : quizAnswer !== 2 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.quizFeedback} ${styles.error}`}
                            >
                                <h4>Not quite!</h4>
                                <p>
                                    <code>print()</code> displays text on the screen, but the value is gone after that.
                                    <code>return</code> sends a value back that you can save in a variable and use later!
                                </p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem' }}>
                                    Try Again
                                </button>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
