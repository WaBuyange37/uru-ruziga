// components/examples/ImageAssetExample.tsx
"use client"

import { 
  ImageAsset, 
  InkaImage, 
  ImanaImage, 
  IngomaImage, 
  LogoImage,
  ImageGallery 
} from '../ui/ImageAssets'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

export function ImageAssetExample() {
  return (
    <div className="space-y-8 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Image Assets Usage Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Method 1: Using the main ImageAsset component */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Method 1: Using ImageAsset Component</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <ImageAsset name="inka" width={100} height={100} alt="Cow" />
                <p className="mt-2 text-sm">Inka (Cow)</p>
              </div>
              <div className="text-center">
                <ImageAsset name="Imana" width={100} height={100} alt="Imana" />
                <p className="mt-2 text-sm">Imana</p>
              </div>
              <div className="text-center">
                <ImageAsset name="ingoma" width={100} height={100} alt="Drum" />
                <p className="mt-2 text-sm">Ingoma (Drum)</p>
              </div>
              <div className="text-center">
                <ImageAsset name="logo" width={100} height={100} alt="Logo" />
                <p className="mt-2 text-sm">Logo</p>
              </div>
            </div>
          </div>

          {/* Method 2: Using individual image components */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Method 2: Using Individual Components</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <InkaImage width={100} height={100} />
                <p className="mt-2 text-sm">InkaImage</p>
              </div>
              <div className="text-center">
                <ImanaImage width={100} height={100} />
                <p className="mt-2 text-sm">ImanaImage</p>
              </div>
              <div className="text-center">
                <IngomaImage width={100} height={100} />
                <p className="mt-2 text-sm">IngomaImage</p>
              </div>
              <div className="text-center">
                <LogoImage width={100} height={100} />
                <p className="mt-2 text-sm">LogoImage</p>
              </div>
            </div>
          </div>

          {/* Method 3: Using fill prop for responsive containers */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Method 3: Responsive with Fill</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <ImageAsset name="inka" fill className="object-contain p-2" />
              </div>
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <ImageAsset name="Imana" fill className="object-contain p-2" />
              </div>
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <ImageAsset name="ingoma" fill className="object-contain p-2" />
              </div>
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <ImageAsset name="logo" fill className="object-cover" />
              </div>
            </div>
          </div>

          {/* Method 4: Using the ImageGallery component */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Method 4: Using ImageGallery</h3>
            <ImageGallery />
          </div>

          {/* Method 5: Custom styling examples */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Method 5: Custom Styling</h3>
            <div className="flex flex-wrap gap-4 items-center">
              <ImageAsset 
                name="logo" 
                width={60} 
                height={60} 
                className="rounded-full border-2 border-blue-500" 
              />
              <ImageAsset 
                name="inka" 
                width={80} 
                height={80} 
                className="rounded-lg shadow-lg" 
              />
              <ImageAsset 
                name="ingoma" 
                width={100} 
                height={100} 
                className="rounded-xl bg-gradient-to-br from-yellow-100 to-orange-100 p-2" 
              />
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}