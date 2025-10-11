export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      account_deletion_requests: {
        Row: {
          created_at: string
          deletion_method: string
          deletion_scheduled_at: string
          id: string
          reason: string | null
          requested_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deletion_method: string
          deletion_scheduled_at?: string
          id?: string
          reason?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deletion_method?: string
          deletion_scheduled_at?: string
          id?: string
          reason?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      achievements: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: []
      }
      audio_files: {
        Row: {
          content_item_id: string | null
          created_at: string
          duration_seconds: number | null
          file_size: number | null
          filename: string
          id: string
          storage_path: string
          updated_at: string
        }
        Insert: {
          content_item_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          file_size?: number | null
          filename: string
          id?: string
          storage_path: string
          updated_at?: string
        }
        Update: {
          content_item_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          file_size?: number | null
          filename?: string
          id?: string
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audio_files_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_items: {
        Row: {
          audio_url: string | null
          category_id: string
          created_at: string
          english_translation: string
          example_sentence: string | null
          id: string
          phom_word: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          audio_url?: string | null
          category_id: string
          created_at?: string
          english_translation: string
          example_sentence?: string | null
          id?: string
          phom_word: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          audio_url?: string | null
          category_id?: string
          created_at?: string
          english_translation?: string
          example_sentence?: string | null
          id?: string
          phom_word?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number
          created_at: string
          currency: string
          google_play_transaction_id: string | null
          id: string
          purchase_token: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          google_play_transaction_id?: string | null
          id?: string
          purchase_token?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          google_play_transaction_id?: string | null
          id?: string
          purchase_token?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      email_verifications: {
        Row: {
          attempts: number
          created_at: string
          email: string
          expires_at: string
          id: string
          pin_hash: string
          verified: boolean
        }
        Insert: {
          attempts?: number
          created_at?: string
          email: string
          expires_at: string
          id?: string
          pin_hash: string
          verified?: boolean
        }
        Update: {
          attempts?: number
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          pin_hash?: string
          verified?: boolean
        }
        Relationships: []
      }
      game_sessions: {
        Row: {
          category_id: string | null
          created_at: string
          duration_seconds: number
          game_type: string
          id: string
          score: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          duration_seconds?: number
          game_type: string
          id?: string
          score?: number
          user_id: string
          xp_earned?: number
        }
        Update: {
          category_id?: string | null
          created_at?: string
          duration_seconds?: number
          game_type?: string
          id?: string
          score?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_progress: {
        Row: {
          action_type: string
          category_id: string
          content_item_id: string | null
          created_at: string
          id: string
          progress_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          action_type: string
          category_id: string
          content_item_id?: string | null
          created_at?: string
          id?: string
          progress_value?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          action_type?: string
          category_id?: string
          content_item_id?: string | null
          created_at?: string
          id?: string
          progress_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_progress_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_progress_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          method: string | null
          success: boolean | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          method?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          method?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mfa_recovery_codes: {
        Row: {
          code_hash: string
          created_at: string | null
          id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          code_hash: string
          created_at?: string | null
          id?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          code_hash?: string
          created_at?: string | null
          id?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mfa_settings: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          email_enabled: boolean | null
          id: string
          sms_enabled: boolean | null
          totp_enabled: boolean | null
          updated_at: string | null
          user_id: string
          webauthn_enabled: boolean | null
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          sms_enabled?: boolean | null
          totp_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
          webauthn_enabled?: boolean | null
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          sms_enabled?: boolean | null
          totp_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
          webauthn_enabled?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          email_verified: boolean
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          email_verified?: boolean
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          email_verified?: boolean
          id?: string
        }
        Relationships: []
      }
      region_restrictions: {
        Row: {
          country_code: string
          created_at: string
          feature_restrictions: Json | null
          id: string
          is_allowed: boolean
          updated_at: string
        }
        Insert: {
          country_code: string
          created_at?: string
          feature_restrictions?: Json | null
          id?: string
          is_allowed?: boolean
          updated_at?: string
        }
        Update: {
          country_code?: string
          created_at?: string
          feature_restrictions?: Json | null
          id?: string
          is_allowed?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      trusted_devices: {
        Row: {
          created_at: string | null
          device_fingerprint: string
          device_name: string | null
          expires_at: string | null
          id: string
          last_used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_fingerprint: string
          device_name?: string | null
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string
          device_name?: string | null
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_played_at: string | null
          level: number
          max_streak: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_played_at?: string | null
          level?: number
          max_streak?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_played_at?: string | null
          level?: number
          max_streak?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_category_progress: {
        Args: { category_uuid: string; user_uuid: string }
        Returns: number
      }
      check_table_exists: {
        Args: { table_name: string }
        Returns: {
          table_exists: boolean
        }[]
      }
      cleanup_expired_pins: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_user_account: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      generate_recovery_codes: {
        Args: { target_user_id: string }
        Returns: string[]
      }
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_current_user: {
        Args: { user_id: string }
        Returns: boolean
      }
      verify_recovery_code: {
        Args: { recovery_code: string; target_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
