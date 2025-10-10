import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useConfettiStore } from '@/stores/confetti';
import { LocalStorageService } from './LocalStorageService';

export type UserProgress = {
  id?: string;
  user_id?: string;
  xp: number;
  level: number;
  current_streak: number;
  max_streak: number;
  last_played_at: string | null;
}

export type GameSession = {
  id: string;
  user_id?: string;
  game_type: string;
  score: number;
  duration_seconds: number;
  xp_earned: number;
  category_id: string | null;
  created_at: string;
}

export const GameProgressService = {
  async getUserProgress(): Promise<UserProgress | null> {
    const { data: user } = await supabase.auth.getUser();
    
    // If no user, use localStorage
    if (!user.user) {
      return LocalStorageService.getUserProgress();
    }
    
    // Otherwise use Supabase for admin
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.user.id)
      .single();
    
    if (error) {
      console.error('Error fetching user progress:', error);
      
      // If no progress record found, attempt to create one
      if (error.code === 'PGRST116') {
        return this.createInitialUserProgress(user.user.id);
      }
      
      return null;
    }
    
    return data;
  },
  
  async createInitialUserProgress(userId: string): Promise<UserProgress | null> {
    console.log('Creating initial user progress for user:', userId);
    
    // Check if a user is authenticated first
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      console.error('No authenticated user when trying to create progress');
      toast({
        title: "Authentication Required",
        description: "Please sign in to track your progress.",
        variant: "destructive"
      });
      return null;
    }
    
    // Ensure we're creating progress for the authenticated user
    if (userId !== authData.user.id) {
      console.error('User ID mismatch when creating progress');
      return null;
    }
    
    const initialProgress = {
      user_id: userId,
      xp: 0,
      level: 1,
      current_streak: 0,
      max_streak: 0,
      last_played_at: null
    };
    
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .insert(initialProgress)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating initial user progress:', error);
        
        // Show more specific error messages based on error types
        if (error.code === '42501') {
          toast({
            title: "Permission Error",
            description: "You don't have permission to create progress records.",
            variant: "destructive"
          });
        } else if (error.code === '23505') {
          // If duplicate key error, try to fetch the existing record instead
          console.log('Progress record already exists, fetching it instead');
          const { data: existingData } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)
            .single();
            
          return existingData;
        } else {
          toast({
            title: "Error",
            description: "Failed to create progress record. Please try signing out and back in.",
            variant: "destructive"
          });
        }
        return null;
      }
      
      // If successful, show a welcome toast
      toast({
        title: "Welcome!",
        description: "Your progress tracking has been set up.",
      });
      
      return data;
    } catch (unexpectedError) {
      console.error('Unexpected error in createInitialUserProgress:', unexpectedError);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  },
  
  async updateUserProgress(updates: Partial<UserProgress>): Promise<UserProgress | null> {
    const { data: user } = await supabase.auth.getUser();
    
    // If no user, use localStorage
    if (!user.user) {
      LocalStorageService.updateUserProgress(updates);
      return { ...LocalStorageService.getUserProgress(), ...updates };
    }
    
    // Otherwise use Supabase for admin
    // First ensure user progress record exists
    const currentProgress = await this.getUserProgress();
    if (!currentProgress || !currentProgress.id) {
      console.log('No progress record found when trying to update, creating one first');
      const newProgress = await this.createInitialUserProgress(user.user.id);
      if (!newProgress) return null;
    }
    
    // Apply the updates
    const { data, error } = await supabase
      .from('user_progress')
      .update(updates)
      .eq('user_id', user.user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user progress:', error);
      toast({
        title: "Sync Error",
        description: "Failed to save your progress. We'll try again later.",
        variant: "destructive"
      });
      return null;
    }
    
    return data;
  },
  
  async addXP(amount: number): Promise<UserProgress | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      // If no user, use localStorage
      if (!user.user) {
        const currentProgress = LocalStorageService.getUserProgress();
        const oldLevel = currentProgress.level;
        LocalStorageService.addXP(amount);
        const newProgress = LocalStorageService.getUserProgress();
        const wasLevelUp = newProgress.level > oldLevel;
        
        if (wasLevelUp) {
          toast({
            title: "Level Up!",
            description: `Congratulations! You've reached level ${newProgress.level}!`,
          });
          useConfettiStore.getState().fire();
        } else if (amount > 0) {
          toast({
            description: `+${amount} XP earned!`
          });
        }
        
        return newProgress;
      }
      
      // Otherwise use Supabase for admin
      const userProgress = await this.getUserProgress();
      if (!userProgress) {
        console.log('No user progress found when adding XP');
        return null;
      }
      
      // Calculate new level based on XP
      const newXP = userProgress.xp + amount;
      const newLevel = this.calculateLevel(newXP);
      
      const wasLevelUp = newLevel > userProgress.level;
      
      const updatedProgress = await this.updateUserProgress({
        xp: newXP,
        level: newLevel
      });
      
      if (wasLevelUp && updatedProgress) {
        toast({
          title: "Level Up!",
          description: `Congratulations! You've reached level ${newLevel}!`,
        });
        
        // Trigger confetti for level up
        useConfettiStore.getState().fire();
      } else if (amount > 0) {
        toast({
          description: `+${amount} XP earned!`
        });
      }
      
      return updatedProgress;
    } catch (error) {
      console.error('Error adding XP:', error);
      // Show toast but don't interrupt the game flow
      toast({
        title: "XP Update Error",
        description: "We couldn't update your XP right now, but your game progress is saved.",
        variant: "destructive"
      });
      return null;
    }
  },
  
  async updateStreak(): Promise<UserProgress | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      // If no user, use localStorage
      if (!user.user) {
        LocalStorageService.updateStreak();
        const newProgress = LocalStorageService.getUserProgress();
        
        if (newProgress.current_streak > 1) {
          toast({
            title: `${newProgress.current_streak}-Day Streak!`,
            description: "Keep up the good work! Daily practice makes perfect.",
          });
        }
        
        return newProgress;
      }
      
      // Otherwise use Supabase for admin
      const userProgress = await this.getUserProgress();
      if (!userProgress) {
        console.log('No user progress found when updating streak');
        return null;
      }
      
      const lastPlayed = userProgress.last_played_at 
        ? new Date(userProgress.last_played_at) 
        : null;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let updatedStreak = userProgress.current_streak;
      let wasStreakUpdated = false;
      
      // If they've never played before or it's been more than 2 days, reset streak
      if (!lastPlayed || this.daysBetween(lastPlayed, today) > 1) {
        updatedStreak = 1;
        wasStreakUpdated = true;
      } 
      // If they last played yesterday, increment streak
      else if (this.daysBetween(lastPlayed, today) === 1) {
        updatedStreak = userProgress.current_streak + 1;
        wasStreakUpdated = true;
      } 
      // If they already played today, no streak update needed but still update last_played_at
      else if (this.daysBetween(lastPlayed, today) === 0) {
        // Just update last_played_at below
      }
      
      // Validate streak value to ensure it's always positive
      if (updatedStreak < 0) updatedStreak = 1;
      
      // Only update if the streak changed or we need to update last_played_at
      const maxStreak = Math.max(userProgress.max_streak || 0, updatedStreak);
      
      const updatedProgress = await this.updateUserProgress({
        current_streak: updatedStreak,
        max_streak: maxStreak,
        last_played_at: new Date().toISOString()
      });
      
      if (wasStreakUpdated && updatedStreak > 1) {
        toast({
          title: `${updatedStreak}-Day Streak!`,
          description: "Keep up the good work! Daily practice makes perfect.",
        });
      }
      
      return updatedProgress;
    } catch (error) {
      console.error('Error updating streak:', error);
      // Show toast but don't interrupt game flow
      toast({
        title: "Streak Update Error",
        description: "We couldn't update your streak right now.",
        variant: "destructive"
      });
      return null;
    }
  },
  
  async recordGameSession(
    gameType: string, 
    score: number, 
    durationSeconds: number, 
    xpEarned: number,
    categoryId?: string
  ): Promise<GameSession | null> {
    const { data: user } = await supabase.auth.getUser();
    
    // If no user, use localStorage
    if (!user.user) {
      LocalStorageService.saveGameSession(gameType, score, durationSeconds, xpEarned, categoryId || null);
      await this.addXP(xpEarned);
      await this.updateStreak();
      
      // Check for achievements
      const { AchievementService } = await import('./AchievementService');
      await AchievementService.checkAndAwardAchievements();
      
      return {
        id: crypto.randomUUID(),
        game_type: gameType,
        score,
        duration_seconds: durationSeconds,
        xp_earned: xpEarned,
        category_id: categoryId || null,
        created_at: new Date().toISOString()
      };
    }
    
    // Otherwise use Supabase for admin
    try {
      // First record the game session
      const { data, error } = await supabase
        .from('game_sessions')
        .insert({
          user_id: user.user.id,
          game_type: gameType,
          score,
          duration_seconds: durationSeconds,
          xp_earned: xpEarned,
          category_id: categoryId || null
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error recording game session:', error);
        return null;
      }
      
      // Then update XP and streak - continue even if the game session was saved
      try {
        await this.addXP(xpEarned);
        await this.updateStreak();
        
        // Check for new achievements after recording the game
        const { AchievementService } = await import('./AchievementService');
        await AchievementService.checkAndAwardAchievements();
      } catch (progressError) {
        console.error('Error updating progress after game session:', progressError);
        // Game session was still saved, so return it
      }
      
      return data;
    } catch (error) {
      console.error('Unexpected error recording game session:', error);
      toast({
        title: "Error",
        description: "Failed to save your game results. Please check your connection.",
        variant: "destructive"
      });
      return null;
    }
  },
  
  async getGameHistory(limit = 10): Promise<GameSession[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      // If no user, use localStorage
      if (!user.user) {
        return LocalStorageService.getGameHistory(limit);
      }
      
      // Otherwise use Supabase for admin
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Error fetching game history:', error);
        return [];
      }
      
      return data;
    } catch (error) {
      console.error('Unexpected error fetching game history:', error);
      return [];
    }
  },
  
  // Helper methods
  calculateLevel(xp: number): number {
    // Simple level calculation: each level requires 20% more XP than the previous
    // Level 1: 0-100 XP
    // Level 2: 101-220 XP
    // Level 3: 221-364 XP
    // etc.
    let levelThreshold = 100;
    let currentLevel = 1;
    let remainingXP = xp;
    
    while (remainingXP >= levelThreshold) {
      remainingXP -= levelThreshold;
      currentLevel++;
      levelThreshold = Math.floor(levelThreshold * 1.2);
    }
    
    return currentLevel;
  },
  
  calculateXPForNextLevel(level: number): number {
    let xpRequired = 100;
    for (let i = 1; i < level; i++) {
      xpRequired = Math.floor(xpRequired * 1.2);
    }
    return xpRequired;
  },
  
  calculateXPForCurrentLevel(level: number): number {
    if (level === 1) return 0;
    
    let totalXP = 0;
    let xpRequired = 100;
    
    for (let i = 1; i < level; i++) {
      totalXP += xpRequired;
      xpRequired = Math.floor(xpRequired * 1.2);
    }
    
    return totalXP;
  },
  
  daysBetween(date1: Date, date2: Date): number {
    // Reset hours/mins/secs/ms to get full day difference
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    
    return Math.round(Math.abs((d2.getTime() - d1.getTime()) / (24 * 60 * 60 * 1000)));
  }
};
