
import React, { useState, useEffect } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Category } from '@/types/content';
import { ContentService } from '@/services/ContentService';

type ContentFormValues = {
  category_id: string;
  phom_word: string;
  english_translation: string;
  example_sentence?: string;
  audio_url?: string | null;
  sort_order: number;
};

export default function ContentUploadForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ContentFormValues>({
    defaultValues: {
      category_id: '',
      phom_word: '',
      english_translation: '',
      example_sentence: '',
      audio_url: null,
      sort_order: 0
    }
  });
  
  // Load categories when component mounts
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await ContentService.getCategories();
        setCategories(data);
        
        // Set default category if available
        if (data.length > 0) {
          form.setValue('category_id', data[0].id);
        }
      } catch (err) {
        console.error('Error loading categories:', err);
        toast({
          variant: "destructive",
          title: "Failed to load categories",
          description: "Please try refreshing the page."
        });
      }
    };
    
    loadCategories();
  }, [form, toast]);
  
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };
  
  const onSubmit = async (values: ContentFormValues) => {
    try {
      setIsUploading(true);
      
      // First create the content item
      const contentItem = await ContentService.createContentItem({
        ...values,
        example_sentence: values.example_sentence || null,
        audio_url: null // Initially null, will update after upload
      });
      
      // If there's an audio file, upload it and update the content item
      if (audioFile) {
        const audioUrl = await ContentService.uploadAudioFile(audioFile, contentItem.id);
        
        // Update the content item with the audio URL
        await ContentService.updateContentItem(contentItem.id, {
          audio_url: audioUrl
        });
      }
      
      toast({
        title: "Content Added",
        description: "The content item has been successfully added."
      });
      
      // Reset form
      form.reset({
        category_id: values.category_id, // Keep the selected category
        phom_word: '',
        english_translation: '',
        example_sentence: '',
        audio_url: null,
        sort_order: values.sort_order + 10 // Increment sort order for convenience
      });
      setAudioFile(null);
      
      // Reset file input (need to access the DOM element directly)
      const fileInput = document.getElementById('audio-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Error adding content:', error);
      toast({
        variant: "destructive",
        title: "Error Adding Content",
        description: "There was a problem adding the content. Please try again."
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
          <FormLabel htmlFor="audio-upload">Audio File (MP3)</FormLabel>
          <Input
            id="audio-upload"
            type="file"
            accept="audio/mp3,audio/*"
            onChange={handleAudioChange}
          />
          {audioFile && (
            <p className="text-sm text-muted-foreground">
              Selected file: {audioFile.name}
            </p>
          )}
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Add Content Item'}
        </Button>
      </form>
    </Form>
  );
}
