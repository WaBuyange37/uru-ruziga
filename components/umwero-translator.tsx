"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { useUmweroTranslation } from '../hooks/use-umwero-translation'
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"
import { Slider } from "./ui/slider"
import { ArrowRightLeft } from 'lucide-react'
import mammoth from "mammoth"
import { usePdfGenerator } from '../hooks/use-pdf-generator'

export function UmweroTranslator() {
  const [input, setInput] = useState('')
  const [translated, setTranslated] = useState('')
  const [showReference, setShowReference] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { latinToUmwero, umweroToLatin, charMap, consonantMap } = useUmweroTranslation()
  const [fontLoaded, setFontLoaded] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const { generatePdf, isGenerating } = usePdfGenerator()
  const [translationDirection, setTranslationDirection] = useState<'latinToUmwero' | 'umweroToLatin'>('umweroToLatin')

  useEffect(() => {
    // Load the Umwero font
    const loadFont = async () => {
      try {
        const font = new FontFace('UMWEROalpha', 'url(/UMWEROPUAnumbers.otf)');
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

  const handleTranslate = () => {
    if (translationDirection === 'latinToUmwero') {
      setTranslated(latinToUmwero(input))
    } else {
      setTranslated(umweroToLatin(input))
    }
  }

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

  const vowelMap = {
    'A': '"',
    'E': '|',
    'I': '}',
    'O': '{',
    'U': ':'
  }

  return (
    <Card className="w-full max-w-6xl mx-auto bg-[#F3E5AB] border-[#8B4513]">
      <CardHeader>
        <CardTitle className="text-[#8B4513]">Umwero Alphabet Translator</CardTitle>
        <CardDescription className="text-[#D2691E]">Translate text to and from the Umwero alphabet</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full gap-4">
          <div className="flex items-center justify-between">
            <div className="relative w-[200px]">
              <select
                value={translationDirection}
                onChange={(e) => setTranslationDirection(e.target.value as 'latinToUmwero' | 'umweroToLatin')}
                className="w-full p-2 bg-white border border-[#8B4513] rounded text-[#8B4513] appearance-none cursor-pointer"
              >
                <option value="umweroToLatin">Umwero to Latin</option>
                <option value="latinToUmwero">Latin to Umwero</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 fill-current text-[#8B4513]" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
                </svg>
              </div>
            </div>
            <Button onClick={handleSwap} variant="outline" size="icon">
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <Label htmlFor="file-upload" className="text-[#8B4513]">Upload .txt or .docx file</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".txt,.docx"
              onChange={handleFileUpload}
              ref={fileInputRef}
              className="bg-white border-[#8B4513] text-[#8B4513]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="font-size" className="text-[#8B4513]">Font Size: {fontSize}px</Label>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="input-text" className="text-[#8B4513]">Input Text</Label>
              <Textarea
                id="input-text"
                placeholder="Enter text to translate..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{ 
                  fontSize: `${fontSize}px`, 
                  height: '300px',
                  letterSpacing: translationDirection === 'umweroToLatin' ? '0.12em' : '0.02em',
                  wordSpacing: translationDirection === 'umweroToLatin' ? '0.22em' : '0.05em',
                  lineHeight: translationDirection === 'umweroToLatin' ? '1.65' : '1.5'
                }}
                className={`resize-none bg-white border-[#8B4513] text-[#8B4513] ${translationDirection === 'umweroToLatin' && fontLoaded ? 'font-["UMWEROalpha"]' : ''}`}
              />
            </div>
            <div>
              <Label htmlFor="translated-text" className="text-[#8B4513]">Translated Text</Label>
              <Textarea
                id="translated-text"
                placeholder="Translated text will appear here..."
                value={translated}
                readOnly
                className={`resize-none bg-white border-[#8B4513] text-[#8B4513] ${translationDirection === 'latinToUmwero' && fontLoaded ? 'font-["UMWEROalpha"]' : ''}`}
                style={{ 
                  fontSize: `${fontSize}px`, 
                  height: '300px',
                  letterSpacing: translationDirection === 'latinToUmwero' ? '0.12em' : '0.02em',
                  wordSpacing: translationDirection === 'latinToUmwero' ? '0.22em' : '0.05em',
                  lineHeight: translationDirection === 'latinToUmwero' ? '1.65' : '1.5'
                }}
              />
            </div>
          </div>
          <div className="flex justify-between">
            <Button onClick={handleTranslate} className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]">Translate</Button>
            <Button 
              onClick={handleDownloadPDF} 
              disabled={!translated || isGenerating}
              className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D] disabled:bg-gray-400"
            >
              {isGenerating ? 'Generating PDF...' : 'Download as PDF'}
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-reference"
              checked={showReference}
              onCheckedChange={setShowReference}
              className="bg-[#8B4513]"
            />
            <Label htmlFor="show-reference" className="text-[#8B4513]">Show Reference Table</Label>
          </div>
          {showReference && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 text-[#8B4513]">Reference Table</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-[#8B4513] p-2 text-[#8B4513]">Latin</th>
                      <th className="border border-[#8B4513] p-2 text-[#8B4513]">Umwero</th>
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

