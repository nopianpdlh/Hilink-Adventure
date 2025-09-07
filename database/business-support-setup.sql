-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  contact_person VARCHAR(255),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trip_assignments table (for tour leader assignments)
CREATE TABLE IF NOT EXISTS trip_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  tour_leader_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'leader',
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trip_id, tour_leader_id)
);

-- Create trip_equipment_checklist table
CREATE TABLE IF NOT EXISTS trip_equipment_checklist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trip_id, equipment_id)
);

-- Create trip_photos table
CREATE TABLE IF NOT EXISTS trip_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_equipment_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendors
CREATE POLICY "Vendors are viewable by authenticated users" ON vendors
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Vendors are manageable by admin" ON vendors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for trip_assignments
CREATE POLICY "Trip assignments are viewable by admin or assigned leader" ON trip_assignments
  FOR SELECT USING (
    tour_leader_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Trip assignments are manageable by admin" ON trip_assignments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Trip assignments are updatable by admin" ON trip_assignments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for trip_equipment_checklist
CREATE POLICY "Equipment checklist is viewable by authenticated users" ON trip_equipment_checklist
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Equipment checklist is manageable by admin" ON trip_equipment_checklist
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for trip_photos
CREATE POLICY "Trip photos are viewable by authenticated users" ON trip_photos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Trip photos are insertable by authenticated users" ON trip_photos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Trip photos are updatable by owner or admin" ON trip_photos
  FOR UPDATE USING (
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Trip photos are deletable by owner or admin" ON trip_photos
  FOR DELETE USING (
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create storage bucket for trip photos
INSERT INTO storage.buckets (id, name, public) VALUES ('trip-photos', 'trip-photos', true);

-- Storage policies for trip photos
CREATE POLICY "Trip photos are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'trip-photos');

CREATE POLICY "Authenticated users can upload trip photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'trip-photos' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own trip photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'trip-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own trip photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'trip-photos' AND 
    (auth.uid()::text = (storage.foldername(name))[1] OR
     EXISTS (
       SELECT 1 FROM profiles 
       WHERE profiles.id = auth.uid() 
       AND profiles.role = 'admin'
     ))
  );

-- Add tour_leader role to profiles if not exists
INSERT INTO profiles (id, email, role, full_name) VALUES 
(gen_random_uuid(), 'tourleader1@example.com', 'tour_leader', 'Guide Ahli 1'),
(gen_random_uuid(), 'tourleader2@example.com', 'tour_leader', 'Guide Ahli 2')
ON CONFLICT (email) DO NOTHING;

-- Sample vendors data
INSERT INTO vendors (name, category, email, phone, address, contact_person, rating, status) VALUES
('Trans Gunung Express', 'transport', 'info@transgunung.com', '021-12345678', 'Jl. Raya Bogor No. 123, Jakarta', 'Budi Santoso', 5, 'active'),
('Hotel Rimba Raya', 'accommodation', 'reservation@rimbaraya.com', '0251-987654', 'Jl. Pajajaran No. 45, Bogor', 'Siti Nurhaliza', 4, 'active'),
('Outdoor Gear Indonesia', 'equipment', 'sales@outdoorgear.id', '021-55555555', 'Jl. Senopati No. 67, Jakarta Selatan', 'Andi Pratama', 5, 'active'),
('Catering Alam Segar', 'food', 'order@alamsegar.com', '0856-1234567', 'Jl. Raya Sentul No. 89, Bogor', 'Maya Indira', 4, 'active'),
('Guide Profesional Nusantara', 'guide', 'booking@guidepro.id', '0812-9876543', 'Jl. Diponegoro No. 34, Bandung', 'Rudi Hermawan', 5, 'active')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_trip_assignments_trip ON trip_assignments(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_assignments_leader ON trip_assignments(tour_leader_id);
CREATE INDEX IF NOT EXISTS idx_trip_equipment_checklist_trip ON trip_equipment_checklist(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_photos_trip ON trip_photos(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_photos_uploaded_by ON trip_photos(uploaded_by);
