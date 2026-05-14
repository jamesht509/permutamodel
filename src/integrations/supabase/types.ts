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
      achievements: {
        Row: {
          achievement_type: string
          id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_type: string
          id?: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_type?: string
          id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          applicant_id: string
          casting_id: string
          created_at: string | null
          id: string
          message: string | null
          status: Database["public"]["Enums"]["application_status"]
        }
        Insert: {
          applicant_id: string
          casting_id: string
          created_at?: string | null
          id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["application_status"]
        }
        Update: {
          applicant_id?: string
          casting_id?: string
          created_at?: string | null
          id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["application_status"]
        }
        Relationships: [
          {
            foreignKeyName: "applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_casting_id_fkey"
            columns: ["casting_id"]
            isOneToOne: false
            referencedRelation: "casting_calls"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_users_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_users_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      casting_calls: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          creator_id: string
          description: string
          duration: string | null
          expires_at: string | null
          featured: boolean | null
          filled_slots: number | null
          id: string
          is_approved: boolean | null
          is_flexible_date: boolean | null
          is_indoor: boolean | null
          lat: number | null
          lng: number | null
          location: string | null
          moodboard_urls: string[] | null
          proposed_date: string | null
          proposed_time: string | null
          requirements: string | null
          slots: number
          status: Database["public"]["Enums"]["casting_status"]
          styles: string[]
          title: string
          transport: string | null
          type_needed: string[]
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          creator_id: string
          description: string
          duration?: string | null
          expires_at?: string | null
          featured?: boolean | null
          filled_slots?: number | null
          id?: string
          is_approved?: boolean | null
          is_flexible_date?: boolean | null
          is_indoor?: boolean | null
          lat?: number | null
          lng?: number | null
          location?: string | null
          moodboard_urls?: string[] | null
          proposed_date?: string | null
          proposed_time?: string | null
          requirements?: string | null
          slots?: number
          status?: Database["public"]["Enums"]["casting_status"]
          styles?: string[]
          title: string
          transport?: string | null
          type_needed?: string[]
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          creator_id?: string
          description?: string
          duration?: string | null
          expires_at?: string | null
          featured?: boolean | null
          filled_slots?: number | null
          id?: string
          is_approved?: boolean | null
          is_flexible_date?: boolean | null
          is_indoor?: boolean | null
          lat?: number | null
          lng?: number | null
          location?: string | null
          moodboard_urls?: string[] | null
          proposed_date?: string | null
          proposed_time?: string | null
          requirements?: string | null
          slots?: number
          status?: Database["public"]["Enums"]["casting_status"]
          styles?: string[]
          title?: string
          transport?: string | null
          type_needed?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "casting_calls_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          is_archived_user1: boolean | null
          is_archived_user2: boolean | null
          last_message_at: string | null
          last_message_preview: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_archived_user1?: boolean | null
          is_archived_user2?: boolean | null
          last_message_at?: string | null
          last_message_preview?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_archived_user1?: boolean | null
          is_archived_user2?: boolean | null
          last_message_at?: string | null
          last_message_preview?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string
          relationship: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone: string
          relationship?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string
          relationship?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          favorited_user_id: string
          folder: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          favorited_user_id: string
          folder?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          favorited_user_id?: string
          folder?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_favorited_user_id_fkey"
            columns: ["favorited_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          created_at: string | null
          id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          read_at: string | null
          sender_id: string
          type: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          read_at?: string | null
          sender_id: string
          type?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          read_at?: string | null
          sender_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          data: Json | null
          id: string
          kind: string | null
          params: Json | null
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          kind?: string | null
          params?: Json | null
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          kind?: string | null
          params?: Json | null
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          photo_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          photo_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          photo_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_comments_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_likes: {
        Row: {
          created_at: string | null
          id: string
          photo_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          photo_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          photo_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_likes_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          comments_count: number | null
          created_at: string | null
          credits_user_id: string | null
          id: string
          is_cover: boolean | null
          is_nsfw: boolean | null
          likes_count: number | null
          position: number
          style: string | null
          thumbnail_url: string | null
          title: string | null
          url: string
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          created_at?: string | null
          credits_user_id?: string | null
          id?: string
          is_cover?: boolean | null
          is_nsfw?: boolean | null
          likes_count?: number | null
          position?: number
          style?: string | null
          thumbnail_url?: string | null
          title?: string | null
          url: string
          user_id: string
        }
        Update: {
          comments_count?: number | null
          created_at?: string | null
          credits_user_id?: string | null
          id?: string
          is_cover?: boolean | null
          is_nsfw?: boolean | null
          likes_count?: number | null
          position?: number
          style?: string | null
          thumbnail_url?: string | null
          title?: string | null
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photos_credits_user_id_fkey"
            columns: ["credits_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          availability: Json | null
          availability_note: string | null
          available_now: boolean | null
          available_until: string | null
          avatar_url: string | null
          bio: string | null
          browser: string | null
          city: string | null
          country: string | null
          created_at: string | null
          dark_mode: boolean | null
          device_type: string | null
          distance_radius: number | null
          email: string
          equipment: string[] | null
          has_studio: boolean | null
          hide_distance: boolean | null
          id: string
          instagram: string | null
          is_active: boolean | null
          is_banned: boolean | null
          is_seed: boolean | null
          languages: string[] | null
          last_active: string | null
          last_known_city: string | null
          last_known_country: string | null
          last_login_at: string | null
          last_reengagement_email_at: string | null
          lat: number | null
          lng: number | null
          location_updated_at: string | null
          login_count: number | null
          measurements: Json | null
          name: string
          notification_prefs: Json | null
          onboarding_completed: boolean | null
          plan: Database["public"]["Enums"]["user_plan"]
          private_mode: boolean | null
          push_notifications_enabled: boolean | null
          rating_avg: number | null
          request_preference: string | null
          role: Database["public"]["Enums"]["user_role"]
          show_online_status: boolean | null
          signup_city: string | null
          signup_country: string | null
          signup_ip: string | null
          signup_region: string | null
          signup_source: string | null
          state: string | null
          styles: string[] | null
          total_reviews: number | null
          total_sessions: number | null
          updated_at: string | null
          user_level: Database["public"]["Enums"]["user_level"]
          verified_level: Database["public"]["Enums"]["verified_level"]
          website: string | null
          zip: string | null
        }
        Insert: {
          availability?: Json | null
          availability_note?: string | null
          available_now?: boolean | null
          available_until?: string | null
          avatar_url?: string | null
          bio?: string | null
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          dark_mode?: boolean | null
          device_type?: string | null
          distance_radius?: number | null
          email: string
          equipment?: string[] | null
          has_studio?: boolean | null
          hide_distance?: boolean | null
          id: string
          instagram?: string | null
          is_active?: boolean | null
          is_banned?: boolean | null
          is_seed?: boolean | null
          languages?: string[] | null
          last_active?: string | null
          last_known_city?: string | null
          last_known_country?: string | null
          last_login_at?: string | null
          last_reengagement_email_at?: string | null
          lat?: number | null
          lng?: number | null
          location_updated_at?: string | null
          login_count?: number | null
          measurements?: Json | null
          name: string
          notification_prefs?: Json | null
          onboarding_completed?: boolean | null
          plan?: Database["public"]["Enums"]["user_plan"]
          private_mode?: boolean | null
          push_notifications_enabled?: boolean | null
          rating_avg?: number | null
          request_preference?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          show_online_status?: boolean | null
          signup_city?: string | null
          signup_country?: string | null
          signup_ip?: string | null
          signup_region?: string | null
          signup_source?: string | null
          state?: string | null
          styles?: string[] | null
          total_reviews?: number | null
          total_sessions?: number | null
          updated_at?: string | null
          user_level?: Database["public"]["Enums"]["user_level"]
          verified_level?: Database["public"]["Enums"]["verified_level"]
          website?: string | null
          zip?: string | null
        }
        Update: {
          availability?: Json | null
          availability_note?: string | null
          available_now?: boolean | null
          available_until?: string | null
          avatar_url?: string | null
          bio?: string | null
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          dark_mode?: boolean | null
          device_type?: string | null
          distance_radius?: number | null
          email?: string
          equipment?: string[] | null
          has_studio?: boolean | null
          hide_distance?: boolean | null
          id?: string
          instagram?: string | null
          is_active?: boolean | null
          is_banned?: boolean | null
          is_seed?: boolean | null
          languages?: string[] | null
          last_active?: string | null
          last_known_city?: string | null
          last_known_country?: string | null
          last_login_at?: string | null
          last_reengagement_email_at?: string | null
          lat?: number | null
          lng?: number | null
          location_updated_at?: string | null
          login_count?: number | null
          measurements?: Json | null
          name?: string
          notification_prefs?: Json | null
          onboarding_completed?: boolean | null
          plan?: Database["public"]["Enums"]["user_plan"]
          private_mode?: boolean | null
          push_notifications_enabled?: boolean | null
          rating_avg?: number | null
          request_preference?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          show_online_status?: boolean | null
          signup_city?: string | null
          signup_country?: string | null
          signup_ip?: string | null
          signup_region?: string | null
          signup_source?: string | null
          state?: string | null
          styles?: string[] | null
          total_reviews?: number | null
          total_sessions?: number | null
          updated_at?: string | null
          user_level?: Database["public"]["Enums"]["user_level"]
          verified_level?: Database["public"]["Enums"]["verified_level"]
          website?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          admin_notes: string | null
          category: Database["public"]["Enums"]["report_category"]
          created_at: string | null
          description: string | null
          evidence_urls: string[] | null
          id: string
          reported_id: string
          reporter_id: string
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          admin_notes?: string | null
          category: Database["public"]["Enums"]["report_category"]
          created_at?: string | null
          description?: string | null
          evidence_urls?: string[] | null
          id?: string
          reported_id: string
          reporter_id: string
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          admin_notes?: string | null
          category?: Database["public"]["Enums"]["report_category"]
          created_at?: string | null
          description?: string | null
          evidence_urls?: string[] | null
          id?: string
          reported_id?: string
          reporter_id?: string
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_id_fkey"
            columns: ["reported_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          communication: number | null
          created_at: string | null
          creativity: number | null
          id: string
          is_visible: boolean | null
          overall_rating: number | null
          professionalism: number | null
          punctuality: number | null
          result_quality: number | null
          reviewed_id: string
          reviewer_id: string
          session_id: string
          would_work_again: string | null
        }
        Insert: {
          comment?: string | null
          communication?: number | null
          created_at?: string | null
          creativity?: number | null
          id?: string
          is_visible?: boolean | null
          overall_rating?: number | null
          professionalism?: number | null
          punctuality?: number | null
          result_quality?: number | null
          reviewed_id: string
          reviewer_id: string
          session_id: string
          would_work_again?: string | null
        }
        Update: {
          comment?: string | null
          communication?: number | null
          created_at?: string | null
          creativity?: number | null
          id?: string
          is_visible?: boolean | null
          overall_rating?: number | null
          professionalism?: number | null
          punctuality?: number | null
          result_quality?: number | null
          reviewed_id?: string
          reviewer_id?: string
          session_id?: string
          would_work_again?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_reviewed_id_fkey"
            columns: ["reviewed_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          cancel_reason: string | null
          cancelled_by: string | null
          checkin_model: string | null
          checkin_photographer: string | null
          checkout_time: string | null
          created_at: string | null
          date: string
          duration: string | null
          id: string
          lat: number | null
          lng: number | null
          location: string | null
          model_id: string
          photographer_id: string
          request_id: string | null
          status: Database["public"]["Enums"]["session_status"]
          time: string | null
        }
        Insert: {
          cancel_reason?: string | null
          cancelled_by?: string | null
          checkin_model?: string | null
          checkin_photographer?: string | null
          checkout_time?: string | null
          created_at?: string | null
          date: string
          duration?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          location?: string | null
          model_id: string
          photographer_id: string
          request_id?: string | null
          status?: Database["public"]["Enums"]["session_status"]
          time?: string | null
        }
        Update: {
          cancel_reason?: string | null
          cancelled_by?: string | null
          checkin_model?: string | null
          checkin_photographer?: string | null
          checkout_time?: string | null
          created_at?: string | null
          date?: string
          duration?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          location?: string | null
          model_id?: string
          photographer_id?: string
          request_id?: string | null
          status?: Database["public"]["Enums"]["session_status"]
          time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "tfp_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_galleries: {
        Row: {
          created_at: string | null
          id: string
          model_id: string
          photographer_id: string
          photos: Json | null
          session_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          model_id: string
          photographer_id: string
          photos?: Json | null
          session_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          model_id?: string
          photographer_id?: string
          photos?: Json | null
          session_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_galleries_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_galleries_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_galleries_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      tfp_requests: {
        Row: {
          created_at: string | null
          duration: string | null
          id: string
          message: string | null
          proposed_date: string | null
          proposed_location: string | null
          proposed_time: string | null
          receiver_id: string
          sender_id: string
          session_id: string | null
          status: Database["public"]["Enums"]["request_status"]
          style: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration?: string | null
          id?: string
          message?: string | null
          proposed_date?: string | null
          proposed_location?: string | null
          proposed_time?: string | null
          receiver_id: string
          sender_id: string
          session_id?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          style?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration?: string | null
          id?: string
          message?: string | null
          proposed_date?: string | null
          proposed_location?: string | null
          proposed_time?: string | null
          receiver_id?: string
          sender_id?: string
          session_id?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          style?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tfp_requests_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tfp_requests_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tfp_requests_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      check_availability_expiration: { Args: never; Returns: undefined }
      get_profiles_within_radius: {
        Args: { radius_km: number; user_lat: number; user_lng: number }
        Returns: {
          distance: number
          id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_blocked: { Args: { user1: string; user2: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      application_status: "pending" | "accepted" | "declined"
      casting_status: "open" | "filled" | "expired" | "cancelled"
      report_category:
        | "harassment"
        | "fake_profile"
        | "noshow"
        | "inappropriate"
        | "spam"
        | "other"
      report_status: "pending" | "reviewed" | "resolved" | "dismissed"
      request_status: "pending" | "accepted" | "declined" | "counter"
      session_status:
        | "pending"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "noshow"
      user_level:
        | "newcomer"
        | "starter"
        | "rising"
        | "established"
        | "elite"
        | "legend"
      user_plan: "free" | "premium" | "pro"
      user_role: "photographer" | "model" | "creative" | "dual"
      verified_level: "none" | "email" | "phone" | "identity"
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
      app_role: ["admin", "moderator", "user"],
      application_status: ["pending", "accepted", "declined"],
      casting_status: ["open", "filled", "expired", "cancelled"],
      report_category: [
        "harassment",
        "fake_profile",
        "noshow",
        "inappropriate",
        "spam",
        "other",
      ],
      report_status: ["pending", "reviewed", "resolved", "dismissed"],
      request_status: ["pending", "accepted", "declined", "counter"],
      session_status: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "noshow",
      ],
      user_level: [
        "newcomer",
        "starter",
        "rising",
        "established",
        "elite",
        "legend",
      ],
      user_plan: ["free", "premium", "pro"],
      user_role: ["photographer", "model", "creative", "dual"],
      verified_level: ["none", "email", "phone", "identity"],
    },
  },
} as const
