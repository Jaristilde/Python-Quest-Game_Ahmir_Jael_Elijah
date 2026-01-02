// Level 6: Modules & APIs - Lesson Data
export interface LessonData {
  id: number;
  title: string;
  description: string;
  concept: string;
  emoji: string;
  lessonType: 'learn' | 'practice' | 'supercharge' | 'project';
  xpReward: number;
  successMessage: string;
}

export const LEVEL6_LESSONS: LessonData[] = [
  {
    id: 1,
    title: "What Are Modules?",
    description: "Discover Python's toolboxes - pre-built code you can use!",
    concept: "import module",
    emoji: "📦",
    lessonType: 'learn',
    xpReward: 10,
    successMessage: "You unlocked the toolbox! Modules give you superpowers!"
  },
  {
    id: 2,
    title: "Math Magic",
    description: "Use Python's math module for powerful calculations!",
    concept: "import math",
    emoji: "🔢",
    lessonType: 'learn',
    xpReward: 10,
    successMessage: "Math wizard! You can do advanced calculations now!"
  },
  {
    id: 3,
    title: "Random Fun",
    description: "Add randomness to your programs with the random module!",
    concept: "import random",
    emoji: "🎲",
    lessonType: 'learn',
    xpReward: 10,
    successMessage: "Randomness master! Your programs are now unpredictable!"
  },
  {
    id: 4,
    title: "Time Traveler",
    description: "Work with dates and times using the datetime module!",
    concept: "import datetime",
    emoji: "⏰",
    lessonType: 'practice',
    xpReward: 15,
    successMessage: "Time keeper! You can track dates and times now!"
  },
  {
    id: 5,
    title: "Module Master",
    description: "Practice using multiple modules together!",
    concept: "Combining modules",
    emoji: "💪",
    lessonType: 'supercharge',
    xpReward: 25,
    successMessage: "SUPERCHARGED! You're a module combining expert!"
  },
  {
    id: 6,
    title: "What Are APIs?",
    description: "Learn how programs talk to each other over the internet!",
    concept: "APIs explained",
    emoji: "🌐",
    lessonType: 'learn',
    xpReward: 10,
    successMessage: "Connected! You understand how apps communicate!"
  },
  {
    id: 7,
    title: "JSON: Data Language",
    description: "Learn the universal language for sharing data!",
    concept: "JSON format",
    emoji: "📋",
    lessonType: 'learn',
    xpReward: 10,
    successMessage: "Data decoder! You can read and write JSON!"
  },
  {
    id: 8,
    title: "Lucky Number Generator",
    description: "Build a fun app using random and math modules!",
    concept: "Project Part 1",
    emoji: "🍀",
    lessonType: 'project',
    xpReward: 25,
    successMessage: "App builder! Your lucky number generator works!"
  },
  {
    id: 9,
    title: "Fortune Teller App",
    description: "Complete your fortune telling application!",
    concept: "Final Project",
    emoji: "🔮",
    lessonType: 'project',
    xpReward: 25,
    successMessage: "MODULE MASTER! Level 6 Complete! 🎉"
  }
];

export const LEVEL6_TOTAL_XP = LEVEL6_LESSONS.reduce((sum, lesson) => sum + lesson.xpReward, 0);
