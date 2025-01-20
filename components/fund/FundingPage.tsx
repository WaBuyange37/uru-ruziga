import { FundingOptions } from "./FundingOptions"
import { useTranslation } from "../../hooks/useTranslation"

export function FundingPage() {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-[#8B4513]">{t("fundUs")}</h1>
      <FundingOptions />
      <Card className="mt-8 bg-[#F3E5AB] border-[#8B4513]">
        <CardHeader>
          <CardTitle className="text-[#8B4513]">{t("mobileMoneyPayment")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[#D2691E] mb-4">{t("mobileMoneyDescription")}</p>
          <ul className="list-disc list-inside text-[#8B4513]">
            <li>{t("mobileMoneyStep1")}</li>
            <li>{t("mobileMoneyStep2")}</li>
            <li>{t("mobileMoneyStep3")}</li>
            <li>{t("mobileMoneyStep4")}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

