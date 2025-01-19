import { useState, useEffect } from 'react'

interface Discussion {
  id: string;
  author: string;
  title: string;
  content: string;
  comments: Comment[];
}

interface Comment {
  id: string;
  author: string;
  content: string;
}

export function useDiscussions() {
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' })
  const [newComment, setNewComment] = useState('')
  const [activeDiscussion, setActiveDiscussion] = useState<string | null>(null)

  useEffect(() => {
    const storedDiscussions = localStorage.getItem('discussions')
    if (storedDiscussions) {
      try {
        setDiscussions(JSON.parse(storedDiscussions))
      } catch (error) {
        console.error('Error parsing discussions from localStorage:', error)
        setDiscussions([])
      }
    }

    const storedNewDiscussion = localStorage.getItem('newDiscussion')
    if (storedNewDiscussion) {
      try {
        setNewDiscussion(JSON.parse(storedNewDiscussion))
      } catch (error) {
        console.error('Error parsing newDiscussion from localStorage:', error)
        setNewDiscussion({ title: '', content: '' })
      }
    }

    const storedActiveDiscussion = localStorage.getItem('activeDiscussion')
    if (storedActiveDiscussion) {
      setActiveDiscussion(storedActiveDiscussion)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('discussions', JSON.stringify(discussions))
  }, [discussions])

  useEffect(() => {
    localStorage.setItem('newDiscussion', JSON.stringify(newDiscussion))
  }, [newDiscussion])

  useEffect(() => {
    if (activeDiscussion) {
      localStorage.setItem('activeDiscussion', activeDiscussion)
    } else {
      localStorage.removeItem('activeDiscussion')
    }
  }, [activeDiscussion])

  const addDiscussion = () => {
    if (newDiscussion.title && newDiscussion.content) {
      const discussion: Discussion = {
        id: Date.now().toString(),
        author: 'Current User',
        title: newDiscussion.title,
        content: newDiscussion.content,
        comments: []
      }
      const updatedDiscussions = [discussion, ...discussions]
      setDiscussions(updatedDiscussions)
      localStorage.setItem('discussions', JSON.stringify(updatedDiscussions))
      setNewDiscussion({ title: '', content: '' })
      localStorage.removeItem('newDiscussion')
      setActiveDiscussion(discussion.id)
    }
  }

  const addComment = (discussionId: string) => {
    if (newComment) {
      const updatedDiscussions = discussions.map(discussion => {
        if (discussion.id === discussionId) {
          return {
            ...discussion,
            comments: [
              ...discussion.comments,
              {
                id: Date.now().toString(),
                author: 'Current User',
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

  return {
    discussions,
    newDiscussion,
    setNewDiscussion,
    newComment,
    setNewComment,
    activeDiscussion,
    setActiveDiscussion,
    addDiscussion,
    addComment,
    deleteComment
  }
}

