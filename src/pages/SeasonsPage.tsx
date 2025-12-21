import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Headphones, Volume2, VolumeX, ArrowLeft, Leaf, Sun, CloudRain, Snowflake } from 'lucide-react';
import { ContentService } from '@/services/ContentService';
import { ContentItem } from '@/types/content';
import { Skeleton } from '@/components/ui/skeleton';
import { useAudioPreloader } from '@/hooks/use-audio-preloader';
import { toast } from '@/hooks/use-toast';
import ModuleTitleWithAudio from '@/components/learning/ModuleTitleWithAudio';

const seasonConfig: Record<string, { icon: React.ElementType; gradient: string; iconColor: string }> = {
  spring: {
    icon: Leaf,
    gradient: 'from-green-100/50 to-pink-100/30 dark:from-green-900/50 dark:to-pink-900/30',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  summer: {
    icon: Sun,
    gradient: 'from-yellow-100/50 to-orange-100/30 dark:from-yellow-900/50 dark:to-orange-900/30',
    iconColor: 'text-yellow-600 dark:text-yellow-400'
  },
  autumn: {
    icon: CloudRain,
    gradient: 'from-orange-100/50 to-amber-100/30 dark:from-orange-900/50 dark:to-amber-900/30',
    iconColor: 'text-orange-600 dark:text-orange-400'
  },
  winter: {
    icon: Snowflake,
    gradient: 'from-blue-100/50 to-slate-100/30 dark:from-blue-900/50 dark:to-slate-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400'
  }
};

const SeasonsPage = () => {
  const navigate = useNavigate();
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioInitialized, setAudioInitialized] = useState(false);

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

  const {
    data: seasons,
    isLoading,
    error
  } = useQuery({
    queryKey: ['seasons'],
    queryFn: () => ContentService.getContentItemsByCategoryName('Seasons')
  });

  // Get category for title display
  const { data: categoryData } = useQuery({
    queryKey: ['seasons-category'],
    queryFn: async () => {
      const categories = await ContentService.getCategories();
      return categories.find(cat => cat.name === 'Seasons');
    }
  });

  const handlePageInteraction = () => {
    if (!audioInitialized) {
      initializeAudioContext();
      setAudioInitialized(true);
    }
  };

  useEffect(() => {
    const initAudio = () => {
      if (!audioInitialized) {
        initializeAudioContext();
        setAudioInitialized(true);
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

  useEffect(() => {
    if (seasons && seasons.length > 0 && audioInitialized) {
      const audioUrls = seasons.filter(item => item.audio_url).map(item => item.audio_url as string);
      if (audioUrls.length > 0) {
        preloadAudioBatch(audioUrls);
      }
    }
  }, [seasons, preloadAudioBatch, audioInitialized]);

  const handlePlayAudio = async (url: string | null, itemId: string) => {
    if (!url) return;
    try {
      if (!audioInitialized) {
        initializeAudioContext();
        setAudioInitialized(true);
      }
      setPlayingAudio(itemId);
      await playAudio(url);
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

  const getSeasonConfig = (seasonName: string) => {
    const lowerName = seasonName.toLowerCase();
    return seasonConfig[lowerName] || seasonConfig.spring;
  };

  const renderSeasonCards = () => {
    if (isLoading) {
      return Array.from({ length: 4 }).map((_, index) => (
        <Card key={`skeleton-${index}`} className="border-primary/20">
          <CardHeader className="bg-primary/5 pb-2">
            <Skeleton className="h-8 w-8 rounded-full mx-auto mb-2" />
            <Skeleton className="h-6 w-24 mx-auto" />
          </CardHeader>
          <CardContent className="pt-4">
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </CardContent>
        </Card>
      ));
    }

    if (error) {
      return (
        <div className="col-span-full text-center py-8">
          <p className="text-red-500">Error loading seasons. Please try again later.</p>
        </div>
      );
    }

    if (!seasons || seasons.length === 0) {
      return (
        <div className="col-span-full text-center py-8">
          <p>No seasons content found. Please check back later.</p>
        </div>
      );
    }

    const seasonOrder = ['spring', 'summer', 'autumn', 'winter'];
    const sortedSeasons = [...seasons].sort((a, b) => {
      const indexA = seasonOrder.indexOf(a.english_translation.toLowerCase());
      const indexB = seasonOrder.indexOf(b.english_translation.toLowerCase());
      return indexA - indexB;
    });

    return sortedSeasons.map((season: ContentItem) => {
      const config = getSeasonConfig(season.english_translation);
      const IconComponent = config.icon;

      return (
        <Card 
          key={season.id} 
          className="border-primary/20 hover:border-primary hover:shadow-lg transition-all overflow-hidden group"
          onClick={handlePageInteraction}
        >
          <CardHeader className={`bg-gradient-to-br ${config.gradient} pb-4`}>
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-background/50 flex items-center justify-center transform transition-transform group-hover:scale-110">
                <IconComponent className={`h-6 w-6 ${config.iconColor}`} />
              </div>
            </div>
            <CardTitle className="text-center text-xl">{season.english_translation}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 pb-4">
            <p className="text-2xl font-bold text-center mb-3 text-primary">
              {season.phom_word}
            </p>
            <p className="text-sm text-center text-muted-foreground mb-4">
              {season.example_sentence}
            </p>
            {season.audio_url && (
              <div className="flex justify-center">
                <Button
                  size="sm"
                  variant={isCached(season.audio_url) ? "outline" : "secondary"}
                  className="flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayAudio(season.audio_url, season.id);
                  }}
                  disabled={playingAudio !== null && playingAudio !== season.id}
                >
                  {playingAudio === season.id ? (
                    <>
                      <Volume2 className="h-4 w-4 animate-pulse" />
                      Playing...
                    </>
                  ) : !isCached(season.audio_url) || !audioInitialized ? (
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
        </Card>
      );
    });
  };

  return (
    <div className="container px-4 md:px-6 py-8 md:py-12" onClick={handlePageInteraction}>
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
        englishTitle="Seasons in Phom"
        category={categoryData}
        subtitle="Learn the names of the four seasons in Phom dialect"
        onAudioPlay={handlePageInteraction}
      />

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
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {renderSeasonCards()}
      </div>
    </div>
  );
};

export default SeasonsPage;
