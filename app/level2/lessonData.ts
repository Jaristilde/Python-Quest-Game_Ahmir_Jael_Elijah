// Lesson data for Level 2: Flow Control - "Making Smart Decisions"
// Theme: Teaching kids how computers make decisions and repeat actions
// Final Project: Rock, Paper, Scissors

export interface LessonData {
    id: number;
    title: string;
    subtitle: string;
    emoji: string;
    concept: string;
    xpReward: number;
    successMessage: string;
    description: string;
    lessonType: 'learn' | 'practice' | 'project';
    hasSupercharge?: boolean;
}

export const LEVEL2_LESSONS: LessonData[] = [
    // === CONDITIONALS SECTION (Lessons 1-8) ===
    {
        id: 1,
        title: "Making Decisions",
        subtitle: "Teaching Your Computer to Choose",
        emoji: "🚦",
        concept: "if statements",
        xpReward: 10,
        successMessage: "Decision Maker unlocked!",
        description: "Teach Robo to make choices using 'if'",
        lessonType: 'learn'
    },
    {
        id: 2,
        title: "Using Conditions",
        subtitle: "Asking Yes or No Questions",
        emoji: "❓",
        concept: "== != > < comparisons",
        xpReward: 10,
        successMessage: "Question Asker achieved!",
        description: "Learn to ask the computer yes/no questions",
        lessonType: 'learn'
    },
    {
        id: 3,
        title: "Conditional Statements 1",
        subtitle: "Practice Time!",
        emoji: "🎯",
        concept: "if + conditions practice",
        xpReward: 15,
        successMessage: "Practice Champion!",
        description: "Practice making decisions with if statements",
        lessonType: 'practice',
        hasSupercharge: true
    },
    {
        id: 4,
        title: "Coding Else Statements",
        subtitle: "What If It's NOT True?",
        emoji: "🔀",
        concept: "if/else",
        xpReward: 10,
        successMessage: "Else Expert!",
        description: "Learn what to do when conditions are False",
        lessonType: 'learn'
    },
    {
        id: 5,
        title: "Incorporating Elif",
        subtitle: "More Than Two Choices",
        emoji: "🎚️",
        concept: "elif chains",
        xpReward: 10,
        successMessage: "Multi-Choice Master!",
        description: "Handle many different options with elif",
        lessonType: 'learn'
    },
    {
        id: 6,
        title: "Using Complex Decisions",
        subtitle: "Combining Questions",
        emoji: "🧩",
        concept: "and, or, not",
        xpReward: 10,
        successMessage: "Logic Wizard!",
        description: "Combine multiple conditions with and/or",
        lessonType: 'learn'
    },
    {
        id: 7,
        title: "Conditional Statements 2",
        subtitle: "More Practice!",
        emoji: "💪",
        concept: "if/elif/else + logic practice",
        xpReward: 15,
        successMessage: "Decision Pro!",
        description: "Master all conditional statements",
        lessonType: 'practice',
        hasSupercharge: true
    },
    {
        id: 8,
        title: "Rock, Paper, Scissors",
        subtitle: "Guided Project — Part 1",
        emoji: "✊",
        concept: "Game Logic",
        xpReward: 25,
        successMessage: "Game Builder!",
        description: "Build the basic Rock, Paper, Scissors game",
        lessonType: 'project'
    },

    // === LOOPS SECTION (Lessons 9-17) ===
    {
        id: 9,
        title: "Self-assigning and Operators",
        subtitle: "Shortcuts for Math",
        emoji: "⚡",
        concept: "+= -= *= /=",
        xpReward: 10,
        successMessage: "Shortcut Ninja!",
        description: "Update numbers the fast way",
        lessonType: 'learn'
    },
    {
        id: 10,
        title: "While Loops",
        subtitle: "Keep Going Until...",
        emoji: "🔄",
        concept: "while loops",
        xpReward: 10,
        successMessage: "Loop Starter!",
        description: "Make code repeat while something is true",
        lessonType: 'learn'
    },
    {
        id: 11,
        title: "Stopping While Loops",
        subtitle: "Knowing When to Stop",
        emoji: "🛑",
        concept: "loop conditions",
        xpReward: 10,
        successMessage: "Loop Stopper!",
        description: "Control when loops end",
        lessonType: 'learn'
    },
    {
        id: 12,
        title: "Loops 1",
        subtitle: "Practice Time!",
        emoji: "🎯",
        concept: "while loop practice",
        xpReward: 15,
        successMessage: "Loop Champ!",
        description: "Practice while loops",
        lessonType: 'practice',
        hasSupercharge: true
    },
    {
        id: 13,
        title: "Controlling While Loops",
        subtitle: "Steering Your Loop",
        emoji: "🎮",
        concept: "loop control patterns",
        xpReward: 10,
        successMessage: "Loop Controller!",
        description: "Advanced loop control techniques",
        lessonType: 'learn'
    },
    {
        id: 14,
        title: "For Loops",
        subtitle: "Do This Exactly X Times",
        emoji: "🔁",
        concept: "for loops + range()",
        xpReward: 10,
        successMessage: "For Loop Hero!",
        description: "Repeat code a specific number of times",
        lessonType: 'learn'
    },
    {
        id: 15,
        title: "Loops 2",
        subtitle: "More Practice!",
        emoji: "💪",
        concept: "for loop practice",
        xpReward: 15,
        successMessage: "Loop Master!",
        description: "Practice for loops",
        lessonType: 'practice',
        hasSupercharge: true
    },
    {
        id: 16,
        title: "Advanced Loop Control",
        subtitle: "Skip and Break",
        emoji: "⏭️",
        concept: "break + continue",
        xpReward: 10,
        successMessage: "Loop Commander!",
        description: "Control loops with break and continue",
        lessonType: 'learn'
    },
    {
        id: 17,
        title: "Loops 3",
        subtitle: "Final Practice!",
        emoji: "🏆",
        concept: "all loops practice",
        xpReward: 15,
        successMessage: "Loop Legend!",
        description: "Master all loop types",
        lessonType: 'practice',
        hasSupercharge: true
    },
    {
        id: 18,
        title: "Rock, Paper, Scissors",
        subtitle: "Guided Project — Part 2",
        emoji: "🎮",
        concept: "Complete Game",
        xpReward: 25,
        successMessage: "GAME DEVELOPER! Level 2 Complete!",
        description: "Add best-of-3 rounds and score tracking",
        lessonType: 'project'
    }
];

// Calculate total XP for Level 2
// Learn: 10 XP x 9 = 90
// Practice: 15 XP x 5 = 75
// Project: 25 XP x 2 = 50
// Supercharge: 25 XP x 5 = 125 (optional)
// Total required: 215 XP, Total possible: 340 XP
export const TOTAL_LEVEL2_XP = LEVEL2_LESSONS.reduce((sum, l) => sum + l.xpReward, 0);
export const TOTAL_SUPERCHARGE_XP = LEVEL2_LESSONS.filter(l => l.hasSupercharge).length * 25;
