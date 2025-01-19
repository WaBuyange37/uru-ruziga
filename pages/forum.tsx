import { useState, useEffect } from 'react'
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"

interface Post {
  _id: string
  title: string
  content: string
  author: string
  createdAt: string
}

export default function ForumPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    // Fetch posts from API
    // This is a placeholder and should be replaced with actual API call
    setPosts([
      { _id: '1', title: 'Welcome to Uruziga Forum', content: 'Discuss all things Umwero here!', author: 'Admin', createdAt: new Date().toISOString() },
    ])
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Submit new post to API
    // This is a placeholder and should be replaced with actual API call
    console.log('Submitting new post:', { title, content })
    setTitle('')
    setContent('')
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-[#8B4513]">Uruziga Community Forum</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create a New Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Textarea
                placeholder="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
              <Button type="submit">Submit Post</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post._id}>
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{post.content}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Posted by {post.author} on {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

