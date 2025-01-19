import { useState } from 'react'

export function useCommentForm() {
  const [newComment, setNewComment] = useState('')
  const [error, setError] = useState('')

  const validateForm = () => {
    if (!newComment.trim()) {
      setError('Comment is required')
      return false
    }
    setError('')
    return true
  }

  return { newComment, setNewComment, error, validateForm }
}

