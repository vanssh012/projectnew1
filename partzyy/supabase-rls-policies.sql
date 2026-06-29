-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "own profile insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Events policies
CREATE POLICY "published events visible" ON events FOR SELECT USING (status = 'published');
CREATE POLICY "host manages own events" ON events FOR ALL USING (auth.uid() = host_id);

-- Tickets policies
CREATE POLICY "own tickets" ON tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "host sees tickets" ON tickets FOR SELECT USING (
  auth.uid() = (SELECT host_id FROM events WHERE id = event_id)
);
CREATE POLICY "insert own ticket" ON tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "host updates tickets" ON tickets FOR UPDATE USING (
  auth.uid() = (SELECT host_id FROM events WHERE id = event_id)
);

-- Reviews policies
CREATE POLICY "public reviews" ON reviews FOR SELECT USING (true);

-- Notifications policies
CREATE POLICY "own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);