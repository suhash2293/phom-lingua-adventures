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
    
    // This would contain logic for checking each achievement's criteria
    // For now, we'll just check a few basic ones as examples
    
    // Get game history for checks
    const { data: gameSessions } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', user.user.id);
    
    const sessions = gameSessions || [];
    const newlyEarnedAchievements: UserAchievement[] = [];
    
    // Check for 'First Game' achievement
    if (sessions.length > 0) {
      const firstGameAchievement = unearnedAchievements.find(a => a.name === 'First Game');
      if (firstGameAchievement) {
        const awarded = await this.awardAchievement(firstGameAchievement.id);
        if (awarded) newlyEarnedAchievements.push(awarded);
      }
    }
    
    // Check for 'Language Explorer' achievement - try all four game types
    const gameTypes = new Set(sessions.map(s => s.game_type));
    if (gameTypes.size >= 4) {
      const explorerAchievement = unearnedAchievements.find(a => a.name === 'Language Explorer');
      if (explorerAchievement) {
        const awarded = await this.awardAchievement(explorerAchievement.id);
        if (awarded) newlyEarnedAchievements.push(awarded);
      }
    }
    
    // Check for 'Word Master' achievement - perfect score in Word Match
    const perfectWordMatch = sessions.some(s => 
      s.game_type === 'word-match' && s.score === 100
    );
    if (perfectWordMatch) {
      const wordMasterAchievement = unearnedAchievements.find(a => a.name === 'Word Master');
      if (wordMasterAchievement) {
        const awarded = await this.awardAchievement(wordMasterAchievement.id);
        if (awarded) newlyEarnedAchievements.push(awarded);
      }
    }
    
    // Check for other achievement conditions as needed...
    
    return newlyEarnedAchievements;
  },
  
  async awardAchievement(achievementId: string): Promise<UserAchievement | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;
    
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
      title: "Achievement Unlocked!",
      description: `${achievement.name}: ${achievement.description}`
    });
    
    return data;
  }
};
