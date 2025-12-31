export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      households: {
        Row: {
          id: string
          name: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      household_members: {
        Row: {
          id: string
          household_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          joined_at: string
        }
        Insert: {
          id?: string
          household_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member'
          joined_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          joined_at?: string
        }
      }
      chores: {
        Row: {
          id: string
          household_id: string
          title: string
          description: string | null
          frequency: 'daily' | 'weekly' | 'monthly' | 'once'
          points: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          title: string
          description?: string | null
          frequency?: 'daily' | 'weekly' | 'monthly' | 'once'
          points?: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          title?: string
          description?: string | null
          frequency?: 'daily' | 'weekly' | 'monthly' | 'once'
          points?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      chore_assignments: {
        Row: {
          id: string
          chore_id: string
          assigned_to: string
          due_date: string | null
          completed_at: string | null
          status: 'pending' | 'completed' | 'overdue'
          created_at: string
        }
        Insert: {
          id?: string
          chore_id: string
          assigned_to: string
          due_date?: string | null
          completed_at?: string | null
          status?: 'pending' | 'completed' | 'overdue'
          created_at?: string
        }
        Update: {
          id?: string
          chore_id?: string
          assigned_to?: string
          due_date?: string | null
          completed_at?: string | null
          status?: 'pending' | 'completed' | 'overdue'
          created_at?: string
        }
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
  }
}
