
import { supabase } from '@/integrations/supabase/client';
import { Category, ContentItem, AudioFile } from '@/types/content';

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
  }
};
