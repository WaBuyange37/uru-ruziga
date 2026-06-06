"use client"

import { useEffect, useRef, useState } from "react"
import mammoth from "mammoth"
import { ArrowRightLeft, BookOpen, Download, Languages, Upload } from "lucide-react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { useTranslation } from "../hooks/useTranslation"
import { useUmweroTranslation } from "../hooks/use-umwero-translation"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Slider } from "./ui/slider"
import { Badge } from "./ui/badge"
import { usePdfGenerator } from "../hooks/use-pdf-generator"

export function UmweroTranslator() {
  const [input, setInput] = useState("")
  const [translated, setTranslated] = useState("")
  const [showReference, setShowReference] = useState(true)
  const [referenceTab, setReferenceTab] = useState<"vowels" | "ligatures">("vowels")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // CRITICAL TRANSLATION HOOKS - DO NOT MODIFY.
  const { vowelMap, ligatureMap } = useTranslation()
  const { latinToUmwero, umweroToLatin } = useUmweroTranslation()
  const [fontLoaded, setFontLoaded] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const { generatePdf, isGenerating } = usePdfGenerator()
  const [translationDirection, setTranslationDirection] = useState<"latinToUmwero" | "umweroToLatin">("umweroToLatin")

  useEffect(() => {
    const loadFont = async () => {
      try {
        const fonts = [
          new FontFace("UMWEROalpha", "url(/UMWEROalpha.woff)"),
          new FontFace("UmweroPUA", "url(/UMWEROPUAnumbers.otf)"),
          new FontFace("Umwero", "url(/Umwero.ttf)"),
        ]
        await Promise.all(fonts.map((font) => font.load()))
        fonts.forEach((font) => document.fonts.add(font))
        setFontLoaded(true)
      } catch (error) {
        console.error("Error loading Umwero font:", error)
        setFontLoaded(true)
      }
    }

    loadFont()
  }, [])

  const handleTranslate = () => {
    if (translationDirection === "latinToUmwero") {
      setTranslated(latinToUmwero(input))
    } else {
      setTranslated(umweroToLatin(input))
    }
  }

  useEffect(() => {
    if (translationDirection === "latinToUmwero") {
      setTranslated(latinToUmwero(input))
    } else {
      setTranslated(umweroToLatin(input))
    }
  }, [input, translationDirection, latinToUmwero, umweroToLatin])

  const handleSwap = () => {
    setTranslationDirection((prev) => (prev === "latinToUmwero" ? "umweroToLatin" : "latinToUmwero"))
    setInput(translated)
    setTranslated(input)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      let text = ""
      if (file.name.endsWith(".txt")) {
        text = await file.text()
      } else if (file.name.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        text = result.value
      } else {
        throw new Error("Unsupported file type")
      }

      setInput(text)
      handleTranslate()
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("An error occurred while uploading the file. Please try again.")
    }
  }

  const handleDownloadPDF = async () => {
    try {
      await generatePdf(translated, fontSize)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("An error occurred while generating the PDF. Please try again.")
    }
  }

  const allMappings = {
    ...vowelMap,
    ...ligatureMap,
  }

  return (
    <Card className="w-full">
      <CardHeader className="border-b border-[#8B4513]/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl text-black sm:text-2xl">
              <Languages className="h-6 w-6 text-[#8B4513]" />
              Translation Workspace
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              Work in the two text areas first. Open ligatures only when you need the full table.
            </CardDescription>
          </div>
          <Button variant="outline" onClick={() => setShowReference((value) => !value)}>
            <BookOpen className="h-4 w-4" />
            {showReference ? "Hide Reference" : "Show Reference"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Label className="sr-only" htmlFor="translation-direction">Translation direction</Label>
            <select
              id="translation-direction"
              value={translationDirection}
              onChange={(e) => setTranslationDirection(e.target.value as "latinToUmwero" | "umweroToLatin")}
              className="h-11 rounded-md border border-[#8B4513]/35 bg-white px-3 text-base font-medium text-[#8B4513] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B4513]"
            >
              <option value="umweroToLatin">Umwero to Latin</option>
              <option value="latinToUmwero">Latin to Umwero</option>
            </select>
            <Button onClick={handleSwap} variant="outline" size="icon" aria-label="Swap translation direction">
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>
          <Badge variant="outline">{Object.keys(allMappings).length}+ mappings</Badge>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <Label htmlFor="file-upload" className="mb-2 flex items-center gap-2 text-sm font-medium text-black">
              <Upload className="h-4 w-4 text-[#8B4513]" />
              Upload document
            </Label>
            <Input
              id="file-upload"
              type="file"
              accept=".txt,.docx"
              onChange={handleFileUpload}
              ref={fileInputRef}
              className="border-[#8B4513]/35 bg-white file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-1 file:text-[#8B4513]"
            />
          </div>
          <div>
            <Label htmlFor="font-size" className="mb-2 block text-sm font-medium text-black">
              Font size: {fontSize}px
            </Label>
            <Slider id="font-size" min={12} max={32} step={1} value={[fontSize]} onValueChange={(value) => setFontSize(value[0])} />
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="input-text" className="text-base font-semibold text-black">
              {translationDirection === "latinToUmwero" ? "Latin Text" : "Umwero Text"}
            </Label>
            <Textarea
              id="input-text"
              placeholder={translationDirection === "latinToUmwero" ? "Enter Latin text..." : "Enter Umwero text..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={`min-h-[260px] resize-none border-[#8B4513]/35 bg-white text-black ${
                translationDirection === "umweroToLatin" && fontLoaded ? 'font-["Umwero","UMWEROalpha","UmweroPUA"] umwero-text' : ""
              }`}
              style={{
                fontSize: `${Math.min(fontSize, 24)}px`,
                letterSpacing: translationDirection === "umweroToLatin" ? "0.08em" : "0.02em",
                wordSpacing: translationDirection === "umweroToLatin" ? "0.15em" : "0.05em",
                lineHeight: translationDirection === "umweroToLatin" ? "1.5" : "1.4",
                fontFeatureSettings: translationDirection === "umweroToLatin" ? '"liga" 1, "calt" 1' : "normal",
                textRendering: translationDirection === "umweroToLatin" ? "optimizeLegibility" : "auto",
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="translated-text" className="text-base font-semibold text-black">
              {translationDirection === "latinToUmwero" ? "Umwero Text" : "Latin Text"}
            </Label>
            <Textarea
              id="translated-text"
              placeholder="Translated text will appear here..."
              value={translated}
              readOnly
              className={`min-h-[260px] resize-none border-[#8B4513]/35 bg-white text-black ${
                translationDirection === "latinToUmwero" && fontLoaded ? 'font-["Umwero","UMWEROalpha","UmweroPUA"] umwero-text' : ""
              }`}
              style={{
                fontSize: `${Math.min(fontSize, 24)}px`,
                letterSpacing: translationDirection === "latinToUmwero" ? "0.08em" : "0.02em",
                wordSpacing: translationDirection === "latinToUmwero" ? "0.15em" : "0.05em",
                lineHeight: translationDirection === "latinToUmwero" ? "1.5" : "1.4",
                fontFeatureSettings: translationDirection === "latinToUmwero" ? '"liga" 1, "calt" 1' : "normal",
                textRendering: translationDirection === "latinToUmwero" ? "optimizeLegibility" : "auto",
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button onClick={handleTranslate} size="lg">
            <Languages className="h-4 w-4" />
            Translate
          </Button>
          <Button onClick={handleDownloadPDF} disabled={!translated || isGenerating} variant="outline" size="lg">
            <Download className="h-4 w-4" />
            {isGenerating ? "Generating PDF..." : "Download PDF"}
          </Button>
        </div>

        {showReference && (
          <div className="space-y-4 border-t border-[#8B4513]/15 pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-bold text-black">Character Reference</h2>
              <div className="grid grid-cols-2 gap-2 sm:w-auto">
                <Button variant={referenceTab === "vowels" ? "default" : "outline"} size="sm" onClick={() => setReferenceTab("vowels")}>
                  Vowels
                </Button>
                <Button variant={referenceTab === "ligatures" ? "default" : "outline"} size="sm" onClick={() => setReferenceTab("ligatures")}>
                  Ligatures
                </Button>
              </div>
            </div>

            {referenceTab === "vowels" && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {Object.entries(vowelMap).map(([latin, umwero]) => (
                  <div key={latin} className="rounded-lg border border-[#8B4513]/20 bg-white p-3 text-center">
                    <div className="text-base font-semibold text-black">{latin}</div>
                    <div className="mt-2 font-['UMWEROalpha'] text-2xl text-[#8B4513]">{umwero}</div>
                  </div>
                ))}
              </div>
            )}

            {referenceTab === "ligatures" && (
              <div className="grid max-h-[440px] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {Object.entries(ligatureMap).map(([latin, umwero]) => (
                  <div key={latin} className="rounded-lg border border-[#8B4513]/20 bg-white p-3 text-center">
                    <div className="text-sm font-semibold text-black">{latin}</div>
                    <div className="mt-2 font-['UMWEROalpha'] text-xl text-[#8B4513]">{umwero}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
