import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  wechat_id: string | null;
  wechat_name: string | null;
  wechat_avatar: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
};

export type PPAPProject = {
  id: string;
  project_number: string;
  project_name: string;
  sales_manager_id: string | null;
  rd_manager_id: string | null;
  assembly_manager_id: string | null;
  status: 'draft' | 'in_progress' | 'completed' | 'on_hold';
  progress_percentage: number;
  start_date: string | null;
  target_date: string | null;
  notes: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type PPAPProjectWithManagers = PPAPProject & {
  sales_manager: Profile | null;
  rd_manager: Profile | null;
  assembly_manager: Profile | null;
  creator: Profile | null;
};
