
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { GameProgressService, UserProgress, GameSession } from '@/services/GameProgressService';
import { AchievementService, UserAchievement } from '@/services/AchievementService';
import { supabase } from '@/integrations/supabase/client';
import {
  ProfileHeader,
  AccountInformationCard,
  LearningProgressCard,
  AchievementsCard,
  AccountManagementCard,
  GameHistoryCard
} from '@/components/profile';

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Fetch user progress data
  const { data: userProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['userProgress'],
    queryFn: () => GameProgressService.getUserProgress(),
    enabled: !!user
  });
  
  // Fetch user achievements
  const { data: userAchievements = [], isLoading: achievementsLoading } = useQuery({
    queryKey: ['userAchievements'],
    queryFn: () => AchievementService.getUserAchievements(),
    enabled: !!user
  });
  
  // Fetch recent game history
  const { data: gameHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ['gameHistory'],
    queryFn: () => GameProgressService.getGameHistory(10),
    enabled: !!user
  });

  // Fetch pending deletion request
  const { data: deletionRequest } = useQuery({
    queryKey: ['deletionRequest'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('account_deletion_requests')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'pending')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    },
    enabled: !!user
  });
  
  // Check for new achievements on page load
  useEffect(() => {
    if (user) {
      AchievementService.checkAndAwardAchievements();
    }
  }, [user]);
  
  // If not logged in, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleCancelDeletion = async () => {
    if (!deletionRequest || !confirm('Are you sure you want to cancel your account deletion request?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('account_deletion_requests')
        .update({ status: 'cancelled' })
        .eq('id', deletionRequest.id);

      if (error) throw error;

      toast({
        title: "Deletion Cancelled",
        description: "Your account deletion request has been cancelled.",
      });

      // Refetch the deletion request
      window.location.reload();

    } catch (error) {
      console.error('Error cancelling deletion:', error);
      toast({
        title: "Error",
        description: "Failed to cancel deletion request. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Calculate progress to next level
  const calculateLevelProgress = (progress?: UserProgress | null) => {
    if (!progress) return 0;
    
    const currentLevelXP = GameProgressService.calculateXPForNextLevel(progress.level);
    // Simple estimate - assume starting from 0 for current level
    return Math.min(100, Math.floor((progress.xp % currentLevelXP) / currentLevelXP * 100));
  };
  
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Get game type display name
  const getGameTypeName = (type: string) => {
    switch (type) {
      case 'word-match': return 'Word Match';
      case 'audio-challenge': return 'Audio Challenge';
      case 'sentence-builder': return 'Sentence Builder';
      case 'memory-challenge': return 'Memory Challenge';
      default: return type;
    }
  };
  
  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <ProfileHeader
        deletionRequest={deletionRequest}
        onCancelDeletion={handleCancelDeletion}
        formatDate={formatDate}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Profile Card */}
        <AccountInformationCard user={user} />
        
        {/* Learning Stats Card */}
        <div className="space-y-6">
          {/* Learning Progress Card */}
          <LearningProgressCard
            userProgress={userProgress}
            progressLoading={progressLoading}
            calculateLevelProgress={calculateLevelProgress}
          />
          
          {/* Achievements Card */}
          <AchievementsCard
            userAchievements={userAchievements}
            achievementsLoading={achievementsLoading}
          />
        </div>
        
        {/* Account Management Card - Google Play Policy Compliant */}
        <AccountManagementCard />
        
        {/* Recent Games History */}
        <GameHistoryCard
          gameHistory={gameHistory}
          historyLoading={historyLoading}
          formatDate={formatDate}
          getGameTypeName={getGameTypeName}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
