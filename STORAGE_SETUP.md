# Setup Supabase Storage untuk Upload Gambar

## Langkah-langkah Setup:

### 1. Buat Storage Bucket di Supabase Dashboard
1. Buka Supabase Dashboard
2. Pilih project Anda
3. Navigasi ke **Storage** di sidebar
4. Klik **Create a new bucket**
5. Buat bucket dengan nama `images`
6. Set bucket sebagai **Public** agar gambar bisa diakses publik

### 2. Setup Storage Policies (RLS)
Setup policies melalui Supabase Dashboard atau SQL Editor:

#### Cara 1: Melalui Dashboard (Recommended)
1. Buka Supabase Dashboard
2. Navigasi ke **Storage** > **Policies**
3. Pilih bucket `images`
4. Klik **New Policy**
5. Buat policy untuk **INSERT** (Upload):
   - Name: `Allow admin upload`
   - Target roles: `authenticated`
   - Policy definition: `true` (atau bisa lebih spesifik dengan role check)

6. Buat policy untuk **SELECT** (Read):
   - Name: `Public read access`
   - Target roles: `anon, authenticated`
   - Policy definition: `true`

#### Cara 2: Melalui SQL Editor
```sql
-- Policy untuk memungkinkan upload gambar (authenticated users)
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' AND
  auth.role() = 'authenticated'
);

-- Policy untuk akses publik read
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- Jika ingin lebih ketat, hanya admin yang bisa upload:
-- CREATE POLICY "Allow admin uploads" ON storage.objects
-- FOR INSERT WITH CHECK (
--   bucket_id = 'images' AND
--   EXISTS (
--     SELECT 1 FROM profiles 
--     WHERE id = auth.uid() AND role = 'admin'
--   )
-- );
```

### 3. Struktur Folder
Gambar akan disimpan dalam struktur:
```
images/
├── trips/
│   ├── uuid1.jpg
│   ├── uuid2.png
│   └── ...
```

### 4. Format File yang Didukung
- JPG/JPEG
- PNG  
- GIF
- Maksimal ukuran: 5MB

### 5. Environment Variables
Pastikan `.env.local` sudah memiliki:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Cara Penggunaan
1. Admin bisa memilih antara URL gambar atau upload file
2. Jika upload file, gambar akan disimpan di Supabase Storage
3. URL publik akan otomatis disimpan ke database
4. Preview gambar tersedia sebelum submit

## Troubleshooting

### Error: "Bucket not found"
- Pastikan bucket `images` sudah dibuat di Supabase Dashboard
- Pastikan bucket di-set sebagai **Public**

### Error: "Policy violation" atau "Permission denied"
- Pastikan storage policies sudah dikonfigurasi dengan benar
- Periksa apakah user sudah authenticated
- Untuk admin-only upload, pastikan user memiliki role 'admin' di tabel profiles

### Error: "relation storage.policies does not exist"
- Jangan gunakan INSERT INTO storage.policies
- Gunakan CREATE POLICY pada storage.objects sebagai gantinya
- Atau setup melalui Supabase Dashboard

### Testing Storage Setup
Anda bisa test storage dengan kode sederhana:
```javascript
// Test upload di browser console (setelah login)
const file = new File(['hello'], 'test.txt', {type: 'text/plain'});
const { data, error } = await supabase.storage
  .from('images')
  .upload('test/test.txt', file);
console.log(data, error);
```

## Database RLS Policies

Pastikan juga tabel `trips` dan `destinations` memiliki RLS policies yang benar:

### Untuk tabel `trips`:
```sql
-- Allow admin to insert trips
CREATE POLICY "Allow admin insert trips" ON trips
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow public to read trips
CREATE POLICY "Public read trips" ON trips
FOR SELECT USING (true);
```

### Untuk tabel `destinations`:
```sql
-- Allow admin to insert destinations  
CREATE POLICY "Allow admin insert destinations" ON destinations
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow public to read destinations
CREATE POLICY "Public read destinations" ON destinations  
FOR SELECT USING (true);
```
