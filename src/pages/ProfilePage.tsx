import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Award, Clock, Target, Calendar, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LocalStorageService } from '@/services/LocalStorageService';
import { format } from 'date-fns';

const ProfilePage = () => {
  const navigate = useNavigate();

  // Fetch all data from localStorage
  const { data: userProgress } = useQuery({
    queryKey: ['localUserProgress'],
    queryFn: () => LocalStorageService.getUserProgress(),
  });

  const { data: gameHistory } = useQuery({
    queryKey: ['localGameHistory'],
    queryFn: () => LocalStorageService.getGameHistory(10),
  });

  const { data: achievements } = useQuery({
    queryKey: ['localAchievements'],
    queryFn: () => LocalStorageService.getAchievements(),
  });

  const { data: learningProgress } = useQuery({
    queryKey: ['localLearningProgress'],
    queryFn: () => LocalStorageService.getLearningProgress(),
  });

  // Calculate level progress
  const calculateLevelProgress = () => {
    if (!userProgress) return 0;
    const xpForNextLevel = 100 * userProgress.level;
    const levelXP = userProgress.xp % xpForNextLevel;
    return Math.min(100, Math.floor((levelXP / xpForNextLevel) * 100));
  };

  return (
    <div className="container px-4 md:px-6 py-8 md:py-12 max-w-6xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
        <p className="text-muted-foreground">Track your learning progress and achievements</p>
      </div>

      <Alert className="mb-6">
        <Target className="h-4 w-4" />
        <AlertDescription>
          Your progress is stored on this device only. All data is kept private and local.
        </AlertDescription>
      </Alert>

      {/* Learning Progress Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Learning Progress
          </CardTitle>
          <CardDescription>Your overall learning statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-full">
                <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="text-2xl font-bold">{userProgress?.level || 1}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total XP</p>
                <p className="text-2xl font-bold">{userProgress?.xp || 0}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{userProgress?.current_streak || 0} days</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Progress to Level {(userProgress?.level || 1) + 1}</p>
              <p className="text-sm text-muted-foreground">{calculateLevelProgress()}%</p>
            </div>
            <Progress value={calculateLevelProgress()} className="h-2" />
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4" />
              <span>Max Streak: {userProgress?.max_streak || 0} days</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game History Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Recent Game History
          </CardTitle>
          <CardDescription>Your last 10 game sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {gameHistory && gameHistory.length > 0 ? (
            <div className="space-y-3">
              {gameHistory.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium capitalize">
                      {session.game_type.replace(/-/g, ' ')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(session.created_at), 'MMM dd, yyyy • hh:mm a')}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="mb-1">
                      Score: {session.score}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      +{session.xp_earned} XP
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No games played yet. Start playing to see your history!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Achievements Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-500" />
            Achievements
          </CardTitle>
          <CardDescription>Your earned achievements</CardDescription>
        </CardHeader>
        <CardContent>
          {achievements && achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.achievementId}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <Award className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="font-medium capitalize">
                      {achievement.achievementId.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Earned {format(new Date(achievement.earnedAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No achievements yet. Keep learning to earn your first achievement!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Learning Progress Summary */}
      {learningProgress && learningProgress.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Learning Activity
            </CardTitle>
            <CardDescription>Total learning interactions: {learningProgress.length}</CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;
