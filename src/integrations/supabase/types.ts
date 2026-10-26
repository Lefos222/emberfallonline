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
      _ef_probe: {
        Row: {
          id: number | null
        }
        Insert: {
          id?: number | null
        }
        Update: {
          id?: number | null
        }
        Relationships: []
      }
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
      auction_listings: {
        Row: {
          buyer_hero: string | null
          closed_at: string | null
          created_at: string
          id: string
          price: number
          quantity: number
          resource: string
          seller_hero: string
          seller_name: string
          status: string
        }
        Insert: {
          buyer_hero?: string | null
          closed_at?: string | null
          created_at?: string
          id?: string
          price: number
          quantity: number
          resource: string
          seller_hero: string
          seller_name: string
          status?: string
        }
        Update: {
          buyer_hero?: string | null
          closed_at?: string | null
          created_at?: string
          id?: string
          price?: number
          quantity?: number
          resource?: string
          seller_hero?: string
          seller_name?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_listings_seller_hero_fkey"
            columns: ["seller_hero"]
            isOneToOne: false
            referencedRelation: "heroes"
            referencedColumns: ["id"]
          },
        ]
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
      daily_boss_runs: {
        Row: {
          active: Json
          boss: number
          day: string
          hero_id: string
          id: string
          last_request: string | null
          snapshot: Json
          state: Json | null
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          active?: Json
          boss: number
          day: string
          hero_id: string
          id?: string
          last_request?: string | null
          snapshot: Json
          state?: Json | null
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          active?: Json
          boss?: number
          day?: string
          hero_id?: string
          id?: string
          last_request?: string | null
          snapshot?: Json
          state?: Json | null
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_boss_runs_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "heroes"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_profession_claims: {
        Row: {
          claimed_at: string
          day: string
          hero_id: string
          profession: string
        }
        Insert: {
          claimed_at?: string
          day: string
          hero_id: string
          profession: string
        }
        Update: {
          claimed_at?: string
          day?: string
          hero_id?: string
          profession?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_profession_claims_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "heroes"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          created_at: string
          friend_hero: string
          owner_hero: string
        }
        Insert: {
          created_at?: string
          friend_hero: string
          owner_hero: string
        }
        Update: {
          created_at?: string
          friend_hero?: string
          owner_hero?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_friend_hero_fkey"
            columns: ["friend_hero"]
            isOneToOne: false
            referencedRelation: "heroes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_owner_hero_fkey"
            columns: ["owner_hero"]
            isOneToOne: false
            referencedRelation: "heroes"
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
      guild_supply_claims: {
        Row: {
          day: string
          event: string
          guild_id: string
          hero_id: string
        }
        Insert: {
          day: string
          event: string
          guild_id: string
          hero_id: string
        }
        Update: {
          day?: string
          event?: string
          guild_id?: string
          hero_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_supply_claims_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_supply_claims_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "heroes"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_supply_contributions: {
        Row: {
          day: string
          event: string
          guild_id: string
          hero_id: string
          hero_name: string
          quantity: number
          request_id: string
          resource: string
        }
        Insert: {
          day: string
          event: string
          guild_id: string
          hero_id: string
          hero_name: string
          quantity: number
          request_id: string
          resource: string
        }
        Update: {
          day?: string
          event?: string
          guild_id?: string
          hero_id?: string
          hero_name?: string
          quantity?: number
          request_id?: string
          resource?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_supply_contributions_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_supply_contributions_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "heroes"
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
      world_raid_claims: {
        Row: {
          claimed_at: string
          day: string
          hero_id: string
          node: string
        }
        Insert: {
          claimed_at?: string
          day: string
          hero_id: string
          node: string
        }
        Update: {
          claimed_at?: string
          day?: string
          hero_id?: string
          node?: string
        }
        Relationships: [
          {
            foreignKeyName: "world_raid_claims_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "heroes"
            referencedColumns: ["id"]
          },
        ]
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
      activate_vip: {
        Args: { _hero: string; _level: number; _req: string }
        Returns: Json
      }
      add_friend: { Args: { _hero: string; _name: string }; Returns: string }
      auction_buy: {
        Args: { _hero: string; _listing: string; _req: string }
        Returns: Json
      }
      auction_cancel: {
        Args: { _hero: string; _listing: string; _req: string }
        Returns: Json
      }
      auction_list: {
        Args: {
          _hero: string
          _price: number
          _qty: number
          _req: string
          _resource: string
        }
        Returns: Json
      }
      begin_battle: { Args: { _hero: string }; Returns: Json }
      begin_gathering: {
        Args: {
          _area: number
          _hero: string
          _profession: string
          _req: string
        }
        Returns: Json
      }
      buy_diamond_item: {
        Args: { _hero: string; _item: string; _req: string }
        Returns: Json
      }
      buy_gold_pack: {
        Args: { _hero: string; _pack: string; _req: string }
        Returns: Json
      }
      buy_scroll: {
        Args: { _hero: string; _kind: string; _req: string }
        Returns: Json
      }
      claim_activity: {
        Args: { _hero: string; _objective: string }
        Returns: Json
      }
      claim_auction_proceeds: {
        Args: { _hero: string; _req: string }
        Returns: Json
      }
      claim_daily_profession: {
        Args: { _hero: string; _profession: string }
        Returns: Json
      }
      claim_login: { Args: { _hero: string }; Returns: Json }
      claim_mail: { Args: { _hero: string; _mail: string }; Returns: Json }
      claim_vip_daily: { Args: { _hero: string; _req: string }; Returns: Json }
      create_guild: {
        Args: {
          _description: string
          _emblem: string
          _hero: string
          _name: string
        }
        Returns: string
      }
      daily_boss_board: { Args: { _hero: string }; Returns: Json }
      daily_boss_commit: {
        Args: {
          _owner: string
          _request: string
          _run: string
          _state: Json
          _version: number
        }
        Returns: Json
      }
      daily_boss_open: { Args: { _boss: number; _hero: string }; Returns: Json }
      daily_login_items: {
        Args: { _class: string; _streak: number }
        Returns: Json
      }
      daily_profession_quests: { Args: { _hero: string }; Returns: Json }
      finish_gathering: { Args: { _hero: string; _req: string }; Returns: Json }
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
      guild_supply_claim: {
        Args: { _event: string; _hero: string }
        Returns: Json
      }
      guild_supply_contribute: {
        Args: {
          _event: string
          _hero: string
          _quantity: number
          _req: string
          _resource: string
        }
        Returns: Json
      }
      guild_supply_rules: { Args: never; Returns: Json }
      guild_supply_state: { Args: { _hero: string }; Returns: Json }
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
      inspect_hero: {
        Args: { _hero: string; _target: string }
        Returns: {
          arena_rating: number
          bio: string
          frame: string
          gender: string
          hero_class: string
          id: string
          last_played: string
          level: number
          name: string
          power: number
          stats: Json
          title: string
        }[]
      }
      leave_guild: { Args: { _hero: string }; Returns: undefined }
      list_friends: {
        Args: { _hero: string }
        Returns: {
          arena_rating: number
          bio: string
          frame: string
          gender: string
          hero_class: string
          id: string
          last_played: string
          level: number
          name: string
          power: number
          title: string
        }[]
      }
      lucky_shot: { Args: { _hero: string; _req: string }; Returns: Json }
      my_guild_ids: { Args: never; Returns: string[] }
      my_hero_ids: { Args: never; Returns: string[] }
      premium_state: { Args: { _hero: string }; Returns: Json }
      profession_state: { Args: { _hero: string }; Returns: Json }
      read_mail: { Args: { _hero: string; _mail: string }; Returns: undefined }
      record_arena_result: {
        Args: { _attacker: string; _defender: string; _won: boolean }
        Returns: number
      }
      remove_friend: {
        Args: { _friend: string; _hero: string }
        Returns: undefined
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
      world_map_state: { Args: { _hero: string }; Returns: Json }
      world_raid_complete: {
        Args: { _hero: string; _node: string; _req: string }
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
