import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Headphones, Loader2 } from 'lucide-react';
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
  const [isPlayingPlural, setIsPlayingPlural] = useState(false);
  const [isPlayingSingular, setIsPlayingSingular] = useState(false);
  const handlePlayPluralAudio = async () => {
    if (!category?.title_audio_url) return;
    try {
      setIsPlayingPlural(true);
      onAudioPlay?.();
      const audio = new Audio(category.title_audio_url);
      audio.onended = () => setIsPlayingPlural(false);
      audio.onerror = () => setIsPlayingPlural(false);
      await audio.play();
    } catch (error) {
      console.error('Error playing plural audio:', error);
      setIsPlayingPlural(false);
    }
  };
  const handlePlaySingularAudio = async () => {
    if (!category?.singular_audio_url) return;
    try {
      setIsPlayingSingular(true);
      onAudioPlay?.();
      const audio = new Audio(category.singular_audio_url);
      audio.onended = () => setIsPlayingSingular(false);
      audio.onerror = () => setIsPlayingSingular(false);
      await audio.play();
    } catch (error) {
      console.error('Error playing singular audio:', error);
      setIsPlayingSingular(false);
    }
  };
  const hasSingularForm = category?.singular_name || category?.singular_phom_name;
  return <div className="flex justify-center mb-8">
      <Card className="w-full max-w-md border-primary/20 hover:border-primary hover:shadow-md transition-all">
        <CardHeader className="bg-primary/5 pb-4 text-center space-y-0">
          {/* Singular Form Section */}
          {hasSingularForm && <div className="mb-4 pb-4 border-b border-primary/10">
              
              {category?.singular_name && <CardTitle className="text-xl font-bold">
                  {category.singular_name}
                </CardTitle>}
              {category?.singular_phom_name && <p className="text-lg text-primary font-semibold mt-1">
                  {category.singular_phom_name}
                </p>}
              {category?.singular_audio_url && <div className="flex justify-center mt-3">
                  <Button variant="default" size="sm" onClick={handlePlaySingularAudio} disabled={isPlayingSingular} className="flex items-center gap-2 shadow-md">
                    {isPlayingSingular ? <Loader2 className="h-4 w-4 animate-spin" /> : <Headphones className="h-4 w-4" />}
                    Listen
                  </Button>
                </div>}
            </div>}

          {/* Plural Form Section */}
          <div>
            {hasSingularForm}
            <CardTitle className="text-2xl font-bold">{englishTitle}</CardTitle>
            {category?.phom_name && <p className="text-xl text-primary font-semibold mt-2">
                {category.phom_name}
              </p>}
            {category?.title_audio_url && <div className="flex justify-center mt-3">
                <Button variant="default" size="sm" onClick={handlePlayPluralAudio} disabled={isPlayingPlural} className="flex items-center gap-2 shadow-md">
                  {isPlayingPlural ? <Loader2 className="h-4 w-4 animate-spin" /> : <Headphones className="h-4 w-4" />}
                  Listen
                </Button>
              </div>}
          </div>
        </CardHeader>
        {subtitle && <CardContent className="pt-4 text-center">
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          </CardContent>}
      </Card>
    </div>;
};
export default ModuleTitleWithAudio;