import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Award, Clock, Trophy, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GameProgressService, UserProgress } from '@/services/GameProgressService';
import { AchievementService } from '@/services/AchievementService';
import { useAuth } from '@/contexts/AuthContext';
import { ContentService } from '@/services/ContentService';
import { Category } from '@/types/content';
import { useAudioPreloader } from '@/hooks/use-audio-preloader';
const GameCard = ({
  title,
  description,
  icon,
  path,
  categories,
  excludeCategories = []
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  categories: Category[];
  excludeCategories?: string[];
}) => {
  // Filter out excluded categories
  const filteredCategories = categories.filter(category => !excludeCategories.includes(category.id));
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  // Reset selected category if it was removed from the filtered list
  useEffect(() => {
    if (selectedCategory && !filteredCategories.find(c => c.id === selectedCategory)) {
      setSelectedCategory(null);
    }
  }, [filteredCategories, selectedCategory]);
  const handlePlay = () => {
    if (selectedCategory) {
      navigate(`${path}/${selectedCategory}`);
    } else {
      navigate(path);
    }
  };
  return <Card className="w-full">
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
          <Select value={selectedCategory || undefined} onValueChange={value => setSelectedCategory(value || null)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Random Mix" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="random-mix">Random Mix</SelectItem>
              {filteredCategories.map(category => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={handlePlay} className="w-full">
          Play Now
        </Button>
      </CardContent>
    </Card>;
};
const GamesPage = () => {
  const navigate = useNavigate();

  // Use the improved audio preloader hook
  const {
    preloadAudioBatch
  } = useAudioPreloader({
    maxRetries: 1 // Lower retry count for background loading
  });

  // Fetch user progress from localStorage
  const {
    data: progress
  } = useQuery({
    queryKey: ['userProgress'],
    queryFn: async () => {
      const { LocalStorageService } = await import('@/services/LocalStorageService');
      return LocalStorageService.getUserProgress();
    }
  });

  // Fetch categories for game selection
  const {
    data: categories = []
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => ContentService.getCategories()
  });

  // Define the alphabets category ID to exclude from some games
  const ALPHABETS_CATEGORY_ID = "17772f98-6ee4-4f94-aa91-d3309dd0f99a";


  // Memoized audio preloading function to avoid recreation on renders
  const preloadCommonAudio = useCallback(async () => {
    try {
      // Fetch a small set of audio items for preloading
      const popularCategories = await ContentService.getCategories();
      if (!popularCategories.length) return;

      // Get the first category's items
      const categoryItems = await ContentService.getContentItemsByCategory(popularCategories[0].id);

      // Filter to items with audio and limit to 5
      const audioItems = categoryItems.filter(item => item.audio_url).slice(0, 5).map(item => item.audio_url).filter(Boolean) as string[];

      // Preload these in the background with lower priority
      if (audioItems.length) {
        preloadAudioBatch(audioItems, false);
      }
    } catch (error) {
      console.error("Error preloading common audio:", error);
    }
  }, [preloadAudioBatch]);

  // Effect to preload some common audio files in the background
  useEffect(() => {
    // Use requestIdleCallback if available to preload without impacting performance
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(() => {
        preloadCommonAudio();
      }, {
        timeout: 2000
      });
    } else {
      // Fallback to setTimeout with a delay to avoid impacting initial page load
      setTimeout(preloadCommonAudio, 2000);
    }
  }, [preloadCommonAudio]);

  // Enhanced level progress calculation with error handling
  const calculateLevelProgress = (progress?: any) => {
    if (!progress) return 0;
    try {
      const xpForNextLevel = 100 * progress.level;
      const levelXP = progress.xp % xpForNextLevel;
      return Math.min(100, Math.floor((levelXP / xpForNextLevel) * 100));
    } catch (error) {
      console.error("Error calculating level progress:", error);
      return 0;
    }
  };
  return <div className="container px-4 md:px-6 py-8 md:py-12">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Games</h1>
          <p className="text-muted-foreground">Practice your Phom dialect skills with fun interactive games</p>
        </div>
        
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
      </div>
      
      {progress && <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">Progress to Level {progress.level + 1}</p>
            <p className="text-sm">{calculateLevelProgress(progress)}%</p>
          </div>
          <Progress value={calculateLevelProgress(progress)} className="h-2" />
        </div>}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <GameCard title="Word Match" description="Match Phom words with their English translations" icon={<ChevronRight className="h-6 w-6" />} path="/games/word-match" categories={categories} excludeCategories={[ALPHABETS_CATEGORY_ID]} />
        
        <GameCard title="Audio Challenge" description="Listen to audio and select the correct written word" icon={<ChevronRight className="h-6 w-6" />} path="/games/audio-challenge" categories={categories} />
        
        <GameCard title="Word Scramble" description="Unscramble the letters to form the correct Phom words" icon={<ChevronRight className="h-6 w-6" />} path="/games/word-scramble" categories={categories} excludeCategories={[ALPHABETS_CATEGORY_ID]} />
      </div>
      
    </div>;
};
export default GamesPage;