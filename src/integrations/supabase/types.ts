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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      activity_claims: {
        Row: {
          created_at: string
          hero_id: string
          objective: string
          period: string
        }
        Insert: {
          created_at?: string
          hero_id: string
          objective: string
          period: string
        }
        Update: {
          created_at?: string
          hero_id?: string
          objective?: string
          period?: string
        }
        Relationships: []
      }
      activity_progress: {
        Row: {
          count: number
          hero_id: string
          kind: string
          period: string
          updated_at: string
        }
        Insert: {
          count?: number
          hero_id: string
          kind: string
          period: string
          updated_at?: string
        }
        Update: {
          count?: number
          hero_id?: string
          kind?: string
          period?: string
          updated_at?: string
        }
        Relationships: []
      }
      arena_matches: {
        Row: {
          attacker_id: string
          attacker_name: string
          attacker_won: boolean
          created_at: string
          defender_id: string
          defender_name: string
          id: string
          rating_change: number
        }
        Insert: {
          attacker_id: string
          attacker_name: string
          attacker_won: boolean
          created_at?: string
          defender_id: string
          defender_name: string
          id?: string
          rating_change: number
        }
        Update: {
          attacker_id?: string
          attacker_name?: string
          attacker_won?: boolean
          created_at?: string
          defender_id?: string
          defender_name?: string
          id?: string
          rating_change?: number
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          body: string
          channel: string
          created_at: string
          guild_id: string | null
          id: string
          recipient_id: string | null
          recipient_name: string | null
          sender_class: string
          sender_id: string
          sender_name: string
        }
        Insert: {
          body: string
          channel: string
          created_at?: string
          guild_id?: string | null
          id?: string
          recipient_id?: string | null
          recipient_name?: string | null
          sender_class?: string
          sender_id: string
          sender_name: string
        }
        Update: {
          body?: string
          channel?: string
          created_at?: string
          guild_id?: string | null
          id?: string
          recipient_id?: string | null
          recipient_name?: string | null
          sender_class?: string
          sender_id?: string
          sender_name?: string
        }
        Relationships: []
      }
      chat_reports: {
        Row: {
          created_at: string
          message_id: string
          reason: string
          reporter_id: string
        }
        Insert: {
          created_at?: string
          message_id: string
          reason?: string
          reporter_id: string
        }
        Update: {
          created_at?: string
          message_id?: string
          reason?: string
          reporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_reports_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_invites: {
        Row: {
          created_at: string
          guild_id: string
          hero_id: string
          id: string
          invited_by: string
        }
        Insert: {
          created_at?: string
          guild_id: string
          hero_id: string
          id?: string
          invited_by: string
        }
        Update: {
          created_at?: string
          guild_id?: string
          hero_id?: string
          id?: string
          invited_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_invites_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_members: {
        Row: {
          guild_id: string
          hero_id: string
          joined_at: string
          role: string
        }
        Insert: {
          guild_id: string
          hero_id: string
          joined_at?: string
          role?: string
        }
        Update: {
          guild_id?: string
          hero_id?: string
          joined_at?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_members_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guilds: {
        Row: {
          announcement: string
          created_at: string
          description: string
          emblem: string
          id: string
          leader_id: string
          level: number
          name: string
        }
        Insert: {
          announcement?: string
          created_at?: string
          description?: string
          emblem?: string
          id?: string
          leader_id: string
          level?: number
          name: string
        }
        Update: {
          announcement?: string
          created_at?: string
          description?: string
          emblem?: string
          id?: string
          leader_id?: string
          level?: number
          name?: string
        }
        Relationships: []
      }
      heroes: {
        Row: {
          arena_rating: number
          bio: string
          created_at: string
          frame: string
          gender: string
          hero_class: string
          id: string
          is_public: boolean
          last_played: string
          level: number
          name: string
          power: number
          save: Json
          stats: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          arena_rating?: number
          bio?: string
          created_at?: string
          frame?: string
          gender?: string
          hero_class: string
          id?: string
          is_public?: boolean
          last_played?: string
          level?: number
          name: string
          power?: number
          save?: Json
          stats?: Json
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          arena_rating?: number
          bio?: string
          created_at?: string
          frame?: string
          gender?: string
          hero_class?: string
          id?: string
          is_public?: boolean
          last_played?: string
          level?: number
          name?: string
          power?: number
          save?: Json
          stats?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      login_days: {
        Row: {
          day: string
          hero_id: string
        }
        Insert: {
          day: string
          hero_id: string
        }
        Update: {
          day?: string
          hero_id?: string
        }
        Relationships: []
      }
      lucky_shots: {
        Row: {
          astral: Json
          created_at: string
          hero_id: string
          request_id: string
        }
        Insert: {
          astral: Json
          created_at?: string
          hero_id: string
          request_id: string
        }
        Update: {
          astral?: Json
          created_at?: string
          hero_id?: string
          request_id?: string
        }
        Relationships: []
      }
      mail: {
        Row: {
          attachments: Json
          body: string
          created_at: string
          expires_at: string | null
          hero_id: string | null
          id: string
          kind: string
          sender: string
          subject: string
        }
        Insert: {
          attachments?: Json
          body?: string
          created_at?: string
          expires_at?: string | null
          hero_id?: string | null
          id?: string
          kind?: string
          sender?: string
          subject: string
        }
        Update: {
          attachments?: Json
          body?: string
          created_at?: string
          expires_at?: string | null
          hero_id?: string | null
          id?: string
          kind?: string
          sender?: string
          subject?: string
        }
        Relationships: []
      }
      mail_state: {
        Row: {
          claimed_at: string | null
          hero_id: string
          mail_id: string
          read_at: string | null
        }
        Insert: {
          claimed_at?: string | null
          hero_id: string
          mail_id: string
          read_at?: string | null
        }
        Update: {
          claimed_at?: string | null
          hero_id?: string
          mail_id?: string
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mail_state_mail_id_fkey"
            columns: ["mail_id"]
            isOneToOne: false
            referencedRelation: "mail"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          created_at: string
          hero_id: string
          item: string
          price: number
          request_id: string
        }
        Insert: {
          created_at?: string
          hero_id: string
          item: string
          price: number
          request_id: string
        }
        Update: {
          created_at?: string
          hero_id?: string
          item?: string
          price?: number
          request_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _apply_reward: { Args: { rw: Json; s: Json }; Returns: Json }
      _daily_kinds: { Args: never; Returns: string[] }
      _daily_target: { Args: { _k: string }; Returns: number }
      _guild_role: {
        Args: { _hero: string }
        Returns: {
          guild_id: string
          hero_id: string
          joined_at: string
          role: string
        }
        SetofOptions: {
          from: "*"
          to: "guild_members"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      _kinds: { Args: never; Returns: string[] }
      _monday: { Args: never; Returns: string }
      _my_hero: {
        Args: { _hero: string }
        Returns: {
          arena_rating: number
          bio: string
          created_at: string
          frame: string
          gender: string
          hero_class: string
          id: string
          is_public: boolean
          last_played: string
          level: number
          name: string
          power: number
          save: Json
          stats: Json
          title: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "heroes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      _num: { Args: { j: Json }; Returns: number }
      _progress: {
        Args: { _hero: string; _kind: string; _period: string }
        Returns: number
      }
      _scroll_price: { Args: { _kind: string }; Returns: number }
      _today: { Args: never; Returns: string }
      _weekly_kinds: { Args: never; Returns: string[] }
      _weekly_target: { Args: { _k: string; _stage: number }; Returns: number }
      _write_save: { Args: { _hero: string; _save: Json }; Returns: undefined }
      activate_scroll: { Args: { _hero: string; _kind: string }; Returns: Json }
      begin_battle: { Args: { _hero: string }; Returns: Json }
      buy_scroll: {
        Args: { _hero: string; _kind: string; _req: string }
        Returns: Json
      }
      claim_activity: {
        Args: { _hero: string; _objective: string }
        Returns: Json
      }
      claim_login: { Args: { _hero: string }; Returns: Json }
      claim_mail: { Args: { _hero: string; _mail: string }; Returns: Json }
      create_guild: {
        Args: {
          _description: string
          _emblem: string
          _hero: string
          _name: string
        }
        Returns: string
      }
      get_activities: { Args: { _hero: string }; Returns: Json }
      guild_disband: { Args: { _hero: string }; Returns: undefined }
      guild_invite: {
        Args: { _hero: string; _target_name: string }
        Returns: undefined
      }
      guild_kick: {
        Args: { _hero: string; _target: string }
        Returns: undefined
      }
      guild_set_role: {
        Args: { _hero: string; _role: string; _target: string }
        Returns: undefined
      }
      guild_transfer: {
        Args: { _hero: string; _target: string }
        Returns: undefined
      }
      guild_update: {
        Args: {
          _announcement: string
          _description: string
          _emblem: string
          _hero: string
        }
        Returns: undefined
      }
      leave_guild: { Args: { _hero: string }; Returns: undefined }
      lucky_shot: { Args: { _hero: string; _req: string }; Returns: Json }
      my_guild_ids: { Args: never; Returns: string[] }
      my_hero_ids: { Args: never; Returns: string[] }
      read_mail: { Args: { _hero: string; _mail: string }; Returns: undefined }
      record_arena_result: {
        Args: { _attacker: string; _defender: string; _won: boolean }
        Returns: number
      }
      report_message: {
        Args: { _hero: string; _message: string; _reason: string }
        Returns: undefined
      }
      respond_invite: {
        Args: { _accept: boolean; _hero: string; _invite: string }
        Returns: undefined
      }
      send_chat: {
        Args: { _body: string; _channel: string; _hero: string; _to: string }
        Returns: string
      }
      track_activity: {
        Args: { _hero: string; _kind: string }
        Returns: undefined
      }
      unlock_cosmetic: { Args: { _hero: string; _id: string }; Returns: Json }
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
