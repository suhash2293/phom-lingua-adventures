
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Howl } from 'howler';
import { shuffle } from 'lodash';
import { ArrowLeft, Volume2, VolumeX, Loader2 } from 'lucide-react';

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
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [audioSupported, setAudioSupported] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [useHtmlAudio, setUseHtmlAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const { fire } = useConfettiStore();
  
  // Fetch content items for the selected category or a random mix
  const { data: contentItems, isLoading } = useQuery({
    queryKey: ['audioChallengeContent', categoryId],
    queryFn: () => {
      if (categoryId) {
        return ContentService.getContentItemsByCategoryId(categoryId);
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
  
  // Check audio support on component mount
  useEffect(() => {
    const checkAudioSupport = () => {
      try {
        const audio = new Audio();
        const canPlayMP3 = audio.canPlayType('audio/mpeg') !== '';
        const canPlayOGG = audio.canPlayType('audio/ogg') !== '';
        const canPlayWAV = audio.canPlayType('audio/wav') !== '';
        
        if (!canPlayMP3 && !canPlayOGG && !canPlayWAV) {
          setAudioSupported(false);
          setAudioError('Your browser does not support audio playback.');
        }
      } catch (error) {
        console.error('Error checking audio support:', error);
        setAudioSupported(false);
        setAudioError('Audio support check failed.');
      }
    };
    
    checkAudioSupport();
  }, []);

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
      setAudioPlayed(false);
      setAudioError(null);
      setIsPlaying(false);
    }
  }, [items, currentItemIndex]);

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !isFinished && items.length > 0) {
        event.preventDefault();
        playSound(items[currentItemIndex].audio_url);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentItemIndex, items, isFinished]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.stop();
        sound.unload();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [sound]);
  
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
  };
  
  // Validate audio URL
  const validateAudioUrl = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'cors'
      });
      return response.ok;
    } catch (error) {
      console.error('Audio URL validation failed:', error);
      return false;
    }
  };

  // HTML5 Audio fallback
  const playWithHtmlAudio = (src: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.preload = 'metadata';
      
      audio.onloadstart = () => {
        setAudioLoading(true);
        setAudioError(null);
      };
      
      audio.oncanplaythrough = () => {
        setAudioLoading(false);
        audio.play().then(() => {
          setIsPlaying(true);
          setAudioPlayed(true);
        }).catch(error => {
          setAudioError('Failed to play audio. Please try again.');
          console.error('HTML5 audio play error:', error);
        });
      };
      
      audio.onended = () => {
        setIsPlaying(false);
        setAudioLoading(false);
      };
      
      audio.onerror = () => {
        setAudioLoading(false);
        setAudioError('Failed to load audio file.');
        console.error('HTML5 audio error:', src);
      };
      
      audioRef.current = audio;
      audio.src = src;
      audio.load();
    } catch (error) {
      setAudioLoading(false);
      setAudioError('Audio playback not supported.');
      console.error('HTML5 audio setup error:', error);
    }
  };

  const playSound = async (src: string) => {
    if (!audioSupported) {
      setAudioError('Audio playback is not supported on this device.');
      return;
    }

    setAudioLoading(true);
    setAudioError(null);
    setIsPlaying(false);

    // Validate URL first
    const isValid = await validateAudioUrl(src);
    if (!isValid) {
      setAudioLoading(false);
      setAudioError('Audio file is not accessible. Please check your connection.');
      return;
    }

    // Try Howler.js first, fallback to HTML5 audio
    if (useHtmlAudio) {
      playWithHtmlAudio(src);
      return;
    }

    try {
      if (sound) {
        sound.stop();
        sound.unload();
      }
      
      const newSound = new Howl({
        src: [src],
        html5: true,
        preload: false,
        format: ['mp3', 'ogg', 'wav'],
        onload: () => {
          setAudioLoading(false);
          newSound.play();
          setSound(newSound);
          setAudioPlayed(true);
          setIsPlaying(true);
        },
        onplay: () => {
          setIsPlaying(true);
        },
        onend: () => {
          setAudioLoading(false);
          setIsPlaying(false);
        },
        onstop: () => {
          setIsPlaying(false);
        },
        onloaderror: (id, error) => {
          console.error('Howler load error, trying HTML5 audio:', src, error);
          setUseHtmlAudio(true);
          playWithHtmlAudio(src);
        },
        onplayerror: (id, error) => {
          console.error('Howler play error, trying HTML5 audio:', src, error);
          setUseHtmlAudio(true);
          playWithHtmlAudio(src);
        }
      });
    } catch (error) {
      console.error('Howler.js error, falling back to HTML5:', error);
      setUseHtmlAudio(true);
      playWithHtmlAudio(src);
    }
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
    setAudioPlayed(false);
    setAudioError(null);
    setIsPlaying(false);
    setUseHtmlAudio(false);
    
    // Re-shuffle items for a new game
    if (contentItems) {
      const shuffledItems = shuffle(contentItems.filter(item => item.audio_url)) as ContentItem[];
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
          <div className="mb-4">
            <p className="text-center mb-4">
              {!audioPlayed ? "Click 'Play Audio' to hear the word, then select the correct answer below:" : "Select the correct word:"}
            </p>
            <p className="text-center text-sm text-muted-foreground mb-4">
              💡 Tip: Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Space</kbd> to play audio
            </p>
            
            <div className="flex justify-center mb-4">
              <Button 
                onClick={() => playSound(items[currentItemIndex].audio_url)}
                disabled={audioLoading || !audioSupported}
                size="lg"
                className="min-w-[140px] gap-2"
              >
                {audioLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : isPlaying ? (
                  <>
                    <Volume2 className="h-4 w-4" />
                    Playing...
                  </>
                ) : audioPlayed ? (
                  <>
                    <Volume2 className="h-4 w-4" />
                    Play Again
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4" />
                    Play Audio
                  </>
                )}
              </Button>
            </div>
            
            {audioError && (
              <div className="text-center text-red-500 mb-4 p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-center gap-2">
                  <VolumeX className="h-4 w-4" />
                  {audioError}
                </div>
                {!audioSupported && (
                  <div className="mt-2 text-sm">
                    Try using a different browser or enable audio permissions.
                  </div>
                )}
              </div>
            )}
            
            {!audioSupported && (
              <div className="text-center text-orange-600 mb-4 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-center gap-2">
                  <VolumeX className="h-4 w-4" />
                  Audio playback may not be supported on this device
                </div>
                <div className="mt-2 text-sm">
                  You can still play the game by reading the text options
                </div>
              </div>
            )}
          </div>
          
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
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
