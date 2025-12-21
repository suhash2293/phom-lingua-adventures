import React, { useState, useEffect } from 'react';
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
import { Pencil, Volume2, Upload, Loader2 } from 'lucide-react';
import { ContentService } from '@/services/ContentService';
import { Category } from '@/types/content';
import { useToast } from '@/components/ui/use-toast';

interface CategoryManagerProps {
  categories: Category[];
  onCategoriesUpdated: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ 
  categories, 
  onCategoriesUpdated 
}) => {
  const { toast } = useToast();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [phomName, setPhomName] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  useEffect(() => {
    if (editingCategory) {
      setPhomName(editingCategory.phom_name || '');
      setAudioFile(null);
    }
  }, [editingCategory]);

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

  const handleSave = async () => {
    if (!editingCategory) return;

    setIsUploading(true);
    try {
      let audioUrl = editingCategory.title_audio_url;

      // Upload new audio file if provided
      if (audioFile) {
        const uploadedUrl = await ContentService.uploadCategoryAudio(audioFile, editingCategory.id);
        if (uploadedUrl) {
          audioUrl = uploadedUrl;
        } else {
          toast({
            variant: "destructive",
            title: "Upload Failed",
            description: "Failed to upload audio file. Please try again."
          });
          setIsUploading(false);
          return;
        }
      }

      // Update category
      const updated = await ContentService.updateCategory(editingCategory.id, {
        phom_name: phomName || null,
        title_audio_url: audioUrl
      });

      if (updated) {
        toast({
          title: "Category Updated",
          description: `Successfully updated ${editingCategory.name}.`
        });
        onCategoriesUpdated();
        setEditingCategory(null);
      } else {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: "Failed to update category. Please try again."
        });
      }
    } catch (error) {
      console.error('Error saving category:', error);
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
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Module Name</TableHead>
            <TableHead>Phom Translation</TableHead>
            <TableHead>Title Audio</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell>
                {category.phom_name || (
                  <span className="text-muted-foreground italic">Not set</span>
                )}
              </TableCell>
              <TableCell>
                {category.title_audio_url ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePlayAudio(category.title_audio_url, category.id)}
                    disabled={playingAudio === category.id}
                  >
                    <Volume2 className={`h-4 w-4 ${playingAudio === category.id ? 'animate-pulse' : ''}`} />
                    <span className="ml-2">Play</span>
                  </Button>
                ) : (
                  <span className="text-muted-foreground italic">No audio</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingCategory(category)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category: {editingCategory?.name}</DialogTitle>
            <DialogDescription>
              Update the Phom translation and audio for this learning module.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phom-name">Phom Translation</Label>
              <Input
                id="phom-name"
                value={phomName}
                onChange={(e) => setPhomName(e.target.value)}
                placeholder="Enter Phom translation for the title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="audio-file">Title Audio (MP3)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="audio-file"
                  type="file"
                  accept="audio/mp3,audio/mpeg,audio/wav"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  className="flex-1"
                />
                {editingCategory?.title_audio_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePlayAudio(editingCategory.title_audio_url, editingCategory.id)}
                    disabled={playingAudio === editingCategory?.id}
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
              {editingCategory?.title_audio_url && !audioFile && (
                <p className="text-sm text-muted-foreground">
                  Current audio file is set. Upload a new file to replace it.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Save Changes
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
