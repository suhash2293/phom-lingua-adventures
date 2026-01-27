import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Headphones, Volume2, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ContentService } from '@/services/ContentService';
import { ContentItem, Category } from '@/types/content';
import { useAudioPreloader } from '@/hooks/use-audio-preloader';
import { useQuery } from '@tanstack/react-query';
import ModuleTitleWithAudio from '@/components/learning/ModuleTitleWithAudio';

const BibleVocabPage = () => {
  const navigate = useNavigate();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const { preloadAudioBatch, playAudio } = useAudioPreloader();

  // Fetch category data for the header
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => ContentService.getCategories(),
  });

  const bibleVocabCategory = categories?.find(cat => cat.name === 'Bible Vocabularies');

  // Fetch vocabulary content
  const { data: vocabularies, isLoading } = useQuery({
    queryKey: ['bible-vocabularies'],
    queryFn: () => ContentService.getContentItemsByCategoryName('Bible Vocabularies'),
  });

  // Preload audio when vocabularies are loaded
  useEffect(() => {
    if (vocabularies) {
      const audioUrls = vocabularies
        .filter(item => item.audio_url)
        .map(item => item.audio_url as string);
      
      // Also preload category audio
      if (bibleVocabCategory?.title_audio_url) {
        audioUrls.push(bibleVocabCategory.title_audio_url);
      }
      if (bibleVocabCategory?.singular_audio_url) {
        audioUrls.push(bibleVocabCategory.singular_audio_url);
      }
      
      preloadAudioBatch(audioUrls);
    }
  }, [vocabularies, bibleVocabCategory, preloadAudioBatch]);

  const handlePlayAudio = async (vocab: ContentItem) => {
    if (!vocab.audio_url) return;
    
    setPlayingId(vocab.id);
    await playAudio(vocab.audio_url);
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
        englishTitle="Bible Vocabularies"
        category={bibleVocabCategory}
        subtitle="Learn foundational Bible vocabularies in Phom dialect"
        playAudioFromHook={playAudio}
      />

      {/* Vocabularies Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-8">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 12 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mx-auto" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2 mx-auto mb-3" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))
        ) : vocabularies && vocabularies.length > 0 ? (
          vocabularies.map((vocab) => (
            <Card 
              key={vocab.id} 
              className="overflow-hidden hover:shadow-lg transition-all group"
            >
              <CardHeader className="pb-2 bg-gradient-to-r from-emerald-100/30 to-emerald-50/10 dark:from-emerald-900/20 dark:to-emerald-800/10">
                <CardTitle className="text-sm md:text-base text-center font-medium">
                  {vocab.english_translation}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 pb-4">
                <p className="text-base md:text-lg font-semibold text-center mb-3 text-primary break-words min-h-[2.5rem] flex items-center justify-center">
                  {vocab.phom_word}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group-hover:bg-emerald-100/20 dark:group-hover:bg-emerald-900/20 transition-colors"
                  onClick={() => handlePlayAudio(vocab)}
                  disabled={!vocab.audio_url || playingId === vocab.id}
                >
                  {playingId === vocab.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Playing...
                    </>
                  ) : (
                    <>
                      <Headphones className="mr-2 h-4 w-4" />
                      {vocab.audio_url ? 'Listen' : 'No Audio'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              No vocabularies available yet. Content will be added soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BibleVocabPage;
