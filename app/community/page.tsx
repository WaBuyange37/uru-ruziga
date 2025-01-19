"use client"

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { MessageCircle, Calendar, Upload, Search, Trash2, MessageSquare, Video, PenTool } from 'lucide-react'
import { useDiscussionForm } from "../../hooks/useDiscussionForm"
import { useCommentForm } from "../../hooks/useCommentForm"
import { useWorkshopForm } from "../../hooks/useWorkshopForm"
import { CardSection } from "../../components/CardSection"
import Image from 'next/image'

interface Discussion {
  id: string;
  author: string;
  title: string;
  content: string;
  comments: Comment[];
  createdAt: string;
}

interface Comment {
  id: string;
  author: string;
  content: string;
}

interface Workshop {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  host: string;
}

interface Submission {
  id: string;
  title: string;
  author: string;
  type: string;
  fileUrl: string;
}

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("forum")

  useEffect(() => {
    // Set the default tab to "forum" when the component mounts
    setActiveTab("forum")
  }, [])

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-[#F3E5AB] to-[#FFFFFF]">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-[#8B4513]">
            Join the Conversation, Share Your Knowledge, and Connect with Fellow Learners
          </h1>
          <p className="text-xl text-[#D2691E] mb-8">
            Explore a vibrant community where you can ask questions, participate in live workshops, and share your Umwero creations. Together, we're building a space for learning, culture, and growth.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="gap-2" onClick={() => setActiveTab("forum")}>
              <MessageSquare className="h-5 w-5" />
              Start a Discussion
            </Button>
            <Button size="lg" variant="outline" className="gap-2" onClick={() => setActiveTab("workshops")}>
              <Video className="h-5 w-5" />
              Join a Live Workshop
            </Button>
            <Button size="lg" variant="outline" className="gap-2" onClick={() => setActiveTab("submissions")}>
              <PenTool className="h-5 w-5" />
              Share Your Creation
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="forum" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Discussion Forum
            </TabsTrigger>
            <TabsTrigger value="workshops" className="gap-2">
              <Calendar className="h-4 w-4" />
              Live Workshops
            </TabsTrigger>
            <TabsTrigger value="submissions" className="gap-2">
              <Upload className="h-4 w-4" />
              User Submissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="forum">
            <DiscussionForum />
          </TabsContent>

          <TabsContent value="workshops">
            <LiveWorkshops />
          </TabsContent>

          <TabsContent value="submissions">
            <UserSubmissions />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function DiscussionForum() {
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [activeDiscussion, setActiveDiscussion] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { newDiscussion, setNewDiscussion, errors: discussionErrors, validateForm: validateDiscussion } = useDiscussionForm()
  const { newComment, setNewComment, error: commentError, validateForm: validateComment } = useCommentForm()

  useEffect(() => {
    // Load discussions from localStorage when the component mounts
    const storedDiscussions = localStorage.getItem('discussions')
    if (storedDiscussions) {
      try {
        setDiscussions(JSON.parse(storedDiscussions))
      } catch (error) {
        console.error('Error parsing discussions from localStorage:', error)
      }
    }

    const storedActiveDiscussion = localStorage.getItem('activeDiscussion')
    if (storedActiveDiscussion) {
      setActiveDiscussion(storedActiveDiscussion)
    }
  }, [])

  useEffect(() => {
    // Save discussions to localStorage whenever they change
    localStorage.setItem('discussions', JSON.stringify(discussions))
  }, [discussions])

  useEffect(() => {
    if (activeDiscussion) {
      localStorage.setItem('activeDiscussion', activeDiscussion)
    } else {
      localStorage.removeItem('activeDiscussion')
    }
  }, [activeDiscussion])

  const addDiscussion = () => {
    if (validateDiscussion()) {
      const discussion: Discussion = {
        id: Date.now().toString(),
        author: 'Current User', // TODO: Replace with actual user data once authentication is in place
        title: newDiscussion.title,
        content: newDiscussion.content,
        comments: [],
        createdAt: new Date().toISOString()
      }
      const updatedDiscussions = [discussion, ...discussions]
      setDiscussions(updatedDiscussions)
      setNewDiscussion({ title: '', content: '' })
      localStorage.setItem('discussions', JSON.stringify(updatedDiscussions))
      localStorage.removeItem('newDiscussion')
      setActiveDiscussion(discussion.id)
    }
  }

  const addComment = (discussionId: string) => {
    if (validateComment()) {
      const updatedDiscussions = discussions.map(discussion => {
        if (discussion.id === discussionId) {
          return {
            ...discussion,
            comments: [
              ...discussion.comments,
              {
                id: Date.now().toString(),
                author: 'Current User', // TODO: Replace with actual user data once authentication is in place
                content: newComment
              }
            ]
          }
        }
        return discussion
      })
      setDiscussions(updatedDiscussions)
      localStorage.setItem('discussions', JSON.stringify(updatedDiscussions))
      setNewComment('')
    }
  }

  const deleteComment = (discussionId: string, commentId: string) => {
    const updatedDiscussions = discussions.map(discussion => {
      if (discussion.id === discussionId) {
        return {
          ...discussion,
          comments: discussion.comments.filter(comment => comment.id !== commentId)
        }
      }
      return discussion
    })
    setDiscussions(updatedDiscussions)
    localStorage.setItem('discussions', JSON.stringify(updatedDiscussions))
  }

  const filteredDiscussions = discussions.filter(discussion =>
    discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    discussion.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <CardSection title="Start a New Discussion">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); addDiscussion(); }}>
          <div>
            <Input 
              placeholder="Discussion Title" 
              className="bg-white" 
              value={newDiscussion.title}
              onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
              aria-label="Discussion Title"
            />
            {discussionErrors.title && <p className="text-red-500 text-sm mt-1">{discussionErrors.title}</p>}
          </div>
          <div>
            <Textarea 
              placeholder="What's on your mind?" 
              className="bg-white" 
              value={newDiscussion.content}
              onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
              aria-label="Discussion Content"
            />
            {discussionErrors.content && <p className="text-red-500 text-sm mt-1">{discussionErrors.content}</p>}
          </div>
          <Button type="submit">Post Discussion</Button>
        </form>
      </CardSection>

      <CardSection title="Recent Discussions">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#8B4513]" />
            <Input 
              placeholder="Search discussions..." 
              className="pl-10 bg-white" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search discussions"
            />
          </div>
        </div>
        <div className="space-y-4">
          {filteredDiscussions.map((discussion) => (
            <CardSection key={discussion.id} title={discussion.title} description={`Posted by ${discussion.author} on ${new Date(discussion.createdAt).toLocaleDateString()}`}>
              <p className="text-[#D2691E] mb-4">{discussion.content}</p>
              <div className="flex justify-between items-center">
                <span className="text-[#8B4513]">{discussion.comments.length} comments</span>
                <Button variant="outline" onClick={() => setActiveDiscussion(activeDiscussion === discussion.id ? null : discussion.id)}>
                  {activeDiscussion === discussion.id ? 'Hide Comments' : 'View Comments'}
                </Button>
              </div>
              {activeDiscussion === discussion.id && (
                <div className="mt-4 space-y-4">
                  {discussion.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-100 p-2 rounded-md">
                      <div className="flex justify-between items-start">
                        <p className="text-[#8B4513]"><strong>{comment.author}:</strong> {comment.content}</p>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteComment(discussion.id, comment.id)}
                          aria-label="Delete comment"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <form onSubmit={(e) => { e.preventDefault(); addComment(discussion.id); }} className="flex gap-2">
                    <Input 
                      placeholder="Add a comment..." 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-grow"
                      aria-label="Add a comment"
                    />
                    <Button type="submit">Comment</Button>
                  </form>
                  {commentError && <p className="text-red-500 text-sm mt-1">{commentError}</p>}
                </div>
              )}
            </CardSection>
          ))}
        </div>
      </CardSection>
    </div>
  )
}

function LiveWorkshops() {
  const [workshops, setWorkshops] = useState<Workshop[]>([
    { id: 1, title: "Umwero Calligraphy Basics", description: "Learn the basics of Umwero calligraphy", date: "2023-06-15", time: "14:00 GMT", host: "Master Calligrapher" },
    { id: 2, title: "Cultural Significance of Umwero Symbols", description: "Explore the cultural meaning behind Umwero symbols", date: "2023-06-22", time: "16:00 GMT", host: "Cultural Historian" },
  ])
  const { newWorkshop, setNewWorkshop, errors, validateForm } = useWorkshopForm()

  useEffect(() => {
    const storedWorkshops = localStorage.getItem('workshops')
    if (storedWorkshops) {
      try {
        setWorkshops(JSON.parse(storedWorkshops))
      } catch (error) {
        console.error('Error parsing workshops from localStorage:', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('workshops', JSON.stringify(workshops))
  }, [workshops])

  const addWorkshop = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      const workshop: Workshop = {
        id: Date.now(),
        title: newWorkshop.title,
        description: newWorkshop.description,
        date: 'TBD',
        time: 'TBD',
        host: 'TBD'
      }
      setWorkshops([...workshops, workshop])
      setNewWorkshop({ title: '', description: '' })
      localStorage.removeItem('newWorkshop')
    }
  }

  return (
    <div className="space-y-6">
      <CardSection title="Upcoming Live Workshops">
        <div className="space-y-4">
          {workshops.map((workshop) => (
            <CardSection key={workshop.id} title={workshop.title} description={`Hosted by ${workshop.host}`}>
              <p className="text-[#D2691E] mb-4">Date: {workshop.date} at {workshop.time}</p>
              <p className="text-[#8B4513] mb-4">{workshop.description}</p>
              <Button>Join Workshop</Button>
            </CardSection>
          ))}
        </div>
      </CardSection>

      <CardSection title="Suggest a Workshop">
        <form className="space-y-4" onSubmit={addWorkshop}>
          <div>
            <Input 
              placeholder="Workshop Title" 
              className="bg-white"
              value={newWorkshop.title}
              onChange={(e) => setNewWorkshop({ ...newWorkshop, title: e.target.value })}
              aria-label="Workshop Title"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>
          <div>
            <Textarea 
              placeholder="Workshop Description" 
              className="bg-white"
              value={newWorkshop.description}
              onChange={(e) => setNewWorkshop({ ...newWorkshop, description: e.target.value })}
              aria-label="Workshop Description"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>
          <Button type="submit">Submit Suggestion</Button>
        </form>
      </CardSection>
    </div>
  )
}

function UserSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [newSubmission, setNewSubmission] = useState({ title: '', file: null as File | null })
  const [errors, setErrors] = useState({ title: '', file: '' })

  useEffect(() => {
    const storedSubmissions = localStorage.getItem('submissions')
    if (storedSubmissions) {
      try {
        setSubmissions(JSON.parse(storedSubmissions))
      } catch (error) {
        console.error('Error parsing submissions from localStorage:', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('submissions', JSON.stringify(submissions))
  }, [submissions])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewSubmission({ ...newSubmission, file: e.target.files[0] })
    }
  }

  const addSubmission = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({ title: '', file: '' })

    if (!newSubmission.title.trim()) {
      setErrors(prev => ({ ...prev, title: 'Title is required' }))
    }
    if (!newSubmission.file) {
      setErrors(prev => ({ ...prev, file: 'File is required' }))
    }

    if (newSubmission.title.trim() && newSubmission.file) {
      const submission: Submission = {
        id: Date.now().toString(),
        title: newSubmission.title,
        author: 'Current User', // TODO: Replace with actual user data once authentication is in place
        type: newSubmission.file.type,
        fileUrl: URL.createObjectURL(newSubmission.file)
      }
      setSubmissions([submission, ...submissions])
      setNewSubmission({ title: '', file: null })
    }
  }

  return (
    <div className="space-y-6">
      <CardSection title="Submit Your Umwero Creation">
        <form className="space-y-4" onSubmit={addSubmission}>
          <div>
            <Input 
              placeholder="Submission Title" 
              className="bg-white" 
              value={newSubmission.title}
              onChange={(e) => setNewSubmission({ ...newSubmission, title: e.target.value })}
              aria-label="Submission Title"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>
          <div>
            <Input 
              id="file-upload" 
              type="file" 
              className="bg-white" 
              onChange={handleFileChange}
              aria-label="Upload File"
            />
            {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}
          </div>
          <Button type="submit">Upload</Button>
        </form>
      </CardSection>

      <CardSection title="Recent Submissions">
        <div className="space-y-4">
          {submissions.map((submission) => (
            <CardSection key={submission.id} title={submission.title} description={`By ${submission.author}`}>
              <p className="text-[#D2691E] mb-4">Type: {submission.type}</p>
              {submission.type.startsWith('image/') ? (
                <img src={submission.fileUrl} alt={submission.title} className="max-w-full h-auto" />
              ) : (
                <Button variant="outline" onClick={() => window.open(submission.fileUrl, '_blank')}>
                  View Submission
                </Button>
              )}
            </CardSection>
          ))}
        </div>
      </CardSection>
    </div>
  )
}

