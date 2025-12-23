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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: string | null
        }
        Relationships: []
      }
      azkar: {
        Row: {
          category_id: string | null
          created_at: string
          display_order: number | null
          id: string
          reference: string | null
          repeat_count: number | null
          text: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          reference?: string | null
          repeat_count?: number | null
          text: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          reference?: string | null
          repeat_count?: number | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "azkar_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "azkar_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      azkar_categories: {
        Row: {
          created_at: string
          display_order: number | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      cities: {
        Row: {
          country_id: string | null
          id: string
          latitude: number
          longitude: number
          name_ar: string
          name_en: string
        }
        Insert: {
          country_id?: string | null
          id?: string
          latitude: number
          longitude: number
          name_ar: string
          name_en: string
        }
        Update: {
          country_id?: string | null
          id?: string
          latitude?: number
          longitude?: number
          name_ar?: string
          name_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          code: string
          id: string
          name_ar: string
          name_en: string
        }
        Insert: {
          code: string
          id?: string
          name_ar: string
          name_en: string
        }
        Update: {
          code?: string
          id?: string
          name_ar?: string
          name_en?: string
        }
        Relationships: []
      }
      daily_wird: {
        Row: {
          completed_pages: number | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          target_date: string | null
          target_pages: number | null
          user_id: string
        }
        Insert: {
          completed_pages?: number | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          target_date?: string | null
          target_pages?: number | null
          user_id: string
        }
        Update: {
          completed_pages?: number | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          target_date?: string | null
          target_pages?: number | null
          user_id?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          ayah_number: number
          ayah_text: string
          created_at: string
          id: string
          surah_name: string
          surah_number: number
          user_id: string
        }
        Insert: {
          ayah_number: number
          ayah_text: string
          created_at?: string
          id?: string
          surah_name: string
          surah_number: number
          user_id: string
        }
        Update: {
          ayah_number?: number
          ayah_text?: string
          created_at?: string
          id?: string
          surah_name?: string
          surah_number?: number
          user_id?: string
        }
        Relationships: []
      }
      khatmah_participants: {
        Row: {
          assigned_juz: number
          completed_at: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          khatmah_id: string
          user_id: string
        }
        Insert: {
          assigned_juz: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          khatmah_id: string
          user_id: string
        }
        Update: {
          assigned_juz?: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          khatmah_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "khatmah_participants_khatmah_id_fkey"
            columns: ["khatmah_id"]
            isOneToOne: false
            referencedRelation: "khatmahs"
            referencedColumns: ["id"]
          },
        ]
      }
      khatmahs: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          invite_code: string
          is_completed: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          invite_code: string
          is_completed?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          invite_code?: string
          is_completed?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city_name: string | null
          created_at: string | null
          id: string
          latitude: number | null
          longitude: number | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          city_name?: string | null
          created_at?: string | null
          id: string
          latitude?: number | null
          longitude?: number | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          city_name?: string | null
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          username?: string | null
        }
        Relationships: []
      }
      reading_progress: {
        Row: {
          ayah_number: number
          created_at: string | null
          id: string
          last_read_at: string | null
          progress_percentage: number | null
          surah_name: string
          surah_number: number
          user_id: string
        }
        Insert: {
          ayah_number: number
          created_at?: string | null
          id?: string
          last_read_at?: string | null
          progress_percentage?: number | null
          surah_name: string
          surah_number: number
          user_id: string
        }
        Update: {
          ayah_number?: number
          created_at?: string | null
          id?: string
          last_read_at?: string | null
          progress_percentage?: number | null
          surah_name?: string
          surah_number?: number
          user_id?: string
        }
        Relationships: []
      }
      reading_sessions: {
        Row: {
          created_at: string
          duration_minutes: number | null
          end_page: number
          id: string
          session_date: string
          start_page: number
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          end_page: number
          id?: string
          session_date?: string
          start_page: number
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          end_page?: number
          id?: string
          session_date?: string
          start_page?: number
          user_id?: string
        }
        Relationships: []
      }
      tasbih_stats: {
        Row: {
          count: number | null
          created_at: string | null
          dhikr_type: string | null
          id: string
          session_date: string | null
          user_id: string
        }
        Insert: {
          count?: number | null
          created_at?: string | null
          dhikr_type?: string | null
          id?: string
          session_date?: string | null
          user_id: string
        }
        Update: {
          count?: number | null
          created_at?: string | null
          dhikr_type?: string | null
          id?: string
          session_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_azkar_progress: {
        Row: {
          azkar_id: string | null
          completed_count: number | null
          created_at: string
          id: string
          progress_date: string | null
          user_id: string
        }
        Insert: {
          azkar_id?: string | null
          completed_count?: number | null
          created_at?: string
          id?: string
          progress_date?: string | null
          user_id: string
        }
        Update: {
          azkar_id?: string | null
          completed_count?: number | null
          created_at?: string
          id?: string
          progress_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_azkar_progress_azkar_id_fkey"
            columns: ["azkar_id"]
            isOneToOne: false
            referencedRelation: "azkar"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reading_settings: {
        Row: {
          created_at: string | null
          font_family: string | null
          font_size: number | null
          id: string
          line_height: number | null
          selected_translation: string | null
          show_translation: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          font_family?: string | null
          font_size?: number | null
          id?: string
          line_height?: number | null
          selected_translation?: string | null
          show_translation?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          font_family?: string | null
          font_size?: number | null
          id?: string
          line_height?: number | null
          selected_translation?: string | null
          show_translation?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          city_name: string | null
          created_at: string | null
          daily_wird_enabled: boolean | null
          daily_wird_time: string | null
          dark_mode: boolean | null
          id: string
          latitude: number | null
          longitude: number | null
          notifications_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          city_name?: string | null
          created_at?: string | null
          daily_wird_enabled?: boolean | null
          daily_wird_time?: string | null
          dark_mode?: boolean | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          notifications_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          city_name?: string | null
          created_at?: string | null
          daily_wird_enabled?: boolean | null
          daily_wird_time?: string | null
          dark_mode?: boolean | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          notifications_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invite_code: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
