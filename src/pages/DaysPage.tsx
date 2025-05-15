
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

const DaysPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Fetch days data
  const { data: days, isLoading, error } = useQuery({
    queryKey: ['days'],
    queryFn: () => ContentService.getContentItemsByCategoryName('Days'),
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
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={() => playAudio(day.audio_url, day.id)}
                >
                  <Headphones className="h-4 w-4" />
                  {playingAudio === day.id ? 'Playing...' : 'Listen'}
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
        
        <div className="space-y-4">
          {renderDayCards()}
        </div>
      </div>
    </LearnLayout>
  );
};

export default DaysPage;
