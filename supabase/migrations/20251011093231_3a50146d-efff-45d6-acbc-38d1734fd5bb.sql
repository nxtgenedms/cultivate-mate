-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM (
  'assistant_grower',
  'grower', 
  'manager',
  'qa',
  'supervisor',
  'it_admin',
  'business_admin'
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('it_admin', 'business_admin')
  )
$$;

-- Create lookup_categories table for organizing lookup types
CREATE TABLE public.lookup_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_key TEXT UNIQUE NOT NULL,
  category_name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lookup_categories ENABLE ROW LEVEL SECURITY;

-- Create lookup_values table for all dropdown values
CREATE TABLE public.lookup_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.lookup_categories(id) ON DELETE CASCADE NOT NULL,
  value_key TEXT NOT NULL,
  value_display TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(category_id, value_key)
);

ALTER TABLE public.lookup_values ENABLE ROW LEVEL SECURITY;

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for lookup_categories updated_at
CREATE TRIGGER update_lookup_categories_updated_at
  BEFORE UPDATE ON public.lookup_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for lookup_values updated_at
CREATE TRIGGER update_lookup_values_updated_at
  BEFORE UPDATE ON public.lookup_values
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view all active profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- RLS Policies for lookup_categories
CREATE POLICY "Everyone can view active lookup categories"
  ON public.lookup_categories FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage lookup categories"
  ON public.lookup_categories FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- RLS Policies for lookup_values
CREATE POLICY "Everyone can view active lookup values"
  ON public.lookup_values FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage lookup values"
  ON public.lookup_values FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Insert initial lookup categories
INSERT INTO public.lookup_categories (category_key, category_name, description) VALUES
  ('room_type', 'Room Types', 'Types of cultivation rooms'),
  ('strain_type', 'Strain Types', 'Cannabis strain categories'),
  ('growth_stage', 'Growth Stages', 'Plant growth lifecycle stages'),
  ('lighting_type', 'Lighting Types', 'Types of lighting systems'),
  ('irrigation_method', 'Irrigation Methods', 'Watering and feeding methods'),
  ('pest_type', 'Pest Types', 'Common pests in cultivation'),
  ('chemical_type', 'Chemical Types', 'Types of chemicals and treatments'),
  ('application_method', 'Application Methods', 'Methods for applying treatments'),
  ('hygiene_area', 'Hygiene Areas', 'Areas requiring hygiene protocols'),
  ('sanitation_type', 'Sanitation Types', 'Types of sanitation procedures'),
  ('harvest_method', 'Harvest Methods', 'Methods for harvesting'),
  ('drying_method', 'Drying Methods', 'Methods for drying harvested material'),
  ('trim_method', 'Trim Methods', 'Methods for trimming'),
  ('packaging_type', 'Packaging Types', 'Types of packaging containers');

-- Insert sample lookup values for demonstration
INSERT INTO public.lookup_values (category_id, value_key, value_display, sort_order) 
SELECT id, 'vegetative', 'Vegetative', 1 FROM public.lookup_categories WHERE category_key = 'growth_stage'
UNION ALL
SELECT id, 'flowering', 'Flowering', 2 FROM public.lookup_categories WHERE category_key = 'growth_stage'
UNION ALL
SELECT id, 'mother', 'Mother Plant', 3 FROM public.lookup_categories WHERE category_key = 'growth_stage'
UNION ALL
SELECT id, 'clone', 'Clone', 4 FROM public.lookup_categories WHERE category_key = 'growth_stage';