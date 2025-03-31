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
      clients: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          state: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          due_date: string
          id: string
          paid_date: string | null
          project_id: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          paid_date?: string | null
          project_id: string
          status: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          paid_date?: string | null
          project_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string | null
          id: string
          name: string | null
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          email?: string | null
          id: string
          name?: string | null
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string | null
          id?: string
          name?: string | null
          role?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          client: string
          client_id: string | null
          created_at: string
          deadline: string | null
          description: string | null
          developer_shares: Json | null
          has_implementation_fee: boolean | null
          id: string
          implementation_fee: number | null
          installment_count: number | null
          is_installment: boolean | null
          is_recurring: boolean | null
          name: string
          payment_date: string | null
          status: string
          team_members: string[] | null
          total_value: number
        }
        Insert: {
          client: string
          client_id?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          developer_shares?: Json | null
          has_implementation_fee?: boolean | null
          id?: string
          implementation_fee?: number | null
          installment_count?: number | null
          is_installment?: boolean | null
          is_recurring?: boolean | null
          name: string
          payment_date?: string | null
          status: string
          team_members?: string[] | null
          total_value: number
        }
        Update: {
          client?: string
          client_id?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          developer_shares?: Json | null
          has_implementation_fee?: boolean | null
          id?: string
          implementation_fee?: number | null
          installment_count?: number | null
          is_installment?: boolean | null
          is_recurring?: boolean | null
          name?: string
          payment_date?: string | null
          status?: string
          team_members?: string[] | null
          total_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed: boolean | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          project_id: string
          title: string
        }
        Insert: {
          assigned_to?: string | null
          completed?: boolean | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          project_id: string
          title: string
        }
        Update: {
          assigned_to?: string | null
          completed?: boolean | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          project_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
