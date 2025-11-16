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
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          consultation_type: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          payment_amount: number | null
          payment_id: string | null
          payment_status: string | null
          pet_name: string
          pet_owner_id: string
          pet_type: string
          reason: string
          status: Database["public"]["Enums"]["appointment_status"] | null
          updated_at: string | null
          vet_id: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          consultation_type?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          payment_amount?: number | null
          payment_id?: string | null
          payment_status?: string | null
          pet_name: string
          pet_owner_id: string
          pet_type: string
          reason: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          updated_at?: string | null
          vet_id: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          consultation_type?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          payment_amount?: number | null
          payment_id?: string | null
          payment_status?: string | null
          pet_name?: string
          pet_owner_id?: string
          pet_type?: string
          reason?: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          updated_at?: string | null
          vet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_pet_owner_id_fkey"
            columns: ["pet_owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_vet_id_fkey"
            columns: ["vet_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_videos: {
        Row: {
          appointment_id: string | null
          created_at: string
          description: string | null
          id: string
          pet_owner_id: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          vet_id: string
          video_url: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          pet_owner_id: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          vet_id: string
          video_url: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          pet_owner_id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          vet_id?: string
          video_url?: string
        }
        Relationships: []
      }
      medical_records: {
        Row: {
          created_at: string
          date: string
          description: string | null
          file_urls: string[] | null
          id: string
          pet_name: string
          pet_owner_id: string
          title: string
          type: string
          updated_at: string
          veterinarian: string | null
        }
        Insert: {
          created_at?: string
          date: string
          description?: string | null
          file_urls?: string[] | null
          id?: string
          pet_name: string
          pet_owner_id: string
          title: string
          type: string
          updated_at?: string
          veterinarian?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          description?: string | null
          file_urls?: string[] | null
          id?: string
          pet_name?: string
          pet_owner_id?: string
          title?: string
          type?: string
          updated_at?: string
          veterinarian?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          appointment_id: string | null
          content: string
          created_at: string
          id: string
          read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          appointment_id?: string | null
          content: string
          created_at?: string
          id?: string
          read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          appointment_id?: string | null
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_owner_profiles: {
        Row: {
          address: string | null
          emergency_contact: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          id: string
          preferred_contact_method: string | null
        }
        Insert: {
          address?: string | null
          emergency_contact?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          id: string
          preferred_contact_method?: string | null
        }
        Update: {
          address?: string | null
          emergency_contact?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          id?: string
          preferred_contact_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pet_owner_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          appointment_id: string | null
          created_at: string
          diagnosis: string | null
          dosage: string
          duration: string
          frequency: string
          id: string
          instructions: string | null
          issued_date: string
          medication_name: string
          notes: string | null
          pet_name: string
          pet_owner_id: string
          status: string
          updated_at: string
          vet_id: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          diagnosis?: string | null
          dosage: string
          duration: string
          frequency: string
          id?: string
          instructions?: string | null
          issued_date?: string
          medication_name: string
          notes?: string | null
          pet_name: string
          pet_owner_id: string
          status?: string
          updated_at?: string
          vet_id: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          diagnosis?: string | null
          dosage?: string
          duration?: string
          frequency?: string
          id?: string
          instructions?: string | null
          issued_date?: string
          medication_name?: string
          notes?: string | null
          pet_name?: string
          pet_owner_id?: string
          status?: string
          updated_at?: string
          vet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          facebook_profile: string | null
          full_name: string
          id: string
          instagram_handle: string | null
          phone: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          facebook_profile?: string | null
          full_name: string
          id: string
          instagram_handle?: string | null
          phone: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          facebook_profile?: string | null
          full_name?: string
          id?: string
          instagram_handle?: string | null
          phone?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      vaccination_schedule: {
        Row: {
          created_at: string
          due_date: string
          id: string
          notes: string | null
          pet_name: string
          pet_owner_id: string
          reminder_sent: boolean | null
          status: string
          updated_at: string
          vaccine_name: string
        }
        Insert: {
          created_at?: string
          due_date: string
          id?: string
          notes?: string | null
          pet_name: string
          pet_owner_id: string
          reminder_sent?: boolean | null
          status?: string
          updated_at?: string
          vaccine_name: string
        }
        Update: {
          created_at?: string
          due_date?: string
          id?: string
          notes?: string | null
          pet_name?: string
          pet_owner_id?: string
          reminder_sent?: boolean | null
          status?: string
          updated_at?: string
          vaccine_name?: string
        }
        Relationships: []
      }
      vet_profiles: {
        Row: {
          available_days: string[] | null
          available_hours_end: string | null
          available_hours_start: string | null
          clinic_address: string | null
          clinic_name: string | null
          id: string
          license_number: string
          specialization: string
          years_of_experience: number | null
        }
        Insert: {
          available_days?: string[] | null
          available_hours_end?: string | null
          available_hours_start?: string | null
          clinic_address?: string | null
          clinic_name?: string | null
          id: string
          license_number: string
          specialization: string
          years_of_experience?: number | null
        }
        Update: {
          available_days?: string[] | null
          available_hours_end?: string | null
          available_hours_start?: string | null
          clinic_address?: string | null
          clinic_name?: string | null
          id?: string
          license_number?: string
          specialization?: string
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vet_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
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
      appointment_status: "pending" | "confirmed" | "completed" | "cancelled"
      user_role: "vet" | "pet_owner"
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
      appointment_status: ["pending", "confirmed", "completed", "cancelled"],
      user_role: ["vet", "pet_owner"],
    },
  },
} as const
