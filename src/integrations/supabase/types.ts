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
      activity_log: {
        Row: {
          action: string
          created_at: string
          details: string | null
          id: string
          kind: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          id?: string
          kind?: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          kind?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          att_date: string
          class_batch: string
          created_at: string
          faculty_id: string | null
          id: string
          lab_id: string
          status: string
          student_id: string
          subject: string
        }
        Insert: {
          att_date: string
          class_batch: string
          created_at?: string
          faculty_id?: string | null
          id?: string
          lab_id: string
          status: string
          student_id: string
          subject: string
        }
        Update: {
          att_date?: string
          class_batch?: string
          created_at?: string
          faculty_id?: string | null
          id?: string
          lab_id?: string
          status?: string
          student_id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          admin_note: string | null
          booking_date: string
          class_batch: string
          created_at: string
          created_by: string | null
          end_time: string
          faculty_id: string
          id: string
          lab_id: string
          purpose: string | null
          start_time: string
          status: string
          subject: string
        }
        Insert: {
          admin_note?: string | null
          booking_date: string
          class_batch: string
          created_at?: string
          created_by?: string | null
          end_time: string
          faculty_id: string
          id?: string
          lab_id: string
          purpose?: string | null
          start_time: string
          status?: string
          subject: string
        }
        Update: {
          admin_note?: string | null
          booking_date?: string
          class_batch?: string
          created_at?: string
          created_by?: string | null
          end_time?: string
          faculty_id?: string
          id?: string
          lab_id?: string
          purpose?: string | null
          start_time?: string
          status?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          brand: string | null
          category: string
          code: string
          condition: string
          created_at: string
          id: string
          lab_id: string | null
          model: string | null
          name: string
          purchase_date: string | null
          quantity: number
          serial_no: string | null
          status: string
          warranty_expiry: string | null
        }
        Insert: {
          brand?: string | null
          category: string
          code: string
          condition?: string
          created_at?: string
          id?: string
          lab_id?: string | null
          model?: string | null
          name: string
          purchase_date?: string | null
          quantity?: number
          serial_no?: string | null
          status?: string
          warranty_expiry?: string | null
        }
        Update: {
          brand?: string | null
          category?: string
          code?: string
          condition?: string
          created_at?: string
          id?: string
          lab_id?: string | null
          model?: string | null
          name?: string
          purchase_date?: string | null
          quantity?: number
          serial_no?: string | null
          status?: string
          warranty_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty: {
        Row: {
          assigned_lab_id: string | null
          code: string
          created_at: string
          department: string
          email: string
          id: string
          name: string
          phone: string | null
          specialization: string | null
          user_id: string | null
        }
        Insert: {
          assigned_lab_id?: string | null
          code: string
          created_at?: string
          department: string
          email: string
          id?: string
          name: string
          phone?: string | null
          specialization?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_lab_id?: string | null
          code?: string
          created_at?: string
          department?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          specialization?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faculty_lab_fk"
            columns: ["assigned_lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          category: string
          code: string
          id: string
          lab_id: string | null
          min_stock: number
          name: string
          quantity: number
          supplier: string | null
          updated_at: string
        }
        Insert: {
          category: string
          code: string
          id?: string
          lab_id?: string | null
          min_stock?: number
          name: string
          quantity?: number
          supplier?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          code?: string
          id?: string
          lab_id?: string | null
          min_stock?: number
          name?: string
          quantity?: number
          supplier?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
        ]
      }
      labs: {
        Row: {
          building: string
          capacity: number
          code: string
          created_at: string
          department: string
          faculty_id: string | null
          floor: string
          id: string
          lab_type: string
          name: string
          room: string
          status: string
        }
        Insert: {
          building: string
          capacity?: number
          code: string
          created_at?: string
          department: string
          faculty_id?: string | null
          floor: string
          id?: string
          lab_type: string
          name: string
          room: string
          status?: string
        }
        Update: {
          building?: string
          capacity?: number
          code?: string
          created_at?: string
          department?: string
          faculty_id?: string | null
          floor?: string
          id?: string
          lab_type?: string
          name?: string
          room?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "labs_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_requests: {
        Row: {
          code: string
          created_at: string
          description: string
          equipment_id: string | null
          id: string
          image_url: string | null
          issue_type: string
          lab_id: string | null
          priority: string
          reported_by: string | null
          reporter_name: string
          resolution: string | null
          status: string
          technician: string | null
          updated_at: string
        }
        Insert: {
          code?: string
          created_at?: string
          description: string
          equipment_id?: string | null
          id?: string
          image_url?: string | null
          issue_type?: string
          lab_id?: string | null
          priority?: string
          reported_by?: string | null
          reporter_name: string
          resolution?: string | null
          status?: string
          technician?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          equipment_id?: string | null
          id?: string
          image_url?: string | null
          issue_type?: string
          lab_id?: string | null
          priority?: string
          reported_by?: string | null
          reporter_name?: string
          resolution?: string | null
          status?: string
          technician?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          code: string
          created_at: string
          department: string
          email: string
          id: string
          lab_id: string | null
          name: string
          roll_no: string
          section: string
          user_id: string | null
          year: number
        }
        Insert: {
          code: string
          created_at?: string
          department: string
          email: string
          id?: string
          lab_id?: string | null
          name: string
          roll_no: string
          section: string
          user_id?: string | null
          year: number
        }
        Update: {
          code?: string
          created_at?: string
          department?: string
          email?: string
          id?: string
          lab_id?: string | null
          name?: string
          roll_no?: string
          section?: string
          user_id?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "students_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      log_activity: {
        Args: { _action: string; _details: string; _kind: string }
        Returns: undefined
      }
      my_faculty_id: { Args: never; Returns: string }
      my_student_id: { Args: never; Returns: string }
      notify_admins: {
        Args: { _msg: string; _title: string; _type: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "faculty" | "student"
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
    Enums: {
      app_role: ["admin", "faculty", "student"],
    },
  },
} as const
