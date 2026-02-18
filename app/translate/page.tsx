import { Metadata } from 'next'
import { UmweroTranslator } from '../../components/umwero-translator'
import { Badge } from '../../components/ui/badge'
import { Heart, Globe, BookOpen } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Umwero Translator - Uruziga',
  description: 'Translate text to and from the Umwero alphabet.',
}

export default function TranslatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8DC] via-[#FFFFFF] to-[#F3E5AB]">
      {/* Hero Section */}
      <section className="relative py-16 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto text-center max-w-5xl">
          {/* Cultural Badge */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm">Bridging Languages</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur">
              <Globe className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Preserving Culture</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur">
              <BookOpen className="h-4 w-4 text-green-500" />
              <span className="text-sm">Complete Ligature Support</span>
            </Badge>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-[#8B4513]">
            Umwero Alphabet Translator
          </h1>
          <p className="text-lg md:text-xl text-[#D2691E] mb-8 max-w-3xl mx-auto">
            Experience the power of authentic Umwero translation with complete support for ligatures, compounds, and cultural nuances. Bridge languages while preserving Rwandan heritage.
          </p>
        </div>
      </section>

      {/* Translator Component */}
      <section className="py-8 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <UmweroTranslator />
        </div>
      </section>
    </div>
  )
}

