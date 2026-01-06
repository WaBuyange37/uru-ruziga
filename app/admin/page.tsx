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
import { Users, BookOpen, Upload, BarChart3, Settings } from 'lucide-react'

interface User {
  id: string
  fullName: string
  email: string
  role: string
  createdAt: string
}

interface Lesson {
  id: string
  title: string
  description: string
  module: string
  order: number
  isPublished: boolean
  createdAt: string
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)

  // New lesson form
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    content: '',
    module: 'beginner',
    order: 1,
    duration: '',
    images: [] as string[],
    videoUrl: ''
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    fetchData()
  }, [isAuthenticated, user, router])

  const fetchData = async () => {
    try {
      // Fetch users (you'll need to create this API)
      const usersRes = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users || [])
      }

      // Fetch lessons
      const lessonsRes = await fetch('/api/lessons')
      if (lessonsRes.ok) {
        const lessonsData = await lessonsRes.json()
        setLessons(lessonsData.lessons || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
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
          module: 'beginner',
          order: 1,
          duration: '',
          images: [],
          videoUrl: ''
        })
        fetchData() // Refresh data
      } else {
        alert('Failed to create lesson')
      }
    } catch (error) {
      console.error('Error creating lesson:', error)
      alert('Error creating lesson')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading admin dashboard...</div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          Access denied. Admin privileges required.
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#8B4513]">Admin Dashboard</h1>
        <p className="text-[#D2691E]">Welcome, {user.fullName}! Manage your Umwero platform.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lessons.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Lessons</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lessons.filter(l => l.isPublished).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'STUDENT').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="lessons" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="create-lesson">Create Lesson</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons">
          <Card>
            <CardHeader>
              <CardTitle>Manage Lessons</CardTitle>
              <CardDescription>View and manage all Umwero lessons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h3 className="font-semibold">{lesson.title}</h3>
                      <p className="text-sm text-gray-600">{lesson.description}</p>
                      <p className="text-xs text-gray-500">
                        Module: {lesson.module} | Order: {lesson.order} | 
                        Status: {lesson.isPublished ? 'Published' : 'Draft'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="destructive">Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage all registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h3 className="font-semibold">{user.fullName}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">
                        Role: {user.role} | Joined: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">View Progress</Button>
                      <Button size="sm" variant="outline">Manage</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create-lesson">
          <Card>
            <CardHeader>
              <CardTitle>Create New Lesson</CardTitle>
              <CardDescription>Add a new Umwero lesson to the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateLesson} className="space-y-4">
                <div>
                  <Label htmlFor="title">Lesson Title</Label>
                  <Input
                    id="title"
                    value={newLesson.title}
                    onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newLesson.description}
                    onChange={(e) => setNewLesson({...newLesson, description: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="content">Lesson Content</Label>
                  <Textarea
                    id="content"
                    value={newLesson.content}
                    onChange={(e) => setNewLesson({...newLesson, content: e.target.value})}
                    rows={6}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="module">Module</Label>
                    <select
                      id="module"
                      value={newLesson.module}
                      onChange={(e) => setNewLesson({...newLesson, module: e.target.value})}
                      className="w-full p-2 border rounded"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="order">Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={newLesson.order}
                      onChange={(e) => setNewLesson({...newLesson, order: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    placeholder="e.g., 20 min"
                    value={newLesson.duration}
                    onChange={(e) => setNewLesson({...newLesson, duration: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="videoUrl">Video URL (optional)</Label>
                  <Input
                    id="videoUrl"
                    placeholder="YouTube or video URL"
                    value={newLesson.videoUrl}
                    onChange={(e) => setNewLesson({...newLesson, videoUrl: e.target.value})}
                  />
                </div>
                <Button type="submit" className="w-full">Create Lesson</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>Configure platform-wide settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Settings panel coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}