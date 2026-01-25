import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Headphones, Volume2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ContentService } from '@/services/ContentService';
import { ContentItem, Category } from '@/types/content';
import { useAudioPreloader } from '@/hooks/use-audio-preloader';
import { useQuery } from '@tanstack/react-query';
import ModuleTitleWithAudio from '@/components/learning/ModuleTitleWithAudio';

const GreetingsPage = () => {
  const navigate = useNavigate();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const { preloadAudioBatch, playAudio, isLoading: audioLoading } = useAudioPreloader();

  // Fetch category data for the header
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => ContentService.getCategories(),
  });

  const greetingsCategory = categories?.find(cat => cat.name === 'Greetings');

  // Fetch greetings content
  const { data: greetings, isLoading } = useQuery({
    queryKey: ['greetings'],
    queryFn: () => ContentService.getContentItemsByCategoryName('Greetings'),
  });

  // Preload audio when greetings are loaded
  useEffect(() => {
    if (greetings) {
      const audioUrls = greetings
        .filter(item => item.audio_url)
        .map(item => item.audio_url as string);
      preloadAudioBatch(audioUrls);
    }
  }, [greetings, preloadAudioBatch]);

  const handlePlayAudio = async (greeting: ContentItem) => {
    if (!greeting.audio_url) return;
    
    setPlayingId(greeting.id);
    await playAudio(greeting.audio_url);
    setPlayingId(null);
  };

  return (
    <div className="container px-4 md:px-6 py-8">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>

      {/* Module Title Header */}
      <ModuleTitleWithAudio
        englishTitle="Greetings"
        category={greetingsCategory}
        subtitle="Learn greetings in Phom dialect"
        playAudioFromHook={playAudio}
      />

      {/* Greetings Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2 mb-3" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))
        ) : greetings && greetings.length > 0 ? (
          greetings.map((greeting) => (
            <Card 
              key={greeting.id} 
              className="overflow-hidden hover:shadow-lg transition-all group"
            >
              <CardHeader className="pb-2 bg-gradient-to-r from-rose-100/30 to-rose-50/10 dark:from-rose-900/30 dark:to-rose-800/10">
                <CardTitle className="text-lg text-center">
                  {greeting.phom_word}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground text-center mb-3">
                  {greeting.english_translation}
                </p>
                {greeting.example_sentence && (
                  <p className="text-xs text-muted-foreground/70 text-center mb-3 italic">
                    "{greeting.example_sentence}"
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group-hover:bg-rose-100/20 dark:group-hover:bg-rose-900/20"
                  onClick={() => handlePlayAudio(greeting)}
                  disabled={!greeting.audio_url || playingId === greeting.id}
                >
                  {playingId === greeting.id ? (
                    <>
                      <Volume2 className="mr-2 h-4 w-4 animate-pulse" />
                      Playing...
                    </>
                  ) : (
                    <>
                      <Headphones className="mr-2 h-4 w-4" />
                      Listen
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              No greetings available yet. Content will be added soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GreetingsPage;
