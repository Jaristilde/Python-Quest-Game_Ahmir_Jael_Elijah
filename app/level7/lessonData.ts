// Level 7: Strings & List Operations
// Theme: "Text Wizardry"
// Project: Secret Code Maker

export interface LessonData {
    id: number;
    title: string;
    subtitle: string;
    emoji: string;
    concept: string;
    xpReward: number;
    successMessage: string;
    description: string;
    lessonType: 'learn' | 'practice' | 'project' | 'quiz';
    hasSupercharge?: boolean;
}

export const LEVEL7_LESSONS: LessonData[] = [
    {
        id: 1,
        title: "Word Surgery: Slicing Strings",
        subtitle: "Cut and Extract Text",
        emoji: "✂️",
        concept: "text[start:end]",
        xpReward: 10,
        successMessage: "You're a string surgeon! You can slice any text now!",
        description: "Learn to cut and extract pieces of text using slicing!",
        lessonType: 'learn'
    },
    {
        id: 2,
        title: "Upper and Lower: Changing Case",
        subtitle: "Transform Your Text",
        emoji: "🔠",
        concept: ".upper() .lower() .title()",
        xpReward: 10,
        successMessage: "Case master! You can transform text any way you want!",
        description: "Learn to change text to UPPERCASE, lowercase, or Title Case!",
        lessonType: 'learn'
    },
    {
        id: 3,
        title: "Find and Replace: String Detective",
        subtitle: "Search and Swap",
        emoji: "🔍",
        concept: ".find() .replace()",
        xpReward: 10,
        successMessage: "String detective! You found and replaced like a pro!",
        description: "Learn to find text inside strings and replace it with something new!",
        lessonType: 'learn'
    },
    {
        id: 4,
        title: "Splitting and Joining Words",
        subtitle: "Break Apart and Combine",
        emoji: "🔗",
        concept: ".split() .join()",
        xpReward: 10,
        successMessage: "Word combiner! You can split and join text perfectly!",
        description: "Learn to break text into lists and combine lists into text!",
        lessonType: 'learn'
    },
    {
        id: 5,
        title: "Cleaning Up Text: Strip and Check",
        subtitle: "Trim and Validate",
        emoji: "🧹",
        concept: ".strip() .startswith() .endswith()",
        xpReward: 10,
        successMessage: "Text cleaner! Your strings are spotless!",
        description: "Learn to remove whitespace and check string patterns!",
        lessonType: 'learn'
    },
    {
        id: 6,
        title: "String Operations 1",
        subtitle: "Practice Time!",
        emoji: "💪",
        concept: "String methods mastery",
        xpReward: 15,
        successMessage: "SUPERCHARGED! You've mastered basic string operations!",
        description: "Practice all the string methods you've learned!",
        lessonType: 'practice',
        hasSupercharge: true
    },
    {
        id: 7,
        title: "Secret Code Maker",
        subtitle: "Guided Project — Part 1",
        emoji: "🔐",
        concept: "Encoding messages",
        xpReward: 25,
        successMessage: "Code creator! Your secret encoder is working!",
        description: "Start building a secret code maker using string operations!",
        lessonType: 'project'
    },
    {
        id: 8,
        title: "List Slicing: Getting Portions",
        subtitle: "Slice Lists Like a Pro",
        emoji: "🍕",
        concept: "list[start:end:step]",
        xpReward: 10,
        successMessage: "List slicer! You can grab any portion of a list!",
        description: "Learn to slice lists and get exactly the portions you need!",
        lessonType: 'learn'
    },
    {
        id: 9,
        title: "List Comprehensions: One-Line Magic",
        subtitle: "Create Lists in One Line",
        emoji: "✨",
        concept: "[x for x in list]",
        xpReward: 10,
        successMessage: "Comprehension wizard! You create lists with magic!",
        description: "Learn the powerful one-line way to create and transform lists!",
        lessonType: 'learn'
    },
    {
        id: 10,
        title: "String Operations 2",
        subtitle: "Advanced Practice!",
        emoji: "🏋️",
        concept: "Lists & strings combined",
        xpReward: 15,
        successMessage: "SUPERCHARGED! You're a text wizard now!",
        description: "Practice combining string and list operations together!",
        lessonType: 'practice',
        hasSupercharge: true
    },
    {
        id: 11,
        title: "Secret Code Maker",
        subtitle: "Guided Project — Part 2",
        emoji: "🔓",
        concept: "Decoding messages",
        xpReward: 25,
        successMessage: "AMAZING! Your complete Secret Code Maker works!",
        description: "Complete your secret code maker with decoding features!",
        lessonType: 'project'
    },
    {
        id: 12,
        title: "Text Wizardry Review",
        subtitle: "Final Quiz",
        emoji: "🧙",
        concept: "Level 7 mastery",
        xpReward: 20,
        successMessage: "TEXT WIZARD MASTER! Level 7 Complete!",
        description: "Test your knowledge of strings and list operations!",
        lessonType: 'quiz'
    }
];

export const LEVEL7_INFO = {
    id: 7,
    title: "Strings & List Operations",
    description: "Master text manipulation and become a Text Wizard!",
    emoji: "🧙",
    totalLessons: 12,
    theme: "Text Wizardry",
    project: "Secret Code Maker"
};
