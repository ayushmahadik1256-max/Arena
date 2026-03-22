-- Create profiles table for user management (teachers and students)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create subjects table (teacher-specific)
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers can view their own subjects" ON public.subjects FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can create subjects" ON public.subjects FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers can delete their subjects" ON public.subjects FOR DELETE USING (auth.uid() = teacher_id);

-- Create divisions table (teacher-specific)
CREATE TABLE IF NOT EXISTS public.divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers can view their own divisions" ON public.divisions FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can create divisions" ON public.divisions FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers can delete their divisions" ON public.divisions FOR DELETE USING (auth.uid() = teacher_id);

-- Create sessions table for teacher-created attendance sessions
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
  session_code TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  radius_meters INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their own sessions" ON public.sessions FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can create sessions" ON public.sessions FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers can update their own sessions" ON public.sessions FOR UPDATE USING (auth.uid() = teacher_id);
CREATE POLICY "Students can view active sessions" ON public.sessions FOR SELECT TO authenticated USING (is_active = true);

-- Create attendance records table
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  distance_meters INTEGER NOT NULL,
  is_within_range BOOLEAN NOT NULL DEFAULT FALSE,
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, student_id)
);

ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own attendance" ON public.attendance_records FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can mark their own attendance" ON public.attendance_records FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Teachers can view attendance for their sessions" ON public.attendance_records FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.sessions WHERE sessions.id = attendance_records.session_id AND sessions.teacher_id = auth.uid())
);
