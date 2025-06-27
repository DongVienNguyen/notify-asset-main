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
      asset_history_archive: {
        Row: {
          asset_name: string
          change_reason: string | null
          change_type: string
          changed_by: string
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          original_asset_id: string
        }
        Insert: {
          asset_name: string
          change_reason?: string | null
          change_type: string
          changed_by: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          original_asset_id: string
        }
        Update: {
          asset_name?: string
          change_reason?: string | null
          change_type?: string
          changed_by?: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          original_asset_id?: string
        }
        Relationships: []
      }
      asset_reminders: {
        Row: {
          cbkh: string | null
          cbqln: string | null
          created_at: string | null
          id: string
          is_sent: boolean | null
          ngay_den_han: string
          ten_ts: string
        }
        Insert: {
          cbkh?: string | null
          cbqln?: string | null
          created_at?: string | null
          id?: string
          is_sent?: boolean | null
          ngay_den_han: string
          ten_ts: string
        }
        Update: {
          cbkh?: string | null
          cbqln?: string | null
          created_at?: string | null
          id?: string
          is_sent?: boolean | null
          ngay_den_han?: string
          ten_ts?: string
        }
        Relationships: []
      }
      asset_transactions: {
        Row: {
          asset_code: number
          asset_year: number
          created_at: string | null
          id: string
          note: string | null
          parts_day: string
          room: string
          staff_code: string
          transaction_date: string
          transaction_type: string
        }
        Insert: {
          asset_code: number
          asset_year: number
          created_at?: string | null
          id?: string
          note?: string | null
          parts_day: string
          room: string
          staff_code: string
          transaction_date: string
          transaction_type: string
        }
        Update: {
          asset_code?: number
          asset_year?: number
          created_at?: string | null
          id?: string
          note?: string | null
          parts_day?: string
          room?: string
          staff_code?: string
          transaction_date?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_transactions_staff_code_fkey"
            columns: ["staff_code"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["username"]
          },
        ]
      }
      cbcrc: {
        Row: {
          email: string
          id: string
          ten_nv: string
        }
        Insert: {
          email: string
          id?: string
          ten_nv: string
        }
        Update: {
          email?: string
          id?: string
          ten_nv?: string
        }
        Relationships: []
      }
      cbkh: {
        Row: {
          email: string
          id: string
          ten_nv: string
        }
        Insert: {
          email: string
          id?: string
          ten_nv: string
        }
        Update: {
          email?: string
          id?: string
          ten_nv?: string
        }
        Relationships: []
      }
      cbqln: {
        Row: {
          email: string
          id: string
          ten_nv: string
        }
        Insert: {
          email: string
          id?: string
          ten_nv: string
        }
        Update: {
          email?: string
          id?: string
          ten_nv?: string
        }
        Relationships: []
      }
      crc_reminders: {
        Row: {
          cbcrc: string | null
          created_at: string | null
          id: string
          is_sent: boolean | null
          ldpcrc: string | null
          loai_bt_crc: string
          ngay_thuc_hien: string
          quycrc: string | null
        }
        Insert: {
          cbcrc?: string | null
          created_at?: string | null
          id?: string
          is_sent?: boolean | null
          ldpcrc?: string | null
          loai_bt_crc: string
          ngay_thuc_hien: string
          quycrc?: string | null
        }
        Update: {
          cbcrc?: string | null
          created_at?: string | null
          id?: string
          is_sent?: boolean | null
          ldpcrc?: string | null
          loai_bt_crc?: string
          ngay_thuc_hien?: string
          quycrc?: string | null
        }
        Relationships: []
      }
      ldpcrc: {
        Row: {
          email: string
          id: string
          ten_nv: string
        }
        Insert: {
          email: string
          id?: string
          ten_nv: string
        }
        Update: {
          email?: string
          id?: string
          ten_nv?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          recipient_username: string
          related_data: Json | null
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          recipient_username: string
          related_data?: Json | null
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          recipient_username?: string
          related_data?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_username_fkey"
            columns: ["recipient_username"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["username"]
          },
        ]
      }
      other_assets: {
        Row: {
          created_at: string | null
          deposit_date: string | null
          deposit_receiver: string | null
          depositor: string | null
          id: string
          name: string
          notes: string | null
          updated_at: string | null
          withdrawal_date: string | null
          withdrawal_deliverer: string | null
          withdrawal_receiver: string | null
        }
        Insert: {
          created_at?: string | null
          deposit_date?: string | null
          deposit_receiver?: string | null
          depositor?: string | null
          id?: string
          name: string
          notes?: string | null
          updated_at?: string | null
          withdrawal_date?: string | null
          withdrawal_deliverer?: string | null
          withdrawal_receiver?: string | null
        }
        Update: {
          created_at?: string | null
          deposit_date?: string | null
          deposit_receiver?: string | null
          depositor?: string | null
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string | null
          withdrawal_date?: string | null
          withdrawal_deliverer?: string | null
          withdrawal_receiver?: string | null
        }
        Relationships: []
      }
      quycrc: {
        Row: {
          email: string
          id: string
          ten_nv: string
        }
        Insert: {
          email: string
          id?: string
          ten_nv: string
        }
        Update: {
          email?: string
          id?: string
          ten_nv?: string
        }
        Relationships: []
      }
      sent_asset_reminders: {
        Row: {
          cbkh: string | null
          cbqln: string | null
          created_at: string | null
          id: string
          is_sent: boolean | null
          ngay_den_han: string
          sent_date: string
          ten_ts: string
        }
        Insert: {
          cbkh?: string | null
          cbqln?: string | null
          created_at?: string | null
          id?: string
          is_sent?: boolean | null
          ngay_den_han: string
          sent_date: string
          ten_ts: string
        }
        Update: {
          cbkh?: string | null
          cbqln?: string | null
          created_at?: string | null
          id?: string
          is_sent?: boolean | null
          ngay_den_han?: string
          sent_date?: string
          ten_ts?: string
        }
        Relationships: []
      }
      sent_crc_reminders: {
        Row: {
          cbcrc: string | null
          created_at: string | null
          id: string
          is_sent: boolean | null
          ldpcrc: string | null
          loai_bt_crc: string
          ngay_thuc_hien: string
          quycrc: string | null
          sent_date: string
        }
        Insert: {
          cbcrc?: string | null
          created_at?: string | null
          id?: string
          is_sent?: boolean | null
          ldpcrc?: string | null
          loai_bt_crc: string
          ngay_thuc_hien: string
          quycrc?: string | null
          sent_date: string
        }
        Update: {
          cbcrc?: string | null
          created_at?: string | null
          id?: string
          is_sent?: boolean | null
          ldpcrc?: string | null
          loai_bt_crc?: string
          ngay_thuc_hien?: string
          quycrc?: string | null
          sent_date?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          account_status: string | null
          created_at: string | null
          department: string | null
          failed_login_attempts: number | null
          id: string
          last_failed_login: string | null
          locked_at: string | null
          password: string
          role: string | null
          staff_name: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          account_status?: string | null
          created_at?: string | null
          department?: string | null
          failed_login_attempts?: number | null
          id?: string
          last_failed_login?: string | null
          locked_at?: string | null
          password: string
          role?: string | null
          staff_name?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          account_status?: string | null
          created_at?: string | null
          department?: string | null
          failed_login_attempts?: number | null
          id?: string
          last_failed_login?: string | null
          locked_at?: string | null
          password?: string
          role?: string | null
          staff_name?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          username: string
          role: string
          department: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_username: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      set_config: {
        Args: { setting_name: string; new_value: string; is_local?: boolean }
        Returns: string
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
