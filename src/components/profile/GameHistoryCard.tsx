
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameSession } from '@/services/GameProgressService';

interface GameHistoryCardProps {
  gameHistory: GameSession[];
  historyLoading: boolean;
  formatDate: (dateString: string) => string;
  getGameTypeName: (type: string) => string;
}

const GameHistoryCard: React.FC<GameHistoryCardProps> = ({
  gameHistory,
  historyLoading,
  formatDate,
  getGameTypeName
}) => {
  const navigate = useNavigate();

  return (
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
  );
};

export default GameHistoryCard;
