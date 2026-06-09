"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CreditCard,
  Database,
  GraduationCap,
  Heart,
  Landmark,
  Loader2,
  ScrollText,
  Shield,
  Users,
} from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Badge } from "../../components/ui/badge"
import { EmptyState, PageContainer } from "../../components/ui/page"
import { kbDefinitions, kbFunding } from "../../lib/umwero-knowledge-base"

interface Donation {
  id: string
  amount: number
  message: string | null
  anonymous?: boolean
  isAnonymous?: boolean
  createdAt: string
  donor?: {
    fullName: string
  }
}

interface DonationStats {
  totalRaised: number
  totalDonors: number
  averageDonation: number
  goalAmount: number
}

export default function FundingPage() {
  const { user } = useAuth()
  const [donations, setDonations] = useState<Donation[]>([])
  const [stats, setStats] = useState<DonationStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [donationForm, setDonationForm] = useState({
    amount: "",
    message: "",
    anonymous: false,
  })

  useEffect(() => {
    fetchDonations()
    fetchStats()
  }, [])

  const fetchDonations = async () => {
    try {
      const response = await fetch("/api/donations")
      if (response.ok) {
        const data = await response.json()
        setDonations(data.donations)
      }
    } catch (error) {
      console.error("Error fetching donations:", error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/donations/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const submitDonation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert("Please login to make a donation")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          amount: parseFloat(donationForm.amount),
          message: donationForm.message || null,
          anonymous: donationForm.anonymous,
        }),
      })

      if (response.ok) {
        alert("Thank you for your donation.")
        setDonationForm({ amount: "", message: "", anonymous: false })
        await fetchDonations()
        await fetchStats()
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.message}`)
      }
    } catch (error) {
      console.error("Error submitting donation:", error)
      alert("Failed to process donation")
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("rw-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(amount)

  const donationTiers = [
    { amount: 5000, title: "Supporter" },
    { amount: 15000, title: "Contributor" },
    { amount: 50000, title: "Patron" },
    { amount: 100000, title: "Champion" },
  ]

  const missionPoints = [
    "Teach the Umwero writing system",
    "Support Kinyarwanda learning resources",
    "Preserve documented cultural foundations",
    "Improve handwriting practice tools",
    "Maintain platform access for learners",
  ]

  const impactCards = [
    {
      title: "Educate Learners",
      description: "Lessons and practice tools for learners studying Umwero.",
      icon: GraduationCap,
    },
    {
      title: "Build & Improve",
      description: "Better learning experiences, practice feedback, and platform reliability.",
      icon: BookOpen,
    },
    {
      title: "Preserve Heritage",
      description: "Documented references for language, symbols, and cultural memory.",
      icon: ScrollText,
    },
    {
      title: "Advance Research",
      description: "Handwriting samples and tooling that can support future learning improvements.",
      icon: Database,
    },
    {
      title: "Empower Communities",
      description: "Education and support for people learning the writing system.",
      icon: Users,
    },
  ]

  const allocationRows = [
    ["Learning Platform", "Lessons, practice tools, translation, and learner experience"],
    ["Handwriting Research", "Improving Umwero writing feedback and recognition"],
    ["Cultural References", "Preserving the symbols and foundations learners meet in Umwero"],
    ["Infrastructure", "Hosting, storage, maintenance, and reliability"],
    ["Community Programs", "Teaching, outreach, and learner support"],
  ]

  return (
    <PageContainer className="bg-white px-0 py-0">
      <section className="relative overflow-hidden border-b border-[#8B4513]/15 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-16">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#8B4513]">Fund Uruziga</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-black sm:text-5xl lg:text-6xl">
              Preserve language. Strengthen the future.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-black/72 sm:text-lg">
              {kbFunding.mission} {kbDefinitions.uruziga}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["Created in Rwanda", Landmark],
                ["Built for preservation", BookOpen],
                ["Driven by education", Users],
              ].map(([label, Icon]) => (
                <div key={label as string} className="flex items-center gap-3 rounded-lg border border-[#8B4513]/15 bg-white p-3">
                  <Icon className="h-5 w-5 text-[#8B4513]" />
                  <span className="text-sm font-semibold text-black">{label as string}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[300px] overflow-hidden rounded-lg border border-[#8B4513]/20 bg-white">
            <Image
              src="/pictures/handWritten.png"
              alt="Handwritten Umwero text"
              fill
              priority
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-contain p-6"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1fr_280px_1.1fr]">
          <Card className="border-[#8B4513]/20">
            <CardContent className="p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-10 bg-[#8B4513]" />
                <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[#8B4513]">Why Umwero matters</h2>
              </div>
              <div className="space-y-4 text-base leading-7 text-black/72">
                <p>
                  {kbFunding.preservation}
                </p>
                <p>
                  {kbFunding.technology}
                </p>
              </div>
              <div className="mt-6 space-y-3">
                {missionPoints.map((item) => (
                  <div key={item} className="flex gap-3 text-sm text-black">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-[#8B4513]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#8B4513]/20">
            <CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8B4513]">Creator message</p>
              <blockquote className="mt-5 text-xl font-semibold leading-8 text-black">
                “Every culture is protected by its language, and any language may be protected by its own writing system.”
              </blockquote>
              <div className="mt-6 h-16 w-16 rounded-full border border-[#8B4513]/30 bg-white text-center font-bold leading-[4rem] text-[#8B4513]">
                KM
              </div>
              <p className="mt-3 font-semibold text-black">Kwizera Mugisha</p>
              <p className="text-sm text-black/60">Founder of Umwero</p>
            </CardContent>
          </Card>

          <Card className="border-[#8B4513]/30">
            <CardContent className="p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <Heart className="h-5 w-5 text-[#8B4513]" />
                <div>
                  <h2 className="text-xl font-bold text-black">Make Your Contribution</h2>
                  <p className="mt-1 text-sm text-black/65">Every contribution helps keep the work moving.</p>
                </div>
              </div>

              {user ? (
                <form onSubmit={submitDonation} className="space-y-5">
                  <div>
                    <Label className="mb-2 block text-sm font-bold uppercase tracking-[0.12em] text-black">Select Amount</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {donationTiers.map((tier) => (
                        <Button
                          key={tier.amount}
                          type="button"
                          variant={donationForm.amount === tier.amount.toString() ? "default" : "outline"}
                          className="h-auto min-h-[64px] flex-col py-3"
                          onClick={() => setDonationForm({ ...donationForm, amount: tier.amount.toString() })}
                        >
                          <span>{formatAmount(tier.amount)}</span>
                          <span className="text-xs opacity-80">{tier.title}</span>
                        </Button>
                      ))}
                    </div>
                    <Input
                      type="number"
                      min="1000"
                      value={donationForm.amount}
                      onChange={(e) => setDonationForm({ ...donationForm, amount: e.target.value })}
                      placeholder="Enter custom amount (RWF)"
                      className="mt-3 border-[#8B4513]/35 bg-white"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block text-sm font-bold uppercase tracking-[0.12em] text-black">Payment Method</Label>
                    <div className="rounded-lg border border-[#8B4513]/25 bg-white p-4">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-[#8B4513]" />
                        <div>
                          <p className="font-semibold text-black">Existing donation checkout</p>
                          <p className="text-sm text-black/65">Payment processing remains handled by the current backend path.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block text-sm font-bold uppercase tracking-[0.12em] text-black">Personal Message (Optional)</Label>
                    <Textarea
                      value={donationForm.message}
                      onChange={(e) => setDonationForm({ ...donationForm, message: e.target.value })}
                      placeholder="Share why you support Umwero learning..."
                      rows={3}
                      className="border-[#8B4513]/35 bg-white"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm text-black">
                    <input
                      type="checkbox"
                      checked={donationForm.anonymous}
                      onChange={(e) => setDonationForm({ ...donationForm, anonymous: e.target.checked })}
                      className="rounded border-[#8B4513]/35"
                    />
                    Make this donation anonymous
                  </label>

                  <Button type="submit" disabled={loading || !donationForm.amount} className="w-full">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    Donate Securely
                  </Button>

                  <p className="flex items-center justify-center gap-2 text-sm text-black/60">
                    <Shield className="h-4 w-4" />
                    Secured through the existing payment flow
                  </p>
                </form>
              ) : (
                <EmptyState
                  title="Login to donate"
                  description="Sign in to support the Uruziga mission."
                  actionLabel="Log In"
                  onAction={() => (window.location.href = "/login")}
                />
              )}
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="border-[#8B4513]/20">
            <CardContent className="p-5 sm:p-6">
              <h2 className="text-center text-sm font-bold uppercase tracking-[0.18em] text-[#8B4513]">
                What support helps sustain
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {impactCards.map(({ title, description, icon: Icon }) => (
                  <div key={title} className="rounded-lg border border-[#8B4513]/15 bg-white p-4 text-center">
                    <Icon className="mx-auto h-7 w-7 text-[#8B4513]" />
                    <h3 className="mt-3 font-semibold text-black">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-black/65">{description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="border-[#8B4513]/20">
            <CardContent className="p-5">
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[#8B4513]">Our vision</h2>
              <p className="mt-4 text-sm leading-6 text-black/70">
                Uruziga is the educational platform for learning and practicing Umwero. Its role is to make the writing system easier to study through lessons, practice tools, and learner support.
              </p>
              {stats && (
                <div className="mt-5 rounded-lg border border-[#8B4513]/20 bg-white p-4">
                  <p className="text-sm font-semibold text-black">Real campaign progress</p>
                  <p className="mt-2 text-2xl font-bold text-[#8B4513]">{formatAmount(stats.totalRaised)}</p>
                  <p className="mt-1 text-sm text-black/65">
                    {stats.totalDonors} donor{stats.totalDonors === 1 ? "" : "s"} recorded
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#8B4513]/20">
            <CardContent className="p-5">
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[#8B4513]">Where contributions go</h2>
              <div className="mt-4 overflow-hidden rounded-lg border border-[#8B4513]/15">
                {allocationRows.map(([area, purpose]) => (
                  <div key={area} className="grid grid-cols-[0.85fr_1.15fr] border-b border-[#8B4513]/10 last:border-b-0">
                    <div className="p-3 text-sm font-semibold text-black">{area}</div>
                    <div className="border-l border-[#8B4513]/10 p-3 text-sm text-black/65">{purpose}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#8B4513]/20">
            <CardContent className="p-5">
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[#8B4513]">Community support</h2>
              <div className="mt-5">
                {donations.length > 0 ? (
                  <div className="space-y-3">
                    {donations.slice(0, 4).map((donation) => {
                      const isAnonymous = donation.anonymous ?? donation.isAnonymous
                      return (
                        <div key={donation.id} className="rounded-lg border border-[#8B4513]/15 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-black">
                                {isAnonymous ? "Anonymous" : donation.donor?.fullName || "Anonymous"}
                              </p>
                              {donation.message && <p className="mt-1 text-sm text-black/65">{donation.message}</p>}
                            </div>
                            <Badge>{formatAmount(donation.amount)}</Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg border border-[#8B4513]/15 bg-white p-5 text-sm leading-6 text-black/65">
                    Real supporter records will appear here when the donation endpoint returns public donations.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageContainer>
  )
}
