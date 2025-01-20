'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Camera, Share2 } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import html2canvas from 'html2canvas'
import { useUmweroTranslation } from '@/hooks/use-umwero-translation'
import { usePdfGenerator } from '@/hooks/use-pdf-generator'

export default function UmweroChat() {
  const [inputText, setInputText] = useState('')
  const [umweroText, setUmweroText] = useState('')
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const { t } = useTranslation()
  const umweroTextRef = useRef<HTMLDivElement>(null)
  const { latinToUmwero, charMap, consonantMap } = useUmweroTranslation()
  const [fontLoaded, setFontLoaded] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const { generatePdf, isGenerating } = usePdfGenerator()
  const [showReference, setShowReference] = useState(false)

  useEffect(() => {
    // Load the Umwero font
    const loadFont = async () => {
      try {
        const font = new FontFace('UMWEROalpha', 'url(/fonts/UMWEROPUAnumbers.otf)');
        await font.load();
        document.fonts.add(font);
        setFontLoaded(true);
        console.log('Umwero font loaded successfully');
      } catch (error) {
        console.error('Error loading Umwero font:', error);
        alert('Failed to load the Umwero font. Some features may not work correctly.');
      }
    };

    loadFont();
  }, []);

  // Automatically translate input text to Umwero
  useEffect(() => {
    if (inputText) {
      const translated = latinToUmwero(inputText)
      setUmweroText(translated)
    } else {
      setUmweroText('')
    }
  }, [inputText, latinToUmwero])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value)
  }

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value[0])
  }

  const takeScreenshot = async () => {
    if (umweroTextRef.current) {
      const canvas = await html2canvas(umweroTextRef.current)
      const image = canvas.toDataURL("image/png")
      setScreenshot(image)
    }
  }

  const shareScreenshot = async (platform: 'twitter' | 'facebook' | 'whatsapp') => {
    if (!screenshot) {
      alert(t('takeScreenshotFirst'))
      return
    }

    try {
      // Convert base64 to blob
      const response = await fetch(screenshot)
      const blob = await response.blob()
      
      // Create file from blob
      const file = new File([blob], 'umwero-text.png', { type: 'image/png' })

      if (navigator.share && platform === 'whatsapp') {
        try {
          await navigator.share({
            files: [file],
            title: t('umweroText'),
            text: t('checkOutMyUmweroText')
          })
          return
        } catch (error) {
          console.error('Error sharing:', error)
        }
      }

      // Fallback for platforms without native sharing
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      
      switch (platform) {
        case 'twitter':
          link.href = blobUrl
          link.download = 'umwero-text.png'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.open('https://twitter.com/compose/tweet', '_blank')
          break
          
        case 'facebook':
          const form = document.createElement('form')
          form.method = 'post'
          form.target = '_blank'
          form.action = 'https://www.facebook.com/share.php'
          
          const input = document.createElement('input')
          input.type = 'file'
          input.style.display = 'none'
          input.files = new FileList([file])
          
          form.appendChild(input)
          document.body.appendChild(form)
          form.submit()
          document.body.removeChild(form)
          break
          
        case 'whatsapp':
          link.href = blobUrl
          link.download = 'umwero-text.png'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.open('https://web.whatsapp.com', '_blank')
          break
      }
      
      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Error processing screenshot:', error)
      alert(t('errorSharingScreenshot'))
    }
  }

  const handleDownloadPDF = async () => {
    try {
      await generatePdf(umweroText, fontSize);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the PDF. Please try again.');
    }
  }

  const vowelMap = {
    'A': '"',
    'E': '|',
    'I': '}',
    'O': '{',
    'U': ':'
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-[#F3E5AB] border-[#8B4513]">
      <CardHeader>
        <CardTitle className="text-[#8B4513]">{t('umweroChat')}</CardTitle>
        <CardDescription className="text-[#D2691E]">{t('umweroChatDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="input-text" className="text-[#8B4513]">{t('enterLatinText')}</Label>
            <Textarea
              id="input-text"
              placeholder={t('typeLatinMessage')}
              value={inputText}
              onChange={handleInputChange}
              className="w-full h-40 p-2 border border-[#8B4513] rounded-md focus:ring-2 focus:ring-[#8B4513] focus:border-transparent bg-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-[#8B4513]">{t('umweroTranslation')}</Label>
            <div 
              ref={umweroTextRef} 
              className="text-[#8B4513] text-left p-4 min-h-[100px] border border-[#8B4513] rounded-md bg-white"
              style={{ 
                fontFamily: fontLoaded ? 'UMWEROalpha, sans-serif' : 'sans-serif',
                fontSize: `${fontSize}px`
              }}
            >
              {umweroText}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Label htmlFor="font-size" className="text-[#8B4513]">{t('fontSize')}: {fontSize}px</Label>
            <Slider
              id="font-size"
              min={12}
              max={32}
              step={1}
              value={[fontSize]}
              onValueChange={handleFontSizeChange}
              className="w-[200px]"
            />
          </div>

          <div className="flex flex-wrap justify-start gap-2">
            <Button 
              onClick={takeScreenshot} 
              className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]"
              disabled={!umweroText}
            >
              <Camera className="h-4 w-4 mr-2" />
              {t('takeScreenshot')}
            </Button>
            <Button 
              onClick={() => shareScreenshot('twitter')} 
              className="bg-[#1DA1F2] text-white hover:bg-[#1a90da]" 
              disabled={!screenshot}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Twitter
            </Button>
            <Button 
              onClick={() => shareScreenshot('facebook')} 
              className="bg-[#4267B2] text-white hover:bg-[#365899]" 
              disabled={!screenshot}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Facebook
            </Button>
            <Button 
              onClick={() => shareScreenshot('whatsapp')} 
              className="bg-[#25D366] text-white hover:bg-[#128C7E]" 
              disabled={!screenshot}
            >
              <Share2 className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
            <Button 
              onClick={handleDownloadPDF} 
              disabled={!umweroText || isGenerating}
              className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D] disabled:bg-gray-400"
            >
              {isGenerating ? t('generatingPDF') : t('downloadAsPDF')}
            </Button>
          </div>

          {screenshot && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2 text-[#8B4513]">{t('screenshot')}</h2>
              <img src={screenshot || "/placeholder.svg"} alt="Umwero text screenshot" className="border border-[#8B4513] rounded-md" />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="show-reference"
              checked={showReference}
              onCheckedChange={setShowReference}
              className="bg-[#8B4513]"
            />
            <Label htmlFor="show-reference" className="text-[#8B4513]">{t('showReferenceTable')}</Label>
          </div>

          {showReference && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 text-[#8B4513]">{t('referenceTable')}</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-[#8B4513] p-2 text-[#8B4513]">{t('latin')}</th>
                      <th className="border border-[#8B4513] p-2 text-[#8B4513]">{t('umwero')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(vowelMap).map(([latin, umwero]) => (
                      <tr key={latin}>
                        <td className="border border-[#8B4513] p-2 font-serif text-[#8B4513]">{latin}</td>
                        <td className="border border-[#8B4513] p-2 font-['UMWEROalpha'] text-[#8B4513]">{umwero}</td>
                      </tr>
                    ))}
                    {Object.entries(consonantMap).map(([latin, umwero]) => (
                      <tr key={latin}>
                        <td className="border border-[#8B4513] p-2 font-serif text-[#8B4513]">{latin}</td>
                        <td className="border border-[#8B4513] p-2 font-['UMWEROalpha'] text-[#8B4513]">{umwero}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

