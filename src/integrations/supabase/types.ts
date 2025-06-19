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
      applications: {
        Row: {
          applied_at: string | null
          candidate_id: string
          cover_letter: string | null
          id: string
          job_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          applied_at?: string | null
          candidate_id: string
          cover_letter?: string | null
          id?: string
          job_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          applied_at?: string | null
          candidate_id?: string
          cover_letter?: string | null
          id?: string
          job_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_education: {
        Row: {
          candidate_id: string | null
          created_at: string | null
          document_url: string | null
          id: string
          qualification_type: string
          updated_at: string | null
        }
        Insert: {
          candidate_id?: string | null
          created_at?: string | null
          document_url?: string | null
          id?: string
          qualification_type: string
          updated_at?: string | null
        }
        Update: {
          candidate_id?: string | null
          created_at?: string | null
          document_url?: string | null
          id?: string
          qualification_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_education_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          age: number | null
          created_at: string | null
          education: string | null
          email: string | null
          experience: string | null
          gender: string | null
          id: string
          id_passport: string | null
          license_number: string | null
          license_type: string | null
          location: string | null
          name: string | null
          phone: string | null
          resume_url: string | null
          skills: string[] | null
          surname: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          age?: number | null
          created_at?: string | null
          education?: string | null
          email?: string | null
          experience?: string | null
          gender?: string | null
          id?: string
          id_passport?: string | null
          license_number?: string | null
          license_type?: string | null
          location?: string | null
          name?: string | null
          phone?: string | null
          resume_url?: string | null
          skills?: string[] | null
          surname?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          age?: number | null
          created_at?: string | null
          education?: string | null
          email?: string | null
          experience?: string | null
          gender?: string | null
          id?: string
          id_passport?: string | null
          license_number?: string | null
          license_type?: string | null
          location?: string | null
          name?: string | null
          phone?: string | null
          resume_url?: string | null
          skills?: string[] | null
          surname?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      job_postings: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          country: string
          created_at: string
          employer: string
          experience_level: string
          expires_at: string
          id: string
          job_description: string
          job_title: string
          notice_period: string | null
          post_duration: string
          qualification: string
          recruiter_id: string
          skills_required: string[] | null
          state: string
          status: string | null
          updated_at: string
          website: string | null
          zip_code: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          country: string
          created_at?: string
          employer: string
          experience_level: string
          expires_at: string
          id?: string
          job_description: string
          job_title: string
          notice_period?: string | null
          post_duration: string
          qualification: string
          recruiter_id: string
          skills_required?: string[] | null
          state: string
          status?: string | null
          updated_at?: string
          website?: string | null
          zip_code: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          country?: string
          created_at?: string
          employer?: string
          experience_level?: string
          expires_at?: string
          id?: string
          job_description?: string
          job_title?: string
          notice_period?: string | null
          post_duration?: string
          qualification?: string
          recruiter_id?: string
          skills_required?: string[] | null
          state?: string
          status?: string | null
          updated_at?: string
          website?: string | null
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiters"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          created_at: string | null
          experience_level: string | null
          id: string
          job_description: string | null
          location: string | null
          notice_period: string | null
          qualification: string | null
          recruiter_id: string
          skills_required: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          experience_level?: string | null
          id?: string
          job_description?: string | null
          location?: string | null
          notice_period?: string | null
          qualification?: string | null
          recruiter_id: string
          skills_required?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          experience_level?: string | null
          id?: string
          job_description?: string | null
          location?: string | null
          notice_period?: string | null
          qualification?: string | null
          recruiter_id?: string
          skills_required?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiters"
            referencedColumns: ["id"]
          },
        ]
      }
      recruiters: {
        Row: {
          company_name: string | null
          created_at: string | null
          description: string | null
          id: string
          industry: string | null
          location: string | null
          logo_url: string | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      application_status: "applied" | "under_review" | "rejected" | "hired"
      experience_level: "fresher" | "experienced"
      user_role: "candidate" | "recruiter" | "admin"
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
    Enums: {
      application_status: ["applied", "under_review", "rejected", "hired"],
      experience_level: ["fresher", "experienced"],
      user_role: ["candidate", "recruiter", "admin"],
    },
  },
} as const
