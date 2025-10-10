const STORAGE_KEY = 'phomshah_local_data';

interface LocalUserProgress {
  xp: number;
  level: number;
  current_streak: number;
  max_streak: number;
  last_played_at: string | null;
}

interface LocalGameSession {
  id: string;
  game_type: string;
  category_id: string | null;
  score: number;
  duration_seconds: number;
  xp_earned: number;
  created_at: string;
}

interface LocalAchievement {
  achievementId: string;
  earnedAt: string;
}

interface LocalLearningProgress {
  id: string;
  categoryId: string;
  contentItemId: string | null;
  actionType: string;
  createdAt: string;
}

interface LocalStorageData {
  userProgress: LocalUserProgress;
  gameSessions: LocalGameSession[];
  achievements: LocalAchievement[];
  learningProgress: LocalLearningProgress[];
}

const getDefaultData = (): LocalStorageData => ({
  userProgress: {
    xp: 0,
    level: 1,
    current_streak: 0,
    max_streak: 0,
    last_played_at: null,
  },
  gameSessions: [],
  achievements: [],
  learningProgress: [],
});

const getData = (): LocalStorageData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultData();
    return { ...getDefaultData(), ...JSON.parse(stored) };
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return getDefaultData();
  }
};

const saveData = (data: LocalStorageData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
};

export const LocalStorageService = {
  // User Progress
  getUserProgress: (): LocalUserProgress => {
    return getData().userProgress;
  },

  updateUserProgress: (updates: Partial<LocalUserProgress>): void => {
    const data = getData();
    data.userProgress = { ...data.userProgress, ...updates };
    saveData(data);
  },

  addXP: (xpAmount: number): void => {
    const data = getData();
    const newXP = data.userProgress.xp + xpAmount;
    const newLevel = Math.floor(newXP / 100) + 1;
    
    data.userProgress.xp = newXP;
    data.userProgress.level = newLevel;
    saveData(data);
  },

  updateStreak: (): void => {
    const data = getData();
    const lastPlayed = data.userProgress.last_played_at;
    const now = new Date();
    
    if (!lastPlayed) {
      data.userProgress.current_streak = 1;
      data.userProgress.max_streak = 1;
    } else {
      const lastDate = new Date(lastPlayed);
      const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        data.userProgress.current_streak += 1;
        if (data.userProgress.current_streak > data.userProgress.max_streak) {
          data.userProgress.max_streak = data.userProgress.current_streak;
        }
      } else if (diffDays > 1) {
        data.userProgress.current_streak = 1;
      }
    }
    
    data.userProgress.last_played_at = now.toISOString();
    saveData(data);
  },

  // Game Sessions
  saveGameSession: (
    gameType: string,
    score: number,
    durationSeconds: number,
    xpEarned: number,
    categoryId: string | null = null
  ): void => {
    const data = getData();
    const session: LocalGameSession = {
      id: crypto.randomUUID(),
      game_type: gameType,
      category_id: categoryId,
      score,
      duration_seconds: durationSeconds,
      xp_earned: xpEarned,
      created_at: new Date().toISOString(),
    };
    
    data.gameSessions.unshift(session);
    // Keep only last 100 sessions
    if (data.gameSessions.length > 100) {
      data.gameSessions = data.gameSessions.slice(0, 100);
    }
    
    saveData(data);
  },

  getGameHistory: (limit: number = 10): LocalGameSession[] => {
    const data = getData();
    return data.gameSessions.slice(0, limit);
  },

  // Achievements
  earnAchievement: (achievementId: string): void => {
    const data = getData();
    const alreadyEarned = data.achievements.some(a => a.achievementId === achievementId);
    
    if (!alreadyEarned) {
      data.achievements.push({
        achievementId,
        earnedAt: new Date().toISOString(),
      });
      saveData(data);
    }
  },

  getAchievements: (): LocalAchievement[] => {
    return getData().achievements;
  },

  // Learning Progress
  trackLearningProgress: (
    categoryId: string,
    contentItemId: string | null,
    actionType: string
  ): void => {
    const data = getData();
    
    // Check if this exact action already exists
    const exists = data.learningProgress.some(
      p => p.categoryId === categoryId && 
           p.contentItemId === contentItemId && 
           p.actionType === actionType
    );
    
    if (!exists) {
      data.learningProgress.push({
        id: crypto.randomUUID(),
        categoryId,
        contentItemId,
        actionType,
        createdAt: new Date().toISOString(),
      });
      saveData(data);
    }
  },

  getLearningProgress: (categoryId?: string): LocalLearningProgress[] => {
    const data = getData();
    if (categoryId) {
      return data.learningProgress.filter(p => p.categoryId === categoryId);
    }
    return data.learningProgress;
  },

  // Clear all data
  clearAllData: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },
};
