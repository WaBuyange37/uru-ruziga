"use client"

import { useState, useMemo } from 'react'
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Download, Search, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import { ScrollArea } from "../../components/ui/scroll-area"
import "../../styles/scroll-area.css"

// Updated product data with only local images
const products = [
  { id: 1, name: "Inyambo Cow Painting", price: 200, category: "paintings", image: "/pictures/forsale-inyambo-cow.jpg" },
  { id: 2, name: "Nyabisabo Artwork", price: 180, category: "paintings", image: "/pictures/forsale-nyabisabo.jpg" },
  { id: 3, name: "Nyabisabo mu Bijabo", price: 220, category: "paintings", image: "/pictures/forsale-nyabisabo-mu-bijabo.jpg" },
  { id: 4, name: "Abstract Landscape", price: 230, category: "paintings", image: "/pictures/forsale-real-cow1.jpg" },
  { id: 5, name: "Traditional Dance Scene", price: 190, category: "paintings", image: "/pictures/best.jpg" },
  { id: 6, name: "Umwero T-Shirt Design 1", price: 35, category: "fashion", image: "/pictures/umwero-tshirt1.PNG" },
  { id: 7, name: "Umwero T-Shirt Design 2", price: 35, category: "fashion", image: "/pictures/umwero-tshirt2.PNG" },
  { id: 8, name: "Traditional Umushanana", price: 250, category: "fashion", image: "/pictures/forsale-inyambo-cow.jpg" },
  { id: 9, name: "Modern Kitenge Dress", price: 180, category: "fashion", image: "/pictures/forsale-real-cow1.jpg" },
  { id: 10, name: "Umwero Necklace", price: 85, category: "decoration", image: "/pictures/umwero-necklace.PNG" },
  { id: 11, name: "Decorative Wall Hanging", price: 120, category: "decoration", image: "/pictures/forsale-nyabisabo.jpg" },
  { id: 12, name: "Handcrafted Wooden Box", price: 75, category: "decoration", image: "/pictures/best.jpg" },
  { id: 13, name: "Ingoma Drum", price: 150, category: "cultural", image: "/pictures/forsale-ingoma.jpg" },
  { id: 14, name: "Agaseke Basket", price: 80, category: "cultural", image: "/pictures/forsale-nyabisabo.jpg" },
  { id: 15, name: "Intore Dancer Figurine", price: 130, category: "cultural", image: "/pictures/best.jpg" },
  { id: 16, name: "Rwandan Coffee Set", price: 140, category: "cultural", image: "/pictures/forsale-real-cow1.jpg" },
  { id: 17, name: "Traditional Earrings", price: 45, category: "fashion", image: "/pictures/forsale-nyabisabo-mu-bijabo.jpg" },
  { id: 18, name: "Umwero-inspired Wall Clock", price: 65, category: "decoration", image: "/pictures/forsale-inyambo-cow.jpg" },
]

// Free resources data (unchanged)
const freeResources = [
  { id: 1, name: "Umwero Alphabet Guide", image: "/pictures/free-one.jpeg", downloadLink: "/downloads/umwero-alphabet-guide.pdf" },
  { id: 2, name: "Rwandan Art History", image: "/pictures/free-two.jpeg", downloadLink: "/downloads/rwandan-art-history.pdf" },
  { id: 3, name: "Traditional Patterns", image: "/pictures/free-three.jpeg", downloadLink: "/downloads/traditional-patterns.pdf" },
  { id: 4, name: "Kinyarwanda Phrases", image: "/pictures/free-four.jpeg", downloadLink: "/downloads/kinyarwanda-phrases.pdf" },
  { id: 5, name: "Umwero Writing Practice", image: "/pictures/free-five.jpeg", downloadLink: "/downloads/umwero-writing-practice.pdf" },
  { id: 6, name: "Cultural Symbols Guide", image: "/pictures/free-six.jpeg", downloadLink: "/downloads/cultural-symbols-guide.pdf" },
  { id: 7, name: "Rwandan Cuisine Recipe Book", image: "/pictures/free-one.jpeg", downloadLink: "/downloads/rwandan-cuisine-recipes.pdf" },
  { id: 8, name: "Traditional Music Guide", image: "/pictures/free-two.jpeg", downloadLink: "/downloads/traditional-music-guide.pdf" },
  { id: 9, name: "Umwero Calligraphy Tips", image: "/pictures/free-three.jpeg", downloadLink: "/downloads/umwero-calligraphy-tips.pdf" },
  { id: 10, name: "Rwandan Proverbs Collection", image: "/pictures/free-four.jpeg", downloadLink: "/downloads/rwandan-proverbs.pdf" },
  { id: 11, name: "Imigongo Art Tutorial", image: "/pictures/free-five.jpeg", downloadLink: "/downloads/imigongo-art-tutorial.pdf" },
  { id: 12, name: "Rwandan Festivals Calendar", image: "/pictures/free-six.jpeg", downloadLink: "/downloads/rwandan-festivals-calendar.pdf" },
  { id: 13, name: "Traditional Dance Guide", image: "/pictures/free-one.jpeg", downloadLink: "/downloads/traditional-dance-guide.pdf" },
  { id: 14, name: "Umwero Font Pack", image: "/pictures/free-two.jpeg", downloadLink: "/downloads/umwero-font-pack.zip" },
  { id: 15, name: "Rwandan Crafts DIY", image: "/pictures/free-three.jpeg", downloadLink: "/downloads/rwandan-crafts-diy.pdf" },
  { id: 16, name: "Kinyarwanda Poetry Anthology", image: "/pictures/free-four.jpeg", downloadLink: "/downloads/kinyarwanda-poetry.pdf" },
  { id: 17, name: "Umwero for Kids Workbook", image: "/pictures/free-five.jpeg", downloadLink: "/downloads/umwero-for-kids-workbook.pdf" },
  { id: 18, name: "Rwandan History Timeline", image: "/pictures/free-six.jpeg", downloadLink: "/downloads/rwandan-history-timeline.pdf" },
]

export default function GalleryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")

  const filteredProducts = useMemo(() => {
    return products.filter(product => 
      (activeCategory === "all" || product.category === activeCategory) &&
      (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
       product.price.toString().includes(searchQuery))
    )
  }, [activeCategory, searchQuery])

  const filteredFreeResources = useMemo(() => {
    return freeResources.filter(resource =>
      resource.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-[#FFFFFF] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-full mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-[#8B4513]">Umwero Gallery</h1>

        {/* Search Bar */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B4513]" />
            <Input
              type="search"
              placeholder="Search by name, category, or price..."
              className="pl-10 bg-[#F3E5AB] text-[#8B4513] border-[#8B4513] focus:ring-2 focus:ring-[#8B4513] focus:border-[#8B4513] transition-all duration-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Free Resources Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-[#8B4513]">Free Educational Resources</h2>
          {filteredFreeResources.length > 0 ? (
            <ScrollArea className="w-full rounded-md border border-[#8B4513]">
              <div className="flex space-x-4 p-4">
                {filteredFreeResources.map((resource) => (
                  <Card key={resource.id} className="w-[200px] flex-shrink-0 bg-[#F3E5AB] border-[#8B4513]">
                    <CardHeader className="p-3">
                      <div className="aspect-square w-full relative overflow-hidden rounded-md">
                        <Image 
                          src={resource.image} 
                          alt={resource.name} 
                          layout="fill"
                          objectFit="cover"
                          className="rounded-md"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="p-3">
                      <CardTitle className="text-[#8B4513] text-sm">{resource.name}</CardTitle>
                    </CardContent>
                    <CardFooter className="p-3">
                      <Button asChild className="w-full bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D] text-xs">
                        <a href={resource.downloadLink} download>
                          <Download className="mr-1 h-3 w-3" /> Download
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-center text-[#8B4513]">No free resources match your search.</p>
          )}
        </section>

        {/* Products Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-[#8B4513]">Umwero Products</h2>
          <Tabs defaultValue="all" className="mb-6">
            <TabsList>
              <TabsTrigger value="all" onClick={() => setActiveCategory("all")}>All</TabsTrigger>
              <TabsTrigger value="paintings" onClick={() => setActiveCategory("paintings")}>Paintings</TabsTrigger>
              <TabsTrigger value="cultural" onClick={() => setActiveCategory("cultural")}>Cultural</TabsTrigger>
              <TabsTrigger value="fashion" onClick={() => setActiveCategory("fashion")}>Fashion</TabsTrigger>
              <TabsTrigger value="decoration" onClick={() => setActiveCategory("decoration")}>Decoration</TabsTrigger>
            </TabsList>
          </Tabs>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="bg-[#F3E5AB] border-[#8B4513]">
                  <CardHeader>
                    <div className="aspect-square w-full relative overflow-hidden rounded-md">
                      <Image 
                        src={product.image} 
                        alt={product.name} 
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-[#8B4513]">{product.name}</CardTitle>
                    <CardDescription className="text-[#D2691E]">${product.price}</CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]">
                      <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-[#8B4513]">No products match your search.</p>
          )}
        </section>
      </div>
    </div>
  )
}

