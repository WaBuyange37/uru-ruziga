import { useState } from "react"
import { Modal } from "../ui/modal"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Select } from "../ui/select"
import { useTranslation } from "../../hooks/useTranslation"
import Image from "next/image"
import { requestToPay, getPaymentStatus } from "@/lib/momo-api"

interface SponsorModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SponsorModal({ isOpen, onClose }: SponsorModalProps) {
  const { t } = useTranslation()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [sponsorshipLevel, setSponsorshipLevel] = useState("")
  const [ussdCode, setUssdCode] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = sponsorshipLevelToAmount(sponsorshipLevel)
    try {
      const { referenceId } = await requestToPay(
        amount,
        "RWF",
        "0786375052", // Replace with the actual MTN MoMo number
        `Sponsorship payment of ${amount} RWF to Uruziga`,
        `Thank you for your ${sponsorshipLevel} sponsorship!`,
      )
      setUssdCode(`*182*1*1*0786375052*${amount}#`)

      // Poll for payment status
      const checkStatus = async () => {
        const status = await getPaymentStatus(referenceId)
        if (status.status === "SUCCESSFUL") {
          alert("Payment successful! Thank you for your sponsorship.")
        } else if (status.status === "FAILED") {
          alert("Payment failed. Please try again.")
        } else {
          // Payment still pending, check again in 5 seconds
          setTimeout(checkStatus, 5000)
        }
      }
      checkStatus()
    } catch (error) {
      console.error("Error processing payment:", error)
      alert("An error occurred while processing your payment. Please try again.")
    }
  }

  const sponsorshipOptions = [
    { value: "bronze", label: t("bronzeSponsor") },
    { value: "silver", label: t("silverSponsor") },
    { value: "gold", label: t("goldSponsor") },
  ]

  const sponsorshipLevelToAmount = (level: string): number => {
    switch (level) {
      case "bronze":
        return 100000 // 100 USD in RWF
      case "silver":
        return 500000 // 500 USD in RWF
      case "gold":
        return 1000000 // 1000 USD in RWF
      default:
        return 0
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("becomeSponsor")}>
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
          <label htmlFor="sponsorshipLevel" className="block text-sm font-medium text-[#8B4513]">
            {t("sponsorshipLevel")}
          </label>
          <Select
            options={sponsorshipOptions}
            value={sponsorshipLevel}
            onChange={setSponsorshipLevel}
            placeholder={t("selectLevel")}
          />
        </div>
        <Button type="submit" className="w-full bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]">
          {t("applyForSponsorship")}
        </Button>
      </form>
      {ussdCode && (
        <div className="mt-4 space-y-4">
          <p className="font-semibold text-[#D2691E]">{t("ussdInstructions")}</p>
          <div className="bg-gray-100 p-4 rounded-md text-center">
            <span className="text-xl font-bold">{ussdCode}</span>
          </div>
          <Image src="/ussd-screenshot.png" alt="USSD Screenshot" width={300} height={600} className="mx-auto" />
          <p className="text-[#D2691E]">{t("useMtnMobileMoney")} 0786375052 Umwero</p>
        </div>
      )}
    </Modal>
  )
}

