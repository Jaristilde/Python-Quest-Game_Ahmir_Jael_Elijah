// Lesson data for all 15 lessons in Level 1
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

export const LEVEL1_LESSONS: LessonData[] = [
    {
        id: 1,
        title: "Make Your Computer Talk",
        subtitle: "Wake Up Robo-1!",
        emoji: "🗣️",
        concept: "print()",
        xpReward: 10,
        successMessage: "You made your computer talk! Robo-1 is awake!",
        description: "Teach Robo-1 to speak using the print command",
        lessonType: 'learn'
    },
    {
        id: 2,
        title: "Give Things Names",
        subtitle: "Teaching Your Computer to Remember",
        emoji: "🏷️",
        concept: "Variables",
        xpReward: 10,
        successMessage: "You taught your computer to remember things!",
        description: "Create nicknames for things your computer remembers",
        lessonType: 'learn'
    },
    {
        id: 3,
        title: "Smoosh Words Together",
        subtitle: "Connecting Words Like Train Cars",
        emoji: "🔗",
        concept: "String Concatenation",
        xpReward: 10,
        successMessage: "Word Smoosher Extraordinaire!",
        description: "Connect words together like train cars",
        lessonType: 'learn'
    },
    {
        id: 4,
        title: "Computer Math",
        subtitle: "Your Super Calculator",
        emoji: "🧮",
        concept: "Math (+, -, *, /)",
        xpReward: 10,
        successMessage: "Math Wizard activated!",
        description: "Turn your computer into a super calculator",
        lessonType: 'learn'
    },
    {
        id: 5,
        title: "Saving Math Answers",
        subtitle: "Storing Numbers for Later",
        emoji: "💾",
        concept: "Variables with Numbers",
        xpReward: 10,
        successMessage: "Number Keeper unlocked!",
        description: "Store numbers and do math with them",
        lessonType: 'learn'
    },
    {
        id: 6,
        title: "Python Basics 1",
        subtitle: "Practice Time!",
        emoji: "🎯",
        concept: "print, variables, math",
        xpReward: 15,
        successMessage: "Practice Champion!",
        description: "Practice everything you've learned so far",
        lessonType: 'practice',
        hasSupercharge: true
    },
    {
        id: 7,
        title: "Magic Fill-in-the-Blank",
        subtitle: "Put Variables Inside Sentences",
        emoji: "✨",
        concept: "f-strings",
        xpReward: 10,
        successMessage: "F-String Sorcerer!",
        description: "Put variables inside your sentences like magic",
        lessonType: 'learn'
    },
    {
        id: 8,
        title: "Comparing Things",
        subtitle: "Asking Yes or No Questions",
        emoji: "⚖️",
        concept: "Comparisons (==, >, <)",
        xpReward: 10,
        successMessage: "Comparer achieved!",
        description: "Ask which is bigger, smaller, or equal",
        lessonType: 'learn'
    },
    {
        id: 9,
        title: "If This, Then That",
        subtitle: "Teaching Your Computer to Choose",
        emoji: "🔀",
        concept: "if/else statements",
        xpReward: 10,
        successMessage: "Decision Maker Pro!",
        description: "Make your code choose different paths",
        lessonType: 'learn'
    },
    {
        id: 10,
        title: "Python Basics 2",
        subtitle: "More Practice!",
        emoji: "💪",
        concept: "f-strings, comparisons, if/else",
        xpReward: 15,
        successMessage: "Practice Pro!",
        description: "Master f-strings and conditionals",
        lessonType: 'practice',
        hasSupercharge: true
    },
    {
        id: 11,
        title: "Making Lists",
        subtitle: "Remember Many Things at Once",
        emoji: "📝",
        concept: "Lists []",
        xpReward: 10,
        successMessage: "List Legend unlocked!",
        description: "Store multiple things in one variable",
        lessonType: 'learn'
    },
    {
        id: 12,
        title: "Repeat After Me",
        subtitle: "Do This Exactly X Times",
        emoji: "🔁",
        concept: "for loops",
        xpReward: 10,
        successMessage: "Loop Legend!",
        description: "Do things over and over without retyping",
        lessonType: 'learn'
    },
    {
        id: 13,
        title: "Ask the User",
        subtitle: "Getting Answers from People",
        emoji: "💬",
        concept: "input()",
        xpReward: 10,
        successMessage: "Input Master!",
        description: "Get answers from the person using your program",
        lessonType: 'learn'
    },
    {
        id: 14,
        title: "Python Basics 3",
        subtitle: "Final Practice!",
        emoji: "🏆",
        concept: "lists, loops, input",
        xpReward: 15,
        successMessage: "Practice Legend!",
        description: "Master all the basics before the final project",
        lessonType: 'practice',
        hasSupercharge: true
    },
    {
        id: 15,
        title: "Build Your Own Bot!",
        subtitle: "Robo-1 Talks Back!",
        emoji: "🤖",
        concept: "Interactive Programs",
        xpReward: 25,
        successMessage: "Bot Builder Supreme! You completed Level 1!",
        description: "Make Robo-1 talk back to users with everything you learned",
        lessonType: 'project'
    }
];

export const TOTAL_LEVEL1_XP = LEVEL1_LESSONS.reduce((sum, l) => sum + l.xpReward, 0);
