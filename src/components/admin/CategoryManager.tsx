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
  const [singularName, setSingularName] = useState('');
  const [singularPhomName, setSingularPhomName] = useState('');
  const [singularAudioFile, setSingularAudioFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  useEffect(() => {
    if (editingCategory) {
      setPhomName(editingCategory.phom_name || '');
      setSingularName(editingCategory.singular_name || '');
      setSingularPhomName(editingCategory.singular_phom_name || '');
      setAudioFile(null);
      setSingularAudioFile(null);
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
      let singularAudioUrl = editingCategory.singular_audio_url;

      // Upload new plural audio file if provided
      if (audioFile) {
        const uploadedUrl = await ContentService.uploadCategoryAudio(audioFile, editingCategory.id);
        if (uploadedUrl) {
          audioUrl = uploadedUrl;
        } else {
          toast({
            variant: "destructive",
            title: "Upload Failed",
            description: "Failed to upload plural audio file. Please try again."
          });
          setIsUploading(false);
          return;
        }
      }

      // Upload new singular audio file if provided
      if (singularAudioFile) {
        const uploadedUrl = await ContentService.uploadCategoryAudio(singularAudioFile, `${editingCategory.id}-singular`);
        if (uploadedUrl) {
          singularAudioUrl = uploadedUrl;
        } else {
          toast({
            variant: "destructive",
            title: "Upload Failed",
            description: "Failed to upload singular audio file. Please try again."
          });
          setIsUploading(false);
          return;
        }
      }

      // Update category with all fields
      const updated = await ContentService.updateCategory(editingCategory.id, {
        phom_name: phomName || null,
        title_audio_url: audioUrl,
        singular_name: singularName || null,
        singular_phom_name: singularPhomName || null,
        singular_audio_url: singularAudioUrl
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
            <TableHead>Singular Phom</TableHead>
            <TableHead>Plural Phom</TableHead>
            <TableHead>Audio</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell>
                {category.singular_phom_name || (
                  <span className="text-muted-foreground italic">Not set</span>
                )}
              </TableCell>
              <TableCell>
                {category.phom_name || (
                  <span className="text-muted-foreground italic">Not set</span>
                )}
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
                  {!category.singular_audio_url && !category.title_audio_url && (
                    <span className="text-muted-foreground italic text-sm">No audio</span>
                  )}
                </div>
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

          <div className="space-y-6 py-4">
            {/* Singular Form Section */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Singular Form</h4>
              
              <div className="space-y-2">
                <Label htmlFor="singular-name">Singular English Name</Label>
                <Input
                  id="singular-name"
                  value={singularName}
                  onChange={(e) => setSingularName(e.target.value)}
                  placeholder="e.g., Day, Month, Season"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="singular-phom-name">Singular Phom Translation</Label>
                <Input
                  id="singular-phom-name"
                  value={singularPhomName}
                  onChange={(e) => setSingularPhomName(e.target.value)}
                  placeholder="Enter Phom translation for singular form"
                />
              </div>

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
                  {editingCategory?.singular_audio_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePlayAudio(editingCategory.singular_audio_url, `${editingCategory.id}-singular`)}
                      disabled={playingAudio === `${editingCategory?.id}-singular`}
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
            </div>

            {/* Plural Form Section */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Plural Form</h4>
              
              <div className="space-y-2">
                <Label htmlFor="phom-name">Plural Phom Translation</Label>
                <Input
                  id="phom-name"
                  value={phomName}
                  onChange={(e) => setPhomName(e.target.value)}
                  placeholder="Enter Phom translation for plural form"
                />
              </div>

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
              </div>
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
