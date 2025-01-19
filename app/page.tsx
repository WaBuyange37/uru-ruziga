"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { CircleIcon, BookOpen, Calendar, Calculator, GamepadIcon } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null)
  const videoRefs = useRef<{ [key: string]: HTMLIFrameElement | null }>({})

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'videoPlay') {
        const videoId = event.data.videoId
        if (videoId !== activeVideo) {
          setActiveVideo(videoId)
          Object.keys(videoRefs.current).forEach((id) => {
            if (id !== videoId && videoRefs.current[id]) {
              videoRefs.current[id]?.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*')
            }
          })
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [activeVideo])

  const videoUrls = [
    'https://www.youtube.com/embed/NGmQ0_dMtPk?enablejsapi=1',
    'https://www.youtube.com/embed/tECTtPxsCdg?enablejsapi=1',
    'https://www.youtube.com/embed/o7_Y7FPmKY4?enablejsapi=1'
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-[#F3E5AB] to-[#FFFFFF]">
        <div className="container mx-auto text-center">
          <CircleIcon className="mx-auto h-24 w-24 mb-8 text-[#8B4513]" />
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-[#8B4513]">
            Enter the Circle of Knowledge
          </h1>
          <p className="text-xl text-[#D2691E] mb-8">
            Where Every Letter Tells a Story
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/learn">Start Learning</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/fund">Fund Uruziga</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/calendar">Explore Calendar</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-[#FFFFFF]">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#8B4513]">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-[#F3E5AB] border-[#8B4513]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                  <BookOpen className="h-5 w-5" />
                  Learn Umwero
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#D2691E]">Interactive lessons to master the Umwero alphabet and its cultural significance.</p>
              </CardContent>
            </Card>
            <Card className="bg-[#F3E5AB] border-[#8B4513]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                  <Calendar className="h-5 w-5" />
                  Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#D2691E]">Explore the ancient calendar system and its connection to modern times.</p>
              </CardContent>
            </Card>
            <Card className="bg-[#F3E5AB] border-[#8B4513]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                  <Calculator className="h-5 w-5" />
                  Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#D2691E]">Access our translator, calculator, and other helpful learning tools.</p>
              </CardContent>
            </Card>
            <Card className="bg-[#F3E5AB] border-[#8B4513]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                  <GamepadIcon className="h-5 w-5" />
                  Games
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#D2691E]">Learn through interactive games and quizzes designed for all skill levels.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Cultural Insights */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-[#F3E5AB]">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#8B4513]">Cultural Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-[#FFFFFF] border-[#8B4513]">
              <CardHeader>
                <CardTitle className="text-[#8B4513]">Did you know?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#D2691E]">Umwero's circle is similar to the Egyptian concept of infinity, representing the eternal cycle of knowledge.</p>
              </CardContent>
            </Card>
            <Card className="bg-[#FFFFFF] border-[#8B4513]">
              <CardHeader>
                <CardTitle className="text-[#8B4513]">Cultural Significance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#D2691E]">Each Umwero character tells a story, with some inspired by traditional Rwandan symbols and artifacts.</p>
              </CardContent>
            </Card>
            <Card className="bg-[#FFFFFF] border-[#8B4513]">
              <CardHeader>
                <CardTitle className="text-[#8B4513]">Language Preservation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#D2691E]">Umwero plays a crucial role in preserving and promoting the rich linguistic heritage of Kinyarwanda.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Umwero Movement Introduction */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-[#FFFFFF]">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-[#8B4513]">The Umwero Movement</h2>
          <p className="text-xl mb-6 text-[#D2691E]">
            Join us in preserving Kinyarwanda culture and language through the Umwero alphabet.
          </p>
          <p className="mb-8 text-[#8B4513]">
            The Umwero movement is a cultural renaissance, driven by passionate individuals dedicated to preserving the Kinyarwanda language. It's not just about an alphabet; it's about cultural identity, historical continuity, and communal pride.
          </p>
          <Button asChild>
            <Link href="/about">Learn More About Umwero</Link>
          </Button>
        </div>
      </section>

      {/* Video Tutorials */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-[#F3E5AB]">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#8B4513]">Video Tutorials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videoUrls.map((url, index) => (
              <div key={index} className="aspect-video">
                <iframe 
                  ref={el => videoRefs.current[`video-${index}`] = el}
                  className="w-full h-full rounded-lg shadow-lg"
                  src={url}
                  title={`Umwero Tutorial ${index + 1}`}
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen>
                </iframe>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Funding Section */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-[#FFFFFF]">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-[#8B4513]">Support Our Mission</h2>
          <p className="text-xl mb-6 text-[#D2691E]">
            Help us preserve Kinyarwanda culture and build a cultural-based school for future generations.
          </p>
          <p className="mb-8 text-[#8B4513]">
            Your contribution helps develop educational materials, organize cultural events, support research, and maintain our digital resources.
          </p>
          <Button asChild>
            <Link href="/fund">Donate Now</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

