'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    User,
    getCurrentUser,
    login as authLogin,
    logout as authLogout,
    signup as authSignup,
    updateUserProgress,
    updateAvatar as authUpdateAvatar,
    updateLives as authUpdateLives,
    addXpAndCoins as authAddXpAndCoins,
    completeLevel as authCompleteLevel,
    getAvatarEmoji,
    UserProgress
} from '../lib/auth';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (username: string, password: string) => { success: boolean; error?: string };
    logout: () => void;
    signup: (username: string, password: string, avatar: string) => { success: boolean; error?: string };
    updateProgress: (updates: Partial<UserProgress>) => void;
    updateAvatar: (avatar: string) => void;
    updateLives: (delta: number) => void;
    addXpAndCoins: (xp: number, coins: number) => void;
    completeLevel: (level: number, xp: number, coins: number, attempts: number, timeSpent: number) => void;
    refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = () => {
        const currentUser = getCurrentUser();
        setUser(currentUser);
    };

    useEffect(() => {
        refreshUser();
        setIsLoading(false);
    }, []);

    const login = (username: string, password: string) => {
        const result = authLogin(username, password);
        if (result.success) {
            refreshUser();
        }
        return result;
    };

    const logout = () => {
        authLogout();
        setUser(null);
    };

    const signup = (username: string, password: string, avatar: string) => {
        const result = authSignup(username, password, avatar);
        if (result.success) {
            refreshUser();
        }
        return result;
    };

    const updateProgress = (updates: Partial<UserProgress>) => {
        updateUserProgress(updates);
        refreshUser();
    };

    const updateAvatar = (avatar: string) => {
        authUpdateAvatar(avatar);
        refreshUser();
    };

    const updateLives = (delta: number) => {
        authUpdateLives(delta);
        refreshUser();
    };

    const addXpAndCoins = (xp: number, coins: number) => {
        authAddXpAndCoins(xp, coins);
        refreshUser();
    };

    const completeLevel = (level: number, xp: number, coins: number, attempts: number, timeSpent: number) => {
        authCompleteLevel(level, xp, coins, attempts, timeSpent);
        refreshUser();
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            login,
            logout,
            signup,
            updateProgress,
            updateAvatar,
            updateLives,
            addXpAndCoins,
            completeLevel,
            refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export { getAvatarEmoji };
