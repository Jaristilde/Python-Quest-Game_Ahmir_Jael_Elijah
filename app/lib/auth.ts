// Authentication and User Management Library
// Supports up to 15 users with localStorage persistence

export interface UserProgress {
    currentLevel: number;
    lives: number;
    coins: number;
    xp: number;
    completedLevels: {
        level: number;
        completedAt: string;
        xpEarned: number;
        coinsEarned: number;
        attempts: number;
        timeSpent: number; // in seconds
    }[];
    achievements: string[];
    totalTimePlayed: number;
    lastActive: string;
}

export interface User {
    id: string;
    username: string;
    password: string; // Simple hash for demo (not production secure)
    avatar: string;
    createdAt: string;
    progress: UserProgress;
}

export interface AppData {
    users: User[];
    currentUser: string | null; // user ID
}

export const AVATARS = [
    { id: 'robot', emoji: '🤖', name: 'Robot' },
    { id: 'astronaut', emoji: '🚀', name: 'Astronaut' },
    { id: 'wizard', emoji: '🧙', name: 'Wizard' },
    { id: 'ninja', emoji: '🥷', name: 'Ninja' },
    { id: 'unicorn', emoji: '🦄', name: 'Unicorn' },
    { id: 'dinosaur', emoji: '🦖', name: 'Dinosaur' },
    { id: 'cat', emoji: '🐱', name: 'Cat' },
    { id: 'dog', emoji: '🐶', name: 'Dog' },
];

export const MAX_USERS = 15;
export const TEACHER_PASSWORD = 'teacher2024';

const STORAGE_KEY = 'python_quest_data';

// Simple hash function (NOT for production - just for demo)
export function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

export function getAppData(): AppData {
    if (typeof window === 'undefined') {
        return { users: [], currentUser: null };
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        return { users: [], currentUser: null };
    }
    try {
        return JSON.parse(stored);
    } catch {
        return { users: [], currentUser: null };
    }
}

export function saveAppData(data: AppData): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getCurrentUser(): User | null {
    const data = getAppData();
    if (!data.currentUser) return null;
    return data.users.find(u => u.id === data.currentUser) || null;
}

export function getUserCount(): number {
    return getAppData().users.length;
}

export function isUsernameTaken(username: string): boolean {
    const data = getAppData();
    return data.users.some(u => u.username.toLowerCase() === username.toLowerCase());
}

export function signup(username: string, password: string, avatar: string): { success: boolean; error?: string } {
    const data = getAppData();

    if (data.users.length >= MAX_USERS) {
        return { success: false, error: 'All spots are taken! Ask your teacher to add more.' };
    }

    if (isUsernameTaken(username)) {
        return { success: false, error: 'That username is already taken. Try another!' };
    }

    if (username.length < 2) {
        return { success: false, error: 'Username must be at least 2 characters.' };
    }

    if (password.length < 4) {
        return { success: false, error: 'Password must be at least 4 characters.' };
    }

    const newUser: User = {
        id: `user_${Date.now()}`,
        username: username.trim(),
        password: simpleHash(password),
        avatar,
        createdAt: new Date().toISOString(),
        progress: {
            currentLevel: 1,
            lives: 5,
            coins: 0,
            xp: 0,
            completedLevels: [],
            achievements: [],
            totalTimePlayed: 0,
            lastActive: new Date().toISOString(),
        }
    };

    data.users.push(newUser);
    data.currentUser = newUser.id;
    saveAppData(data);

    return { success: true };
}

export function login(username: string, password: string): { success: boolean; error?: string } {
    const data = getAppData();
    const user = data.users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!user) {
        return { success: false, error: "Can't find that username. Check your spelling!" };
    }

    if (user.password !== simpleHash(password)) {
        return { success: false, error: "Wrong password. Try again!" };
    }

    // Update last active
    user.progress.lastActive = new Date().toISOString();
    data.currentUser = user.id;
    saveAppData(data);

    return { success: true };
}

export function logout(): void {
    const data = getAppData();
    data.currentUser = null;
    saveAppData(data);
}

export function updateUserProgress(updates: Partial<UserProgress>): void {
    const data = getAppData();
    const user = data.users.find(u => u.id === data.currentUser);
    if (!user) return;

    user.progress = { ...user.progress, ...updates, lastActive: new Date().toISOString() };
    saveAppData(data);
}

export function completeLevel(level: number, xpEarned: number, coinsEarned: number, attempts: number, timeSpent: number): void {
    const data = getAppData();
    const user = data.users.find(u => u.id === data.currentUser);
    if (!user) return;

    // Check if already completed
    const existingIndex = user.progress.completedLevels.findIndex(l => l.level === level);
    const levelData = {
        level,
        completedAt: new Date().toISOString(),
        xpEarned,
        coinsEarned,
        attempts,
        timeSpent
    };

    if (existingIndex >= 0) {
        // Update if better score
        if (xpEarned > user.progress.completedLevels[existingIndex].xpEarned) {
            user.progress.completedLevels[existingIndex] = levelData;
        }
    } else {
        user.progress.completedLevels.push(levelData);
    }

    // Update totals
    user.progress.xp += xpEarned;
    user.progress.coins += coinsEarned;
    user.progress.totalTimePlayed += timeSpent;

    // Update current level if progressed
    if (level >= user.progress.currentLevel) {
        user.progress.currentLevel = level + 1;
    }

    user.progress.lastActive = new Date().toISOString();
    saveAppData(data);
}

export function updateLives(delta: number): void {
    const data = getAppData();
    const user = data.users.find(u => u.id === data.currentUser);
    if (!user) return;

    user.progress.lives = Math.max(0, Math.min(5, user.progress.lives + delta));
    user.progress.lastActive = new Date().toISOString();
    saveAppData(data);
}

export function addXpAndCoins(xp: number, coins: number): void {
    const data = getAppData();
    const user = data.users.find(u => u.id === data.currentUser);
    if (!user) return;

    user.progress.xp += xp;
    user.progress.coins += coins;
    user.progress.lastActive = new Date().toISOString();
    saveAppData(data);
}

export function updateAvatar(avatar: string): void {
    const data = getAppData();
    const user = data.users.find(u => u.id === data.currentUser);
    if (!user) return;

    user.avatar = avatar;
    saveAppData(data);
}

export function getAllUsers(): User[] {
    return getAppData().users;
}

export function deleteUser(userId: string): void {
    const data = getAppData();
    data.users = data.users.filter(u => u.id !== userId);
    if (data.currentUser === userId) {
        data.currentUser = null;
    }
    saveAppData(data);
}

export function resetUserProgress(userId: string): void {
    const data = getAppData();
    const user = data.users.find(u => u.id === userId);
    if (!user) return;

    user.progress = {
        currentLevel: 1,
        lives: 5,
        coins: 0,
        xp: 0,
        completedLevels: [],
        achievements: [],
        totalTimePlayed: 0,
        lastActive: new Date().toISOString(),
    };
    saveAppData(data);
}

export function getLeaderboard(): { username: string; avatar: string; xp: number }[] {
    const data = getAppData();
    return data.users
        .map(u => ({ username: u.username, avatar: u.avatar, xp: u.progress.xp }))
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 5);
}

export function getAvatarEmoji(avatarId: string): string {
    return AVATARS.find(a => a.id === avatarId)?.emoji || '👤';
}
