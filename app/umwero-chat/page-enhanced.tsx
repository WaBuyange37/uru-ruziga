"use client"

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { useTranslation } from "../../hooks/useTranslation"
import { useUmweroTranslation } from '../../hooks/use-umwero-translation'
import { 
  Send, 
  Download, 
  Share2, 
  Camera, 
  Twitter, 
  Facebook, 
  Copy,
  Check,
  MessageCircle,
  Sparkles,
  Loader2,
  Instagram,
  Image as ImageIcon
} from 'lucide-react'

interface ChatMessage {
  id: string
  latinText: string
  umweroText: string
  imageUrl?: string
  timestamp: Date
  user: string
  fontSize: number
}

export default function UmweroChatPage() {
  const { t } = useTranslation()
  const { user, isAuthenticated } = useAuth()
  const { latinToUmwero } = useUmweroTranslation()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [umweroPreview, setUmweroPreview] = useState('')
  const [fontSize, setFontSize] = useState(48)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [copied, setCopied] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Auto-translate text as user types
  useEffect(() => {
    const translated = latinToUmwero(inputText)
    setUmweroPreview(translated)
  }, [inputText, latinToUmwero])

  // Load saved messages from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('umwero-chat-messages')
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
      setMessages(parsed)
    }
  }, [])

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('umwero-chat-messages', JSON.stringify(messages))
    }
  }, [messages])

  const generatePNG = async (latinText: string, umweroText: string, fontSize: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject('Canvas not supported')
        return
      }

      // Set canvas size (Instagram square: 1080x1080)
      canvas.width = 1080
      canvas.height = 1080

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#F3E5AB')
      gradient.addColorStop(0.5, '#FFFFFF')
      gradient.addColorStop(1, '#E8D89E')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Decorative border
      ctx.strokeStyle = '#8B4513'
      ctx.lineWidth = 16
      ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80)

      // Inner border
      ctx.strokeStyle = '#D2691E'
      ctx.lineWidth = 8
      ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120)

      // Title
      ctx.fillStyle = '#8B4513'
      ctx.font = 'bold 56px Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('UMWERO MESSAGE', canvas.width / 2, 160)

      // Decorative line
      ctx.strokeStyle = '#D2691E'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(200, 190)
      ctx.lineTo(880, 190)
      ctx.stroke()

      // Latin text
      ctx.font = '32px Arial, sans-serif'
      ctx.fillStyle = '#654321'
      ctx.fillText('Latin:', canvas.width / 2, 260)
      
      // Word wrap for Latin text
      const latinWords = latinText.split(' ')
      let latinLine = ''
      let latinY = 310
      const maxWidth = canvas.width - 200
      const latinLineHeight = 40

      for (let word of latinWords) {
        const testLine = latinLine + word + ' '
        const metrics = ctx.measureText(testLine)
        
        if (metrics.width > maxWidth && latinLine !== '') {
          ctx.fillText(latinLine, canvas.width / 2, latinY)
          latinLine = word + ' '
          latinY += latinLineHeight
        } else {
          latinLine = testLine
        }
      }
      ctx.fillText(latinLine, canvas.width / 2, latinY)

      // Umwero section background
      const umweroBoxY = latinY + 60
      const umweroBoxHeight = 400
      ctx.fillStyle = 'rgba(243, 229, 171, 0.5)'
      ctx.fillRect(100, umweroBoxY, canvas.width - 200, umweroBoxHeight)
      ctx.strokeStyle = '#D2691E'
      ctx.lineWidth = 4
      ctx.strokeRect(100, umweroBoxY, canvas.width - 200, umweroBoxHeight)

      // Umwero label
      ctx.fillStyle = '#D2691E'
      ctx.font = 'bold 28px Arial, sans-serif'
      ctx.fillText('Umwero:', canvas.width / 2, umweroBoxY + 50)

      // Umwero text (large, centered)
      ctx.font = `${fontSize}px UMWEROalpha, serif`
      ctx.fillStyle = '#8B4513'
      
      // Word wrap for Umwero text
      const words = umweroText.split(' ')
      let line = ''
      let y = umweroBoxY + 140
      const lineHeight = fontSize + 40

      for (let word of words) {
        const testLine = line + word + ' '
        const metrics = ctx.measureText(testLine)
        
        if (metrics.width > maxWidth && line !== '') {
          ctx.fillText(line, canvas.width / 2, y)
          line = word + ' '
          y += lineHeight
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, canvas.width / 2, y)

      // Footer section
      const footerY = canvas.height - 180
      ctx.strokeStyle = '#D2691E'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(200, footerY)
      ctx.lineTo(880, footerY)
      ctx.stroke()

      // Footer text
      ctx.font = '28px Arial, sans-serif'
      ctx.fillStyle = '#8B4513'
      ctx.fillText('Created with Uruziga', canvas.width / 2, footerY + 50)
      ctx.fillText('Umwero Learning Platform', canvas.width / 2, footerY + 90)
      
      if (user) {
        ctx.font = '24px Arial, sans-serif'
        ctx.fillStyle = '#D2691E'
        ctx.fillText(`By: ${user.fullName || user.email}`, canvas.width / 2, footerY + 130)
      }

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png')
      resolve(dataUrl)
    })
  }

  const sendMessage = async () => {
    if (!inputText.trim()) return
    
    setIsGeneratingImage(true)
    try {
      // Generate PNG
      const imageUrl = await generatePNG(inputText, umweroPreview, fontSize)
      
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        latinText: inputText,
        umweroText: umweroPreview,
        imageUrl,
        timestamp: new Date(),
        user: user?.fullName || user?.email || 'Anonymous',
        fontSize,
      }

      setMessages(prev => [newMessage, ...prev])
      
      // Save to database if authenticated
      if (isAuthenticated) {
        const token = localStorage.getItem('token')
        await fetch('/api/chat/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            latinText: inputText,
            umweroText: umweroPreview,
            imageUrl,
            fontSize,
          }),
        })
      }
      
      setInputText('')
      setUmweroPreview('')
      setGeneratedImageUrl(imageUrl)
    } catch (error) {
      console.error('Error generating image:', error)
      alert('Failed to generate image. Please try again.')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const downloadImage = (imageUrl: string, filename: string) => {
    const a = document.createElement('a')
    a.href = imageUrl
    a.download = filename
    a.click()
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const shareToSocial = (platform: string, message: ChatMessage) => {
    const text = `Check out my Umwero message: "${message.latinText}" ✨\n\n#Umwero #Kinyarwanda #Culture #Rwanda #AfricanScript`
    const url = window.location.origin
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`,
    }
    
    if (platform === 'instagram' || platform === 'tiktok') {
      // Download image and show instructions
      downloadImage(message.imageUrl!, `umwero-${message.id}.png`)
      alert(`Image downloaded! Open ${platform === 'instagram' ? 'Instagram' : 'TikTok'} and upload from your gallery.\n\nSuggested caption:\n${text}`)
    } else {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400')
    }
  }

  const clearChat = () => {
    if (confirm('Are you sure you want to clear all messages?')) {
      setMessages([])
      localStorage.removeItem('umwero-chat-messages')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3E5AB] via-[#FFFFFF] to-[#E8D89E]">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 text-[#8B4513]">
            {t("umweroChat")}
          </h1>
          <p className="text-xl text-[#D2691E] max-w-2xl mx-auto">
            Type in Latin and watch it transform into beautiful Umwero script ✨
            <br />
            <span className="text-lg">Auto-generates shareable PNG images for social media!</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="bg-white border-2 border-[#8B4513] shadow-xl">
            <CardHeader className="bg-gradient-to-r from-[#F3E5AB] to-[#E8D89E] border-b-2 border-[#8B4513]">
              <CardTitle className="text-[#8B4513] flex items-center gap-2">
                <MessageCircle className="h-6 w-6" />
                Compose Message
              </CardTitle>
              <CardDescription className="text-[#D2691E]">
                Type your message and watch it transform to Umwero
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Input Field */}
              <div>
                <label className="block text-sm font-medium text-[#8B4513] mb-2">
                  Latin Text
                </label>
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here... (e.g., Mwaramutse)"
                  className="border-2 border-[#8B4513] text-lg h-12 focus:border-[#D2691E]"
                />
              </div>

              {/* Font Size Control */}
              <div>
                <label className="block text-sm font-medium text-[#8B4513] mb-2">
                  Font Size: {fontSize}px
                </label>
                <input
                  type="range"
                  min="32"
                  max="72"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full h-2 bg-[#F3E5AB] rounded-lg appearance-none cursor-pointer accent-[#8B4513]"
                />
                <div className="flex justify-between text-xs text-[#D2691E] mt-1">
                  <span>Small</span>
                  <span>Medium</span>
                  <span>Large</span>
                </div>
              </div>

              {/* Live Umwero Preview */}
              <div>
                <label className="block text-sm font-medium text-[#8B4513] mb-2">
                  Umwero Preview
                </label>
                <div 
                  className="min-h-[150px] p-6 bg-gradient-to-br from-[#F3E5AB] to-[#FFFFFF] border-2 border-[#8B4513] rounded-lg shadow-inner"
                  style={{ 
                    fontFamily: "'UMWEROalpha', serif",
                    fontSize: `${fontSize}px`,
                    lineHeight: '1.5',
                    color: '#8B4513'
                  }}
                >
                  {umweroPreview || (
                    <span className="text-gray-400 italic" style={{ fontFamily: 'Arial, sans-serif', fontSize: '16px' }}>
                      Your Umwero text will appear here as you type...
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={sendMessage}
                  disabled={!inputText.trim() || isGeneratingImage}
                  className="flex-1 bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D] h-12 text-lg font-semibold"
                >
                  {isGeneratingImage ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Camera className="h-5 w-5 mr-2" />
                      Generate PNG
                    </>
                  )}
                </Button>
                
                {umweroPreview && (
                  <Button
                    onClick={() => copyToClipboard(umweroPreview)}
                    variant="outline"
                    className="border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#F3E5AB]"
                  >
                    {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Messages Gallery */}
          <Card className="bg-white border-2 border-[#8B4513] shadow-xl">
            <CardHeader className="bg-gradient-to-r from-[#F3E5AB] to-[#E8D89E] border-b-2 border-[#8B4513]">
              <div className="flex justify-between items-center">
                <CardTitle className="text-[#8B4513] flex items-center gap-2">
                  <Sparkles className="h-6 w-6" />
                  Generated Images ({messages.length})
                </CardTitle>
                {messages.length > 0 && (
                  <Button
                    onClick={clearChat}
                    variant="outline"
                    size="sm"
                    className="border-2 border-red-500 text-red-500 hover:bg-red-50"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6 max-h-[700px] overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <ImageIcon className="h-16 w-16 mx-auto mb-4 text-[#D2691E]" />
                    <p className="text-xl text-[#8B4513] mb-2">No messages yet</p>
                    <p className="text-[#D2691E]">Create your first Umwero message!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <Card key={message.id} className="bg-gradient-to-br from-[#F3E5AB] to-[#FFFFFF] border-2 border-[#D2691E] shadow-lg hover:shadow-xl transition-shadow">
                      <CardContent className="p-4">
                        {/* Message Header */}
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-[#8B4513] text-[#F3E5AB]">
                              {message.user}
                            </Badge>
                            <span className="text-xs text-[#D2691E]">
                              {message.timestamp.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Latin Text */}
                        <div className="mb-3 p-3 bg-white rounded-lg border border-[#D2691E]">
                          <p className="text-xs text-[#D2691E] mb-1">Latin:</p>
                          <p className="text-[#8B4513] font-medium">{message.latinText}</p>
                        </div>

                        {/* Generated Image Preview */}
                        {message.imageUrl && (
                          <div className="mb-4">
                            <img 
                              src={message.imageUrl} 
                              alt="Umwero Message" 
                              className="w-full rounded-lg border-2 border-[#8B4513] shadow-md cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => window.open(message.imageUrl, '_blank')}
                            />
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          <Button
                            onClick={() => downloadImage(message.imageUrl!, `umwero-${message.id}.png`)}
                            size="sm"
                            className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          
                          <Button
                            onClick={() => shareToSocial('twitter', message)}
                            size="sm"
                            variant="outline"
                            className="border-2 border-blue-400 text-blue-500 hover:bg-blue-50"
                          >
                            <Twitter className="h-4 w-4 mr-1" />
                            Twitter
                          </Button>

                          <Button
                            onClick={() => shareToSocial('facebook', message)}
                            size="sm"
                            variant="outline"
                            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                          >
                            <Facebook className="h-4 w-4 mr-1" />
                            Facebook
                          </Button>

                          <Button
                            onClick={() => shareToSocial('instagram', message)}
                            size="sm"
                            variant="outline"
                            className="border-2 border-pink-500 text-pink-500 hover:bg-pink-50"
                          >
                            <Instagram className="h-4 w-4 mr-1" />
                            Instagram
                          </Button>

                          <Button
                            onClick={() => shareToSocial('whatsapp', message)}
                            size="sm"
                            variant="outline"
                            className="border-2 border-green-500 text-green-500 hover:bg-green-50"
                          >
                            <Share2 className="h-4 w-4 mr-1" />
                            WhatsApp
                          </Button>

                          <Button
                            onClick={() => copyToClipboard(message.umweroText)}
                            size="sm"
                            variant="outline"
                            className="border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#F3E5AB]"
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Info */}
        <Card className="mt-8 bg-white border-2 border-[#8B4513] shadow-xl">
          <CardHeader className="bg-gradient-to-r from-[#F3E5AB] to-[#E8D89E] border-b-2 border-[#8B4513]">
            <CardTitle className="text-[#8B4513] text-center text-2xl">✨ Features</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div className="p-4 bg-gradient-to-br from-[#F3E5AB] to-[#FFFFFF] rounded-lg border-2 border-[#D2691E]">
                <Sparkles className="h-10 w-10 text-[#8B4513] mx-auto mb-3" />
                <h3 className="font-bold text-[#8B4513] mb-2 text-lg">Auto Translation</h3>
                <p className="text-sm text-[#D2691E]">
                  Text automatically converts to Umwero as you type
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-[#F3E5AB] to-[#FFFFFF] rounded-lg border-2 border-[#D2691E]">
                <Camera className="h-10 w-10 text-[#8B4513] mx-auto mb-3" />
                <h3 className="font-bold text-[#8B4513] mb-2 text-lg">PNG Generation</h3>
                <p className="text-sm text-[#D2691E]">
                  Automatically creates beautiful PNG images
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-[#F3E5AB] to-[#FFFFFF] rounded-lg border-2 border-[#D2691E]">
                <Share2 className="h-10 w-10 text-[#8B4513] mx-auto mb-3" />
                <h3 className="font-bold text-[#8B4513] mb-2 text-lg">Social Sharing</h3>
                <p className="text-sm text-[#D2691E]">
                  One-click sharing to all major platforms
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-[#F3E5AB] to-[#FFFFFF] rounded-lg border-2 border-[#D2691E]">
                <Download className="h-10 w-10 text-[#8B4513] mx-auto mb-3" />
                <h3 className="font-bold text-[#8B4513] mb-2 text-lg">Download</h3>
                <p className="text-sm text-[#D2691E]">
                  Save high-quality images to your device
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hidden canvas for image generation */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  )
}
