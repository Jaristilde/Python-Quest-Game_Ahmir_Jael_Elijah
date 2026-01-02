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
export const TEACHER_PASSWORD = 'Jaristilde';

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

// ============================================
// ENHANCEMENT: Password Validation & Auth Errors
// ============================================

export interface PasswordValidation {
    isValid: boolean;
    error?: string;
    suggestions?: string[];
    strength: 'weak' | 'medium' | 'strong';
}

export function validatePassword(password: string): PasswordValidation {
    const suggestions: string[] = [];
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    let score = 0;

    // Match signup requirement: minimum 4 characters (kid-friendly)
    if (password.length < 4) {
        suggestions.push('Make it at least 4 characters long');
    } else {
        score += 1;
        if (password.length >= 6) score += 1; // Bonus for longer passwords
    }

    if (!/[A-Za-z]/.test(password)) {
        suggestions.push('Add a letter (a, b, c...)');
    } else {
        score += 1;
    }

    if (!/\d/.test(password)) {
        suggestions.push('Add a number (1, 2, 3...)');
    } else {
        score += 1;
    }

    // Determine strength
    if (score >= 4) {
        strength = 'strong';
    } else if (score >= 2) {
        strength = 'medium';
    } else {
        strength = 'weak';
    }

    // For kids, we only require length >= 4 (matching signup validation)
    const isValid = password.length >= 4;

    if (!isValid) {
        return {
            isValid: false,
            error: 'PASSWORD_WEAK',
            suggestions: suggestions.slice(0, 3),
            strength
        };
    }

    return { isValid: true, strength, suggestions: [] };
}

export interface KidFriendlyAuthError {
    title: string;
    message: string;
    action: string;
    showForgotPassword?: boolean;
}

export function getAuthErrorMessage(errorCode: string): KidFriendlyAuthError {
    switch (errorCode) {
        case 'USERNAME_EXISTS':
            return {
                title: 'Welcome back!',
                message: 'This username already has an account. Looks like you\'ve played before!',
                action: 'Try logging in instead of signing up.'
            };
        case 'USERNAME_NOT_FOUND':
            return {
                title: 'Hmm, we don\'t recognize that username',
                message: 'We couldn\'t find an account with that username.',
                action: 'Double-check your username or sign up for a new account!'
            };
        case 'WRONG_PASSWORD':
            return {
                title: 'Oops, wrong password!',
                message: 'That password doesn\'t match. Don\'t worry, it happens to everyone!',
                action: 'Try again or click "Forgot Password" if you need help.',
                showForgotPassword: true
            };
        case 'PASSWORD_WEAK':
            return {
                title: 'Let\'s make your password stronger!',
                message: 'Your password needs a little boost to keep your account safe.',
                action: 'Check the suggestions below.'
            };
        case 'ALL_SPOTS_TAKEN':
            return {
                title: 'All spots are taken!',
                message: 'The classroom is full right now.',
                action: 'Ask your teacher to add more spots.'
            };
        case 'USERNAME_TOO_SHORT':
            return {
                title: 'Username is too short!',
                message: 'Your username needs to be at least 2 characters.',
                action: 'Try a longer username.'
            };
        default:
            return {
                title: 'Something went wrong',
                message: 'We hit a small bump. Let\'s try that again!',
                action: 'Please try again in a moment.'
            };
    }
}

// Password reset functionality
const RESET_STORAGE_KEY = 'python_quest_password_resets';

interface PasswordReset {
    username: string;
    code: string;
    expires: number;
}

function getPasswordResets(): PasswordReset[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(RESET_STORAGE_KEY);
    if (!stored) return [];
    try {
        return JSON.parse(stored);
    } catch {
        return [];
    }
}

function savePasswordResets(resets: PasswordReset[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(RESET_STORAGE_KEY, JSON.stringify(resets));
}

export function initiatePasswordReset(username: string): { success: boolean; code?: string; error?: string } {
    const data = getAppData();
    const user = data.users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!user) {
        return { success: false, error: 'USERNAME_NOT_FOUND' };
    }

    // Generate a simple 6-digit code
    const code = Math.random().toString().slice(2, 8);
    const expires = Date.now() + 3600000; // 1 hour

    // Store the reset request
    const resets = getPasswordResets();
    const existingIndex = resets.findIndex(r => r.username.toLowerCase() === username.toLowerCase());

    if (existingIndex >= 0) {
        resets[existingIndex] = { username: username.toLowerCase(), code, expires };
    } else {
        resets.push({ username: username.toLowerCase(), code, expires });
    }

    savePasswordResets(resets);

    // In a real app, this code would be sent via email
    // For demo, we return it directly
    return { success: true, code };
}

export function verifyResetCode(username: string, code: string): { success: boolean; error?: string } {
    const resets = getPasswordResets();
    const reset = resets.find(r => r.username.toLowerCase() === username.toLowerCase());

    if (!reset) {
        return { success: false, error: 'No reset request found. Please request a new code.' };
    }

    if (Date.now() > reset.expires) {
        return { success: false, error: 'This code has expired. Please request a new one.' };
    }

    if (reset.code !== code) {
        return { success: false, error: 'That code doesn\'t match. Check your code and try again!' };
    }

    return { success: true };
}

// Unlock all levels for testing purposes
export function unlockAllLevels(): void {
    const data = getAppData();
    const user = data.users.find(u => u.id === data.currentUser);
    if (!user) return;

    // Level 1: lessons 1-12
    // Level 2: lessons 13-24
    // Level 3: lessons 25-36
    // Level 4: lessons 37-48
    // Level 5: lessons 49-60 (but actually stored as 61-72)
    // Level 6: lessons 76-84
    // This unlocks all prior levels so Level 7 is accessible
    const levelsToUnlock = [
        // Level 1 (12 lessons)
        ...Array.from({ length: 12 }, (_, i) => i + 1),
        // Level 2 (12 lessons)
        ...Array.from({ length: 12 }, (_, i) => i + 13),
        // Level 3 (12 lessons)
        ...Array.from({ length: 12 }, (_, i) => i + 25),
        // Level 4 (12 lessons)
        ...Array.from({ length: 12 }, (_, i) => i + 37),
        // Level 5 (12 lessons, stored as 61-72)
        ...Array.from({ length: 12 }, (_, i) => i + 61),
        // Level 6 (9 lessons, stored as 76-84)
        ...Array.from({ length: 9 }, (_, i) => i + 76),
    ];

    for (const level of levelsToUnlock) {
        if (!user.progress.completedLevels.find(l => l.level === level)) {
            user.progress.completedLevels.push({
                level,
                completedAt: new Date().toISOString(),
                xpEarned: 10,
                coinsEarned: 5,
                attempts: 1,
                timeSpent: 60
            });
        }
    }

    user.progress.currentLevel = 85;
    user.progress.xp += 500;
    user.progress.coins += 200;
    saveAppData(data);
}

export function resetPassword(username: string, code: string, newPassword: string): { success: boolean; error?: string } {
    // Verify the code first
    const verification = verifyResetCode(username, code);
    if (!verification.success) {
        return verification;
    }

    // Validate new password
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
        return { success: false, error: 'PASSWORD_WEAK' };
    }

    // Update the password
    const data = getAppData();
    const user = data.users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!user) {
        return { success: false, error: 'USERNAME_NOT_FOUND' };
    }

    user.password = simpleHash(newPassword);
    saveAppData(data);

    // Clean up the reset request
    const resets = getPasswordResets();
    const filteredResets = resets.filter(r => r.username.toLowerCase() !== username.toLowerCase());
    savePasswordResets(filteredResets);

    return { success: true };
}
