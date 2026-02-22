// components/discussions/MediaUpload.tsx
"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '../ui/button'
import { Image as ImageIcon, X, Loader2, CheckCircle } from 'lucide-react'

interface MediaUploadProps {
  onMediaChange: (urls: string[]) => void
  maxFiles?: number
}

export function MediaUpload({ onMediaChange, maxFiles = 4 }: MediaUploadProps) {
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-upload when files are selected
  useEffect(() => {
    if (mediaFiles.length > 0 && !uploaded && !uploading) {
      uploadFiles()
    }
  }, [mediaFiles])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Filter valid files (images and videos)
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')
      const isUnder10MB = file.size <= 10 * 1024 * 1024 // 10MB limit
      return (isImage || isVideo) && isUnder10MB
    })

    if (validFiles.length + mediaFiles.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} files`)
      return
    }

    // Create previews
    const newPreviews: string[] = []
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        if (newPreviews.length === validFiles.length) {
          setPreviews([...previews, ...newPreviews])
        }
      }
      reader.readAsDataURL(file)
    })

    setMediaFiles([...mediaFiles, ...validFiles])
    setUploaded(false) // Reset uploaded state when new files added
  }

  const removeFile = (index: number) => {
    const newFiles = mediaFiles.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    setMediaFiles(newFiles)
    setPreviews(newPreviews)
    setUploaded(false)
    onMediaChange([]) // Clear uploaded URLs when removing files
  }

  const uploadFiles = async () => {
    if (mediaFiles.length === 0) return

    setUploading(true)
    const formData = new FormData()
    mediaFiles.forEach(file => {
      formData.append('files', file)
    })

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/discussions/upload-media', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      // Parse response regardless of status to get detailed error info
      const data = await response.json()
      
      if (!response.ok) {
        console.error('Upload API error:', data)
        throw new Error(data.error || `Upload failed with status ${response.status}`)
      }

      // Handle successful response
      const urls = data.urls || []
      console.log('Upload successful:', data)
      setUploaded(true)
      onMediaChange(urls)
      
      // Show success message if provided
      if (data.message) {
        console.log('Upload message:', data.message)
      }
    } catch (error) {
      console.error('Upload error:', error)
      
      // More specific error handling
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      if (errorMessage.includes('Authentication required')) {
        alert('Please log in to upload media.')
      } else if (errorMessage.includes('Invalid file type')) {
        alert('Please upload only images, videos, or audio files.')
      } else if (errorMessage.includes('too large')) {
        alert('File size too large. Please use files under 50MB.')
      } else {
        alert(`Failed to upload media: ${errorMessage}`)
      }
      
      setUploaded(false)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {previews.map((preview, index) => {
            const file = mediaFiles[index]
            const isVideo = file?.type.startsWith('video/')

            return (
              <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200">
                {isVideo ? (
                  <video
                    src={preview}
                    className="w-full h-32 object-cover"
                    controls
                  />
                ) : (
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </button>
                {uploaded && (
                  <div className="absolute bottom-1 right-1 p-1 bg-green-500 rounded-full">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="flex gap-2 items-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={mediaFiles.length >= maxFiles || uploading}
          className="gap-2"
        >
          <ImageIcon className="h-4 w-4" />
          {mediaFiles.length > 0 ? 'Add More' : 'Add Media'}
        </Button>
        
        {uploading && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading {mediaFiles.length} file{mediaFiles.length > 1 ? 's' : ''}...
          </div>
        )}
        
        {uploaded && !uploading && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            {mediaFiles.length} file{mediaFiles.length > 1 ? 's' : ''} uploaded!
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        {mediaFiles.length > 0 
          ? `${mediaFiles.length}/${maxFiles} files selected` 
          : `Upload up to ${maxFiles} images or videos (max 10MB each)`}
      </p>
    </div>
  )
}
