// components/ui/toast.tsx
// Simple toast notification utility

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  if (typeof window === 'undefined') return

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }

  const icons = {
    success: '✓',
    error: '✗',
    info: 'ℹ'
  }

  const toast = document.createElement('div')
  toast.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-[9999] animate-in fade-in slide-in-from-top-2 max-w-md`
  toast.textContent = `${icons[type]} ${message}`
  
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.classList.add('animate-out', 'fade-out', 'slide-out-to-top-2')
    setTimeout(() => toast.remove(), 300)
  }, type === 'error' ? 5000 : 3000)
}
