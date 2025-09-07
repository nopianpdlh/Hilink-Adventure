-- Create equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price_per_day DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(100),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create equipment_rentals table
CREATE TABLE IF NOT EXISTS equipment_rentals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to decrease equipment stock
CREATE OR REPLACE FUNCTION decrease_equipment_stock(equipment_id UUID, quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE equipment 
  SET stock_quantity = stock_quantity - quantity,
      updated_at = NOW()
  WHERE id = equipment_id AND stock_quantity >= quantity;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for equipment %', equipment_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to increase equipment stock (for cancellations)
CREATE OR REPLACE FUNCTION increase_equipment_stock(equipment_id UUID, quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE equipment 
  SET stock_quantity = stock_quantity + quantity,
      updated_at = NOW()
  WHERE id = equipment_id;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_rentals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for equipment (public read, admin write)
CREATE POLICY "Equipment is viewable by everyone" ON equipment
  FOR SELECT USING (true);

CREATE POLICY "Equipment is insertable by admin" ON equipment
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Equipment is updatable by admin" ON equipment
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for equipment_rentals
CREATE POLICY "Equipment rentals are viewable by owner or admin" ON equipment_rentals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE bookings.id = equipment_rentals.booking_id 
      AND (bookings.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
      ))
    )
  );

CREATE POLICY "Equipment rentals are insertable by authenticated users" ON equipment_rentals
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE bookings.id = equipment_rentals.booking_id 
      AND bookings.user_id = auth.uid()
    )
  );

-- Insert sample equipment data
INSERT INTO equipment (name, description, price_per_day, stock_quantity, category, image_url) VALUES
('Tenda 2 Orang', 'Tenda berkualitas tinggi untuk 2 orang, tahan air dan mudah dipasang', 75000, 10, 'Camping', '/images/equipment/tent-2p.jpg'),
('Sleeping Bag', 'Sleeping bag hangat untuk suhu hingga -5°C', 50000, 15, 'Camping', '/images/equipment/sleeping-bag.jpg'),
('Carrier 60L', 'Carrier/tas gunung kapasitas 60 liter dengan frame internal', 100000, 8, 'Tas', '/images/equipment/carrier-60l.jpg'),
('Kompor Portable', 'Kompor gas portable dengan tabung gas', 40000, 12, 'Masak', '/images/equipment/portable-stove.jpg'),
('Headlamp', 'Senter kepala LED dengan baterai tahan lama', 30000, 20, 'Penerangan', '/images/equipment/headlamp.jpg'),
('Matras', 'Matras tiup untuk kenyamanan tidur di alam', 35000, 18, 'Camping', '/images/equipment/sleeping-pad.jpg'),
('Jaket Gunung', 'Jaket tahan angin dan air untuk cuaca ekstrem', 80000, 6, 'Pakaian', '/images/equipment/mountain-jacket.jpg'),
('Sepatu Hiking', 'Sepatu hiking anti slip dengan ankle support', 90000, 5, 'Sepatu', '/images/equipment/hiking-boots.jpg'),
('Trekking Pole', 'Tongkat hiking adjustable dengan grip ergonomis', 60000, 14, 'Peralatan', '/images/equipment/trekking-pole.jpg'),
('Rain Cover', 'Penutup hujan untuk tas/carrier', 25000, 25, 'Aksesoris', '/images/equipment/rain-cover.jpg')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category);
CREATE INDEX IF NOT EXISTS idx_equipment_stock ON equipment(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_equipment_rentals_booking ON equipment_rentals(booking_id);
CREATE INDEX IF NOT EXISTS idx_equipment_rentals_equipment ON equipment_rentals(equipment_id);
