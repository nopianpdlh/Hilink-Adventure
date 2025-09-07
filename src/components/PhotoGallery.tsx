'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Download, Eye, Trash2, Image as ImageIcon } from 'lucide-react'

interface Photo {
  id: string
  trip_id: string
  filename: string
  url: string
  caption: string | null
  uploaded_by: string
  uploaded_at: string
  profiles: {
    full_name: string | null
    email: string
  } | null
}

interface PhotoGalleryProps {
  tripId: string
  isAdmin?: boolean
}

export default function PhotoGallery({ tripId, isAdmin = false }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [uploading, setUploading] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadPhotos()
  }, [tripId])

  const loadPhotos = async () => {
    const supabase = createClient()
    
    const { data: photosData } = await supabase
      .from('trip_photos')
      .select(`
        id,
        trip_id,
        filename,
        url,
        caption,
        uploaded_by,
        uploaded_at,
        profiles(
          full_name,
          email
        )
      `)
      .eq('trip_id', tripId)
      .order('uploaded_at', { ascending: false })

    if (photosData) {
      setPhotos(photosData as unknown as Photo[])
    }
    
    setLoading(false)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Anda harus login untuk mengunggah foto')
      setUploading(false)
      return
    }

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`File ${file.name} bukan gambar yang valid`)
          continue
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`File ${file.name} terlalu besar. Maksimal 5MB`)
          continue
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `trip-${tripId}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `trip-photos/${fileName}`

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('trip-photos')
          .upload(filePath, file)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          alert(`Gagal mengunggah ${file.name}`)
          continue
        }

        // Get public URL
        const { data } = supabase.storage
          .from('trip-photos')
          .getPublicUrl(filePath)

        // Save to database
        const { error: dbError } = await supabase
          .from('trip_photos')
          .insert({
            trip_id: tripId,
            filename: fileName,
            url: data.publicUrl,
            uploaded_by: user.id
          })

        if (dbError) {
          console.error('Database error:', dbError)
          alert(`Gagal menyimpan data ${file.name}`)
        }
      }

      // Reload photos
      await loadPhotos()
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
    } catch (error) {
      console.error('Upload error:', error)
      alert('Terjadi kesalahan saat mengunggah foto')
    }

    setUploading(false)
  }

  const updateCaption = async (photoId: string, caption: string) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('trip_photos')
      .update({ caption })
      .eq('id', photoId)

    if (error) {
      console.error('Error updating caption:', error)
      alert('Gagal memperbarui keterangan')
    } else {
      // Update local state
      setPhotos(photos.map(photo => 
        photo.id === photoId ? { ...photo, caption } : photo
      ))
      setSelectedPhoto(null)
    }
  }

  const deletePhoto = async (photoId: string, filename: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus foto ini?')) return

    const supabase = createClient()

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('trip-photos')
      .remove([`trip-photos/${filename}`])

    if (storageError) {
      console.error('Storage delete error:', storageError)
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('trip_photos')
      .delete()
      .eq('id', photoId)

    if (dbError) {
      console.error('Database delete error:', dbError)
      alert('Gagal menghapus foto dari database')
    } else {
      // Update local state
      setPhotos(photos.filter(photo => photo.id !== photoId))
      setSelectedPhoto(null)
    }
  }

  const downloadPhoto = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Download error:', error)
      alert('Gagal mengunduh foto')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Galeri Foto Trip</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ImageIcon className="h-4 w-4" />
            <span>{photos.length} foto</span>
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          
          {uploading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              <span className="text-gray-600">Mengunggah foto...</span>
            </div>
          ) : (
            <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Unggah Foto</p>
              <p className="text-gray-600">
                Klik untuk memilih foto atau drag & drop<br />
                Format: JPG, PNG, GIF (Maksimal 5MB per file)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Belum ada foto yang diunggah</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-square">
                <img
                  src={photo.url}
                  alt={photo.caption || photo.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                  <button
                    onClick={() => setSelectedPhoto(photo)}
                    className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                    title="Lihat detail"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => downloadPhoto(photo.url, photo.filename)}
                    className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                    title="Unduh"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => deletePhoto(photo.id, photo.filename)}
                      className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"
                      title="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-sm text-gray-600 truncate">
                  {photo.caption || 'Tanpa keterangan'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {photo.profiles?.full_name || photo.profiles?.email} • {formatDate(photo.uploaded_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h4 className="text-lg font-semibold">Detail Foto</h4>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption || selectedPhoto.filename}
                className="w-full max-h-96 object-contain mb-4"
              />
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keterangan
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedPhoto.caption || ''}
                    onBlur={(e) => updateCaption(selectedPhoto.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Tambahkan keterangan..."
                  />
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>Diunggah oleh: {selectedPhoto.profiles?.full_name || selectedPhoto.profiles?.email}</p>
                  <p>Tanggal: {formatDate(selectedPhoto.uploaded_at)}</p>
                  <p>Nama file: {selectedPhoto.filename}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
