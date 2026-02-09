"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileVideo, FileText, Image, Music } from 'lucide-react'

interface LessonUploadFormProps {
  lessonId?: string
  onUploadComplete?: (url: string, type: string) => void
}

export function LessonUploadForm({ lessonId, onUploadComplete }: LessonUploadFormProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [uploadedFiles, setUploadedFiles] = useState<{ type: string; url: string; filename: string }[]>([])
  const [error, setError] = useState('')

  const handleFileUpload = async (file: File, type: 'video' | 'pdf' | 'image' | 'audio') => {
    setError('')
    setUploading(true)
    setUploadProgress({ ...uploadProgress, [type]: 0 })

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      if (lessonId) formData.append('lessonId', lessonId)

      const token = localStorage.getItem('token')
      const response = await fetch('/api/lessons/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()
      
      setUploadedFiles([...uploadedFiles, {
        type,
        url: data.url,
        filename: data.filename
      }])

      setUploadProgress({ ...uploadProgress, [type]: 100 })
      
      if (onUploadComplete) {
        onUploadComplete(data.url, type)
      }

      setTimeout(() => {
        setUploadProgress({ ...uploadProgress, [type]: 0 })
      }, 2000)

    } catch (err: any) {
      setError(err.message || 'Upload failed')
      setUploadProgress({ ...uploadProgress, [type]: 0 })
    } finally {
      setUploading(false)
    }
  }

  const FileUploadSection = ({ 
    type, 
    icon: Icon, 
    title, 
    accept, 
    maxSize 
  }: { 
    type: 'video' | 'pdf' | 'image' | 'audio'
    icon: any
    title: string
    accept: string
    maxSize: string
  }) => (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#8B4513] transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <Icon className="h-6 w-6 text-[#8B4513]" />
        <div>
          <h3 className="font-semibold text-[#8B4513]">{title}</h3>
          <p className="text-xs text-gray-600">Max size: {maxSize}</p>
        </div>
      </div>
      
      <Input
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileUpload(file, type)
        }}
        disabled={uploading}
        className="cursor-pointer"
      />
      
      {uploadProgress[type] > 0 && uploadProgress[type] < 100 && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#8B4513] h-2 rounded-full transition-all"
              style={{ width: `${uploadProgress[type]}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">{uploadProgress[type]}%</p>
        </div>
      )}
      
      {uploadProgress[type] === 100 && (
        <p className="text-sm text-green-600 mt-2">✓ Uploaded successfully!</p>
      )}
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Lesson Materials
        </CardTitle>
        <CardDescription>
          Upload videos, PDFs, images, and audio files for your lesson
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <FileUploadSection
          type="video"
          icon={FileVideo}
          title="Video Lesson"
          accept="video/mp4,video/webm,video/quicktime"
          maxSize="100MB"
        />

        <FileUploadSection
          type="pdf"
          icon={FileText}
          title="PDF Worksheet"
          accept="application/pdf"
          maxSize="10MB"
        />

        <FileUploadSection
          type="image"
          icon={Image}
          title="Lesson Image/Thumbnail"
          accept="image/jpeg,image/png,image/webp"
          maxSize="5MB"
        />

        <FileUploadSection
          type="audio"
          icon={Music}
          title="Audio Pronunciation"
          accept="audio/mpeg,audio/wav,audio/mp3"
          maxSize="20MB"
        />

        {uploadedFiles.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
            <h4 className="font-semibold text-green-800 mb-2">Uploaded Files:</h4>
            <ul className="space-y-1">
              {uploadedFiles.map((file, index) => (
                <li key={index} className="text-sm text-green-700">
                  ✓ {file.type}: {file.filename}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
