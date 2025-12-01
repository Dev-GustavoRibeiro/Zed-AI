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
      budgets: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          end_date: string | null
          id: string
          period: string | null
          start_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          period?: string | null
          start_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          period?: string | null
          start_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      checklist_items: {
        Row: {
          checklist_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          order_index: number | null
          title: string
        }
        Insert: {
          checklist_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          order_index?: number | null
          title: string
        }
        Update: {
          checklist_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          order_index?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      checklists: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          template_name: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          template_name?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          template_name?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          all_day: boolean | null
          category: string | null
          created_at: string | null
          description: string | null
          end_time: string | null
          id: string
          location: string | null
          reminder_minutes: number | null
          reminder_sent: boolean | null
          start_time: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          all_day?: boolean | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          reminder_minutes?: number | null
          reminder_sent?: boolean | null
          start_time: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          all_day?: boolean | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          reminder_minutes?: number | null
          reminder_sent?: boolean | null
          start_time?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      goal_milestones: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          goal_id: string
          id: string
          title: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          goal_id: string
          id?: string
          title: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          goal_id?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_suggestions: {
        Row: {
          action_text: string
          created_at: string | null
          goal_id: string
          id: string
        }
        Insert: {
          action_text: string
          created_at?: string | null
          goal_id: string
          id?: string
        }
        Update: {
          action_text?: string
          created_at?: string | null
          goal_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_suggestions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          area: string | null
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          current_value: number | null
          deadline: string | null
          description: string | null
          id: string
          progress_percentage: number | null
          target_value: number | null
          timeframe: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          area?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          deadline?: string | null
          description?: string | null
          id?: string
          progress_percentage?: number | null
          target_value?: number | null
          timeframe?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          area?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          deadline?: string | null
          description?: string | null
          id?: string
          progress_percentage?: number | null
          target_value?: number | null
          timeframe?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          created_at: string | null
          date: string
          focus_tomorrow: string | null
          id: string
          mood: string | null
          notes: string | null
          updated_at: string | null
          user_id: string
          what_can_improve: string | null
          what_went_well: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string
          focus_tomorrow?: string | null
          id?: string
          mood?: string | null
          notes?: string | null
          updated_at?: string | null
          user_id: string
          what_can_improve?: string | null
          what_went_well?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          focus_tomorrow?: string | null
          id?: string
          mood?: string | null
          notes?: string | null
          updated_at?: string | null
          user_id?: string
          what_can_improve?: string | null
          what_went_well?: string | null
        }
        Relationships: []
      }
      journal_insights: {
        Row: {
          created_at: string | null
          id: string
          insight_text: string
          insight_type: string | null
          journal_entry_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          insight_text: string
          insight_type?: string | null
          journal_entry_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          insight_text?: string
          insight_type?: string | null
          journal_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_insights_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_url: string | null
          content: string
          created_at: string | null
          id: string
          role: string
          type: string | null
          user_id: string
        }
        Insert: {
          attachment_url?: string | null
          content: string
          created_at?: string | null
          id?: string
          role: string
          type?: string | null
          user_id: string
        }
        Update: {
          attachment_url?: string | null
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pomodoro_sessions: {
        Row: {
          completed: boolean | null
          created_at: string | null
          duration: number
          end_time: string | null
          id: string
          mode: string | null
          notes: string | null
          start_time: string
          task_id: string | null
          task_title: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          duration: number
          end_time?: string | null
          id?: string
          mode?: string | null
          notes?: string | null
          start_time: string
          task_id?: string | null
          task_title?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          duration?: number
          end_time?: string | null
          id?: string
          mode?: string | null
          notes?: string | null
          start_time?: string
          task_id?: string | null
          task_title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pomodoro_sessions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      routines: {
        Row: {
          created_at: string | null
          days_of_week: number[] | null
          description: string | null
          enabled: boolean | null
          id: string
          time: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          days_of_week?: number[] | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          time: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          days_of_week?: number[] | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          time?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          category: string | null
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          due_time: string | null
          effort: string | null
          energy_level: string | null
          estimated_duration: number | null
          id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          effort?: string | null
          energy_level?: string | null
          estimated_duration?: number | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          effort?: string | null
          energy_level?: string | null
          estimated_duration?: number | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          date: string
          id: string
          notes: string | null
          payment_method: string | null
          receipt_url: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          title?: string
          type?: string
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

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']


