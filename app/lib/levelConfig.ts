// Level configuration for sidebar navigation
export interface LevelConfig {
  id: number;
  name: string;
  lessons: number;
  project: string;
  emoji: string;
  route: string;
  // Lesson ID ranges for progress tracking
  lessonIdStart: number;
  lessonIdEnd: number;
}

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: "Intro to Python",
    lessons: 15,
    project: "Robot",
    emoji: "🚀",
    route: "/level1",
    lessonIdStart: 1,
    lessonIdEnd: 15
  },
  {
    id: 2,
    name: "Flow Control",
    lessons: 18,
    project: "Rock Paper Scissors",
    emoji: "🥷",
    route: "/level2",
    lessonIdStart: 16,
    lessonIdEnd: 33
  },
  {
    id: 3,
    name: "Lists",
    lessons: 16,
    project: "ToDo List",
    emoji: "📦",
    route: "/level3",
    lessonIdStart: 34,
    lessonIdEnd: 49
  },
  {
    id: 4,
    name: "Functions",
    lessons: 13,
    project: "Food Order System",
    emoji: "🔧",
    route: "/level4",
    lessonIdStart: 50,
    lessonIdEnd: 62
  },
  {
    id: 5,
    name: "Tuples & Dictionaries",
    lessons: 13,
    project: "Video Game Inventory",
    emoji: "📚",
    route: "/level5",
    lessonIdStart: 63,
    lessonIdEnd: 75
  },
  {
    id: 6,
    name: "Modules & APIs",
    lessons: 9,
    project: "TBD",
    emoji: "🌐",
    route: "/level6",
    lessonIdStart: 76,
    lessonIdEnd: 84
  },
  {
    id: 7,
    name: "Strings & List Ops",
    lessons: 12,
    project: "TBD",
    emoji: "🔤",
    route: "/level7",
    lessonIdStart: 85,
    lessonIdEnd: 96
  },
  {
    id: 8,
    name: "Object-Oriented Programming",
    lessons: 14,
    project: "TBD",
    emoji: "🏗️",
    route: "/level8",
    lessonIdStart: 97,
    lessonIdEnd: 108
  },
  {
    id: 9,
    name: "APIs & JSON",
    lessons: 7,
    project: "Fun Facts Generator",
    emoji: "🌐",
    route: "/level9",
    lessonIdStart: 109,
    lessonIdEnd: 115
  },
];

// Calculate total lessons
export const TOTAL_LESSONS = LEVELS.reduce((sum, level) => sum + level.lessons, 0);

// Get level by ID
export function getLevelById(id: number): LevelConfig | undefined {
  return LEVELS.find(level => level.id === id);
}

// Check if a level is unlocked based on completed lessons
export function isLevelUnlocked(levelId: number, completedLevels: { level: number }[]): boolean {
  if (levelId === 1) return true;

  const prevLevel = LEVELS.find(l => l.id === levelId - 1);
  if (!prevLevel) return false;

  const completedInPrevLevel = completedLevels.filter(
    l => l.level >= prevLevel.lessonIdStart && l.level <= prevLevel.lessonIdEnd
  ).length;

  return completedInPrevLevel >= prevLevel.lessons;
}

// Get progress for a specific level
export function getLevelProgress(levelId: number, completedLevels: { level: number }[]): number {
  const level = LEVELS.find(l => l.id === levelId);
  if (!level) return 0;

  return completedLevels.filter(
    l => l.level >= level.lessonIdStart && l.level <= level.lessonIdEnd
  ).length;
}

// Get overall progress percentage
export function getOverallProgress(completedLevels: { level: number }[]): number {
  const totalCompleted = completedLevels.length;
  return Math.round((totalCompleted / TOTAL_LESSONS) * 100);
}

// Get user rank based on progress
export function getUserRank(completedLevels: { level: number }[]): string {
  const progress = getOverallProgress(completedLevels);

  if (progress >= 100) return "Python Master";
  if (progress >= 80) return "Code Wizard";
  if (progress >= 60) return "Professional Coder";
  if (progress >= 40) return "Rising Developer";
  if (progress >= 20) return "Code Explorer";
  if (progress >= 10) return "Python Rookie";
  return "Beginner";
}
