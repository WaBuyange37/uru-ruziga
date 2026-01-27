'use client'

import React, { useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Share2, CheckCircle, Award } from 'lucide-react'

interface CertificateData {
  certificateId: string
  recipientName: string
  level: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
  courseName: string
  completionDate: Date
  lessonsCompleted: number
  averageScore: number
  totalHoursSpent: number
  verificationHash: string
}

interface CertificateGeneratorProps {
  data: CertificateData
  onDownload?: () => void
  onShare?: () => void
}

const levelColors = {
  BRONZE: {
    primary: '#CD7F32',
    secondary: '#8B4513',
    text: 'Bronze Scholar'
  },
  SILVER: {
    primary: '#C0C0C0',
    secondary: '#808080',
    text: 'Silver Scholar'
  },
  GOLD: {
    primary: '#FFD700',
    secondary: '#B8860B',
    text: 'Gold Scholar'
  },
  PLATINUM: {
    primary: '#E5E4E2',
    secondary: '#71706E',
    text: 'Platinum Master'
  }
}

export function UmweroCertificate({ data, onDownload, onShare }: CertificateGeneratorProps) {
  const certificateRef = useRef<HTMLDivElement>(null)
  const levelColor = levelColors[data.level]

  const downloadAsPDF = async () => {
    if (!certificateRef.current) return

    try {
      // Dynamic import to reduce bundle size
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).default

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#FFFFFF',
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Umwero-Certificate-${data.certificateId}.pdf`)

      if (onDownload) onDownload()
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  const shareCertificate = () => {
    const shareText = `I just earned my ${levelColor.text} certificate in Umwero Alphabet! 🎓 Certificate ID: ${data.certificateId}`
    const shareUrl = `${window.location.origin}/verify/${data.certificateId}`

    if (navigator.share) {
      navigator.share({
        title: 'Umwero Certificate Achievement',
        text: shareText,
        url: shareUrl,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
      alert('Certificate link copied to clipboard!')
    }

    if (onShare) onShare()
  }

  return (
    <div className="space-y-6">
      {/* Certificate Preview */}
      <div ref={certificateRef} className="w-full bg-white p-12 shadow-2xl" style={{ aspectRatio: '297/210' }}>
        {/* Decorative Border */}
        <div className="relative h-full border-8 border-double p-8" style={{ borderColor: levelColor.primary }}>
          {/* Corner Decorations */}
          <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4" style={{ borderColor: levelColor.secondary }}></div>
          <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4" style={{ borderColor: levelColor.secondary }}></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4" style={{ borderColor: levelColor.secondary }}></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4" style={{ borderColor: levelColor.secondary }}></div>

          {/* Umwero Pattern Background */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div 
              className="w-full h-full flex items-center justify-center text-9xl"
              style={{ fontFamily: "'UMWEROalpha', serif" }}
            >
              ":M:G{
            </div>
          </div>

          {/* Certificate Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: levelColor.primary }}>
                  <Award className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-[#8B4513] mb-2">
                CERTIFICATE OF COMPLETION
              </h1>
              <div className="flex items-center justify-center gap-2">
                <div className="h-1 w-24" style={{ backgroundColor: levelColor.primary }}></div>
                <p className="text-sm text-gray-600 italic">Umwero Kinyarwanda Script</p>
                <div className="h-1 w-24" style={{ backgroundColor: levelColor.primary }}></div>
              </div>
            </div>

            {/* Level Badge */}
            <div>
              <div 
                className="inline-block px-6 py-2 rounded-full text-white font-bold text-xl shadow-lg"
                style={{ backgroundColor: levelColor.primary }}
              >
                {levelColor.text}
              </div>
            </div>

            {/* Recipient */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600 uppercase tracking-wider">This certifies that</p>
              <h2 className="text-5xl font-bold text-[#8B4513]" style={{ fontFamily: 'Georgia, serif' }}>
                {data.recipientName}
              </h2>
              <p className="text-sm text-gray-600">has successfully completed</p>
            </div>

            {/* Course Name */}
            <div>
              <h3 className="text-2xl font-semibold text-[#D2691E]">
                {data.courseName}
              </h3>
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-3 gap-6 w-full max-w-2xl">
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: levelColor.primary }}>
                  {data.lessonsCompleted}
                </div>
                <div className="text-xs text-gray-600 uppercase">Lessons Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: levelColor.primary }}>
                  {data.averageScore}%
                </div>
                <div className="text-xs text-gray-600 uppercase">Average Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: levelColor.primary }}>
                  {data.totalHoursSpent}
                </div>
                <div className="text-xs text-gray-600 uppercase">Hours Studied</div>
              </div>
            </div>

            {/* Footer */}
            <div className="space-y-4 pt-6">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="mb-2">
                    <div className="h-px w-40 bg-gray-400 mx-auto"></div>
                  </div>
                  <p className="text-xs text-gray-600">Kwizera Mugisha</p>
                  <p className="text-xs text-gray-500">Founder, Umwero Alphabet</p>
                </div>
                <div className="text-center">
                  <div className="mb-2">
                    <div className="h-px w-40 bg-gray-400 mx-auto"></div>
                  </div>
                  <p className="text-xs text-gray-600">{data.completionDate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}</p>
                  <p className="text-xs text-gray-500">Date of Completion</p>
                </div>
              </div>

              {/* Certificate ID & Verification */}
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <p className="text-xs font-mono text-gray-600">
                    Certificate ID: {data.certificateId}
                  </p>
                </div>
                <p className="text-[10px] text-gray-400">
                  Verify at: uruziga.rw/verify/{data.certificateId}
                </p>
                <p className="text-[10px] text-gray-400 font-mono">
                  Hash: {data.verificationHash.substring(0, 32)}...
                </p>
              </div>

              {/* Cultural Statement */}
              <div className="max-w-2xl mx-auto">
                <p className="text-xs italic text-gray-600">
                  "Umwero wagenewe gusigasira n'umurimi rw'Ikinyarwanda"
                </p>
                <p className="text-[10px] text-gray-500">
                  Umwero exists to preserve and modernize the Kinyarwanda language
                </p>
              </div>
            </div>
          </div>
            </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={downloadAsPDF}
          className="w-full bg-[#8B4513] hover:bg-[#A0522D] text-white"
          size="lg"
        >
          <Download className="mr-2 h-5 w-5" />
          Download PDF
        </Button>
        <Button
          onClick={shareCertificate}
          className="w-full"
          style={{ backgroundColor: levelColor.primary }}
          size="lg"
        >
          <Share2 className="mr-2 h-5 w-5" />
          Share Achievement
        </Button>
      </div>

      {/* Verification Info Card */}
      <Card className="bg-gradient-to-r from-[#F3E5AB] to-[#FFF8DC] border-[#D2691E]">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-[#8B4513] mb-2">Blockchain Verified Certificate</h4>
              <p className="text-sm text-gray-700 mb-3">
                This certificate is cryptographically signed and verified on the blockchain. 
                Anyone can verify its authenticity using the certificate ID above.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-white">
                  Issued: {data.completionDate.toLocaleDateString()}
                </Badge>
                <Badge variant="outline" className="bg-white">
                  Level: {levelColor.text}
                </Badge>
                <Badge variant="outline" className="bg-white">
                  Score: {data.averageScore}%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Certificate Generation Utility
export async function generateCertificate(
  userId: string,
  level: CertificateData['level'],
  courseName: string,
  lessonsCompleted: number,
  averageScore: number,
  totalHoursSpent: number,
  recipientName: string
): Promise<CertificateData> {
  // Generate unique certificate ID
  const year = new Date().getFullYear()
  const levelCode = level.substring(0, 3)
  const randomId = Math.random().toString(36).substring(2, 8).toUpperCase()
  const certificateId = `UMW-${year}-${levelCode}-${randomId}`

  // Generate verification hash (SHA-256)
  const dataString = `${userId}${certificateId}${level}${courseName}${lessonsCompleted}${averageScore}`
  const encoder = new TextEncoder()
  const data = encoder.encode(dataString)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const verificationHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  return {
    certificateId,
    recipientName,
    level,
    courseName,
    completionDate: new Date(),
    lessonsCompleted,
    averageScore,
    totalHoursSpent,
    verificationHash,
  }
}

// API endpoint to save certificate to database
export async function saveCertificateToDatabase(certificateData: CertificateData, userId: string) {
  try {
    const response = await fetch('/api/certificates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        ...certificateData,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to save certificate')
    }

    return await response.json()
  } catch (error) {
    console.error('Error saving certificate:', error)
    throw error
  }
}