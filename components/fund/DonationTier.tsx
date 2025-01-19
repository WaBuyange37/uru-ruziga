import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card"

const donationTiers = [
  {
    amount: 20,
    title: "Supporter",
    description: "Thank you for your contribution. You will receive a Pen and a Personalized Thank You Card.",
    reward: "Pen + Thank You Card"
  },
  {
    amount: 50,
    title: "Contributor",
    description: "Your support goes a long way! You'll receive a T-shirt and a Personalized Thank You Card.",
    reward: "T-shirt + Thank You Card"
  },
  {
    amount: 100,
    title: "Patron",
    description: "You're making a big impact! You will receive a Hoodie and an Agenda.",
    reward: "Hoodie + Agenda"
  },
  {
    amount: 200,
    title: "Champion",
    description: "Thank you for being a Champion! You'll get a Clock and Exclusive Access to events.",
    reward: "Clock + Exclusive Access"
  }
]

interface DonationTierProps {
  onSelectTier: (amount: number, reward: string) => void
}

export function DonationTiers({ onSelectTier }: DonationTierProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {donationTiers.map((tier) => (
        <Card key={tier.amount} className="bg-[#F3E5AB] border-[#8B4513]">
          <CardHeader>
            <CardTitle className="text-[#8B4513]">{tier.title}</CardTitle>
            <CardDescription className="text-[#D2691E]">{tier.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]"
              onClick={() => onSelectTier(tier.amount, tier.reward)}
            >
              Donate ${tier.amount}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

