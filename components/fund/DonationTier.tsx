import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DonateModal } from "./DonateModal"
import { useTranslation } from "../../hooks/useTranslation"

const donationTiers = [
  {
    amount: 20000,
    title: "Supporter",
    description: "Thank you for your contribution. You will receive a Pen and a Personalized Thank You Card.",
    reward: "Pen + Thank You Card",
  },
  {
    amount: 50000,
    title: "Contributor",
    description: "Your support goes a long way! You'll receive a T-shirt and a Personalized Thank You Card.",
    reward: "T-shirt + Thank You Card",
  },
  {
    amount: 100000,
    title: "Patron",
    description: "You're making a big impact! You will receive a Hoodie and an Agenda.",
    reward: "Hoodie + Agenda",
  },
  {
    amount: 200000,
    title: "Champion",
    description: "Thank you for being a Champion! You'll get a Clock and Exclusive Access to events.",
    reward: "Clock + Exclusive Access",
  },
]

interface DonationTiersProps {
  onSelectTier: (amount: number) => void
}

export function DonationTiers({ onSelectTier }: DonationTiersProps) {
  const { t } = useTranslation()
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false)

  const handleSelectTier = (amount: number) => {
    setSelectedAmount(amount)
    setIsDonateModalOpen(true)
    onSelectTier(amount)
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {donationTiers.map((tier) => (
          <Card key={tier.amount} className="bg-[#F3E5AB] border-[#8B4513]">
            <CardHeader>
              <CardTitle className="text-[#8B4513]">{t(tier.title)}</CardTitle>
              <CardDescription className="text-[#D2691E]">{t(tier.description)}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]"
                onClick={() => handleSelectTier(tier.amount)}
              >
                {t("donate")} {tier.amount} RWF
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <DonateModal
        isOpen={isDonateModalOpen}
        onClose={() => setIsDonateModalOpen(false)}
        initialAmount={selectedAmount || 0}
      />
    </>
  )
}

