import type { Metadata } from "next"
import AboutContent from "./AboutContent"
import { kbSeo } from "../../lib/umwero-knowledge-base"

export const metadata: Metadata = {
  title: `${kbSeo.aboutTitle} - Uruziga`,
  description: kbSeo.siteDescription,
  openGraph: {
    title: `${kbSeo.aboutTitle} - Uruziga`,
    description: kbSeo.siteDescription,
  },
}

export default function AboutPage() {
  return <AboutContent />
}

