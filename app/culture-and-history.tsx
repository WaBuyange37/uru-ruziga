"use client"

import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BookOpen, Clock, Globe } from 'lucide-react'

export default function CultureAndHistoryPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState("overview")

  const sections = [
    { id: "overview", title: t("overview"), icon: Globe },
    { id: "history", title: t("historyOfWriting"), icon: Clock },
    { id: "umwero", title: t("umweroKabbalah"), icon: BookOpen },
  ]

  const content = {
    overview: (
      <>
        <p className="mb-4">{t("cultureHistoryIntro")}</p>
        <p>{t("importanceOfWriting")}</p>
      </>
    ),
    history: (
      <>
        <h3 className="text-xl font-semibold mb-2">{t("originOfWriting")}</h3>
        <p className="mb-4">{t("firstWritingSystemsDate")}</p>
        <h3 className="text-xl font-semibold mb-2">{t("writingAndPower")}</h3>
        <p className="mb-4">{t("sargonExample")}</p>
        <h3 className="text-xl font-semibold mb-2">{t("writingDefinition")}</h3>
        <p>{t("writingImportance")}</p>
      </>
    ),
    umwero: (
      <>
        <h3 className="text-xl font-semibold mb-2">{t("needForUmwero")}</h3>
        <p className="mb-4">{t("latinAlphabetDominance")}</p>
        <h3 className="text-xl font-semibold mb-2">{t("umweroCreation")}</h3>
        <p className="mb-4">{t("umweroReasoning")}</p>
        <h3 className="text-xl font-semibold mb-2">{t("conclusion")}</h3>
        <p>{t("umweroImportance")}</p>
      </>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-[#8B4513]">
        {t("cultureAndHistory")}
      </h1>

      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="w-full justify-start mb-8 overflow-x-auto flex-nowrap">
          {sections.map((section) => (
            <TabsTrigger 
              key={section.id} 
              value={section.id} 
              className="gap-2 whitespace-nowrap"
              onClick={() => setActiveTab(section.id)}
            >
              <section.icon className="h-4 w-4" />
              {section.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {sections.map((section) => (
          <TabsContent key={section.id} value={section.id}>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-[#8B4513]">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] md:h-[500px] w-full rounded-md">
                  <div className="p-4 text-[#D2691E]">
                    {content[section.id as keyof typeof content]}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-8 text-center">
        <Button className="gap-2">
          <BookOpen className="h-4 w-4" />
          {t("learnMoreUmwero")}
        </Button>
      </div>
    </div>
  )
}

