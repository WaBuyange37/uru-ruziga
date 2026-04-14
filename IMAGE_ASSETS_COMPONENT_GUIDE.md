# Image Assets Component Guide

## 🖼️ Overview

I've created a reusable `ImageAssets` component that centralizes all your image imports and provides multiple ways to use them throughout your application.

## 📁 Files Created

- `components/ui/ImageAssets.tsx` - Main component with all image logic
- `components/examples/ImageAssetExample.tsx` - Usage examples
- `IMAGE_ASSETS_COMPONENT_GUIDE.md` - This guide

## 🚀 Usage Methods

### Method 1: Main ImageAsset Component

```tsx
import { ImageAsset } from '@/components/ui/ImageAssets'

// Basic usage
<ImageAsset name="inka" width={100} height={100} alt="Cow" />
<ImageAsset name="Imana" width={100} height={100} alt="Imana" />
<ImageAsset name="ingoma" width={100} height={100} alt="Drum" />
<ImageAsset name="logo" width={100} height={100} alt="Logo" />
```

### Method 2: Individual Components

```tsx
import { InkaImage, ImanaImage, IngomaImage, LogoImage } from '@/components/ui/ImageAssets'

// Cleaner syntax for specific images
<InkaImage width={100} height={100} />
<ImanaImage width={100} height={100} />
<IngomaImage width={100} height={100} />
<LogoImage width={100} height={100} />
```

### Method 3: Responsive with Fill

```tsx
// For responsive containers
<div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
  <ImageAsset name="inka" fill className="object-contain p-2" />
</div>
```

### Method 4: Gallery Component

```tsx
import { ImageGallery } from '@/components/ui/ImageAssets'

// Display all images in a grid
<ImageGallery />

// Customized gallery
<ImageGallery 
  className="grid-cols-2 gap-6" 
  imageClassName="hover:scale-105 transition-transform"
  showLabels={false}
/>
```

## 🎨 Available Images

- `inka` or `cow` - Cow image (`cow.png`)
- `Imana` - Imana image (`Imana.png`)
- `ingoma` - Drum image (`ingoma.png`)
- `logo` - Logo image (`logo.jpeg`)

## 🔧 Props Reference

### ImageAsset Props

```tsx
interface ImageAssetProps {
  name: 'inka' | 'Imana' | 'ingoma' | 'logo' | 'cow'  // Required
  alt?: string                    // Alt text (auto-generated if not provided)
  width?: number                  // Image width
  height?: number                 // Image height
  className?: string              // CSS classes
  priority?: boolean              // Next.js priority loading
  fill?: boolean                  // Fill container (responsive)
  sizes?: string                  // Responsive sizes
  quality?: number                // Image quality (default: 75)
}
```

### Individual Component Props

All individual components (`InkaImage`, `ImanaImage`, etc.) accept the same props as `ImageAsset` except `name`.

## 📱 Responsive Examples

### Card with Image

```tsx
<Card className="w-64">
  <div className="relative h-48 bg-gray-50">
    <ImageAsset name="inka" fill className="object-contain p-4" />
  </div>
  <CardContent>
    <h3>Inka (Cow)</h3>
    <p>Traditional Rwandan symbol</p>
  </CardContent>
</Card>
```

### Hero Section with Logo

```tsx
<div className="flex items-center gap-4">
  <LogoImage width={60} height={60} className="rounded-full" />
  <h1 className="text-2xl font-bold">Umwero Learning</h1>
</div>
```

### Image Grid

```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {['inka', 'Imana', 'ingoma', 'logo'].map((image) => (
    <div key={image} className="relative aspect-square bg-white rounded-lg shadow-md overflow-hidden">
      <ImageAsset 
        name={image as any} 
        fill 
        className="object-contain p-3 hover:scale-105 transition-transform" 
      />
    </div>
  ))}
</div>
```

## 🎯 Benefits

1. **Centralized Management** - All images in one place
2. **Type Safety** - TypeScript ensures you use valid image names
3. **Consistent API** - Same props across all usage methods
4. **Next.js Optimized** - Built on Next.js Image component
5. **Flexible Usage** - Multiple ways to use based on your needs
6. **Responsive Ready** - Built-in responsive image support

## 🔄 Adding New Images

To add new images:

1. Import the image in `ImageAssets.tsx`:
```tsx
import newImage from "../../public/new-image.png"
```

2. Add to the `imageAssets` object:
```tsx
const imageAssets = {
  // ... existing images
  newImage,
} as const
```

3. Optionally create an individual component:
```tsx
export function NewImage(props: Omit<ImageAssetProps, 'name'>) {
  return <ImageAsset name="newImage" alt="New Image" {...props} />
}
```

## 🚀 Quick Start

1. Import what you need:
```tsx
import { ImageAsset, InkaImage, LogoImage } from '@/components/ui/ImageAssets'
```

2. Use in your component:
```tsx
export function MyComponent() {
  return (
    <div>
      <LogoImage width={50} height={50} />
      <ImageAsset name="inka" width={100} height={100} />
    </div>
  )
}
```

That's it! Your images are now centralized and easy to use throughout your application.