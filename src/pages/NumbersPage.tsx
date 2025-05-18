import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import LearnLayout from '@/components/layout/LearnLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Headphones, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { ContentService } from '@/services/ContentService';
import { ContentItem } from '@/types/content';
import { Skeleton } from '@/components/ui/skeleton';
import { useAudioPreloader } from '@/hooks/use-audio-preloader';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const NumbersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("1-10");
  const [audioInitialized, setAudioInitialized] = useState(false);
  const isMobile = useIsMobile();
  
  // Use our enhanced audio preloader hook with improved options
  const { 
    playAudio, 
    preloadAudioBatch, 
    initializeAudioContext,
    isLoading: isAudioLoading, 
    progress: audioLoadingProgress,
    isCached
  } = useAudioPreloader({
    maxConcurrent: 3, // Limit concurrent audio loads
    maxRetries: 3, // Increased retries
    onLoadError: () => {
      toast({
        title: "Audio Loading Notice",
        description: "Some audio files are being prepared. Click on any element to enable audio playback.",
        variant: "default"
      });
    }
  });

  // Fetch numbers data
  const { data: numbers, isLoading, error } = useQuery({
    queryKey: ['numbers'],
    queryFn: () => ContentService.getContentItemsByCategoryName('Numbers'),
  });

  // Initialize audio system on first user interaction with the page
  const handlePageInteraction = () => {
    if (!audioInitialized) {
      initializeAudioContext();
      setAudioInitialized(true);
    }
  };

  // Add event listeners for user interaction to initialize audio
  useEffect(() => {
    const initAudio = () => {
      if (!audioInitialized) {
        initializeAudioContext();
        setAudioInitialized(true);
        // Remove event listeners after first interaction
        document.removeEventListener('click', initAudio);
        document.removeEventListener('touchstart', initAudio);
      }
    };

    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });

    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
  }, [audioInitialized, initializeAudioContext]);

  // Group numbers by tens for tabs
  const groupNumbersByTens = (items: ContentItem[] = []) => {
    const groups: Record<string, ContentItem[]> = {};
    
    items.forEach(item => {
      const num = parseInt(item.english_translation, 10);
      if (isNaN(num)) return;
      
      // Special handling for number 100
      if (num === 100) {
        const label = "91-100";
        if (!groups[label]) {
          groups[label] = [];
        }
        groups[label].push(item);
        return;
      }
      
      // Normal handling for other numbers
      const groupStart = Math.floor((num - 1) / 10) * 10 + 1;
      const groupEnd = groupStart + 9;
      const label = `${groupStart}-${groupEnd}`;
      
      if (!groups[label]) {
        groups[label] = [];
      }
      
      groups[label].push(item);
    });
    
    // Sort each group by the number value
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => {
        const numA = parseInt(a.english_translation, 10);
        const numB = parseInt(b.english_translation, 10);
        return numA - numB;
      });
    });
    
    return groups;
  };
  
  const numberGroups = groupNumbersByTens(numbers);
  const groupKeys = Object.keys(numberGroups).sort((a, b) => {
    const [startA] = a.split('-').map(Number);
    const [startB] = b.split('-').map(Number);
    return startA - startB;
  });

  // Preload audio files when numbers data is available and tab changes
  useEffect(() => {
    if (numbers && numbers.length > 0 && activeTab && audioInitialized) {
      const currentTabItems = numberGroups[activeTab] || [];
      
      // Extract valid audio URLs from current tab items (high priority)
      const currentTabAudioUrls = currentTabItems
        .filter(item => item.audio_url)
        .map(item => item.audio_url as string);
      
      if (currentTabAudioUrls.length > 0) {
        // Preload current tab audio files with high priority
        preloadAudioBatch(currentTabAudioUrls, true);
      }
      
      // Queue up preloading for other tabs in the background with lower priority
      const otherTabsAudioUrls: string[] = [];
      Object.entries(numberGroups).forEach(([tabKey, tabItems]) => {
        if (tabKey !== activeTab) {
          tabItems.forEach(item => {
            if (item.audio_url) {
              otherTabsAudioUrls.push(item.audio_url as string);
            }
          });
        }
      });
      
      if (otherTabsAudioUrls.length > 0) {
        // Preload other tabs in the background with lower priority
        setTimeout(() => {
          preloadAudioBatch(otherTabsAudioUrls, false);
        }, 1000);
      }
    }
  }, [numbers, numberGroups, activeTab, preloadAudioBatch, audioInitialized]);

  // Enhanced play audio function
  const handlePlayAudio = async (url: string | null, itemId: string) => {
    if (!url) return;
    
    try {
      // Initialize audio context if not already done
      if (!audioInitialized) {
        initializeAudioContext();
        setAudioInitialized(true);
      }
      
      setPlayingAudio(itemId);
      await playAudio(url);
      
      // Reset playing state after a short delay to keep button in "playing" state
      // for a minimum time for better UX
      setTimeout(() => {
        setPlayingAudio(null);
      }, 500);
    } catch (error) {
      console.error("Error playing audio:", error);
      setPlayingAudio(null);
      toast({
        title: "Playback Error",
        description: "Unable to play this audio. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Redirect to login if no user
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <LearnLayout>
        <div className="container px-4 md:px-6 py-8 md:py-12">
          <h1 className="text-3xl font-bold mb-6">Numbers in Phom (1-100)</h1>
          <p className="text-lg mb-8">Learn to count from 1 to 100 in Phom language.</p>
          <Skeleton className="h-10 w-full mb-8" />
          <div className="flex flex-col space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </LearnLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <LearnLayout>
        <div className="container px-4 md:px-6 py-8 md:py-12">
          <h1 className="text-3xl font-bold mb-6">Numbers in Phom (1-100)</h1>
          <p className="text-red-500">Error loading numbers. Please try again later.</p>
        </div>
      </LearnLayout>
    );
  }

  // No data state
  if (!numbers || numbers.length === 0) {
    return (
      <LearnLayout>
        <div className="container px-4 md:px-6 py-8 md:py-12">
          <h1 className="text-3xl font-bold mb-6">Numbers in Phom (1-100)</h1>
          <p>No number content found. Please check back later.</p>
        </div>
      </LearnLayout>
    );
  }

  return (
    <LearnLayout>
      <div className="container px-4 md:px-6 py-8 md:py-12" onClick={handlePageInteraction}>
        <h1 className="text-3xl font-bold mb-6">Numbers in Phom (1-100)</h1>
        <p className="text-lg mb-8">Learn to count from 1 to 100 in Phom language.</p>
        
        {!audioInitialized && (
          <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-center">👆 Click anywhere or interact with the page to enable audio playback</p>
          </div>
        )}
        
        {isAudioLoading && audioInitialized && audioLoadingProgress < 100 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Loading audio files...</span>
              <span className="text-sm font-medium">{audioLoadingProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${audioLoadingProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <Tabs 
          defaultValue={groupKeys[0] || "1-10"} 
          className="w-full"
          onValueChange={setActiveTab}
        >
          <div className="relative mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {!isMobile ? "Scroll horizontally to view all number groups" : "Swipe tabs to view more"}
              </span>
            </div>
            <ScrollArea className="w-full pb-4">
              <TabsList className="inline-flex w-max">
                {groupKeys.map((group) => (
                  <TabsTrigger 
                    key={group} 
                    value={group}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground min-w-[70px]"
                  >
                    {group}
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" className="mt-2" />
            </ScrollArea>
          </div>
          
          {groupKeys.map((group) => (
            <TabsContent key={group} value={group} className="mt-4">
              <div className="flex flex-col space-y-3">
                {numberGroups[group].map((item) => (
                  <Card 
                    key={item.id} 
                    className="border-primary/20 hover:border-primary hover:shadow-md transition-all"
                    onClick={handlePageInteraction}
                  >
                    <CardContent className={`p-3 ${isMobile ? 'px-2' : 'p-4'} flex items-center justify-between`}>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold min-w-[36px]">{item.english_translation}</span>
                        <span className="text-lg text-primary-foreground">{item.phom_word}</span>
                      </div>
                      {item.audio_url && (
                        <Button 
                          size="sm" 
                          variant={isCached(item.audio_url) && audioInitialized ? "ghost" : "secondary"}
                          className="flex items-center gap-1 ml-2"
                          onClick={() => handlePlayAudio(item.audio_url, item.id)}
                          disabled={playingAudio !== null && playingAudio !== item.id}
                        >
                          {playingAudio === item.id ? (
                            <>
                              <Volume2 className="h-4 w-4 animate-pulse" />
                              <span className={isMobile ? "sr-only" : ""}>Playing...</span>
                            </>
                          ) : !isCached(item.audio_url) || !audioInitialized ? (
                            <>
                              <VolumeX className="h-4 w-4" />
                              <span className={isMobile ? "sr-only" : ""}>
                                {audioInitialized ? "Loading..." : "Enable Audio"}
                              </span>
                            </>
                          ) : (
                            <>
                              <Headphones className="h-4 w-4" />
                              <span className={isMobile ? "sr-only" : ""}>Listen</span>
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </LearnLayout>
  );
};

export default NumbersPage;
