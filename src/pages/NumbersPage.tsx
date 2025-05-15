
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import LearnLayout from '@/components/layout/LearnLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Headphones } from 'lucide-react';
import { ContentService } from '@/services/ContentService';
import { ContentItem } from '@/types/content';
import { Skeleton } from '@/components/ui/skeleton';

const NumbersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Fetch numbers data
  const { data: numbers, isLoading, error } = useQuery({
    queryKey: ['numbers'],
    queryFn: () => ContentService.getContentItemsByCategoryName('Numbers'),
  });

  // Group numbers by tens for tabs
  const groupNumbersByTens = (items: ContentItem[] = []) => {
    const groups: Record<string, ContentItem[]> = {};
    
    items.forEach(item => {
      const num = parseInt(item.english_translation, 10);
      if (isNaN(num)) return;
      
      const groupStart = Math.floor(num / 10) * 10 + 1;
      const groupEnd = (Math.floor(num / 10) + 1) * 10;
      const label = `${groupStart}-${groupEnd}`;
      
      if (!groups[label]) {
        groups[label] = [];
      }
      
      groups[label].push(item);
    });
    
    // Sort each group by the number value
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => {
        const numA = parseInt(a.english_translation, 10);
        const numB = parseInt(b.english_translation, 10);
        return numA - numB;
      });
    });
    
    return groups;
  };
  
  const numberGroups = groupNumbersByTens(numbers);
  const groupKeys = Object.keys(numberGroups).sort((a, b) => {
    const [startA] = a.split('-').map(Number);
    const [startB] = b.split('-').map(Number);
    return startA - startB;
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

  if (isLoading) {
    return (
      <LearnLayout>
        <div className="container px-4 md:px-6 py-8 md:py-12">
          <h1 className="text-3xl font-bold mb-6">Numbers in Phom (1-100)</h1>
          <p className="text-lg mb-8">Learn to count from 1 to 100 in Phom language.</p>
          <Skeleton className="h-10 w-full mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </LearnLayout>
    );
  }

  if (error) {
    return (
      <LearnLayout>
        <div className="container px-4 md:px-6 py-8 md:py-12">
          <h1 className="text-3xl font-bold mb-6">Numbers in Phom (1-100)</h1>
          <p className="text-red-500">Error loading numbers. Please try again later.</p>
        </div>
      </LearnLayout>
    );
  }

  if (!numbers || numbers.length === 0) {
    return (
      <LearnLayout>
        <div className="container px-4 md:px-6 py-8 md:py-12">
          <h1 className="text-3xl font-bold mb-6">Numbers in Phom (1-100)</h1>
          <p>No number content found. Please check back later.</p>
        </div>
      </LearnLayout>
    );
  }

  return (
    <LearnLayout>
      <div className="container px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-3xl font-bold mb-6">Numbers in Phom (1-100)</h1>
        <p className="text-lg mb-8">Learn to count from 1 to 100 in Phom language.</p>
        
        <Tabs defaultValue={groupKeys[0] || "1-10"} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
            {groupKeys.map((group) => (
              <TabsTrigger 
                key={group} 
                value={group}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {group}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {groupKeys.map((group) => (
            <TabsContent key={group} value={group} className="mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {numberGroups[group].map((item) => (
                  <Card key={item.id} className="border-primary/20 hover:border-primary hover:shadow-md transition-all">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold">{item.english_translation}</span>
                      <span className="text-lg text-primary-foreground">{item.phom_word}</span>
                      {item.audio_url && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="mt-2 flex items-center gap-1"
                          onClick={() => playAudio(item.audio_url, item.id)}
                        >
                          <Headphones className="h-4 w-4" />
                          {playingAudio === item.id ? 'Playing...' : 'Listen'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </LearnLayout>
  );
};

export default NumbersPage;
