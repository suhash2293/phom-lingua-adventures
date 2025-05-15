import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { shuffle } from 'lodash';
import { Volume2, ArrowLeft, Clock, Check, X, Loader2 } from 'lucide-react';

import { ContentService } from '@/services/ContentService';
import { GameProgressService } from '@/services/GameProgressService';
import { useAuth } from '@/contexts/AuthContext';
import { ContentItem } from '@/types/content';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { useAudioPreloader } from '@/hooks/use-audio-preloader';

const QUESTIONS_PER_GAME = 10;
const SECONDS_PER_GAME = 120; // 2 minutes
const OPTIONS_PER_QUESTION = 4;

const AudioChallengeGame = () => {
  const { categoryId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [gameState, setGameState] = useState<'intro' | 'loading' | 'playing' | 'completed'>('intro');
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(SECONDS_PER_GAME);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [gameQuestions, setGameQuestions] = useState<{
    contentItem: ContentItem;
    options: ContentItem[];
  }[]>([]);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // Use the improved audio preloader hook with memoized callback functions
  const { 
    playAudio, 
    preloadAudioBatch, 
    isLoading: isAudioLoading,
    progress: audioLoadingProgress,
    clearCache 
  } = useAudioPreloader({
    onLoadError: (error) => {
      console.error("Audio loading error:", error);
      toast({
        title: "Audio Loading Error",
        description: "There was a problem loading some audio files. The game experience might be affected.",
        variant: "destructive"
      });
    },
    maxRetries: 2
  });
  
  // Fetch content items based on category
  const { data: fetchedItems, isLoading } = useQuery({
    queryKey: ['contentItems', categoryId],
    queryFn: async () => {
      if (categoryId) {
        return ContentService.getContentItemsByCategory(categoryId);
      } else {
        // Get all categories and select random items from each
        const categories = await ContentService.getCategories();
        let allItems: ContentItem[] = [];
        
        // Get some items from each category
        for (const category of categories) {
          const categoryItems = await ContentService.getContentItemsByCategory(category.id);
          // Filter to only include items with audio
          const audioItems = categoryItems.filter(item => item.audio_url);
          allItems = [...allItems, ...audioItems];
        }
        
        return shuffle(allItems).slice(0, 30); // Limit to 30 random items
      }
    }
  });
  
  // Set up the game when content items are loaded
  useEffect(() => {
    if (fetchedItems && fetchedItems.length > 0) {
      // Filter to only include items with audio URLs
      const audioItems = fetchedItems.filter(item => item.audio_url);
      setContentItems(audioItems);
    }
  }, [fetchedItems]);
  
  // Start game timer when game state changes to playing
  useEffect(() => {
    if (gameState === 'playing') {
      setGameStartTime(Date.now());
      const timer = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            endGame();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [gameState]);
  
  // Memoized endGame function to avoid recreation in dependencies
  const endGame = useCallback(async () => {
    setGameState('completed');
    
    const finalScore = score;
    
    // Calculate time taken
    const timeTaken = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : SECONDS_PER_GAME;
    
    // Calculate XP earned based on score and time
    const scoreRatio = finalScore / (QUESTIONS_PER_GAME * 10);
    const timeBonus = Math.max(0, (SECONDS_PER_GAME - timeTaken) / 10);
    const xpEarned = Math.floor((scoreRatio * 60) + timeBonus); // Audio is harder, more XP
    
    // Record game session if user is logged in
    if (user) {
      try {
        await GameProgressService.recordGameSession(
          'audio-challenge',
          finalScore,
          timeTaken,
          xpEarned,
          categoryId
        );
      } catch (error) {
        console.error("Failed to record game progress:", error);
      }
    } else {
      toast({
        title: "Game completed!",
        description: "Sign in to save your progress and earn XP.",
      });
    }
    
    // Don't clear cache on game end for better performance across multiple games
  }, [score, gameStartTime, user, categoryId]);
  
  // Play the audio for the current question using memoized function
  const playCurrentAudio = useCallback(() => {
    const question = gameQuestions[currentQuestion];
    if (question && question.contentItem.audio_url) {
      playAudio(question.contentItem.audio_url).catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  }, [gameQuestions, currentQuestion, playAudio]);
  
  // Prepare questions when game starts - memoized to prevent recreation
  const prepareQuestions = useCallback(async () => {
    // Filter items with audio URLs
    const audioItems = contentItems.filter(item => item.audio_url);
    
    if (audioItems.length < QUESTIONS_PER_GAME) {
      toast({
        title: "Not enough audio content",
        description: "There aren't enough words with audio to play this game with the selected category.",
        variant: "destructive"
      });
      return false;
    }
    
    // Select random audio items for this game
    const gameItems = shuffle(audioItems).slice(0, QUESTIONS_PER_GAME);
    
    // Create questions with options
    const questions = gameItems.map(item => {
      // Get other random items for options, excluding the current item
      const otherItems = shuffle(
        contentItems.filter(other => other.id !== item.id)
      ).slice(0, OPTIONS_PER_QUESTION - 1);
      
      // Combine correct answer with distractors and shuffle
      const options = shuffle([item, ...otherItems]);
      
      return {
        contentItem: item,
        options
      };
    });
    
    setGameQuestions(questions);
    
    // Preload all audio for a smoother experience
    setGameState('loading');
    
    try {
      // Get all audio URLs from the game questions
      const audioUrls = questions.map(q => q.contentItem.audio_url).filter(Boolean) as string[];
      
      // Preload all game audio files with high priority
      await preloadAudioBatch(audioUrls, true);
      
      // Start the game
      setGameState('playing');
      // Small delay to ensure UI is updated before playing audio
      setTimeout(playCurrentAudio, 300);
      
      return true;
    } catch (error) {
      console.error("Failed to preload audio:", error);
      toast({
        title: "Audio Preloading Error",
        description: "Some audio files couldn't be loaded. The game will continue, but you might experience delays.",
        variant: "destructive"
      });
      
      // Continue with the game anyway
      setGameState('playing');
      setTimeout(playCurrentAudio, 300);
      
      return true;
    }
  }, [contentItems, preloadAudioBatch, playCurrentAudio]);
  
  // Start the game
  const startGame = useCallback(() => {
    setGameState('loading');
    setScore(0);
    setCurrentQuestion(0);
    setTimeRemaining(SECONDS_PER_GAME);
    prepareQuestions();
  }, [prepareQuestions]);
  
  // Handle answer selection
  const handleSelectAnswer = useCallback((selectedItem: ContentItem) => {
    if (isCorrect !== null) return; // Already answered
    
    const question = gameQuestions[currentQuestion];
    const correct = selectedItem.id === question.contentItem.id;
    
    setSelectedAnswerId(selectedItem.id);
    setIsCorrect(correct);
    
    // Update score
    if (correct) {
      setScore(prev => prev + 10);
    }
    
    // Wait before moving to next question
    setTimeout(() => {
      if (currentQuestion + 1 < gameQuestions.length) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswerId(null);
        setIsCorrect(null);
        
        // Small delay to ensure UI is updated before playing audio
        setTimeout(playCurrentAudio, 300);
      } else {
        endGame();
      }
    }, 1500);
  }, [currentQuestion, gameQuestions, endGame, isCorrect, playCurrentAudio]);
  
  // Reset the game - memoized to avoid recreation
  const resetGame = useCallback(() => {
    // Don't clear cache, keep preloaded audio for better performance
    setGameState('intro');
    setScore(0);
    setCurrentQuestion(0);
    setTimeRemaining(SECONDS_PER_GAME);
    setGameStartTime(null);
    setSelectedAnswerId(null);
    setIsCorrect(null);
  }, []);
  
  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      // Only clear cache when component completely unmounts
      clearCache();
    };
  }, [clearCache]);
  
  // Generate loading screen with progress bar
  const renderLoadingScreen = () => (
    <Card className="p-6 mb-6 text-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <h2 className="text-xl font-bold">Loading Game Audio</h2>
        <p>Preloading audio files for instant playback...</p>
        <Progress 
          className="w-64 h-2" 
          value={audioLoadingProgress} // Use actual progress from hook
        />
        <p className="text-sm text-muted-foreground">{audioLoadingProgress}% complete</p>
      </div>
    </Card>
  );
  
  if (isLoading) {
    return (
      <div className="container px-4 py-8 text-center">
        <p>Loading game content...</p>
      </div>
    );
  }
  
  return (
    <div className="container px-4 md:px-6 py-8">
      <div className="flex items-center mb-6 gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/games')} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Audio Challenge</h1>
      </div>
      
      {gameState === 'intro' && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">Instructions</h2>
          <p className="mb-4">
            Listen to the Phom word and select the correct English translation.
            You'll hear each audio once, but can press the play button to hear it again.
          </p>
          <Button onClick={startGame}>Start Game</Button>
        </Card>
      )}
      
      {gameState === 'loading' && renderLoadingScreen()}
      
      {gameState === 'playing' && gameQuestions.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm font-medium">Score: {score}</p>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">{timeRemaining}s</p>
            </div>
          </div>
          
          <Progress 
            value={((currentQuestion + 1) / QUESTIONS_PER_GAME) * 100} 
            className="h-2 mb-8" 
          />
          
          <div className="text-center mb-8">
            <p className="text-lg font-medium mb-2">Question {currentQuestion + 1} of {QUESTIONS_PER_GAME}</p>
            <Button 
              size="icon" 
              className="h-16 w-16 rounded-full mx-auto relative"
              onClick={playCurrentAudio}
              disabled={isAudioLoading}
            >
              {isAudioLoading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <Volume2 className="h-8 w-8" />
              )}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {gameQuestions[currentQuestion].options.map((option) => {
              const isSelected = selectedAnswerId === option.id;
              const isCorrectAnswer = gameQuestions[currentQuestion].contentItem.id === option.id;
              
              let buttonVariant: "default" | "outline" | "destructive" | "secondary" = "outline";
              
              if (isCorrect !== null) {
                // After answering
                if (isCorrectAnswer) {
                  buttonVariant = "default"; // Correct answer is highlighted
                } else if (isSelected) {
                  buttonVariant = "destructive"; // Selected wrong answer
                }
              } else if (isSelected) {
                buttonVariant = "secondary"; // Currently selected
              }
              
              return (
                <Button
                  key={option.id}
                  variant={buttonVariant}
                  className="h-auto py-4 px-6 relative"
                  disabled={isCorrect !== null || isAudioLoading}
                  onClick={() => handleSelectAnswer(option)}
                >
                  {option.english_translation}
                  {isCorrect !== null && isCorrectAnswer && (
                    <Check className="absolute right-2 h-4 w-4 text-green-500" />
                  )}
                  {isCorrect !== null && isSelected && !isCorrectAnswer && (
                    <X className="absolute right-2 h-4 w-4 text-red-500" />
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      )}
      
      {gameState === 'completed' && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">Game Completed!</h2>
          <div className="mb-4">
            <p className="text-lg">Final Score: {score}</p>
            <p className="text-muted-foreground">
              You answered correctly {score / 10} out of {QUESTIONS_PER_GAME} questions.
            </p>
          </div>
          <div className="flex gap-4">
            <Button onClick={resetGame}>Play Again</Button>
            <Button variant="outline" onClick={() => navigate('/games')}>
              Back to Games
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AudioChallengeGame;
