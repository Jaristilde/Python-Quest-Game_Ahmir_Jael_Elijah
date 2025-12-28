// Lesson data for all 13 lessons in Level 4: Functions
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

export const LEVEL4_LESSONS: LessonData[] = [
    {
        id: 1,
        title: "Reusing Code with Functions",
        subtitle: "Create Your Own Commands",
        emoji: "🔧",
        concept: "def, function basics",
        xpReward: 10,
        successMessage: "You created your first function!",
        description: "Teach your robot a new trick it can do over and over",
        lessonType: 'learn'
    },
    {
        id: 2,
        title: "Creating Parameters",
        subtitle: "Give Your Function Information",
        emoji: "🎁",
        concept: "Parameters",
        xpReward: 10,
        successMessage: "You learned to pass information to functions!",
        description: "Make functions that accept different inputs",
        lessonType: 'learn'
    },
    {
        id: 3,
        title: "Returning Values",
        subtitle: "Get Answers Back from Functions",
        emoji: "📤",
        concept: "return statement",
        xpReward: 10,
        successMessage: "You learned to get answers from functions!",
        description: "Make functions that calculate and return answers",
        lessonType: 'learn'
    },
    {
        id: 4,
        title: "Using Multiple Parameters",
        subtitle: "Send More Than One Thing",
        emoji: "📦",
        concept: "Multiple parameters",
        xpReward: 10,
        successMessage: "You mastered multiple parameters!",
        description: "Create functions that accept multiple pieces of information",
        lessonType: 'learn'
    },
    {
        id: 5,
        title: "Understanding Functions",
        subtitle: "Putting It All Together",
        emoji: "🧩",
        concept: "Function review",
        xpReward: 10,
        successMessage: "You understand how functions work!",
        description: "Review and combine everything you learned about functions",
        lessonType: 'learn'
    },
    {
        id: 6,
        title: "Functions 1",
        subtitle: "Practice Time!",
        emoji: "🎯",
        concept: "def, parameters, return",
        xpReward: 15,
        successMessage: "Practice Champion!",
        description: "Practice creating and using functions",
        lessonType: 'practice',
        hasSupercharge: true
    },
    {
        id: 7,
        title: "Food Order System - Part 1",
        subtitle: "Build the Menu",
        emoji: "🍕",
        concept: "Guided Project",
        xpReward: 25,
        successMessage: "You built the restaurant menu!",
        description: "Create functions for a pizza restaurant",
        lessonType: 'project'
    },
    {
        id: 8,
        title: "Functions and Variable Scope",
        subtitle: "Where Variables Live",
        emoji: "🏠",
        concept: "Local vs global scope",
        xpReward: 10,
        successMessage: "You understand variable scope!",
        description: "Learn where variables can be used",
        lessonType: 'learn'
    },
    {
        id: 9,
        title: "Deciding with Functions",
        subtitle: "Functions That Make Choices",
        emoji: "🔀",
        concept: "if/else in functions",
        xpReward: 10,
        successMessage: "Your functions can make decisions!",
        description: "Create functions that use if/else statements",
        lessonType: 'learn'
    },
    {
        id: 10,
        title: "Functions with Lists",
        subtitle: "Functions That Work with Lists",
        emoji: "📋",
        concept: "Lists in functions",
        xpReward: 10,
        successMessage: "Your functions can handle lists!",
        description: "Create functions that work with lists",
        lessonType: 'learn'
    },
    {
        id: 11,
        title: "Functions with Loops",
        subtitle: "Functions That Repeat",
        emoji: "🔁",
        concept: "Loops in functions",
        xpReward: 10,
        successMessage: "Your functions can loop!",
        description: "Create functions that use loops",
        lessonType: 'learn'
    },
    {
        id: 12,
        title: "Functions 2",
        subtitle: "Advanced Practice!",
        emoji: "💪",
        concept: "scope, if/else, lists, loops",
        xpReward: 15,
        successMessage: "Practice Legend!",
        description: "Master advanced function concepts",
        lessonType: 'practice',
        hasSupercharge: true
    },
    {
        id: 13,
        title: "Food Order System - Part 2",
        subtitle: "Complete the Restaurant",
        emoji: "🍕",
        concept: "Final Project",
        xpReward: 25,
        successMessage: "Chef Supreme! You completed Level 4!",
        description: "Finish your pizza restaurant with all features",
        lessonType: 'project'
    }
];

export const TOTAL_LEVEL4_XP = LEVEL4_LESSONS.reduce((sum, l) => sum + l.xpReward, 0);
