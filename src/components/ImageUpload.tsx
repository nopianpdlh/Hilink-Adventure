'use client'

import { useState } from 'react'
import { Upload, Link as LinkIcon } from 'lucide-react'

interface ImageUploadProps {
  name: string
  label: string
  placeholder?: string
}

export default function ImageUpload({ name, label, placeholder }: ImageUploadProps) {
  const [uploadType, setUploadType] = useState<'url' | 'file'>('url')
  const [previewUrl, setPreviewUrl] = useState<string>('')

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Preview image
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreviewUrl(event.target.value)
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      {/* Toggle buttons */}
      <div className="flex rounded-md shadow-sm">
        <button
          type="button"
          onClick={() => setUploadType('url')}
          className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
            uploadType === 'url'
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <LinkIcon className="w-4 h-4 inline mr-2" />
          URL Gambar
        </button>
        <button
          type="button"
          onClick={() => setUploadType('file')}
          className={`px-4 py-2 text-sm font-medium rounded-r-md border-l-0 border ${
            uploadType === 'file'
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Upload File
        </button>
      </div>

      {/* Input fields */}
      {uploadType === 'url' ? (
        <input
          type="url"
          name={`${name}_url`}
          placeholder={placeholder || "https://contoh.com/gambar.jpg"}
          onChange={handleUrlChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
        />
      ) : (
        <>
          <input
            type="file"
            name={`${name}_file`}
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
          <p className="text-xs text-gray-500">Format yang didukung: JPG, PNG, GIF. Maksimal 5MB.</p>
        </>
      )}

      {/* Hidden input to store upload type */}
      <input type="hidden" name={`${name}_type`} value={uploadType} />

      {/* Image preview */}
      {previewUrl && (
        <div className="mt-4">
          <p className="text-sm text-gray-700 mb-2">Preview:</p>
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-xs h-32 object-cover rounded-md border"
            onError={() => setPreviewUrl('')}
          />
        </div>
      )}
    </div>
  )
}
