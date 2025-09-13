import { createAdminClient } from '@/lib/supabase/admin'

export async function uploadImageToSupabase(file: File): Promise<string> {
  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('Ukuran file terlalu besar. Maksimal 5MB.')
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Format file tidak didukung. Gunakan JPG, PNG, atau GIF.')
  }

  const supabase = createAdminClient()
  
  // Generate unique filename using timestamp and random number
  const fileExt = file.name.split('.').pop()
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const fileName = `${timestamp}_${random}.${fileExt}`
  const filePath = `trips/${fileName}`

  try {
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('images') // Make sure this bucket exists in your Supabase project
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error uploading file:', error)
      
      // Provide helpful error messages
      if (error.message.includes('Bucket not found')) {
        throw new Error('Storage bucket belum dikonfigurasi. Silakan setup bucket "images" di Supabase Dashboard.')
      } else if (error.message.includes('Policy')) {
        throw new Error('Tidak memiliki izin upload. Silakan periksa storage policies.')
      }
      
      throw new Error(`Gagal mengupload gambar: ${error.message}`)
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from('images')
      .getPublicUrl(data.path)

    return publicData.publicUrl
  } catch (error) {
    console.error('Upload error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Terjadi kesalahan saat mengupload gambar.')
  }
}
