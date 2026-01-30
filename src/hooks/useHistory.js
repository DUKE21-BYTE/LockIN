import { useState, useCallback } from 'react';

const STORAGE_KEY = 'lockin_sessions';

export const useHistory = () => {
  const [sessions, setSessions] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
    return [];
  });

  const saveSession = useCallback((durationSeconds, overtimeSeconds, taskLabel = 'Focus') => {
    const newSession = {
      id: Date.now(), // simple unique id
      date: new Date().toISOString(),
      duration: durationSeconds,
      overtime: overtimeSeconds,
      label: taskLabel,
    };

    setSessions(prev => {
      const updated = [newSession, ...prev].slice(0, 50); // Keep last 50 only for MVP
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setSessions([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Stats calculation
  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todaySessions = sessions.filter(s => new Date(s.date).toDateString() === today);
    
    const count = todaySessions.length;
    const totalSeconds = todaySessions.reduce((acc, s) => acc + s.duration + (s.overtime || 0), 0);
    
    return { count, totalSeconds };
  };

  return { sessions, saveSession, clearHistory, getTodayStats };
};
