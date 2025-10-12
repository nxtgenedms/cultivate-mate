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
          status: string | null
          strain_id: string | null
          total_clones_plants: number | null
          total_dry_weight: number | null
          total_plants_processed: number | null
          total_wet_weight: number | null
          updated_at: string | null
          using_extra_lights: boolean | null
          veg_actual_days: number | null
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
          status?: string | null
          strain_id?: string | null
          total_clones_plants?: number | null
          total_dry_weight?: number | null
          total_plants_processed?: number | null
          total_wet_weight?: number | null
          updated_at?: string | null
          using_extra_lights?: boolean | null
          veg_actual_days?: number | null
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
          status?: string | null
          strain_id?: string | null
          total_clones_plants?: number | null
          total_dry_weight?: number | null
          total_plants_processed?: number | null
          total_wet_weight?: number | null
          updated_at?: string | null
          using_extra_lights?: boolean | null
          veg_actual_days?: number | null
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
            foreignKeyName: "batch_lifecycle_records_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
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
          dome_no: string | null
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
          strain_id: string | null
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
          dome_no?: string | null
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
          strain_id?: string | null
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
          dome_no?: string | null
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
          strain_id?: string | null
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
      sof_audit_history: {
        Row: {
          action: string
          change_description: string | null
          changed_at: string
          changed_by: string | null
          field_id: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string
          sof_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          change_description?: string | null
          changed_at?: string
          changed_by?: string | null
          field_id?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          sof_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          change_description?: string | null
          changed_at?: string
          changed_by?: string | null
          field_id?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          sof_id?: string | null
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "sof_audit_history_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "sof_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sof_audit_history_sof_id_fkey"
            columns: ["sof_id"]
            isOneToOne: false
            referencedRelation: "sofs"
            referencedColumns: ["id"]
          },
        ]
      }
      sof_fields: {
        Row: {
          created_at: string | null
          field_group: string | null
          field_key: string
          field_label: string
          field_type: Database["public"]["Enums"]["sof_field_type"]
          id: string
          is_required: boolean | null
          metadata: Json | null
          options: Json | null
          sof_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          field_group?: string | null
          field_key: string
          field_label: string
          field_type: Database["public"]["Enums"]["sof_field_type"]
          id?: string
          is_required?: boolean | null
          metadata?: Json | null
          options?: Json | null
          sof_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          field_group?: string | null
          field_key?: string
          field_label?: string
          field_type?: Database["public"]["Enums"]["sof_field_type"]
          id?: string
          is_required?: boolean | null
          metadata?: Json | null
          options?: Json | null
          sof_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sof_fields_sof_id_fkey"
            columns: ["sof_id"]
            isOneToOne: false
            referencedRelation: "sofs"
            referencedColumns: ["id"]
          },
        ]
      }
      sofs: {
        Row: {
          approved_by: string | null
          authorised_by: string | null
          compiled_by: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          effective_date: string | null
          id: string
          is_active: boolean | null
          lifecycle_phase: Database["public"]["Enums"]["lifecycle_phase"]
          review_date: string | null
          revision_number: number | null
          sof_number: string
          supersedes: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          authorised_by?: string | null
          compiled_by?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          effective_date?: string | null
          id?: string
          is_active?: boolean | null
          lifecycle_phase: Database["public"]["Enums"]["lifecycle_phase"]
          review_date?: string | null
          revision_number?: number | null
          sof_number: string
          supersedes?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          authorised_by?: string | null
          compiled_by?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          effective_date?: string | null
          id?: string
          is_active?: boolean | null
          lifecycle_phase?: Database["public"]["Enums"]["lifecycle_phase"]
          review_date?: string | null
          revision_number?: number | null
          sof_number?: string
          supersedes?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          name: string
          status: string
          task_number: string
          updated_at: string
        }
        Insert: {
          assignee?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          name: string
          status?: string
          task_number: string
          updated_at?: string
        }
        Update: {
          assignee?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          name?: string
          status?: string
          task_number?: string
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
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        | "cloning"
        | "hardening"
        | "veg"
        | "flowering"
        | "harvest"
        | "processing"
        | "drying"
        | "packing"
        | "completed"
      batch_stage:
        | "cloning"
        | "rooting"
        | "vegetation"
        | "flowering"
        | "harvest"
        | "processing"
        | "completed"
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
        "cloning",
        "hardening",
        "veg",
        "flowering",
        "harvest",
        "processing",
        "drying",
        "packing",
        "completed",
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
    },
  },
} as const
