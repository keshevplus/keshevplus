import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://axpittefvgyqsryylykh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4cGl0dGVmdmd5cXNyeXlseWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzk3NjMsImV4cCI6MjA2OTk1NTc2M30.8607KgyGfhh2iWguW_N79pAwK097jL4IkZTx7n92KrA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
      // Add your table types here
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