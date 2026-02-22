// components/discussions/CommentForm.tsx
"use client"

import { useState } from 'react'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Loader2 } from 'lucide-react'

interface CommentFormProps {
  onSubmit: (content: string, script: 'LATIN' | 'UMWERO') => Promise<void>
  loading?: boolean
}

export function CommentForm({ onSubmit, loading = false }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [script, setScript] = useState<'LATIN' | 'UMWERO'>('LATIN')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    await onSubmit(content, script)
    setContent('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2 items-center">
        <select
          value={script}
          onChange={(e) => setScript(e.target.value as 'LATIN' | 'UMWERO')}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-full bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="LATIN">Latin</option>
          <option value="UMWERO">ⵓⵎⵡⴻⵔⵓ</option>
        </select>
      </div>
      
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={script === 'UMWERO' ? 'Write your comment in Umwero...' : 'Write your comment...'}
        rows={3}
        className={`resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl ${
          script === 'UMWERO' ? 'font-umwero text-xl' : 'text-[15px]'
        }`}
        style={script === 'UMWERO' ? { fontFamily: 'Umwero, monospace' } : {}}
        disabled={loading}
      />
      
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={loading || !content.trim()}
          size="sm"
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6 font-semibold disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            'Reply'
          )}
        </Button>
      </div>
    </form>
  )
}
