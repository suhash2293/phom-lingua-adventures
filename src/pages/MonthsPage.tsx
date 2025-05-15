
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

const MonthsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Fetch months data
  const { data: months, isLoading, error } = useQuery({
    queryKey: ['months'],
    queryFn: () => ContentService.getContentItemsByCategoryName('Months'),
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

  // Function to determine season based on month name
  const getSeason = (monthName: string): string => {
    const lowerName = monthName.toLowerCase();
    
    if (['december', 'january', 'february'].includes(lowerName)) return 'Winter';
    if (['march', 'april', 'may'].includes(lowerName)) return 'Spring';
    if (['june', 'july', 'august'].includes(lowerName)) return 'Summer';
    if (['september', 'october', 'november'].includes(lowerName)) return 'Fall';
    
    return '';
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

  const renderMonthCards = () => {
    if (isLoading) {
      return Array.from({ length: 12 }).map((_, index) => (
        <Card key={`skeleton-${index}`} className="border-primary/20">
          <CardHeader className="bg-primary/5 pb-2">
            <Skeleton className="h-6 w-24 mx-auto" />
          </CardHeader>
          <CardContent className="pt-4">
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </CardContent>
        </Card>
      ));
    }

    if (error) {
      return (
        <div className="col-span-full text-center py-8">
          <p className="text-red-500">Error loading months. Please try again later.</p>
        </div>
      );
    }

    if (!months || months.length === 0) {
      return (
        <div className="col-span-full text-center py-8">
          <p>No months content found. Please check back later.</p>
        </div>
      );
    }

    // Sort months in correct calendar order
    const monthOrder = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    
    const sortedMonths = [...months].sort((a, b) => {
      const indexA = monthOrder.indexOf(a.english_translation.toLowerCase());
      const indexB = monthOrder.indexOf(b.english_translation.toLowerCase());
      return indexA - indexB;
    });

    return sortedMonths.map((month: ContentItem) => (
      <Card key={month.id} className="border-primary/20 hover:border-primary hover:shadow-md transition-all">
        <CardHeader className="bg-primary/5 pb-2">
          <CardTitle className="text-center">{month.english_translation}</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-xl font-medium text-center mb-2 text-primary-foreground">{month.phom_word}</p>
          <p className="text-sm text-center text-muted-foreground">
            Season: {month.example_sentence || getSeason(month.english_translation)}
          </p>
          {month.audio_url && (
            <div className="mt-3 flex justify-center">
              <Button 
                size="sm" 
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => playAudio(month.audio_url, month.id)}
              >
                <Headphones className="h-4 w-4" />
                {playingAudio === month.id ? 'Playing...' : 'Listen'}
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
        <h1 className="text-3xl font-bold mb-6">Months in Phom</h1>
        <p className="text-lg mb-8">Learn the months of the year in Phom language.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {renderMonthCards()}
        </div>
      </div>
    </LearnLayout>
  );
};

export default MonthsPage;
