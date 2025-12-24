// Lesson data for all 10 lessons in Level 1
export interface LessonData {
    id: number;
    title: string;
    emoji: string;
    concept: string;
    xpReward: number;
    successMessage: string;
}

export const LEVEL1_LESSONS: LessonData[] = [
    {
        id: 1,
        title: "Make Your Computer Talk",
        emoji: "🗣️",
        concept: "print()",
        xpReward: 10,
        successMessage: "You made your computer talk!"
    },
    {
        id: 2,
        title: "Give Things Names",
        emoji: "🏷️",
        concept: "Variables",
        xpReward: 10,
        successMessage: "You taught your computer to remember!"
    },
    {
        id: 3,
        title: "Putting Words Together",
        emoji: "🔗",
        concept: "Word Smooshing",
        xpReward: 10,
        successMessage: "Word Smoosher!"
    },
    {
        id: 4,
        title: "Computer Math",
        emoji: "🧮",
        concept: "Math (+, -, *, /)",
        xpReward: 10,
        successMessage: "Math Wizard!"
    },
    {
        id: 5,
        title: "Saving Math Answers",
        emoji: "💾",
        concept: "Variables with Numbers",
        xpReward: 10,
        successMessage: "Number Keeper!"
    },
    {
        id: 6,
        title: "Asking Yes or No",
        emoji: "❓",
        concept: "Comparisons",
        xpReward: 10,
        successMessage: "Question Asker!"
    },
    {
        id: 7,
        title: "The Magic Fill-in-the-Blank",
        emoji: "✨",
        concept: "f-strings",
        xpReward: 10,
        successMessage: "Fill-in-the-Blank Master!"
    },
    {
        id: 8,
        title: "If This, Then That",
        emoji: "🔀",
        concept: "if statements",
        xpReward: 15,
        successMessage: "Decision Maker!"
    },
    {
        id: 9,
        title: "Making Lists",
        emoji: "📝",
        concept: "Lists",
        xpReward: 15,
        successMessage: "List Maker!"
    },
    {
        id: 10,
        title: "Repeat After Me",
        emoji: "🔁",
        concept: "Loops",
        xpReward: 20,
        successMessage: "Loop Legend!"
    }
];

export const TOTAL_LEVEL1_XP = LEVEL1_LESSONS.reduce((sum, l) => sum + l.xpReward, 0);
