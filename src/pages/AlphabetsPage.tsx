
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import LearnLayout from '@/components/layout/LearnLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Headphones } from 'lucide-react';
import { ContentService } from '@/services/ContentService';
import { ContentItem } from '@/types/content';
import { Skeleton } from '@/components/ui/skeleton';

const AlphabetsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Fetch alphabets data
  const { data: alphabets, isLoading, error } = useQuery({
    queryKey: ['alphabets'],
    queryFn: () => ContentService.getContentItemsByCategoryName('Alphabet'),
  });

  // Play audio function
  const playAudio = (url: string | null, itemId: string) => {
    if (!url) return;
    
    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    // Play new audio
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play();
    setPlayingAudio(itemId);
    
    // Reset state when audio ends
    audio.onended = () => {
      setPlayingAudio(null);
      audioRef.current = null;
    };
  };

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

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
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => playAudio(item.audio_url, item.id)}
              >
                <Headphones className="h-4 w-4" />
                {playingAudio === item.id ? 'Playing...' : 'Listen'}
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {renderAlphabetCards()}
        </div>
      </div>
    </LearnLayout>
  );
};

export default AlphabetsPage;
