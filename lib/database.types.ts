export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      case_studies: {
        Row: {
          channels: string | null
          content: string
          created_at: string
          excerpt: string
          featured_image: string | null
          featured_image_alt: string | null
          id: string
          industry: string
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          metrics: Json
          published_at: string | null
          seo: Json
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          channels?: string | null
          content: string
          created_at?: string
          excerpt: string
          featured_image?: string | null
          featured_image_alt?: string | null
          id?: string
          industry: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          metrics?: Json
          published_at?: string | null
          seo?: Json
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          channels?: string | null
          content?: string
          created_at?: string
          excerpt?: string
          featured_image?: string | null
          featured_image_alt?: string | null
          id?: string
          industry?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          metrics?: Json
          published_at?: string | null
          seo?: Json
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string
          handled: boolean
          id: string
          ip_hash: string | null
          message: string
          name: string
          service: string
        }
        Insert: {
          created_at?: string
          email: string
          handled?: boolean
          id?: string
          ip_hash?: string | null
          message: string
          name: string
          service: string
        }
        Update: {
          created_at?: string
          email?: string
          handled?: boolean
          id?: string
          ip_hash?: string | null
          message?: string
          name?: string
          service?: string
        }
        Relationships: []
      }
      page_content_drafts: {
        Row: {
          content: Json
          slug: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content: Json
          slug: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          slug?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      page_revisions: {
        Row: {
          created_at: string
          data: Json
          id: string
          part: string
          published_by: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          part: string
          published_by?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          part?: string
          published_by?: string | null
          slug?: string
        }
        Relationships: []
      }
      page_seo_drafts: {
        Row: {
          seo: Json
          slug: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          seo: Json
          slug: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          seo?: Json
          slug?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: Json | null
          content_published_at: string | null
          published_by: string | null
          seo: Json | null
          seo_published_at: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          content?: Json | null
          content_published_at?: string | null
          published_by?: string | null
          seo?: Json | null
          seo_published_at?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          content?: Json | null
          content_published_at?: string | null
          published_by?: string | null
          seo?: Json | null
          seo_published_at?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          category: string
          content: string
          created_at: string
          excerpt: string
          featured_image: string | null
          featured_image_alt: string | null
          id: string
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          published_at: string | null
          seo: Json
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          excerpt: string
          featured_image?: string | null
          featured_image_alt?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          published_at?: string | null
          seo?: Json
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          excerpt?: string
          featured_image?: string | null
          featured_image_alt?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          published_at?: string | null
          seo?: Json
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      video_testimonials: {
        Row: {
          company: string | null
          created_at: string
          id: string
          name: string
          poster_image: string
          poster_image_alt: string
          published_at: string | null
          role: string | null
          sort_order: number
          status: string
          updated_at: string
          video_url: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          id?: string
          name: string
          poster_image: string
          poster_image_alt: string
          published_at?: string | null
          role?: string | null
          sort_order?: number
          status?: string
          updated_at?: string
          video_url: string
        }
        Update: {
          company?: string | null
          created_at?: string
          id?: string
          name?: string
          poster_image?: string
          poster_image_alt?: string
          published_at?: string | null
          role?: string | null
          sort_order?: number
          status?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_staff: { Args: { p_email: string; p_role: string }; Returns: string }
      can_edit_seo: { Args: never; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      list_staff: {
        Args: never
        Returns: {
          created_at: string
          email: string
          last_sign_in_at: string
          role: string
          user_id: string
        }[]
      }
      publish_page: {
        Args: { p_parts: string[]; p_slug: string }
        Returns: undefined
      }
      remove_staff: { Args: { p_user: string }; Returns: undefined }
      restore_page_revision: { Args: { p_id: string }; Returns: string }
      set_staff_role: {
        Args: { p_role: string; p_user: string }
        Returns: undefined
      }
      staff_role: { Args: never; Returns: string }
      submit_lead: {
        Args: { p_email: string; p_ip_hash?: string; p_message: string; p_name: string; p_service: string }
        Returns: undefined
      }
      update_case_study_seo: {
        Args: {
          p_id: string
          p_meta_description: string
          p_meta_keywords: string
          p_meta_title: string
          p_seo: Json
        }
        Returns: undefined
      }
      update_post_seo: {
        Args: {
          p_id: string
          p_meta_description: string
          p_meta_keywords: string
          p_meta_title: string
          p_seo: Json
        }
        Returns: undefined
      }
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
    Enums: {},
  },
} as const

