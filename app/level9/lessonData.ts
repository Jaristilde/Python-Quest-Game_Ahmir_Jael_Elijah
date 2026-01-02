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

export const LEVEL9_LESSONS: LessonData[] = [
    {
        id: 1,
        title: "What is an API?",
        subtitle: "The Data Waiter",
        emoji: "🍽️",
        concept: "API = Internet Helper",
        xpReward: 10,
        successMessage: "You understand how APIs work!",
        description: "Learn what APIs are - like waiters that fetch data for you!",
        lessonType: 'learn'
    },
    {
        id: 2,
        title: "Your First API Request",
        subtitle: "Fetching Data",
        emoji: "📡",
        concept: "requests.get(url)",
        xpReward: 10,
        successMessage: "You made your first API request!",
        description: "Learn to ask the internet for data using requests.",
        lessonType: 'learn'
    },
    {
        id: 3,
        title: "Understanding JSON",
        subtitle: "The Labeled Lunchbox",
        emoji: "🍱",
        concept: "data[\"key\"]",
        xpReward: 10,
        successMessage: "You can unpack JSON data!",
        description: "Learn to read JSON - organized data with labels!",
        lessonType: 'learn'
    },
    {
        id: 4,
        title: "API Practice",
        subtitle: "Practice + Supercharge",
        emoji: "🎯",
        concept: "Fetch & Parse",
        xpReward: 15,
        successMessage: "You're getting great at APIs!",
        description: "Practice fetching and reading API data.",
        lessonType: 'practice',
        hasSupercharge: true
    },
    {
        id: 5,
        title: "API Parameters",
        subtitle: "Custom Orders",
        emoji: "🍕",
        concept: "?param=value",
        xpReward: 10,
        successMessage: "You can customize API requests!",
        description: "Learn to send special instructions with your requests.",
        lessonType: 'learn'
    },
    {
        id: 6,
        title: "Building Something Cool",
        subtitle: "Error Handling",
        emoji: "🛡️",
        concept: "try/except",
        xpReward: 10,
        successMessage: "You can handle errors like a pro!",
        description: "Learn what to do when things go wrong.",
        lessonType: 'learn'
    },
    {
        id: 7,
        title: "Fun Facts Generator",
        subtitle: "Final Project",
        emoji: "🎰",
        concept: "Complete API App",
        xpReward: 50,
        successMessage: "You built your own API app! You're a Python Master!",
        description: "Build a Fun Facts Machine using everything you learned!",
        lessonType: 'project'
    }
];
