import { Metadata } from 'next'
import { UmweroTranslator } from '../../components/umwero-translator'
import { SectionHeader } from '../../components/ui/page'

export const metadata: Metadata = {
  title: 'Umwero Translator - Uruziga',
  description: 'Translate text to and from the Umwero alphabet.',
}

export default function TranslatePage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="px-3 py-8 sm:px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Translator"
            title="Umwero Alphabet Translator"
            description="Translate between Umwero and Latin with the existing mappings. The vowels are visible by default; deeper tables stay one tap away."
            className="mb-6"
          />
          <UmweroTranslator />
        </div>
      </section>
    </div>
  )
}

