import { Metadata } from 'next'
import { UmweroTranslator } from '../../components/umwero-translator'

export const metadata: Metadata = {
  title: 'Umwero Translator - Uruziga',
  description: 'Translate text to and from the Umwero alphabet.',
}

export default function TranslatePage() {
  return (
    <div className="container mx-auto px-4 py-8 bg-[#FFFFFF]">
      <h1 className="text-4xl font-bold mb-6 text-center text-[#8B4513]">Umwero Alphabet Translator</h1>
      <p className="text-xl text-center mb-8 text-[#D2691E]">Bridging Languages, Preserving Culture</p>
      <UmweroTranslator />
    </div>
  )
}

