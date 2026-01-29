import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Volume2, Upload, Loader2, Save } from 'lucide-react';
import { ContentService } from '@/services/ContentService';
import { Category } from '@/types/content';
import { useToast } from '@/components/ui/use-toast';

interface CategoryManagerProps {
  categories: Category[];
  onCategoriesUpdated: () => void;
}

interface PendingChanges {
  singular_phom_name?: string;
  phom_name?: string;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ 
  categories, 
  onCategoriesUpdated 
}) => {
  const { toast } = useToast();
  const [pendingChanges, setPendingChanges] = useState<Record<string, PendingChanges>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  
  // Audio upload dialog state
  const [audioDialogCategory, setAudioDialogCategory] = useState<Category | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [singularAudioFile, setSingularAudioFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Compute if there are any changes
  const hasChanges = useMemo(() => {
    return Object.keys(pendingChanges).length > 0;
  }, [pendingChanges]);

  const changedCount = useMemo(() => {
    return Object.keys(pendingChanges).length;
  }, [pendingChanges]);

  // Get the current value for a field (pending change or original)
  const getValue = (category: Category, field: 'singular_phom_name' | 'phom_name'): string => {
    if (pendingChanges[category.id]?.[field] !== undefined) {
      return pendingChanges[category.id][field] || '';
    }
    return category[field] || '';
  };

  // Handle input change
  const handleInputChange = (categoryId: string, field: 'singular_phom_name' | 'phom_name', value: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const originalValue = category[field] || '';
    const currentChanges = pendingChanges[categoryId] || {};
    
    // If value matches original, remove from pending changes
    if (value === originalValue) {
      const { [field]: removed, ...rest } = currentChanges;
      if (Object.keys(rest).length === 0) {
        const { [categoryId]: removed, ...restChanges } = pendingChanges;
        setPendingChanges(restChanges);
      } else {
        setPendingChanges({ ...pendingChanges, [categoryId]: rest });
      }
    } else {
      // Add to pending changes
      setPendingChanges({
        ...pendingChanges,
        [categoryId]: { ...currentChanges, [field]: value }
      });
    }
  };

  // Save all pending changes
  const handleSaveAll = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const [categoryId, changes] of Object.entries(pendingChanges)) {
        const category = categories.find(c => c.id === categoryId);
        if (!category) continue;

        const updateData: Partial<Category> = {};
        
        if (changes.singular_phom_name !== undefined) {
          updateData.singular_phom_name = changes.singular_phom_name || null;
        }
        if (changes.phom_name !== undefined) {
          updateData.phom_name = changes.phom_name || null;
        }

        const updated = await ContentService.updateCategory(categoryId, updateData);
        if (updated) {
          successCount++;
        } else {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: "Changes Saved",
          description: `Successfully updated ${successCount} categor${successCount === 1 ? 'y' : 'ies'}.`
        });
        setPendingChanges({});
        onCategoriesUpdated();
      }

      if (errorCount > 0) {
        toast({
          variant: "destructive",
          title: "Some Updates Failed",
          description: `${errorCount} categor${errorCount === 1 ? 'y' : 'ies'} failed to update.`
        });
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while saving."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlayAudio = async (audioUrl: string | null, categoryId: string) => {
    if (!audioUrl) return;
    
    try {
      setPlayingAudio(categoryId);
      const audio = new Audio(audioUrl);
      audio.onended = () => setPlayingAudio(null);
      audio.onerror = () => {
        setPlayingAudio(null);
        toast({
          variant: "destructive",
          title: "Playback Error",
          description: "Unable to play this audio file."
        });
      };
      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setPlayingAudio(null);
    }
  };

  const handleAudioSave = async () => {
    if (!audioDialogCategory) return;

    setIsUploading(true);
    try {
      let audioUrl = audioDialogCategory.title_audio_url;
      let singularAudioUrl = audioDialogCategory.singular_audio_url;

      // Upload new plural audio file if provided
      if (audioFile) {
        const uploadedUrl = await ContentService.uploadCategoryAudio(audioFile, audioDialogCategory.id);
        if (uploadedUrl) {
          audioUrl = uploadedUrl;
        } else {
          toast({
            variant: "destructive",
            title: "Upload Failed",
            description: "Failed to upload plural audio file."
          });
          setIsUploading(false);
          return;
        }
      }

      // Upload new singular audio file if provided
      if (singularAudioFile) {
        const uploadedUrl = await ContentService.uploadCategoryAudio(singularAudioFile, `${audioDialogCategory.id}-singular`);
        if (uploadedUrl) {
          singularAudioUrl = uploadedUrl;
        } else {
          toast({
            variant: "destructive",
            title: "Upload Failed",
            description: "Failed to upload singular audio file."
          });
          setIsUploading(false);
          return;
        }
      }

      // Update category with audio URLs
      const updated = await ContentService.updateCategory(audioDialogCategory.id, {
        title_audio_url: audioUrl,
        singular_audio_url: singularAudioUrl
      });

      if (updated) {
        toast({
          title: "Audio Updated",
          description: `Successfully updated audio for ${audioDialogCategory.name}.`
        });
        onCategoriesUpdated();
        setAudioDialogCategory(null);
        setAudioFile(null);
        setSingularAudioFile(null);
      } else {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: "Failed to update audio."
        });
      }
    } catch (error) {
      console.error('Error saving audio:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred."
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Module Name</TableHead>
            <TableHead>Singular Phom</TableHead>
            <TableHead>Plural Phom</TableHead>
            <TableHead>Audio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell>
                <Input
                  value={getValue(category, 'singular_phom_name')}
                  onChange={(e) => handleInputChange(category.id, 'singular_phom_name', e.target.value)}
                  placeholder="Enter singular Phom..."
                  className="max-w-[200px]"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={getValue(category, 'phom_name')}
                  onChange={(e) => handleInputChange(category.id, 'phom_name', e.target.value)}
                  placeholder="Enter plural Phom..."
                  className="max-w-[200px]"
                />
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {category.singular_audio_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePlayAudio(category.singular_audio_url, `${category.id}-singular`)}
                      disabled={playingAudio === `${category.id}-singular`}
                      title="Play singular"
                    >
                      <Volume2 className={`h-4 w-4 ${playingAudio === `${category.id}-singular` ? 'animate-pulse' : ''}`} />
                      <span className="ml-1 text-xs">S</span>
                    </Button>
                  )}
                  {category.title_audio_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePlayAudio(category.title_audio_url, category.id)}
                      disabled={playingAudio === category.id}
                      title="Play plural"
                    >
                      <Volume2 className={`h-4 w-4 ${playingAudio === category.id ? 'animate-pulse' : ''}`} />
                      <span className="ml-1 text-xs">P</span>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAudioDialogCategory(category)}
                    title="Upload audio"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Yellow Save Button */}
      {hasChanges && (
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save {changedCount} Change{changedCount !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Audio Upload Dialog */}
      <Dialog open={!!audioDialogCategory} onOpenChange={() => {
        setAudioDialogCategory(null);
        setAudioFile(null);
        setSingularAudioFile(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Audio: {audioDialogCategory?.name}</DialogTitle>
            <DialogDescription>
              Upload audio files for the category title.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Singular Audio */}
            <div className="space-y-2">
              <Label htmlFor="singular-audio-file">Singular Audio (MP3)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="singular-audio-file"
                  type="file"
                  accept="audio/mp3,audio/mpeg,audio/wav"
                  onChange={(e) => setSingularAudioFile(e.target.files?.[0] || null)}
                  className="flex-1"
                />
                {audioDialogCategory?.singular_audio_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePlayAudio(audioDialogCategory.singular_audio_url, `${audioDialogCategory.id}-singular`)}
                    disabled={playingAudio === `${audioDialogCategory?.id}-singular`}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {singularAudioFile && (
                <p className="text-sm text-muted-foreground">
                  New file: {singularAudioFile.name}
                </p>
              )}
            </div>

            {/* Plural Audio */}
            <div className="space-y-2">
              <Label htmlFor="audio-file">Plural Audio (MP3)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="audio-file"
                  type="file"
                  accept="audio/mp3,audio/mpeg,audio/wav"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  className="flex-1"
                />
                {audioDialogCategory?.title_audio_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePlayAudio(audioDialogCategory.title_audio_url, audioDialogCategory.id)}
                    disabled={playingAudio === audioDialogCategory?.id}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {audioFile && (
                <p className="text-sm text-muted-foreground">
                  New file: {audioFile.name}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAudioDialogCategory(null);
              setAudioFile(null);
              setSingularAudioFile(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleAudioSave} disabled={isUploading || (!audioFile && !singularAudioFile)}>
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Audio
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryManager;
