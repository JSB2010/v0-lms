export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          author_id: string
          course_id: string | null
          is_school_wide: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          author_id: string
          course_id?: string | null
          is_school_wide?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          author_id?: string
          course_id?: string | null
          is_school_wide?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      assignments: {
        Row: {
          id: string
          title: string
          description: string | null
          course_id: string
          due_date: string
          total_points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          course_id: string
          due_date: string
          total_points: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          course_id?: string
          due_date?: string
          total_points?: number
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          name: string
          description: string | null
          teacher_id: string
          period: string | null
          school_year: string
          semester: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          teacher_id: string
          period?: string | null
          school_year: string
          semester: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          teacher_id?: string
          period?: string | null
          school_year?: string
          semester?: string
          created_at?: string
          updated_at?: string
        }
      }
      enrollments: {
        Row: {
          student_id: string
          course_id: string
          created_at: string
        }
        Insert: {
          student_id: string
          course_id: string
          created_at?: string
        }
        Update: {
          student_id?: string
          course_id?: string
          created_at?: string
        }
      }
      grades: {
        Row: {
          id: string
          student_id: string
          course_id: string
          assignment_id: string | null
          grade_type: string
          points_earned: number
          points_possible: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          course_id: string
          assignment_id?: string | null
          grade_type: string
          points_earned: number
          points_possible: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          course_id?: string
          assignment_id?: string | null
          grade_type?: string
          points_earned?: number
          points_possible?: number
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          subject: string
          content: string
          is_read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id: string
          subject: string
          content: string
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string
          subject?: string
          content?: string
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      parent_student: {
        Row: {
          parent_id: string
          student_id: string
          created_at: string
        }
        Insert: {
          parent_id: string
          student_id: string
          created_at?: string
        }
        Update: {
          parent_id?: string
          student_id?: string
          created_at?: string
        }
      }
      parents: {
        Row: {
          id: string
          profile_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          profile_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          student_id: string
          amount: number
          description: string
          payment_date: string | null
          due_date: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          amount: number
          description: string
          payment_date?: string | null
          due_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          amount?: number
          description?: string
          payment_date?: string | null
          due_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name: string
          last_name: string
          email: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          profile_id: string
          grade: string
          graduation_year: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          profile_id: string
          grade: string
          graduation_year?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          grade?: string
          graduation_year?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          assignment_id: string
          student_id: string
          submission_url: string | null
          submission_text: string | null
          submitted_at: string
          status: string
          points_earned: number | null
          feedback: string | null
          graded_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assignment_id: string
          student_id: string
          submission_url?: string | null
          submission_text?: string | null
          submitted_at?: string
          status?: string
          points_earned?: number | null
          feedback?: string | null
          graded_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assignment_id?: string
          student_id?: string
          submission_url?: string | null
          submission_text?: string | null
          submitted_at?: string
          status?: string
          points_earned?: number | null
          feedback?: string | null
          graded_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teachers: {
        Row: {
          id: string
          profile_id: string
          department: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          profile_id: string
          department: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          department?: string
          created_at?: string
          updated_at?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          title: string
          description: string | null
          start_date: string
          end_date: string | null
          event_type: string
          course_id: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          start_date: string
          end_date?: string | null
          event_type: string
          course_id?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          start_date?: string
          end_date?: string | null
          event_type?: string
          course_id?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          student_id: string
          course_id: string
          date: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          course_id: string
          date: string
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          course_id?: string
          date?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      course_modules: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          order: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
      course_content: {
        Row: {
          id: string
          module_id: string
          title: string
          content_type: string
          content: string
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          module_id: string
          title: string
          content_type: string
          content: string
          order: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          title?: string
          content_type?: string
          content?: string
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
      departments: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_gpa: {
        Args: {
          student_uuid: string
        }
        Returns: number
      }
    }
    Enums: {
      user_role: "student" | "teacher" | "parent" | "admin"
    }
  }
}
