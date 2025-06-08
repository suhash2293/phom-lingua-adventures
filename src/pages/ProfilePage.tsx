
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GameProgressService, UserProgress, GameSession } from '@/services/GameProgressService';
import { AchievementService, UserAchievement } from '@/services/AchievementService';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Award, Medal, Calendar, Trash2, AlertTriangle } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
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
  
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // This would update the user profile in a real implementation
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
  };

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
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      
      {/* Account Deletion Warning */}
      {deletionRequest && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Account Deletion Scheduled</strong>
                <p className="text-sm mt-1">
                  Your account will be deleted on {formatDate(deletionRequest.deletion_scheduled_at)}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleCancelDeletion}>
                Cancel Deletion
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <form onSubmit={handleUpdateProfile}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled
                />
                <p className="text-sm text-muted-foreground">
                  Email address cannot be changed.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="language-preference">Learning Language Preference</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="phom-english"
                      name="language-preference"
                      defaultChecked
                    />
                    <label htmlFor="phom-english">Phom to English</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="english-phom"
                      name="language-preference"
                    />
                    <label htmlFor="english-phom">English to Phom</label>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button type="submit">Update Profile</Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => navigate('/account-deletion')}
                className="ml-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        {/* Learning Stats Card */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Learning Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {progressLoading ? (
                <p className="text-center text-muted-foreground">Loading progress...</p>
              ) : userProgress ? (
                <>
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium">Current Level</p>
                        <p className="text-2xl font-bold">{userProgress.level}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">Total XP</p>
                        <p className="text-2xl font-bold">{userProgress.xp}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <p className="text-sm">Level {userProgress.level}</p>
                      <p className="text-sm">Level {userProgress.level + 1}</p>
                    </div>
                    <Progress value={calculateLevelProgress(userProgress)} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      {calculateLevelProgress(userProgress)}% to next level
                    </p>
                  </div>
                  
                  <div className="flex justify-between border-t pt-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">Current Streak</p>
                        <p className="text-xl font-bold">{userProgress.current_streak} days</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Best Streak</p>
                      <p className="text-xl font-bold">{userProgress.max_streak} days</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="mb-4 text-muted-foreground">Start playing games to track your progress!</p>
                  <Button onClick={() => navigate('/games')}>Go to Games</Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Achievements Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Your Achievements</CardTitle>
              <CardDescription>
                {userAchievements.length} achievements earned
              </CardDescription>
            </CardHeader>
            <CardContent>
              {achievementsLoading ? (
                <p className="text-center text-muted-foreground">Loading achievements...</p>
              ) : userAchievements.length > 0 ? (
                <div className="space-y-3">
                  {userAchievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Medal className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{achievement.achievement?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {achievement.achievement?.description} • +{achievement.achievement?.xp_reward} XP
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  No achievements yet. Start playing games to earn some!
                </p>
              )}
              
              <div className="mt-4">
                <Button variant="outline" className="w-full" onClick={() => navigate('/games')}>
                  Play Games to Earn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Games History */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Game Activity</CardTitle>
            <CardDescription>
              Your last {gameHistory.length} games played
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <p className="text-center text-muted-foreground">Loading game history...</p>
            ) : gameHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left pb-2">Game</th>
                      <th className="text-left pb-2">Score</th>
                      <th className="text-left pb-2">XP Earned</th>
                      <th className="text-left pb-2">Duration</th>
                      <th className="text-left pb-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameHistory.map((game) => (
                      <tr key={game.id}>
                        <td className="py-2">{getGameTypeName(game.game_type)}</td>
                        <td className="py-2">{game.score}</td>
                        <td className="py-2">+{game.xp_earned} XP</td>
                        <td className="py-2">{game.duration_seconds}s</td>
                        <td className="py-2">{formatDate(game.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground">
                No games played yet. Start playing to see your history!
              </p>
            )}
            
            {gameHistory.length > 0 && (
              <div className="mt-4 text-center">
                <Button onClick={() => navigate('/games')}>
                  Play More Games
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
