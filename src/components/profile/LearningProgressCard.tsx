
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Award, Calendar } from 'lucide-react';
import { UserProgress } from '@/services/GameProgressService';

interface LearningProgressCardProps {
  userProgress: UserProgress | null;
  progressLoading: boolean;
  calculateLevelProgress: (progress?: UserProgress | null) => number;
}

const LearningProgressCard: React.FC<LearningProgressCardProps> = ({
  userProgress,
  progressLoading,
  calculateLevelProgress
}) => {
  const navigate = useNavigate();

  return (
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
  );
};

export default LearningProgressCard;
