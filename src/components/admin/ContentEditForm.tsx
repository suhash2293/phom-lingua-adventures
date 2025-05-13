
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { useToast } from '@/components/ui/use-toast';
import { ContentItem } from '@/types/content';
import { ContentService } from '@/services/ContentService';

type ContentEditFormProps = {
  item: ContentItem | null;
  onClose: () => void;
  onSaved?: () => void;
};

type FormValues = {
  phom_word: string;
  english_translation: string;
  example_sentence?: string;
  sort_order: number;
};

export default function ContentEditForm({ item, onClose, onSaved }: ContentEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    defaultValues: {
      phom_word: item?.phom_word || '',
      english_translation: item?.english_translation || '',
      example_sentence: item?.example_sentence || '',
      sort_order: item?.sort_order || 0,
    },
  });
  
  // Update form values when item changes
  React.useEffect(() => {
    if (item) {
      form.reset({
        phom_word: item.phom_word,
        english_translation: item.english_translation,
        example_sentence: item.example_sentence || '',
        sort_order: item.sort_order,
      });
    }
  }, [item, form]);
  
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };
  
  const onSubmit = async (values: FormValues) => {
    if (!item) return;
    
    try {
      setIsSubmitting(true);
      
      // Update the content item
      await ContentService.updateContentItem(item.id, {
        ...values,
        example_sentence: values.example_sentence || null,
      });
      
      // If there's a new audio file, upload it and update the content item
      if (audioFile) {
        const audioUrl = await ContentService.uploadAudioFile(audioFile, item.id);
        
        // Update the content item with the new audio URL
        await ContentService.updateContentItem(item.id, {
          audio_url: audioUrl,
        });
      }
      
      toast({
        title: "Content Updated",
        description: "The content item has been successfully updated."
      });
      
      if (onSaved) {
        onSaved();
      }
      onClose();
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was a problem updating the content item."
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
            Make changes to the content item below.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="phom_word"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phom Word</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter word in Phom" className="phom-font" />
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
                    <Input {...field} placeholder="Enter English translation" />
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
                      placeholder="Example sentence using this word"
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
              <FormLabel htmlFor="audio-upload-edit">Audio File (MP3)</FormLabel>
              <Input
                id="audio-upload-edit"
                type="file"
                accept="audio/mp3,audio/*"
                onChange={handleAudioChange}
              />
              {item?.audio_url && !audioFile && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Current audio:</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const audio = new Audio(item.audio_url || '');
                      audio.play();
                    }}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Play
                  </Button>
                </div>
              )}
              {audioFile && (
                <p className="text-sm text-muted-foreground">
                  New file selected: {audioFile.name}
                </p>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
              >
                Cancel
              </Button>
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

// Helper component for the Play icon since it's not imported
function Play(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}
