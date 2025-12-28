'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Target, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL4_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL4_LESSONS[11]; // Lesson 12 (0-indexed)
const LESSON_ID = 61;

interface ChallengeState {
    code: string;
    output: string;
    completed: boolean;
    showHint: boolean;
}

export default function Lesson12() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    // Challenge states
    const [challenge1, setChallenge1] = useState<ChallengeState>({
        code: '',
        output: '',
        completed: false,
        showHint: false
    });
    const [challenge2, setChallenge2] = useState<ChallengeState>({
        code: '',
        output: '',
        completed: false,
        showHint: false
    });
    const [challenge3, setChallenge3] = useState<ChallengeState>({
        code: '',
        output: '',
        completed: false,
        showHint: false
    });

    // Supercharge state
    const [superchargeCode, setSuperchargeCode] = useState('');
    const [superchargeOutput, setSuperchargeOutput] = useState('');
    const [superchargeDone, setSuperchargeDone] = useState(false);
    const [superchargeXpClaimed, setSuperchargeXpClaimed] = useState(false);
    const [showSuperchargeHint, setShowSuperchargeHint] = useState(false);

    // Quiz state
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizStage, setQuizStage] = useState(1);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizChecked, setQuizChecked] = useState(false);

    // Lesson completion
    const [lessonComplete, setLessonComplete] = useState(false);
    const [xpClaimed, setXpClaimed] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    // Check if all main challenges are completed
    const allChallengesComplete = challenge1.completed && challenge2.completed && challenge3.completed;

    // Simplified Python interpreter for function challenges
    const runFunctionCode = (code: string): { output: string; success: boolean } => {
        const lines = code.trim().split('\n');
        let outputLines: string[] = [];
        const variables: Record<string, any> = {};
        const functions: Record<string, { params: string[]; body: string[] }> = {};
        let currentFunction: string | null = null;
        let functionBody: string[] = [];
        let functionParams: string[] = [];

        // First pass: collect functions
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            if (!trimmed || trimmed.startsWith('#')) continue;

            const funcMatch = trimmed.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*:/);
            if (funcMatch) {
                currentFunction = funcMatch[1];
                functionParams = funcMatch[2].split(',').map(p => p.trim()).filter(p => p);
                functionBody = [];
                continue;
            }

            if (currentFunction && (line.startsWith('    ') || line.startsWith('\t'))) {
                functionBody.push(line);
                continue;
            }

            if (currentFunction && !line.startsWith('    ') && !line.startsWith('\t') && trimmed) {
                functions[currentFunction] = { params: functionParams, body: functionBody };
                currentFunction = null;
            }
        }

        if (currentFunction) {
            functions[currentFunction] = { params: functionParams, body: functionBody };
        }

        // Execute function
        const executeFunction = (funcName: string, args: any[]): any => {
            const func = functions[funcName];
            if (!func) return undefined;

            const localVars: Record<string, any> = { ...variables };
            func.params.forEach((param, idx) => {
                localVars[param] = args[idx];
            });

            let returnValue: any = undefined;

            for (let i = 0; i < func.body.length; i++) {
                const line = func.body[i];
                const trimmed = line.trim();

                // If statement
                const ifMatch = trimmed.match(/^if\s+(.+)\s*:/);
                if (ifMatch) {
                    const condition = ifMatch[1];
                    let conditionMet = false;

                    // Evaluate condition
                    const compMatch = condition.match(/(\w+)\s*([<>=!]+)\s*(.+)/);
                    if (compMatch) {
                        const left = localVars[compMatch[1]] !== undefined ? localVars[compMatch[1]] : compMatch[1];
                        const op = compMatch[2];
                        let right = compMatch[3].trim();
                        if (right.startsWith('"') || right.startsWith("'")) {
                            right = right.slice(1, -1);
                        } else if (!isNaN(Number(right))) {
                            right = Number(right);
                        } else if (localVars[right] !== undefined) {
                            right = localVars[right];
                        }

                        switch (op) {
                            case '==': conditionMet = left == right; break;
                            case '!=': conditionMet = left != right; break;
                            case '>': conditionMet = left > right; break;
                            case '<': conditionMet = left < right; break;
                            case '>=': conditionMet = left >= right; break;
                            case '<=': conditionMet = left <= right; break;
                        }
                    }

                    // Find if body and else body
                    let j = i + 1;
                    const ifBody: string[] = [];
                    const elseBody: string[] = [];
                    let inElse = false;

                    while (j < func.body.length) {
                        const nextLine = func.body[j].trim();
                        if (nextLine.startsWith('elif ') || nextLine.startsWith('else:')) {
                            inElse = true;
                            j++;
                            continue;
                        }
                        if (!func.body[j].startsWith('        ') && !func.body[j].startsWith('\t\t')) {
                            if (nextLine.startsWith('return ') || nextLine.startsWith('print(')) {
                                // Still in if/else body at single indent
                                if (inElse) {
                                    elseBody.push(nextLine);
                                } else {
                                    ifBody.push(nextLine);
                                }
                                j++;
                                continue;
                            }
                            break;
                        }
                        if (inElse) {
                            elseBody.push(nextLine);
                        } else {
                            ifBody.push(nextLine);
                        }
                        j++;
                    }

                    const bodyToExecute = conditionMet ? ifBody : elseBody;
                    for (const bodyLine of bodyToExecute) {
                        const returnMatch = bodyLine.match(/^return\s+(.+)$/);
                        if (returnMatch) {
                            let val = returnMatch[1].trim();
                            if (val.startsWith('"') || val.startsWith("'")) {
                                returnValue = val.slice(1, -1);
                            } else if (!isNaN(Number(val))) {
                                returnValue = Number(val);
                            } else if (localVars[val] !== undefined) {
                                returnValue = localVars[val];
                            } else {
                                returnValue = val;
                            }
                            return returnValue;
                        }

                        const printMatch = bodyLine.match(/^print\s*\(\s*(.+)\s*\)$/);
                        if (printMatch) {
                            let arg = printMatch[1].trim();
                            if (arg.startsWith('"') || arg.startsWith("'")) {
                                outputLines.push(arg.slice(1, -1));
                            } else if (localVars[arg] !== undefined) {
                                outputLines.push(String(localVars[arg]));
                            }
                        }
                    }

                    i = j - 1;
                    continue;
                }

                // For loop
                const forMatch = trimmed.match(/^for\s+(\w+)\s+in\s+(\w+)\s*:/);
                if (forMatch) {
                    const loopVar = forMatch[1];
                    const listVar = forMatch[2];

                    let j = i + 1;
                    const loopBody: string[] = [];
                    while (j < func.body.length) {
                        if (func.body[j].startsWith('        ') || func.body[j].startsWith('\t\t')) {
                            loopBody.push(func.body[j].trim());
                            j++;
                        } else {
                            break;
                        }
                    }

                    const list = localVars[listVar];
                    if (Array.isArray(list)) {
                        for (const item of list) {
                            localVars[loopVar] = item;
                            for (const bodyLine of loopBody) {
                                const printMatch = bodyLine.match(/^print\s*\(\s*(.+)\s*\)$/);
                                if (printMatch) {
                                    let arg = printMatch[1].trim();
                                    if (arg.startsWith('"') || arg.startsWith("'")) {
                                        outputLines.push(arg.slice(1, -1));
                                    } else if (localVars[arg] !== undefined) {
                                        outputLines.push(String(localVars[arg]));
                                    }
                                }
                            }
                        }
                    }

                    i = j - 1;
                    continue;
                }

                // For loop with range
                const forRangeMatch = trimmed.match(/^for\s+(\w+)\s+in\s+range\s*\(\s*(.+?)\s*\)\s*:/);
                if (forRangeMatch) {
                    const loopVar = forRangeMatch[1];
                    let rangeArg = forRangeMatch[2];
                    if (localVars[rangeArg] !== undefined) {
                        rangeArg = String(localVars[rangeArg]);
                    }
                    const rangeEnd = parseInt(rangeArg);

                    let j = i + 1;
                    const loopBody: string[] = [];
                    while (j < func.body.length) {
                        if (func.body[j].startsWith('        ') || func.body[j].startsWith('\t\t')) {
                            loopBody.push(func.body[j].trim());
                            j++;
                        } else {
                            break;
                        }
                    }

                    for (let k = 0; k < rangeEnd; k++) {
                        localVars[loopVar] = k;
                        for (const bodyLine of loopBody) {
                            const printMatch = bodyLine.match(/^print\s*\(\s*(.+)\s*\)$/);
                            if (printMatch) {
                                let arg = printMatch[1].trim();
                                if (arg.startsWith('"') || arg.startsWith("'")) {
                                    outputLines.push(arg.slice(1, -1));
                                } else if (localVars[arg] !== undefined) {
                                    outputLines.push(String(localVars[arg]));
                                }
                            }
                        }
                    }

                    i = j - 1;
                    continue;
                }

                // Return statement
                const returnMatch = trimmed.match(/^return\s+(.+)$/);
                if (returnMatch) {
                    let val = returnMatch[1].trim();
                    if (val.startsWith('"') || val.startsWith("'")) {
                        returnValue = val.slice(1, -1);
                    } else if (!isNaN(Number(val))) {
                        returnValue = Number(val);
                    } else if (localVars[val] !== undefined) {
                        returnValue = localVars[val];
                    }
                    break;
                }

                // Print statement
                const printMatch = trimmed.match(/^print\s*\(\s*(.+)\s*\)$/);
                if (printMatch) {
                    let arg = printMatch[1].trim();
                    if (arg.startsWith('"') || arg.startsWith("'")) {
                        outputLines.push(arg.slice(1, -1));
                    } else if (localVars[arg] !== undefined) {
                        if (Array.isArray(localVars[arg])) {
                            outputLines.push('[' + localVars[arg].join(', ') + ']');
                        } else {
                            outputLines.push(String(localVars[arg]));
                        }
                    }
                }
            }

            return returnValue;
        };

        // Execute main code
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            if (!trimmed || trimmed.startsWith('#')) continue;
            if (trimmed.startsWith('def ')) continue;
            if (line.startsWith('    ') || line.startsWith('\t')) continue;

            // Variable assignment
            const assignMatch = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
            if (assignMatch) {
                const varName = assignMatch[1];
                const value = assignMatch[2].trim();

                // List
                const listMatch = value.match(/^\[(.*)\]$/);
                if (listMatch) {
                    const content = listMatch[1].trim();
                    if (content === '') {
                        variables[varName] = [];
                    } else {
                        const items: any[] = [];
                        const itemMatches = content.match(/(?:"[^"]*"|'[^']*'|-?\d+(?:\.\d+)?)/g);
                        if (itemMatches) {
                            for (const item of itemMatches) {
                                if (item.startsWith('"') || item.startsWith("'")) {
                                    items.push(item.slice(1, -1));
                                } else {
                                    items.push(parseFloat(item));
                                }
                            }
                        }
                        variables[varName] = items;
                    }
                    continue;
                }

                // Function call
                const funcCallMatch = value.match(/^(\w+)\s*\(\s*([^)]*)\s*\)$/);
                if (funcCallMatch) {
                    const funcName = funcCallMatch[1];
                    const argsStr = funcCallMatch[2];
                    const args = argsStr.split(',').map(a => {
                        const arg = a.trim();
                        if (variables[arg] !== undefined) return variables[arg];
                        if (arg.startsWith('"') || arg.startsWith("'")) return arg.slice(1, -1);
                        if (!isNaN(Number(arg))) return Number(arg);
                        return arg;
                    }).filter(a => a !== '');

                    const result = executeFunction(funcName, args);
                    if (result !== undefined) {
                        variables[varName] = result;
                    }
                    continue;
                }

                // Number
                if (!isNaN(Number(value))) {
                    variables[varName] = Number(value);
                    continue;
                }

                // String
                const strMatch = value.match(/^["'](.*)["']$/);
                if (strMatch) {
                    variables[varName] = strMatch[1];
                }
                continue;
            }

            // Function call
            const funcCallMatch = trimmed.match(/^(\w+)\s*\(\s*([^)]*)\s*\)$/);
            if (funcCallMatch) {
                const funcName = funcCallMatch[1];
                const argsStr = funcCallMatch[2];

                if (funcName === 'print') {
                    const arg = argsStr.trim();

                    // Print function call result
                    const printFuncMatch = arg.match(/^(\w+)\s*\(\s*([^)]*)\s*\)$/);
                    if (printFuncMatch) {
                        const innerFunc = printFuncMatch[1];
                        const innerArgsStr = printFuncMatch[2];
                        const innerArgs = innerArgsStr.split(',').map(a => {
                            const argTrim = a.trim();
                            if (variables[argTrim] !== undefined) return variables[argTrim];
                            if (argTrim.startsWith('"') || argTrim.startsWith("'")) return argTrim.slice(1, -1);
                            if (!isNaN(Number(argTrim))) return Number(argTrim);
                            return argTrim;
                        }).filter(a => a !== '');

                        const result = executeFunction(innerFunc, innerArgs);
                        if (result !== undefined) {
                            outputLines.push(String(result));
                        }
                        continue;
                    }

                    // Print variable
                    if (variables[arg] !== undefined) {
                        if (Array.isArray(variables[arg])) {
                            outputLines.push('[' + variables[arg].join(', ') + ']');
                        } else {
                            outputLines.push(String(variables[arg]));
                        }
                        continue;
                    }

                    // Print string
                    const strMatch = arg.match(/^["'](.*)["']$/);
                    if (strMatch) {
                        outputLines.push(strMatch[1]);
                        continue;
                    }
                } else if (functions[funcName]) {
                    const args = argsStr.split(',').map(a => {
                        const arg = a.trim();
                        if (variables[arg] !== undefined) return variables[arg];
                        if (arg.startsWith('"') || arg.startsWith("'")) return arg.slice(1, -1);
                        if (!isNaN(Number(arg))) return Number(arg);
                        return arg;
                    }).filter(a => a !== '');

                    executeFunction(funcName, args);
                }
            }
        }

        return { output: outputLines.join('\n'), success: true };
    };

    // Challenge 1: Function with if/else
    const runChallenge1 = () => {
        try {
            const result = runFunctionCode(challenge1.code);
            const output = result.output;

            // Check if they used if/else in a function and returned/printed something
            const usedIf = challenge1.code.includes('if ');
            const usedDef = challenge1.code.includes('def ');
            const usedElse = challenge1.code.includes('else');
            const hasOutput = output.length > 0;

            const completed = usedIf && usedDef && usedElse && hasOutput;
            setChallenge1({ ...challenge1, output, completed });
        } catch {
            setChallenge1({ ...challenge1, output: 'Error in code!' });
        }
    };

    // Challenge 2: Function with lists
    const runChallenge2 = () => {
        try {
            const result = runFunctionCode(challenge2.code);
            const output = result.output;

            // Check if they created a function that works with a list
            const usedDef = challenge2.code.includes('def ');
            const usesList = challenge2.code.includes('[') || challenge2.code.includes('list');
            const hasOutput = output.length > 0;

            const completed = usedDef && usesList && hasOutput;
            setChallenge2({ ...challenge2, output, completed });
        } catch {
            setChallenge2({ ...challenge2, output: 'Error in code!' });
        }
    };

    // Challenge 3: Function with loop
    const runChallenge3 = () => {
        try {
            const result = runFunctionCode(challenge3.code);
            const output = result.output;

            // Check if they created a function with a for loop
            const usedDef = challenge3.code.includes('def ');
            const usedFor = challenge3.code.includes('for ');
            const hasOutput = output.length > 0;

            const completed = usedDef && usedFor && hasOutput;
            setChallenge3({ ...challenge3, output, completed });
        } catch {
            setChallenge3({ ...challenge3, output: 'Error in code!' });
        }
    };

    // Supercharge: Complete mini-program
    const runSupercharge = () => {
        try {
            const result = runFunctionCode(superchargeCode);
            const output = result.output;

            // Check if they used all concepts
            const usedDef = superchargeCode.includes('def ');
            const usedIf = superchargeCode.includes('if ');
            const usedFor = superchargeCode.includes('for ');
            const usesList = superchargeCode.includes('[');
            const hasOutput = output.length > 0;

            const completed = usedDef && usedIf && usedFor && usesList && hasOutput;

            setSuperchargeOutput(output);
            if (completed) {
                setSuperchargeDone(true);
            }
        } catch {
            setSuperchargeOutput('Error in code!');
        }
    };

    // Handle quiz
    const checkQuiz = () => {
        setQuizChecked(true);
        const correctAnswers = [1, 1, 1]; // B is correct for all 3

        if (quizAnswer === correctAnswers[quizStage - 1]) {
            if (quizStage < 3) {
                setTimeout(() => {
                    setQuizStage(quizStage + 1);
                    setQuizAnswer(null);
                    setQuizChecked(false);
                }, 1000);
            } else {
                setTimeout(() => {
                    setLessonComplete(true);
                }, 1000);
            }
        }
    };

    // Claim main XP
    const claimMainXp = () => {
        if (!xpClaimed && allChallengesComplete) {
            addXpAndCoins(LESSON.xpReward, 5);
            completeLevel(LESSON_ID, LESSON.xpReward, 5, 1, 60);
            setXpClaimed(true);
        }
    };

    // Claim supercharge XP
    const claimSuperchargeXp = () => {
        if (!superchargeXpClaimed && superchargeDone) {
            addXpAndCoins(25, 0);
            setSuperchargeXpClaimed(true);
        }
    };

    if (isLoading || !user) {
        return (
            <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
                <div className="flex items-center justify-center h-screen">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        style={{ fontSize: '3rem' }}
                    >
                        {LESSON.emoji}
                    </motion.div>
                </div>
            </div>
        );
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'var(--bg-primary)' }}>
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', duration: 0.8 }}
                    className={styles.successIcon}
                    style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
                >
                    <Check size={50} className="text-white" />
                </motion.div>
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={styles.successTitle}
                >
                    PRACTICE LEGEND!
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={styles.successMessage}
                >
                    {LESSON.successMessage} You've mastered advanced function concepts!
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
                    <Link href="/level4/lesson13" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'var(--accent-primary)' }}>
                        Final Project! <ChevronRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            <header className={styles.header} style={{ background: 'var(--bg-secondary)' }}>
                <Link href="/level4" className={styles.backBtn}>
                    <ArrowLeft size={18} /> Back
                </Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 13 - PRACTICE</span>
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
                        {/* Title */}
                        <div className={styles.lessonTitle}>
                            <motion.div
                                className={styles.lessonEmoji}
                                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
                            >
                                {LESSON.emoji}
                            </motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>{LESSON.subtitle}: <code style={{ color: 'var(--accent-primary)' }}>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Story/Mission Box */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))', borderColor: 'var(--accent-primary)' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <Target size={24} style={{ color: 'var(--accent-primary)' }} />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Time to Practice Advanced Functions!</span>
                            </div>
                            <p style={{ fontSize: '1.1rem' }}>
                                You've learned functions with if/else, lists, and loops!
                                Now put them all together!
                            </p>
                            <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                                Complete all 3 challenges to earn <strong>+{LESSON.xpReward} XP</strong>!
                            </p>
                        </motion.div>

                        {/* Progress Tracker */}
                        <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            marginBottom: '1.5rem',
                            padding: '1rem',
                            background: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius)'
                        }}>
                            {[challenge1, challenge2, challenge3].map((challenge, idx) => (
                                <div key={idx} style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{
                                        width: '2.5rem',
                                        height: '2.5rem',
                                        margin: '0 auto 0.25rem',
                                        borderRadius: '50%',
                                        background: challenge.completed ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {challenge.completed ? <Check size={18} /> : idx + 1}
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {idx === 0 ? 'if/else' : idx === 1 ? 'Lists' : 'Loops'}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Challenge 1: if/else in function */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={styles.codeSection}
                            style={{
                                border: challenge1.completed ? '2px solid rgba(16, 185, 129, 0.5)' : '1px solid var(--border-primary)',
                                borderRadius: 'var(--radius)',
                                padding: '1.5rem',
                                marginBottom: '1.5rem',
                                background: challenge1.completed ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-secondary)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>1. Function with if/else</span>
                                    {challenge1.completed && <Check size={20} className="text-emerald-400" />}
                                </div>
                                <button
                                    onClick={() => setChallenge1({ ...challenge1, showHint: !challenge1.showHint })}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                                        padding: '0.5rem 0.75rem',
                                        background: 'rgba(251, 191, 36, 0.2)',
                                        border: '1px solid rgba(251, 191, 36, 0.4)',
                                        borderRadius: '0.5rem', color: '#fbbf24', fontSize: '0.85rem', cursor: 'pointer'
                                    }}
                                >
                                    <HelpCircle size={16} /> Hint
                                </button>
                            </div>

                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                                <p style={{ margin: 0, fontWeight: 600 }}>Create a function that:</p>
                                <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <li>Takes an age as parameter</li>
                                    <li>Prints "Welcome!" if age is 13 or more</li>
                                    <li>Prints "Too young!" if age is less than 13</li>
                                </ul>
                            </div>

                            {challenge1.showHint && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    style={{
                                        background: 'rgba(251, 191, 36, 0.1)',
                                        border: '1px solid rgba(251, 191, 36, 0.3)',
                                        borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <Lightbulb size={16} className="text-amber-400" />
                                        <span style={{ color: '#fbbf24', fontWeight: 600 }}>Hint:</span>
                                    </div>
                                    <pre style={{ margin: 0, padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '0.25rem', fontSize: '0.85rem' }}>
{`def check_age(age):
    if age >= 13:
        print("Welcome!")
    else:
        print("Too young!")

check_age(15)`}
                                    </pre>
                                </motion.div>
                            )}

                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>age_check.py</span><span>Python</span></div>
                                <textarea
                                    value={challenge1.code}
                                    onChange={(e) => setChallenge1({ ...challenge1, code: e.target.value })}
                                    placeholder="# Create your age checking function here!"
                                    spellCheck={false}
                                    style={{ minHeight: '120px' }}
                                    disabled={challenge1.completed}
                                />
                            </div>

                            {!challenge1.completed && (
                                <button className={styles.runBtn} onClick={runChallenge1} style={{ background: 'var(--accent-primary)' }}>
                                    <Play size={18} /> Run Code
                                </button>
                            )}

                            {challenge1.output && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.outputBox}>
                                    <div className={styles.outputLabel}>{challenge1.completed ? 'Great job!' : 'Output:'}</div>
                                    <div className={styles.outputText}>{challenge1.output}</div>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Challenge 2: Function with lists */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className={styles.codeSection}
                            style={{
                                border: challenge2.completed ? '2px solid rgba(16, 185, 129, 0.5)' : '1px solid var(--border-primary)',
                                borderRadius: 'var(--radius)',
                                padding: '1.5rem',
                                marginBottom: '1.5rem',
                                background: challenge2.completed ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-secondary)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>2. Function with Lists</span>
                                    {challenge2.completed && <Check size={20} className="text-emerald-400" />}
                                </div>
                                <button
                                    onClick={() => setChallenge2({ ...challenge2, showHint: !challenge2.showHint })}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                                        padding: '0.5rem 0.75rem',
                                        background: 'rgba(251, 191, 36, 0.2)',
                                        border: '1px solid rgba(251, 191, 36, 0.4)',
                                        borderRadius: '0.5rem', color: '#fbbf24', fontSize: '0.85rem', cursor: 'pointer'
                                    }}
                                >
                                    <HelpCircle size={16} /> Hint
                                </button>
                            </div>

                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                                <p style={{ margin: 0, fontWeight: 600 }}>Create a function that:</p>
                                <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <li>Takes a list as parameter</li>
                                    <li>Prints the first item in the list</li>
                                </ul>
                            </div>

                            {challenge2.showHint && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    style={{
                                        background: 'rgba(251, 191, 36, 0.1)',
                                        border: '1px solid rgba(251, 191, 36, 0.3)',
                                        borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem'
                                    }}
                                >
                                    <pre style={{ margin: 0, padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '0.25rem', fontSize: '0.85rem' }}>
{`def print_first(my_list):
    print(my_list)

items = ["apple", "banana"]
print_first(items)`}
                                    </pre>
                                </motion.div>
                            )}

                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>list_func.py</span><span>Python</span></div>
                                <textarea
                                    value={challenge2.code}
                                    onChange={(e) => setChallenge2({ ...challenge2, code: e.target.value })}
                                    placeholder="# Create your list function here!"
                                    spellCheck={false}
                                    style={{ minHeight: '120px' }}
                                    disabled={challenge2.completed}
                                />
                            </div>

                            {!challenge2.completed && (
                                <button className={styles.runBtn} onClick={runChallenge2} style={{ background: 'var(--accent-primary)' }}>
                                    <Play size={18} /> Run Code
                                </button>
                            )}

                            {challenge2.output && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.outputBox}>
                                    <div className={styles.outputLabel}>{challenge2.completed ? 'Perfect!' : 'Output:'}</div>
                                    <div className={styles.outputText}>{challenge2.output}</div>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Challenge 3: Function with loop */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className={styles.codeSection}
                            style={{
                                border: challenge3.completed ? '2px solid rgba(16, 185, 129, 0.5)' : '1px solid var(--border-primary)',
                                borderRadius: 'var(--radius)',
                                padding: '1.5rem',
                                marginBottom: '1.5rem',
                                background: challenge3.completed ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-secondary)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>3. Function with Loop</span>
                                    {challenge3.completed && <Check size={20} className="text-emerald-400" />}
                                </div>
                                <button
                                    onClick={() => setChallenge3({ ...challenge3, showHint: !challenge3.showHint })}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                                        padding: '0.5rem 0.75rem',
                                        background: 'rgba(251, 191, 36, 0.2)',
                                        border: '1px solid rgba(251, 191, 36, 0.4)',
                                        borderRadius: '0.5rem', color: '#fbbf24', fontSize: '0.85rem', cursor: 'pointer'
                                    }}
                                >
                                    <HelpCircle size={16} /> Hint
                                </button>
                            </div>

                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                                <p style={{ margin: 0, fontWeight: 600 }}>Create a function that:</p>
                                <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <li>Takes a number as parameter</li>
                                    <li>Uses a for loop to print "Hi!" that many times</li>
                                </ul>
                            </div>

                            {challenge3.showHint && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    style={{
                                        background: 'rgba(251, 191, 36, 0.1)',
                                        border: '1px solid rgba(251, 191, 36, 0.3)',
                                        borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem'
                                    }}
                                >
                                    <pre style={{ margin: 0, padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '0.25rem', fontSize: '0.85rem' }}>
{`def say_hi(count):
    for i in range(count):
        print("Hi!")

say_hi(3)`}
                                    </pre>
                                </motion.div>
                            )}

                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>loop_func.py</span><span>Python</span></div>
                                <textarea
                                    value={challenge3.code}
                                    onChange={(e) => setChallenge3({ ...challenge3, code: e.target.value })}
                                    placeholder="# Create your loop function here!"
                                    spellCheck={false}
                                    style={{ minHeight: '120px' }}
                                    disabled={challenge3.completed}
                                />
                            </div>

                            {!challenge3.completed && (
                                <button className={styles.runBtn} onClick={runChallenge3} style={{ background: 'var(--accent-primary)' }}>
                                    <Play size={18} /> Run Code
                                </button>
                            )}

                            {challenge3.output && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.outputBox}>
                                    <div className={styles.outputLabel}>{challenge3.completed ? 'Awesome!' : 'Output:'}</div>
                                    <div className={styles.outputText}>{challenge3.output}</div>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Claim Main XP Button */}
                        {allChallengesComplete && !xpClaimed && (
                            <motion.button
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                onClick={claimMainXp}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    width: '100%', padding: '1rem', marginBottom: '2rem',
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    border: 'none', borderRadius: 'var(--radius)',
                                    color: 'white', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer'
                                }}
                            >
                                <Zap size={20} fill="currentColor" /> Claim +{LESSON.xpReward} XP - All Challenges Complete!
                            </motion.button>
                        )}

                        {/* SUPERCHARGE Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            style={{
                                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.25))',
                                border: '2px solid rgba(251, 191, 36, 0.4)',
                                borderRadius: 'var(--radius)', padding: '1.5rem', marginTop: '2rem'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <motion.span
                                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Zap size={28} className="text-amber-400" fill="currentColor" />
                                </motion.span>
                                <div>
                                    <h3 style={{ margin: 0, color: '#fbbf24', fontWeight: 800 }}>SUPERCHARGE - Mini Program</h3>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Optional +25 XP</p>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                                <p style={{ margin: 0, fontWeight: 600, marginBottom: '0.5rem' }}>Build a complete mini-program using ALL concepts:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <li>Use <code>def</code> to create a function</li>
                                    <li>Use <code>if/else</code> for decisions</li>
                                    <li>Use a <code>for</code> loop</li>
                                    <li>Work with a list <code>[]</code></li>
                                </ul>
                            </div>

                            <button
                                onClick={() => setShowSuperchargeHint(!showSuperchargeHint)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                                    padding: '0.5rem 0.75rem', background: 'rgba(251, 191, 36, 0.2)',
                                    border: '1px solid rgba(251, 191, 36, 0.4)', borderRadius: '0.5rem',
                                    color: '#fbbf24', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '1rem'
                                }}
                            >
                                <HelpCircle size={16} /> {showSuperchargeHint ? 'Hide Hint' : 'Show Hint'}
                            </button>

                            {showSuperchargeHint && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}
                                >
                                    <pre style={{ margin: 0, fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
{`# Grade students based on their scores
def grade_students(scores):
    for score in scores:
        if score >= 70:
            print("Pass!")
        else:
            print("Try again!")

student_scores = [85, 60, 92, 45]
grade_students(student_scores)`}
                                    </pre>
                                </motion.div>
                            )}

                            <div className={styles.editor}>
                                <div className={styles.codeHeader}>
                                    <span>mini_program.py</span>
                                    <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Zap size={14} fill="currentColor" /> BONUS
                                    </span>
                                </div>
                                <textarea
                                    value={superchargeCode}
                                    onChange={(e) => setSuperchargeCode(e.target.value)}
                                    placeholder="# Build your mini-program here!"
                                    spellCheck={false}
                                    style={{ minHeight: '200px' }}
                                    disabled={superchargeDone}
                                />
                            </div>

                            <button
                                className={styles.runBtn}
                                onClick={runSupercharge}
                                style={{ background: superchargeDone ? '#10b981' : '#f59e0b' }}
                                disabled={superchargeDone}
                            >
                                <Play size={18} /> {superchargeDone ? 'Complete!' : 'Run Program'}
                            </button>

                            {superchargeOutput && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.outputBox}>
                                    <div className={styles.outputLabel}>{superchargeDone ? 'SUPERCHARGED!' : 'Output:'}</div>
                                    <div className={styles.outputText}>{superchargeOutput}</div>
                                </motion.div>
                            )}

                            {superchargeDone && !superchargeXpClaimed && (
                                <motion.button
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    onClick={claimSuperchargeXp}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        width: '100%', padding: '1rem', marginTop: '1rem',
                                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                        border: 'none', borderRadius: 'var(--radius)',
                                        color: 'white', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer'
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
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        padding: '1rem', marginTop: '1rem',
                                        background: 'rgba(16, 185, 129, 0.2)',
                                        border: '1px solid rgba(16, 185, 129, 0.4)',
                                        borderRadius: 'var(--radius)', color: '#10b981', fontWeight: 600
                                    }}
                                >
                                    <Check size={20} /> +25 XP Claimed!
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Navigation */}
                        <div className={styles.navBar}>
                            <Link href="/level4/lesson11" className={`${styles.navBtn} ${styles.secondary}`}>
                                <ChevronLeft size={18} /> Previous
                            </Link>
                            {allChallengesComplete && xpClaimed ? (
                                <button
                                    className={`${styles.navBtn} ${styles.primary}`}
                                    onClick={() => setShowQuiz(true)}
                                    style={{ background: 'var(--accent-primary)' }}
                                >
                                    Quiz Time! <ChevronRight size={18} />
                                </button>
                            ) : (
                                <button className={`${styles.navBtn} ${styles.secondary}`} disabled style={{ opacity: 0.5 }}>
                                    Complete All Challenges <ChevronRight size={18} />
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    /* Quiz Section */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={styles.quizSection}
                        style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(168, 85, 247, 0.1))' }}
                    >
                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{
                                background: 'var(--accent-primary)',
                                padding: '0.25rem 0.75rem', borderRadius: '9999px',
                                fontSize: '0.85rem', fontWeight: 600
                            }}>
                                Question {quizStage} of 3
                            </span>
                        </div>

                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ fontSize: '3rem', marginBottom: '1rem' }}
                        >
                            🧠
                        </motion.div>
                        <h2 className={styles.quizTitle}>Review Quiz!</h2>

                        {quizStage === 1 && (
                            <>
                                <p className={styles.quizQuestion}>Can functions have if/else statements inside them?</p>
                                <div className={styles.quizOptions}>
                                    {['A) No', 'B) Yes!'].map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => !quizChecked && setQuizAnswer(idx)}
                                            className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''} ${quizChecked && idx === 1 ? styles.correct : ''} ${quizChecked && quizAnswer === idx && idx !== 1 ? styles.wrong : ''}`}
                                            disabled={quizChecked}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {quizStage === 2 && (
                            <>
                                <p className={styles.quizQuestion}>Can you pass a list to a function?</p>
                                <div className={styles.quizOptions}>
                                    {['A) No, only numbers', 'B) Yes, any data!'].map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => !quizChecked && setQuizAnswer(idx)}
                                            className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''} ${quizChecked && idx === 1 ? styles.correct : ''} ${quizChecked && quizAnswer === idx && idx !== 1 ? styles.wrong : ''}`}
                                            disabled={quizChecked}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {quizStage === 3 && (
                            <>
                                <p className={styles.quizQuestion}>Can functions contain for loops?</p>
                                <div className={styles.quizOptions}>
                                    {['A) No', 'B) Yes!'].map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => !quizChecked && setQuizAnswer(idx)}
                                            className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''} ${quizChecked && idx === 1 ? styles.correct : ''} ${quizChecked && quizAnswer === idx && idx !== 1 ? styles.wrong : ''}`}
                                            disabled={quizChecked}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {!quizChecked ? (
                            <button
                                className={styles.quizBtn}
                                onClick={checkQuiz}
                                disabled={quizAnswer === null}
                                style={{ background: 'var(--accent-primary)' }}
                            >
                                Check Answer
                            </button>
                        ) : quizAnswer !== 1 ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>Functions can contain ANY Python code - if/else, loops, lists, and more!</p>
                                <button className={styles.quizBtn} onClick={() => { setQuizChecked(false); setQuizAnswer(null); }} style={{ marginTop: '1rem' }}>
                                    Try Again
                                </button>
                            </motion.div>
                        ) : quizStage < 3 ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${styles.quizFeedback} ${styles.success}`}>
                                <h4>Correct!</h4>
                                <p>Moving to next question...</p>
                            </motion.div>
                        ) : null}

                        <button
                            onClick={() => setShowQuiz(false)}
                            style={{
                                marginTop: '1.5rem', padding: '0.5rem 1rem',
                                background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '0.5rem', color: 'var(--text-muted)', cursor: 'pointer'
                            }}
                        >
                            <ChevronLeft size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Back to Lesson
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
