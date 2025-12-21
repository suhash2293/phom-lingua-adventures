
export type Category = {
  id: string;
  name: string;
  phom_name: string | null;
  title_audio_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type ContentItem = {
  id: string;
  category_id: string;
  phom_word: string;
  english_translation: string;
  example_sentence: string | null;
  audio_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type AudioFile = {
  id: string;
  content_item_id: string | null;
  filename: string;
  storage_path: string;
  file_size: number | null;
  duration_seconds: number | null;
  created_at: string;
  updated_at: string;
};

// Add custom types for our database schema to fix the TypeScript errors with Supabase
export type Database = {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>;
      };
      content_items: {
        Row: ContentItem;
        Insert: Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>>;
      };
      audio_files: {
        Row: AudioFile;
        Insert: Omit<AudioFile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AudioFile, 'id' | 'created_at' | 'updated_at'>>;
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          is_admin?: boolean;
        };
        Update: Partial<{
          email?: string | null;
          is_admin?: boolean;
        }>;
      };
    };
    Views: {};
    Functions: {
      is_admin: {
        Args: { user_id: string };
        Returns: boolean;
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
};
