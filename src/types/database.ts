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
      profiles: {
        Row: {
          id: string
          organization_id: number | null
          role_id: number | null
          first_name: string | null
          last_name: string | null
          phone: string | null
          avatar_url: string | null
          job_title: string | null
          timezone: string
          locale: string
          two_factor_enabled: boolean
          is_owner: boolean
          is_active: boolean
          settings: Json | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          organization_id?: number | null
          role_id?: number | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          job_title?: string | null
          timezone?: string
          locale?: string
          two_factor_enabled?: boolean
          is_owner?: boolean
          is_active?: boolean
          settings?: Json | null
          onboarding_completed?: boolean
        }
        Update: {
          id?: string
          organization_id?: number | null
          role_id?: number | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          job_title?: string | null
          timezone?: string
          locale?: string
          two_factor_enabled?: boolean
          is_owner?: boolean
          is_active?: boolean
          settings?: Json | null
          onboarding_completed?: boolean
        }
      }
      subscription_plans: {
        Row: {
          id: number
          code: string
          name: string
          description: string | null
          price_monthly: number
          price_yearly: number
          max_users: number
          max_leads: number
          max_companies: number
          max_deals: number
          max_emails_month: number
          has_api_access: boolean
          has_automation: boolean
          has_reporting: boolean
          has_enrichment: boolean
          has_sequences: boolean
          has_custom_fields: boolean
          has_integrations: boolean
          has_support_priority: boolean
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['subscription_plans']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['subscription_plans']['Insert']>
      }
      organizations: {
        Row: {
          id: number
          uuid: string
          name: string
          slug: string | null
          domain: string | null
          logo_url: string | null
          website: string | null
          industry: string | null
          company_size: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+'
          country: string
          timezone: string
          locale: string
          currency: string
          billing_email: string | null
          billing_address: string | null
          vat_number: string | null
          settings: Json | null
          onboarding_completed: boolean
          trial_ends_at: string | null
          is_active: boolean
          credits_balance: number
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>
      }
      users: {
        Row: {
          id: number
          uuid: string
          organization_id: number
          role_id: number
          email: string
          password: string
          first_name: string
          last_name: string
          phone: string | null
          avatar_url: string | null
          job_title: string | null
          timezone: string
          locale: string
          email_verified_at: string | null
          two_factor_enabled: boolean
          last_login_at: string | null
          last_login_ip: string | null
          is_owner: boolean
          is_active: boolean
          settings: Json | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      roles: {
        Row: {
          id: number
          organization_id: number | null
          code: string
          name: string
          description: string | null
          is_system: boolean
          is_default: boolean
          hierarchy_level: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['roles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['roles']['Insert']>
      }
      permissions: {
        Row: {
          id: number
          code: string
          module: string
          action: string
          name: string
          description: string | null
          category: string
          requires_plan: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['permissions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['permissions']['Insert']>
      }
      leads: {
        Row: {
          id: number
          uuid: string
          organization_id: number
          shared_company_id: number | null
          owner_id: number | null
          first_name: string | null
          last_name: string | null
          email: string | null
          phone: string | null
          mobile: string | null
          job_title: string | null
          company_name: string | null
          company_siret: string | null
          company_website: string | null
          company_industry: string | null
          company_size: string | null
          address_street: string | null
          address_city: string | null
          address_postal_code: string | null
          address_country: string
          source: string | null
          source_detail: string | null
          status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'nurturing' | 'converted' | 'lost'
          score: number
          score_factors: Json | null
          is_hot: boolean
          estimated_value: number | null
          currency: string
          last_contacted_at: string | null
          last_activity_at: string | null
          converted_at: string | null
          converted_to_deal_id: number | null
          tags: Json | null
          custom_fields: Json | null
          notes: string | null
          created_by: number | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['leads']['Insert']>
      }
      companies: {
        Row: {
          id: number
          uuid: string
          organization_id: number
          shared_company_id: number | null
          owner_id: number | null
          name: string
          siret: string | null
          industry: string | null
          website: string | null
          phone: string | null
          email: string | null
          address_street: string | null
          address_city: string | null
          address_postal_code: string | null
          address_country: string
          employees_count: number | null
          revenue: number | null
          type: 'prospect' | 'client' | 'partner' | 'vendor' | 'other'
          lifecycle_stage: string | null
          parent_company_id: number | null
          tags: Json | null
          custom_fields: Json | null
          notes: string | null
          created_by: number | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['companies']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['companies']['Insert']>
      }
      deals: {
        Row: {
          id: number
          uuid: string
          organization_id: number
          stage_id: number
          owner_id: number | null
          company_id: number | null
          lead_id: number | null
          name: string
          value: number
          currency: string
          probability: number
          expected_close_date: string | null
          actual_close_date: string | null
          closed_won: boolean | null
          close_reason: string | null
          priority: 'low' | 'medium' | 'high'
          deal_type: string | null
          source: string | null
          tags: Json | null
          custom_fields: Json | null
          notes: string | null
          created_by: number | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['deals']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['deals']['Insert']>
      }
      pipeline_stages: {
        Row: {
          id: number
          organization_id: number
          name: string
          code: string
          color: string
          probability: number
          is_won: boolean
          is_lost: boolean
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['pipeline_stages']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['pipeline_stages']['Insert']>
      }
      tasks: {
        Row: {
          id: number
          uuid: string
          organization_id: number
          assigned_to: number | null
          created_by: number | null
          title: string
          description: string | null
          task_type: 'call' | 'email' | 'meeting' | 'todo' | 'follow_up' | 'other'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'pending' | 'in_progress' | 'completed' | 'canceled'
          due_date: string | null
          completed_at: string | null
          associated_lead_id: number | null
          associated_company_id: number | null
          associated_deal_id: number | null
          reminder_at: string | null
          reminder_sent: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>
      }
      activities: {
        Row: {
          id: number
          uuid: string
          organization_id: number
          user_id: number
          activity_type: 'note' | 'call' | 'email' | 'meeting' | 'task' | 'other'
          subject: string | null
          body: string | null
          outcome: string | null
          duration_minutes: number | null
          activity_date: string
          associated_lead_id: number | null
          associated_company_id: number | null
          associated_deal_id: number | null
          metadata: Json | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['activities']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['activities']['Insert']>
      }
      shared_companies: {
        Row: {
          id: number
          siret: string
          siren: string
          nic: string
          company_name: string
          trade_name: string | null
          legal_form: string | null
          naf_code: string | null
          naf_label: string | null
          address_street: string | null
          address_postal_code: string | null
          address_city: string | null
          address_country: string
          phone: string | null
          email: string | null
          website: string | null
          creation_date: string | null
          employees_range: string | null
          employees_count: number | null
          capital: number | null
          revenue_range: string | null
          revenue: number | null
          is_active: boolean
          is_rge: boolean
          rge_domains: Json | null
          enriched_at: string | null
          enrichment_source: string | null
          enrichment_data: Json | null
          quality_score: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['shared_companies']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['shared_companies']['Insert']>
      }
      credit_transactions: {
        Row: {
          id: number
          organization_id: number
          type: 'purchase' | 'spend' | 'bonus' | 'refund' | 'monthly'
          amount: number
          balance_after: number
          description: string | null
          reference_type: string | null
          reference_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['credit_transactions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['credit_transactions']['Insert']>
      }
      unlocked_leads: {
        Row: {
          id: number
          organization_id: number
          shared_company_id: number
          lead_id: number | null
          credits_spent: number
          unlocked_at: string
          unlocked_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['unlocked_leads']['Row'], 'id' | 'unlocked_at'>
        Update: Partial<Database['public']['Tables']['unlocked_leads']['Insert']>
      }
      lists: {
        Row: {
          id: number
          uuid: string
          organization_id: number
          name: string
          description: string | null
          type: 'static' | 'dynamic'
          filters: Json | null
          member_count: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['lists']['Row'], 'id' | 'uuid' | 'member_count' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['lists']['Insert']>
      }
      list_members: {
        Row: {
          id: number
          list_id: number
          lead_id: number
          added_at: string
          added_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['list_members']['Row'], 'id' | 'added_at'>
        Update: Partial<Database['public']['Tables']['list_members']['Insert']>
      }
      notifications: {
        Row: {
          id: number
          organization_id: number
          user_id: string
          type: 'lead_assigned' | 'task_due' | 'deal_won' | 'mention'
          title: string
          message: string | null
          link: string | null
          is_read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
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
