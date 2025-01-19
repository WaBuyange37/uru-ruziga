"use client"

import { useState } from 'react'
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import Image from 'next/image'
import { DonateModal } from '../../components/fund/DonateModal'
import { SponsorModal } from '../../components/fund/SponsorModal'
import { ContactModal } from '../../components/fund/ContactModal'
import { DonationTiers } from '../../components/fund/DonationTier'

export default function FundPage() {
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false)
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState(0)
  const [selectedReward, setSelectedReward] = useState('')

  const handleSelectTier = (amount: number, reward: string) => {
    setSelectedAmount(amount)
    setSelectedReward(reward)
    setIsDonateModalOpen(true)
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-[#FFFFFF]">
      <h1 className="text-4xl font-bold mb-6 text-center text-[#8B4513]">Support Our Cultural Mission</h1>
      <p className="text-xl text-center mb-8 text-[#D2691E]">Your contribution helps preserve Kinyarwanda culture, protect language uniqueness, and build our cultural-based school</p>
      
      <DonationTiers onSelectTier={handleSelectTier} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        <Card className="bg-[#F3E5AB] border-[#8B4513]">
          <CardHeader>
            <CardTitle className="text-[#8B4513]">Custom Donation</CardTitle>
            <CardDescription className="text-[#D2691E]">Make a single contribution of your chosen amount</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => setIsDonateModalOpen(true)}>Donate Now</Button>
          </CardContent>
        </Card>
        
        <Card className="bg-[#F3E5AB] border-[#8B4513]">
          <CardHeader>
            <CardTitle className="text-[#8B4513]">Monthly Sponsorship</CardTitle>
            <CardDescription className="text-[#D2691E]">Become a regular supporter of our mission</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => setIsSponsorModalOpen(true)}>Become a Sponsor</Button>
          </CardContent>
        </Card>
        
        <Card className="bg-[#F3E5AB] border-[#8B4513]">
          <CardHeader>
            <CardTitle className="text-[#8B4513]">Corporate Partnership</CardTitle>
            <CardDescription className="text-[#D2691E]">Partner with us to make a bigger impact</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => setIsContactModalOpen(true)}>Contact Us</Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4 text-[#8B4513]">How Your Support Helps</h2>
        <ul className="list-disc list-inside space-y-2 text-[#D2691E]">
          <li>Develop educational materials for the Umwero alphabet</li>
          <li>Build and maintain our cultural-based school</li>
          <li>Organize cultural events and workshops</li>
          <li>Support research into Kinyarwanda history and linguistics</li>
          <li>Preserve and promote Rwandan heritage</li>
          <li>Protect the uniqueness of the Kinyarwanda language</li>
          <li>Empower the next generation of cultural custodians</li>
        </ul>
      </div>

      <DonateModal 
        isOpen={isDonateModalOpen} 
        onClose={() => setIsDonateModalOpen(false)} 
        selectedAmount={selectedAmount}
        selectedReward={selectedReward}
      />
      <SponsorModal isOpen={isSponsorModalOpen} onClose={() => setIsSponsorModalOpen(false)} />
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
    </div>
  )
}

