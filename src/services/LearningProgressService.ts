
import { supabase } from '@/integrations/supabase/client';

export type LearningProgressAction = 'viewed' | 'audio_played' | 'lesson_completed';

export type LearningProgressRecord = {
  id: string;
  user_id: string;
  category_id: string;
  content_item_id: string | null;
  action_type: LearningProgressAction;
  progress_value: number;
  created_at: string;
  updated_at: string;
};

export type ModuleProgress = {
  id: string;
  title: string;
  progress: number;
  totalItems: number;
  completedItems: number;
};

export const LearningProgressService = {
  async trackProgress(
    categoryId: string,
    contentItemId: string | null,
    actionType: LearningProgressAction
  ): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    try {
      // Check if this action already exists to avoid duplicates
      if (contentItemId) {
        const { data: existing } = await supabase
          .from('learning_progress')
          .select('id')
          .eq('user_id', user.user.id)
          .eq('category_id', categoryId)
          .eq('content_item_id', contentItemId)
          .eq('action_type', actionType)
          .single();

        if (existing) {
          return; // Already tracked
        }
      }

      await supabase
        .from('learning_progress')
        .insert({
          user_id: user.user.id,
          category_id: categoryId,
          content_item_id: contentItemId,
          action_type: actionType
        });
    } catch (error) {
      console.error('Error tracking learning progress:', error);
    }
  },

  async getModuleProgress(): Promise<ModuleProgress[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];

    try {
      // Get all categories
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (!categories) return [];

      const moduleProgress: ModuleProgress[] = [];

      for (const category of categories) {
        // Use the database function to calculate progress
        const { data: progressResult } = await supabase
          .rpc('calculate_category_progress', {
            user_uuid: user.user.id,
            category_uuid: category.id
          });

        // Get total items in category
        const { data: totalItems } = await supabase
          .from('content_items')
          .select('id', { count: 'exact' })
          .eq('category_id', category.id);

        // Get completed items for this user
        const { data: completedItems } = await supabase
          .from('learning_progress')
          .select('content_item_id', { count: 'exact' })
          .eq('user_id', user.user.id)
          .eq('category_id', category.id)
          .not('content_item_id', 'is', null);

        moduleProgress.push({
          id: category.id,
          title: category.name,
          progress: progressResult || 0,
          totalItems: totalItems?.length || 0,
          completedItems: completedItems?.length || 0
        });
      }

      return moduleProgress;
    } catch (error) {
      console.error('Error fetching module progress:', error);
      return [];
    }
  },

  async getCategoryProgress(categoryId: string): Promise<number> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return 0;

    try {
      const { data: progressResult } = await supabase
        .rpc('calculate_category_progress', {
          user_uuid: user.user.id,
          category_uuid: categoryId
        });

      return progressResult || 0;
    } catch (error) {
      console.error('Error fetching category progress:', error);
      return 0;
    }
  }
};
