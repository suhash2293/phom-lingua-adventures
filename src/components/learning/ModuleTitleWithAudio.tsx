import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
    <div className="mb-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-6 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{englishTitle}</h1>
          {category?.title_audio_url && (
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
          )}
        </div>
        {category?.phom_name && (
          <p className="text-2xl text-primary font-semibold mb-2">
            {category.phom_name}
          </p>
        )}
        {subtitle && (
          <p className="text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default ModuleTitleWithAudio;
