import { useState, useEffect } from 'react'

export function useWorkshopForm() {
  const [newWorkshop, setNewWorkshop] = useState({ title: '', description: '' })
  const [errors, setErrors] = useState({ title: '', description: '' })

  useEffect(() => {
    const storedNewWorkshop = localStorage.getItem('newWorkshop')
    if (storedNewWorkshop) {
      try {
        setNewWorkshop(JSON.parse(storedNewWorkshop))
      } catch (error) {
        console.error('Error parsing newWorkshop from localStorage:', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('newWorkshop', JSON.stringify(newWorkshop))
  }, [newWorkshop])

  const validateForm = () => {
    let isValid = true
    const newErrors = { title: '', description: '' }

    if (!newWorkshop.title.trim()) {
      newErrors.title = 'Title is required'
      isValid = false
    }
    if (!newWorkshop.description.trim()) {
      newErrors.description = 'Description is required'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  return { newWorkshop, setNewWorkshop, errors, validateForm }
}

