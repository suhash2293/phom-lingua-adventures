
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { ContentService } from '@/services/ContentService';
import { Category } from '@/types/content';

type BulkNumberFormValues = {
  category_id: string;
  start_number: number;
  end_number: number;
  language: string;
};

type BulkNumberGeneratorProps = {
  categories: Category[];
  onSuccess?: () => void;
};

export default function BulkNumberGenerator({ categories, onSuccess }: BulkNumberGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<BulkNumberFormValues>({
    defaultValues: {
      category_id: '',
      start_number: 1,
      end_number: 10,
      language: 'phom',
    }
  });
  
  const onSubmit = async (values: BulkNumberFormValues) => {
    if (values.end_number < values.start_number) {
      toast({
        variant: "destructive",
        title: "Invalid Range",
        description: "End number must be greater than or equal to start number."
      });
      return;
    }
    
    if (values.end_number - values.start_number > 100) {
      toast({
        variant: "destructive",
        title: "Range Too Large",
        description: "Please generate no more than 100 numbers at once."
      });
      return;
    }
    
    try {
      setIsGenerating(true);
      
      // Generate number content items
      const items = await ContentService.generateNumberContentItems(
        values.category_id,
        values.language,
        values.start_number,
        values.end_number
      );
      
      // Save to database
      await ContentService.bulkCreateContentItems(items);
      
      toast({
        title: "Numbers Generated",
        description: `Successfully generated ${items.length} number entries.`
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form
      form.reset({
        category_id: values.category_id,
        start_number: 1,
        end_number: 10,
        language: 'phom',
      });
    } catch (error) {
      console.error('Error generating numbers:', error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "There was a problem generating the number entries."
      });
    } finally {
      setIsGenerating(false);
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
                  {categories
                    .filter(category => category.name.toLowerCase().includes('number'))
                    .map((category) => (
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
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Number</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    value={field.value}
                    min={1}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="end_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Number</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                    value={field.value}
                    min={1}
                    max={1000}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Language</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="phom">Phom</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Number Entries'}
        </Button>
      </form>
    </Form>
  );
}
