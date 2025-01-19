import { useState, useEffect } from 'react'

export function useDiscussionForm() {
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' })
  const [errors, setErrors] = useState({ title: '', content: '' })

  useEffect(() => {
    const storedNewDiscussion = localStorage.getItem('newDiscussion')
    if (storedNewDiscussion) {
      try {
        setNewDiscussion(JSON.parse(storedNewDiscussion))
      } catch (error) {
        console.error('Error parsing newDiscussion from localStorage:', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('newDiscussion', JSON.stringify(newDiscussion))
  }, [newDiscussion])

  const validateForm = () => {
    let isValid = true
    const newErrors = { title: '', content: '' }

    if (!newDiscussion.title.trim()) {
      newErrors.title = 'Title is required'
      isValid = false
    }
    if (!newDiscussion.content.trim()) {
      newErrors.content = 'Content is required'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  return { newDiscussion, setNewDiscussion, errors, validateForm }
}

