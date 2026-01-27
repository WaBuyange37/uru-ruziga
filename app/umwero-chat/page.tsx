"use client"
// /home/nzela37/Kwizera/Projects/uru-ruziga/app/umwero-chat/page.tsx
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { useTranslation } from "../../hooks/useTranslation"
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
  Sparkles
} from 'lucide-react'

// Import the real Umwero translation system
import { useUmweroTranslation } from '../../hooks/use-umwero-translation'

interface ChatMessage {
  id: string
  latinText: string
  umweroText: string
  timestamp: Date
  user: string
}

export default function UmweroChatPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { latinToUmwero, umweroToLatin } = useUmweroTranslation() // Use real translation
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [umweroPreview, setUmweroPreview] = useState('')
  const [fontSize, setFontSize] = useState(24)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [copied, setCopied] = useState(false)
  const umweroPreviewRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  // Auto-translate text as user types using real Umwero translation
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

  const sendMessage = () => {
    if (!inputText.trim()) return
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      latinText: inputText,
      umweroText: umweroPreview,
      timestamp: new Date(),
      user: user?.fullName || user?.email || 'Anonymous'
    }

    setMessages(prev => [newMessage, ...prev])
    setInputText('')
    setUmweroPreview('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const generateSocialImage = async (message: ChatMessage) => {
    setIsGeneratingImage(true)
    
    try {
      // Create a canvas for the image
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Set canvas size
      canvas.width = 800
      canvas.height = 600

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#F3E5AB')
      gradient.addColorStop(1, '#D2691E')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add decorative border
      ctx.strokeStyle = '#8B4513'
      ctx.lineWidth = 8
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40)

      // Title
      ctx.fillStyle = '#8B4513'
      ctx.font = 'bold 36px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Umwero Message', canvas.width / 2, 100)

      // Latin text
      ctx.font = '24px Arial'
      ctx.fillStyle = '#654321'
      ctx.fillText('Latin: ' + message.latinText, canvas.width / 2, 180)

      // Umwero text (larger and centered)
      ctx.font = `${fontSize + 20}px UMWEROalpha, serif`
      ctx.fillStyle = '#8B4513'
      ctx.textAlign = 'center'
      
      // Word wrap for long text
      const words = message.umweroText.split(' ')
      let line = ''
      let y = 280
      const maxWidth = canvas.width - 100
      const lineHeight = fontSize + 30

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' '
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width
        
        if (testWidth > maxWidth && i > 0) {
          ctx.fillText(line, canvas.width / 2, y)
          line = words[i] + ' '
          y += lineHeight
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, canvas.width / 2, y)

      // Footer
      ctx.font = '18px Arial'
      ctx.fillStyle = '#8B4513'
      ctx.fillText('Created with Uruziga - Umwero Learning Platform', canvas.width / 2, canvas.height - 80)
      ctx.fillText(`By: ${message.user}`, canvas.width / 2, canvas.height - 50)

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return
        
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `umwero-message-${Date.now()}.png`
        a.click()
        URL.revokeObjectURL(url)
      })

    } catch (error) {
      console.error('Error generating image:', error)
      alert('Failed to generate image. Please try again.')
    } finally {
      setIsGeneratingImage(false)
    }
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
    const text = `Check out this Umwero message: "${message.latinText}" ✨ Learn more about Umwero alphabet at`
    const url = window.location.origin
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
    }
    
    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank')
  }

  const clearChat = () => {
    setMessages([])
    localStorage.removeItem('umwero-chat-messages')
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-[#FFFFFF]">
      <h1 className="text-4xl font-bold mb-6 text-center text-[#8B4513]">
        {t("umweroChat")}
      </h1>
      
      <p className="text-xl text-center mb-8 text-[#D2691E]">
        Type in Latin and see it transform into beautiful Umwero script ✨
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card className="bg-[#F3E5AB] border-[#8B4513]">
          <CardHeader>
            <CardTitle className="text-[#8B4513] flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Compose Message
            </CardTitle>
            <CardDescription className="text-[#D2691E]">
              Type your message and watch it transform to Umwero
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Input Field */}
            <div>
              <label className="block text-sm font-medium text-[#8B4513] mb-2">
                Latin Text
              </label>
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="border-[#8B4513] text-lg"
              />
            </div>

            {/* Font Size Control */}
            <div>
              <label className="block text-sm font-medium text-[#8B4513] mb-2">
                Font Size: {fontSize}px
              </label>
              <input
                type="range"
                min="16"
                max="48"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Live Umwero Preview */}
            <div>
              <label className="block text-sm font-medium text-[#8B4513] mb-2">
                Umwero Preview
              </label>
              <div 
                ref={umweroPreviewRef}
                className="min-h-[120px] p-4 bg-white border-2 border-[#8B4513] rounded-lg"
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
            <div className="flex gap-2">
              <Button
                onClick={sendMessage}
                disabled={!inputText.trim()}
                className="flex-1 bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
              
              {umweroPreview && (
                <Button
                  onClick={() => copyToClipboard(umweroPreview)}
                  variant="outline"
                  className="border-[#8B4513] text-[#8B4513]"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="bg-[#F3E5AB] border-[#8B4513]">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-[#8B4513] flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Messages ({messages.length})
              </CardTitle>
              {messages.length > 0 && (
                <Button
                  onClick={clearChat}
                  variant="outline"
                  size="sm"
                  className="border-[#8B4513] text-[#8B4513]"
                >
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div 
              ref={chatRef}
              className="space-y-4 max-h-[600px] overflow-y-auto"
            >
              {messages.length === 0 ? (
                <div className="text-center py-8 text-[#D2691E]">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-[#D2691E]" />
                  <p>No messages yet. Send your first Umwero message!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <Card key={message.id} className="bg-white border-[#8B4513]">
                    <CardContent className="p-4">
                      {/* Message Header */}
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-[#8B4513] text-[#F3E5AB]">
                            {message.user}
                          </Badge>
                          <span className="text-sm text-[#D2691E]">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>

                      {/* Latin Text */}
                      <div className="mb-3">
                        <p className="text-sm text-[#D2691E] mb-1">Latin:</p>
                        <p className="text-[#8B4513]">{message.latinText}</p>
                      </div>

                      {/* Umwero Text - Using Real Translation */}
                      <div className="mb-4">
                        <p className="text-sm text-[#D2691E] mb-1">Umwero:</p>
                        <div 
                          className="p-3 bg-[#F3E5AB] rounded-lg border border-[#D2691E]"
                          style={{ 
                            fontFamily: "'UMWEROalpha', serif",
                            fontSize: `${fontSize}px`,
                            lineHeight: '1.5',
                            color: '#8B4513'
                          }}
                        >
                          {message.umweroText}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => generateSocialImage(message)}
                          disabled={isGeneratingImage}
                          size="sm"
                          className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]"
                        >
                          <Camera className="h-3 w-3 mr-1" />
                          {isGeneratingImage ? 'Creating...' : 'PNG'}
                        </Button>
                        
                        <Button
                          onClick={() => copyToClipboard(message.umweroText)}
                          size="sm"
                          variant="outline"
                          className="border-[#8B4513] text-[#8B4513]"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>

                        <Button
                          onClick={() => shareToSocial('twitter', message)}
                          size="sm"
                          variant="outline"
                          className="border-blue-500 text-blue-500"
                        >
                          <Twitter className="h-3 w-3 mr-1" />
                          Tweet
                        </Button>

                        <Button
                          onClick={() => shareToSocial('facebook', message)}
                          size="sm"
                          variant="outline"
                          className="border-blue-600 text-blue-600"
                        >
                          <Facebook className="h-3 w-3 mr-1" />
                          Share
                        </Button>

                        <Button
                          onClick={() => shareToSocial('whatsapp', message)}
                          size="sm"
                          variant="outline"
                          className="border-green-500 text-green-500"
                        >
                          <Share2 className="h-3 w-3 mr-1" />
                          WhatsApp
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
      <Card className="mt-8 bg-[#F3E5AB] border-[#8B4513]">
        <CardHeader>
          <CardTitle className="text-[#8B4513] text-center">✨ Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <Sparkles className="h-8 w-8 text-[#8B4513] mx-auto mb-2" />
              <h3 className="font-semibold text-[#8B4513] mb-2">Auto Translation</h3>
              <p className="text-sm text-[#D2691E]">
                Text automatically converts to Umwero as you type
              </p>
            </div>
            <div>
              <Camera className="h-8 w-8 text-[#8B4513] mx-auto mb-2" />
              <h3 className="font-semibold text-[#8B4513] mb-2">Social Sharing</h3>
              <p className="text-sm text-[#D2691E]">
                Generate beautiful PNG images for social media
              </p>
            </div>
            <div>
              <Share2 className="h-8 w-8 text-[#8B4513] mx-auto mb-2" />
              <h3 className="font-semibold text-[#8B4513] mb-2">Easy Sharing</h3>
              <p className="text-sm text-[#D2691E]">
                One-click sharing to Twitter, Facebook, WhatsApp
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}