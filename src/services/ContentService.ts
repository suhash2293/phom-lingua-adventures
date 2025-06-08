
import { supabase } from '@/integrations/supabase/client';
import { ContentItem, Category } from '@/types/content';

export const ContentService = {
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
    
    return data || [];
  },

  async getContentItemsByCategoryName(categoryName: string): Promise<ContentItem[]> {
    // First get the category ID
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .single();
    
    if (categoryError || !category) {
      console.error('Error fetching category:', categoryError);
      return [];
    }
    
    // Then get content items for that category
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('category_id', category.id)
      .order('sort_order');
    
    if (error) {
      console.error('Error fetching content items:', error);
      return [];
    }
    
    return data || [];
  },

  async getContentItemsByCategoryId(categoryId: string): Promise<ContentItem[]> {
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('category_id', categoryId)
      .order('sort_order');
    
    if (error) {
      console.error('Error fetching content items:', error);
      return [];
    }
    
    return data || [];
  },

  // Alias for backward compatibility with game pages
  async getContentItemsByCategory(categoryId: string): Promise<ContentItem[]> {
    return this.getContentItemsByCategoryId(categoryId);
  },

  async getAllContentItems(): Promise<ContentItem[]> {
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .order('sort_order');
    
    if (error) {
      console.error('Error fetching all content items:', error);
      return [];
    }
    
    return data || [];
  },

  async searchContentItems(query: string): Promise<ContentItem[]> {
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .or(`phom_word.ilike.%${query}%,english_translation.ilike.%${query}%`)
      .order('sort_order');
    
    if (error) {
      console.error('Error searching content items:', error);
      return [];
    }
    
    return data || [];
  },

  async createContentItem(item: Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>): Promise<ContentItem | null> {
    const { data, error } = await supabase
      .from('content_items')
      .insert(item)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating content item:', error);
      return null;
    }
    
    return data;
  },

  async bulkCreateContentItems(items: Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>[]): Promise<ContentItem[]> {
    const { data, error } = await supabase
      .from('content_items')
      .insert(items)
      .select();
    
    if (error) {
      console.error('Error bulk creating content items:', error);
      return [];
    }
    
    return data || [];
  },

  async updateContentItem(id: string, updates: Partial<ContentItem>): Promise<ContentItem | null> {
    const { data, error } = await supabase
      .from('content_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating content item:', error);
      return null;
    }
    
    return data;
  },

  async deleteContentItem(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('content_items')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting content item:', error);
      return false;
    }
    
    return true;
  },

  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating category:', error);
      return null;
    }
    
    return data;
  },

  async uploadAudioFile(file: File, contentItemId: string): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${contentItemId}-${Date.now()}.${fileExt}`;
      const filePath = `audio/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading audio file:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('audio-files')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading audio file:', error);
      return null;
    }
  },

  async deleteAudioFile(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from('audio-files')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting audio file:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting audio file:', error);
      return false;
    }
  },

  async generateNumberContentItems(
    categoryId: string,
    language: string,
    startNumber: number,
    endNumber: number
  ): Promise<Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>[]> {
    const items: Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>[] = [];
    
    // Simple number generation - in a real app you'd want proper translations
    const numberNames: { [key: number]: string } = {
      1: 'khat', 2: 'nyi', 3: 'som', 4: 'bzi', 5: 'nga',
      6: 'drug', 7: 'bdun', 8: 'brgyad', 9: 'dgu', 10: 'bcu'
    };
    
    for (let i = startNumber; i <= endNumber; i++) {
      const phomWord = numberNames[i] || `number-${i}`;
      const englishTranslation = i.toString();
      
      items.push({
        category_id: categoryId,
        phom_word: phomWord,
        english_translation: englishTranslation,
        example_sentence: `This is ${englishTranslation} in Phom.`,
        audio_url: null,
        sort_order: i
      });
    }
    
    return items;
  }
};
