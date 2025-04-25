-- Create a policy to allow insertion into profiles table
CREATE POLICY "Anyone can insert into profiles"
ON profiles FOR INSERT
WITH CHECK (true);

-- Create policies for students, teachers, and parents tables
CREATE POLICY "Anyone can insert into students"
ON students FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can insert into teachers"
ON teachers FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can insert into parents"
ON parents FOR INSERT
WITH CHECK (true);
