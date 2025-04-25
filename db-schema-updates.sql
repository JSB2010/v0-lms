-- Create course_modules table
CREATE TABLE course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) NOT NULL,
  title TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course_content table
CREATE TABLE course_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES course_modules(id) NOT NULL,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) NOT NULL,
  course_id UUID REFERENCES courses(id) NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (student_id, course_id, date)
);

-- Create calendar_events table
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  event_type TEXT NOT NULL,
  course_id UUID REFERENCES courses(id),
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create departments table
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add department_id to teachers table
ALTER TABLE teachers ADD COLUMN department_id UUID REFERENCES departments(id);

-- Create storage buckets
-- Note: This would be done in the Supabase dashboard or via API
-- CREATE STORAGE BUCKET submissions;
-- CREATE STORAGE BUCKET course_content;

-- Add RLS policies for new tables
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Add triggers for updated_at
CREATE TRIGGER update_course_modules_timestamp
BEFORE UPDATE ON course_modules
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_course_content_timestamp
BEFORE UPDATE ON course_content
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_attendance_timestamp
BEFORE UPDATE ON attendance
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_calendar_events_timestamp
BEFORE UPDATE ON calendar_events
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_departments_timestamp
BEFORE UPDATE ON departments
FOR EACH ROW EXECUTE FUNCTION update_timestamp();
