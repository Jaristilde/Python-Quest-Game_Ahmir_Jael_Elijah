// Level 5: Tuples, Dictionaries & Sets
// Theme: "Organizing Your Stuff Like a Pro"
// Project: Video Game Inventory System

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

export const LEVEL5_LESSONS: LessonData[] = [
    {
        id: 1,
        title: "Locked Lists: Meet Tuples",
        subtitle: "Data That Can't Change",
        emoji: "🔒",
        concept: "tuple = (item1, item2)",
        xpReward: 10,
        successMessage: "You learned about tuples! They're like lists that can never change.",
        description: "Learn about TUPLES - special lists that are locked forever!",
        lessonType: 'learn'
    },
    {
        id: 2,
        title: "When to Lock It",
        subtitle: "Tuples vs Lists",
        emoji: "🤔",
        concept: "list vs tuple",
        xpReward: 10,
        successMessage: "Now you know when to lock your data with tuples!",
        description: "Learn when to use a tuple and when to use a list!",
        lessonType: 'learn'
    },
    {
        id: 3,
        title: "Labeled Drawers: Meet Dictionaries",
        subtitle: "Find Things by Name",
        emoji: "🗄️",
        concept: "dict = {\"key\": value}",
        xpReward: 10,
        successMessage: "You learned dictionaries! Now you can label your data.",
        description: "Learn about DICTIONARIES - data with labels!",
        lessonType: 'learn'
    },
    {
        id: 4,
        title: "Adding Labels",
        subtitle: "Dictionary Updates",
        emoji: "✏️",
        concept: "dict[\"key\"] = value",
        xpReward: 10,
        successMessage: "You can now update dictionaries like a pro!",
        description: "Learn to add, change, and remove items in dictionaries!",
        lessonType: 'learn'
    },
    {
        id: 5,
        title: "Looking Through Drawers",
        subtitle: "Dictionary Loops",
        emoji: "🔍",
        concept: "for key in dict:",
        xpReward: 10,
        successMessage: "You can now explore every item in a dictionary!",
        description: "Learn to loop through all the items in a dictionary!",
        lessonType: 'learn'
    },
    {
        id: 6,
        title: "Organizing Data 1",
        subtitle: "Practice Time!",
        emoji: "💪",
        concept: "tuples & dictionaries",
        xpReward: 15,
        successMessage: "Great practice! You're getting good at organizing data!",
        description: "Practice what you've learned about tuples and dictionaries!",
        lessonType: 'practice',
        hasSupercharge: true
    },
    {
        id: 7,
        title: "Video Game Inventory",
        subtitle: "Guided Project — Part 1",
        emoji: "🎮",
        concept: "inventory system",
        xpReward: 25,
        successMessage: "Your inventory system is taking shape!",
        description: "Start building a video game inventory system!",
        lessonType: 'project'
    },
    {
        id: 8,
        title: "No Duplicates Allowed: Meet Sets",
        subtitle: "Unique Items Only",
        emoji: "🎯",
        concept: "set = {item1, item2}",
        xpReward: 10,
        successMessage: "You learned about sets! No duplicates allowed!",
        description: "Learn about SETS - collections that reject duplicates!",
        lessonType: 'learn'
    },
    {
        id: 9,
        title: "Set Tricks",
        subtitle: "Add, Remove, Check",
        emoji: "🪄",
        concept: "add(), remove(), in",
        xpReward: 10,
        successMessage: "You mastered set operations!",
        description: "Learn the cool tricks you can do with sets!",
        lessonType: 'learn'
    },
    {
        id: 10,
        title: "Combining Collections",
        subtitle: "Mix and Match",
        emoji: "🧩",
        concept: "nested data structures",
        xpReward: 10,
        successMessage: "You can now combine different data types!",
        description: "Learn to combine tuples, lists, dicts, and sets together!",
        lessonType: 'learn'
    },
    {
        id: 11,
        title: "Organizing Data 2",
        subtitle: "More Practice!",
        emoji: "🏋️",
        concept: "sets & combining",
        xpReward: 15,
        successMessage: "Excellent! You're a data organization master!",
        description: "Practice sets and combining different collections!",
        lessonType: 'practice',
        hasSupercharge: true
    },
    {
        id: 12,
        title: "Choosing the Right Tool",
        subtitle: "List vs Tuple vs Dict vs Set",
        emoji: "🧰",
        concept: "when to use what",
        xpReward: 10,
        successMessage: "Now you know exactly which tool to use!",
        description: "Learn which data type to use for different situations!",
        lessonType: 'learn'
    },
    {
        id: 13,
        title: "Video Game Inventory",
        subtitle: "Guided Project — Part 2",
        emoji: "🏆",
        concept: "complete inventory",
        xpReward: 25,
        successMessage: "AMAZING! You built a complete inventory system!",
        description: "Complete your video game inventory system!",
        lessonType: 'project'
    }
];

export const LEVEL5_INFO = {
    id: 5,
    title: "Tuples, Dictionaries & Sets",
    description: "Learn new ways to organize your data like a pro!",
    emoji: "📚",
    totalLessons: 13,
    theme: "Organizing Your Stuff Like a Pro",
    project: "Video Game Inventory System"
};
