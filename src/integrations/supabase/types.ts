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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      account_recovery_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          evidence_description: string | null
          id: string
          request_type: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          evidence_description?: string | null
          id?: string
          request_type: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          evidence_description?: string | null
          id?: string
          request_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_messages: {
        Row: {
          created_at: string | null
          id: string
          is_broadcast: boolean | null
          is_read: boolean | null
          message: string
          recipient_id: string | null
          sender_id: string
          subject: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_broadcast?: boolean | null
          is_read?: boolean | null
          message: string
          recipient_id?: string | null
          sender_id: string
          subject: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_broadcast?: boolean | null
          is_read?: boolean | null
          message?: string
          recipient_id?: string | null
          sender_id?: string
          subject?: string
        }
        Relationships: []
      }
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
      asma_favorites: {
        Row: {
          asma_number: number
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          asma_number: number
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          asma_number?: number
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      audio_generation_log: {
        Row: {
          created_at: string | null
          id: string
          prophet_id: string | null
          text_length: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          prophet_id?: string | null
          text_length?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          prophet_id?: string | null
          text_length?: number | null
          user_id?: string
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
      blocked_users: {
        Row: {
          blocked_at: string | null
          blocked_by: string
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          blocked_at?: string | null
          blocked_by: string
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          blocked_at?: string | null
          blocked_by?: string
          id?: string
          reason?: string | null
          user_id?: string
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
      conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          participant_1: string
          participant_2: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participant_1: string
          participant_2: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participant_1?: string
          participant_2?: string
        }
        Relationships: []
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
      course_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string | null
          id: string
          progress: number | null
          student_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string | null
          id?: string
          progress?: number | null
          student_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string | null
          id?: string
          progress?: number | null
          student_id?: string
        }
        Relationships: []
      }
      course_lessons: {
        Row: {
          content: string | null
          course_id: string
          created_at: string | null
          id: string
          is_free: boolean | null
          order_index: number | null
          title: string
          updated_at: string | null
          video_duration: number | null
          video_url: string | null
        }
        Insert: {
          content?: string | null
          course_id: string
          created_at?: string | null
          id?: string
          is_free?: boolean | null
          order_index?: number | null
          title: string
          updated_at?: string | null
          video_duration?: number | null
          video_url?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string
          created_at?: string | null
          id?: string
          is_free?: boolean | null
          order_index?: number | null
          title?: string
          updated_at?: string | null
          video_duration?: number | null
          video_url?: string | null
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
      hadith_shares: {
        Row: {
          book_id: string
          created_at: string
          hadith_number: number
          id: string
          share_count: number
          updated_at: string
        }
        Insert: {
          book_id: string
          created_at?: string
          hadith_number: number
          id?: string
          share_count?: number
          updated_at?: string
        }
        Update: {
          book_id?: string
          created_at?: string
          hadith_number?: number
          id?: string
          share_count?: number
          updated_at?: string
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
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_history: {
        Row: {
          body: string | null
          created_at: string
          id: string
          notification_type: string
          read: boolean
          tag: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          notification_type?: string
          read?: boolean
          tag?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          notification_type?: string
          read?: boolean
          tag?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          body: string | null
          created_at: string
          error_message: string | null
          id: string
          notification_type: string
          sent_at: string | null
          status: string
          tag: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          notification_type?: string
          sent_at?: string | null
          status?: string
          tag?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          notification_type?: string
          sent_at?: string | null
          status?: string
          tag?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      otp_codes: {
        Row: {
          attempts: number
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          type: string
        }
        Insert: {
          attempts?: number
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          type?: string
        }
        Update: {
          attempts?: number
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          type?: string
        }
        Relationships: []
      }
      profile_changes_log: {
        Row: {
          change_type: string
          changed_at: string
          created_at: string
          id: string
          ip_address: string | null
          new_value: string | null
          old_value: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          change_type: string
          changed_at?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_value?: string | null
          old_value?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          change_type?: string
          changed_at?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_value?: string | null
          old_value?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city_name: string | null
          created_at: string | null
          display_name: string | null
          displayname_change_count: number | null
          email: string | null
          id: string
          is_blocked: boolean | null
          last_displayname_change: string | null
          last_username_change: string | null
          latitude: number | null
          longitude: number | null
          username: string | null
          username_change_count: number | null
        }
        Insert: {
          avatar_url?: string | null
          city_name?: string | null
          created_at?: string | null
          display_name?: string | null
          displayname_change_count?: number | null
          email?: string | null
          id: string
          is_blocked?: boolean | null
          last_displayname_change?: string | null
          last_username_change?: string | null
          latitude?: number | null
          longitude?: number | null
          username?: string | null
          username_change_count?: number | null
        }
        Update: {
          avatar_url?: string | null
          city_name?: string | null
          created_at?: string | null
          display_name?: string | null
          displayname_change_count?: number | null
          email?: string | null
          id?: string
          is_blocked?: boolean | null
          last_displayname_change?: string | null
          last_username_change?: string | null
          latitude?: number | null
          longitude?: number | null
          username?: string | null
          username_change_count?: number | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          fcm_token: string
          id: string
          is_active: boolean | null
          platform: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          fcm_token: string
          id?: string
          is_active?: boolean | null
          platform?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          fcm_token?: string
          id?: string
          is_active?: boolean | null
          platform?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json | null
          completed_at: string | null
          id: string
          passed: boolean | null
          quiz_id: string
          score: number | null
          started_at: string | null
          student_id: string
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          id?: string
          passed?: boolean | null
          quiz_id: string
          score?: number | null
          started_at?: string | null
          student_id: string
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          id?: string
          passed?: boolean | null
          quiz_id?: string
          score?: number | null
          started_at?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: string | null
          created_at: string | null
          id: string
          options: Json | null
          order_index: number | null
          points: number | null
          question: string
          question_type: string | null
          quiz_id: string
        }
        Insert: {
          correct_answer?: string | null
          created_at?: string | null
          id?: string
          options?: Json | null
          order_index?: number | null
          points?: number | null
          question: string
          question_type?: string | null
          quiz_id: string
        }
        Update: {
          correct_answer?: string | null
          created_at?: string | null
          id?: string
          options?: Json | null
          order_index?: number | null
          points?: number | null
          question?: string
          question_type?: string | null
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          course_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_published: boolean | null
          pass_score: number | null
          teacher_id: string
          time_limit: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          pass_score?: number | null
          teacher_id: string
          time_limit?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          pass_score?: number | null
          teacher_id?: string
          time_limit?: number | null
          title?: string
          updated_at?: string | null
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
      security_questions: {
        Row: {
          answer_1_hash: string
          answer_2_hash: string
          answer_3_hash: string | null
          created_at: string
          id: string
          question_1: string
          question_2: string
          question_3: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          answer_1_hash: string
          answer_2_hash: string
          answer_3_hash?: string | null
          created_at?: string
          id?: string
          question_1: string
          question_2: string
          question_3?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          answer_1_hash?: string
          answer_2_hash?: string
          answer_3_hash?: string | null
          created_at?: string
          id?: string
          question_1?: string
          question_2?: string
          question_3?: string | null
          updated_at?: string
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
      teacher_files: {
        Row: {
          course_id: string | null
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          teacher_id: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          teacher_id: string
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          teacher_id?: string
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
          selected_reciter: string | null
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
          selected_reciter?: string | null
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
          selected_reciter?: string | null
          selected_translation?: string | null
          show_translation?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          adhan_sound: string | null
          azkar_evening_enabled: boolean | null
          azkar_evening_time: string | null
          azkar_morning_enabled: boolean | null
          azkar_morning_time: string | null
          azkar_prayer_delay_minutes: number | null
          azkar_prayer_enabled: boolean | null
          azkar_sleep_enabled: boolean | null
          azkar_sleep_time: string | null
          azkar_wakeup_enabled: boolean | null
          azkar_wakeup_time: string | null
          city_name: string | null
          created_at: string | null
          daily_wird_enabled: boolean | null
          daily_wird_time: string | null
          dark_mode: boolean | null
          id: string
          latitude: number | null
          longitude: number | null
          notifications_enabled: boolean | null
          prayer_asr_enabled: boolean | null
          prayer_dhuhr_enabled: boolean | null
          prayer_fajr_enabled: boolean | null
          prayer_isha_enabled: boolean | null
          prayer_maghrib_enabled: boolean | null
          prayer_method: number | null
          prayer_reminder_minutes: number | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          adhan_sound?: string | null
          azkar_evening_enabled?: boolean | null
          azkar_evening_time?: string | null
          azkar_morning_enabled?: boolean | null
          azkar_morning_time?: string | null
          azkar_prayer_delay_minutes?: number | null
          azkar_prayer_enabled?: boolean | null
          azkar_sleep_enabled?: boolean | null
          azkar_sleep_time?: string | null
          azkar_wakeup_enabled?: boolean | null
          azkar_wakeup_time?: string | null
          city_name?: string | null
          created_at?: string | null
          daily_wird_enabled?: boolean | null
          daily_wird_time?: string | null
          dark_mode?: boolean | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          notifications_enabled?: boolean | null
          prayer_asr_enabled?: boolean | null
          prayer_dhuhr_enabled?: boolean | null
          prayer_fajr_enabled?: boolean | null
          prayer_isha_enabled?: boolean | null
          prayer_maghrib_enabled?: boolean | null
          prayer_method?: number | null
          prayer_reminder_minutes?: number | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          adhan_sound?: string | null
          azkar_evening_enabled?: boolean | null
          azkar_evening_time?: string | null
          azkar_morning_enabled?: boolean | null
          azkar_morning_time?: string | null
          azkar_prayer_delay_minutes?: number | null
          azkar_prayer_enabled?: boolean | null
          azkar_sleep_enabled?: boolean | null
          azkar_sleep_time?: string | null
          azkar_wakeup_enabled?: boolean | null
          azkar_wakeup_time?: string | null
          city_name?: string | null
          created_at?: string | null
          daily_wird_enabled?: boolean | null
          daily_wird_time?: string | null
          dark_mode?: boolean | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          notifications_enabled?: boolean | null
          prayer_asr_enabled?: boolean | null
          prayer_dhuhr_enabled?: boolean | null
          prayer_fajr_enabled?: boolean | null
          prayer_isha_enabled?: boolean | null
          prayer_maghrib_enabled?: boolean | null
          prayer_method?: number | null
          prayer_reminder_minutes?: number | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_story_preferences: {
        Row: {
          created_at: string
          id: string
          preferred_language: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          preferred_language?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          preferred_language?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_otps: { Args: never; Returns: undefined }
      generate_invite_code: { Args: never; Returns: string }
      get_khatmah_invite_code: {
        Args: { p_khatmah_id: string }
        Returns: string
      }
      get_usage_stats: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_hadith_share: {
        Args: { p_book_id: string; p_hadith_number: number }
        Returns: number
      }
      is_username_taken: { Args: { p_username: string }; Returns: boolean }
      join_khatmah_by_code: { Args: { p_invite_code: string }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
