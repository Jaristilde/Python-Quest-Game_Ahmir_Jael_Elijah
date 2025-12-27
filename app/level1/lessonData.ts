// Lesson data for all 15 lessons in Level 1
export interface LessonData {
    id: number;
    title: string;
    subtitle: string; // Kid-friendly explanation
    emoji: string;
    concept: string;
    xpReward: number;
    successMessage: string;
    description: string;
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
        description: "Teach Robo-1 to speak using the print command"
    },
    {
        id: 2,
        title: "Give Things Names",
        subtitle: "Teaching Your Computer to Remember",
        emoji: "🏷️",
        concept: "Variables",
        xpReward: 10,
        successMessage: "You taught your computer to remember things!",
        description: "Create nicknames for things your computer remembers"
    },
    {
        id: 3,
        title: "Smoosh Words Together",
        subtitle: "Connecting Words Like Train Cars",
        emoji: "🔗",
        concept: "String Concatenation",
        xpReward: 10,
        successMessage: "Word Smoosher Extraordinaire!",
        description: "Connect words together like train cars"
    },
    {
        id: 4,
        title: "Computer Math",
        subtitle: "Your Super Calculator",
        emoji: "🧮",
        concept: "Math (+, -, *, /)",
        xpReward: 10,
        successMessage: "Math Wizard activated!",
        description: "Turn your computer into a super calculator"
    },
    {
        id: 5,
        title: "Saving Math Answers",
        subtitle: "Storing Numbers for Later",
        emoji: "💾",
        concept: "Variables with Numbers",
        xpReward: 10,
        successMessage: "Number Keeper unlocked!",
        description: "Store numbers and do math with them"
    },
    {
        id: 6,
        title: "Comparing Numbers",
        subtitle: "Asking Yes or No Questions",
        emoji: "⚖️",
        concept: "Number Comparisons (==, >, <)",
        xpReward: 10,
        successMessage: "Number Comparer achieved!",
        description: "Ask which number is bigger, smaller, or equal"
    },
    {
        id: 7,
        title: "Magic Fill-in-the-Blank",
        subtitle: "Put Variables Inside Sentences",
        emoji: "✨",
        concept: "f-strings",
        xpReward: 10,
        successMessage: "F-String Sorcerer!",
        description: "Put variables inside your sentences like magic"
    },
    {
        id: 8,
        title: "If This, Then That",
        subtitle: "Teaching Your Computer to Choose",
        emoji: "🔀",
        concept: "if/else statements",
        xpReward: 15,
        successMessage: "Decision Maker Pro!",
        description: "Make your code choose different paths"
    },
    {
        id: 9,
        title: "Making Lists",
        subtitle: "Remember Many Things at Once",
        emoji: "📝",
        concept: "Lists []",
        xpReward: 15,
        successMessage: "List Legend unlocked!",
        description: "Store multiple things in one variable"
    },
    {
        id: 10,
        title: "Repeat After Me",
        subtitle: "Do This Exactly X Times",
        emoji: "🔁",
        concept: "for loops",
        xpReward: 15,
        successMessage: "Loop Legend!",
        description: "Do things over and over without retyping"
    },
    {
        id: 11,
        title: "Comparing Words",
        subtitle: "Do These Words Match?",
        emoji: "🔤",
        concept: "String Comparisons",
        xpReward: 15,
        successMessage: "Word Comparer Master!",
        description: "Check if words match or come before/after alphabetically"
    },
    {
        id: 12,
        title: "What Type Is It?",
        subtitle: "Is It Text, Number, or Something Else?",
        emoji: "🔍",
        concept: "type() and Data Types",
        xpReward: 15,
        successMessage: "Type Detective!",
        description: "Discover if something is text, number, or something else"
    },
    {
        id: 13,
        title: "Types Matter!",
        subtitle: "Why '5' and 5 Are Different",
        emoji: "🎭",
        concept: "Type Conversion",
        xpReward: 15,
        successMessage: "Type Transformer!",
        description: "Learn why '5' and 5 are different and how to convert them"
    },
    {
        id: 14,
        title: "Ask the User",
        subtitle: "Getting Answers from People",
        emoji: "💬",
        concept: "input()",
        xpReward: 20,
        successMessage: "Input Master!",
        description: "Get answers from the person using your program"
    },
    {
        id: 15,
        title: "Build Your Own Bot!",
        subtitle: "Robo-1 Talks Back!",
        emoji: "🤖",
        concept: "Interactive Programs",
        xpReward: 25,
        successMessage: "Bot Builder Supreme! You completed Level 1!",
        description: "Make Robo-1 talk back to users with everything you learned"
    }
];

export const TOTAL_LEVEL1_XP = LEVEL1_LESSONS.reduce((sum, l) => sum + l.xpReward, 0);
