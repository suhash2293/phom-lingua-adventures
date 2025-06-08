
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
  }
};
