
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Howl } from 'howler';
import { shuffle } from 'lodash';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ContentService } from '@/services/ContentService';
import { GameProgressService } from '@/services/GameProgressService';
import { useAuth } from '@/contexts/AuthContext';
import { useConfettiStore } from '@/stores/confetti';
import { Category, ContentItem } from '@/types/content';
import { Skeleton } from '@/components/ui/skeleton';

const AudioChallengeGame = () => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [options, setOptions] = useState<ContentItem[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);
  const [gameEndTime, setGameEndTime] = useState<Date | null>(null);
  const [sound, setSound] = useState<Howl | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const { fire } = useConfettiStore();
  
  // Fetch content items for the selected category or a random mix
  const { data: contentItems, isLoading } = useQuery({
    queryKey: ['audioChallengeContent', categoryId],
    queryFn: () => {
      if (categoryId) {
        return ContentService.getContentItemsByCategory(categoryId);
      } else {
        return ContentService.getAllContentItems();
      }
    }
  });
  
  // Fetch categories for navigation
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => ContentService.getCategories()
  });
  
  useEffect(() => {
    if (contentItems) {
      const filteredItems = contentItems.filter(item => item.audio_url);
      setItems(filteredItems);
    }
  }, [contentItems]);
  
  useEffect(() => {
    if (items.length > 0) {
      setGameStartTime(new Date());
      prepareOptions();
    }
  }, [items, currentItemIndex]);
  
  const prepareOptions = () => {
    if (!items[currentItemIndex]) return;
    
    const correctItem = items[currentItemIndex];
    let newOptions = [correctItem];
    
    // Add three random incorrect options
    while (newOptions.length < 4) {
      const randomItem = items[Math.floor(Math.random() * items.length)];
      if (randomItem.id !== correctItem.id && !newOptions.find(o => o.id === randomItem.id)) {
        newOptions.push(randomItem);
      }
    }
    
    // Shuffle the options
    newOptions = shuffle(newOptions);
    setOptions(newOptions);
    
    // Play audio
    playSound(correctItem.audio_url);
  };
  
  const playSound = (src: string) => {
    if (sound) {
      sound.stop();
      sound.unload();
    }
    
    const newSound = new Howl({
      src: [src],
      html5: true, // Required for mobile browsers
      onload: () => {
        newSound.play();
        setSound(newSound);
      },
      onend: () => {
        // console.log('Finished playing sound!');
      },
      onloaderror: () => {
        console.error('Failed to load sound:', src);
      }
    });
  };
  
  const handleOptionSelect = (itemId: string) => {
    setSelectedOption(itemId);
    
    if (items[currentItemIndex].id === itemId) {
      setScore(prevScore => prevScore + 1);
      setFeedback("Correct!");
      fire();
    } else {
      setFeedback("Incorrect. Try again!");
    }
    
    // Move to the next question after a delay
    setTimeout(() => {
      setFeedback(null);
      if (currentItemIndex < items.length - 1) {
        setCurrentItemIndex(prevIndex => prevIndex + 1);
        setSelectedOption(null);
      } else {
        setIsFinished(true);
        setGameEndTime(new Date());
      }
    }, 1500);
  };
  
  const handlePlayAgain = () => {
    setCurrentItemIndex(0);
    setScore(0);
    setFeedback(null);
    setIsFinished(false);
    setGameStartTime(new Date());
    setGameEndTime(null);
    setSelectedOption(null);
    
    // Re-shuffle items for a new game
    if (contentItems) {
      const shuffledItems = shuffle(contentItems.filter(item => item.audio_url));
      setItems(shuffledItems);
    }
  };
  
  const formatTime = (date: Date | null): string => {
    if (!date) return '00:00';
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };
  
  const calculateGameDuration = (): number => {
    if (!gameStartTime || !gameEndTime) return 0;
    return Math.round((gameEndTime.getTime() - gameStartTime.getTime()) / 1000);
  };
  
  const recordGameResults = async (
    finalScore: number, 
    durationSeconds: number,
    categoryId?: string
  ) => {
    // Calculate XP based on score, time, etc.
    const xpEarned = Math.max(10, finalScore * 10);
    
    try {
      await GameProgressService.recordGameSession(
        'audio-challenge',  // game type identifier
        finalScore,         // user's score in this game
        durationSeconds,    // how long the game took
        xpEarned,           // XP to award
        categoryId          // Optional category played
      );
    } catch (error) {
      console.error("Failed to record game progress:", error);
      // Game can continue even if progress saving fails
    }
  };
  
  useEffect(() => {
    if (isFinished && user && gameStartTime && gameEndTime) {
      const duration = calculateGameDuration();
      recordGameResults(score, duration, categoryId);
    }
  }, [isFinished, user, score, gameStartTime, gameEndTime, categoryId]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="w-[200px] h-[45px] mb-4" />
        <Skeleton className="w-full h-[150px] mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="w-full h-[100px]" />
          <Skeleton className="w-full h-[100px]" />
          <Skeleton className="w-full h-[100px]" />
          <Skeleton className="w-full h-[100px]" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-4 gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/games')} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Audio Challenge</h1>
      </div>
      
      {categoryId && categories ? (
        <div className="mb-4">
          Category: {categories.find(cat => cat.id === categoryId)?.name}
        </div>
      ) : (
        <div className="mb-4">
          Category: Random Mix
        </div>
      )}
      
      {!user && (
        <div className="mb-4 text-red-500">
          You must be signed in to earn XP and track your progress.
        </div>
      )}
      
      {items.length === 0 ? (
        <div className="text-center">
          <p>No audio items available for this category.</p>
          <Button onClick={() => navigate('/games')}>Go Back</Button>
        </div>
      ) : !isFinished ? (
        <>
          <p className="mb-4">Listen to the audio and select the correct word.</p>
          
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  Question {currentItemIndex + 1} / {items.length}
                </div>
                <div>
                  Score: {score}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {options.map(option => (
                  <Button
                    key={option.id}
                    variant={selectedOption === option.id ? "secondary" : "outline"}
                    onClick={() => handleOptionSelect(option.id)}
                    className="w-full"
                    disabled={!!selectedOption}
                  >
                    {option.phom_word}
                  </Button>
                ))}
              </div>
              
              {feedback && (
                <div className={`mt-4 text-center ${feedback === "Correct!" ? "text-green-500" : "text-red-500"}`}>
                  {feedback}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Button variant="secondary" onClick={() => playSound(items[currentItemIndex].audio_url)}>
            Replay Audio
          </Button>
        </>
      ) : (
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Game Over!</h2>
          <p className="mb-2">Your Score: {score} / {items.length}</p>
          <p className="mb-2">Duration: {formatTime(gameStartTime)} - {formatTime(gameEndTime)}</p>
          <Button className="mr-2" onClick={handlePlayAgain}>Play Again</Button>
          <Button onClick={() => navigate('/games')}>Back to Games</Button>
        </div>
      )}
    </div>
  );
};

export default AudioChallengeGame;
