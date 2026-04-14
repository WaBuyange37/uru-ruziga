// components/ui/ImageAssets.tsx
"use client"

import Image from 'next/image'
import { cn } from '@/lib/utils'

// Import all your images
import inka from "../../public/cow.png"
import Imana from "../../public/Imana.png"
import ingoma from "../../public/ingoma.png"
import logo from "../../public/logo.jpeg"

// Define the image assets mapping
const imageAssets = {
  inka,
  Imana,
  ingoma,
  logo,
  cow: inka, // Alias for easier reference
} as const

// Type for available image keys
export type ImageAssetKey = keyof typeof imageAssets

// Props interface
interface ImageAssetProps {
  name: ImageAssetKey
  alt?: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
  quality?: number
}

// Main ImageAsset component
export function ImageAsset({
  name,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes,
  quality = 75,
  ...props
}: ImageAssetProps) {
  const imageSrc = imageAssets[name]
  
  if (!imageSrc) {
    console.warn(`Image asset "${name}" not found`)
    return null
  }

  const imageAlt = alt || `${name} image`

  if (fill) {
    return (
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        className={cn("object-contain", className)}
        priority={priority}
        sizes={sizes}
        quality={quality}
        {...props}
      />
    )
  }

  return (
    <Image
      src={imageSrc}
      alt={imageAlt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes={sizes}
      quality={quality}
      {...props}
    />
  )
}

// Individual image components for easier usage
export function InkaImage(props: Omit<ImageAssetProps, 'name'>) {
  return <ImageAsset name="inka" alt="Inka (Cow)" {...props} />
}

export function ImanaImage(props: Omit<ImageAssetProps, 'name'>) {
  return <ImageAsset name="Imana" alt="Imana" {...props} />
}

export function IngomaImage(props: Omit<ImageAssetProps, 'name'>) {
  return <ImageAsset name="ingoma" alt="Ingoma (Drum)" {...props} />
}

export function LogoImage(props: Omit<ImageAssetProps, 'name'>) {
  return <ImageAsset name="logo" alt="Logo" {...props} />
}

// Gallery component to display all images
export function ImageGallery({ 
  className,
  imageClassName,
  showLabels = true 
}: { 
  className?: string
  imageClassName?: string
  showLabels?: boolean 
}) {
  const images = [
    { key: 'inka' as const, label: 'Inka (Cow)' },
    { key: 'Imana' as const, label: 'Imana' },
    { key: 'ingoma' as const, label: 'Ingoma (Drum)' },
    { key: 'logo' as const, label: 'Logo' },
  ]

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {images.map(({ key, label }) => (
        <div key={key} className="text-center">
          <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
            <ImageAsset
              name={key}
              fill
              className={cn("object-contain p-2", imageClassName)}
              alt={label}
            />
          </div>
          {showLabels && (
            <p className="mt-2 text-sm text-gray-600 font-medium">{label}</p>
          )}
        </div>
      ))}
    </div>
  )
}

// Export the assets mapping for direct access if needed
export { imageAssets }