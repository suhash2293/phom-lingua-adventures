
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import LearnLayout from '@/components/layout/LearnLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Headphones, Volume2, VolumeX } from 'lucide-react';
import { ContentService } from '@/services/ContentService';
import { LearningProgressService } from '@/services/LearningProgressService';
import { ContentItem } from '@/types/content';
import { Skeleton } from '@/components/ui/skeleton';
import { useAudioPreloader } from '@/hooks/use-audio-preloader';
import { toast } from '@/hooks/use-toast';

const DaysPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioInitialized, setAudioInitialized] = useState(false);

  // Use our enhanced audio preloader hook with improved options
  const {
    playAudio,
    preloadAudioBatch,
    initializeAudioContext,
    isLoading: isAudioLoading,
    progress: audioLoadingProgress,
    isCached
  } = useAudioPreloader({
    maxConcurrent: 3,
    maxRetries: 3,
    onLoadError: () => {
      toast({
        title: "Audio Loading Notice",
        description: "Some audio files are being prepared. Click on any element to enable audio playback.",
        variant: "default"
      });
    }
  });

  // Fetch days data
  const { data: days, isLoading, error } = useQuery({
    queryKey: ['days'],
    queryFn: () => ContentService.getContentItemsByCategoryName('Days')
  });

  // Get category ID for progress tracking
  const { data: categoryData } = useQuery({
    queryKey: ['days-category'],
    queryFn: async () => {
      const categories = await ContentService.getCategories();
      return categories.find(cat => cat.name === 'Days');
    }
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

  // Preload audio files when days data is available
  useEffect(() => {
    if (days && days.length > 0 && audioInitialized) {
      // Extract valid audio URLs
      const audioUrls = days.filter(item => item.audio_url).map(item => item.audio_url as string);
      if (audioUrls.length > 0) {
        // Preload all audio files
        preloadAudioBatch(audioUrls);
      }
    }
  }, [days, preloadAudioBatch, audioInitialized]);

  // Track when user views content
  useEffect(() => {
    if (days && days.length > 0 && categoryData) {
      // Track that user has viewed this category
      LearningProgressService.trackProgress(categoryData.id, null, 'viewed');
    }
  }, [days, categoryData]);

  // Enhanced play audio function with progress tracking
  const handlePlayAudio = async (url: string | null, itemId: string, item: ContentItem) => {
    if (!url) return;
    try {
      // Initialize audio context if not already done
      if (!audioInitialized) {
        initializeAudioContext();
        setAudioInitialized(true);
      }
      setPlayingAudio(itemId);
      await playAudio(url);

      // Track audio played progress
      if (categoryData) {
        await LearningProgressService.trackProgress(categoryData.id, item.id, 'audio_played');
      }

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

  // Redirect to login if no user
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);
  
  if (!user) {
    return null;
  }
  
  const renderDayCards = () => {
    if (isLoading) {
      return Array.from({ length: 7 }).map((_, index) => (
        <Card key={`skeleton-${index}`} className="border-primary/20">
          <div className="md:flex">
            <CardHeader className="bg-primary/5 md:w-1/3">
              <Skeleton className="h-6 w-24 mx-auto" />
            </CardHeader>
            <CardContent className="p-4 md:w-2/3">
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </div>
        </Card>
      ));
    }
    
    if (error) {
      return (
        <div className="col-span-full text-center py-8">
          <p className="text-red-500">Error loading days. Please try again later.</p>
        </div>
      );
    }
    
    if (!days || days.length === 0) {
      return (
        <div className="col-span-full text-center py-8">
          <p>No days content found. Please check back later.</p>
        </div>
      );
    }
    
    return days.map((day: ContentItem) => (
      <Card key={day.id} className="border-primary/20 hover:border-primary hover:shadow-md transition-all" onClick={handlePageInteraction}>
        <div className="md:flex">
          <CardHeader className="bg-primary/5 md:w-1/3 flex flex-col justify-center">
            <CardTitle className="text-center">{day.english_translation}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:w-2/3 flex flex-col justify-center">
            <p className="text-xl font-medium mb-2 text-black">{day.phom_word}</p>
            {day.example_sentence && <p className="text-sm text-muted-foreground">{day.example_sentence}</p>}
            {day.audio_url && (
              <div className="mt-3">
                <Button 
                  size="sm" 
                  variant={isCached(day.audio_url) ? "outline" : "secondary"}
                  className="flex items-center gap-1"
                  onClick={() => handlePlayAudio(day.audio_url, day.id, day)}
                  disabled={playingAudio !== null && playingAudio !== day.id}
                >
                  {playingAudio === day.id ? (
                    <>
                      <Volume2 className="h-4 w-4 animate-pulse" />
                      Playing...
                    </>
                  ) : !isCached(day.audio_url) || !audioInitialized ? (
                    <>
                      <VolumeX className="h-4 w-4" />
                      {audioInitialized ? "Loading..." : "Click to Enable Audio"}
                    </>
                  ) : (
                    <>
                      <Headphones className="h-4 w-4" />
                      Listen
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    ));
  };
  
  return (
    <LearnLayout>
      <div className="container px-4 md:px-6 py-8 md:py-12" onClick={handlePageInteraction}>
        <h1 className="text-3xl font-bold mb-6">Days of the Week in Phom</h1>
        <p className="text-lg mb-8">Learn the names of the days of the week in Phom language.</p>
        
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
        
        <div className="space-y-4">
          {renderDayCards()}
        </div>
      </div>
    </LearnLayout>
  );
};

export default DaysPage;
