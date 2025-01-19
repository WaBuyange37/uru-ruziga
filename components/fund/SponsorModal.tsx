import { useState } from 'react'
import { Modal } from '../ui/modal'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Select } from '../ui/select'

interface SponsorModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SponsorModal({ isOpen, onClose }: SponsorModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [sponsorshipLevel, setSponsorshipLevel] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send this data to your backend
    console.log('Sponsorship application:', { name, email, sponsorshipLevel })
    onClose()
  }

  const sponsorshipOptions = [
    { value: 'bronze', label: 'Bronze ($100/month)' },
    { value: 'silver', label: 'Silver ($500/month)' },
    { value: 'gold', label: 'Gold ($1000/month)' },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Become a Sponsor">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[#8B4513]">
            Name
          </label>
          <Input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#8B4513]">
            Email
          </label>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="sponsorshipLevel" className="block text-sm font-medium text-[#8B4513]">
            Sponsorship Level
          </label>
          <Select
            options={sponsorshipOptions}
            value={sponsorshipLevel}
            onChange={setSponsorshipLevel}
            placeholder="Select a level"
          />
        </div>
        <Button type="submit" className="w-full">
          Apply for Sponsorship
        </Button>
      </form>
    </Modal>
  )
}

