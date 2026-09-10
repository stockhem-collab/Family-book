// Handskriven motsvarighet till `supabase gen types typescript`, i väntan på
// att den riktiga CLI-kommandot körs mot det länkade projektet:
//
//   npx supabase gen types typescript --project-id lcqynkwvqpookmpumdal --schema public > lib/supabase/types.ts
//
// (kräver `npx supabase login` eller SUPABASE_ACCESS_TOKEN, vilket inte finns
// tillgängligt i den här miljön). Håll den här filen i synk med
// supabase/migrations/ tills dess.

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
      families: {
        Row: {
          id: string
          name: string
          invite_code: string
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          invite_code: string
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          invite_code?: string
          created_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          user_id: string | null
          family_id: string | null
          display_name: string
          role: string | null
          birth_date: string | null
          avatar_url: string | null
          clothing_size: string | null
          shoe_size: string | null
          favorite_food: string | null
          dislikes: string | null
          hobbies: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          family_id?: string | null
          display_name: string
          role?: string | null
          birth_date?: string | null
          avatar_url?: string | null
          clothing_size?: string | null
          shoe_size?: string | null
          favorite_food?: string | null
          dislikes?: string | null
          hobbies?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          family_id?: string | null
          display_name?: string
          role?: string | null
          birth_date?: string | null
          avatar_url?: string | null
          clothing_size?: string | null
          shoe_size?: string | null
          favorite_food?: string | null
          dislikes?: string | null
          hobbies?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          id: string
          family_id: string | null
          title: string
          category: string | null
          location: string | null
          starts_at: string
          ends_at: string | null
          member_ids: string[] | null
          drop_off_by: string | null
          pick_up_by: string | null
          bring_items: string | null
          is_recurring: boolean | null
          recurrence_rule: string | null
          created_by: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          family_id?: string | null
          title: string
          category?: string | null
          location?: string | null
          starts_at: string
          ends_at?: string | null
          member_ids?: string[] | null
          drop_off_by?: string | null
          pick_up_by?: string | null
          bring_items?: string | null
          is_recurring?: boolean | null
          recurrence_rule?: string | null
          created_by?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          family_id?: string | null
          title?: string
          category?: string | null
          location?: string | null
          starts_at?: string
          ends_at?: string | null
          member_ids?: string[] | null
          drop_off_by?: string | null
          pick_up_by?: string | null
          bring_items?: string | null
          is_recurring?: boolean | null
          recurrence_rule?: string | null
          created_by?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_drop_off_by_fkey"
            columns: ["drop_off_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_pick_up_by_fkey"
            columns: ["pick_up_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lists: {
        Row: {
          id: string
          family_id: string | null
          type: string
          title: string
          owner_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          family_id?: string | null
          type: string
          title: string
          owner_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          family_id?: string | null
          type?: string
          title?: string
          owner_id?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lists_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lists_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      list_items: {
        Row: {
          id: string
          list_id: string
          family_id: string | null
          label: string
          is_done: boolean | null
          assigned_to: string | null
          price: number | null
          priority: string | null
          image_url: string | null
          sort_order: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          list_id: string
          family_id?: string | null
          label: string
          is_done?: boolean | null
          assigned_to?: string | null
          price?: number | null
          priority?: string | null
          image_url?: string | null
          sort_order?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          list_id?: string
          family_id?: string | null
          label?: string
          is_done?: boolean | null
          assigned_to?: string | null
          price?: number | null
          priority?: string | null
          image_url?: string | null
          sort_order?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_items_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_items_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          id: string
          family_id: string | null
          date: string
          meal_title: string
          recipe_url: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          family_id?: string | null
          date: string
          meal_title: string
          recipe_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          family_id?: string | null
          date?: string
          meal_title?: string
          recipe_url?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_posts: {
        Row: {
          id: string
          family_id: string | null
          author_id: string | null
          text_content: string | null
          image_url: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          family_id?: string | null
          author_id?: string | null
          text_content?: string | null
          image_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          family_id?: string | null
          author_id?: string | null
          text_content?: string | null
          image_url?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feed_posts_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_comments: {
        Row: {
          id: string
          post_id: string
          author_id: string | null
          text_content: string
          created_at: string | null
        }
        Insert: {
          id?: string
          post_id: string
          author_id?: string | null
          text_content: string
          created_at?: string | null
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string | null
          text_content?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feed_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          id: string
          family_id: string | null
          name: string
          species: string | null
          breed: string | null
          birth_date: string | null
          avatar_url: string | null
          chip_number: string | null
          insurance_provider: string | null
          insurance_policy_number: string | null
          weight_kg: number | null
          current_medication: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          family_id?: string | null
          name: string
          species?: string | null
          breed?: string | null
          birth_date?: string | null
          avatar_url?: string | null
          chip_number?: string | null
          insurance_provider?: string | null
          insurance_policy_number?: string | null
          weight_kg?: number | null
          current_medication?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          family_id?: string | null
          name?: string
          species?: string | null
          breed?: string | null
          birth_date?: string | null
          avatar_url?: string | null
          chip_number?: string | null
          insurance_provider?: string | null
          insurance_policy_number?: string | null
          weight_kg?: number | null
          current_medication?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pets_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_vet_visits: {
        Row: {
          id: string
          pet_id: string
          family_id: string | null
          visit_date: string
          visit_type: string | null
          notes: string | null
          next_reminder_date: string | null
          weight_kg: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          pet_id: string
          family_id?: string | null
          visit_date: string
          visit_type?: string | null
          notes?: string | null
          next_reminder_date?: string | null
          weight_kg?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          pet_id?: string
          family_id?: string | null
          visit_date?: string
          visit_type?: string | null
          notes?: string | null
          next_reminder_date?: string | null
          weight_kg?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pet_vet_visits_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pet_vet_visits_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_tasks: {
        Row: {
          id: string
          family_id: string | null
          title: string
          assigned_to: string | null
          recurrence_rule: string
          category: string | null
          next_due_date: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          family_id?: string | null
          title: string
          assigned_to?: string | null
          recurrence_rule: string
          category?: string | null
          next_due_date?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          family_id?: string | null
          title?: string
          assigned_to?: string | null
          recurrence_rule?: string
          category?: string | null
          next_due_date?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_tasks_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_messages: {
        Row: {
          id: string
          family_id: string | null
          user_id: string | null
          role: string
          content: string
          created_at: string | null
        }
        Insert: {
          id?: string
          family_id?: string | null
          user_id?: string | null
          role: string
          content: string
          created_at?: string | null
        }
        Update: {
          id?: string
          family_id?: string | null
          user_id?: string | null
          role?: string
          content?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assistant_messages_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistant_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      get_family_by_invite_code: {
        Args: { code: string }
        Returns: { id: string; name: string }[]
      }
      merge_profile_into: {
        Args: { keep_profile_id: string; duplicate_profile_id: string }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]
