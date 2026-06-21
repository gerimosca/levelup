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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_key: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_key: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_key?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      affiliate_referrals: {
        Row: {
          affiliate_code: string | null
          affiliate_id: string
          commission_amount: number | null
          created_at: string | null
          currency: string | null
          customer_email: string
          customer_id: string | null
          event_data: Json | null
          event_type: string
          id: string
          referral_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          affiliate_code?: string | null
          affiliate_id: string
          commission_amount?: number | null
          created_at?: string | null
          currency?: string | null
          customer_email: string
          customer_id?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          referral_id: string
          status: string
          updated_at?: string | null
        }
        Update: {
          affiliate_code?: string | null
          affiliate_id?: string
          commission_amount?: number | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string
          customer_id?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          referral_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          category: string
          description: string | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          category: string
          description?: string | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          category?: string
          description?: string | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      attributes: {
        Row: {
          points: number
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          points?: number
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          points?: number
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      camp_structures: {
        Row: {
          built_at: string | null
          level: number
          structure_key: string
          user_id: string
        }
        Insert: {
          built_at?: string | null
          level?: number
          structure_key: string
          user_id: string
        }
        Update: {
          built_at?: string | null
          level?: number
          structure_key?: string
          user_id?: string
        }
        Relationships: []
      }
      challenge_members: {
        Row: {
          challenge_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_members_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          invite_code: string
          name: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          invite_code: string
          name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          invite_code?: string
          name?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          stripe_customer_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          stripe_customer_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          stripe_customer_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_event: {
        Row: {
          day_date: string
          event_key: string
          user_id: string
        }
        Insert: {
          day_date: string
          event_key: string
          user_id: string
        }
        Update: {
          day_date?: string
          event_key?: string
          user_id?: string
        }
        Relationships: []
      }
      discoveries: {
        Row: {
          discovery_key: string
          found_at: string | null
          user_id: string
        }
        Insert: {
          discovery_key: string
          found_at?: string | null
          user_id: string
        }
        Update: {
          discovery_key?: string
          found_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      enemy_state: {
        Row: {
          hp_current: number
          hp_max: number
          season_key: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          hp_current: number
          hp_max: number
          season_key: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          hp_current?: number
          hp_max?: number
          season_key?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      equipment: {
        Row: {
          equipped_slot: string | null
          item_key: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          equipped_slot?: string | null
          item_key: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          equipped_slot?: string | null
          item_key?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      expeditions: {
        Row: {
          active: boolean
          departed_at: string | null
          ready_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean
          departed_at?: string | null
          ready_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean
          departed_at?: string | null
          ready_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      habit_logs: {
        Row: {
          claimed_at: string | null
          created_at: string | null
          day_date: string
          habit_key: string
          id: string
          user_id: string
          value: number
          xp_awarded: number
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string | null
          day_date: string
          habit_key: string
          id?: string
          user_id: string
          value?: number
          xp_awarded?: number
        }
        Update: {
          claimed_at?: string | null
          created_at?: string | null
          day_date?: string
          habit_key?: string
          id?: string
          user_id?: string
          value?: number
          xp_awarded?: number
        }
        Relationships: []
      }
      inventory: {
        Row: {
          item_key: string
          qty: number
          user_id: string
        }
        Insert: {
          item_key: string
          qty?: number
          user_id: string
        }
        Update: {
          item_key?: string
          qty?: number
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          created_at: string | null
          day_date: string
          felt_text: string | null
          id: string
          learned_text: string | null
          mood: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          day_date: string
          felt_text?: string | null
          id?: string
          learned_text?: string | null
          mood?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          day_date?: string
          felt_text?: string | null
          id?: string
          learned_text?: string | null
          mood?: string | null
          user_id?: string
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          joined_at: string | null
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          joined_at?: string | null
          organization_id: string
          role?: string
          user_id: string
        }
        Update: {
          joined_at?: string | null
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          attribution_data: Json | null
          created_at: string | null
          created_by: string | null
          id: string
          is_personal: boolean | null
          name: string
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          attribution_data?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_personal?: boolean | null
          name: string
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          attribution_data?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_personal?: boolean | null
          name?: string
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string | null
          id: string
          locale: string | null
          path: string
          referrer: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          visitor_hash: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          locale?: string | null
          path: string
          referrer?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_hash: string
        }
        Update: {
          created_at?: string | null
          id?: string
          locale?: string | null
          path?: string
          referrer?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_hash?: string
        }
        Relationships: []
      }
      pet: {
        Row: {
          care_days: number
          last_interaction: string | null
          mood: string
          shields: number
          stage: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          care_days?: number
          last_interaction?: string | null
          mood?: string
          shields?: number
          stage?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          care_days?: number
          last_interaction?: string | null
          mood?: string
          shields?: number
          stage?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      player_state: {
        Row: {
          active_habits: string[]
          avatar_config: Json
          beer_price: number
          beers_per_day: number
          created_at: string | null
          current_season_key: string
          level: number
          updated_at: string | null
          user_id: string
          xp_total: number
        }
        Insert: {
          active_habits?: string[]
          avatar_config?: Json
          beer_price?: number
          beers_per_day?: number
          created_at?: string | null
          current_season_key?: string
          level?: number
          updated_at?: string | null
          user_id: string
          xp_total?: number
        }
        Update: {
          active_habits?: string[]
          avatar_config?: Json
          beer_price?: number
          beers_per_day?: number
          created_at?: string | null
          current_season_key?: string
          level?: number
          updated_at?: string | null
          user_id?: string
          xp_total?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          attribution_data: Json | null
          avatar_url: string | null
          created_at: string | null
          current_organization_id: string | null
          full_name: string | null
          id: string
          language: string | null
          timezone: string | null
          updated_at: string | null
          user_flags: string[] | null
        }
        Insert: {
          attribution_data?: Json | null
          avatar_url?: string | null
          created_at?: string | null
          current_organization_id?: string | null
          full_name?: string | null
          id: string
          language?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_flags?: string[] | null
        }
        Update: {
          attribution_data?: Json | null
          avatar_url?: string | null
          created_at?: string | null
          current_organization_id?: string | null
          full_name?: string | null
          id?: string
          language?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_flags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_current_org"
            columns: ["current_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          reminder_hour: number
          subscription: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          reminder_hour?: number
          subscription: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          reminder_hour?: number
          subscription?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      season_progress: {
        Row: {
          completed_at: string | null
          days_completed: number
          season_key: string
          started_at: string | null
          user_id: string
          victory_seen_at: string | null
        }
        Insert: {
          completed_at?: string | null
          days_completed?: number
          season_key: string
          started_at?: string | null
          user_id: string
          victory_seen_at?: string | null
        }
        Update: {
          completed_at?: string | null
          days_completed?: number
          season_key?: string
          started_at?: string | null
          user_id?: string
          victory_seen_at?: string | null
        }
        Relationships: []
      }
      streaks: {
        Row: {
          current: number
          last_active_day: string | null
          longest: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          current?: number
          last_active_day?: string | null
          longest?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          current?: number
          last_active_day?: string | null
          longest?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          attribution_data: Json | null
          cancel_at: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          cancellation_details: Json | null
          cancellation_reason: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          ended_at: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          price_amount: number | null
          price_currency: string | null
          status: string
          stripe_customer_id: string
          stripe_price_id: string
          trial_end_at: string | null
          trial_start_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attribution_data?: Json | null
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          cancellation_details?: Json | null
          cancellation_reason?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          ended_at?: string | null
          id: string
          metadata?: Json | null
          organization_id?: string | null
          price_amount?: number | null
          price_currency?: string | null
          status: string
          stripe_customer_id: string
          stripe_price_id: string
          trial_end_at?: string | null
          trial_start_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attribution_data?: Json | null
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          cancellation_details?: Json | null
          cancellation_reason?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          price_amount?: number | null
          price_currency?: string | null
          status?: string
          stripe_customer_id?: string
          stripe_price_id?: string
          trial_end_at?: string | null
          trial_start_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_page_views: { Args: never; Returns: undefined }
      get_app_setting: { Args: { setting_key: string }; Returns: Json }
      user_organizations: { Args: never; Returns: string[] }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
