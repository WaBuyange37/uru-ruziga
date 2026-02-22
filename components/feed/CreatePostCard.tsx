"use client"

import { useState, useRef } from "react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { Image as ImageIcon, X, Loader2 } from "lucide-react"
import { useAuth } from "../../app/contexts/AuthContext"
import { showToast } from "../ui/toast"
import Image from "next/image"

interface CreatePostCardProps {
  onPostCreated: (post: any) => void
}

export default function CreatePostCard({ onPostCreated }: CreatePostCardProps) {
  const { user } = useAuth()
  const [content, setContent] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be less than 5MB', 'error')
      return
    }

    setImageFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      // Upload to your image storage (Cloudinary, S3, etc.)
      // For now, we'll use a base64 data URL as fallback
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          resolve(reader.result as string)
        }
        reader.readAsDataURL(file)
      })
    } catch (error) {
      console.error('Image upload error:', error)
      return null
    }
  }

  const handleSubmit = async () => {
    if (!content.trim() && !imageFile) {
      showToast('Please add some content or an image', 'error')
      return
    }

    if (content.length > 5000) {
      showToast('Content must be less than 5000 characters', 'error')
      return
    }

    setSubmitting(true)

    try {
      let imageUrl = null

      // Upload image if present
      if (imageFile) {
        setUploading(true)
        imageUrl = await uploadImage(imageFile)
        setUploading(false)

        if (!imageUrl) {
          showToast('Failed to upload image', 'error')
          setSubmitting(false)
          return
        }
      }

      const token = getToken()
      if (!token) {
        showToast('Please login to post', 'error')
        setSubmitting(false)
        return
      }

      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: content.trim(),
          language: 'en',
          imageUrl,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create post')
      }

      const data = await response.json()
      
      // Reset form
      setContent('')
      removeImage()
      
      // Notify parent
      onPostCreated(data.post)
    } catch (error) {
      console.error('Error creating post:', error)
      showToast(error instanceof Error ? error.message : 'Failed to create post', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const characterCount = content.length
  const isOverLimit = characterCount > 5000

  return (
    <Card className="border-neutral-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* User Avatar */}
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-[#8B4513] flex items-center justify-center text-white font-semibold">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>

          {/* Input Area */}
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none border-none focus-visible:ring-0 p-0 text-base"
              disabled={submitting}
            />

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative rounded-lg overflow-hidden border">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={500}
                  height={300}
                  className="w-full h-auto max-h-96 object-cover"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition"
                  disabled={submitting}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={submitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={submitting || uploading}
                  className="text-[#8B4513] hover:bg-[#F3E5AB]"
                >
                  <ImageIcon className="h-4 w-4 mr-1" />
                  Photo
                </Button>
              </div>

              <div className="flex items-center gap-3">
                {/* Character Count */}
                {content && (
                  <span className={`text-sm ${isOverLimit ? 'text-red-500' : 'text-neutral-500'}`}>
                    {characterCount}/5000
                  </span>
                )}

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || uploading || (!content.trim() && !imageFile) || isOverLimit}
                  className="bg-[#8B4513] hover:bg-[#A0522D] text-white"
                  size="sm"
                >
                  {submitting || uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      {uploading ? 'Uploading...' : 'Posting...'}
                    </>
                  ) : (
                    'Post'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
