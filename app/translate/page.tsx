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
      <section className="relative py-8 sm:py-12 md:py-16 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="container mx-auto text-center max-w-5xl">
          {/* Cultural Badge */}
          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 mb-4 sm:mb-6">
            <Badge variant="outline" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-white/80 backdrop-blur text-xs sm:text-sm">
              <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
              <span>Bridging Languages</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-white/80 backdrop-blur text-xs sm:text-sm">
              <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
              <span>Preserving Culture</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-white/80 backdrop-blur text-xs sm:text-sm">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
              <span className="hidden sm:inline">Complete Ligature Support</span>
              <span className="sm:hidden">Ligatures</span>
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-3 sm:mb-4 text-[#8B4513] leading-tight px-2">
            Umwero Alphabet Translator
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#D2691E] mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-2">
            Experience the power of authentic Umwero translation with complete support for ligatures, compounds, and cultural nuances. Bridge languages while preserving Rwandan heritage.
          </p>
        </div>
      </section>

      {/* Translator Component */}
      <section className="py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <UmweroTranslator />
        </div>
      </section>
    </div>
  )
}

