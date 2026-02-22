"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { useTranslation } from '../hooks/useTranslation'
import { useUmweroTranslation } from '../hooks/use-umwero-translation'
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"
import { Slider } from "./ui/slider"
import { Badge } from "./ui/badge"
import { ArrowRightLeft, Upload, Download, Eye, EyeOff, Sparkles, Languages, BookOpen } from 'lucide-react'
import mammoth from "mammoth"
import { usePdfGenerator } from '../hooks/use-pdf-generator'

export function UmweroTranslator() {
  const [input, setInput] = useState('')
  const [translated, setTranslated] = useState('')
  const [showReference, setShowReference] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // 🔒 CRITICAL TRANSLATION HOOKS - DO NOT MODIFY 🔒
  // These hooks are essential for proper ligature conversion
  const { vowelMap, ligatureMap } = useTranslation() // Keep for reference display
  const { latinToUmwero, umweroToLatin } = useUmweroTranslation() // Use same as umwero-chat
  const [fontLoaded, setFontLoaded] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const { generatePdf, isGenerating } = usePdfGenerator()
  const [translationDirection, setTranslationDirection] = useState<'latinToUmwero' | 'umweroToLatin'>('umweroToLatin')

  // 🔒 CRITICAL FONT LOADING - DO NOT MODIFY 🔒
  // This font loading is essential for proper ligature rendering
  // Last verified working: February 2026
  useEffect(() => {
    // Load the Umwero font
    const loadFont = async () => {
      try {
        // Load multiple font variants
        const fonts = [
          new FontFace('UMWEROalpha', 'url(/UMWEROalpha.woff)'),
          new FontFace('UmweroPUA', 'url(/UMWEROPUAnumbers.otf)'),
          new FontFace('Umwero', 'url(/Umwero.ttf)')
        ];
        
        await Promise.all(fonts.map(font => font.load()));
        fonts.forEach(font => document.fonts.add(font));
        
        setFontLoaded(true);
        console.log('Umwero fonts loaded successfully');
      } catch (error) {
        console.error('Error loading Umwero font:', error);
        // Don't show alert, just log the error
        setFontLoaded(true); // Still set to true to apply CSS fallbacks
      }
    };

    loadFont();
  }, []);

  const handleTranslate = () => {
    if (translationDirection === 'latinToUmwero') {
      setTranslated(latinToUmwero(input))
    } else {
      setTranslated(umweroToLatin(input))
    }
  }

  // 🚨 CRITICAL: Real-time translation as user types (like umwero-chat)
  // DO NOT MODIFY: This ensures ligatures work properly
  useEffect(() => {
    if (translationDirection === 'latinToUmwero') {
      setTranslated(latinToUmwero(input))
    } else {
      setTranslated(umweroToLatin(input))
    }
  }, [input, translationDirection, latinToUmwero, umweroToLatin])

  const handleSwap = () => {
    setTranslationDirection(prev => prev === 'latinToUmwero' ? 'umweroToLatin' : 'latinToUmwero')
    setInput(translated)
    setTranslated(input)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      let text = ''
      if (file.name.endsWith('.txt')) {
        text = await file.text()
      } else if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        text = result.value
      } else {
        throw new Error('Unsupported file type')
      }

      setInput(text)
      handleTranslate()
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('An error occurred while uploading the file. Please try again.');
    }
  }

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value[0])
  }

  const handleDownloadPDF = async () => {
    try {
      await generatePdf(translated, fontSize);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the PDF. Please try again.');
    }
  }

  // Combine all mappings for comprehensive reference table
  const allMappings = {
    ...vowelMap,
    ...ligatureMap
  }

  return (
    <Card className="w-full max-w-7xl mx-auto bg-white/90 backdrop-blur border-[#8B4513] shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-[#F3E5AB] to-[#FAEBD7] border-b border-[#8B4513] p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <CardTitle className="text-xl sm:text-2xl md:text-3xl text-[#8B4513] flex items-center gap-2">
              <Languages className="h-6 w-6 sm:h-8 sm:w-8" />
              Umwero Alphabet Translator
            </CardTitle>
            <CardDescription className="text-[#D2691E] text-sm sm:text-base lg:text-lg mt-2">
              Comprehensive translation with complete character mapping including numbers, ligatures, and all Ibihekane compounds
            </CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/80 flex-shrink-0">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
            <span className="text-xs sm:text-sm font-semibold">Enhanced</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 md:p-8">
        <div className="grid w-full gap-4 sm:gap-6">
          {/* Translation Direction & Controls */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
              <div className="relative w-full sm:w-[220px]">
                <select
                  value={translationDirection}
                  onChange={(e) => setTranslationDirection(e.target.value as 'latinToUmwero' | 'umweroToLatin')}
                  className="w-full p-2 sm:p-3 bg-white border-2 border-[#8B4513] rounded-lg text-[#8B4513] appearance-none cursor-pointer font-medium shadow-sm hover:shadow-md transition-shadow text-sm sm:text-base"
                >
                  <option value="umweroToLatin">Umwero → Latin</option>
                  <option value="latinToUmwero">Latin → Umwero</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 sm:px-3 pointer-events-none">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-[#8B4513]" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
                  </svg>
                </div>
              </div>
              <Button 
                onClick={handleSwap} 
                variant="outline" 
                size="icon"
                className="border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#F3E5AB] shadow-sm hover:shadow-md transition-all w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-2 flex-shrink-0"
              >
                <ArrowRightLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto justify-between lg:justify-end">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-reference"
                  checked={showReference}
                  onCheckedChange={setShowReference}
                  className="data-[state=checked]:bg-[#8B4513]"
                />
                <Label htmlFor="show-reference" className="text-[#8B4513] font-medium flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                  {showReference ? <Eye className="h-3 w-3 sm:h-4 sm:w-4" /> : <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />}
                  <span className="hidden sm:inline">Reference Table</span>
                  <span className="sm:hidden">Reference</span>
                </Label>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="file-upload" className="text-[#8B4513] font-medium flex items-center gap-2 mb-2 text-sm sm:text-base">
                <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                Upload Document (.txt or .docx)
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".txt,.docx"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="bg-white border-2 border-[#8B4513] text-[#8B4513] file:bg-[#F3E5AB] file:text-[#8B4513] file:border-0 file:rounded-md file:px-2 sm:file:px-3 file:py-1 file:mr-2 sm:file:mr-3 text-sm sm:text-base"
              />
            </div>
            <div>
              <Label htmlFor="font-size" className="text-[#8B4513] font-medium mb-2 block text-sm sm:text-base">
                Font Size: {fontSize}px
              </Label>
              <Slider
                id="font-size"
                min={12}
                max={32}
                step={1}
                value={[fontSize]}
                onValueChange={handleFontSizeChange}
                className="w-full"
              />
            </div>
          </div>

          {/* Translation Areas */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="input-text" className="text-[#8B4513] font-medium text-base sm:text-lg">
                {translationDirection === 'latinToUmwero' ? 'Latin Text' : 'Umwero Text'}
              </Label>
              <Textarea
                id="input-text"
                placeholder={translationDirection === 'latinToUmwero' ? 'Enter Latin text to translate...' : 'Enter Umwero text to translate...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{ 
                  fontSize: `${Math.min(fontSize, 24)}px`, 
                  height: '250px',
                  letterSpacing: translationDirection === 'umweroToLatin' ? '0.08em' : '0.02em',
                  wordSpacing: translationDirection === 'umweroToLatin' ? '0.15em' : '0.05em',
                  lineHeight: translationDirection === 'umweroToLatin' ? '1.5' : '1.4',
                  fontFeatureSettings: translationDirection === 'umweroToLatin' ? '"liga" 1, "calt" 1' : 'normal',
                  textRendering: translationDirection === 'umweroToLatin' ? 'optimizeLegibility' : 'auto'
                }}
                className={`resize-none bg-white border-2 border-[#8B4513] text-[#8B4513] shadow-sm focus:shadow-md transition-shadow ${translationDirection === 'umweroToLatin' && fontLoaded ? 'font-["Umwero","UMWEROalpha","UmweroPUA"] umwero-text' : ''}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="translated-text" className="text-[#8B4513] font-medium text-base sm:text-lg">
                {translationDirection === 'latinToUmwero' ? 'Umwero Text' : 'Latin Text'}
              </Label>
              <Textarea
                id="translated-text"
                placeholder="Translated text will appear here..."
                value={translated}
                readOnly
                className={`resize-none bg-[#F3E5AB]/30 border-2 border-[#8B4513] text-[#8B4513] shadow-sm ${translationDirection === 'latinToUmwero' && fontLoaded ? 'font-["Umwero","UMWEROalpha","UmweroPUA"] umwero-text' : ''}`}
                style={{ 
                  fontSize: `${Math.min(fontSize, 24)}px`, 
                  height: '250px',
                  letterSpacing: translationDirection === 'latinToUmwero' ? '0.08em' : '0.02em',
                  wordSpacing: translationDirection === 'latinToUmwero' ? '0.15em' : '0.05em',
                  lineHeight: translationDirection === 'latinToUmwero' ? '1.5' : '1.4',
                  fontFeatureSettings: translationDirection === 'latinToUmwero' ? '"liga" 1, "calt" 1' : 'normal',
                  textRendering: translationDirection === 'latinToUmwero' ? 'optimizeLegibility' : 'auto'
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
            <Button 
              onClick={handleTranslate} 
              className="bg-[#8B4513] text-white hover:bg-[#A0522D] shadow-lg hover:shadow-xl transition-all flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base order-2 sm:order-1"
              size="lg"
            >
              <Languages className="h-4 w-4 sm:h-5 sm:w-5" />
              Translate
            </Button>
            <Button 
              onClick={handleDownloadPDF} 
              disabled={!translated || isGenerating}
              variant="outline"
              className="border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#F3E5AB] disabled:bg-gray-100 disabled:text-gray-400 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base order-1 sm:order-2"
              size="lg"
            >
              <Download className="h-4 w-4 sm:h-5 sm:w-5" />
              {isGenerating ? 'Generating PDF...' : 'Download PDF'}
            </Button>
          </div>

              {/* Enhanced Reference Table */}
          {showReference && (
            <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <h2 className="text-xl sm:text-2xl font-bold text-[#8B4513] flex items-center gap-2">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
                  Complete Character Reference
                </h2>
                <Badge variant="outline" className="px-2 sm:px-3 py-1 text-xs sm:text-sm">
                  {Object.keys(allMappings).length}+ Characters
                </Badge>
              </div>
              
              {/* Vowels Section */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                  <CardTitle className="text-base sm:text-lg text-blue-800 flex items-center gap-2">
                    <div className="text-xl sm:text-2xl">🌍</div>
                    Vowels (Indangagaciro)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
                    {Object.entries(vowelMap).map(([latin, umwero]) => (
                      <div key={latin} className="bg-white rounded-lg p-2 sm:p-3 border border-blue-200 text-center">
                        <div className="text-sm sm:text-lg font-serif text-blue-800 mb-1">{latin}</div>
                        <div className="text-lg sm:text-2xl font-['UMWEROalpha'] text-blue-600">{umwero}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Ligatures Section */}
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                  <CardTitle className="text-base sm:text-lg text-purple-800 flex items-center gap-2">
                    <div className="text-xl sm:text-2xl">🧩</div>
                    Ligatures & Compounds (Ibihekane)
                  </CardTitle>
                  <CardDescription className="text-purple-600 text-sm sm:text-base">
                    Advanced character combinations for complex sounds
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                    {Object.entries(ligatureMap).map(([latin, umwero]) => (
                      <div key={latin} className="bg-white rounded-lg p-2 sm:p-3 border border-purple-200 text-center hover:shadow-md transition-shadow">
                        <div className="text-xs sm:text-sm font-serif text-purple-800 mb-1 font-semibold">{latin}</div>
                        <div className="text-base sm:text-xl font-['UMWEROalpha'] text-purple-600">{umwero}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Usage Tips */}
              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-amber-800 mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                    Translation Tips
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-amber-700">
                    <div>
                      <strong>• Comprehensive Mapping:</strong> Supports 200+ characters including numbers, ligatures, and all Ibihekane compounds
                    </div>
                    <div>
                      <strong>• Ligature Priority:</strong> Automatically detects the longest possible ligature combinations first
                    </div>
                    <div>
                      <strong>• Cultural Context:</strong> Each character carries deep cultural significance beyond phonetic representation
                    </div>
                    <div>
                      <strong>• Bidirectional:</strong> Translation works seamlessly in both Latin→Umwero and Umwero→Latin directions
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

