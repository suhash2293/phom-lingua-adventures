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

const PronounsPage = () => {
  const navigate = useNavigate();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const { preloadAudioBatch, playAudio, isLoading: audioLoading } = useAudioPreloader();

  // Fetch category data for the header
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => ContentService.getCategories(),
  });

  const pronounsCategory = categories?.find(cat => cat.name === 'Pronouns');

  // Fetch pronouns content
  const { data: pronouns, isLoading } = useQuery({
    queryKey: ['pronouns'],
    queryFn: () => ContentService.getContentItemsByCategoryName('Pronouns'),
  });

  // Separate pronouns by type based on sort_order
  const personalPronouns = pronouns?.filter(p => p.sort_order && p.sort_order <= 12) || [];
  const reflexivePronouns = pronouns?.filter(p => p.sort_order && p.sort_order >= 13 && p.sort_order <= 20) || [];
  const possessivePronouns = pronouns?.filter(p => p.sort_order && p.sort_order >= 21 && p.sort_order <= 27) || [];
  const demonstrativePronouns = pronouns?.filter(p => p.sort_order && p.sort_order >= 28 && p.sort_order <= 31) || [];

  // Preload audio when pronouns are loaded
  useEffect(() => {
    if (pronouns) {
      const audioUrls = pronouns
        .filter(item => item.audio_url)
        .map(item => item.audio_url as string);
      preloadAudioBatch(audioUrls);
    }
  }, [pronouns, preloadAudioBatch]);

  const handlePlayAudio = async (pronoun: ContentItem) => {
    if (!pronoun.audio_url) return;
    
    setPlayingId(pronoun.id);
    await playAudio(pronoun.audio_url);
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
        englishTitle="Pronouns"
        category={pronounsCategory}
        subtitle="Learn the Pronouns in Phom dialect"
        playAudioFromHook={playAudio}
      />

      {/* Personal Pronouns Section */}
      <div className="mt-8">
        <Card className="mb-6 bg-gradient-to-r from-purple-100/50 to-purple-50/20 dark:from-purple-900/40 dark:to-purple-800/20 border-purple-200/50 dark:border-purple-700/30">
          <CardContent className="flex items-center justify-center py-4">
            <h2 className="text-xl font-semibold text-foreground">Personal Pronouns</h2>
          </CardContent>
        </Card>

        {/* Pronouns Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
        ) : personalPronouns.length > 0 ? (
          personalPronouns.map((pronoun) => (
            <Card 
              key={pronoun.id} 
              className="overflow-hidden hover:shadow-lg transition-all group"
            >
              <CardHeader className="pb-2 bg-gradient-to-r from-purple-100/30 to-purple-50/10 dark:from-purple-900/30 dark:to-purple-800/10">
                <CardTitle className="text-lg text-center">
                  {pronoun.english_translation}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-xl font-medium text-center mb-3 text-primary">
                  {pronoun.phom_word}
                </p>
                {pronoun.example_sentence && (
                  <p className="text-xs text-muted-foreground/70 text-center mb-3 italic">
                    "{pronoun.example_sentence}"
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group-hover:bg-purple-100/20 dark:group-hover:bg-purple-900/20"
                  onClick={() => handlePlayAudio(pronoun)}
                  disabled={!pronoun.audio_url || playingId === pronoun.id}
                >
                  {playingId === pronoun.id ? (
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
              No personal pronouns available yet.
            </p>
          </div>
        )}
        </div>
      </div>

      {/* Reflexive Pronouns Section */}
      <div className="mt-8">
        <Card className="mb-6 bg-gradient-to-r from-purple-100/50 to-purple-50/20 dark:from-purple-900/40 dark:to-purple-800/20 border-purple-200/50 dark:border-purple-700/30">
          <CardContent className="flex items-center justify-center py-4">
            <h2 className="text-xl font-semibold text-foreground">Reflexive Pronouns</h2>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading ? (
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
        ) : reflexivePronouns.length > 0 ? (
          reflexivePronouns.map((pronoun) => (
            <Card 
              key={pronoun.id} 
              className="overflow-hidden hover:shadow-lg transition-all group"
            >
              <CardHeader className="pb-2 bg-gradient-to-r from-purple-100/30 to-purple-50/10 dark:from-purple-900/30 dark:to-purple-800/10">
                <CardTitle className="text-lg text-center">
                  {pronoun.english_translation}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-xl font-medium text-center mb-3 text-primary">
                  {pronoun.phom_word}
                </p>
                {pronoun.example_sentence && (
                  <p className="text-xs text-muted-foreground/70 text-center mb-3 italic">
                    "{pronoun.example_sentence}"
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group-hover:bg-purple-100/20 dark:group-hover:bg-purple-900/20"
                  onClick={() => handlePlayAudio(pronoun)}
                  disabled={!pronoun.audio_url || playingId === pronoun.id}
                >
                  {playingId === pronoun.id ? (
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
              No reflexive pronouns available yet.
            </p>
          </div>
        )}
        </div>
      </div>

      {/* Possessive Pronouns Section */}
      <div className="mt-8">
        <Card className="mb-6 bg-gradient-to-r from-purple-100/50 to-purple-50/20 dark:from-purple-900/40 dark:to-purple-800/20 border-purple-200/50 dark:border-purple-700/30">
          <CardContent className="flex items-center justify-center py-4">
            <h2 className="text-xl font-semibold text-foreground">Possessive Pronouns</h2>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 7 }).map((_, index) => (
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
        ) : possessivePronouns.length > 0 ? (
          possessivePronouns.map((pronoun) => (
            <Card 
              key={pronoun.id} 
              className="overflow-hidden hover:shadow-lg transition-all group"
            >
              <CardHeader className="pb-2 bg-gradient-to-r from-purple-100/30 to-purple-50/10 dark:from-purple-900/30 dark:to-purple-800/10">
                <CardTitle className="text-lg text-center">
                  {pronoun.english_translation}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-xl font-medium text-center mb-3 text-primary">
                  {pronoun.phom_word}
                </p>
                {pronoun.example_sentence && (
                  <p className="text-xs text-muted-foreground/70 text-center mb-3 italic">
                    "{pronoun.example_sentence}"
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group-hover:bg-purple-100/20 dark:group-hover:bg-purple-900/20"
                  onClick={() => handlePlayAudio(pronoun)}
                  disabled={!pronoun.audio_url || playingId === pronoun.id}
                >
                  {playingId === pronoun.id ? (
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
              No possessive pronouns available yet.
            </p>
          </div>
        )}
        </div>
      </div>

      {/* Demonstrative Pronouns Section */}
      <div className="mt-8">
        <Card className="mb-6 bg-gradient-to-r from-purple-100/50 to-purple-50/20 dark:from-purple-900/40 dark:to-purple-800/20 border-purple-200/50 dark:border-purple-700/30">
          <CardContent className="flex items-center justify-center py-4">
            <h2 className="text-xl font-semibold text-foreground">Demonstrative Pronouns</h2>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
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
        ) : demonstrativePronouns.length > 0 ? (
          demonstrativePronouns.map((pronoun) => (
            <Card 
              key={pronoun.id} 
              className="overflow-hidden hover:shadow-lg transition-all group"
            >
              <CardHeader className="pb-2 bg-gradient-to-r from-purple-100/30 to-purple-50/10 dark:from-purple-900/30 dark:to-purple-800/10">
                <CardTitle className="text-lg text-center">
                  {pronoun.english_translation}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-xl font-medium text-center mb-3 text-primary">
                  {pronoun.phom_word}
                </p>
                {pronoun.example_sentence && (
                  <p className="text-xs text-muted-foreground/70 text-center mb-3 italic">
                    "{pronoun.example_sentence}"
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group-hover:bg-purple-100/20 dark:group-hover:bg-purple-900/20"
                  onClick={() => handlePlayAudio(pronoun)}
                  disabled={!pronoun.audio_url || playingId === pronoun.id}
                >
                  {playingId === pronoun.id ? (
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
              No demonstrative pronouns available yet.
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default PronounsPage;
