'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, RotateCcw, CheckCircle2, XCircle } from 'lucide-react'

// REAL Umwero keyboard mapping from your translation system
const UMWERO_MAPPING = {
  // Vowels
  vowels: {
    'a': '"',
    'e': '|',
    'i': '}',
    'o': '{',
    'u': ':',
  },
  // Consonants (from your use-umwero-translation.ts)
  consonants: {
    'NC': 'CC',
    'NCW': 'CCKW',
    'CW': 'CKW',
    'D': 'D',
    'DW': 'DGW',
    'RY': 'DL',
    'NK': 'E',
    'NKW': 'EW',
    'F': 'F',
    'MF': 'FF',
    'MFW': 'FFK',
    'MFY': 'FFKK',
    'FW': 'FK',
    'FY': 'FKK',
    'G': 'G',
    'GW': 'GW',
    'H': 'H',
    'SH': 'HH',
    'NSH': 'HHH',
    'NSHW': 'HHHKW',
    'SHW': 'HHKW',
    'PF': 'I',
    'PFW': 'IK',
    'PFY': 'IKK',
    'J': 'J',
    'JW': 'JGW',
    'K': 'K',
    'KY': 'KK',
    'NKY': 'KKK',
    'KW': 'KW',
    'JY': 'L',
    'NJY': 'LL',
    'M': 'M',
    'MW': 'ME',
    'MY': 'MYY',
    'MYW': 'MYYEW',
    'N': 'N',
    'ND': 'ND',
    'NDW': 'NDGW',
    'NDY': 'NDL',
    'NW': 'NEW',
    'NG': 'NG',
    'NGW': 'NGW',
    'NT': 'NN',
    'NTW': 'NNEW',
    'NNY': 'NNYY',
    'NYY': 'NYY',
    'NZ': 'NZ',
    'NZW': 'NZGW',
    'MV': 'O',
    'MVW': 'OG',
    'MVY': 'OL',
    'MPY': 'PPKK',
    'P': 'P',
    'PW': 'PK',
    'PY': 'PKK',
    'MP': 'MM',
    'SHY': 'Q',
    'SHYW': 'QKW',
    'NSHY': 'QQ',
    'NSHYW': 'QQKW',
    'R': 'R',
    'L': 'R',
    'CY':'KK',
    'BY':'BBL',
    'BW': 'BBG',
    'MB': 'A',
    'MBW': 'BBG',
    'RW': 'RGW',
    'S': 'S',
    'SY': 'SKK',
    'SW': 'SKW',
    'NS': 'SS',
    'NSY': 'SSKK',
    'NSW': 'SSKW',
    'TW': 'TKW',
    'TY': 'TKK ',
    'NJ': 'U',
    'NJW': 'UGW',
    'V': 'V',
    'VW': 'VG',
    'VY': 'VL',
    'W': 'W',
    'TS': 'X',
    'TSW': 'XKW',
    'Y': 'Y',
    'NY': 'YY',
    'NYW': 'YYEW',
    'Z': 'Z',
    'ZW': 'ZGW`',

    // numbers-ones
    1: String.fromCodePoint(0x0031),
    2: String.fromCodePoint(0x0032),
    3: String.fromCodePoint(0x0033), 
    4: String.fromCodePoint(0x0034), 
    5: String.fromCodePoint(0x0035), 
    6: String.fromCodePoint(0x0036),
    7: String.fromCodePoint(0x0037),
    8: String.fromCodePoint(0x0038),
    9: String.fromCodePoint(0x0039),
    
    // tens
    10: String.fromCodePoint(0xF300)+ String.fromCodePoint(0x0031),
    11: String.fromCodePoint(0xF300)+ String.fromCodePoint(0x0031) + String.fromCodePoint(0x0031),
    12: String.fromCodePoint(0xF300)+ String.fromCodePoint(0x0031) + String.fromCodePoint(0x0032),
    13: String.fromCodePoint(0xF300)+ String.fromCodePoint(0x0031) + String.fromCodePoint(0x0033),
    14: String.fromCodePoint(0xF300)+ String.fromCodePoint(0x0031) + String.fromCodePoint(0x0034),
    15: String.fromCodePoint(0xF300)+ String.fromCodePoint(0x0031) + String.fromCodePoint(0x0035),
    16: String.fromCodePoint(0xF300)+ String.fromCodePoint(0x0031) + String.fromCodePoint(0x0036),
    17: String.fromCodePoint(0xF300)+ String.fromCodePoint(0x0031) + String.fromCodePoint(0x0037),
    18: String.fromCodePoint(0xF300)+ String.fromCodePoint(0x0031) + String.fromCodePoint(0x0038),
    19: String.fromCodePoint(0xF300)+ String.fromCodePoint(0x0031) + String.fromCodePoint(0x0039),
    // 
    20: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0032),
    21: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0032) + String.fromCodePoint(0x0031),
    22: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0032) + String.fromCodePoint(0x0032),
    23: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0032) + String.fromCodePoint(0x0033),
    24: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0032) + String.fromCodePoint(0x0034),
    25: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0032) + String.fromCodePoint(0x0035),
    26: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0032) + String.fromCodePoint(0x0036),
    27: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0032) + String.fromCodePoint(0x0037),
    28: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0032) + String.fromCodePoint(0x0038),
    29: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0032) + String.fromCodePoint(0x0039),

    30: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0033),
    31: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0033) + String.fromCodePoint(0x0031),
    32: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0033) + String.fromCodePoint(0x0032),
    33: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0033) + String.fromCodePoint(0x0033),
    34: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0033) + String.fromCodePoint(0x0034),
    35: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0033) + String.fromCodePoint(0x0035),
    36: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0033) + String.fromCodePoint(0x0036),
    37: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0033) + String.fromCodePoint(0x0037),
    38: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0033) + String.fromCodePoint(0x0038),
    39: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0033) + String.fromCodePoint(0x0039),

    40: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0034),
    41: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0034) + String.fromCodePoint(0x0031),
    42: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0034) + String.fromCodePoint(0x0032),
    43: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0034) + String.fromCodePoint(0x0033),
    44: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0034) + String.fromCodePoint(0x0034),
    45: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0034) + String.fromCodePoint(0x0035),
    46: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0034) + String.fromCodePoint(0x0036),
    47: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0034) + String.fromCodePoint(0x0037),
    48: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0034) + String.fromCodePoint(0x0038),
    49: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0034) + String.fromCodePoint(0x0039),

    50: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0035),
    51: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0035) + String.fromCodePoint(0x0031),
    52: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0035) + String.fromCodePoint(0x0032),
    53: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0035) + String.fromCodePoint(0x0033),
    54: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0035) + String.fromCodePoint(0x0034),
    55: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0035) + String.fromCodePoint(0x0035),
    56: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0035) + String.fromCodePoint(0x0036),
    57: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0035) + String.fromCodePoint(0x0037),
    58: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0035) + String.fromCodePoint(0x0038),
    59: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0035) + String.fromCodePoint(0x0039),

    60: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0036),
    61: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0036) + String.fromCodePoint(0x0031),
    62: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0036) + String.fromCodePoint(0x0032),
    63: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0036) + String.fromCodePoint(0x0033),
    64: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0036) + String.fromCodePoint(0x0034),
    65: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0036) + String.fromCodePoint(0x0035),
    66: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0036) + String.fromCodePoint(0x0036),
    67: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0036) + String.fromCodePoint(0x0037),
    68: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0036) + String.fromCodePoint(0x0038),
    69: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0036) + String.fromCodePoint(0x0039),

    70: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0037),
    71: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0037) + String.fromCodePoint(0x0031),
    72: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0037) + String.fromCodePoint(0x0032),
    73: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0037) + String.fromCodePoint(0x0033),
    74: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0037) + String.fromCodePoint(0x0034),
    75: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0037) + String.fromCodePoint(0x0035),
    76: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0037) + String.fromCodePoint(0x0036),
    77: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0037) + String.fromCodePoint(0x0037),
    78: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0037) + String.fromCodePoint(0x0038),
    79: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0037) + String.fromCodePoint(0x0039),


    80: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0038),
    81: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0038) + String.fromCodePoint(0x0031),
    82: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0038) + String.fromCodePoint(0x0032),
    83: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0038) + String.fromCodePoint(0x0033),
    84: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0038) + String.fromCodePoint(0x0034),
    85: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0038) + String.fromCodePoint(0x0035),
    86: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0038) + String.fromCodePoint(0x0036),
    87: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0038) + String.fromCodePoint(0x0037),
    88: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0038) + String.fromCodePoint(0x0038),
    89: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0038) + String.fromCodePoint(0x0039),

    90: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0039),
    91: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0039) + String.fromCodePoint(0x0031),
    92: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0039) + String.fromCodePoint(0x0032),
    93: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0039) + String.fromCodePoint(0x0033),
    94: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0039) + String.fromCodePoint(0x0034),
    95: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0039) + String.fromCodePoint(0x0035),
    96: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0039) + String.fromCodePoint(0x0036),
    97: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0039) + String.fromCodePoint(0x0037),
    98: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0039) + String.fromCodePoint(0x0038),
    99: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0039) + String.fromCodePoint(0x0039),

    // hundreds
    100: String.fromCodePoint(0xF301)+ String.fromCodePoint(0x0031),
    // Umweero numerals from 100 to hundred Decillions need to be looped for better  and shortter code
    //I will do it in next update, even these are more much lines

  }
}

// Lesson 1: Vowels
const VOWEL_LESSON = [
  {
    id: 1,
    latin: 'a',
    umwero: '"',
    pronunciation: '/a/ as in "father"',
    meaning: 'Represents earth and foundation',
    culturalNote: 'In Rwandan tradition, "a" symbolizes the grounding force of earth',
    examples: [
      { umwero: '"M"Z}', latin: 'amazi', meaning: 'water' },
      { umwero: '"A"', latin: 'aba', meaning: 'these' },
    ],
    strokeGuide: [
      'Start from the center point',
      'Draw a circular motion outward',
      'Complete the form with a connecting line'
    ]
  },
  {
    id: 2,
    latin: 'e',
    umwero: '|',
    pronunciation: '/e/ as in "bed"',
    meaning: 'Represents air and breath',
    culturalNote: 'Air is the breath of life in Rwandan philosophy',
    examples: [
      { umwero: '|M|', latin: 'eme', meaning: 'stand' },
      { umwero: 'N|', latin: 'ne', meaning: 'and' },
    ],
    strokeGuide: [
      'Start with a vertical line downward',
      'Add horizontal connector',
      'Complete the character form'
    ]
  },
  {
    id: 3,
    latin: 'i',
    umwero: '}',
    pronunciation: '/i/ as in "machine"',
    meaning: 'Represents water and flow',
    culturalNote: 'Water symbolizes adaptability and continuous life force',
    examples: [
      { umwero: '}B}', latin: 'ibi', meaning: 'these things' },
      { umwero: 'N}N}', latin: 'nini', meaning: 'big' },
    ],
    strokeGuide: [
      'Begin with a curved stroke',
      'Add vertical element',
      'Close the character smoothly'
    ]
  },
  {
    id: 4,
    latin: 'o',
    umwero: '{',
    pronunciation: '/o/ as in "note"',
    meaning: 'Represents spirit and wholeness',
    culturalNote: 'The circular form represents unity and completeness',
    examples: [
      { umwero: 'K{S{', latin: 'koko', meaning: 'chicken' },
      { umwero: 'G{S{', latin: 'goko', meaning: 'arm' },
    ],
    strokeGuide: [
      'Start with circular motion',
      'Complete the loop',
      'Add finishing stroke'
    ]
  },
  {
    id: 5,
    latin: 'u',
    umwero: ':',
    pronunciation: '/u/ as in "rude"',
    meaning: 'Represents fire and energy',
    culturalNote: 'Fire is the transformative element in creation',
    examples: [
      { umwero: ':M:G{', latin: 'umuco', meaning: 'culture' },
      { umwero: ':A:NT:', latin: 'ubuntu', meaning: 'humanity' },
    ],
    strokeGuide: [
      'Create two vertical strokes',
      'Connect with horizontal line',
      'Ensure symmetry'
    ]
  }
]

type LessonStep = 'learn' | 'practice' | 'compare' | 'next'

export function RealUmweroLesson() {
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [step, setStep] = useState<LessonStep>('learn')
  const [isDrawing, setIsDrawing] = useState(false)
  const [showReference, setShowReference] = useState(true)
  const [userDrawing, setUserDrawing] = useState<string | null>(null)
  const [completedChars, setCompletedChars] = useState<number[]>([])
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const comparisonCanvasRef = useRef<HTMLCanvasElement>(null)
  
  const currentChar = VOWEL_LESSON[currentCharIndex]
  const progress = ((currentCharIndex + 1) / VOWEL_LESSON.length) * 100

  // Initialize canvas with grid
  useEffect(() => {
    if (canvasRef.current && step === 'practice') {
      drawGrid(canvasRef.current)
    }
  }, [step, currentCharIndex])

  // Draw grid on canvas
  const drawGrid = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    const gridSize = 20

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw light grid
    ctx.strokeStyle = '#F3E5AB'
    ctx.lineWidth = 0.5

    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Draw center guides (red)
    ctx.strokeStyle = '#D2691E'
    ctx.lineWidth = 1.5
    
    // Vertical center
    ctx.beginPath()
    ctx.moveTo(width / 2, 0)
    ctx.lineTo(width / 2, height)
    ctx.stroke()
    
    // Horizontal center
    ctx.beginPath()
    ctx.moveTo(0, height / 2)
    ctx.lineTo(width, height / 2)
    ctx.stroke()
  }

  // Drawing functions
  const startDrawing = (x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (x: number, y: number) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.lineTo(x, y)
    ctx.strokeStyle = '#8B4513'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    startDrawing(e.clientX - rect.left, e.clientY - rect.top)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    draw(e.clientX - rect.left, e.clientY - rect.top)
  }

  // Touch events
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const touch = e.touches[0]
    startDrawing(touch.clientX - rect.left, touch.clientY - rect.top)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const touch = e.touches[0]
    draw(touch.clientX - rect.left, touch.clientY - rect.top)
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    stopDrawing()
  }

  // Save user drawing and show comparison
  const saveAndCompare = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Save canvas as image
    const imageData = canvas.toDataURL()
    setUserDrawing(imageData)
    setStep('compare')

    // Draw comparison on second canvas
    setTimeout(() => {
      drawComparison()
    }, 100)
  }

  // Draw side-by-side comparison
  const drawComparison = () => {
    const compCanvas = comparisonCanvasRef.current
    if (!compCanvas || !userDrawing) return

    const ctx = compCanvas.getContext('2d')
    if (!ctx) return

    const { width, height } = compCanvas

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw dividing line
    ctx.strokeStyle = '#8B4513'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(width / 2, 0)
    ctx.lineTo(width / 2, height)
    ctx.stroke()

    // Left side: User's drawing
    const userImg = new Image()
    userImg.onload = () => {
      ctx.drawImage(userImg, 0, 0, width / 2, height)
    }
    userImg.src = userDrawing

    // Right side: Reference character
    ctx.save()
    ctx.translate(width * 0.75, height / 2)
    ctx.font = '180px UMWEROalpha, serif'
    ctx.fillStyle = '#8B4513'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(currentChar.umwero, 0, 0)
    ctx.restore()

    // Labels
    ctx.font = '16px Arial'
    ctx.fillStyle = '#666'
    ctx.textAlign = 'center'
    ctx.fillText('Your Writing', width / 4, 30)
    ctx.fillText('Correct Form', width * 0.75, 30)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawGrid(canvas)
  }

  const nextCharacter = () => {
    if (currentCharIndex < VOWEL_LESSON.length - 1) {
      // Mark current as completed
      if (!completedChars.includes(currentCharIndex)) {
        setCompletedChars([...completedChars, currentCharIndex])
      }
      
      setCurrentCharIndex(currentCharIndex + 1)
      setStep('learn')
      setUserDrawing(null)
      setShowReference(true)
    }
  }

  const previousCharacter = () => {
    if (currentCharIndex > 0) {
      setCurrentCharIndex(currentCharIndex - 1)
      setStep('learn')
      setUserDrawing(null)
      setShowReference(true)
    }
  }

  const retryDrawing = () => {
    setStep('practice')
    setUserDrawing(null)
    clearCanvas()
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gradient-to-b from-[#F3E5AB] to-white rounded-lg">
      {/* Header */}
      <div className="bg-[#8B4513] text-[#F3E5AB] p-6 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">Lesson 1: Inyajwi (Vowels)</h1>
            <p className="text-sm opacity-90">Master the 5 sacred vowels of Umwero</p>
          </div>
          <Badge className="bg-[#F3E5AB] text-[#8B4513] text-lg px-4 py-2">
            {currentCharIndex + 1} / {VOWEL_LESSON.length}
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Lesson Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-[#D2691E]" />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Character Info */}
        <div className="space-y-6">
          <Card className="border-2 border-[#8B4513]">
            <CardHeader className="bg-[#F3E5AB]">
              <CardTitle className="text-[#8B4513] flex items-center justify-between">
                <span>Character: {currentChar.latin.toUpperCase()}</span>
                {completedChars.includes(currentCharIndex) && (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                )}
              </CardTitle>
              <CardDescription className="text-gray-700">
                {currentChar.pronunciation}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Large Character Display */}
              {step === 'learn' && (
                <div className="flex justify-center items-center bg-white rounded-lg border-2 border-[#D2691E] p-12">
                  <div 
                    className="text-[200px] leading-none"
                    style={{ fontFamily: "'UMWEROalpha', serif" }}
                  >
                    {currentChar.umwero}
                  </div>
                </div>
              )}

              {/* Keyboard Mapping */}
              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <p className="font-semibold text-blue-900 mb-2">⌨️ Keyboard Mapping</p>
                <div className="flex items-center gap-4">
                  <kbd className="px-4 py-2 bg-white border-2 border-gray-300 rounded text-xl font-mono">
                    {currentChar.latin}
                  </kbd>
                  <span className="text-2xl">→</span>
                  <div 
                    className="text-5xl"
                    style={{ fontFamily: "'UMWEROalpha', serif" }}
                  >
                    {currentChar.umwero}
                  </div>
                </div>
              </div>

              {/* Meaning */}
              <div className="p-4 bg-[#F3E5AB] rounded-lg">
                <p className="font-semibold text-[#8B4513] mb-2">Meaning:</p>
                <p>{currentChar.meaning}</p>
              </div>

              {/* Cultural Note */}
              <div className="p-4 bg-[#FFF8DC] rounded-lg border border-[#D2691E]">
                <p className="font-semibold text-[#8B4513] mb-2">🌍 Cultural Context:</p>
                <p className="text-sm italic">{currentChar.culturalNote}</p>
              </div>

              {/* Stroke Guide */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="font-semibold text-yellow-900 mb-2">✍️ How to Write:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  {currentChar.strokeGuide.map((guide, idx) => (
                    <li key={idx}>{guide}</li>
                  ))}
                </ol>
              </div>

              {/* Examples */}
              <div>
                <h4 className="font-semibold text-[#8B4513] mb-3">Example Words:</h4>
                <div className="space-y-2">
                  {currentChar.examples.map((example, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded border border-[#F3E5AB]">
                      <div 
                        className="text-4xl"
                        style={{ fontFamily: "'UMWEROalpha', serif" }}
                      >
                        {example.umwero}
                      </div>
                      <div>
                        <p className="font-bold text-[#8B4513]">{example.latin}</p>
                        <p className="text-sm text-gray-600">{example.meaning}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Practice Area */}
        <div className="space-y-6">
          {step === 'learn' && (
            <Card className="border-2 border-[#8B4513]">
              <CardHeader className="bg-[#F3E5AB]">
                <CardTitle className="text-[#8B4513]">Ready to Practice?</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <p className="text-lg">
                    You've learned the character <span className="font-bold text-[#8B4513]">"{currentChar.latin}"</span>
                  </p>
                  <p className="text-gray-600">
                    Now let's practice writing it! Follow the stroke guide and try to replicate the character.
                  </p>
                  <Button
                    onClick={() => setStep('practice')}
                    size="lg"
                    className="w-full bg-[#8B4513] hover:bg-[#A0522D]"
                  >
                    Start Practice
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'practice' && (
            <Card className="border-2 border-[#8B4513]">
              <CardHeader className="bg-[#F3E5AB]">
                <CardTitle className="text-[#8B4513]">Practice Area</CardTitle>
                <CardDescription>Draw the character on the canvas below</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Reference toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showRef"
                    checked={showReference}
                    onChange={(e) => setShowReference(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="showRef" className="text-sm">Show reference character (light background)</label>
                </div>

                {/* Canvas with optional reference */}
                <div className="relative">
                  {showReference && (
                    <div 
                      className="absolute inset-0 flex items-center justify-center text-[200px] opacity-10 pointer-events-none"
                      style={{ fontFamily: "'UMWEROalpha', serif" }}
                    >
                      {currentChar.umwero}
                    </div>
                  )}
                  
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={500}
                    className="border-2 border-[#8B4513] rounded-lg w-full cursor-crosshair touch-none bg-white"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={clearCanvas}
                    variant="outline"
                    className="flex-1"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                  <Button
                    onClick={saveAndCompare}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Compare with Original
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'compare' && (
            <Card className="border-2 border-[#8B4513]">
              <CardHeader className="bg-[#F3E5AB]">
                <CardTitle className="text-[#8B4513]">Comparison</CardTitle>
                <CardDescription>See how your writing compares to the correct form</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <canvas
                  ref={comparisonCanvasRef}
                  width={500}
                  height={500}
                  className="border-2 border-[#8B4513] rounded-lg w-full bg-white"
                />

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={retryDrawing}
                    variant="outline"
                    className="flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Try Again
                  </Button>
                  <Button
                    onClick={() => setStep('next')}
                    className="bg-[#8B4513] hover:bg-[#A0522D] flex items-center justify-center gap-2"
                  >
                    Good Enough!
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'next' && (
            <Card className="border-2 border-green-600">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6" />
                  Character Completed!
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <p className="text-center text-lg">
                  Great work! You've practiced the character <span className="font-bold">"{currentChar.latin}"</span>
                </p>
                
                {currentCharIndex < VOWEL_LESSON.length - 1 ? (
                  <div className="space-y-2">
                    <p className="text-center text-gray-600">
                      Ready for the next vowel?
                    </p>
                    <Button
                      onClick={nextCharacter}
                      size="lg"
                      className="w-full bg-[#8B4513] hover:bg-[#A0522D]"
                    >
                      Next Character: {VOWEL_LESSON[currentCharIndex + 1].latin.toUpperCase()}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <p className="text-xl font-bold text-green-700">
                      🎉 Lesson Complete!
                    </p>
                    <p className="text-gray-600">
                      You've mastered all 5 Umwero vowels!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="mt-6 flex gap-4">
        <Button
          onClick={previousCharacter}
          disabled={currentCharIndex === 0}
          variant="outline"
          size="lg"
          className="flex-1"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Previous
        </Button>
        
        {step !== 'next' && currentCharIndex < VOWEL_LESSON.length - 1 && (
          <Button
            onClick={() => setStep('next')}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            Skip to Next
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Progress Dots */}
      <div className="mt-6 flex gap-2 justify-center">
        {VOWEL_LESSON.map((char, index) => (
          <div
            key={char.id}
            className={`relative h-3 w-12 rounded-full transition-all ${
              index === currentCharIndex
                ? 'bg-[#8B4513] scale-110'
                : completedChars.includes(index)
                ? 'bg-green-600'
                : index < currentCharIndex
                ? 'bg-[#D2691E]'
                : 'bg-[#F3E5AB]'
            }`}
          >
            {completedChars.includes(index) && (
              <CheckCircle2 className="absolute -top-1 -right-1 h-5 w-5 text-green-600 bg-white rounded-full" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
