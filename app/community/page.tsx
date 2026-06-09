"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, MessageCircle, Plus, Search } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Label } from "../../components/ui/label"
import { useCommunityPosts } from "../../hooks/useCommunityPosts"
import { useAuth } from "../contexts/AuthContext"
import { MediaUpload } from "../../components/discussions/MediaUpload"
import { CommunityPostCard } from "../../components/community/CommunityPostCard"
import { EmptyState, PageContainer, SectionHeader } from "../../components/ui/page"
import { kbDefinitions } from "../../lib/umwero-knowledge-base"

export default function CommunityPage() {
  return (
    <PageContainer className="bg-white">
      <DiscussionForum />
    </PageContainer>
  )
}

function DiscussionForum() {
  const { discussions, loading, error, createDiscussion, fetchDiscussions } = useCommunityPosts()
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    content: "",
    language: "en" as "en" | "rw" | "um",
    latinText: "",
    umweroText: "",
    mediaUrls: [] as string[],
  })
  const [formErrors, setFormErrors] = useState({ content: "" })
  const [submitting, setSubmitting] = useState(false)

  const filteredDiscussions = discussions.filter((d) =>
    d.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.latinText && d.latinText.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (d.umweroText && d.umweroText.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const validateForm = () => {
    const errors = { content: "" }
    let isValid = true
    if (!formData.content.trim()) {
      errors.content = "Content is required"
      isValid = false
    }
    setFormErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      alert("Please login to create a discussion")
      router.push("/login")
      return
    }

    if (!validateForm()) return

    setSubmitting(true)
    const result = await createDiscussion({
      content: formData.content,
      language: formData.language,
      latinText: formData.latinText || undefined,
      umweroText: formData.umweroText || undefined,
      mediaUrls: formData.mediaUrls,
    })
    setSubmitting(false)

    if (result) {
      setFormData({ content: "", language: "en", latinText: "", umweroText: "", mediaUrls: [] })
      setShowForm(false)
      await fetchDiscussions()
      alert("Post created successfully.")
    } else {
      alert("Failed to create post. Please try again.")
    }
  }

  return (
    <div className="space-y-6" id="discussion-forum">
      <SectionHeader
        eyebrow="Community"
        title="Learn with other Umwero students"
        description={`Real learner posts only. Ask questions and share practice notes about Umwero, the Kinyarwanda writing system. ${kbDefinitions.uruziga}`}
        action={
          <Button onClick={() => setShowForm((value) => !value)}>
            <Plus className="h-4 w-4" />
            {showForm ? "Close" : "New Post"}
          </Button>
        }
      />

      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B4513]" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-[#8B4513]/35 bg-white pl-10"
              />
            </div>
            <Badge variant="outline">{discussions.length} posts</Badge>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-black">Create an Educational Post</CardTitle>
            <CardDescription>Store text in the community database and optional media through the existing upload flow.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="language" className="mb-2 block text-base font-medium text-black">Language</Label>
                <select
                  id="language"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value as "en" | "rw" | "um" })}
                  className="h-11 w-full rounded-md border border-[#8B4513]/35 bg-white px-3 text-base text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B4513]"
                >
                  <option value="en">English</option>
                  <option value="rw">Kinyarwanda</option>
                  <option value="um">Umwero</option>
                </select>
              </div>

              <div>
                <Label htmlFor="content" className="mb-2 block text-base font-medium text-black">Post</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Share a question, practice note, or learning insight..."
                  rows={5}
                  className={`${formErrors.content ? "border-black" : "border-[#8B4513]/35"} bg-white text-black ${
                    formData.language === "um" ? "font-umwero text-xl" : ""
                  }`}
                  style={formData.language === "um" ? { fontFamily: "Umwero, monospace" } : {}}
                />
                {formErrors.content && <p className="mt-2 text-sm text-black">{formErrors.content}</p>}
              </div>

              {formData.language === "um" && (
                <div>
                  <Label htmlFor="latinText" className="mb-2 block text-base font-medium text-black">Latin Translation (Optional)</Label>
                  <Textarea
                    id="latinText"
                    value={formData.latinText}
                    onChange={(e) => setFormData({ ...formData, latinText: e.target.value })}
                    rows={3}
                    className="border-[#8B4513]/35 bg-white text-black"
                  />
                </div>
              )}

              {formData.language === "rw" && (
                <div>
                  <Label htmlFor="umweroText" className="mb-2 block text-base font-medium text-black">Umwero Translation (Optional)</Label>
                  <Textarea
                    id="umweroText"
                    value={formData.umweroText}
                    onChange={(e) => setFormData({ ...formData, umweroText: e.target.value })}
                    rows={3}
                    className="border-[#8B4513]/35 bg-white text-black font-umwero text-xl"
                    style={{ fontFamily: "Umwero, monospace" }}
                  />
                </div>
              )}

              <div>
                <Label className="mb-2 block text-base font-medium text-black">Media (Optional)</Label>
                <MediaUpload onMediaChange={(urls) => setFormData({ ...formData, mediaUrls: urls })} maxFiles={4} />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Post
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="p-10 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#8B4513]" />
            <p className="mt-3 text-base font-medium text-black">Loading community posts...</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <EmptyState
          title="Community posts could not be loaded"
          description={error}
          actionLabel="Try Again"
          onAction={fetchDiscussions}
        />
      )}

      {!loading && !error && filteredDiscussions.length === 0 && (
        <EmptyState
          title={searchQuery ? "No posts found" : "Start the conversation"}
          description={searchQuery ? "Try a different search term." : "Be the first to share a useful Umwero learning note."}
          actionLabel="New Post"
          onAction={() => setShowForm(true)}
        />
      )}

      {!loading && !error && filteredDiscussions.length > 0 && (
        <Card className="overflow-hidden">
          <div className="divide-y divide-[#8B4513]/15">
            {filteredDiscussions.map((post) => (
              <CommunityPostCard key={post.id} post={post} />
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
