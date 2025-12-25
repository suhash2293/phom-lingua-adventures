import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Volume2, Loader2 } from 'lucide-react';
import { Category } from '@/types/content';

interface ModuleTitleWithAudioProps {
  englishTitle: string;
  category?: Category | null;
  subtitle?: string;
  onAudioPlay?: () => void;
}

const ModuleTitleWithAudio: React.FC<ModuleTitleWithAudioProps> = ({
  englishTitle,
  category,
  subtitle,
  onAudioPlay
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = async () => {
    if (!category?.title_audio_url) return;

    try {
      setIsPlaying(true);
      onAudioPlay?.();
      
      const audio = new Audio(category.title_audio_url);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      await audio.play();
    } catch (error) {
      console.error('Error playing title audio:', error);
      setIsPlaying(false);
    }
  };

  return (
    <Card className="mb-8 border-primary/20 hover:border-primary hover:shadow-md transition-all">
      <CardHeader className="bg-primary/5 pb-4 text-center">
        <CardTitle className="text-3xl font-bold">{englishTitle}</CardTitle>
        {category?.phom_name && (
          <p className="text-2xl text-primary font-semibold mt-2">
            {category.phom_name}
          </p>
        )}
        {category?.title_audio_url && (
          <div className="flex justify-center mt-3">
            <Button
              variant="default"
              size="sm"
              onClick={handlePlayAudio}
              disabled={isPlaying}
              className="flex items-center gap-2 shadow-md"
            >
              {isPlaying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
              Listen
            </Button>
          </div>
        )}
      </CardHeader>
      {subtitle && (
        <CardContent className="pt-4 text-center">
          <p className="text-muted-foreground">{subtitle}</p>
        </CardContent>
      )}
    </Card>
  );
};

export default ModuleTitleWithAudio;
