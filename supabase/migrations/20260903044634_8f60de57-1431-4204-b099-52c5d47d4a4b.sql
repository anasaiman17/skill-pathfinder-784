CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  headline TEXT,
  current_position TEXT,
  target_role_id UUID,
  education TEXT,
  years_experience NUMERIC(4,1),
  location TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE TO authenticated USING (id = auth.uid());

CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  aliases TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.skills TO authenticated;
GRANT ALL ON public.skills TO service_role;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users can view skills" ON public.skills FOR SELECT TO authenticated USING (true);

CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL UNIQUE,
  industry TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_key TEXT NOT NULL DEFAULT 'briefcase',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.roles TO authenticated;
GRANT ALL ON public.roles TO service_role;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users can view roles" ON public.roles FOR SELECT TO authenticated USING (true);

CREATE TABLE public.role_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  required_level INTEGER NOT NULL DEFAULT 3 CHECK (required_level BETWEEN 1 AND 5),
  importance TEXT NOT NULL DEFAULT 'essential' CHECK (importance IN ('essential', 'recommended', 'nice_to_have')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(role_id, skill_id)
);
GRANT SELECT ON public.role_requirements TO authenticated;
GRANT ALL ON public.role_requirements TO service_role;
ALTER TABLE public.role_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users can view role requirements" ON public.role_requirements FOR SELECT TO authenticated USING (true);

CREATE TABLE public.user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  proficiency_level INTEGER NOT NULL DEFAULT 3 CHECK (proficiency_level BETWEEN 1 AND 5),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'extracted', 'verified')),
  evidence TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profile_id, skill_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_skills TO authenticated;
GRANT ALL ON public.user_skills TO service_role;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own skills" ON public.user_skills FOR SELECT TO authenticated USING (profile_id = auth.uid());
CREATE POLICY "Users can create their own skills" ON public.user_skills FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Users can update their own skills" ON public.user_skills FOR UPDATE TO authenticated USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Users can delete their own skills" ON public.user_skills FOR DELETE TO authenticated USING (profile_id = auth.uid());

CREATE TABLE public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT,
  file_type TEXT NOT NULL,
  raw_text TEXT,
  extracted_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'complete', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resumes TO authenticated;
GRANT ALL ON public.resumes TO service_role;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own resumes" ON public.resumes FOR SELECT TO authenticated USING (profile_id = auth.uid());
CREATE POLICY "Users can upload their own resumes" ON public.resumes FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Users can update their own resumes" ON public.resumes FOR UPDATE TO authenticated USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Users can delete their own resumes" ON public.resumes FOR DELETE TO authenticated USING (profile_id = auth.uid());

CREATE TABLE public.learning_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('course', 'certification', 'project', 'article')),
  url TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_hours INTEGER,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  difficulty TEXT NOT NULL DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.learning_resources TO authenticated;
GRANT ALL ON public.learning_resources TO service_role;
ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users can view learning resources" ON public.learning_resources FOR SELECT TO authenticated USING (true);

CREATE TABLE public.roadmap_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES public.learning_resources(id) ON DELETE SET NULL,
  step_order INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed')),
  target_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profile_id, skill_id, resource_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roadmap_items TO authenticated;
GRANT ALL ON public.roadmap_items TO service_role;
ALTER TABLE public.roadmap_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roadmap" ON public.roadmap_items FOR SELECT TO authenticated USING (profile_id = auth.uid());
CREATE POLICY "Users can create their own roadmap" ON public.roadmap_items FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Users can update their own roadmap" ON public.roadmap_items FOR UPDATE TO authenticated USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Users can delete their own roadmap" ON public.roadmap_items FOR DELETE TO authenticated USING (profile_id = auth.uid());

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON public.skills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_role_requirements_updated_at BEFORE UPDATE ON public.role_requirements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_skills_updated_at BEFORE UPDATE ON public.user_skills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_resumes_updated_at BEFORE UPDATE ON public.resumes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_learning_resources_updated_at BEFORE UPDATE ON public.learning_resources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_roadmap_items_updated_at BEFORE UPDATE ON public.roadmap_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.skills (id, name, category, aliases) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Python', 'Programming', ARRAY['Python Programming', 'Py']),
  ('10000000-0000-0000-0000-000000000002', 'SQL', 'Data', ARRAY['Structured Query Language']),
  ('10000000-0000-0000-0000-000000000003', 'Pandas', 'Data', ARRAY['Pandas Python']),
  ('10000000-0000-0000-0000-000000000004', 'Statistics', 'Data', ARRAY['Statistical Analysis']),
  ('10000000-0000-0000-0000-000000000005', 'Machine Learning', 'AI / ML', ARRAY['ML', 'Machine Learning Algorithms']),
  ('10000000-0000-0000-0000-000000000006', 'Deep Learning', 'AI / ML', ARRAY['Neural Networks', 'DL']),
  ('10000000-0000-0000-0000-000000000007', 'TensorFlow', 'AI / ML', ARRAY['TF']),
  ('10000000-0000-0000-0000-000000000008', 'Data Visualization', 'Data', ARRAY['Data Viz', 'Visualization']),
  ('10000000-0000-0000-0000-000000000009', 'Tableau', 'Tools', ARRAY['Tableau Desktop']),
  ('10000000-0000-0000-0000-000000000010', 'Git', 'Tools', ARRAY['Git Version Control']),
  ('10000000-0000-0000-0000-000000000011', 'Docker', 'Tools', ARRAY['Containerization']),
  ('10000000-0000-0000-0000-000000000012', 'JavaScript', 'Programming', ARRAY['JS', 'ECMAScript']),
  ('10000000-0000-0000-0000-000000000013', 'React', 'Programming', ARRAY['React.js', 'ReactJS']),
  ('10000000-0000-0000-0000-000000000014', 'Communication', 'Professional', ARRAY['Written Communication']),
  ('10000000-0000-0000-0000-000000000015', 'Cloud Platforms', 'Infrastructure', ARRAY['AWS', 'Azure', 'GCP']),
  ('10000000-0000-0000-0000-000000000016', 'Experiment Design', 'Data', ARRAY['A/B Testing', 'A/B Tests']);

INSERT INTO public.roles (id, title, industry, description, icon_key) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Data Analyst', 'Analytics & Insights', 'Turn business questions into clear insights with data, dashboards, and statistical thinking.', 'chart'),
  ('20000000-0000-0000-0000-000000000002', 'Data Scientist', 'AI & Data Science', 'Build predictive models and translate complex data into decisions that move the business forward.', 'flask'),
  ('20000000-0000-0000-0000-000000000003', 'ML Engineer', 'AI & Engineering', 'Productionize machine learning systems with reliable code, models, and cloud infrastructure.', 'brain'),
  ('20000000-0000-0000-0000-000000000004', 'Software Developer', 'Product Engineering', 'Design and ship maintainable software products across modern application stacks.', 'code');

INSERT INTO public.role_requirements (role_id, skill_id, required_level, importance) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 4, 'essential'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 3, 'essential'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 3, 'essential'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008', 4, 'essential'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000009', 3, 'recommended'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000016', 2, 'recommended'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 4, 'essential'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 4, 'essential'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 4, 'essential'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 4, 'essential'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000008', 3, 'recommended'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 3, 'recommended'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 4, 'essential'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005', 4, 'essential'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000006', 4, 'essential'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000007', 3, 'recommended'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000011', 3, 'recommended'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000015', 3, 'recommended'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000012', 4, 'essential'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000013', 4, 'essential'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000010', 3, 'essential'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000011', 3, 'recommended'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000015', 3, 'recommended'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000014', 3, 'recommended');

INSERT INTO public.learning_resources (id, title, provider, resource_type, url, description, duration_hours, skill_id, role_id, difficulty) VALUES
  ('30000000-0000-0000-0000-000000000001', 'SQL for Data Analysis', 'Mode Analytics', 'course', 'https://mode.com/sql-tutorial/', 'Practice the SQL patterns analysts use to explore, join, and explain real datasets.', 12, '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'beginner'),
  ('30000000-0000-0000-0000-000000000002', 'Python Data Analysis', 'DataCamp', 'course', 'https://www.datacamp.com/courses/data-manipulation-with-pandas', 'Build confidence cleaning, transforming, and aggregating data with pandas.', 10, '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'beginner'),
  ('30000000-0000-0000-0000-000000000003', 'Statistics with Python', 'Coursera', 'course', 'https://www.coursera.org/learn/statistics-with-python', 'Strengthen the statistical foundations behind reliable analysis and experimentation.', 18, '10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 'intermediate'),
  ('30000000-0000-0000-0000-000000000004', 'Machine Learning Specialization', 'DeepLearning.AI', 'certification', 'https://www.coursera.org/specializations/machine-learning-introduction', 'A practical path through supervised learning, unsupervised learning, and model development.', 36, '10000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', 'intermediate'),
  ('30000000-0000-0000-0000-000000000005', 'TensorFlow Developer Resources', 'TensorFlow', 'article', 'https://www.tensorflow.org/learn', 'Learn the fundamentals of building and shipping neural network models.', 14, '10000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000003', 'intermediate'),
  ('30000000-0000-0000-0000-000000000006', 'Docker for Developers', 'Docker', 'course', 'https://docs.docker.com/get-started/', 'Containerize an application and learn the deployment concepts ML teams rely on.', 8, '10000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000003', 'beginner'),
  ('30000000-0000-0000-0000-000000000007', 'React Foundations', 'Scrimba', 'course', 'https://scrimba.com/learn/learnreact', 'Build interactive interfaces with components, state, and modern React patterns.', 16, '10000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000004', 'beginner'),
  ('30000000-0000-0000-0000-000000000008', 'Git Handbook', 'GitHub', 'article', 'https://docs.github.com/en/get-started/using-git/about-git', 'Get fluent with the version control workflows expected on product engineering teams.', 4, '10000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000004', 'beginner'),
  ('30000000-0000-0000-0000-000000000009', 'Tableau for Data Visualization', 'Tableau', 'course', 'https://www.tableau.com/learn/training', 'Turn analysis into compelling, decision-ready dashboards and stories.', 12, '10000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000001', 'intermediate');