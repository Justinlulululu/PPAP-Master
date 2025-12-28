/*
  # PPAP Master Database Schema

  ## Overview
  Creates the core tables for tracking PPAP (Production Part Approval Process) projects
  with WeChat authentication support.

  ## New Tables
  
  ### profiles
  - `id` (uuid, primary key) - References auth.users
  - `wechat_id` (text, unique) - WeChat unique identifier
  - `wechat_name` (text) - User's name from WeChat
  - `wechat_avatar` (text) - User's avatar URL from WeChat
  - `email` (text) - User's email
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### ppap_projects
  - `id` (uuid, primary key) - Unique project identifier
  - `project_number` (text, unique) - Project number/code
  - `project_name` (text) - Project name/description
  - `sales_manager_id` (uuid) - References profiles table
  - `rd_manager_id` (uuid) - References profiles table
  - `assembly_manager_id` (uuid) - References profiles table
  - `status` (text) - Project status (draft, in_progress, completed, on_hold)
  - `progress_percentage` (integer) - Overall progress 0-100
  - `start_date` (date) - Project start date
  - `target_date` (date) - Target completion date
  - `notes` (text) - Additional notes
  - `created_by` (uuid) - User who created the project
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all tables
  - Authenticated users can view all projects
  - Users can create new projects
  - Users can update projects they created or are assigned to
  - Users can view and update their own profile
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  wechat_id text UNIQUE,
  wechat_name text,
  wechat_avatar text,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ppap_projects table
CREATE TABLE IF NOT EXISTS ppap_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_number text UNIQUE NOT NULL,
  project_name text NOT NULL,
  sales_manager_id uuid REFERENCES profiles(id),
  rd_manager_id uuid REFERENCES profiles(id),
  assembly_manager_id uuid REFERENCES profiles(id),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'on_hold')),
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  start_date date,
  target_date date,
  notes text DEFAULT '',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppap_projects ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- PPAP Projects policies
CREATE POLICY "Users can view all projects"
  ON ppap_projects
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create projects"
  ON ppap_projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update assigned projects"
  ON ppap_projects
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    auth.uid() = sales_manager_id OR
    auth.uid() = rd_manager_id OR
    auth.uid() = assembly_manager_id
  )
  WITH CHECK (
    auth.uid() = created_by OR
    auth.uid() = sales_manager_id OR
    auth.uid() = rd_manager_id OR
    auth.uid() = assembly_manager_id
  );

CREATE POLICY "Users can delete own projects"
  ON ppap_projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ppap_projects_sales_manager ON ppap_projects(sales_manager_id);
CREATE INDEX IF NOT EXISTS idx_ppap_projects_rd_manager ON ppap_projects(rd_manager_id);
CREATE INDEX IF NOT EXISTS idx_ppap_projects_assembly_manager ON ppap_projects(assembly_manager_id);
CREATE INDEX IF NOT EXISTS idx_ppap_projects_created_by ON ppap_projects(created_by);
CREATE INDEX IF NOT EXISTS idx_ppap_projects_status ON ppap_projects(status);
CREATE INDEX IF NOT EXISTS idx_profiles_wechat_id ON profiles(wechat_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ppap_projects_updated_at
  BEFORE UPDATE ON ppap_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
