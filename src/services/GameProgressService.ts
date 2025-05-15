
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export type UserProgress = {
  id: string;
  user_id: string;
  xp: number;
  level: number;
  current_streak: number;
  max_streak: number;
  last_played_at: string | null;
}

export type GameSession = {
  id: string;
  user_id: string;
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
    if (!user.user) return null;
    
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.user.id)
      .single();
    
    if (error) {
      console.error('Error fetching user progress:', error);
      return null;
    }
    
    return data;
  },
  
  async updateUserProgress(updates: Partial<UserProgress>): Promise<UserProgress | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;
    
    const { data, error } = await supabase
      .from('user_progress')
      .update(updates)
      .eq('user_id', user.user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user progress:', error);
      return null;
    }
    
    return data;
  },
  
  async addXP(amount: number): Promise<UserProgress | null> {
    const userProgress = await this.getUserProgress();
    if (!userProgress) return null;
    
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
    } else if (amount > 0) {
      toast({
        description: `+${amount} XP earned!`,
        duration: 2000,
      });
    }
    
    return updatedProgress;
  },
  
  async updateStreak(): Promise<UserProgress | null> {
    const userProgress = await this.getUserProgress();
    if (!userProgress) return null;
    
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
    
    // Only update if the streak changed
    if (wasStreakUpdated) {
      const maxStreak = Math.max(userProgress.max_streak, updatedStreak);
      
      const updatedProgress = await this.updateUserProgress({
        current_streak: updatedStreak,
        max_streak: maxStreak,
        last_played_at: new Date().toISOString()
      });
      
      if (updatedStreak > 1) {
        toast({
          title: `${updatedStreak}-Day Streak!`,
          description: "Keep up the good work! Daily practice makes perfect.",
        });
      }
      
      return updatedProgress;
    }
    
    // If already played today, just update last_played_at
    return this.updateUserProgress({
      last_played_at: new Date().toISOString()
    });
  },
  
  async recordGameSession(
    gameType: string, 
    score: number, 
    durationSeconds: number, 
    xpEarned: number,
    categoryId?: string
  ): Promise<GameSession | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;
    
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
    
    // Update XP and streak
    await this.addXP(xpEarned);
    await this.updateStreak();
    
    return data;
  },
  
  async getGameHistory(limit = 10): Promise<GameSession[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];
    
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
  },
  
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
  
  daysBetween(date1: Date, date2: Date): number {
    // Reset hours/mins/secs/ms to get full day difference
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    
    return Math.round(Math.abs((d2.getTime() - d1.getTime()) / (24 * 60 * 60 * 1000)));
  }
};
