import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslation } from "../../hooks/useTranslation"
import { ContactModal } from "@/components/fund/ContactModal"
import { DonateModal } from "@/components/fund/DonateModal"
import { SponsorModal } from "@/components/fund/SponsorModal"
import { DonationTiers } from "@/components/fund/DonationTiers"

export function FundingOptions() {
  const { t } = useTranslation()
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)

  const handleSelectTier = (amount: number) => {
    setSelectedAmount(amount)
    setIsDonateModalOpen(true)
  }

  return (
    <div className="space-y-8">
      <Card className="max-w-2xl mx-auto bg-[#F3E5AB] border-[#8B4513]">
        <CardHeader>
          <CardTitle className="text-[#8B4513]">{t("supportOurMission")}</CardTitle>
          <CardDescription className="text-[#D2691E]">{t("donationDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => setIsDonateModalOpen(true)}
            className="w-full bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]"
          >
            {t("makeDonation")}
          </Button>
          <Button
            onClick={() => setIsContactModalOpen(true)}
            className="w-full bg-[#D2691E] text-[#F3E5AB] hover:bg-[#CD853F]"
          >
            {t("contactUs")}
          </Button>
          <Button
            onClick={() => setIsSponsorModalOpen(true)}
            className="w-full bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]"
          >
            {t("becomeSponsor")}
          </Button>
        </CardContent>
      </Card>

      <DonationTiers onSelectTier={handleSelectTier} />

      <DonateModal
        isOpen={isDonateModalOpen}
        onClose={() => setIsDonateModalOpen(false)}
        initialAmount={selectedAmount || 0}
      />
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
      <SponsorModal isOpen={isSponsorModalOpen} onClose={() => setIsSponsorModalOpen(false)} />
    </div>
  )
}

