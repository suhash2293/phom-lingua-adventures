
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import LearnLayout from '@/components/layout/LearnLayout';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Headphones, Volume2, VolumeX, ArrowLeft, Menu } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ContentService } from '@/services/ContentService';
import { ContentItem } from '@/types/content';
import { Skeleton } from '@/components/ui/skeleton';
import { useAudioPreloader } from '@/hooks/use-audio-preloader';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const NumbersPage = () => {
  const navigate = useNavigate();
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const isMobile = useIsMobile();
  
  // Learning is fully public - no authentication required
  
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

  // Sort numbers by their numeric value
  const sortedNumbers = React.useMemo(() => {
    if (!numbers) return [];
    
    return [...numbers].sort((a, b) => {
      const numA = parseInt(a.english_translation, 10);
      const numB = parseInt(b.english_translation, 10);
      return numA - numB;
    });
  }, [numbers]);

  // Divide numbers into two rows (optional - can be adjusted to show in a single row)
  const firstRow = React.useMemo(() => {
    return sortedNumbers.filter((_, index) => index < 50);
  }, [sortedNumbers]);

  const secondRow = React.useMemo(() => {
    return sortedNumbers.filter((_, index) => index >= 50);
  }, [sortedNumbers]);

  // Preload audio files when numbers data is available
  useEffect(() => {
    if (sortedNumbers.length > 0 && audioInitialized) {
      // Extract valid audio URLs
      const audioUrls = sortedNumbers
        .filter(item => item.audio_url)
        .map(item => item.audio_url as string);
      
      if (audioUrls.length > 0) {
        // Preload audio files in batches
        preloadAudioBatch(audioUrls.slice(0, 20), true); // First 20 with high priority
        
        // Load the rest with lower priority
        setTimeout(() => {
          preloadAudioBatch(audioUrls.slice(20), false);
        }, 1000);
      }
    }
  }, [sortedNumbers, preloadAudioBatch, audioInitialized]);

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
      
      // Reset playing state after a short delay
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

  // Loading state
  if (isLoading) {
    return (
      <LearnLayout>
        <div className="container px-4 md:px-6 py-8 md:py-12">
          {/* Mobile header skeleton */}
          <div className="flex items-center justify-between mb-6 md:hidden">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-9 w-9" />
          </div>

          {/* Desktop back button skeleton */}
          <div className="hidden md:block mb-6">
            <Skeleton className="h-9 w-48" />
          </div>

          <h1 className="text-3xl font-bold mb-6">Numbers in Phom (1-100)</h1>
          <p className="text-lg mb-8">Learn to count from 1 to 100 in Phom language.</p>
          
          {/* Loading indicator */}
          <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-center text-muted-foreground">Loading numbers...</p>
          </div>
          
          {/* Mobile loading: 2-column grid */}
          <div className="space-y-8 md:hidden">
            {/* First 50 numbers skeleton */}
            <div>
              <Skeleton className="h-5 w-32 mb-3" />
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 50 }).map((_, i) => (
                  <Skeleton key={`mobile-first-${i}`} className="h-32 w-full" />
                ))}
              </div>
            </div>
            
            {/* Second 50 numbers skeleton */}
            <div className="mt-8">
              <Skeleton className="h-5 w-32 mb-3" />
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 50 }).map((_, i) => (
                  <Skeleton key={`mobile-second-${i}`} className="h-32 w-full" />
                ))}
              </div>
            </div>
          </div>

          {/* Desktop loading: horizontal scroll */}
          <div className="space-y-6 hidden md:block">
            {/* First row skeleton */}
            <div>
              <Skeleton className="h-5 w-48 mb-2" />
              <ScrollArea className="w-full pb-4">
                <div className="flex gap-2 pb-1 min-w-max">
                  {Array.from({ length: 50 }).map((_, i) => (
                    <Skeleton 
                      key={`desktop-first-${i}`} 
                      className="flex-shrink-0" 
                      style={{ width: '70px', height: '90px' }}
                    />
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="mt-2" />
              </ScrollArea>
            </div>
            
            {/* Second row skeleton */}
            <div>
              <Skeleton className="h-5 w-48 mb-2" />
              <ScrollArea className="w-full pb-4">
                <div className="flex gap-2 pb-1 min-w-max">
                  {Array.from({ length: 50 }).map((_, i) => (
                    <Skeleton 
                      key={`desktop-second-${i}`} 
                      className="flex-shrink-0" 
                      style={{ width: '70px', height: '90px' }}
                    />
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="mt-2" />
              </ScrollArea>
            </div>
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

  const renderNumberCard = (item: ContentItem, index: number, isMobileView: boolean) => (
    <Card 
      key={item.id} 
      className={`border-primary/20 hover:border-primary hover:shadow-md transition-all flex-shrink-0 animate-in fade-in slide-in-from-bottom-4 ${
        isMobileView ? "w-full h-32" : ""
      }`}
      style={{
        ...(isMobileView ? {} : { width: '70px', height: '90px' }),
        animationDelay: `${index * 10}ms`,
        animationFillMode: 'both'
      }}
    >
      <CardContent className="flex flex-col p-3 h-full justify-center items-center">
        <div className="flex flex-col items-center justify-center mb-1">
          <span className={`font-bold ${isMobileView ? "text-2xl" : "text-lg"}`}>
            {item.english_translation}
          </span>
          <span 
            className={`text-black mt-1 text-center ${isMobileView ? "text-base" : "text-xs truncate w-full"}`}
            title={item.phom_word}
          >
            {item.phom_word}
          </span>
        </div>
        {item.audio_url && (
          <Button 
            size="sm" 
            variant={isCached(item.audio_url) && audioInitialized ? "ghost" : "secondary"}
            className={`flex items-center justify-center mt-2 p-0 ${
              isMobileView ? "h-8 w-8 min-h-[32px]" : "h-6 w-6 min-h-[24px]"
            }`}
            onClick={() => handlePlayAudio(item.audio_url, item.id)}
            disabled={playingAudio !== null && playingAudio !== item.id}
            title="Play audio"
          >
            {playingAudio === item.id ? (
              <Volume2 className={isMobileView ? "h-4 w-4" : "h-3 w-3"} />
            ) : !isCached(item.audio_url) || !audioInitialized ? (
              <VolumeX className={isMobileView ? "h-4 w-4" : "h-3 w-3"} />
            ) : (
              <Headphones className={isMobileView ? "h-4 w-4" : "h-3 w-3"} />
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  // Render the numbers in different layouts based on device type
  return (
    <LearnLayout>
      <div 
        className="container px-4 md:px-6 py-8 md:py-12 animate-in fade-in duration-500" 
        onClick={handlePageInteraction}
      >
        {/* Mobile header with back button and menu */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/learn')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Learning Modules
          </Button>
          <SidebarTrigger className="flex items-center gap-2 p-2">
            <Menu className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </SidebarTrigger>
        </div>

        {/* Desktop back button */}
        <div className="hidden md:block mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/learn')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Learning Modules
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-6">Numbers in Phom (1-100)</h1>
        <p className="text-lg mb-8">Learn to count from 1 to 100 in Phom language.</p>
        
        {!audioInitialized && (
          <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg transition-all duration-300">
            <p className="text-center text-sm">👆 Click anywhere to enable audio playback</p>
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
        
        {/* Mobile layout - vertical grid with 2 columns */}
        <div className="space-y-8 md:hidden">
          <div>
            <div className="flex justify-between mb-3">
              <span className="text-sm text-muted-foreground">
                Numbers 1-50
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {firstRow.map((item, index) => renderNumberCard(item, index, true))}
            </div>
          </div>
          
          <div className="mt-8">
            <div className="flex justify-between mb-3">
              <span className="text-sm text-muted-foreground">
                Numbers 51-100
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {secondRow.map((item, index) => renderNumberCard(item, index, true))}
            </div>
          </div>
        </div>

        {/* Desktop layout - horizontal scroll */}
        <div className="space-y-6 hidden md:block">
          {/* First row of numbers (1-50) */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Numbers 1-50 (swipe to see all)
              </span>
            </div>
            <ScrollArea className="w-full pb-4">
              <div className="flex gap-2 pb-1 min-w-max">
                {firstRow.map((item, index) => renderNumberCard(item, index, false))}
              </div>
              <ScrollBar orientation="horizontal" className="mt-2" />
            </ScrollArea>
          </div>
          
          {/* Second row of numbers (51-100) */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Numbers 51-100 (swipe to see all)
              </span>
            </div>
            <ScrollArea className="w-full pb-4">
              <div className="flex gap-2 pb-1 min-w-max">
                {secondRow.map((item, index) => renderNumberCard(item, index, false))}
              </div>
              <ScrollBar orientation="horizontal" className="mt-2" />
            </ScrollArea>
          </div>
        </div>
      </div>
    </LearnLayout>
  );
};

export default NumbersPage;
