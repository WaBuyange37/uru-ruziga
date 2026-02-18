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
      <section className="relative py-16 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto text-center max-w-5xl">
          {/* Cultural Badge */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Community Driven</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm">Cultural Exchange</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur">
              <Globe className="h-4 w-4 text-green-500" />
              <span className="text-sm">Global Learning</span>
            </Badge>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-[#8B4513]">
            Community Discussions
          </h1>
          <p className="text-lg md:text-xl text-[#D2691E] mb-8 max-w-3xl mx-auto">
            Join the vibrant Umwero learning community. Share knowledge, ask questions, and connect with fellow learners preserving Rwandan cultural heritage through authentic script learning.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="gap-2 bg-[#8B4513] hover:bg-[#A0522D] text-white shadow-lg hover:shadow-xl transition-all"
              onClick={() => {
                setTimeout(() => {
                  const forumSection = document.getElementById('discussion-forum')
                  if (forumSection) {
                    forumSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }, 100)
              }}
            >
              <Plus className="h-5 w-5" />
              Start a Discussion
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="gap-2 border-[#8B4513] text-[#8B4513] hover:bg-[#F3E5AB]"
              onClick={() => {
                setTimeout(() => {
                  const postsSection = document.getElementById('community-posts')
                  if (postsSection) {
                    postsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }, 100)
              }}
            >
              <MessageCircle className="h-5 w-5" />
              Browse Posts
            </Button>
          </div>
        </div>

        {/* Community Image */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="overflow-hidden border-[#8B4513] shadow-2xl">
            <Image
              src="/pictures/for.jpg"
              alt="Umwero Community - Learning Together"
              width={800}
              height={300}
              className="w-full h-64 md:h-80 object-cover"
            />
          </Card>
        </div>
      </section>

      {/* Community Stats */}
      <section className="py-8 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl transition-all">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">🌍</div>
                <h3 className="text-xl font-semibold text-blue-800 mb-2">Global Community</h3>
                <p className="text-blue-600">Learners from around the world united by Umwero</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-xl transition-all">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">📚</div>
                <h3 className="text-xl font-semibold text-purple-800 mb-2">Knowledge Sharing</h3>
                <p className="text-purple-600">Share insights, tips, and cultural knowledge</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-xl transition-all">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">🤝</div>
                <h3 className="text-xl font-semibold text-amber-800 mb-2">Mutual Support</h3>
                <p className="text-amber-600">Help each other master the Umwero script</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Discussion Forum */}
      <section className="py-8 px-4 md:px-6 lg:px-8">
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
    <div className="space-y-8" id="discussion-forum">
      {/* Create Post Section */}
      <Card className="bg-white/90 backdrop-blur border-[#8B4513] shadow-xl">
        <CardHeader className="bg-gradient-to-r from-[#F3E5AB] to-[#FAEBD7] border-b border-[#8B4513]">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-[#8B4513] flex items-center gap-2">
                <MessageCircle className="h-6 w-6" />
                Community Posts
              </CardTitle>
              <CardDescription className="text-[#D2691E] text-lg mt-1">
                Share knowledge and connect with fellow Umwero learners
              </CardDescription>
            </div>
            <Badge variant="outline" className="flex items-center gap-2 px-3 py-1 bg-white/80">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-semibold">{discussions.length} Posts</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B4513] h-5 w-5" />
              <Input
                placeholder="Search posts, discussions, and cultural insights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-white border-2 border-[#8B4513] text-[#8B4513] placeholder:text-[#D2691E] shadow-sm focus:shadow-md transition-shadow"
              />
            </div>
            <Button 
              onClick={() => setShowForm(!showForm)} 
              className="bg-[#8B4513] hover:bg-[#A0522D] text-white shadow-lg hover:shadow-xl transition-all flex items-center gap-2 px-6"
              size="lg"
            >
              {showForm ? (
                <>
                  <MessageCircle className="h-5 w-5" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  New Post
                </>
              )}
            </Button>
          </div>

          {showForm && (
            <Card className="bg-gradient-to-r from-[#F3E5AB]/30 to-[#FAEBD7]/30 border-2 border-[#8B4513]">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="language" className="text-[#8B4513] font-medium text-lg mb-2 block">
                      Language *
                    </Label>
                    <select
                      id="language"
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value as 'en' | 'rw' | 'um' })}
                      className="w-full p-3 border-2 border-[#8B4513] rounded-lg bg-white text-[#8B4513] font-medium shadow-sm focus:shadow-md transition-shadow"
                    >
                      <option value="en">English</option>
                      <option value="rw">Kinyarwanda</option>
                      <option value="um">Umwero (ⵓⵎⵡⴻⵔⵓ)</option>
                    </select>
                    <p className="text-sm text-[#D2691E] mt-2 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {formData.language === 'um' 
                        ? 'Content will be displayed in authentic Umwero script' 
                        : formData.language === 'rw'
                        ? 'Content will be displayed in Kinyarwanda'
                        : 'Content will be displayed in English'}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="content" className="text-[#8B4513] font-medium text-lg mb-2 block">
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
                        formData.language === 'um' ? 'font-umwero text-2xl' : ''
                      } bg-white text-[#8B4513] shadow-sm focus:shadow-md transition-shadow`}
                      style={formData.language === 'um' ? { fontFamily: 'Umwero, monospace' } : {}}
                    />
                    {formErrors.content && <p className="text-red-500 text-sm mt-2 flex items-center gap-2">⚠️ {formErrors.content}</p>}
                    
                    {formData.content && (
                      <Card className="mt-4 bg-white/80 border border-[#8B4513]">
                        <CardContent className="p-4">
                          <p className="text-sm text-[#8B4513] mb-2 font-medium flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Preview:
                          </p>
                          <p 
                            className={`text-[#8B4513] ${
                              formData.language === 'um' ? 'font-umwero text-2xl' : ''
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
                      <Label htmlFor="latinText" className="text-[#8B4513] font-medium mb-2 block">
                        Latin Translation (Optional)
                      </Label>
                      <Textarea
                        id="latinText"
                        value={formData.latinText}
                        onChange={(e) => setFormData({ ...formData, latinText: e.target.value })}
                        placeholder="Provide Latin translation for better understanding..."
                        rows={3}
                        className="border-2 border-[#8B4513] bg-white text-[#8B4513] shadow-sm focus:shadow-md transition-shadow"
                      />
                    </div>
                  )}

                  {formData.language === 'rw' && (
                    <div>
                      <Label htmlFor="umweroText" className="text-[#8B4513] font-medium mb-2 block">
                        Umwero Translation (Optional)
                      </Label>
                      <Textarea
                        id="umweroText"
                        value={formData.umweroText}
                        onChange={(e) => setFormData({ ...formData, umweroText: e.target.value })}
                        placeholder="Provide Umwero translation..."
                        rows={3}
                        className="font-umwero text-xl border-2 border-[#8B4513] bg-white text-[#8B4513] shadow-sm focus:shadow-md transition-shadow"
                        style={{ fontFamily: 'Umwero, monospace' }}
                      />
                    </div>
                  )}

                  <div>
                    <Label className="text-[#8B4513] font-medium mb-2 block">Media (Optional)</Label>
                    <MediaUpload
                      onMediaChange={(urls) => setFormData({ ...formData, mediaUrls: urls })}
                      maxFiles={4}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      type="submit" 
                      disabled={submitting} 
                      className="bg-[#8B4513] hover:bg-[#A0522D] text-white shadow-lg hover:shadow-xl transition-all flex items-center gap-2 px-6"
                      size="lg"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5" />
                          Create Post
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowForm(false)}
                      className="border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#F3E5AB] shadow-lg hover:shadow-xl transition-all px-6"
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
            <CardContent className="p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-[#8B4513] mb-4" />
              <p className="text-[#8B4513] text-lg font-medium">Loading community posts...</p>
              <p className="text-[#D2691E] text-sm mt-2">Gathering wisdom from the community</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50/80 backdrop-blur">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-red-600 text-lg font-medium mb-4">Error loading posts: {error}</p>
              <Button 
                onClick={fetchDiscussions} 
                variant="outline" 
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading && !error && filteredDiscussions.length === 0 && (
          <Card className="bg-white/90 backdrop-blur border-[#8B4513]">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-6">💬</div>
              <h3 className="text-2xl font-semibold text-[#8B4513] mb-4">
                {searchQuery ? 'No posts found' : 'Start the conversation'}
              </h3>
              <p className="text-[#D2691E] text-lg mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? 'Try adjusting your search terms or browse all posts.' 
                  : 'Be the first to share your Umwero learning journey with the community!'}
              </p>
              <Button 
                onClick={() => setShowForm(true)} 
                className="bg-[#8B4513] hover:bg-[#A0522D] text-white shadow-lg hover:shadow-xl transition-all flex items-center gap-2 px-6"
                size="lg"
              >
                <Plus className="h-5 w-5" />
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
