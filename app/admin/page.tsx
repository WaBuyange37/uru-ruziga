"use client"
// app/admin/page.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, BookOpen, DollarSign, BarChart3, Shield, Trash2, Edit, UserCog } from 'lucide-react'
import { getPermissions, getRoleIcon, getRoleBadgeColor } from '@/lib/permissions'
import { useTranslation } from '@/hooks/useTranslation'

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

interface Donation {
  id: string
  amount: number
  currency: string
  createdAt: string
  user: {
    fullName: string
  }
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()
  const [users, setUsers] = useState<User[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

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
      const token = localStorage.getItem('token')
      
      // Fetch users
      const usersRes = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
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

      // Fetch donations
      const donationsRes = await fetch('/api/admin/donations', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (donationsRes.ok) {
        const donationsData = await donationsRes.json()
        setDonations(donationsData.donations || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        alert('User deleted successfully')
        fetchData()
      } else {
        alert('Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user')
    }
  }

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ role: newRole })
      })

      if (response.ok) {
        alert(`Role changed to ${newRole} successfully`)
        fetchData()
      } else {
        alert('Failed to change role')
      }
    } catch (error) {
      console.error('Error changing role:', error)
      alert('Error changing role')
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return
    }

    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        alert('Lesson deleted successfully')
        fetchData()
      } else {
        alert('Failed to delete lesson')
      }
    } catch (error) {
      console.error('Error deleting lesson:', error)
      alert('Error deleting lesson')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">{t('loading')}</div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          {t('accessDenied')}
        </div>
      </div>
    )
  }

  const permissions = getPermissions(user.role as any)
  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#8B4513] flex items-center gap-2">
          <Shield className="h-8 w-8" />
          {t('adminDashboard')}
        </h1>
        <p className="text-[#D2691E]">{t('welcomeBack')}, {user.fullName}! Full platform control.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{users.length}</div>
            <p className="text-xs text-blue-600 mt-1">
              {users.filter(u => u.role === 'USER').length} students, 
              {users.filter(u => u.role === 'TEACHER').length} teachers
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{lessons.length}</div>
            <p className="text-xs text-green-600 mt-1">
              {lessons.filter(l => l.isPublished).length} published
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">${totalDonations.toFixed(2)}</div>
            <p className="text-xs text-purple-600 mt-1">{donations.length} donations</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">Excellent</div>
            <p className="text-xs text-orange-600 mt-1">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[#F3E5AB]">
          <TabsTrigger value="users" className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="lessons" className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white">
            <BookOpen className="h-4 w-4 mr-2" />
            Lessons
          </TabsTrigger>
          <TabsTrigger value="funds" className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white">
            <DollarSign className="h-4 w-4 mr-2" />
            Funds
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white">
            <Shield className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage users, assign roles, and delete accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{getRoleIcon(u.role as any)}</div>
                      <div>
                        <h3 className="font-semibold text-lg">{u.fullName}</h3>
                        <p className="text-sm text-gray-600">{u.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded border ${getRoleBadgeColor(u.role as any)}`}>
                            {u.role}
                          </span>
                          <span className="text-xs text-gray-500">
                            Joined: {new Date(u.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u.id, e.target.value)}
                        className="px-3 py-1 border rounded text-sm"
                        disabled={u.id === user.id}
                      >
                        <option value="USER">Student</option>
                        <option value="TEACHER">Teacher</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => router.push(`/admin/users/${u.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={u.id === user.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lessons Tab */}
        <TabsContent value="lessons">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Management</CardTitle>
              <CardDescription>View, edit, and delete all lessons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Button onClick={() => router.push('/admin/lessons/create')} className="bg-[#8B4513]">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Create New Lesson
                </Button>
              </div>
              <div className="space-y-4">
                {lessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{lesson.title}</h3>
                      <p className="text-sm text-gray-600">{lesson.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {lesson.module}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                          Order: {lesson.order}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          lesson.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {lesson.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => router.push(`/admin/lessons/${lesson.id}`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteLesson(lesson.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Funds Tab */}
        <TabsContent value="funds">
          <Card>
            <CardHeader>
              <CardTitle>Fund Management</CardTitle>
              <CardDescription>View and manage all donations and funds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800">Total Funds</h3>
                <p className="text-3xl font-bold text-green-600">${totalDonations.toFixed(2)}</p>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold">Recent Donations</h4>
                {donations.map((donation) => (
                  <div key={donation.id} className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <p className="font-semibold">{donation.user.fullName}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        ${donation.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">{donation.currency}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>Configure platform-wide settings and advertisements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Advertisement Management</h3>
                  <p className="text-sm text-gray-600 mb-4">Coming soon...</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Platform Configuration</h3>
                  <p className="text-sm text-gray-600 mb-4">Coming soon...</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Your Permissions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(permissions).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className={`text-sm ${value ? 'text-green-600' : 'text-gray-400'}`}>
                          {value ? '✓' : '✗'}
                        </span>
                        <span className="text-sm">{key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
