"use client"

import { useState } from 'react'
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Label } from "../../components/ui/label"
import { MessageCircle, Search, Loader2, Users, Heart, Globe, Sparkles, Plus, Eye } from 'lucide-react'
import { useCommunityPosts } from "../../hooks/useCommunityPosts"
import { useAuth } from "../contexts/AuthContext"
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { MediaUpload } from "../../components/discussions/MediaUpload"
import { CommunityPostCard } from "../../components/community/CommunityPostCard"

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8DC] via-[#FFFFFF] to-[#F3E5AB]">
      {/* Hero Section */}
      <section className="relative py-8 sm:py-12 md:py-16 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="container mx-auto text-center max-w-5xl">
          {/* Cultural Badge */}
          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 mb-4 sm:mb-6">
            <Badge variant="outline" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-white/80 backdrop-blur text-xs sm:text-sm">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
              <span>Community Driven</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-white/80 backdrop-blur text-xs sm:text-sm">
              <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
              <span>Cultural Exchange</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-white/80 backdrop-blur text-xs sm:text-sm">
              <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
              <span>Global Learning</span>
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-3 sm:mb-4 text-[#8B4513] leading-tight">
            Community Discussions
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#D2691E] mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-2">
            Join the vibrant Umwero learning community. Share knowledge, ask questions, and connect with fellow learners preserving Rwandan cultural heritage through authentic script learning.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
            <Button 
              size="lg" 
              className="gap-2 bg-[#8B4513] hover:bg-[#A0522D] text-white shadow-lg hover:shadow-xl transition-all text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
              onClick={() => {
                setTimeout(() => {
                  const forumSection = document.getElementById('discussion-forum')
                  if (forumSection) {
                    forumSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }, 100)
              }}
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              Start a Discussion
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="gap-2 border-[#8B4513] text-[#8B4513] hover:bg-[#F3E5AB] text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
              onClick={() => {
                setTimeout(() => {
                  const postsSection = document.getElementById('community-posts')
                  if (postsSection) {
                    postsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }, 100)
              }}
            >
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              Browse Posts
            </Button>
          </div>
        </div>

        {/* Community Image */}
        <div className="mt-8 sm:mt-12 max-w-4xl mx-auto px-3 sm:px-0">
          <Card className="overflow-hidden border-[#8B4513] shadow-2xl">
            <Image
              src="/pictures/for.jpg"
              alt="Umwero Community - Learning Together"
              width={800}
              height={300}
              className="w-full h-48 sm:h-64 md:h-80 object-cover"
            />
          </Card>
        </div>
      </section>

      {/* Community Stats */}
      <section className="py-6 sm:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl transition-all">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="text-3xl sm:text-4xl mb-2">🌍</div>
                <h3 className="text-lg sm:text-xl font-semibold text-blue-800 mb-2">Global Community</h3>
                <p className="text-sm sm:text-base text-blue-600">Learners from around the world united by Umwero</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-xl transition-all">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="text-3xl sm:text-4xl mb-2">📚</div>
                <h3 className="text-lg sm:text-xl font-semibold text-purple-800 mb-2">Knowledge Sharing</h3>
                <p className="text-sm sm:text-base text-purple-600">Share insights, tips, and cultural knowledge</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-xl transition-all">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="text-3xl sm:text-4xl mb-2">🤝</div>
                <h3 className="text-lg sm:text-xl font-semibold text-amber-800 mb-2">Mutual Support</h3>
                <p className="text-sm sm:text-base text-amber-600">Help each other master the Umwero script</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Discussion Forum */}
      <section className="py-6 sm:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <DiscussionForum />
        </div>
      </section>
    </div>
  )
}

function DiscussionForum() {
  const { discussions, loading, error, createDiscussion, fetchDiscussions } = useCommunityPosts()
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    content: '',
    language: 'en' as 'en' | 'rw' | 'um',
    latinText: '',
    umweroText: '',
    mediaUrls: [] as string[]
  })
  const [formErrors, setFormErrors] = useState({ content: '' })
  const [submitting, setSubmitting] = useState(false)

  // Show ALL posts (not filtered by user)
  const filteredDiscussions = discussions.filter(d =>
    d.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.latinText && d.latinText.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (d.umweroText && d.umweroText.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const validateForm = () => {
    const errors = { content: '' }
    let isValid = true

    if (!formData.content.trim()) {
      errors.content = 'Content is required'
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      alert('Please login to create a discussion')
      router.push('/login')
      return
    }

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    const result = await createDiscussion({
      content: formData.content,
      language: formData.language,
      latinText: formData.latinText || undefined,
      umweroText: formData.umweroText || undefined,
      mediaUrls: formData.mediaUrls
    })

    setSubmitting(false)

    if (result) {
      setFormData({ content: '', language: 'en', latinText: '', umweroText: '', mediaUrls: [] })
      setShowForm(false)
      // Refresh the posts list to show the new post
      await fetchDiscussions()
      alert('Post created successfully!')
    } else {
      alert('Failed to create post. Please try again.')
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8" id="discussion-forum">
      {/* Create Post Section */}
      <Card className="bg-white/90 backdrop-blur border-[#8B4513] shadow-xl">
        <CardHeader className="bg-gradient-to-r from-[#F3E5AB] to-[#FAEBD7] border-b border-[#8B4513] p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg sm:text-xl md:text-2xl text-[#8B4513] flex items-center gap-2">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                Community Posts
              </CardTitle>
              <CardDescription className="text-[#D2691E] text-sm sm:text-base md:text-lg mt-1">
                Share knowledge and connect with fellow Umwero learners
              </CardDescription>
            </div>
            <Badge variant="outline" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 bg-white/80 flex-shrink-0">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
              <span className="text-xs sm:text-sm font-semibold">{discussions.length} Posts</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B4513] h-4 w-4 sm:h-5 sm:w-5" />
              <Input
                placeholder="Search posts, discussions, and cultural insights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 sm:pl-12 bg-white border-2 border-[#8B4513] text-[#8B4513] placeholder:text-[#D2691E] shadow-sm focus:shadow-md transition-shadow text-sm sm:text-base"
              />
            </div>
            <Button 
              onClick={() => setShowForm(!showForm)} 
              className="bg-[#8B4513] hover:bg-[#A0522D] text-white shadow-lg hover:shadow-xl transition-all flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
              size="lg"
            >
              {showForm ? (
                <>
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Cancel</span>
                  <span className="sm:hidden">Cancel</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">New Post</span>
                  <span className="sm:hidden">New</span>
                </>
              )}
            </Button>
          </div>

          {showForm && (
            <Card className="bg-gradient-to-r from-[#F3E5AB]/30 to-[#FAEBD7]/30 border-2 border-[#8B4513]">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div>
                    <Label htmlFor="language" className="text-[#8B4513] font-medium text-sm sm:text-base md:text-lg mb-2 block">
                      Language *
                    </Label>
                    <select
                      id="language"
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value as 'en' | 'rw' | 'um' })}
                      className="w-full p-2 sm:p-3 border-2 border-[#8B4513] rounded-lg bg-white text-[#8B4513] font-medium shadow-sm focus:shadow-md transition-shadow text-sm sm:text-base"
                    >
                      <option value="en">English</option>
                      <option value="rw">Kinyarwanda</option>
                      <option value="um">Umwero (ⵓⵎⵡⴻⵔⵓ)</option>
                    </select>
                    <p className="text-xs sm:text-sm text-[#D2691E] mt-2 flex items-center gap-1 sm:gap-2">
                      <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
                      {formData.language === 'um' 
                        ? 'Content will be displayed in authentic Umwero script' 
                        : formData.language === 'rw'
                        ? 'Content will be displayed in Kinyarwanda'
                        : 'Content will be displayed in English'}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="content" className="text-[#8B4513] font-medium text-sm sm:text-base md:text-lg mb-2 block">
                      Content *
                    </Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder={formData.language === 'um' 
                        ? 'Write your post in Umwero script...' 
                        : formData.language === 'rw'
                        ? 'Andika ubutumwa bwawe mu Kinyarwanda...'
                        : 'Share your thoughts, questions, or insights about Umwero...'}
                      rows={6}
                      className={`${formErrors.content ? 'border-red-500' : 'border-2 border-[#8B4513]'} ${
                        formData.language === 'um' ? 'font-umwero text-lg sm:text-xl md:text-2xl' : ''
                      } bg-white text-[#8B4513] shadow-sm focus:shadow-md transition-shadow text-sm sm:text-base`}
                      style={formData.language === 'um' ? { fontFamily: 'Umwero, monospace' } : {}}
                    />
                    {formErrors.content && <p className="text-red-500 text-xs sm:text-sm mt-2 flex items-center gap-2">⚠️ {formErrors.content}</p>}
                    
                    {formData.content && (
                      <Card className="mt-3 sm:mt-4 bg-white/80 border border-[#8B4513]">
                        <CardContent className="p-3 sm:p-4">
                          <p className="text-xs sm:text-sm text-[#8B4513] mb-2 font-medium flex items-center gap-1 sm:gap-2">
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            Preview:
                          </p>
                          <p 
                            className={`text-[#8B4513] text-sm sm:text-base ${
                              formData.language === 'um' ? 'font-umwero text-lg sm:text-xl md:text-2xl' : ''
                            }`}
                            style={formData.language === 'um' ? { fontFamily: 'Umwero, monospace' } : {}}
                          >
                            {formData.content}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {formData.language === 'um' && (
                    <div>
                      <Label htmlFor="latinText" className="text-[#8B4513] font-medium text-sm sm:text-base mb-2 block">
                        Latin Translation (Optional)
                      </Label>
                      <Textarea
                        id="latinText"
                        value={formData.latinText}
                        onChange={(e) => setFormData({ ...formData, latinText: e.target.value })}
                        placeholder="Provide Latin translation for better understanding..."
                        rows={3}
                        className="border-2 border-[#8B4513] bg-white text-[#8B4513] shadow-sm focus:shadow-md transition-shadow text-sm sm:text-base"
                      />
                    </div>
                  )}

                  {formData.language === 'rw' && (
                    <div>
                      <Label htmlFor="umweroText" className="text-[#8B4513] font-medium text-sm sm:text-base mb-2 block">
                        Umwero Translation (Optional)
                      </Label>
                      <Textarea
                        id="umweroText"
                        value={formData.umweroText}
                        onChange={(e) => setFormData({ ...formData, umweroText: e.target.value })}
                        placeholder="Provide Umwero translation..."
                        rows={3}
                        className="font-umwero text-base sm:text-lg md:text-xl border-2 border-[#8B4513] bg-white text-[#8B4513] shadow-sm focus:shadow-md transition-shadow"
                        style={{ fontFamily: 'Umwero, monospace' }}
                      />
                    </div>
                  )}

                  <div>
                    <Label className="text-[#8B4513] font-medium text-sm sm:text-base mb-2 block">Media (Optional)</Label>
                    <MediaUpload
                      onMediaChange={(urls) => setFormData({ ...formData, mediaUrls: urls })}
                      maxFiles={4}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Button 
                      type="submit" 
                      disabled={submitting} 
                      className="bg-[#8B4513] hover:bg-[#A0522D] text-white shadow-lg hover:shadow-xl transition-all flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                      size="lg"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                          <span className="hidden sm:inline">Creating...</span>
                          <span className="sm:hidden">Creating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span className="hidden sm:inline">Create Post</span>
                          <span className="sm:hidden">Create</span>
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowForm(false)}
                      className="border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#F3E5AB] shadow-lg hover:shadow-xl transition-all px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                      size="lg"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Posts Section */}
      <div id="community-posts">
        {loading && (
          <Card className="bg-white/90 backdrop-blur border-[#8B4513]">
            <CardContent className="p-6 sm:p-8 md:p-12 text-center">
              <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 animate-spin mx-auto text-[#8B4513] mb-3 sm:mb-4" />
              <p className="text-[#8B4513] text-base sm:text-lg font-medium">Loading community posts...</p>
              <p className="text-[#D2691E] text-xs sm:text-sm mt-2">Gathering wisdom from the community</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50/80 backdrop-blur">
            <CardContent className="p-4 sm:p-6 md:p-8 text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4">⚠️</div>
              <p className="text-red-600 text-sm sm:text-base md:text-lg font-medium mb-3 sm:mb-4">Error loading posts: {error}</p>
              <Button 
                onClick={fetchDiscussions} 
                variant="outline" 
                className="border-red-300 text-red-600 hover:bg-red-50 text-sm sm:text-base px-3 sm:px-4 py-2"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading && !error && filteredDiscussions.length === 0 && (
          <Card className="bg-white/90 backdrop-blur border-[#8B4513]">
            <CardContent className="p-6 sm:p-8 md:p-12 text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6">💬</div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#8B4513] mb-3 sm:mb-4">
                {searchQuery ? 'No posts found' : 'Start the conversation'}
              </h3>
              <p className="text-[#D2691E] text-sm sm:text-base md:text-lg mb-4 sm:mb-6 max-w-md mx-auto px-2">
                {searchQuery 
                  ? 'Try adjusting your search terms or browse all posts.' 
                  : 'Be the first to share your Umwero learning journey with the community!'}
              </p>
              <Button 
                onClick={() => setShowForm(true)} 
                className="bg-[#8B4513] hover:bg-[#A0522D] text-white shadow-lg hover:shadow-xl transition-all flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                size="lg"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                Create First Post
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading && !error && filteredDiscussions.length > 0 && (
          <Card className="bg-white/90 backdrop-blur border-[#8B4513] shadow-xl overflow-hidden">
            <div className="divide-y divide-[#8B4513]/20">
              {filteredDiscussions.map((post) => (
                <CommunityPostCard key={post.id} post={post} />
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
