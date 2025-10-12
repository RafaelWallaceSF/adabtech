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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      Bengo: {
        Row: {
          "Data do envio": string
          Empresa: string | null
          id: number
          Mensagem: string | null
          Telefone: number | null
        }
        Insert: {
          "Data do envio": string
          Empresa?: string | null
          id?: number
          Mensagem?: string | null
          Telefone?: number | null
        }
        Update: {
          "Data do envio"?: string
          Empresa?: string | null
          id?: number
          Mensagem?: string | null
          Telefone?: number | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          author: string
          created_at: string
          id: string
          task_id: string
          text: string
        }
        Insert: {
          author: string
          created_at?: string
          id?: string
          task_id: string
          text: string
        }
        Update: {
          author?: string
          created_at?: string
          id?: string
          task_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      cursos: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      dis_vidal: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      Disparos: {
        Row: {
          empresa: string | null
          phone: string | null
          status: string | null
          tipomensagem: string | null
        }
        Insert: {
          empresa?: string | null
          phone?: string | null
          status?: string | null
          tipomensagem?: string | null
        }
        Update: {
          empresa?: string | null
          phone?: string | null
          status?: string | null
          tipomensagem?: string | null
        }
        Relationships: []
      }
      estoque: {
        Row: {
          code: string | null
          created_at: string
          current_stock: number | null
          id: number
          name: string
          packaging_type: string
          quantity_per_box: number | null
        }
        Insert: {
          code?: string | null
          created_at?: string
          current_stock?: number | null
          id?: never
          name: string
          packaging_type: string
          quantity_per_box?: number | null
        }
        Update: {
          code?: string | null
          created_at?: string
          current_stock?: number | null
          id?: never
          name?: string
          packaging_type?: string
          quantity_per_box?: number | null
        }
        Relationships: []
      }
      luah_chat_histories_inst: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      miguel_rosa: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      monitor_checks: {
        Row: {
          checked_at: string
          error_message: string | null
          http_code: number | null
          id: number
          instance_id: string
          latency_ms: number | null
          status: string
        }
        Insert: {
          checked_at?: string
          error_message?: string | null
          http_code?: number | null
          id?: number
          instance_id: string
          latency_ms?: number | null
          status: string
        }
        Update: {
          checked_at?: string
          error_message?: string | null
          http_code?: number | null
          id?: number
          instance_id?: string
          latency_ms?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitor_checks_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "monitor_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitor_checks_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "monitor_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitor_checks_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "v_uptime_24h"
            referencedColumns: ["instance_id"]
          },
        ]
      }
      monitor_instances: {
        Row: {
          alert_channel: string | null
          api_key: string | null
          api_url: string
          connection_status: string | null
          created_at: string | null
          expected_http: number | null
          external_id: string | null
          id: string
          is_enabled: boolean | null
          name: string
          provider: string
          updated_at: string | null
        }
        Insert: {
          alert_channel?: string | null
          api_key?: string | null
          api_url: string
          connection_status?: string | null
          created_at?: string | null
          expected_http?: number | null
          external_id?: string | null
          id?: string
          is_enabled?: boolean | null
          name: string
          provider: string
          updated_at?: string | null
        }
        Update: {
          alert_channel?: string | null
          api_key?: string | null
          api_url?: string
          connection_status?: string | null
          created_at?: string | null
          expected_http?: number | null
          external_id?: string | null
          id?: string
          is_enabled?: boolean | null
          name?: string
          provider?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      monitor_state: {
        Row: {
          consecutive_failures: number | null
          consecutive_successes: number | null
          instance_id: string
          last_alert_at: string | null
          last_change_at: string | null
          last_status: string
        }
        Insert: {
          consecutive_failures?: number | null
          consecutive_successes?: number | null
          instance_id: string
          last_alert_at?: string | null
          last_change_at?: string | null
          last_status?: string
        }
        Update: {
          consecutive_failures?: number | null
          consecutive_successes?: number | null
          instance_id?: string
          last_alert_at?: string | null
          last_change_at?: string | null
          last_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitor_state_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: true
            referencedRelation: "monitor_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitor_state_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: true
            referencedRelation: "monitor_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitor_state_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: true
            referencedRelation: "v_uptime_24h"
            referencedColumns: ["instance_id"]
          },
        ]
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      Nacional: {
        Row: {
          CNPJ: string | null
          Contato: string | null
          created_at: string
          id: number
          Razao: string | null
          Validacao: string | null
        }
        Insert: {
          CNPJ?: string | null
          Contato?: string | null
          created_at?: string
          id?: number
          Razao?: string | null
          Validacao?: string | null
        }
        Update: {
          CNPJ?: string | null
          Contato?: string | null
          created_at?: string
          id?: number
          Razao?: string | null
          Validacao?: string | null
        }
        Relationships: []
      }
      Nacional_Cob: {
        Row: {
          Apos_disparos: string | null
          CNPJ: string | null
          COD_CLI: string | null
          created_at: string
          "Data de Pagamento": string | null
          DUPLICATA: number | null
          Enviado: string | null
          id: number
          NOME_VENDEDOR: string | null
          Numero: string | null
          Razao: string | null
          "Tipo de envio": string | null
          Titulo: string | null
          Valor: string | null
          Vencimento: string | null
        }
        Insert: {
          Apos_disparos?: string | null
          CNPJ?: string | null
          COD_CLI?: string | null
          created_at?: string
          "Data de Pagamento"?: string | null
          DUPLICATA?: number | null
          Enviado?: string | null
          id?: number
          NOME_VENDEDOR?: string | null
          Numero?: string | null
          Razao?: string | null
          "Tipo de envio"?: string | null
          Titulo?: string | null
          Valor?: string | null
          Vencimento?: string | null
        }
        Update: {
          Apos_disparos?: string | null
          CNPJ?: string | null
          COD_CLI?: string | null
          created_at?: string
          "Data de Pagamento"?: string | null
          DUPLICATA?: number | null
          Enviado?: string | null
          id?: number
          NOME_VENDEDOR?: string | null
          Numero?: string | null
          Razao?: string | null
          "Tipo de envio"?: string | null
          Titulo?: string | null
          Valor?: string | null
          Vencimento?: string | null
        }
        Relationships: []
      }
      Nacional_Estoque: {
        Row: {
          cod_prod: number | null
          created_at: string
          estoque: string | null
          id: number
          nome: string | null
          preco: string | null
        }
        Insert: {
          cod_prod?: number | null
          created_at?: string
          estoque?: string | null
          id?: number
          nome?: string | null
          preco?: string | null
        }
        Update: {
          cod_prod?: number | null
          created_at?: string
          estoque?: string | null
          id?: number
          nome?: string | null
          preco?: string | null
        }
        Relationships: []
      }
      people: {
        Row: {
          contact: string
          created_at: string
          id: string
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          contact: string
          created_at?: string
          id?: string
          name: string
          role: string
          updated_at?: string
        }
        Update: {
          contact?: string
          created_at?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_settings: {
        Row: {
          created_at: string
          id: string
          launch_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          launch_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          launch_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          actual_cost: number
          assignee_id: string | null
          created_at: string
          deadline: string | null
          department: Database["public"]["Enums"]["department_type"]
          description: string | null
          estimated_cost: number
          id: string
          priority: Database["public"]["Enums"]["priority_level"]
          receipt_url: string | null
          status: Database["public"]["Enums"]["task_status"]
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          actual_cost?: number
          assignee_id?: string | null
          created_at?: string
          deadline?: string | null
          department?: Database["public"]["Enums"]["department_type"]
          description?: string | null
          estimated_cost?: number
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          actual_cost?: number
          assignee_id?: string | null
          created_at?: string
          deadline?: string | null
          department?: Database["public"]["Enums"]["department_type"]
          description?: string | null
          estimated_cost?: number
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      monitor_dashboard: {
        Row: {
          id: string | null
          is_enabled: boolean | null
          last_change_at: string | null
          last_checked_at: string | null
          last_error: string | null
          last_http_code: number | null
          last_latency_ms: number | null
          last_status: string | null
          name: string | null
          provider: string | null
        }
        Relationships: []
      }
      monitor_last_check: {
        Row: {
          checked_at: string | null
          error_message: string | null
          http_code: number | null
          instance_id: string | null
          latency_ms: number | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monitor_checks_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "monitor_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitor_checks_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "monitor_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitor_checks_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "v_uptime_24h"
            referencedColumns: ["instance_id"]
          },
        ]
      }
      v_uptime_24h: {
        Row: {
          instance_id: string | null
          name: string | null
          uptime_24h: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      department_type:
        | "Marketing"
        | "Operações"
        | "Tecnologia"
        | "Jurídico"
        | "Financeiro"
        | "Geral"
      priority_level: "Baixa" | "Média" | "Alta" | "Crítica"
      task_status:
        | "Backlog"
        | "Em Planejamento"
        | "Em Execução"
        | "Aguardando Terceiros"
        | "Em Aprovação"
        | "Bloqueado"
        | "Concluído"
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
      department_type: [
        "Marketing",
        "Operações",
        "Tecnologia",
        "Jurídico",
        "Financeiro",
        "Geral",
      ],
      priority_level: ["Baixa", "Média", "Alta", "Crítica"],
      task_status: [
        "Backlog",
        "Em Planejamento",
        "Em Execução",
        "Aguardando Terceiros",
        "Em Aprovação",
        "Bloqueado",
        "Concluído",
      ],
    },
  },
} as const
