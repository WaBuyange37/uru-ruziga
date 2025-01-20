import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useTranslation } from "../../hooks/useTranslation"

interface DonateModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DonateModal({ isOpen, onClose }: DonateModalProps) {
  const { t } = useTranslation()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send this information to your server
    console.log("Donation info:", { name, email, message })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("makeDonation")}>
      <p className="mb-4 text-[#8B4513]">
        Be a part of shaping history—your support for Umwero ensures a legacy of cultural pride and innovation that will
        inspire generations to come.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[#8B4513]">
            {t("name")}
          </label>
          <Input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#8B4513]">
            {t("email")}
          </label>
          <Input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-[#8B4513]">
            {t("message")}
          </label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("optionalMessage")}
          />
        </div>
        <p className="text-sm text-[#D2691E]">{t("ussdInstructions")}</p>
        <p className="text-sm font-bold text-[#8B4513]">*182*1*1*0786375052#</p>
        <Button type="submit" className="w-full bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]">
          {t("submitDonation")}
        </Button>
      </form>
    </Modal>
  )
}

