import type { Metadata } from "next"
import AboutContent from "./AboutContent"

export const metadata: Metadata = {
  title: "About Uruziga - The Umwero Movement",
  description: "Learn about the Umwero Movement and our mission to preserve Kinyarwanda culture and language.",
}

export default function AboutPage() {
  return <AboutContent />
}

