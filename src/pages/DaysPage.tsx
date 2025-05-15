import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import LearnLayout from '@/components/layout/LearnLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Headphones, Volume2, VolumeX } from 'lucide-react';
import { ContentService } from '@/services/ContentService';
import { ContentItem } from '@/types/content';
import { Skeleton } from '@/components/ui/skeleton';
import { useAudioPreloader } from '@/hooks/use-audio-preloader';
import { toast } from '@/components/ui/use-toast';

const DaysPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  // Use our enhanced audio preloader hook
  const { 
    playAudio, 
    preloadAudioBatch, 
    isLoading: isAudioLoading, 
    progress: audioLoadingProgress,
    isCached
  } = useAudioPreloader({
    onLoadError: () => {
      toast({
        title: "Audio Loading Error",
        description: "Some audio files couldn't be loaded. You may experience playback issues.",
        variant: "destructive"
      });
    }
  });

  // Fetch days data
  const { data: days, isLoading, error } = useQuery({
    queryKey: ['days'],
    queryFn: () => ContentService.getContentItemsByCategoryName('Days'),
  });

  // Preload audio files when days data is available
  useEffect(() => {
    if (days && days.length > 0) {
      // Extract valid audio URLs
      const audioUrls = days
        .filter(item => item.audio_url)
        .map(item => item.audio_url as string);
      
      if (audioUrls.length > 0) {
        // Preload all audio files
        preloadAudioBatch(audioUrls);
      }
    }
  }, [days, preloadAudioBatch]);

  // Enhanced play audio function
  const handlePlayAudio = async (url: string | null, itemId: string) => {
    if (!url) return;
    
    try {
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
      <Card key={day.id} className="border-primary/20 hover:border-primary hover:shadow-md transition-all">
        <div className="md:flex">
          <CardHeader className="bg-primary/5 md:w-1/3 flex flex-col justify-center">
            <CardTitle className="text-center">{day.english_translation}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:w-2/3 flex flex-col justify-center">
            <p className="text-xl font-medium mb-2 text-primary-foreground">{day.phom_word}</p>
            {day.example_sentence && (
              <p className="text-sm text-muted-foreground">{day.example_sentence}</p>
            )}
            {day.audio_url && (
              <div className="mt-3">
                <Button 
                  size="sm" 
                  variant={isCached(day.audio_url) ? "outline" : "secondary"}
                  className="flex items-center gap-1"
                  onClick={() => handlePlayAudio(day.audio_url, day.id)}
                  disabled={playingAudio !== null && playingAudio !== day.id}
                >
                  {playingAudio === day.id ? (
                    <>
                      <Volume2 className="h-4 w-4 animate-pulse" />
                      Playing...
                    </>
                  ) : !isCached(day.audio_url) ? (
                    <>
                      <VolumeX className="h-4 w-4" />
                      Loading...
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
      <div className="container px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-3xl font-bold mb-6">Days of the Week in Phom</h1>
        <p className="text-lg mb-8">Learn the days of the week in Phom language.</p>
        
        {isAudioLoading && audioLoadingProgress < 100 && (
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
