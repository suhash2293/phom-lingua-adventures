
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Howl } from 'howler';
import { shuffle } from 'lodash';
import { ArrowLeft, Volume2, VolumeX, Loader2, Hand } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ContentService } from '@/services/ContentService';
import { GameProgressService } from '@/services/GameProgressService';
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
  const [audioContextReady, setAudioContextReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const { fire } = useConfettiStore();
  
  // Helper function to create alternating sequence that prevents consecutive same-module questions
  const createAlternatingSequence = useCallback((
    itemsByCategory: Map<string, ContentItem[]>
  ): ContentItem[] => {
    const result: ContentItem[] = [];
    const categoryIds = Array.from(itemsByCategory.keys());
    let lastCategoryId: string | null = null;
    
    // Create a pool of available items per category (shuffled)
    const pools = new Map<string, ContentItem[]>();
    itemsByCategory.forEach((items, catId) => {
      pools.set(catId, shuffle([...items]));
    });
    
    // Keep selecting items until all pools are empty
    while (pools.size > 0) {
      // Get categories that are NOT the last used one (to prevent consecutive)
      const availableCategories = categoryIds.filter(
        id => pools.has(id) && id !== lastCategoryId
      );
      
      // If only one category remains, we have to use it
      const categoriesToChooseFrom = availableCategories.length > 0 
        ? availableCategories 
        : Array.from(pools.keys());
      
      // Randomly select from available categories
      const selectedCategory = categoriesToChooseFrom[
        Math.floor(Math.random() * categoriesToChooseFrom.length)
      ];
      
      const pool = pools.get(selectedCategory)!;
      const item = pool.pop()!;
      result.push(item);
      lastCategoryId = selectedCategory;
      
      // Remove empty pools
      if (pool.length === 0) {
        pools.delete(selectedCategory);
      }
    }
    
    return result;
  }, []);

  // Helper to fetch items grouped by category and create alternating sequence
  const fetchAlternatingItems = useCallback(async (): Promise<ContentItem[]> => {
    const categories = await ContentService.getCategories();
    
    const itemsByCategory = new Map<string, ContentItem[]>();
    for (const category of categories) {
      const categoryItems = await ContentService.getContentItemsByCategoryId(category.id);
      const itemsWithAudio = categoryItems.filter(item => item.audio_url);
      if (itemsWithAudio.length > 0) {
        itemsByCategory.set(category.id, itemsWithAudio);
      }
    }
    
    return createAlternatingSequence(itemsByCategory);
  }, [createAlternatingSequence]);

  // Fetch content items for the selected category or a random mix
  const { data: contentItems, isLoading } = useQuery({
    queryKey: ['audioChallengeContent', categoryId],
    queryFn: async () => {
      if (categoryId) {
        return ContentService.getContentItemsByCategoryId(categoryId);
      } else {
        // Get alternating sequence from all categories for random mix
        return fetchAlternatingItems();
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

  // Initialize audio context on first user interaction (for mobile browsers)
  useEffect(() => {
    const initAudioContext = () => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          ctx.resume().then(() => {
            setAudioContextReady(true);
            console.log('Audio context initialized successfully');
            // Don't close the context, keep it for future use
          }).catch(err => {
            console.error('Failed to resume audio context:', err);
            setAudioContextReady(true); // Still allow attempts
          });
        } else {
          setAudioContextReady(true); // No AudioContext, but still allow HTML5 audio
        }
      } catch (error) {
        console.error('Audio context initialization error:', error);
        setAudioContextReady(true); // Allow attempts anyway
      }
      document.removeEventListener('click', initAudioContext);
      document.removeEventListener('touchstart', initAudioContext);
    };

    document.addEventListener('click', initAudioContext);
    document.addEventListener('touchstart', initAudioContext);
    
    return () => {
      document.removeEventListener('click', initAudioContext);
      document.removeEventListener('touchstart', initAudioContext);
    };
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
  

  // HTML5 Audio fallback with improved error handling
  const playWithHtmlAudio = (src: string) => {
    try {
      // Clean up previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.load();
        audioRef.current = null;
      }

      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.preload = 'auto';
      
      // Add cache-busting to avoid stale cached files
      const cacheBustedSrc = src.includes('?') 
        ? `${src}&_t=${Date.now()}` 
        : `${src}?_t=${Date.now()}`;

      setAudioLoading(true);
      setAudioError(null);

      const handleCanPlay = () => {
        setAudioLoading(false);
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise.then(() => {
            setIsPlaying(true);
            setAudioPlayed(true);
          }).catch(error => {
            console.error('HTML5 audio play error:', error);
            if (error.name === 'NotAllowedError') {
              setAudioError('Tap the "Play Audio" button to enable audio');
              setAudioContextReady(false);
            } else {
              setAudioError('Failed to play audio. Please try again.');
            }
          });
        }
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setAudioLoading(false);
      };

      const handleError = (e: Event) => {
        setAudioLoading(false);
        const error = (e.target as HTMLAudioElement).error;
        console.error('HTML5 audio error:', error?.message || 'Unknown error', src);
        setAudioError('Could not load audio. Please try again.');
      };

      // Use one-time event listeners
      audio.addEventListener('canplaythrough', handleCanPlay, { once: true });
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError, { once: true });
      
      audioRef.current = audio;
      audio.src = cacheBustedSrc;
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
        preload: true,
        format: ['mp3', 'ogg', 'wav'],
        xhr: {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache'
          }
        },
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
          setAudioLoading(false);
          setUseHtmlAudio(true);
          playWithHtmlAudio(src);
        },
        onplayerror: (id, error) => {
          console.error('Howler play error, trying HTML5 audio:', src, error);
          setAudioLoading(false);
          setUseHtmlAudio(true);
          playWithHtmlAudio(src);
        }
      });
      
      // Set a timeout to prevent infinite loading
      setTimeout(() => {
        if (audioLoading && !isPlaying) {
          setAudioLoading(false);
          setAudioError('Audio loading timed out. Please try again.');
        }
      }, 10000);
      
    } catch (error) {
      console.error('Howler.js error, falling back to HTML5:', error);
      setAudioLoading(false);
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
  
  const handlePlayAgain = async () => {
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
    if (categoryId && contentItems) {
      // Single category - just shuffle
      const shuffledItems = shuffle(contentItems.filter(item => item.audio_url)) as ContentItem[];
      setItems(shuffledItems);
    } else {
      // Random mix - use alternating sequence logic
      const alternatingItems = await fetchAlternatingItems();
      setItems(alternatingItems);
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
    if (isFinished && gameStartTime && gameEndTime) {
      const duration = calculateGameDuration();
      recordGameResults(score, duration, categoryId);
    }
  }, [isFinished, score, gameStartTime, gameEndTime, categoryId]);
  
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
      
      {items.length === 0 ? (
        <div className="text-center">
          <p>No audio items available for this category.</p>
          <Button onClick={() => navigate('/games')}>Go Back</Button>
        </div>
      ) : !isFinished ? (
        <>
          <div className="mb-4">
            {!audioContextReady && (
              <div className="text-center text-blue-600 mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-center gap-2">
                  <Hand className="h-4 w-4" />
                  Tap anywhere to enable audio playback
                </div>
              </div>
            )}
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
                    {option.english_translation}
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
