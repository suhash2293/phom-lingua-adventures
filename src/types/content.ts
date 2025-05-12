
export type Category = {
  id: string;
  name: string;
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
