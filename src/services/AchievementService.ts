
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { GameProgressService } from './GameProgressService';

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  created_at: string;
  updated_at: string;
}

export type UserAchievement = {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement?: Achievement;
}

export const AchievementService = {
  async getUserAchievements(): Promise<UserAchievement[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];
    
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievement_id(*)
      `)
      .eq('user_id', user.user.id);
    
    if (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }
    
    return data;
  },
  
  async getAllAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('xp_reward', { ascending: true });
    
    if (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
    
    return data;
  },
  
  async checkAndAwardAchievements(): Promise<UserAchievement[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];
    
    try {
      // Get all existing achievements and user achievements
      const [allAchievements, userAchievements] = await Promise.all([
        this.getAllAchievements(),
        this.getUserAchievements()
      ]);
      
      // Determine which achievements the user doesn't have yet
      const earnedAchievementIds = userAchievements.map(ua => ua.achievement_id);
      const unearnedAchievements = allAchievements.filter(
        achievement => !earnedAchievementIds.includes(achievement.id)
      );
      
      if (unearnedAchievements.length === 0) {
        return [];
      }
      
      // Get game history and user progress for checks
      const [gameSessions, userProgress] = await Promise.all([
        this.getGameSessions(),
        GameProgressService.getUserProgress()
      ]);
      
      const newlyEarnedAchievements: UserAchievement[] = [];
      
      // Check each unearned achievement
      for (const achievement of unearnedAchievements) {
        let shouldAward = false;
        
        switch (achievement.name) {
          case 'First Game':
            shouldAward = gameSessions.length > 0;
            break;
            
          case 'Language Explorer':
            const gameTypes = new Set(gameSessions.map(s => s.game_type));
            shouldAward = gameTypes.size >= 3; // We have 3 game types currently
            break;
            
          case 'Word Master':
            shouldAward = gameSessions.some(s => 
              s.game_type === 'word-match' && s.score >= 100
            );
            break;
            
          case 'Speed Demon':
            shouldAward = gameSessions.some(s => s.duration_seconds <= 30 && s.score > 0);
            break;
            
          case 'Consistent Learner':
            shouldAward = userProgress ? userProgress.current_streak >= 7 : false;
            break;
            
          case 'XP Hunter':
            shouldAward = userProgress ? userProgress.xp >= 500 : false;
            break;
            
          case 'Audio Expert':
            shouldAward = gameSessions.some(s => 
              s.game_type === 'audio-challenge' && s.score >= 100
            );
            break;
            
          case 'Sentence Master':
            shouldAward = gameSessions.some(s => 
              s.game_type === 'sentence-builder' && s.score >= 100
            );
            break;
            
          case 'Perfect Week':
            const recentGames = gameSessions.filter(s => {
              const gameDate = new Date(s.created_at);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return gameDate >= weekAgo;
            });
            const highScoreGames = recentGames.filter(s => s.score >= 90);
            shouldAward = highScoreGames.length >= 7;
            break;
        }
        
        if (shouldAward) {
          const awarded = await this.awardAchievement(achievement.id);
          if (awarded) {
            newlyEarnedAchievements.push(awarded);
          }
        }
      }
      
      return newlyEarnedAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  },
  
  async getGameSessions() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];
    
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching game sessions for achievements:', error);
      return [];
    }
    
    return data || [];
  },
  
  async awardAchievement(achievementId: string): Promise<UserAchievement | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;
    
    try {
      // First get the achievement details
      const { data: achievement } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', achievementId)
        .single();
      
      if (!achievement) return null;
      
      // Award the achievement to the user
      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.user.id,
          achievement_id: achievementId
        })
        .select(`
          *,
          achievement:achievement_id(*)
        `)
        .single();
      
      if (error) {
        if (error.code === '23505') {
          // Unique violation - user already has this achievement
          console.log('User already has this achievement');
          return null;
        }
        console.error('Error awarding achievement:', error);
        return null;
      }
      
      // Add XP reward
      if (achievement.xp_reward > 0) {
        await GameProgressService.addXP(achievement.xp_reward);
      }
      
      // Show achievement notification
      toast({
        title: "Achievement Unlocked! 🏆",
        description: `${achievement.name}: ${achievement.description} (+${achievement.xp_reward} XP)`
      });
      
      return data;
    } catch (error) {
      console.error('Error awarding achievement:', error);
      return null;
    }
  }
};
