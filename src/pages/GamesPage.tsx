import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Award, Clock, Trophy } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GameProgressService, UserProgress } from '@/services/GameProgressService';
import { AchievementService } from '@/services/AchievementService';
import { useAuth } from '@/contexts/AuthContext';
import { ContentService } from '@/services/ContentService';
import { Category } from '@/types/content';

const GameCard = ({ 
  title, 
  description, 
  icon, 
  path,
  categories
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
  path: string;
  categories: Category[];
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const handlePlay = () => {
    if (selectedCategory) {
      navigate(`${path}/${selectedCategory}`);
    } else {
      navigate(path);
    }
  };
  
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-primary/10 p-3 rounded-full">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-bold">{title}</h3>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm mb-2">Choose a category:</label>
          <select 
            className="w-full p-2 border rounded-md"
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
          >
            <option value="">Random Mix</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
        
        <Button 
          onClick={handlePlay}
          className="w-full"
        >
          Play Now
        </Button>
      </CardContent>
    </Card>
  );
};

const GamesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Fetch user progress
  const { data: progress } = useQuery({
    queryKey: ['userProgress'],
    queryFn: () => GameProgressService.getUserProgress(),
    enabled: !!user
  });
  
  // Fetch categories for game selection
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => ContentService.getCategories()
  });
  
  // Effect to check and award achievements
  useEffect(() => {
    if (user) {
      AchievementService.checkAndAwardAchievements();
    }
  }, [user]);
  
  // Calculate level progress
  const calculateLevelProgress = (progress?: UserProgress | null) => {
    if (!progress) return 0;
    
    const currentLevelXP = GameProgressService.calculateXPForNextLevel(progress.level);
    // Simple estimate - assume starting from 0 for current level
    return Math.min(100, Math.floor((progress.xp % currentLevelXP) / currentLevelXP * 100));
  };
  
  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Games</h1>
          <p className="text-muted-foreground">Practice your Phom language skills with fun interactive games</p>
        </div>
        
        {user ? (
          <Card className="w-full md:w-auto">
            <CardContent className="p-4 flex flex-col md:flex-row gap-6">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Level</p>
                  <p className="text-2xl font-bold">{progress?.level || 1}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">XP</p>
                  <p className="text-2xl font-bold">{progress?.xp || 0}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Streak</p>
                  <p className="text-2xl font-bold">{progress?.current_streak || 0} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button onClick={() => navigate("/auth")}>
            Sign in to track progress
          </Button>
        )}
      </div>
      
      {user && progress && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">Progress to Level {progress.level + 1}</p>
            <p className="text-sm">{calculateLevelProgress(progress)}%</p>
          </div>
          <Progress value={calculateLevelProgress(progress)} className="h-2" />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <GameCard 
          title="Word Match" 
          description="Match Phom words with their English translations" 
          icon={<ChevronRight className="h-6 w-6" />}
          path="/games/word-match"
          categories={categories}
        />
        
        <GameCard 
          title="Audio Challenge" 
          description="Listen to audio and select the correct written word" 
          icon={<ChevronRight className="h-6 w-6" />}
          path="/games/audio-challenge"
          categories={categories}
        />
        
        <GameCard 
          title="Word Scramble" 
          description="Unscramble the letters to form the correct Phom words" 
          icon={<ChevronRight className="h-6 w-6" />}
          path="/games/word-scramble"
          categories={categories}
        />
        
        <GameCard 
          title="Memory Challenge" 
          description="Flip cards to match pairs of related words" 
          icon={<ChevronRight className="h-6 w-6" />}
          path="/games/memory-challenge"
          categories={categories}
        />
      </div>
      
      {!user && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-2">Sign in to track your progress</h3>
            <p className="mb-4">Create an account to earn XP, track your learning streak, and unlock achievements.</p>
            <Button asChild>
              <Link to="/auth">Sign In or Create Account</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GamesPage;
