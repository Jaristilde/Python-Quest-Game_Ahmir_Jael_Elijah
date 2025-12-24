'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Download, Users, Target, CheckCircle, Lightbulb, Clock, Code, Award, Lock, Unlock, Trash2, RefreshCcw, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { getAllUsers, deleteUser, resetUserProgress, TEACHER_PASSWORD, getAvatarEmoji, User } from '../lib/auth';
import styles from './teacher.module.css';

export default function TeacherGuide() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showDashboard, setShowDashboard] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            setUsers(getAllUsers());
        }
    }, [isAuthenticated]);

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === TEACHER_PASSWORD) {
            setIsAuthenticated(true);
            setPasswordError('');
        } else {
            setPasswordError('Incorrect password. Try again!');
        }
    };

    const handleDeleteUser = (userId: string) => {
        if (confirm('Are you sure you want to delete this user? This cannot be undone.')) {
            deleteUser(userId);
            setUsers(getAllUsers());
            setSelectedUser(null);
        }
    };

    const handleResetProgress = (userId: string) => {
        if (confirm('Reset this user\'s progress? They will start from Level 1 with 0 XP.')) {
            resetUserProgress(userId);
            setUsers(getAllUsers());
            if (selectedUser?.id === userId) {
                setSelectedUser(getAllUsers().find(u => u.id === userId) || null);
            }
        }
    };

    const exportProgress = () => {
        const report = users.map(user => {
            return `
=== ${user.username} ===
Avatar: ${getAvatarEmoji(user.avatar)}
Created: ${new Date(user.createdAt).toLocaleDateString()}
Last Active: ${new Date(user.progress.lastActive).toLocaleDateString()}

Stats:
- Current Level: ${user.progress.currentLevel}
- Total XP: ${user.progress.xp}
- Coins: ${user.progress.coins}
- Lives: ${user.progress.lives}
- Total Time Played: ${Math.round(user.progress.totalTimePlayed / 60)} minutes

Completed Levels:
${user.progress.completedLevels.map(l => `  - Level ${l.level}: ${l.xpEarned} XP, ${l.attempts} attempts`).join('\n') || '  None yet'}
`;
        }).join('\n---\n');

        const blob = new Blob([`Python Adventure Quest - Progress Report\nGenerated: ${new Date().toLocaleString()}\n\n${report}`], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `progress-report-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const levels = [
        {
            level: 1,
            title: "Robot Message Machine",
            skills: ["print()", "Strings", "Quotes & Parentheses"],
            objectives: [
                "Understand Python's print function",
                "Use quotation marks correctly",
                "Run code and see results"
            ],
            tips: "Let them experiment! If they type print(Hello) without quotes, let them see the error.",
            duration: "15-20 min"
        },
        {
            level: 2,
            title: "Math Ninja",
            skills: ["Variables", "Numbers", "Basic Math"],
            objectives: [
                "Store values in variables",
                "Perform addition, subtraction, multiplication",
                "Understand variable naming"
            ],
            tips: "Encourage them to change numbers and see what happens. Hands-on is the best way to learn!",
            duration: "20-25 min"
        },
        {
            level: 3,
            title: "Combine Text",
            skills: ["String Concatenation", "f-strings", "User Input"],
            objectives: [
                "Join text together",
                "Use input() to get user responses",
                "Create personalized messages"
            ],
            tips: "Have them create a greeting with their own name. Personalization boosts engagement.",
            duration: "20-25 min"
        }
    ];

    return (
        <main className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <Link href="/" className={styles.backButton}>
                    <ArrowLeft size={20} /> Back to Home
                </Link>
                <div className={styles.headerTitle}>
                    <BookOpen size={28} className="text-indigo-400" />
                    <h1>Teacher & Parent Guide</h1>
                </div>
            </header>

            <div className={styles.content}>
                {/* Dashboard Toggle */}
                <div className={styles.dashboardToggle}>
                    <button
                        onClick={() => setShowDashboard(!showDashboard)}
                        className={`${styles.toggleButton} ${showDashboard ? styles.toggleActive : ''}`}
                    >
                        <Users size={18} />
                        Student Dashboard
                        {showDashboard ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>

                {/* Student Dashboard (Password Protected) */}
                {showDashboard && (
                    <motion.section
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={styles.dashboardSection}
                    >
                        {!isAuthenticated ? (
                            <div className={styles.passwordForm}>
                                <Lock size={40} className="text-indigo-400 mb-4" />
                                <h3>Teacher Access Required</h3>
                                <p className="text-slate-400 mb-4">Enter the teacher password to view student progress.</p>
                                <form onSubmit={handlePasswordSubmit}>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter password"
                                        className={styles.passwordInput}
                                    />
                                    {passwordError && <p className={styles.passwordError}>{passwordError}</p>}
                                    <button type="submit" className="btn btn-primary w-full mt-4">
                                        <Unlock size={18} /> Unlock Dashboard
                                    </button>
                                </form>
                                <p className={styles.hint}>Hint: teacher2024</p>
                            </div>
                        ) : (
                            <div className={styles.dashboardContent}>
                                <div className={styles.dashboardHeader}>
                                    <h3><Users size={20} /> Registered Students ({users.length}/15)</h3>
                                    <button onClick={exportProgress} className="btn btn-secondary">
                                        <Download size={16} /> Export Report
                                    </button>
                                </div>

                                {users.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <p>No students registered yet.</p>
                                    </div>
                                ) : (
                                    <div className={styles.userGrid}>
                                        {users.map(user => (
                                            <div
                                                key={user.id}
                                                className={`${styles.userCard} ${selectedUser?.id === user.id ? styles.userCardActive : ''}`}
                                                onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                                            >
                                                <div className={styles.userCardHeader}>
                                                    <span className={styles.userCardAvatar}>{getAvatarEmoji(user.avatar)}</span>
                                                    <div>
                                                        <div className={styles.userCardName}>{user.username}</div>
                                                        <div className={styles.userCardLevel}>Level {user.progress.currentLevel}</div>
                                                    </div>
                                                    <div className={styles.userCardXp}>{user.progress.xp} XP</div>
                                                </div>

                                                {selectedUser?.id === user.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className={styles.userCardDetails}
                                                    >
                                                        <div className={styles.detailsGrid}>
                                                            <div><span>Lives:</span> {user.progress.lives} ❤️</div>
                                                            <div><span>Coins:</span> {user.progress.coins} 🪙</div>
                                                            <div><span>Joined:</span> {formatDate(user.createdAt)}</div>
                                                            <div><span>Last Active:</span> {formatDate(user.progress.lastActive)}</div>
                                                        </div>

                                                        <div className={styles.completedLevels}>
                                                            <strong>Completed:</strong>
                                                            {user.progress.completedLevels.length === 0 ? (
                                                                <span className="ml-2 text-slate-500">None yet</span>
                                                            ) : (
                                                                <div className={styles.levelBadges}>
                                                                    {user.progress.completedLevels.map(l => (
                                                                        <span key={l.level} className={styles.levelBadge}>
                                                                            Lv.{l.level}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className={styles.userCardActions}>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleResetProgress(user.id); }}
                                                                className={styles.resetBtn}
                                                            >
                                                                <RefreshCcw size={14} /> Reset
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDeleteUser(user.id); }}
                                                                className={styles.deleteBtn}
                                                            >
                                                                <Trash2 size={14} /> Delete
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.section>
                )}

                {/* Welcome Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.welcomeSection}
                >
                    <h2 className={styles.sectionTitle}>Welcome, Educators! 👋</h2>
                    <p className={styles.welcomeText}>
                        Python Adventure Quest is designed for kids ages <strong>9-12</strong> learning to code on Chromebooks.
                        This guide helps you support students as they progress through the levels.
                    </p>

                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <Users size={32} className="text-indigo-400" />
                            <div>
                                <div className={styles.statValue}>{users.length || 0}</div>
                                <div className={styles.statLabel}>Students</div>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <Target size={32} className="text-pink-400" />
                            <div>
                                <div className={styles.statValue}>14</div>
                                <div className={styles.statLabel}>Lessons</div>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <Clock size={32} className="text-amber-400" />
                            <div>
                                <div className={styles.statValue}>~60</div>
                                <div className={styles.statLabel}>Minutes Total</div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Curriculum Overview */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>📚 Level Curriculum</h2>
                    <div className={styles.levelCards}>
                        {levels.map((lvl, idx) => (
                            <motion.div
                                key={lvl.level}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={styles.levelCard}
                            >
                                <div className={styles.levelHeader}>
                                    <span className={styles.levelBadgeStyle}>Level {lvl.level}</span>
                                    <span className={styles.duration}><Clock size={14} /> {lvl.duration}</span>
                                </div>
                                <h3 className={styles.levelTitle}>{lvl.title}</h3>

                                <div className={styles.skillTags}>
                                    {lvl.skills.map(skill => (
                                        <span key={skill} className={styles.skillTag}><Code size={12} /> {skill}</span>
                                    ))}
                                </div>

                                <div className={styles.objectives}>
                                    <h4><Target size={14} /> Learning Objectives</h4>
                                    <ul>
                                        {lvl.objectives.map((obj, i) => (
                                            <li key={i}><CheckCircle size={14} className="text-green-400" /> {obj}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className={styles.teacherTip}>
                                    <Lightbulb size={16} className="text-amber-400" />
                                    <span><strong>Tip:</strong> {lvl.tips}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* How to Guide Kids */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>🧑‍🏫 How to Guide Kids</h2>
                    <div className={styles.guideGrid}>
                        <div className={styles.guideCard}>
                            <h4>1. Don't Give Answers</h4>
                            <p>Let them struggle a little! The hint system will help after 2 failed tries. This builds problem-solving skills.</p>
                        </div>
                        <div className={styles.guideCard}>
                            <h4>2. Celebrate Errors</h4>
                            <p>Errors are learning moments! When they see a red message, ask: "What do you think went wrong?"</p>
                        </div>
                        <div className={styles.guideCard}>
                            <h4>3. Encourage Experimentation</h4>
                            <p>Ask them to change a number or word and predict what will happen before running the code.</p>
                        </div>
                        <div className={styles.guideCard}>
                            <h4>4. Use the Hearts Wisely</h4>
                            <p>Kids have 5 hearts. Losing one isn't bad — it's a chance to learn. But skipping too much means less practice.</p>
                        </div>
                    </div>
                </section>

                {/* Progress Tracking */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>📊 Progress Tracking</h2>
                    <div className={styles.progressInfo}>
                        <p>Each child's progress is tracked automatically:</p>
                        <ul>
                            <li><Award size={16} className="text-amber-400" /> <strong>XP</strong> — Earned for correct answers</li>
                            <li><span className="text-amber-400">🪙</span> <strong>Coins</strong> — Collected for future rewards (skins, robot colors)</li>
                            <li><span className="text-red-400">❤️</span> <strong>Hearts</strong> — Lost after 3 wrong attempts; used to skip if stuck</li>
                        </ul>
                        <p className="mt-4 text-slate-400 text-sm">
                            Use the Student Dashboard above to view detailed progress for each child.
                        </p>
                    </div>
                </section>

                {/* Quick Actions */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>🚀 Quick Actions</h2>
                    <div className={styles.actionButtons}>
                        <Link href="/level1" className="btn btn-primary">
                            <Award size={18} /> Preview Level 1
                        </Link>
                        <button className="btn btn-secondary" onClick={() => window.print()}>
                            <Download size={18} /> Print This Guide
                        </button>
                    </div>
                </section>
            </div>
        </main>
    );
}
