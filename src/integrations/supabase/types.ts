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
      admin_roles: {
        Row: {
          created_at: string
          granted_at: string
          granted_by: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      brand_mentions: {
        Row: {
          brand_name: string
          confidence_score: number | null
          created_at: string
          id: string
          mention_text: string
          mentioned_at: string
          platform: string
          sentiment: string | null
          sentiment_score: number | null
          site_priority: number | null
          source_domain: string | null
          url: string | null
          user_id: string
        }
        Insert: {
          brand_name: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          mention_text: string
          mentioned_at: string
          platform: string
          sentiment?: string | null
          sentiment_score?: number | null
          site_priority?: number | null
          source_domain?: string | null
          url?: string | null
          user_id: string
        }
        Update: {
          brand_name?: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          mention_text?: string
          mentioned_at?: string
          platform?: string
          sentiment?: string | null
          sentiment_score?: number | null
          site_priority?: number | null
          source_domain?: string | null
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      campaign_analytics: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          metric_date: string
          metric_name: string
          metric_value: number
          platform: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          metric_date?: string
          metric_name: string
          metric_value: number
          platform?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          metric_date?: string
          metric_name?: string
          metric_value?: number
          platform?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_content: {
        Row: {
          campaign_id: string
          content_text: string | null
          content_type: string
          created_at: string
          id: string
          media_url: string | null
          platform: string | null
          scheduled_for: string | null
          status: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          content_text?: string | null
          content_type: string
          created_at?: string
          id?: string
          media_url?: string | null
          platform?: string | null
          scheduled_for?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          content_text?: string | null
          content_type?: string
          created_at?: string
          id?: string
          media_url?: string | null
          platform?: string | null
          scheduled_for?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_content_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_emails: {
        Row: {
          campaign_id: string
          clicked_at: string | null
          created_at: string
          email_template_id: string | null
          error_message: string | null
          html_content: string
          id: string
          opened_at: string | null
          recipient_email: string
          recipient_name: string | null
          scheduled_for: string | null
          sent_at: string | null
          status: string
          subject: string
          text_content: string | null
          updated_at: string
        }
        Insert: {
          campaign_id: string
          clicked_at?: string | null
          created_at?: string
          email_template_id?: string | null
          error_message?: string | null
          html_content: string
          id?: string
          opened_at?: string | null
          recipient_email: string
          recipient_name?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          text_content?: string | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          clicked_at?: string | null
          created_at?: string
          email_template_id?: string | null
          error_message?: string | null
          html_content?: string
          id?: string
          opened_at?: string | null
          recipient_email?: string
          recipient_name?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          text_content?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_emails_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_emails_email_template_id_fkey"
            columns: ["email_template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_generated_content: {
        Row: {
          campaign_id: string
          content_text: string | null
          content_type: string
          created_at: string
          generated_prompt: string | null
          id: string
          media_type: string
          media_url: string | null
          platform: string
          status: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          content_text?: string | null
          content_type: string
          created_at?: string
          generated_prompt?: string | null
          id?: string
          media_type: string
          media_url?: string | null
          platform: string
          status?: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          content_text?: string | null
          content_type?: string
          created_at?: string
          generated_prompt?: string | null
          id?: string
          media_type?: string
          media_url?: string | null
          platform?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_generated_content_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          brand_name: string | null
          budget: number | null
          campaign_goals: string[] | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          start_date: string | null
          status: string
          target_audience: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_name?: string | null
          budget?: number | null
          campaign_goals?: string[] | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string
          target_audience?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_name?: string | null
          budget?: number | null
          campaign_goals?: string[] | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string
          target_audience?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          html_content: string
          id: string
          name: string
          subject: string
          text_content: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          html_content: string
          id?: string
          name: string
          subject: string
          text_content?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          html_content?: string
          id?: string
          name?: string
          subject?: string
          text_content?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      google_trends_data: {
        Row: {
          created_at: string
          geo_location: string | null
          id: string
          interest_score: number
          keyword: string
          time_period: string | null
          trend_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          geo_location?: string | null
          id?: string
          interest_score: number
          keyword: string
          time_period?: string | null
          trend_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          geo_location?: string | null
          id?: string
          interest_score?: number
          keyword?: string
          time_period?: string | null
          trend_date?: string
          user_id?: string
        }
        Relationships: []
      }
      monitored_terms: {
        Row: {
          created_at: string
          id: string
          term: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          term: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          term?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_priorities: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          priority_score: number
          site_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          priority_score?: number
          site_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          priority_score?: number
          site_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      social_connections: {
        Row: {
          access_token: string | null
          account_id: string | null
          account_name: string | null
          connected_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_connected: boolean
          platform: string
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          account_id?: string | null
          account_name?: string | null
          connected_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_connected?: boolean
          platform: string
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          account_id?: string | null
          account_name?: string | null
          connected_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_connected?: boolean
          platform?: string
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      suggested_campaigns: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          description: string
          id: string
          is_active: boolean
          priority: number | null
          suggested_goals: string[] | null
          target_audience: string | null
          template_content: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          is_active?: boolean
          priority?: number | null
          suggested_goals?: string[] | null
          target_audience?: string | null
          template_content?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          is_active?: boolean
          priority?: number | null
          suggested_goals?: string[] | null
          target_audience?: string | null
          template_content?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_campaign_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string
          assigned_to_user_id: string
          assignment_notes: string | null
          campaign_id: string
          completed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          assigned_to_user_id: string
          assignment_notes?: string | null
          campaign_id: string
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          assigned_to_user_id?: string
          assignment_notes?: string | null
          campaign_id?: string
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_campaign_assignments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
