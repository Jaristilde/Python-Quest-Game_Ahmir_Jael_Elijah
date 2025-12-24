'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Download, Users, Target, CheckCircle, Lightbulb, Clock, Code, Award } from 'lucide-react';
import Link from 'next/link';
import styles from './teacher.module.css';

export default function TeacherGuide() {
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
                {/* Welcome Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.welcomeSection}
                >
                    <h2 className={styles.sectionTitle}>Welcome, Educators! 👋</h2>
                    <p className={styles.welcomeText}>
                        Python Adventure Quest is designed for kids ages <strong>9-12</strong> learning to code on Chromebooks.
                        This guide helps you support <strong>Jael</strong>, <strong>Ahmir</strong>, and <strong>Elijah</strong> as they progress through the levels.
                    </p>

                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <Users size={32} className="text-indigo-400" />
                            <div>
                                <div className={styles.statValue}>3</div>
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
                                    <span className={styles.levelBadge}>Level {lvl.level}</span>
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
                            Note: In future updates, you'll be able to export progress reports as PDF or CSV.
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
