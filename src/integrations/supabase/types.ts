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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      batches: {
        Row: {
          actual_quantity: number | null
          batch_number: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          mother_id: string | null
          notes: string | null
          projected_quantity: number | null
          stage: Database["public"]["Enums"]["batch_stage"]
          start_date: string
          strain_id: string | null
          updated_at: string | null
        }
        Insert: {
          actual_quantity?: number | null
          batch_number: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          mother_id?: string | null
          notes?: string | null
          projected_quantity?: number | null
          stage?: Database["public"]["Enums"]["batch_stage"]
          start_date?: string
          strain_id?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_quantity?: number | null
          batch_number?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          mother_id?: string | null
          notes?: string | null
          projected_quantity?: number | null
          stage?: Database["public"]["Enums"]["batch_stage"]
          start_date?: string
          strain_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batches_strain_id_fkey"
            columns: ["strain_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
        ]
      }
      cloning_pre_start_checklists: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          batch_id: string | null
          batch_number: string
          created_at: string | null
          created_by: string | null
          id: string
          mother_id: string
          mother_plant_fed_watered_12h: boolean | null
          mother_plant_healthy: boolean | null
          quantity: number
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          sof_number: string | null
          status: Database["public"]["Enums"]["approval_status"] | null
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string | null
          wearing_clean_gloves: boolean | null
          work_area_dome_cleaned_disinfected: boolean | null
          work_area_dome_prepared_medium: boolean | null
          work_area_jug_clean_water: boolean | null
          work_area_rooting_powder: boolean | null
          work_area_sanitizer_cup: boolean | null
          work_area_sharp_clean_blade: boolean | null
          work_area_sharp_clean_scissors: boolean | null
          work_surface_sterilized: boolean | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          batch_id?: string | null
          batch_number: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          mother_id: string
          mother_plant_fed_watered_12h?: boolean | null
          mother_plant_healthy?: boolean | null
          quantity: number
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          sof_number?: string | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          wearing_clean_gloves?: boolean | null
          work_area_dome_cleaned_disinfected?: boolean | null
          work_area_dome_prepared_medium?: boolean | null
          work_area_jug_clean_water?: boolean | null
          work_area_rooting_powder?: boolean | null
          work_area_sanitizer_cup?: boolean | null
          work_area_sharp_clean_blade?: boolean | null
          work_area_sharp_clean_scissors?: boolean | null
          work_surface_sterilized?: boolean | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          batch_id?: string | null
          batch_number?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          mother_id?: string
          mother_plant_fed_watered_12h?: boolean | null
          mother_plant_healthy?: boolean | null
          quantity?: number
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          sof_number?: string | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          wearing_clean_gloves?: boolean | null
          work_area_dome_cleaned_disinfected?: boolean | null
          work_area_dome_prepared_medium?: boolean | null
          work_area_jug_clean_water?: boolean | null
          work_area_rooting_powder?: boolean | null
          work_area_sanitizer_cup?: boolean | null
          work_area_sharp_clean_blade?: boolean | null
          work_area_sharp_clean_scissors?: boolean | null
          work_surface_sterilized?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "cloning_pre_start_checklists_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      cloning_transplant_logs: {
        Row: {
          actual_transplant_date: string | null
          batch_id: string | null
          batch_number: string
          created_at: string | null
          created_by: string | null
          dome_number: string | null
          id: string
          mother_id: string
          notes: string | null
          projected_transplant_date: string | null
          sof_number: string | null
          strain_id: string | null
          total_clones: number | null
          total_transplanted: number | null
          updated_at: string | null
        }
        Insert: {
          actual_transplant_date?: string | null
          batch_id?: string | null
          batch_number: string
          created_at?: string | null
          created_by?: string | null
          dome_number?: string | null
          id?: string
          mother_id: string
          notes?: string | null
          projected_transplant_date?: string | null
          sof_number?: string | null
          strain_id?: string | null
          total_clones?: number | null
          total_transplanted?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_transplant_date?: string | null
          batch_id?: string | null
          batch_number?: string
          created_at?: string | null
          created_by?: string | null
          dome_number?: string | null
          id?: string
          mother_id?: string
          notes?: string | null
          projected_transplant_date?: string | null
          sof_number?: string | null
          strain_id?: string | null
          total_clones?: number | null
          total_transplanted?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cloning_transplant_logs_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cloning_transplant_logs_strain_id_fkey"
            columns: ["strain_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
        ]
      }
      lookup_categories: {
        Row: {
          category_key: string
          category_name: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          category_key: string
          category_name: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          category_key?: string
          category_name?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      lookup_values: {
        Row: {
          category_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          sort_order: number | null
          updated_at: string | null
          value_display: string
          value_key: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          sort_order?: number | null
          updated_at?: string | null
          value_display: string
          value_key: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          sort_order?: number | null
          updated_at?: string | null
          value_display?: string
          value_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "lookup_values_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "lookup_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      mortality_discard_records: {
        Row: {
          batch_id: string | null
          batch_identifier: string
          created_at: string | null
          created_by: string | null
          grower_approved_at: string | null
          grower_approved_by: string | null
          id: string
          manager_approved_at: string | null
          manager_approved_by: string | null
          qa_approved_at: string | null
          qa_approved_by: string | null
          quantity_discarded: number
          reason: string
          record_date: string
          sof_number: string | null
          status: Database["public"]["Enums"]["approval_status"] | null
          updated_at: string | null
        }
        Insert: {
          batch_id?: string | null
          batch_identifier: string
          created_at?: string | null
          created_by?: string | null
          grower_approved_at?: string | null
          grower_approved_by?: string | null
          id?: string
          manager_approved_at?: string | null
          manager_approved_by?: string | null
          qa_approved_at?: string | null
          qa_approved_by?: string | null
          quantity_discarded: number
          reason: string
          record_date: string
          sof_number?: string | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          updated_at?: string | null
        }
        Update: {
          batch_id?: string | null
          batch_identifier?: string
          created_at?: string | null
          created_by?: string | null
          grower_approved_at?: string | null
          grower_approved_by?: string | null
          id?: string
          manager_approved_at?: string | null
          manager_approved_by?: string | null
          qa_approved_at?: string | null
          qa_approved_by?: string | null
          quantity_discarded?: number
          reason?: string
          record_date?: string
          sof_number?: string | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mortality_discard_records_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          department: string | null
          email: string
          first_name: string | null
          full_name: string
          id: string
          is_active: boolean | null
          last_name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email: string
          first_name?: string | null
          full_name: string
          id: string
          is_active?: boolean | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string
          first_name?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "assistant_grower"
        | "grower"
        | "manager"
        | "qa"
        | "supervisor"
        | "it_admin"
        | "business_admin"
      approval_status: "draft" | "pending" | "approved" | "rejected"
      batch_stage:
        | "cloning"
        | "rooting"
        | "vegetation"
        | "flowering"
        | "harvest"
        | "processing"
        | "completed"
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
      app_role: [
        "assistant_grower",
        "grower",
        "manager",
        "qa",
        "supervisor",
        "it_admin",
        "business_admin",
      ],
      approval_status: ["draft", "pending", "approved", "rejected"],
      batch_stage: [
        "cloning",
        "rooting",
        "vegetation",
        "flowering",
        "harvest",
        "processing",
        "completed",
      ],
    },
  },
} as const
