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
      logistics_quotes: {
        Row: {
          amount_cents: number
          created_at: string
          created_by: string
          currency: string
          eta_days: number | null
          id: string
          label: string
          operation_id: string
          provider_organization_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          created_by: string
          currency?: string
          eta_days?: number | null
          id?: string
          label: string
          operation_id: string
          provider_organization_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          created_by?: string
          currency?: string
          eta_days?: number | null
          id?: string
          label?: string
          operation_id?: string
          provider_organization_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "logistics_quotes_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "operations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logistics_quotes_provider_organization_id_fkey"
            columns: ["provider_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_audit_events: {
        Row: {
          actor_id: string
          created_at: string
          event_data: Json
          event_hash: string
          event_type: string
          id: number
          operation_id: string
          previous_hash: string | null
          request_id: string
        }
        Insert: {
          actor_id: string
          created_at?: string
          event_data?: Json
          event_hash: string
          event_type: string
          id?: never
          operation_id: string
          previous_hash?: string | null
          request_id?: string
        }
        Update: {
          actor_id?: string
          created_at?: string
          event_data?: Json
          event_hash?: string
          event_type?: string
          id?: never
          operation_id?: string
          previous_hash?: string | null
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "operation_audit_events_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "operations"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_confirmations: {
        Row: {
          confirmation_type: string
          confirmed_at: string
          confirmed_by: string
          id: string
          idempotency_key: string
          metadata: Json
          operation_id: string
          participant_role: string
        }
        Insert: {
          confirmation_type: string
          confirmed_at?: string
          confirmed_by: string
          id?: string
          idempotency_key?: string
          metadata?: Json
          operation_id: string
          participant_role: string
        }
        Update: {
          confirmation_type?: string
          confirmed_at?: string
          confirmed_by?: string
          id?: string
          idempotency_key?: string
          metadata?: Json
          operation_id?: string
          participant_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "operation_confirmations_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "operations"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_cost_items: {
        Row: {
          amount_cents: number
          category: string
          created_at: string
          created_by: string
          currency: string
          id: string
          label: string
          operation_id: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          category: string
          created_at?: string
          created_by: string
          currency?: string
          id?: string
          label: string
          operation_id: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          category?: string
          created_at?: string
          created_by?: string
          currency?: string
          id?: string
          label?: string
          operation_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operation_cost_items_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "operations"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_evidence: {
        Row: {
          created_at: string
          evidence_type: string
          id: string
          operation_id: string
          sha256_hex: string
          storage_path: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          evidence_type: string
          id?: string
          operation_id: string
          sha256_hex: string
          storage_path: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          evidence_type?: string
          id?: string
          operation_id?: string
          sha256_hex?: string
          storage_path?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "operation_evidence_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "operations"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_incidents: {
        Row: {
          blocks_progress: boolean
          created_at: string
          description: string
          id: string
          incident_type: string
          opened_by: string
          operation_id: string
          resolution_note: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          blocks_progress?: boolean
          created_at?: string
          description: string
          id?: string
          incident_type: string
          opened_by: string
          operation_id: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          blocks_progress?: boolean
          created_at?: string
          description?: string
          id?: string
          incident_type?: string
          opened_by?: string
          operation_id?: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "operation_incidents_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "operations"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_notifications: {
        Row: {
          created_at: string
          event_type: string
          id: number
          message: string
          operation_id: string
          read_at: string | null
          recipient_organization_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: never
          message: string
          operation_id: string
          read_at?: string | null
          recipient_organization_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: never
          message?: string
          operation_id?: string
          read_at?: string | null
          recipient_organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operation_notifications_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "operations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operation_notifications_recipient_organization_id_fkey"
            columns: ["recipient_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_participants: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          invited_by: string
          operation_id: string
          organization_id: string
          participant_role: string
          responsibility: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_by: string
          operation_id: string
          organization_id: string
          participant_role: string
          responsibility?: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_by?: string
          operation_id?: string
          organization_id?: string
          participant_role?: string
          responsibility?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "operation_participants_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "operations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operation_participants_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      operations: {
        Row: {
          amount_cents: number | null
          calculated_margin_cents: number | null
          created_at: string
          created_by: string
          currency: string
          destination_label: string | null
          id: string
          is_synthetic: boolean
          item_description: string | null
          margin_floor_cents: number
          margin_status: string
          operation_type: string
          origin_label: string | null
          parent_operation_id: string | null
          reference: string
          status: string
          status_before_block: string | null
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          amount_cents?: number | null
          calculated_margin_cents?: number | null
          created_at?: string
          created_by: string
          currency?: string
          destination_label?: string | null
          id?: string
          is_synthetic?: boolean
          item_description?: string | null
          margin_floor_cents?: number
          margin_status?: string
          operation_type?: string
          origin_label?: string | null
          parent_operation_id?: string | null
          reference: string
          status?: string
          status_before_block?: string | null
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          amount_cents?: number | null
          calculated_margin_cents?: number | null
          created_at?: string
          created_by?: string
          currency?: string
          destination_label?: string | null
          id?: string
          is_synthetic?: boolean
          item_description?: string | null
          margin_floor_cents?: number
          margin_status?: string
          operation_type?: string
          origin_label?: string | null
          parent_operation_id?: string | null
          reference?: string
          status?: string
          status_before_block?: string | null
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "operations_parent_operation_id_fkey"
            columns: ["parent_operation_id"]
            isOneToOne: false
            referencedRelation: "operations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          member_role: string
          organization_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          member_role?: string
          organization_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          member_role?: string
          organization_id?: string
          status?: string
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
          created_at: string
          demo_code: string | null
          id: string
          is_synthetic: boolean
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          demo_code?: string | null
          id?: string
          is_synthetic?: boolean
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          demo_code?: string | null
          id?: string
          is_synthetic?: boolean
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          platform_role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          platform_role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          platform_role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      organization_verifications: {
        Row: {
          organization_id: string
          verification_status: string
          verification_method: string | null
          legal_name: string | null
          tax_id_last4: string | null
          evidence_ref: string | null
          verified_at: string | null
          verified_by: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          organization_id: string
          verification_status?: string
          verification_method?: string | null
          legal_name?: string | null
          tax_id_last4?: string | null
          evidence_ref?: string | null
          verified_at?: string | null
          verified_by?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          organization_id?: string
          verification_status?: string
          verification_method?: string | null
          legal_name?: string | null
          tax_id_last4?: string | null
          evidence_ref?: string | null
          verified_at?: string | null
          verified_by?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      organization_provider_qualifications: {
        Row: {
          organization_id: string
          capability: string
          qualification_status: string
          evidence_ref: string | null
          verified_at: string | null
          verified_by: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          organization_id: string
          capability: string
          qualification_status?: string
          evidence_ref?: string | null
          verified_at?: string | null
          verified_by?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          organization_id?: string
          capability?: string
          qualification_status?: string
          evidence_ref?: string | null
          verified_at?: string | null
          verified_by?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_operation_invitation: {
        Args: {
          request_key: string
          target_operation: string
          target_role: string
        }
        Returns: {
          accepted_at: string | null
          created_at: string
          id: string
          invited_by: string
          operation_id: string
          organization_id: string
          participant_role: string
          responsibility: string
          status: string
        }
        SetofOptions: {
          from: "*"
          to: "operation_participants"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_synthetic_part_recovery: {
        Args: {
          carrier_demo_code: string
          part_description: string
          request_key: string
          sender_demo_code: string
          target_parent: string
        }
        Returns: {
          amount_cents: number | null
          calculated_margin_cents: number | null
          created_at: string
          created_by: string
          currency: string
          destination_label: string | null
          id: string
          is_synthetic: boolean
          item_description: string | null
          margin_floor_cents: number
          margin_status: string
          operation_type: string
          origin_label: string | null
          parent_operation_id: string | null
          reference: string
          status: string
          status_before_block: string | null
          title: string
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "operations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      select_logistics_quote: {
        Args: { request_key: string; target_quote: string }
        Returns: {
          amount_cents: number
          created_at: string
          created_by: string
          currency: string
          eta_days: number | null
          id: string
          label: string
          operation_id: string
          provider_organization_id: string
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "logistics_quotes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      transition_operation: {
        Args: {
          expected_version: number
          request_key: string
          target_operation: string
          target_status: string
        }
        Returns: {
          amount_cents: number | null
          calculated_margin_cents: number | null
          created_at: string
          created_by: string
          currency: string
          destination_label: string | null
          id: string
          is_synthetic: boolean
          item_description: string | null
          margin_floor_cents: number
          margin_status: string
          operation_type: string
          origin_label: string | null
          parent_operation_id: string | null
          reference: string
          status: string
          status_before_block: string | null
          title: string
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "operations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      mark_operation_notification_read: {
        Args: { target_notification: number }
        Returns: {
          created_at: string
          event_type: string
          id: number
          message: string
          operation_id: string
          read_at: string | null
          recipient_organization_id: string | null
        }
        SetofOptions: { from: "*"; to: "operation_notifications"; isOneToOne: true; isSetofReturn: false }
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
