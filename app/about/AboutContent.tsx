"use client"
import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import Link from "next/link"
import { useTranslation } from "../../hooks/useTranslation"
import { useLanguage } from "../contexts/LanguageContext"
import { UmweroText, UmweroHeading, UmweroParagraph } from "../../components/UmweroText"
import { CircleIcon, BookOpen, Heart, Users, Sparkles, Target, Globe } from "lucide-react"

export default function AboutContent() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const isUmwero = language === 'um'
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const getLanguageStyle = () => {
    return isUmwero ? { fontFamily: "'UMWEROalpha', serif" } : {}
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F3E5AB] via-[#FFFFFF] to-[#F3E5AB]">
      {/* Hero Section */}
      <section className="relative py-16 px-4 md:px-6 lg:px-8 bg-gradient-to-br from-[#F3E5AB] via-[#FAEBD7] to-[#F3E5AB]">
        <div className="container mx-auto max-w-5xl text-center">
          <CircleIcon className="mx-auto h-16 w-16 md:h-20 md:w-20 mb-6 text-[#8B4513] animate-pulse" />
          <UmweroHeading level={1} className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-[#8B4513]">
            <UmweroText>{mounted ? t("umweroMovement") : "The Umwero Movement"}</UmweroText>
          </UmweroHeading>
          <p className="text-xl md:text-2xl text-[#D2691E] mb-8 max-w-3xl mx-auto">
            {mounted ? "Preserving Kinyarwanda Heritage Through Authentic Language Representation" : "Preserving Kinyarwanda Heritage Through Authentic Language Representation"}
          </p>
        </div>
      </section>

      {/* Founder's Vision */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-white">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-br from-[#F3E5AB] to-[#FAEBD7] border-2 border-[#8B4513] shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="text-5xl mb-4">✨</div>
              <CardTitle className="text-3xl text-[#8B4513]">Founder's Vision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <blockquote className="text-xl italic text-[#8B4513] text-center leading-relaxed border-l-4 border-[#8B4513] pl-6 py-4">
                "Every culture is protected by its language, and any language may be protected by its own writing system."
              </blockquote>
              <p className="text-center text-[#D2691E] font-semibold text-lg">
                — Kwizera Mugisha, Creator of Umwero
              </p>
              <div className="bg-white/80 rounded-lg p-6 mt-6">
                <p className="text-[#8B4513] leading-relaxed">
                  Inspired by biblical philosophy (Genesis 11:1-9, Daniel 5:1-25) and President Paul Kagame's teachings on self-dignity, 
                  Kwizera Mugisha created Umwero to give Kinyarwanda its own authentic writing system that truly represents its unique sounds and cultural essence.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* What is Umwero */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-white to-[#F3E5AB]/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#8B4513]">
            What is Umwero?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-white border-2 border-[#8B4513]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                  <BookOpen className="h-6 w-6" />
                  Official Definition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#8B4513] leading-relaxed">
                  The Umwero Alphabet is a Kinyarwanda writing system developed to authentically represent the language's unique phonemes and preserve its cultural essence. 
                  Unlike the Latin Kinyarwanda script, which often misrepresents native sounds, Umwero stays true to Kinyarwanda phonetic rules and the deep symbolism found in Rwandan traditions.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-[#8B4513]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                  <Target className="h-6 w-6" />
                  Key Characteristics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-[#8B4513]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#D2691E] mt-1">•</span>
                    <span><strong>39 Basic Phonemes</strong> represented by 39 core characters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#D2691E] mt-1">•</span>
                    <span><strong>Ibihekane (Ligatures)</strong> - combined sounds as single units</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#D2691E] mt-1">•</span>
                    <span><strong>Cultural Symbolism</strong> in every character</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#D2691E] mt-1">•</span>
                    <span><strong>Right-to-Left Writing</strong> direction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#D2691E] mt-1">•</span>
                    <span><strong>Measurement of 8</strong> (Umunani) - heritage system</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* The Name "Umwero" */}
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-[#8B4513]">
            <CardHeader>
              <CardTitle className="text-2xl text-[#8B4513] text-center">
                The Name "Umwero"
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#8B4513] text-center leading-relaxed mb-4">
                Literally means "the harvest" but encompasses the three pillars of Rwandan culture:
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-4xl mb-2">⭕</div>
                  <h4 className="font-bold text-[#8B4513] mb-1">Imana</h4>
                  <p className="text-sm text-[#D2691E]">God - the holy one who blesses</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-4xl mb-2">🐄</div>
                  <h4 className="font-bold text-[#8B4513] mb-1">In'ka</h4>
                  <p className="text-sm text-[#D2691E]">Cattle - white milk (umweru/ayera)</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-4xl mb-2">👑</div>
                  <h4 className="font-bold text-[#8B4513] mb-1">Ingoma</h4>
                  <p className="text-sm text-[#D2691E]">Throne - cultural sovereignty</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* The Problem Umwero Solves */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-white">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#8B4513]">
            Why Umwero Matters
          </h2>
          
          <div className="space-y-6">
            <Card className="bg-red-50 border-2 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-800">The Problem: Latin Script Inadequacies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-red-900">
                <p className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">❌</span>
                  <span><strong>Phonetic Misrepresentation:</strong> "Rwanda" written but pronounced "RGWanda" (missing 'G' sound)</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">❌</span>
                  <span><strong>Colonial Influence:</strong> Latin alphabet imposed during colonization by people who didn't understand Kinyarwanda phonetics</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">❌</span>
                  <span><strong>Ongoing Confusion:</strong> Ministry of Culture changed writing rules in 2014, 2020, planning changes in 2024 - proof that Latin alphabet cannot fully capture Kinyarwanda sounds</span>
                </p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-2 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">The Solution: Umwero's Authentic Representation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-green-900">
                <p className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span><strong>True Phonetics:</strong> Every sound in Kinyarwanda has its own character</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span><strong>Cultural Roots:</strong> Each character embodies Rwandan culture and traditions</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span><strong>Linguistic Independence:</strong> Reclaims sovereignty over language representation</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span><strong>Heritage Preservation:</strong> Ensures future generations connect with authentic Kinyarwanda</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Development Journey */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-white to-[#F3E5AB]">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#8B4513]">
            The Journey of Creation
          </h2>
          
          <div className="space-y-6">
            <Card className="bg-white border-2 border-[#8B4513]">
              <CardHeader>
                <CardTitle className="text-[#8B4513]">2014-2017: Discovery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#8B4513]">
                  Kwizera Mugisha begins writing Kinyarwanda rap songs and notices discrepancy between spoken and written Kinyarwanda. 
                  A visit to Nairobi, Kenya reveals different writing systems for similar Bantu sounds, sparking the realization that Latin alphabet was imposed during colonization.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-[#8B4513]">
              <CardHeader>
                <CardTitle className="text-[#8B4513]">2019: The Mirror Revelation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#8B4513]">
                  First year at university (Computer Science) - breakthrough moment looking in a mirror: "Circle never changes, unlike other letters. 
                  Human eyes cross sign naturally. Alphabet is like human body - can die or come to life. Character = body of spirit (sound)." 
                  Started with the unchangeable circle shape representing Imana (God).
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-[#8B4513]">
              <CardHeader>
                <CardTitle className="text-[#8B4513]">Design Principles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-[#8B4513]">
                  <strong>80% Cultural:</strong> Based on Kinyarwanda culture and traditions (In'ka, Imana, Ingoma, traditional practices)
                </p>
                <p className="text-[#8B4513]">
                  <strong>20% Intuitive:</strong> Some letters created intuitively, cultural connections discovered later
                </p>
                <p className="text-[#8B4513]">
                  <strong>Measurement of 8 (Umunani):</strong> All characters uniform height - symbolizing heritage/inheritance passed to future generations
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-[#8B4513]">
              <CardHeader>
                <CardTitle className="text-[#8B4513]">Collaborative Development</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#8B4513]">
                  Craig Cornelius helped develop the virtual Umwero keyboard. 18 students learned the alphabet in remarkably short period and provided feedback, 
                  making the script intuitive and user-friendly.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-[#F3E5AB]">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-white border-2 border-[#8B4513] shadow-xl">
            <CardHeader className="text-center">
              <div className="flex justify-center gap-4 mb-4">
                <Heart className="h-8 w-8 text-red-500" />
                <Globe className="h-8 w-8 text-blue-500" />
                <Users className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="text-3xl text-[#8B4513]">
                <UmweroText>{mounted ? t("ourMission") : "Our Mission"}</UmweroText>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <UmweroParagraph className="text-[#8B4513] text-lg leading-relaxed">
                Uruziga serves as the official educational platform dedicated to teaching the Umwero Alphabet authentically, 
                preserving Kinyarwanda linguistic heritage, decolonizing language representation, and celebrating Rwandan cultural identity through language.
              </UmweroParagraph>
              
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-[#F3E5AB] p-4 rounded-lg">
                  <h4 className="font-bold text-[#8B4513] mb-2">Educate</h4>
                  <p className="text-sm text-[#8B4513]">Teach Umwero alphabet through interactive lessons and cultural context</p>
                </div>
                <div className="bg-[#F3E5AB] p-4 rounded-lg">
                  <h4 className="font-bold text-[#8B4513] mb-2">Preserve</h4>
                  <p className="text-sm text-[#8B4513]">Safeguard Kinyarwanda linguistic heritage for future generations</p>
                </div>
                <div className="bg-[#F3E5AB] p-4 rounded-lg">
                  <h4 className="font-bold text-[#8B4513] mb-2">Decolonize</h4>
                  <p className="text-sm text-[#8B4513]">Reclaim linguistic sovereignty from colonial impositions</p>
                </div>
                <div className="bg-[#F3E5AB] p-4 rounded-lg">
                  <h4 className="font-bold text-[#8B4513] mb-2">Celebrate</h4>
                  <p className="text-sm text-[#8B4513]">Honor Rwandan cultural identity through authentic language</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 justify-center mt-8">
                <Button asChild size="lg" className="bg-[#8B4513] hover:bg-[#A0522D]">
                  <Link href="/learn">
                    <Sparkles className="mr-2 h-5 w-5" />
                    <UmweroText>{mounted ? t("startLearningUmwero") : "Start Learning Umwero"}</UmweroText>
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 border-[#8B4513] text-[#8B4513]">
                  <Link href="/fund">
                    <Heart className="mr-2 h-5 w-5" />
                    <UmweroText>{mounted ? t("supportOurMission") : "Support Our Mission"}</UmweroText>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Add global CSS for Umwero font when language is 'um' */}
      {isUmwero && (
        <style jsx global>{`
          .umwero-font {
            font-family: 'UMWEROalpha', serif !important;
          }
          
          .umwero-font button,
          .umwero-font .button {
            font-family: 'UMWEROalpha', serif !important;
          }
        `}</style>
      )}
    </div>
  )
}