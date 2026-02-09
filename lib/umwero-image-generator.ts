// lib/umwero-image-generator.ts
// Professional PNG image generator for Umwero text

export interface ImageGeneratorOptions {
  latinText: string
  umweroText: string
  userName: string
  fontSize?: number
  size?: 'square' | 'story' | 'post' | 'twitter'
  theme?: 'default' | 'dark' | 'gradient'
}

export interface ImageSize {
  width: number
  height: number
  name: string
}

export const IMAGE_SIZES: Record<string, ImageSize> = {
  square: { width: 1080, height: 1080, name: 'Instagram Square' },
  story: { width: 1080, height: 1920, name: 'Instagram Story' },
  post: { width: 1200, height: 630, name: 'Facebook/LinkedIn' },
  twitter: { width: 1200, height: 675, name: 'Twitter/X' },
}

export async function generateUmweroPNG(
  options: ImageGeneratorOptions
): Promise<Blob> {
  const {
    latinText,
    umweroText,
    userName,
    fontSize = 48,
    size = 'square',
    theme = 'default',
  } = options

  const dimensions = IMAGE_SIZES[size]
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  // Set canvas size
  canvas.width = dimensions.width
  canvas.height = dimensions.height

  // Apply theme
  applyTheme(ctx, canvas, theme)

  // Add decorative border
  addBorder(ctx, canvas)

  // Add title
  addTitle(ctx, canvas)

  // Add Latin text
  addLatinText(ctx, canvas, latinText)

  // Add Umwero text (main content)
  addUmweroText(ctx, canvas, umweroText, fontSize)

  // Add footer with branding
  addFooter(ctx, canvas, userName)

  // Add logo
  await addLogo(ctx, canvas)

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to generate image'))
      }
    }, 'image/png')
  })
}

function applyTheme(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  theme: string
) {
  if (theme === 'gradient') {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#F3E5AB')
    gradient.addColorStop(0.5, '#E8D89E')
    gradient.addColorStop(1, '#D2691E')
    ctx.fillStyle = gradient
  } else if (theme === 'dark') {
    ctx.fillStyle = '#2C1810'
  } else {
    ctx.fillStyle = '#F3E5AB'
  }
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function addBorder(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  const borderWidth = Math.floor(canvas.width * 0.015)
  ctx.strokeStyle = '#8B4513'
  ctx.lineWidth = borderWidth
  ctx.strokeRect(
    borderWidth / 2,
    borderWidth / 2,
    canvas.width - borderWidth,
    canvas.height - borderWidth
  )

  // Inner decorative border
  const innerBorder = borderWidth * 3
  ctx.strokeStyle = '#D2691E'
  ctx.lineWidth = 2
  ctx.strokeRect(
    innerBorder,
    innerBorder,
    canvas.width - innerBorder * 2,
    canvas.height - innerBorder * 2
  )
}

function addTitle(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  const titleSize = Math.floor(canvas.width * 0.045)
  ctx.fillStyle = '#8B4513'
  ctx.font = `bold ${titleSize}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  
  const y = canvas.height * 0.08
  ctx.fillText('UMWERO MESSAGE', canvas.width / 2, y)
  
  // Decorative line under title
  ctx.strokeStyle = '#D2691E'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(canvas.width * 0.3, y + titleSize + 10)
  ctx.lineTo(canvas.width * 0.7, y + titleSize + 10)
  ctx.stroke()
}

function addLatinText(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  latinText: string
) {
  const fontSize = Math.floor(canvas.width * 0.028)
  ctx.fillStyle = '#654321'
  ctx.font = `${fontSize}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  
  const y = canvas.height * 0.18
  const maxWidth = canvas.width * 0.8
  
  // Word wrap
  const words = latinText.split(' ')
  let line = ''
  let lineY = y
  const lineHeight = fontSize * 1.4
  
  ctx.fillText('Latin:', canvas.width / 2, lineY)
  lineY += lineHeight
  
  for (let word of words) {
    const testLine = line + word + ' '
    const metrics = ctx.measureText(testLine)
    
    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line.trim(), canvas.width / 2, lineY)
      line = word + ' '
      lineY += lineHeight
    } else {
      line = testLine
    }
  }
  if (line) {
    ctx.fillText(line.trim(), canvas.width / 2, lineY)
  }
}

function addUmweroText(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  umweroText: string,
  baseFontSize: number
) {
  // Scale font size based on canvas size
  const fontSize = Math.floor(canvas.width * (baseFontSize / 1080))
  
  ctx.fillStyle = '#8B4513'
  ctx.font = `${fontSize}px UMWEROalpha, serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  const startY = canvas.height * 0.45
  const maxWidth = canvas.width * 0.85
  const lineHeight = fontSize * 1.6
  
  // Add background box for Umwero text
  const boxPadding = 40
  const boxY = startY - fontSize
  const boxHeight = lineHeight * 4 // Estimate max 4 lines
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.fillRect(
    canvas.width * 0.075,
    boxY - boxPadding,
    canvas.width * 0.85,
    boxHeight + boxPadding * 2
  )
  
  // Border around box
  ctx.strokeStyle = '#D2691E'
  ctx.lineWidth = 3
  ctx.strokeRect(
    canvas.width * 0.075,
    boxY - boxPadding,
    canvas.width * 0.85,
    boxHeight + boxPadding * 2
  )
  
  // Draw Umwero text
  ctx.fillStyle = '#8B4513'
  const words = umweroText.split(' ')
  let line = ''
  let lineY = startY
  
  for (let word of words) {
    const testLine = line + word + ' '
    const metrics = ctx.measureText(testLine)
    
    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line.trim(), canvas.width / 2, lineY)
      line = word + ' '
      lineY += lineHeight
    } else {
      line = testLine
    }
  }
  if (line) {
    ctx.fillText(line.trim(), canvas.width / 2, lineY)
  }
}

function addFooter(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  userName: string
) {
  const fontSize = Math.floor(canvas.width * 0.022)
  ctx.fillStyle = '#8B4513'
  ctx.font = `${fontSize}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  
  const y = canvas.height * 0.92
  
  ctx.fillText(
    'Created with Uruziga - Umwero Learning Platform',
    canvas.width / 2,
    y
  )
  
  ctx.font = `bold ${fontSize}px Arial, sans-serif`
  ctx.fillText(`By: ${userName}`, canvas.width / 2, y + fontSize * 1.5)
  
  // Add website
  ctx.font = `${fontSize * 0.9}px Arial, sans-serif`
  ctx.fillStyle = '#D2691E'
  ctx.fillText('www.uruziga.com', canvas.width / 2, y + fontSize * 3)
}

async function addLogo(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
) {
  // Draw a simple logo circle with "U"
  const logoSize = Math.floor(canvas.width * 0.06)
  const x = canvas.width * 0.9
  const y = canvas.height * 0.08
  
  // Circle background
  ctx.fillStyle = '#8B4513'
  ctx.beginPath()
  ctx.arc(x, y, logoSize / 2, 0, Math.PI * 2)
  ctx.fill()
  
  // "U" letter
  ctx.fillStyle = '#F3E5AB'
  ctx.font = `bold ${logoSize * 0.6}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('U', x, y)
}

// Social media sharing functions
export function shareToFacebook(imageBlob: Blob, text: string) {
  const url = window.location.origin
  const shareText = `${text}\n\n#Umwero #Kinyarwanda #Culture #Rwanda`
  
  // Facebook doesn't support direct image upload from web
  // Open share dialog with text
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`,
    '_blank',
    'width=600,height=400'
  )
  
  // Download image for manual upload
  downloadImage(imageBlob, 'umwero-message.png')
  
  return {
    success: true,
    message: 'Image downloaded! Upload it to your Facebook post.',
  }
}

export function shareToTwitter(imageBlob: Blob, text: string) {
  const url = window.location.origin
  const shareText = `${text}\n\n#Umwero #Kinyarwanda #Culture #Rwanda\n\nLearn more at:`
  
  // Twitter doesn't support direct image upload from web
  // Open tweet dialog
  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
    '_blank',
    'width=600,height=400'
  )
  
  // Download image for manual upload
  downloadImage(imageBlob, 'umwero-message.png')
  
  return {
    success: true,
    message: 'Image downloaded! Attach it to your tweet.',
  }
}

export function shareToInstagram(imageBlob: Blob, text: string) {
  // Instagram doesn't support web sharing
  // Download image with instructions
  downloadImage(imageBlob, 'umwero-message.png')
  
  const caption = `${text}\n\n#Umwero #Kinyarwanda #Culture #Rwanda #AfricanScript #LanguageLearning`
  
  // Copy caption to clipboard
  navigator.clipboard.writeText(caption).catch(() => {
    console.log('Could not copy caption to clipboard')
  })
  
  return {
    success: true,
    message: 'Image downloaded! Open Instagram app and upload from your gallery. Caption copied to clipboard!',
  }
}

export function shareToTikTok(imageBlob: Blob, text: string) {
  // TikTok doesn't support web sharing
  // Download image with instructions
  downloadImage(imageBlob, 'umwero-message.png')
  
  const caption = `${text} #Umwero #Kinyarwanda #Culture #Rwanda #LearnWithMe`
  
  // Copy caption to clipboard
  navigator.clipboard.writeText(caption).catch(() => {
    console.log('Could not copy caption to clipboard')
  })
  
  return {
    success: true,
    message: 'Image downloaded! Open TikTok app and create a post with this image. Caption copied to clipboard!',
  }
}

export function shareToWhatsApp(imageBlob: Blob, text: string) {
  const url = window.location.origin
  const shareText = `${text}\n\nCheck out Umwero alphabet at ${url}\n\n#Umwero #Kinyarwanda`
  
  // Download image first
  downloadImage(imageBlob, 'umwero-message.png')
  
  // Open WhatsApp with text
  window.open(
    `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    '_blank'
  )
  
  return {
    success: true,
    message: 'Image downloaded! Share it in your WhatsApp chat.',
  }
}

export function downloadImage(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Upload image to server
export async function uploadImageToServer(
  blob: Blob,
  token: string
): Promise<string> {
  const formData = new FormData()
  formData.append('image', blob, 'umwero-message.png')
  
  const response = await fetch('/api/upload/image', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })
  
  if (!response.ok) {
    throw new Error('Failed to upload image')
  }
  
  const data = await response.json()
  return data.url
}
