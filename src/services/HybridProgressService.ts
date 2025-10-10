import { supabase } from '@/integrations/supabase/client';
import { LocalStorageService } from './LocalStorageService';
import { LearningProgressService, type LearningProgressAction, type ModuleProgress } from './LearningProgressService';

export const HybridProgressService = {
  /**
   * Track learning progress - uses LocalStorage for anonymous users, Supabase for authenticated users
   */
  async trackProgress(
    categoryId: string,
    contentItemId: string | null,
    actionType: LearningProgressAction
  ): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      // Anonymous user - use localStorage
      LocalStorageService.trackLearningProgress(categoryId, contentItemId, actionType);
    } else {
      // Authenticated user - use Supabase
      await LearningProgressService.trackProgress(categoryId, contentItemId, actionType);
    }
  },

  /**
   * Get module progress for all categories
   */
  async getModuleProgress(): Promise<ModuleProgress[]> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      // Anonymous user - calculate from localStorage
      return this.calculateLocalModuleProgress();
    } else {
      // Authenticated user - use Supabase
      return await LearningProgressService.getModuleProgress();
    }
  },

  /**
   * Get progress for a specific category
   */
  async getCategoryProgress(categoryId: string): Promise<number> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      // Anonymous user - calculate from localStorage
      return this.calculateLocalCategoryProgress(categoryId);
    } else {
      // Authenticated user - use Supabase
      return await LearningProgressService.getCategoryProgress(categoryId);
    }
  },

  /**
   * Calculate module progress from localStorage data
   */
  async calculateLocalModuleProgress(): Promise<ModuleProgress[]> {
    try {
      // Fetch all categories
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (!categories) return [];

      const localProgress = LocalStorageService.getLearningProgress();
      const moduleProgress: ModuleProgress[] = [];

      for (const category of categories) {
        // Get total items in category
        const { data: contentItems } = await supabase
          .from('content_items')
          .select('id')
          .eq('category_id', category.id);

        const totalItems = contentItems?.length || 0;
        
        // Get unique content items the user has interacted with in this category
        const categoryProgress = localProgress.filter(p => p.categoryId === category.id);
        const uniqueContentItems = new Set(
          categoryProgress
            .filter(p => p.contentItemId)
            .map(p => p.contentItemId)
        );
        const completedItems = uniqueContentItems.size;

        // Calculate progress percentage
        const progress = totalItems > 0 
          ? Math.round((completedItems / totalItems) * 100) 
          : 0;

        moduleProgress.push({
          id: category.id,
          title: category.name,
          progress,
          totalItems,
          completedItems
        });
      }

      return moduleProgress;
    } catch (error) {
      console.error('Error calculating local module progress:', error);
      return [];
    }
  },

  /**
   * Calculate progress for a specific category from localStorage
   */
  async calculateLocalCategoryProgress(categoryId: string): Promise<number> {
    try {
      // Get total items in category
      const { data: contentItems } = await supabase
        .from('content_items')
        .select('id')
        .eq('category_id', categoryId);

      const totalItems = contentItems?.length || 0;
      if (totalItems === 0) return 0;

      // Get unique content items the user has interacted with
      const localProgress = LocalStorageService.getLearningProgress(categoryId);
      const uniqueContentItems = new Set(
        localProgress
          .filter(p => p.contentItemId)
          .map(p => p.contentItemId)
      );
      const completedItems = uniqueContentItems.size;

      // Calculate and return percentage
      return Math.round((completedItems / totalItems) * 100);
    } catch (error) {
      console.error('Error calculating local category progress:', error);
      return 0;
    }
  },

  /**
   * Migrate local storage data to Supabase when user signs in
   */
  async migrateLocalToSupabase(userId: string): Promise<void> {
    try {
      const localData = LocalStorageService['getData'](); // Access private getData method
      
      // Migrate learning progress
      for (const progress of localData.learningProgress) {
        await LearningProgressService.trackProgress(
          progress.categoryId,
          progress.contentItemId,
          progress.actionType as LearningProgressAction
        );
      }

      // Migrate game sessions (handled by GameProgressService already)
      // Migrate achievements (handled by AchievementService already)
      
      // Clear local data after successful migration
      LocalStorageService.clearAllData();
      
      console.log('Successfully migrated local data to Supabase');
    } catch (error) {
      console.error('Error migrating local data to Supabase:', error);
      // Don't clear local data if migration failed
    }
  }
};
