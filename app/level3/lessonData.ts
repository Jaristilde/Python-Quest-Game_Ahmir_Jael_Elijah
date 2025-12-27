// Lesson data for Level 3: Lists - "Organizing Your Data"
// Theme: Teaching kids how to store and organize multiple pieces of data
// Final Project: ToDo List App

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

export const LEVEL3_LESSONS: LessonData[] = [
    // === LISTS BASICS (Lessons 1-8) ===
    {
        id: 1,
        title: "Grouping Data in Lists",
        subtitle: "Storing Multiple Things in One Place",
        emoji: "📦",
        concept: "creating lists with [ ]",
        xpReward: 10,
        successMessage: "List Creator unlocked!",
        description: "Learn to store multiple items in one variable",
        lessonType: 'learn'
    },
    {
        id: 2,
        title: "Changing Data in Lists",
        subtitle: "Swapping Items in Your List",
        emoji: "🔄",
        concept: "list indexing [0] [1] [2]",
        xpReward: 10,
        successMessage: "Item Swapper achieved!",
        description: "Access and change items by their position",
        lessonType: 'learn'
    },
    {
        id: 3,
        title: "Updating Lists",
        subtitle: "Adding and Removing Items",
        emoji: "✏️",
        concept: ".append() .remove() .pop()",
        xpReward: 10,
        successMessage: "List Editor unlocked!",
        description: "Add new items and remove old ones",
        lessonType: 'learn'
    },
    {
        id: 4,
        title: "Organizing Data 1",
        subtitle: "Practice Time!",
        emoji: "🎯",
        concept: "list basics practice",
        xpReward: 15,
        successMessage: "Practice Champion!",
        description: "Practice creating and modifying lists",
        lessonType: 'practice',
        hasSupercharge: true
    },
    {
        id: 5,
        title: "Looping over Lists",
        subtitle: "Looking at Every Item One by One",
        emoji: "🔁",
        concept: "for item in list",
        xpReward: 10,
        successMessage: "Loop Explorer!",
        description: "Visit every item in a list with loops",
        lessonType: 'learn'
    },
    {
        id: 6,
        title: "Deciding with Lists",
        subtitle: "Making Choices Based on List Items",
        emoji: "🤔",
        concept: "if item in list",
        xpReward: 10,
        successMessage: "List Detective!",
        description: "Check if items exist in your list",
        lessonType: 'learn'
    },
    {
        id: 7,
        title: "Organizing Data 2",
        subtitle: "More Practice!",
        emoji: "💪",
        concept: "loops + lists practice",
        xpReward: 15,
        successMessage: "Data Organizer!",
        description: "Combine loops and lists together",
        lessonType: 'practice',
        hasSupercharge: true
    },
    {
        id: 8,
        title: "ToDo List App",
        subtitle: "Guided Project - Part 1",
        emoji: "📝",
        concept: "Build the Basic Structure",
        xpReward: 25,
        successMessage: "App Builder!",
        description: "Create your first real app with lists",
        lessonType: 'project'
    },

    // === ADVANCED LISTS (Lessons 9-16) ===
    {
        id: 9,
        title: "Finding Extreme Data",
        subtitle: "Finding the Biggest and Smallest",
        emoji: "🏆",
        concept: "min() max()",
        xpReward: 10,
        successMessage: "Extreme Finder!",
        description: "Find the highest and lowest values",
        lessonType: 'learn'
    },
    {
        id: 10,
        title: "Sorting Data",
        subtitle: "Putting Things in Order",
        emoji: "📊",
        concept: ".sort() sorted()",
        xpReward: 10,
        successMessage: "Data Sorter!",
        description: "Arrange items from smallest to largest",
        lessonType: 'learn'
    },
    {
        id: 11,
        title: "Summing Data",
        subtitle: "Adding Up All the Numbers",
        emoji: "🧮",
        concept: "sum()",
        xpReward: 10,
        successMessage: "Math Wizard!",
        description: "Calculate totals from number lists",
        lessonType: 'learn'
    },
    {
        id: 12,
        title: "Using Lists 1",
        subtitle: "Practice Time!",
        emoji: "🎯",
        concept: "min max sum sort practice",
        xpReward: 15,
        successMessage: "List Pro!",
        description: "Practice with list calculations",
        lessonType: 'practice',
        hasSupercharge: true
    },
    {
        id: 13,
        title: "Joining Lists",
        subtitle: "Combining Lists Together",
        emoji: "🔗",
        concept: "+ and .extend()",
        xpReward: 10,
        successMessage: "List Combiner!",
        description: "Merge multiple lists into one",
        lessonType: 'learn'
    },
    {
        id: 14,
        title: "Counting Elements",
        subtitle: "How Many Items Do I Have?",
        emoji: "🔢",
        concept: "len() .count()",
        xpReward: 10,
        successMessage: "Counter Master!",
        description: "Count items and find duplicates",
        lessonType: 'learn'
    },
    {
        id: 15,
        title: "Using Lists 2",
        subtitle: "Final Practice!",
        emoji: "🏆",
        concept: "all list methods practice",
        xpReward: 15,
        successMessage: "List Legend!",
        description: "Master all list operations",
        lessonType: 'practice',
        hasSupercharge: true
    },
    {
        id: 16,
        title: "ToDo List App",
        subtitle: "Guided Project - Part 2",
        emoji: "✅",
        concept: "Add Menu and Delete Tasks",
        xpReward: 25,
        successMessage: "APP DEVELOPER! Level 3 Complete!",
        description: "Build a full interactive ToDo app",
        lessonType: 'project'
    }
];

// Calculate total XP for Level 3
// Learn: 10 XP x 8 = 80
// Practice: 15 XP x 4 = 60
// Project: 25 XP x 2 = 50
// Supercharge: 25 XP x 4 = 100 (optional)
// Total required: 190 XP, Total possible: 290 XP
export const TOTAL_LEVEL3_XP = LEVEL3_LESSONS.reduce((sum, l) => sum + l.xpReward, 0);
export const TOTAL_SUPERCHARGE_XP = LEVEL3_LESSONS.filter(l => l.hasSupercharge).length * 25;
