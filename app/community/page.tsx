"use client"

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { MessageCircle, Calendar, Upload, Search, Trash2, MessageSquare, Video, PenTool, Loader2 } from 'lucide-react'
import { useDiscussions } from "../../hooks/useDiscussions"
import { useAuth } from "../contexts/AuthContext"
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("forum")

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <section className="relative py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-[#F3E5AB] to-[#FFFFFF]">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-[#8B4513]">
            Join the Conversation, Share Your Knowledge, and Connect with Fellow Learners
          </h1>
          <p className="text-xl text-[#D2691E] mb-8">
            Explore a vibrant community where you can ask questions, participate in live workshops, and share your Umwero creations.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="gap-2" onClick={() => {
              setActiveTab("forum")
              // Scroll to forum section after a brief delay
              setTimeout(() => {
                const forumSection = document.getElementById('discussion-forum')
                if (forumSection) {
                  forumSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }, 100)
            }}>
              <MessageSquare className="h-5 w-5" />
              Start a Discussion
            </Button>
          </div>
        </div>
        <div className="mt-12">
          <Image
            src="/pictures/for.jpg"
            alt="Community Collage"
            width={800}
            height={300}
            className="rounded-lg shadow-lg mx-auto"
          />
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1 mb-8">
            <TabsTrigger value="forum" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Discussion Forum
            </TabsTrigger>
          </TabsList>

          <TabsContent value="forum">
            <DiscussionForum />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function DiscussionForum() {
  const { discussions, loading, error, createDiscussion, fetchDiscussions } = useDiscussions()
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    script: 'LATIN' as 'UMWERO' | 'LATIN',
    category: ''
  })
  const [formErrors, setFormErrors] = useState({ title: '', content: '' })
  const [submitting, setSubmitting] = useState(false)

  const validateForm = () => {
    const errors = { title: '', content: '' }
    let isValid = true

    if (!formData.title.trim()) {
      errors.title = 'Title is required'
      isValid = false
    }
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
      title: formData.title,
      content: formData.content,
      script: formData.script,
      category: formData.category || undefined
    })

    setSubmitting(false)

    if (result) {
      setFormData({ title: '', content: '', script: 'LATIN', category: '' })
      setShowForm(false)
      alert('Discussion created successfully!')
    } else {
      alert('Failed to create discussion. Please try again.')
    }
  }

  const filteredDiscussions = discussions.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6" id="discussion-forum">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-[#8B4513]">Discussion Forum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="bg-[#8B4513] hover:bg-[#A0522D]">
              {showForm ? 'Cancel' : 'New Discussion'}
            </Button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-[#F3E5AB]/20">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter discussion title"
                  className={formErrors.title ? 'border-red-500' : ''}
                />
                {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
              </div>

              <div>
                <Label htmlFor="script">Script Type *</Label>
                <select
                  id="script"
                  value={formData.script}
                  onChange={(e) => setFormData({ ...formData, script: e.target.value as 'UMWERO' | 'LATIN' })}
                  className="w-full p-2 border rounded-md bg-white"
                >
                  <option value="LATIN">Latin (Standard)</option>
                  <option value="UMWERO">Umwero (ⵓⵎⵡⴻⵔⵓ)</option>
                </select>
                <p className="text-xs text-gray-600 mt-1">
                  {formData.script === 'UMWERO' 
                    ? 'Content will be displayed in Umwero font' 
                    : 'Content will be displayed in standard Latin font'}
                </p>
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={formData.script === 'UMWERO' 
                    ? 'Write your discussion in Umwero script...' 
                    : 'Write your discussion content...'}
                  rows={6}
                  className={`${formErrors.content ? 'border-red-500' : ''} ${
                    formData.script === 'UMWERO' ? 'font-umwero text-2xl' : ''
                  }`}
                  style={formData.script === 'UMWERO' ? { fontFamily: 'Umwero, monospace' } : {}}
                />
                {formErrors.content && <p className="text-red-500 text-sm mt-1">{formErrors.content}</p>}
                
                {formData.content && (
                  <div className="mt-2 p-3 bg-gray-50 rounded border">
                    <p className="text-xs text-gray-600 mb-2">Preview:</p>
                    <p 
                      className={`text-gray-800 ${
                        formData.script === 'UMWERO' ? 'font-umwero text-2xl' : ''
                      }`}
                      style={formData.script === 'UMWERO' ? { fontFamily: 'Umwero, monospace' } : {}}
                    >
                      {formData.content}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="category">Category (Optional)</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Learning, Culture"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting} className="bg-[#8B4513] hover:bg-[#A0522D]">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Discussion'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {loading && (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#8B4513]" />
          <p className="text-gray-600 mt-2">Loading discussions...</p>
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">Error: {error}</p>
            <Button onClick={fetchDiscussions} variant="outline" className="mt-2">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && filteredDiscussions.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchQuery ? 'No discussions found matching your search.' : 'No discussions yet. Be the first to start one!'}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {filteredDiscussions.map((discussion) => (
          <Card key={discussion.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl text-[#8B4513] mb-2">{discussion.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>By {discussion.user.fullName || discussion.user.username || 'Anonymous'}</span>
                    <span>•</span>
                    <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      discussion.script === 'umwero' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {discussion.script === 'umwero' ? 'ⵓⵎⵡⴻⵔⵓ' : 'Latin'}
                    </span>
                    {discussion.category && (
                      <>
                        <span>•</span>
                        <span className="text-[#D2691E]">{discussion.category}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p 
                className={`text-gray-700 whitespace-pre-wrap ${
                  discussion.script === 'umwero' ? 'font-umwero text-2xl' : ''
                }`}
                style={discussion.script === 'umwero' ? { fontFamily: 'Umwero, monospace' } : {}}
              >
                {discussion.content}
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {discussion._count?.comments ?? 0} comments
                </span>
                <span>{discussion.views} views</span>
                <span>{discussion.likesCount} likes</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
