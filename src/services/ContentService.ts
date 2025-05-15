import { supabase } from '@/integrations/supabase/client';
import { Category, ContentItem } from '@/types/content';

export const ContentService = {
  // Category operations
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
    
    return data || [];
  },
  
  async getCategoryByName(name: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .ilike('name', `%${name}%`)
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching category by name:', error);
      throw error;
    }
    
    return data;
  },
  
  // Content item operations
  async getContentItemsByCategory(categoryId: string): Promise<ContentItem[]> {
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('category_id', categoryId)
      .order('sort_order');
    
    if (error) {
      console.error('Error fetching content items:', error);
      throw error;
    }
    
    return data || [];
  },
  
  async getContentItemsByCategoryName(name: string): Promise<ContentItem[]> {
    // First find the category ID
    const category = await this.getCategoryByName(name);
    
    if (!category) {
      return [];
    }
    
    // Then get content items by category ID
    return this.getContentItemsByCategory(category.id);
  },
  
  async createContentItem(item: Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>): Promise<ContentItem> {
    const { data, error } = await supabase
      .from('content_items')
      .insert(item)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating content item:', error);
      throw error;
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
      throw error;
    }
    
    return data || [];
  },
  
  async updateContentItem(id: string, item: Partial<Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>>): Promise<ContentItem> {
    const { data, error } = await supabase
      .from('content_items')
      .update(item)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating content item:', error);
      throw error;
    }
    
    return data;
  },
  
  async deleteContentItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('content_items')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting content item:', error);
      throw error;
    }
  },
  
  // Audio file operations
  async uploadAudioFile(file: File, contentItemId?: string): Promise<string> {
    // Create a unique filename to avoid collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${contentItemId || 'unassigned'}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('audio-files')
      .upload(filePath, file);
    
    if (error) {
      console.error('Error uploading audio file:', error);
      throw error;
    }
    
    // Get the public URL
    const { data: publicUrl } = supabase.storage
      .from('audio-files')
      .getPublicUrl(filePath);
    
    // Record the audio file in the database
    if (contentItemId) {
      await supabase
        .from('audio_files')
        .insert({
          content_item_id: contentItemId,
          filename: fileName,
          storage_path: filePath,
          file_size: file.size
        });
    }
    
    return publicUrl.publicUrl;
  },
  
  async deleteAudioFile(filePath: string): Promise<void> {
    // First delete from storage
    const { error: storageError } = await supabase.storage
      .from('audio-files')
      .remove([filePath]);
    
    if (storageError) {
      console.error('Error deleting audio file from storage:', storageError);
      throw storageError;
    }
    
    // Then delete from database
    const { error: dbError } = await supabase
      .from('audio_files')
      .delete()
      .eq('storage_path', filePath);
    
    if (dbError) {
      console.error('Error deleting audio file record:', dbError);
      // Don't throw, as the file was deleted from storage already
      console.warn('Audio file was deleted from storage but not from database');
    }
  },
  
  // New methods for bulk operations
  async generateNumberContentItems(categoryId: string, language: string, startNum: number, endNum: number): Promise<Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>[]> {
    const items: Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>[] = [];
    
    // Generate number content items
    for (let i = startNum; i <= endNum; i++) {
      items.push({
        category_id: categoryId,
        phom_word: language === 'phom' ? String(i) : String(i),  // In a real app, you'd convert to Phom language
        english_translation: String(i),
        example_sentence: null,
        audio_url: null,
        sort_order: i
      });
    }
    
    return items;
  },
  
  async searchContentItems(query: string): Promise<ContentItem[]> {
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .or(`phom_word.ilike.%${query}%,english_translation.ilike.%${query}%`)
      .order('sort_order');
    
    if (error) {
      console.error('Error searching content items:', error);
      throw error;
    }
    
    return data || [];
  }
};
