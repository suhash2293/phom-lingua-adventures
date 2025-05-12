
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { ContentItem } from '@/types/content';
import { ContentService } from '@/services/ContentService';

type ContentEditFormProps = {
  item: ContentItem | null;
  onClose: () => void;
  onSaved: () => void;
};

type EditFormValues = {
  phom_word: string;
  english_translation: string;
  example_sentence: string;
  sort_order: number;
};

export default function ContentEditForm({ item, onClose, onSaved }: ContentEditFormProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<EditFormValues>({
    defaultValues: {
      phom_word: item?.phom_word || '',
      english_translation: item?.english_translation || '',
      example_sentence: item?.example_sentence || '',
      sort_order: item?.sort_order || 0,
    }
  });

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const onSubmit = async (values: EditFormValues) => {
    if (!item) return;
    
    try {
      setIsSubmitting(true);
      
      // Prepare update data
      const updateData: Partial<Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>> = {
        phom_word: values.phom_word,
        english_translation: values.english_translation,
        example_sentence: values.example_sentence || null,
        sort_order: values.sort_order
      };
      
      // If there's a new audio file, upload it
      if (audioFile) {
        const audioUrl = await ContentService.uploadAudioFile(audioFile, item.id);
        updateData.audio_url = audioUrl;
      }
      
      // Update the content item
      await ContentService.updateContentItem(item.id, updateData);
      
      toast({
        title: "Content Updated",
        description: "The content item has been successfully updated."
      });
      
      onSaved();
      onClose();
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was a problem updating the content. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Content Item</DialogTitle>
          <DialogDescription>
            Make changes to the content item. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="phom_word"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phom Word</FormLabel>
                  <FormControl>
                    <Input {...field} className="phom-font" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="english_translation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>English Translation</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="example_sentence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Example Sentence (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="sort_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <FormLabel htmlFor="audio-edit">Update Audio File (Optional)</FormLabel>
              <Input
                id="audio-edit"
                type="file"
                accept="audio/mp3,audio/*"
                onChange={handleAudioChange}
              />
              {audioFile ? (
                <p className="text-sm text-muted-foreground">
                  New file selected: {audioFile.name}
                </p>
              ) : item?.audio_url ? (
                <p className="text-sm text-muted-foreground">
                  Current audio file will be kept unless you select a new one.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No audio file currently. Upload one if needed.
                </p>
              )}
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
