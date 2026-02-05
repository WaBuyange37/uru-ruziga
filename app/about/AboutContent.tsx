"use client"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import Link from "next/link"
import { useTranslation } from "../../hooks/useTranslation"
import { useLanguage } from "../contexts/LanguageContext"
import { UmweroText, UmweroHeading, UmweroParagraph } from "../../components/UmweroText"

export default function AboutContent() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const isUmwero = language === 'um'
  
  const getLanguageStyle = () => {
    return isUmwero ? { fontFamily: "'UMWEROalpha', serif" } : {}
  }
  
  return (
    <div className="container mx-auto px-4 py-8 bg-[#FFFFFF]">
      <UmweroHeading level={1} className="text-4xl font-bold mb-6 text-center text-[#8B4513]">
        <UmweroText>{t("umweroMovement")}</UmweroText>: <UmweroText>{t("culturalRenaissance")}</UmweroText>
      </UmweroHeading>

      <Card className="mb-8 bg-[#F3E5AB] border-[#8B4513]">
        <CardHeader>
          <CardTitle className="text-[#8B4513]">
            <UmweroText>{t("ourMission")}</UmweroText>
          </CardTitle>
          <CardDescription className="text-[#D2691E]">
            <UmweroText>{t("preservingKinyarwandaCulture")}</UmweroText>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UmweroParagraph className="mb-4 text-[#8B4513]">
            {t("umweroMovementDescription")}
          </UmweroParagraph>
          <UmweroParagraph className="mb-4 text-[#8B4513]">
            {t("umweroAlphabetDescription")}
          </UmweroParagraph>
          <blockquote className="border-l-4 border-[#8B4513] pl-4 italic my-4 text-[#D2691E]">
            <UmweroText style={getLanguageStyle()}>
              {t("umweroQuote")}
            </UmweroText>
          </blockquote>
        </CardContent>
      </Card>

      <Card className="mb-8 bg-[#F3E5AB] border-[#8B4513]">
        <CardHeader>
          <CardTitle className="text-[#8B4513]">
            <UmweroText>{t("ourVision")}</UmweroText>
          </CardTitle>
          <CardDescription className="text-[#D2691E]">
            <UmweroText>{t("buildingCulturalSchool")}</UmweroText>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UmweroParagraph className="mb-4 text-[#8B4513]">
            {t("visionDescription")}
          </UmweroParagraph>
          <UmweroParagraph className="mb-4 text-[#8B4513]">
            {t("schoolDescription")}
          </UmweroParagraph>
        </CardContent>
      </Card>

      <Card className="bg-[#F3E5AB] border-[#8B4513]">
        <CardHeader>
          <CardTitle className="text-[#8B4513]">
            <UmweroText>{t("joinMovement")}</UmweroText>
          </CardTitle>
          <CardDescription className="text-[#D2691E]">
            <UmweroText>{t("bePartOfRenaissance")}</UmweroText>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UmweroParagraph className="mb-4 text-[#8B4513]">
            {t("movementParticipationDescription")}
          </UmweroParagraph>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild>
              <Link href="/learn">
                <UmweroText>{t("startLearningUmwero")}</UmweroText>
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/fund">
                <UmweroText>{t("supportOurMission")}</UmweroText>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add global CSS for Umwero font when language is 'um' */}
      {isUmwero && (
        <style jsx global>{`
          .umwero-font {
            font-family: 'UMWEROalpha', serif !important;
          }
          
          /* Apply Umwero font to buttons when in Umwero mode */
          .umwero-font button,
          .umwero-font .button {
            font-family: 'UMWEROalpha', serif !important;
          }
        `}</style>
      )}
    </div>
  )
}