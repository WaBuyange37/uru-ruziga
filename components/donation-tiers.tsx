import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"

const tiers = [
  {
    name: "Supporter",
    amount: 10,
    description: "Every bit helps! Get a thank you email and updates on our progress.",
  },
  {
    name: "Friend",
    amount: 50,
    description: "Receive a digital Umwero alphabet poster and access to exclusive updates.",
  },
  {
    name: "Champion",
    amount: 100,
    description: "Get a personalized thank you video in Umwero and a printed Umwero alphabet poster.",
  },
  {
    name: "Guardian",
    amount: 500,
    description: "Receive all previous rewards plus a handcrafted Umwero artifact and VIP invitations to Umwero events.",
  },
]

export function DonationTiers() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {tiers.map((tier) => (
        <Card key={tier.name}>
          <CardHeader>
            <CardTitle>{tier.name}</CardTitle>
            <CardDescription>${tier.amount} / month</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{tier.description}</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Select</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

