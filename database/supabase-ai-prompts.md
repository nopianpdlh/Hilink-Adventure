# Supabase AI Assistant Prompts

Gunakan prompt-prompt berikut di Supabase AI Assistant untuk membuat tabel yang diperlukan untuk 4 fitur baru HiLink Adventure.

---

## 1. TABEL VENDORS (Vendor Management)

**Prompt untuk Supabase AI:**
```
Create a vendors table for managing business vendors with the following requirements:
- id: UUID primary key with auto generation
- name: VARCHAR(255) for vendor name (required)
- category: VARCHAR(100) for vendor category like transport, accommodation, equipment, food, guide (required)
- email: VARCHAR(255) for contact email (optional)
- phone: VARCHAR(50) for contact phone (optional)
- address: TEXT for vendor address (optional)
- contact_person: VARCHAR(255) for contact person name (optional)
- rating: INTEGER between 1-5 for vendor rating (optional)
- status: VARCHAR(20) with values 'active' or 'inactive', default 'active'
- created_at: TIMESTAMP with timezone, default now()
- updated_at: TIMESTAMP with timezone, default now()

Enable RLS with policies:
- SELECT: Allow for authenticated users
- INSERT/UPDATE/DELETE: Allow only for admin role users (check profiles.role = 'admin')

Create indexes on category and status columns for better performance.
```

---

## 2. TABEL TRIP_ASSIGNMENTS (Tour Leader Assignment)

**Prompt untuk Supabase AI:**
```
Create a trip_assignments table for assigning tour leaders to trips with the following requirements:
- id: UUID primary key with auto generation
- trip_id: UUID foreign key referencing trips(id) with CASCADE delete (required)
- tour_leader_id: UUID foreign key referencing profiles(id) with CASCADE delete (required)
- role: VARCHAR(50) default 'leader' for assignment role
- assigned_at: TIMESTAMP with timezone, default now()
- Add UNIQUE constraint on (trip_id, tour_leader_id) to prevent duplicate assignments

Enable RLS with policies:
- SELECT: Allow for admin or the assigned tour leader (tour_leader_id = auth.uid())
- INSERT/UPDATE/DELETE: Allow only for admin role users (check profiles.role = 'admin')

Create indexes on trip_id and tour_leader_id for better performance.
```

---

## 3. TABEL TRIP_EQUIPMENT_CHECKLIST (Equipment Checklist)

**Prompt untuk Supabase AI:**
```
Create a trip_equipment_checklist table for managing required equipment per trip with the following requirements:
- id: UUID primary key with auto generation
- trip_id: UUID foreign key referencing trips(id) with CASCADE delete (required)
- equipment_id: UUID foreign key referencing equipment(id) with CASCADE delete (required)
- is_required: BOOLEAN default true for whether equipment is mandatory
- notes: TEXT for additional notes about the equipment (optional)
- created_at: TIMESTAMP with timezone, default now()
- Add UNIQUE constraint on (trip_id, equipment_id) to prevent duplicate entries

Enable RLS with policies:
- SELECT: Allow for authenticated users
- INSERT/UPDATE/DELETE: Allow only for admin role users (check profiles.role = 'admin')

Create indexes on trip_id and equipment_id for better performance.
```

---

## 4. TABEL TRIP_PHOTOS (Photo Gallery)

**Prompt untuk Supabase AI:**
```
Create a trip_photos table for managing trip photo gallery with the following requirements:
- id: UUID primary key with auto generation
- trip_id: UUID foreign key referencing trips(id) with CASCADE delete (required)
- filename: VARCHAR(255) for the stored filename (required)
- url: TEXT for the photo URL (required)
- caption: TEXT for photo description (optional)
- uploaded_by: UUID foreign key referencing profiles(id) with CASCADE delete (required)
- uploaded_at: TIMESTAMP with timezone, default now()

Enable RLS with policies:
- SELECT: Allow for authenticated users
- INSERT: Allow for authenticated users
- UPDATE: Allow for photo owner (uploaded_by = auth.uid()) or admin role users
- DELETE: Allow for photo owner (uploaded_by = auth.uid()) or admin role users

Create indexes on trip_id and uploaded_by for better performance.
```

---

## 5. STORAGE BUCKET untuk Trip Photos

**Prompt untuk Supabase AI (di Storage section):**
```
Create a storage bucket named 'trip-photos' for storing trip photo uploads with the following configuration:
- Bucket name: trip-photos
- Public: true (for public access to photos)
- File size limit: 5MB
- Allowed file types: image/* (jpg, png, gif, webp)

Set up storage policies:
- SELECT: Allow public access to view photos
- INSERT: Allow authenticated users to upload photos
- UPDATE: Allow file owner to update their photos
- DELETE: Allow file owner or admin to delete photos
```

---

## 6. UPDATE PROFILES TABLE (untuk Tour Leader Role)

**Prompt untuk Supabase AI:**
```
Update the existing profiles table to support tour_leader role by modifying the role column constraint to include 'tour_leader' as a valid value alongside existing roles like 'admin' and 'pelanggan'.

If role column doesn't have constraints, ensure it can accept values: 'admin', 'pelanggan', 'tour_leader'.

Also, add some sample tour leader profiles:
- Insert sample profiles with role 'tour_leader' for testing
- Include fields: full_name, role='tour_leader'
```

---

## 7. UPDATE EQUIPMENT_RENTALS TABLE (sesuaikan dengan kode)

**Prompt untuk Supabase AI:**
```
Update the existing equipment_rentals table to add missing columns for the rental system:
- Add price_per_day column: INTEGER for daily rental price
- Add total_price column: INTEGER for total rental cost
- Keep existing columns: id, booking_id, equipment_id, quantity, created_at

The table should support the rental pricing calculation in the application.
```

---

## 8. UPDATE EQUIPMENT TABLE (sesuaikan dengan schema existing)

**Prompt untuk Supabase AI:**
```
The equipment table already exists with these columns:
- rental_price_per_day (INTEGER) - already exists, no change needed
- stock (INTEGER) - already exists, no change needed  
- Other existing columns: id, name, description, image_url, created_at

Add missing columns only:
- Add category column: VARCHAR(100) for equipment categorization
- Add updated_at: TIMESTAMP with timezone, default now()

Create a function decrease_equipment_stock(equipment_id UUID, quantity INTEGER) that:
- Decreases stock by the specified amount (not stock_quantity)
- Only if sufficient stock is available
- Updates the updated_at timestamp
- Raises exception if insufficient stock

Create indexes on category and stock for better performance.
```

---

## CARA PENGGUNAAN:

1. **Login ke Supabase Dashboard**
2. **Buka SQL Editor atau Table Editor**
3. **Gunakan AI Assistant** (jika tersedia)
4. **Copy-paste prompt yang relevan**
5. **Review dan Execute** SQL yang dihasilkan
6. **Verifikasi** tabel dan policies terbuat dengan benar

## URUTAN EKSEKUSI:

1. Update PROFILES table (untuk tour leader role)
2. Update EQUIPMENT_RENTALS table (tambah kolom price & total)
3. Update EQUIPMENT table (tambah category & updated_at)
4. Buat VENDORS table
5. Buat TRIP_ASSIGNMENTS table
6. Buat TRIP_EQUIPMENT_CHECKLIST table
7. Buat TRIP_PHOTOS table
8. Setup STORAGE bucket untuk photos

Setelah semua tabel terbuat, komponen-komponen React yang sudah dibuat akan berfungsi dengan sempurna!
