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
      approval_workflows: {
        Row: {
          category_display_name: string
          created_at: string | null
          id: string
          is_active: boolean | null
          stages: Json
          task_category: string
          total_stages: number
          updated_at: string | null
        }
        Insert: {
          category_display_name: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          stages: Json
          task_category: string
          total_stages: number
          updated_at?: string | null
        }
        Update: {
          category_display_name?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          stages?: Json
          task_category?: string
          total_stages?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      batch_lifecycle_records: {
        Row: {
          actual_days: number | null
          actual_flowering_date: string | null
          actual_rooting_date: string | null
          batch_id: string | null
          batch_number: string
          clonator_1: string | null
          clonator_2: string | null
          clonator_2_area_placed: string | null
          clonator_2_completed_by: string | null
          clonator_2_date: string | null
          clonator_2_no_of_days: number | null
          clonator_2_number_clones: number | null
          clonator_2_rack_no: string | null
          clonator_mortalities: number | null
          clone_germination_date: string | null
          created_at: string | null
          created_by: string | null
          current_stage:
            | Database["public"]["Enums"]["batch_lifecycle_stage"]
            | null
          dome_no: string | null
          dry_weight_checked_by: string | null
          dry_weight_checked_date: string | null
          dry_weight_completed_by: string | null
          dry_weight_date: string | null
          dry_weight_no_plants: number | null
          drying_checked_by: string | null
          drying_completed_by: string | null
          drying_date: string | null
          drying_rack_no: string | null
          drying_total_plants: number | null
          eight_nodes: boolean | null
          estimated_days: number | null
          expected_flowering_date: string | null
          expected_rooting_date: string | null
          extra_lights_from_day: number | null
          extra_lights_no_of_days: number | null
          final_manager_sign: string | null
          final_manager_sign_date: string | null
          final_processor_sign: string | null
          final_processor_sign_date: string | null
          final_qa_sign: string | null
          final_qa_sign_date: string | null
          flowering_checked_by: string | null
          flowering_completed_by: string | null
          flowering_diseases: boolean | null
          flowering_grower_sign: string | null
          flowering_grower_sign_date: string | null
          flowering_manager_sign: string | null
          flowering_manager_sign_date: string | null
          flowering_mortalities: Json | null
          flowering_number_plants: number | null
          flowering_pests: boolean | null
          flowering_qa_sign: string | null
          flowering_qa_sign_date: string | null
          flowering_table_no: string | null
          hardening_area_placed: string | null
          hardening_checked_by: string | null
          hardening_completed_by: string | null
          hardening_grower_sign: string | null
          hardening_grower_sign_date: string | null
          hardening_manager_sign: string | null
          hardening_manager_sign_date: string | null
          hardening_mortalities: Json | null
          hardening_no_of_days: number | null
          hardening_number_clones: number | null
          hardening_qa_sign: string | null
          hardening_qa_sign_date: string | null
          hardening_rack_no: string | null
          harvest_completed_by: string | null
          harvest_date: string | null
          harvest_grower_sign: string | null
          harvest_grower_sign_date: string | null
          harvest_manager_sign: string | null
          harvest_manager_sign_date: string | null
          harvest_number_plants: number | null
          harvest_qa_sign: string | null
          harvest_qa_sign_date: string | null
          harvest_table_no: string | null
          id: string
          increase_in_yield: string | null
          inspection_completed_by: string | null
          inspection_date: string | null
          inspection_number_plants: number | null
          inspection_rack_no: string | null
          inspection_table_no: string | null
          last_transition_tasks: Json | null
          mortality_checked_by: string | null
          mortality_completed_by: string | null
          mortality_general_reason: string | null
          mortality_total_amount_kg: number | null
          mortality_total_percentage: number | null
          mother_no: string | null
          move_to_flowering_date: string | null
          move_to_hardening_date: string | null
          move_to_veg_date: string | null
          no_of_days_drying: number | null
          nutrients_used: string | null
          packing_a_grade: number | null
          packing_b_grade: number | null
          packing_bag_ids: string | null
          packing_c_grade: number | null
          packing_checked_by: string | null
          packing_completed_by: string | null
          packing_date: string | null
          packing_storage_area: string | null
          processing_manager_sign: string | null
          processing_manager_sign_date: string | null
          processing_qa_sign: string | null
          processing_qa_sign_date: string | null
          processor_sign: string | null
          processor_sign_date: string | null
          rack_no: string | null
          stage_transition_history: Json | null
          status: string | null
          strain_id: string | null
          tags: string[] | null
          total_clones_plants: number | null
          total_dry_weight: number | null
          total_plants_processed: number | null
          total_wet_weight: number | null
          updated_at: string | null
          using_extra_lights: boolean | null
          veg_actual_days: number | null
          veg_checked_by: string | null
          veg_completed_by: string | null
          veg_diseases: boolean | null
          veg_expected_days: number | null
          veg_mortalities: Json | null
          veg_number_plants: number | null
          veg_pests: boolean | null
          veg_table_no: string | null
        }
        Insert: {
          actual_days?: number | null
          actual_flowering_date?: string | null
          actual_rooting_date?: string | null
          batch_id?: string | null
          batch_number: string
          clonator_1?: string | null
          clonator_2?: string | null
          clonator_2_area_placed?: string | null
          clonator_2_completed_by?: string | null
          clonator_2_date?: string | null
          clonator_2_no_of_days?: number | null
          clonator_2_number_clones?: number | null
          clonator_2_rack_no?: string | null
          clonator_mortalities?: number | null
          clone_germination_date?: string | null
          created_at?: string | null
          created_by?: string | null
          current_stage?:
            | Database["public"]["Enums"]["batch_lifecycle_stage"]
            | null
          dome_no?: string | null
          dry_weight_checked_by?: string | null
          dry_weight_checked_date?: string | null
          dry_weight_completed_by?: string | null
          dry_weight_date?: string | null
          dry_weight_no_plants?: number | null
          drying_checked_by?: string | null
          drying_completed_by?: string | null
          drying_date?: string | null
          drying_rack_no?: string | null
          drying_total_plants?: number | null
          eight_nodes?: boolean | null
          estimated_days?: number | null
          expected_flowering_date?: string | null
          expected_rooting_date?: string | null
          extra_lights_from_day?: number | null
          extra_lights_no_of_days?: number | null
          final_manager_sign?: string | null
          final_manager_sign_date?: string | null
          final_processor_sign?: string | null
          final_processor_sign_date?: string | null
          final_qa_sign?: string | null
          final_qa_sign_date?: string | null
          flowering_checked_by?: string | null
          flowering_completed_by?: string | null
          flowering_diseases?: boolean | null
          flowering_grower_sign?: string | null
          flowering_grower_sign_date?: string | null
          flowering_manager_sign?: string | null
          flowering_manager_sign_date?: string | null
          flowering_mortalities?: Json | null
          flowering_number_plants?: number | null
          flowering_pests?: boolean | null
          flowering_qa_sign?: string | null
          flowering_qa_sign_date?: string | null
          flowering_table_no?: string | null
          hardening_area_placed?: string | null
          hardening_checked_by?: string | null
          hardening_completed_by?: string | null
          hardening_grower_sign?: string | null
          hardening_grower_sign_date?: string | null
          hardening_manager_sign?: string | null
          hardening_manager_sign_date?: string | null
          hardening_mortalities?: Json | null
          hardening_no_of_days?: number | null
          hardening_number_clones?: number | null
          hardening_qa_sign?: string | null
          hardening_qa_sign_date?: string | null
          hardening_rack_no?: string | null
          harvest_completed_by?: string | null
          harvest_date?: string | null
          harvest_grower_sign?: string | null
          harvest_grower_sign_date?: string | null
          harvest_manager_sign?: string | null
          harvest_manager_sign_date?: string | null
          harvest_number_plants?: number | null
          harvest_qa_sign?: string | null
          harvest_qa_sign_date?: string | null
          harvest_table_no?: string | null
          id?: string
          increase_in_yield?: string | null
          inspection_completed_by?: string | null
          inspection_date?: string | null
          inspection_number_plants?: number | null
          inspection_rack_no?: string | null
          inspection_table_no?: string | null
          last_transition_tasks?: Json | null
          mortality_checked_by?: string | null
          mortality_completed_by?: string | null
          mortality_general_reason?: string | null
          mortality_total_amount_kg?: number | null
          mortality_total_percentage?: number | null
          mother_no?: string | null
          move_to_flowering_date?: string | null
          move_to_hardening_date?: string | null
          move_to_veg_date?: string | null
          no_of_days_drying?: number | null
          nutrients_used?: string | null
          packing_a_grade?: number | null
          packing_b_grade?: number | null
          packing_bag_ids?: string | null
          packing_c_grade?: number | null
          packing_checked_by?: string | null
          packing_completed_by?: string | null
          packing_date?: string | null
          packing_storage_area?: string | null
          processing_manager_sign?: string | null
          processing_manager_sign_date?: string | null
          processing_qa_sign?: string | null
          processing_qa_sign_date?: string | null
          processor_sign?: string | null
          processor_sign_date?: string | null
          rack_no?: string | null
          stage_transition_history?: Json | null
          status?: string | null
          strain_id?: string | null
          tags?: string[] | null
          total_clones_plants?: number | null
          total_dry_weight?: number | null
          total_plants_processed?: number | null
          total_wet_weight?: number | null
          updated_at?: string | null
          using_extra_lights?: boolean | null
          veg_actual_days?: number | null
          veg_checked_by?: string | null
          veg_completed_by?: string | null
          veg_diseases?: boolean | null
          veg_expected_days?: number | null
          veg_mortalities?: Json | null
          veg_number_plants?: number | null
          veg_pests?: boolean | null
          veg_table_no?: string | null
        }
        Update: {
          actual_days?: number | null
          actual_flowering_date?: string | null
          actual_rooting_date?: string | null
          batch_id?: string | null
          batch_number?: string
          clonator_1?: string | null
          clonator_2?: string | null
          clonator_2_area_placed?: string | null
          clonator_2_completed_by?: string | null
          clonator_2_date?: string | null
          clonator_2_no_of_days?: number | null
          clonator_2_number_clones?: number | null
          clonator_2_rack_no?: string | null
          clonator_mortalities?: number | null
          clone_germination_date?: string | null
          created_at?: string | null
          created_by?: string | null
          current_stage?:
            | Database["public"]["Enums"]["batch_lifecycle_stage"]
            | null
          dome_no?: string | null
          dry_weight_checked_by?: string | null
          dry_weight_checked_date?: string | null
          dry_weight_completed_by?: string | null
          dry_weight_date?: string | null
          dry_weight_no_plants?: number | null
          drying_checked_by?: string | null
          drying_completed_by?: string | null
          drying_date?: string | null
          drying_rack_no?: string | null
          drying_total_plants?: number | null
          eight_nodes?: boolean | null
          estimated_days?: number | null
          expected_flowering_date?: string | null
          expected_rooting_date?: string | null
          extra_lights_from_day?: number | null
          extra_lights_no_of_days?: number | null
          final_manager_sign?: string | null
          final_manager_sign_date?: string | null
          final_processor_sign?: string | null
          final_processor_sign_date?: string | null
          final_qa_sign?: string | null
          final_qa_sign_date?: string | null
          flowering_checked_by?: string | null
          flowering_completed_by?: string | null
          flowering_diseases?: boolean | null
          flowering_grower_sign?: string | null
          flowering_grower_sign_date?: string | null
          flowering_manager_sign?: string | null
          flowering_manager_sign_date?: string | null
          flowering_mortalities?: Json | null
          flowering_number_plants?: number | null
          flowering_pests?: boolean | null
          flowering_qa_sign?: string | null
          flowering_qa_sign_date?: string | null
          flowering_table_no?: string | null
          hardening_area_placed?: string | null
          hardening_checked_by?: string | null
          hardening_completed_by?: string | null
          hardening_grower_sign?: string | null
          hardening_grower_sign_date?: string | null
          hardening_manager_sign?: string | null
          hardening_manager_sign_date?: string | null
          hardening_mortalities?: Json | null
          hardening_no_of_days?: number | null
          hardening_number_clones?: number | null
          hardening_qa_sign?: string | null
          hardening_qa_sign_date?: string | null
          hardening_rack_no?: string | null
          harvest_completed_by?: string | null
          harvest_date?: string | null
          harvest_grower_sign?: string | null
          harvest_grower_sign_date?: string | null
          harvest_manager_sign?: string | null
          harvest_manager_sign_date?: string | null
          harvest_number_plants?: number | null
          harvest_qa_sign?: string | null
          harvest_qa_sign_date?: string | null
          harvest_table_no?: string | null
          id?: string
          increase_in_yield?: string | null
          inspection_completed_by?: string | null
          inspection_date?: string | null
          inspection_number_plants?: number | null
          inspection_rack_no?: string | null
          inspection_table_no?: string | null
          last_transition_tasks?: Json | null
          mortality_checked_by?: string | null
          mortality_completed_by?: string | null
          mortality_general_reason?: string | null
          mortality_total_amount_kg?: number | null
          mortality_total_percentage?: number | null
          mother_no?: string | null
          move_to_flowering_date?: string | null
          move_to_hardening_date?: string | null
          move_to_veg_date?: string | null
          no_of_days_drying?: number | null
          nutrients_used?: string | null
          packing_a_grade?: number | null
          packing_b_grade?: number | null
          packing_bag_ids?: string | null
          packing_c_grade?: number | null
          packing_checked_by?: string | null
          packing_completed_by?: string | null
          packing_date?: string | null
          packing_storage_area?: string | null
          processing_manager_sign?: string | null
          processing_manager_sign_date?: string | null
          processing_qa_sign?: string | null
          processing_qa_sign_date?: string | null
          processor_sign?: string | null
          processor_sign_date?: string | null
          rack_no?: string | null
          stage_transition_history?: Json | null
          status?: string | null
          strain_id?: string | null
          tags?: string[] | null
          total_clones_plants?: number | null
          total_dry_weight?: number | null
          total_plants_processed?: number | null
          total_wet_weight?: number | null
          updated_at?: string | null
          using_extra_lights?: boolean | null
          veg_actual_days?: number | null
          veg_checked_by?: string | null
          veg_completed_by?: string | null
          veg_diseases?: boolean | null
          veg_expected_days?: number | null
          veg_mortalities?: Json | null
          veg_number_plants?: number | null
          veg_pests?: boolean | null
          veg_table_no?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batch_lifecycle_records_clonator_2_completed_by_fkey"
            columns: ["clonator_2_completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_lifecycle_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_lifecycle_records_dry_weight_checked_by_fkey"
            columns: ["dry_weight_checked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_lifecycle_records_dry_weight_completed_by_fkey"
            columns: ["dry_weight_completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_lifecycle_records_drying_checked_by_fkey"
            columns: ["drying_checked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_lifecycle_records_drying_completed_by_fkey"
            columns: ["drying_completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_lifecycle_records_final_manager_sign_fkey"
            columns: ["final_manager_sign"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_lifecycle_records_final_processor_sign_fkey"
            columns: ["final_processor_sign"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_lifecycle_records_final_qa_sign_fkey"
            columns: ["final_qa_sign"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_lifecycle_records_flowering_completed_by_fkey"
            columns: ["flowering_completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_lifecycle_records_flowering_grower_sign_fkey"
            columns: ["flowering_grower_sign"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_lifecycle_records_flowering_manager_sign_fkey"
            columns: ["flowering_manager_sign"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_lifecycle_records_flowering_qa_sign_fkey"
            columns: ["flowering_qa_sign"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_lifecycle_records_hardening_completed_by_fkey"
            columns: ["hardening_completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_lifecycle_records_hardening_grower_sign_fkey"
            columns: ["hardening_grower_sign"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_lifecycle_records_hardening_manager_sign_fkey"
            columns: ["hardening_manager_sign"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_lifecycle_records_hardening_qa_sign_fkey"
            columns: ["hardening_qa_sign"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_lifecycle_records_harvest_completed_by_fkey"
            columns: ["harvest_completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_lifecycle_records_harvest_grower_sign_fkey"
            columns: ["harvest_grower_sign"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_lifecycle_records_harvest_manager_sign_fkey"
            columns: ["harvest_manager_sign"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_lifecycle_records_harvest_qa_sign_fkey"
            columns: ["harvest_qa_sign"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_lifecycle_records_inspection_completed_by_fkey"
            columns: ["inspection_completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_lifecycle_records_mortality_checked_by_fkey"
            columns: ["mortality_checked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_lifecycle_records_mortality_completed_by_fkey"
            columns: ["mortality_completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_lifecycle_records_packing_checked_by_fkey"
            columns: ["packing_checked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_lifecycle_records_packing_completed_by_fkey"
            columns: ["packing_completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_lifecycle_records_processing_manager_sign_fkey"
            columns: ["processing_manager_sign"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_lifecycle_records_processing_qa_sign_fkey"
            columns: ["processing_qa_sign"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_lifecycle_records_processor_sign_fkey"
            columns: ["processor_sign"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_lifecycle_records_veg_completed_by_fkey"
            columns: ["veg_completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_instances: {
        Row: {
          approval_notes: string | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          batch_id: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          created_by: string | null
          id: string
          instance_name: string
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          status: string | null
          submitted_at: string | null
          submitted_by: string | null
          template_id: string
          updated_at: string | null
        }
        Insert: {
          approval_notes?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          batch_id?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          instance_name: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          template_id: string
          updated_at?: string | null
        }
        Update: {
          approval_notes?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          batch_id?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          instance_name?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          template_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_instances_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batch_lifecycle_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_instances_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_item_responses: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          id: string
          instance_id: string
          is_completed: boolean | null
          notes: string | null
          response_value: string | null
          template_item_id: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          instance_id: string
          is_completed?: boolean | null
          notes?: string | null
          response_value?: string | null
          template_item_id: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          instance_id?: string
          is_completed?: boolean | null
          notes?: string | null
          response_value?: string | null
          template_item_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_item_responses_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "checklist_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_item_responses_template_item_id_fkey"
            columns: ["template_item_id"]
            isOneToOne: false
            referencedRelation: "checklist_template_items"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_template_items: {
        Row: {
          created_at: string | null
          id: string
          is_required: boolean | null
          item_label: string
          item_type: string
          section_name: string | null
          sort_order: number | null
          template_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          item_label: string
          item_type: string
          section_name?: string | null
          sort_order?: number | null
          template_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          item_label?: string
          item_type?: string
          section_name?: string | null
          sort_order?: number | null
          template_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_templates: {
        Row: {
          approval_workflow: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          frequency: string
          id: string
          is_active: boolean | null
          is_batch_specific: boolean | null
          lifecycle_phase: string | null
          sof_number: string
          task_category: string | null
          template_name: string
          updated_at: string | null
        }
        Insert: {
          approval_workflow?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          is_batch_specific?: boolean | null
          lifecycle_phase?: string | null
          sof_number: string
          task_category?: string | null
          template_name: string
          updated_at?: string | null
        }
        Update: {
          approval_workflow?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          is_batch_specific?: boolean | null
          lifecycle_phase?: string | null
          sof_number?: string
          task_category?: string | null
          template_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_receipts: {
        Row: {
          batch_number: string | null
          created_at: string
          created_by: string | null
          id: string
          month: string
          notes: string | null
          product_name: string
          quantity: number
          receipt_date: string
          receipt_file_path: string | null
          receipt_number: string
          receipt_time: string
          receipt_type: Database["public"]["Enums"]["inventory_receipt_type"]
          received_by_id: string
          receiver_signature_id: string | null
          responsible_person_id: string | null
          supplier_name: string
          unit: Database["public"]["Enums"]["inventory_unit"]
          updated_at: string
          usage_area: string | null
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          month: string
          notes?: string | null
          product_name: string
          quantity: number
          receipt_date: string
          receipt_file_path?: string | null
          receipt_number: string
          receipt_time: string
          receipt_type: Database["public"]["Enums"]["inventory_receipt_type"]
          received_by_id: string
          receiver_signature_id?: string | null
          responsible_person_id?: string | null
          supplier_name: string
          unit: Database["public"]["Enums"]["inventory_unit"]
          updated_at?: string
          usage_area?: string | null
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          month?: string
          notes?: string | null
          product_name?: string
          quantity?: number
          receipt_date?: string
          receipt_file_path?: string | null
          receipt_number?: string
          receipt_time?: string
          receipt_type?: Database["public"]["Enums"]["inventory_receipt_type"]
          received_by_id?: string
          receiver_signature_id?: string | null
          responsible_person_id?: string | null
          supplier_name?: string
          unit?: Database["public"]["Enums"]["inventory_unit"]
          updated_at?: string
          usage_area?: string | null
        }
        Relationships: []
      }
      inventory_usage: {
        Row: {
          batch_number: string | null
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          product_name: string
          product_type: Database["public"]["Enums"]["inventory_receipt_type"]
          quantity: number
          unit: Database["public"]["Enums"]["inventory_unit"]
          updated_at: string
          usage_area: string | null
          usage_date: string
          used_by: string | null
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          product_name: string
          product_type?: Database["public"]["Enums"]["inventory_receipt_type"]
          quantity: number
          unit: Database["public"]["Enums"]["inventory_unit"]
          updated_at?: string
          usage_area?: string | null
          usage_date: string
          used_by?: string | null
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          product_name?: string
          product_type?: Database["public"]["Enums"]["inventory_receipt_type"]
          quantity?: number
          unit?: Database["public"]["Enums"]["inventory_unit"]
          updated_at?: string
          usage_area?: string | null
          usage_date?: string
          used_by?: string | null
        }
        Relationships: []
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
        Relationships: []
      }
      nomenclature_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          entity_type: string
          format_pattern: string
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          entity_type: string
          format_pattern: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          entity_type?: string
          format_pattern?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      permission_definitions: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          permission_key: string
          permission_name: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          permission_key: string
          permission_name: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          permission_key?: string
          permission_name?: string
          updated_at?: string | null
        }
        Relationships: []
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
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          is_granted: boolean
          permission_key: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_granted?: boolean
          permission_key: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_granted?: boolean
          permission_key?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      sof03_phase_gate_submissions: {
        Row: {
          all_checks_passed: boolean | null
          batch_id: string
          batch_number: string
          clones_healthy: boolean
          created_at: string | null
          documentation_complete: boolean
          environmental_conditions_met: boolean
          id: string
          no_disease_present: boolean
          no_pest_infestation: boolean
          notes: string | null
          phase_change_approved: boolean | null
          quality_check_passed: boolean
          rework_task_id: string | null
          root_development_adequate: boolean
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string | null
        }
        Insert: {
          all_checks_passed?: boolean | null
          batch_id: string
          batch_number: string
          clones_healthy?: boolean
          created_at?: string | null
          documentation_complete?: boolean
          environmental_conditions_met?: boolean
          id?: string
          no_disease_present?: boolean
          no_pest_infestation?: boolean
          notes?: string | null
          phase_change_approved?: boolean | null
          quality_check_passed?: boolean
          rework_task_id?: string | null
          root_development_adequate?: boolean
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string | null
        }
        Update: {
          all_checks_passed?: boolean | null
          batch_id?: string
          batch_number?: string
          clones_healthy?: boolean
          created_at?: string | null
          documentation_complete?: boolean
          environmental_conditions_met?: boolean
          id?: string
          no_disease_present?: boolean
          no_pest_infestation?: boolean
          notes?: string | null
          phase_change_approved?: boolean | null
          quality_check_passed?: boolean
          rework_task_id?: string | null
          root_development_adequate?: boolean
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sof03_phase_gate_submissions_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batch_lifecycle_records"
            referencedColumns: ["id"]
          },
        ]
      }
      task_field_mappings: {
        Row: {
          applicable_stages: string[]
          created_at: string | null
          field_mappings: Json
          id: string
          is_active: boolean | null
          sof_number: string
          task_category: string
          updated_at: string | null
        }
        Insert: {
          applicable_stages: string[]
          created_at?: string | null
          field_mappings: Json
          id?: string
          is_active?: boolean | null
          sof_number: string
          task_category: string
          updated_at?: string | null
        }
        Update: {
          applicable_stages?: string[]
          created_at?: string | null
          field_mappings?: Json
          id?: string
          is_active?: boolean | null
          sof_number?: string
          task_category?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      task_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_notifications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_number_counters: {
        Row: {
          counter: number
          created_at: string | null
          date_key: string
          updated_at: string | null
        }
        Insert: {
          counter?: number
          created_at?: string | null
          date_key: string
          updated_at?: string | null
        }
        Update: {
          counter?: number
          created_at?: string | null
          date_key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          approval_history: Json | null
          approval_status: string | null
          assignee: string | null
          batch_id: string | null
          checklist_id: string | null
          checklist_items: Json | null
          completion_progress: Json | null
          created_at: string
          created_by: string | null
          current_approval_stage: number | null
          description: string | null
          due_date: string | null
          id: string
          lifecycle_stage:
            | Database["public"]["Enums"]["batch_lifecycle_stage"]
            | null
          name: string
          priority_level: Database["public"]["Enums"]["task_priority"] | null
          rejection_reason: string | null
          status: string
          task_category: Database["public"]["Enums"]["task_category"] | null
          task_number: string
          template_item_id: string | null
          updated_at: string
        }
        Insert: {
          approval_history?: Json | null
          approval_status?: string | null
          assignee?: string | null
          batch_id?: string | null
          checklist_id?: string | null
          checklist_items?: Json | null
          completion_progress?: Json | null
          created_at?: string
          created_by?: string | null
          current_approval_stage?: number | null
          description?: string | null
          due_date?: string | null
          id?: string
          lifecycle_stage?:
            | Database["public"]["Enums"]["batch_lifecycle_stage"]
            | null
          name: string
          priority_level?: Database["public"]["Enums"]["task_priority"] | null
          rejection_reason?: string | null
          status?: string
          task_category?: Database["public"]["Enums"]["task_category"] | null
          task_number: string
          template_item_id?: string | null
          updated_at?: string
        }
        Update: {
          approval_history?: Json | null
          approval_status?: string | null
          assignee?: string | null
          batch_id?: string | null
          checklist_id?: string | null
          checklist_items?: Json | null
          completion_progress?: Json | null
          created_at?: string
          created_by?: string | null
          current_approval_stage?: number | null
          description?: string | null
          due_date?: string | null
          id?: string
          lifecycle_stage?:
            | Database["public"]["Enums"]["batch_lifecycle_stage"]
            | null
          name?: string
          priority_level?: Database["public"]["Enums"]["task_priority"] | null
          rejection_reason?: string | null
          status?: string
          task_category?: Database["public"]["Enums"]["task_category"] | null
          task_number?: string
          template_item_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_fkey"
            columns: ["assignee"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batch_lifecycle_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permission_overrides: {
        Row: {
          created_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_granted: boolean
          notes: string | null
          permission_key: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_granted?: boolean
          notes?: string | null
          permission_key: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_granted?: boolean
          notes?: string | null
          permission_key?: string
          updated_at?: string | null
          user_id?: string
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
      generate_batch_number: {
        Args: { creation_date?: string }
        Returns: string
      }
      generate_receipt_number: {
        Args: { receipt_date?: string }
        Returns: string
      }
      generate_task_number: {
        Args: { creation_date?: string }
        Returns: string
      }
      has_permission: {
        Args: { _permission_key: string; _user_id: string }
        Returns: boolean
      }
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
      batch_lifecycle_stage:
        | "preclone"
        | "clone_germination"
        | "hardening"
        | "vegetative"
        | "flowering_grow_room"
        | "preharvest"
        | "harvest"
        | "processing_drying"
        | "packing_storage"
      batch_stage:
        | "cloning"
        | "rooting"
        | "vegetation"
        | "flowering"
        | "harvest"
        | "processing"
        | "completed"
      checklist_frequency: "daily" | "weekly" | "monthly" | "on_demand"
      checklist_item_type:
        | "boolean"
        | "yes_no"
        | "text"
        | "number"
        | "date"
        | "signature"
        | "multi_day_boolean"
      inventory_receipt_type:
        | "chemical"
        | "fertilizer"
        | "seeds"
        | "growing_media"
        | "packaging"
        | "equipment"
        | "harvest_output"
        | "other"
      inventory_unit:
        | "kg"
        | "g"
        | "l"
        | "ml"
        | "units"
        | "boxes"
        | "bags"
        | "packs"
      lifecycle_phase:
        | "cloning"
        | "hardening"
        | "vegetative"
        | "flowering"
        | "harvest"
        | "processing"
        | "drying"
        | "packing"
        | "mortality"
        | "scouting"
        | "general"
      sof_field_type:
        | "text"
        | "number"
        | "date"
        | "checkbox"
        | "textarea"
        | "select"
        | "signature"
      task_category:
        | "daily_cloning_transplant"
        | "mortality_discard"
        | "weekly_cultivation"
        | "clonator_weekly"
        | "soil_moisture"
        | "scouting_corrective"
        | "chemical_delivery"
        | "fertigation_application"
        | "ipm_chemical_mixing"
        | "hygiene_check"
        | "cultivation_cleaning"
        | "processing_cleaning"
        | "pre_harvest"
        | "final_harvest"
      task_priority: "low" | "medium" | "high" | "critical"
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
      batch_lifecycle_stage: [
        "preclone",
        "clone_germination",
        "hardening",
        "vegetative",
        "flowering_grow_room",
        "preharvest",
        "harvest",
        "processing_drying",
        "packing_storage",
      ],
      batch_stage: [
        "cloning",
        "rooting",
        "vegetation",
        "flowering",
        "harvest",
        "processing",
        "completed",
      ],
      checklist_frequency: ["daily", "weekly", "monthly", "on_demand"],
      checklist_item_type: [
        "boolean",
        "yes_no",
        "text",
        "number",
        "date",
        "signature",
        "multi_day_boolean",
      ],
      inventory_receipt_type: [
        "chemical",
        "fertilizer",
        "seeds",
        "growing_media",
        "packaging",
        "equipment",
        "harvest_output",
        "other",
      ],
      inventory_unit: ["kg", "g", "l", "ml", "units", "boxes", "bags", "packs"],
      lifecycle_phase: [
        "cloning",
        "hardening",
        "vegetative",
        "flowering",
        "harvest",
        "processing",
        "drying",
        "packing",
        "mortality",
        "scouting",
        "general",
      ],
      sof_field_type: [
        "text",
        "number",
        "date",
        "checkbox",
        "textarea",
        "select",
        "signature",
      ],
      task_category: [
        "daily_cloning_transplant",
        "mortality_discard",
        "weekly_cultivation",
        "clonator_weekly",
        "soil_moisture",
        "scouting_corrective",
        "chemical_delivery",
        "fertigation_application",
        "ipm_chemical_mixing",
        "hygiene_check",
        "cultivation_cleaning",
        "processing_cleaning",
        "pre_harvest",
        "final_harvest",
      ],
      task_priority: ["low", "medium", "high", "critical"],
    },
  },
} as const
