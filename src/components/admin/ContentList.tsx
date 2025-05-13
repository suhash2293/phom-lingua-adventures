
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Play, Pause } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ContentItem, Category } from '@/types/content';
import { ContentService } from '@/services/ContentService';

type ContentListProps = {
  categoryId: string;
  categories: Category[];
  onEditItem?: (item: ContentItem) => void;
  items?: ContentItem[]; // Optional prop to pass in pre-loaded items (for search results)
  showCategoryName?: boolean; // Whether to show the category column
};

export default function ContentList({ 
  categoryId, 
  categories, 
  onEditItem, 
  items: providedItems,
  showCategoryName = false
}: ContentListProps) {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<HTMLAudioElement | null>(null);
  const [playingItemId, setPlayingItemId] = useState<string | null>(null);
  const { toast } = useToast();

  // Load content items when category changes or if items are provided directly
  useEffect(() => {
    if (providedItems) {
      setContentItems(providedItems);
      setLoading(false);
      return;
    }
    
    const loadContentItems = async () => {
      if (!categoryId) return;
      
      setLoading(true);
      try {
        const items = await ContentService.getContentItemsByCategory(categoryId);
        setContentItems(items);
      } catch (err) {
        console.error('Error loading content items:', err);
        toast({
          variant: "destructive",
          title: "Failed to load content",
          description: "There was a problem loading the content items."
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadContentItems();
  }, [categoryId, providedItems, toast]);

  const handleDelete = async () => {
    if (!deleteItemId) return;
    
    try {
      // Find the item to get its audio_url for deletion
      const item = contentItems.find(item => item.id === deleteItemId);
      
      // Delete the content item (this will cascade delete any audio_files references)
      await ContentService.deleteContentItem(deleteItemId);
      
      // If the item had an audio URL, delete the file from storage as well
      if (item?.audio_url) {
        try {
          // Extract the storage path from the URL
          const url = new URL(item.audio_url);
          const pathMatch = url.pathname.match(/\/object\/public\/audio-files\/(.*)/);
          if (pathMatch && pathMatch[1]) {
            await ContentService.deleteAudioFile(pathMatch[1]);
          }
        } catch (err) {
          console.error('Error deleting audio file:', err);
          // Continue without throwing, as the content item was deleted
        }
      }
      
      // Update the UI
      setContentItems(contentItems.filter(item => item.id !== deleteItemId));
      
      toast({
        title: "Item Deleted",
        description: "The content item has been deleted."
      });
    } catch (err) {
      console.error('Error deleting content item:', err);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "There was a problem deleting the item."
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const handlePlay = (audioUrl: string | null, itemId: string) => {
    if (!audioUrl) {
      toast({
        variant: "destructive",
        title: "No Audio Available",
        description: "This item doesn't have an audio file."
      });
      return;
    }
    
    // If this is the currently playing audio
    if (playingItemId === itemId && playingAudio) {
      if (playingAudio.paused) {
        playingAudio.play();
      } else {
        playingAudio.pause();
      }
      return;
    }
    
    // Stop any currently playing audio
    if (playingAudio) {
      playingAudio.pause();
      playingAudio.currentTime = 0;
    }
    
    // Play the new audio
    const audio = new Audio(audioUrl);
    
    audio.addEventListener('ended', () => {
      setPlayingItemId(null);
    });
    
    audio.play().catch(err => {
      console.error('Error playing audio:', err);
      toast({
        variant: "destructive",
        title: "Playback Failed",
        description: "There was a problem playing the audio file."
      });
      setPlayingItemId(null);
    });
    
    setPlayingAudio(audio);
    setPlayingItemId(itemId);
  };

  const getCategoryName = (id: string) => {
    const category = categories.find(c => c.id === id);
    return category ? category.name : 'Unknown';
  };

  if (loading) {
    return <div className="my-8 text-center">Loading content items...</div>;
  }

  return (
    <>
      <Table>
        <TableCaption>
          {contentItems.length 
            ? providedItems 
              ? `Showing ${contentItems.length} content items`
              : `Showing ${contentItems.length} content items for ${getCategoryName(categoryId)}`
            : 'No content items found'}
        </TableCaption>
        <TableHeader>
          <TableRow>
            {showCategoryName && <TableHead>Category</TableHead>}
            <TableHead>Phom Word</TableHead>
            <TableHead>English Translation</TableHead>
            <TableHead>Example</TableHead>
            <TableHead>Audio</TableHead>
            <TableHead>Sort Order</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contentItems.map((item) => (
            <TableRow key={item.id}>
              {showCategoryName && (
                <TableCell>{getCategoryName(item.category_id)}</TableCell>
              )}
              <TableCell className="font-medium phom-font">{item.phom_word}</TableCell>
              <TableCell>{item.english_translation}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {item.example_sentence || '-'}
              </TableCell>
              <TableCell>
                {item.audio_url ? (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePlay(item.audio_url, item.id)}
                  >
                    {playingItemId === item.id 
                      ? <Pause className="h-4 w-4" /> 
                      : <Play className="h-4 w-4" />
                    }
                  </Button>
                ) : (
                  <span className="text-muted-foreground">No audio</span>
                )}
              </TableCell>
              <TableCell>{item.sort_order}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEditItem && onEditItem(item)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setDeleteItemId(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteItemId} onOpenChange={(open) => !open && setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the content item
              and any associated audio files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
