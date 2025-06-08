
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Medal } from 'lucide-react';
import { UserAchievement } from '@/services/AchievementService';

interface AchievementsCardProps {
  userAchievements: UserAchievement[];
  achievementsLoading: boolean;
}

const AchievementsCard: React.FC<AchievementsCardProps> = ({
  userAchievements,
  achievementsLoading
}) => {
  const navigate = useNavigate();

  return (
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
  );
};

export default AchievementsCard;
