'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Camera, Upload, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'

interface PhotoUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (imageFile: File) => Promise<void>
  characterName: string
}

export function PhotoUploadModal({ 
  isOpen, 
  onClose, 
  onUpload, 
  characterName 
}: PhotoUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setSelectedFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      await onUpload(selectedFile)
      setUploaded(true)
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose()
        resetState()
      }, 2000)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload photo. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const resetState = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setUploading(false)
    setUploaded(false)
  }

  const handleClose = () => {
    onClose()
    resetState()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-[#8B4513]">
              Upload Real Handwriting
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              disabled={uploading}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Success State */}
          {uploaded && (
            <div className="text-center py-8">
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-green-800 mb-2">
                Thank You!
              </h4>
              <p className="text-green-700">
                Your handwriting sample helps improve our AI model
              </p>
            </div>
          )}

          {/* Upload State */}
          {!uploaded && (
            <>
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  📸 Help Build Better AI
                </h4>
                <p className="text-sm text-blue-800 mb-2">
                  Upload a photo of "{characterName}" written with pen/pencil on paper.
                </p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Write clearly on white/light paper</li>
                  <li>• Good lighting, no shadows</li>
                  <li>• Character should fill most of the frame</li>
                  <li>• Any pen/pencil style is valuable!</li>
                </ul>
              </div>

              {/* Preview or Upload Area */}
              {previewUrl ? (
                <div className="mb-4">
                  <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-[#8B4513]">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null)
                      setPreviewUrl(null)
                    }}
                    className="w-full mt-2"
                    disabled={uploading}
                  >
                    Choose Different Photo
                  </Button>
                </div>
              ) : (
                <div className="mb-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-32 flex-col gap-2 border-2 border-dashed border-[#8B4513] hover:bg-[#FFF8DC]"
                    >
                      <Camera className="h-8 w-8 text-[#8B4513]" />
                      <span className="text-sm">Take Photo</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.removeAttribute('capture')
                          fileInputRef.current.click()
                        }
                      }}
                      className="h-32 flex-col gap-2 border-2 border-dashed border-[#8B4513] hover:bg-[#FFF8DC]"
                    >
                      <Upload className="h-8 w-8 text-[#8B4513]" />
                      <span className="text-sm">Upload Photo</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={uploading}
                  className="flex-1"
                >
                  Skip for Now
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="flex-1 bg-[#8B4513] hover:bg-[#A0522D]"
                >
                  {uploading ? 'Uploading...' : 'Upload & Contribute'}
                </Button>
              </div>

              {/* Privacy Note */}
              <p className="text-xs text-gray-600 text-center mt-4">
                Your contribution helps train better handwriting recognition for Umwero script. 
                Images are stored securely and used only for educational purposes.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
