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
    <div className="mb-6">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-3xl font-bold">{englishTitle}</h1>
        {category?.title_audio_url && (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePlayAudio}
            disabled={isPlaying}
            className="flex items-center gap-2"
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
        <p className="text-xl text-primary mt-1 font-medium">
          {category.phom_name}
        </p>
      )}
      {subtitle && (
        <p className="text-lg text-muted-foreground mt-2">{subtitle}</p>
      )}
    </div>
  );
};

export default ModuleTitleWithAudio;
