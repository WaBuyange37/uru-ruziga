"use client"

import { useState, useMemo, useRef, useEffect } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { useCart } from '../contexts/CartContext'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Search, ShoppingCart, X, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import "../../styles/scroll-area.css"
import { Carousel } from '../../components/Carousel'


// Updated product data with only local images
const products = [
  { id: 1, name: "Inyambo Cow Painting", price: 200, category: "paintings", image: "/pictures/forsale-inyambo-cow.jpg" },
  { id: 2, name: "Nyabisabo Artwork", price: 180, category: "paintings", image: "/pictures/forsale-nyabisabo.jpg" },
  { id: 3, name: "Nyabisabo mu Bijabo", price: 220, category: "paintings", image: "/pictures/forsale-nyabisabo-mu-bijabo.jpg" },
  { id: 4, name: "Imbyeyi Maama", price: 230, category: "paintings", image: "/pictures/forsale-real-cow1.jpg" },
  { id: 5, name: "Inyambo Maraba", price: 190, category: "paintings", image: "/pictures/best.jpg" },
  { id: 6, name: "Umwero Hoodie Numerals", price: 35, category: "fashion", image: "/pictures/umweroNumeralsHoddie.PNG" },
  { id: 7, name: "Umwero Shanawakanda 2", price: 35, category: "fashion", image: "/pictures/UmweroKanda.PNG" },
  { id: 8, name: "Umwero Upper package", price: 250, category: "fashion", image: "/pictures/hoodies.jpg" },
  { id: 9, name: "Urunigi", price: 15, category: "fashion", image: "/pictures/urunigi.JPG" },
  { id: 10, name: "Umwero Necklace", price: 85, category: "decoration", image: "/pictures/urunigi.JPG" },
  { id: 11, name: "Decorative Wall Hanging", price: 120, category: "decoration", image: "/pictures/forsale-nyabisabo.jpg" },
  { id: 12, name: "Handcrafted Wooden Box", price: 75, category: "decoration", image: "/pictures/best.jpg" },
  { id: 13, name: "Agaseke", price: 23, category: "cultural", image: "/pictures/agatukura.jpg" },
  { id: 14, name: "Agaseke Basket", price: 20, category: "cultural", image: "/pictures/agaseke.jpg" },
  { id: 15, name: "Igisabo", price: 130, category: "cultural", image: "/pictures/igisabo.jpg" },
  { id: 16, name: "Inkangara", price: 140, category: "cultural", image: "/pictures/inkangara.jpg" },
  { id: 17, name: "Agakomo", price: 5, category: "fashion", image: "/pictures/Agakomo.JPG" },
  { id: 18, name: "Jumper itukura", price: 20, category: "fashion", image: "/pictures/jumperItukura.JPG" },
  { id: 19, name: "Agenda", price: 10, category: "fashion", image: "/pictures/agenda.JPG" },
  { id: 20, name: "Inyambo itakwa", price: 65, category: "decoration", image: "/pictures/forsale-inyambo-cow.jpg" },
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
  const { t } = useTranslation()
  const { addToCart } = useCart()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

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

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      title: product.name,
      price: product.price,
      quantity: 1
    })
  }

  const slideLeft = () => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
      setCurrentSlide(prev => Math.max(0, prev - 1))
    }
  }

  const slideRight = () => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      setCurrentSlide(prev => Math.min(Math.ceil(filteredFreeResources.length / 6) - 1, prev + 1))
    }
  }

  useEffect(() => {
    const handleResize = () => {
      if (scrollRef.current) {
        const totalWidth = scrollRef.current.scrollWidth
        const viewportWidth = scrollRef.current.offsetWidth
        const maxSlides = Math.ceil(totalWidth / viewportWidth) - 1
        setCurrentSlide(prev => Math.min(prev, maxSlides))
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [filteredFreeResources.length])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-[#8B4513]">{t('umweroGallery')}</h1>

      {/* Search Bar */}
      <div className="mb-8 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B4513]" />
          <Input
            type="search"
            placeholder={t('searchPlaceholder')}
            className="pl-10 bg-[#F3E5AB] text-[#8B4513] border-[#8B4513] focus:ring-2 focus:ring-[#8B4513] focus:border-[#8B4513] transition-all duration-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Free Resources Section */}
      <section className="mb-12 pr-[12px]">
        <h2 className="text-2xl  font-semibold mb-4 text-[#8B4513]">{t('freeEducationalResources')}</h2>
        {filteredFreeResources.length > 0 ? (
          <div className="relative ">
            <div ref={scrollRef} className="flex overflow-x-auto scroll-smooth">
              {filteredFreeResources.map((resource, index) => (
                <Card key={resource.id} className="flex-shrink-0 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/6 p-2 bg-[#F3E5AB] border-[#8B4513]">
                  <CardHeader className="p-3">
                    <div className="aspect-square w-full relative overflow-hidden rounded-md">
                      <Image 
                        src={resource.image || "/placeholder.svg"} 
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
                        <Download className="mr-1 h-3 w-3" /> {t('download')}
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <Button
              className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-[#8B4513] text-[#F3E5AB]"
              onClick={slideLeft}
              disabled={currentSlide === 0}
            >
              <ChevronLeft />
            </Button>
            <Button
              className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-[#8B4513] text-[#F3E5AB]"
              onClick={slideRight}
              disabled={currentSlide === Math.ceil(filteredFreeResources.length / 6) - 1}
            >
              <ChevronRight />
            </Button>
          </div>
        ) : (
          <p className="text-center text-[#8B4513]">{t('noFreeResourcesFound')}</p>
        )}
      </section>

      {/* Products Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-[#8B4513]">{t('umweroProducts')}</h2>
        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="mb-4 flex flex-wrap justify-center">
            <TabsTrigger value="all" onClick={() => setActiveCategory("all")}>{t('all')}</TabsTrigger>
            <TabsTrigger value="paintings" onClick={() => setActiveCategory("paintings")}>{t('paintings')}</TabsTrigger>
            <TabsTrigger value="cultural" onClick={() => setActiveCategory("cultural")}>{t('cultural')}</TabsTrigger>
            <TabsTrigger value="fashion" onClick={() => setActiveCategory("fashion")}>{t('fashion')}</TabsTrigger>
            <TabsTrigger value="decoration" onClick={() => setActiveCategory("decoration")}>{t('decoration')}</TabsTrigger>
          </TabsList>
        </Tabs>
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="bg-[#F3E5AB] border-[#8B4513] hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="p-3 cursor-pointer" onClick={() => setSelectedProduct(product)}>
                  <div className="aspect-square w-full relative overflow-hidden rounded-md">
                    <Image 
                      src={product.image || "/placeholder.svg"} 
                      alt={product.name} 
                      layout="fill"
                      objectFit="cover"
                      className="rounded-md transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-[#8B4513] text-lg mb-2">{product.name}</CardTitle>
                  <CardDescription className="text-[#D2691E] text-base">${product.price.toFixed(2)}</CardDescription>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D] transition-colors duration-300"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" /> {t('addToCart')}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-[#8B4513]">{t('noProductsFound')}</p>
        )}
      </section>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="bg-[#F3E5AB] border-[#8B4513]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#8B4513]">{selectedProduct?.name}</DialogTitle>
            <DialogClose onClick={() => setSelectedProduct(null)} />
          </DialogHeader>
          <div className="mt-4">
            <div className="aspect-square w-full relative overflow-hidden rounded-md mb-4">
              <Image 
                src={selectedProduct?.image || "/placeholder.svg"} 
                alt={selectedProduct?.name} 
                layout="fill"
                objectFit="cover"
                className="rounded-md"
              />
            </div>
            <DialogDescription className="text-[#D2691E] text-lg mb-4">
              ${selectedProduct?.price.toFixed(2)}
            </DialogDescription>
            <p className="text-[#8B4513] mb-4">
              {t('productDescription')}
            </p>
            <Button 
              className="w-full bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D] transition-colors duration-300"
              onClick={() => {
                handleAddToCart(selectedProduct)
                setSelectedProduct(null)
              }}
            >
              <ShoppingCart className="mr-2 h-4 w-4" /> {t('addToCart')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

