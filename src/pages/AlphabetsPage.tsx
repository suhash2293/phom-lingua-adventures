
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
import { toast } from '@/hooks/use-toast';

const AlphabetsPage = () => {
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

  // Fetch alphabets data
  const { data: alphabets, isLoading, error } = useQuery({
    queryKey: ['alphabets'],
    queryFn: () => ContentService.getContentItemsByCategoryName('Alphabet'),
  });

  // Preload audio files when alphabets data is available
  useEffect(() => {
    if (alphabets && alphabets.length > 0) {
      // Extract valid audio URLs
      const audioUrls = alphabets
        .filter(item => item.audio_url)
        .map(item => item.audio_url as string);
      
      if (audioUrls.length > 0) {
        // Preload all audio files
        preloadAudioBatch(audioUrls);
      }
    }
  }, [alphabets, preloadAudioBatch]);

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

  const renderAlphabetCards = () => {
    if (isLoading) {
      return Array.from({ length: 9 }).map((_, index) => (
        <Card key={`skeleton-${index}`} className="border-primary/20">
          <CardHeader className="bg-primary/5 pb-2">
            <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          </CardHeader>
          <CardContent className="pt-4">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ));
    }

    if (error) {
      return (
        <div className="col-span-full text-center py-8">
          <p className="text-red-500">Error loading alphabets. Please try again later.</p>
        </div>
      );
    }

    if (!alphabets || alphabets.length === 0) {
      return (
        <div className="col-span-full text-center py-8">
          <p>No alphabet content found. Please check back later.</p>
        </div>
      );
    }

    return alphabets.map((item: ContentItem) => (
      <Card key={item.id} className="border-primary/20 hover:border-primary hover:shadow-md transition-all">
        <CardHeader className="bg-primary/5 pb-2">
          <CardTitle className="flex items-center justify-center text-4xl">{item.phom_word}</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-center mb-2 font-medium">English: <span className="font-normal">{item.english_translation}</span></p>
          {item.example_sentence && (
            <p className="text-center text-sm text-muted-foreground">{item.example_sentence}</p>
          )}
          {item.audio_url && (
            <div className="mt-3 flex justify-center">
              <Button 
                size="sm" 
                variant={isCached(item.audio_url) ? "outline" : "secondary"}
                className="flex items-center gap-1"
                onClick={() => handlePlayAudio(item.audio_url, item.id)}
                disabled={playingAudio !== null && playingAudio !== item.id}
              >
                {playingAudio === item.id ? (
                  <>
                    <Volume2 className="h-4 w-4 animate-pulse" />
                    Playing...
                  </>
                ) : !isCached(item.audio_url) ? (
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
      </Card>
    ));
  };

  return (
    <LearnLayout>
      <div className="container px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-3xl font-bold mb-6">Phom Alphabets</h1>
        <p className="text-lg mb-8">Learn the Phom alphabet with pronunciation and examples.</p>
        
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {renderAlphabetCards()}
        </div>
      </div>
    </LearnLayout>
  );
};

export default AlphabetsPage;
