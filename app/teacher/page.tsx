"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Users, Plus, Edit, Eye } from 'lucide-react'
import { getPermissions } from '@/lib/permissions'
import { useTranslation } from '@/hooks/useTranslation'

interface Lesson {
  id: string
  title: string
  description: string
  module: string
  type: string
  order: number
  duration: number
  isPublished: boolean
  createdAt: string
}

export default function TeacherDashboard() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    content: '',
    module: 'BEGINNER',
    type: 'VOWEL',
    order: 1,
    duration: 10,
    videoUrl: '',
    thumbnailUrl: '',
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (user?.role !== 'TEACHER' && user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    fetchLessons()
  }, [isAuthenticated, user, router])

  const fetchLessons = async () => {
    try {
      const response = await fetch('/api/lessons')
      if (response.ok) {
        const data = await response.json()
        setLessons(data.lessons || [])
      }
    } catch (error) {
      console.error('Error fetching lessons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newLesson)
      })

      if (response.ok) {
        alert('Lesson created successfully!')
        setNewLesson({
          title: '',
          description: '',
          content: '',
          module: 'BEGINNER',
          type: 'VOWEL',
          order: 1,
          duration: 10,
          videoUrl: '',
          thumbnailUrl: '',
        })
        setShowCreateForm(false)
        fetchLessons()
      } else {
        const error = await response.json()
        alert(`Failed to create lesson: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating lesson:', error)
      alert('Error creating lesson')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">{t('loading')}</div>
      </div>
    )
  }

  if (!isAuthenticated || (user?.role !== 'TEACHER' && user?.role !== 'ADMIN')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          Access denied. Teacher privileges required.
        </div>
      </div>
    )
  }

  const permissions = getPermissions(user.role as any)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#8B4513] flex items-center gap-2">
          👨‍🏫 Teacher Dashboard
        </h1>
        <p className="text-[#D2691E]">Welcome, {user.fullName}! Create and manage lessons for your students.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Lessons</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{lessons.length}</div>
            <p className="text-xs text-blue-600 mt-1">
              {lessons.filter(l => l.isPublished).length} published
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">-</div>
            <p className="text-xs text-green-600 mt-1">Coming soon</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Eye className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">-</div>
            <p className="text-xs text-purple-600 mt-1">Coming soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="lessons" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-[#F3E5AB]">
          <TabsTrigger value="lessons" className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white">
            <BookOpen className="h-4 w-4 mr-2" />
            My Lessons
          </TabsTrigger>
          <TabsTrigger value="create" className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Lesson
          </TabsTrigger>
        </TabsList>

        {/* Lessons Tab */}
        <TabsContent value="lessons">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Management</CardTitle>
              <CardDescription>View and edit your created lessons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lessons.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No lessons yet. Create your first lesson!</p>
                  </div>
                ) : (
                  lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div>
                        <h3 className="font-semibold text-lg">{lesson.title}</h3>
                        <p className="text-sm text-gray-600">{lesson.description}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            {lesson.module}
                          </span>
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                            {lesson.type}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                            {lesson.duration} min
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            lesson.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {lesson.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Lesson Tab */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Lesson</CardTitle>
              <CardDescription>Add a new Umwero lesson for your students</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateLesson} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Lesson Title *</Label>
                    <Input
                      id="title"
                      value={newLesson.title}
                      onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                      placeholder="e.g., Vowel: A"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newLesson.duration}
                      onChange={(e) => setNewLesson({...newLesson, duration: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    value={newLesson.description}
                    onChange={(e) => setNewLesson({...newLesson, description: e.target.value})}
                    placeholder="Brief description of the lesson"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="content">Lesson Content (JSON format) *</Label>
                  <Textarea
                    id="content"
                    value={newLesson.content}
                    onChange={(e) => setNewLesson({...newLesson, content: e.target.value})}
                    rows={8}
                    placeholder='{"vowel": "a", "umwero": "\"", "examples": []}'
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter lesson content in JSON format</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="module">Module *</Label>
                    <select
                      id="module"
                      value={newLesson.module}
                      onChange={(e) => setNewLesson({...newLesson, module: e.target.value})}
                      className="w-full p-2 border rounded"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="type">Type *</Label>
                    <select
                      id="type"
                      value={newLesson.type}
                      onChange={(e) => setNewLesson({...newLesson, type: e.target.value})}
                      className="w-full p-2 border rounded"
                    >
                      <option value="VOWEL">Vowel</option>
                      <option value="CONSONANT">Consonant</option>
                      <option value="WORD">Word</option>
                      <option value="SENTENCE">Sentence</option>
                      <option value="GRAMMAR">Grammar</option>
                      <option value="CULTURE">Culture</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="order">Order *</Label>
                    <Input
                      id="order"
                      type="number"
                      value={newLesson.order}
                      onChange={(e) => setNewLesson({...newLesson, order: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="videoUrl">Video URL (optional)</Label>
                    <Input
                      id="videoUrl"
                      value={newLesson.videoUrl}
                      onChange={(e) => setNewLesson({...newLesson, videoUrl: e.target.value})}
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="thumbnailUrl">Thumbnail URL (optional)</Label>
                    <Input
                      id="thumbnailUrl"
                      value={newLesson.thumbnailUrl}
                      onChange={(e) => setNewLesson({...newLesson, thumbnailUrl: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-[#8B4513] hover:bg-[#A0522D]">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Lesson
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
