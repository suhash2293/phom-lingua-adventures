import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Headphones, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { ContentService } from '@/services/ContentService';
import { ContentItem } from '@/types/content';
import { Skeleton } from '@/components/ui/skeleton';
import { useAudioPreloader } from '@/hooks/use-audio-preloader';
import { toast } from '@/hooks/use-toast';
import ModuleTitleWithAudio from '@/components/learning/ModuleTitleWithAudio';

const MonthsPage = () => {
  const navigate = useNavigate();
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioInitialized, setAudioInitialized] = useState(false);
  
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
    maxConcurrent: 3,
    // Limit concurrent audio loads
    maxRetries: 3,
    // Increased retries
    onLoadError: () => {
      toast({
        title: "Audio Loading Notice",
        description: "Some audio files are being prepared. Click on any element to enable audio playback.",
        variant: "default"
      });
    }
  });

  // Fetch months data
  const {
    data: months,
    isLoading,
    error
  } = useQuery({
    queryKey: ['months'],
    queryFn: () => ContentService.getContentItemsByCategoryName('Months')
  });

  // Get category for title display
  const { data: categoryData } = useQuery({
    queryKey: ['months-category'],
    queryFn: async () => {
      const categories = await ContentService.getCategories();
      return categories.find(cat => cat.name === 'Months');
    }
  });
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
    document.addEventListener('click', initAudio, {
      once: true
    });
    document.addEventListener('touchstart', initAudio, {
      once: true
    });
    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
  }, [audioInitialized, initializeAudioContext]);

  // Preload audio files when months data is available and audio is initialized
  useEffect(() => {
    if (months && months.length > 0 && audioInitialized) {
      // Extract valid audio URLs
      const audioUrls = months.filter(item => item.audio_url).map(item => item.audio_url as string);
      if (audioUrls.length > 0) {
        // Preload all audio files
        preloadAudioBatch(audioUrls);
      }
    }
  }, [months, preloadAudioBatch, audioInitialized]);

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

  // Function to determine season based on month name
  const getSeason = (monthName: string): string => {
    const lowerName = monthName.toLowerCase();
    if (['december', 'january', 'february'].includes(lowerName)) return 'Winter';
    if (['march', 'april', 'may'].includes(lowerName)) return 'Spring';
    if (['june', 'july', 'august'].includes(lowerName)) return 'Summer';
    if (['september', 'october', 'november'].includes(lowerName)) return 'Fall';
    return '';
  };

  const renderMonthCards = () => {
    if (isLoading) {
      return Array.from({
        length: 12
      }).map((_, index) => <Card key={`skeleton-${index}`} className="border-primary/20">
          <CardHeader className="bg-primary/5 pb-2">
            <Skeleton className="h-6 w-24 mx-auto" />
          </CardHeader>
          <CardContent className="pt-4">
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </CardContent>
        </Card>);
    }
    if (error) {
      return <div className="col-span-full text-center py-8">
          <p className="text-red-500">Error loading months. Please try again later.</p>
        </div>;
    }
    if (!months || months.length === 0) {
      return <div className="col-span-full text-center py-8">
          <p>No months content found. Please check back later.</p>
        </div>;
    }

    // Sort months in correct calendar order
    const monthOrder = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const sortedMonths = [...months].sort((a, b) => {
      const indexA = monthOrder.indexOf(a.english_translation.toLowerCase());
      const indexB = monthOrder.indexOf(b.english_translation.toLowerCase());
      return indexA - indexB;
    });
    return sortedMonths.map((month: ContentItem) => <Card key={month.id} className="border-primary/20 hover:border-primary hover:shadow-md transition-all" onClick={handlePageInteraction}>
        <CardHeader className="bg-primary/5 pb-2">
          <CardTitle className="text-center">{month.english_translation}</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-xl font-medium text-center mb-2 text-primary-foreground">{month.phom_word}</p>
          <p className="text-sm text-center text-muted-foreground">
            Season: {month.example_sentence || getSeason(month.english_translation)}
          </p>
          {month.audio_url && <div className="mt-3 flex justify-center">
              <Button size="sm" variant={isCached(month.audio_url) ? "outline" : "secondary"} className="flex items-center gap-1" onClick={() => handlePlayAudio(month.audio_url, month.id)} disabled={playingAudio !== null && playingAudio !== month.id}>
                {playingAudio === month.id ? <>
                    <Volume2 className="h-4 w-4 animate-pulse" />
                    Playing...
                  </> : !isCached(month.audio_url) || !audioInitialized ? <>
                    <VolumeX className="h-4 w-4" />
                    {audioInitialized ? "Loading..." : "Click to Enable Audio"}
                  </> : <>
                    <Headphones className="h-4 w-4" />
                    Listen
                  </>}
              </Button>
            </div>}
        </CardContent>
      </Card>);
  };
  
  return (
    <div className="container px-4 md:px-6 py-8 md:py-12" onClick={handlePageInteraction}>
      {/* Back button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </div>

      <ModuleTitleWithAudio
        englishTitle="Months in Phom"
        category={categoryData}
        subtitle="Learn the names of the months in Phom dialect"
        onAudioPlay={handlePageInteraction}
      />
        
        {!audioInitialized && <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-center">👆 Click anywhere or interact with the page to enable audio playback</p>
          </div>}
        
        {isAudioLoading && audioInitialized && audioLoadingProgress < 100 && <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Loading audio files...</span>
              <span className="text-sm font-medium">{audioLoadingProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{
            width: `${audioLoadingProgress}%`
          }}></div>
            </div>
          </div>}
        
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {renderMonthCards()}
      </div>
    </div>
  );
};

export default MonthsPage;
