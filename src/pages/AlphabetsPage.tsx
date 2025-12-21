import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Headphones, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { ContentService } from '@/services/ContentService';
import { HybridProgressService } from '@/services/HybridProgressService';
import { ContentItem } from '@/types/content';
import { Skeleton } from '@/components/ui/skeleton';
import { useAudioPreloader } from '@/hooks/use-audio-preloader';
import { toast } from '@/hooks/use-toast';
import ModuleTitleWithAudio from '@/components/learning/ModuleTitleWithAudio';

const AlphabetsPage = () => {
  const {
    user
  } = useAuth();
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

  // Fetch alphabets data
  const {
    data: alphabets,
    isLoading,
    error
  } = useQuery({
    queryKey: ['alphabets'],
    queryFn: () => ContentService.getContentItemsByCategoryName('Alphabets')
  });

  // Get category ID for progress tracking
  const {
    data: categoryData
  } = useQuery({
    queryKey: ['alphabet-category'],
    queryFn: async () => {
      const categories = await ContentService.getCategories();
      return categories.find(cat => cat.name === 'Alphabets');
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

  // Preload audio files when alphabets data is available
  useEffect(() => {
    if (alphabets && alphabets.length > 0 && audioInitialized) {
      // Extract valid audio URLs
      const audioUrls = alphabets.filter(item => item.audio_url).map(item => item.audio_url as string);
      if (audioUrls.length > 0) {
        preloadAudioBatch(audioUrls);
      }
    }
  }, [alphabets, preloadAudioBatch, audioInitialized]);

  // Track when user views content
  useEffect(() => {
    if (alphabets && alphabets.length > 0 && categoryData) {
      // Track that user has viewed this category
      HybridProgressService.trackProgress(categoryData.id, null, 'viewed');
    }
  }, [alphabets, categoryData]);

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
        await HybridProgressService.trackProgress(categoryData.id, item.id, 'audio_played');
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

  // Learning is fully public - no authentication required

  const renderAlphabetCards = () => {
    if (isLoading) {
      return Array.from({
        length: 9
      }).map((_, index) => <Card key={`skeleton-${index}`} className="border-primary/20">
          <CardHeader className="bg-primary/5 pb-2">
            <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          </CardHeader>
          <CardContent className="pt-4">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>);
    }
    if (error) {
      return <div className="col-span-full text-center py-8">
          <p className="text-red-500">Error loading alphabets. Please try again later.</p>
        </div>;
    }
    if (!alphabets || alphabets.length === 0) {
      return <div className="col-span-full text-center py-8">
          <p>No alphabet content found. Please check back later.</p>
        </div>;
    }
    return alphabets.map((item: ContentItem) => <Card key={item.id} className="border-primary/20 hover:border-primary hover:shadow-md transition-all" onClick={handlePageInteraction}>
        <CardHeader className="bg-primary/5 pb-2">
          <div className="flex flex-col items-center">
            {/* Uppercase letter */}
            <CardTitle className="flex items-center justify-center text-4xl">
              {item.phom_word}
            </CardTitle>
            
            {/* Lowercase letter display */}
            <div className="mt-2 px-3 py-1 bg-primary/10 rounded-md border border-primary/20">
              <span className="text-2xl font-medium">
                {item.phom_word.toLowerCase()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-center mb-2 font-medium">English: <span className="font-normal">{item.english_translation}</span></p>
          {item.example_sentence && <p className="text-center text-sm text-muted-foreground">{item.example_sentence}</p>}
          {item.audio_url && <div className="mt-3 flex justify-center">
              <Button size="sm" variant={isCached(item.audio_url) ? "outline" : "secondary"} className="flex items-center gap-1" onClick={() => handlePlayAudio(item.audio_url, item.id, item)} disabled={playingAudio !== null && playingAudio !== item.id}>
                {playingAudio === item.id ? <>
                    <Volume2 className="h-4 w-4 animate-pulse" />
                    Playing...
                  </> : !isCached(item.audio_url) || !audioInitialized ? <>
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
  return <div className="container px-4 md:px-6 py-8 md:py-12" onClick={handlePageInteraction}>
      {/* Back button */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </div>

      <ModuleTitleWithAudio
        englishTitle="Phom Alphabets"
        category={categoryData}
        subtitle="Learn the Phom alphabet with pronunciation."
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
        {renderAlphabetCards()}
      </div>
    </div>;
};
export default AlphabetsPage;