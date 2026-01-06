"use client"
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Badge } from "../../components/ui/badge"
import { useTranslation } from "../../hooks/useTranslation"
import { Heart, Users, Target, TrendingUp, Gift } from 'lucide-react'

interface Donation {
  id: string
  amount: number
  message: string | null
  anonymous: boolean
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
  const { t } = useTranslation()
  const { user } = useAuth()
  const [donations, setDonations] = useState<Donation[]>([])
  const [stats, setStats] = useState<DonationStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [donationForm, setDonationForm] = useState({
    amount: '',
    message: '',
    anonymous: false
  })

  useEffect(() => {
    fetchDonations()
    fetchStats()
  }, [])

  const fetchDonations = async () => {
    try {
      const response = await fetch('/api/donations')
      if (response.ok) {
        const data = await response.json()
        setDonations(data.donations)
      }
    } catch (error) {
      console.error('Error fetching donations:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/donations/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const submitDonation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert('Please login to make a donation')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: parseFloat(donationForm.amount),
          message: donationForm.message || null,
          anonymous: donationForm.anonymous
        })
      })

      if (response.ok) {
        alert('Thank you for your donation! 🙏')
        setDonationForm({ amount: '', message: '', anonymous: false })
        await fetchDonations()
        await fetchStats()
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.message}`)
      }
    } catch (error) {
      console.error('Error submitting donation:', error)
      alert('Failed to process donation')
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getProgressPercentage = () => {
    if (!stats || stats.goalAmount === 0) return 0
    return Math.min((stats.totalRaised / stats.goalAmount) * 100, 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const donationTiers = [
    { amount: 5000, title: 'Supporter', reward: 'Thank you card' },
    { amount: 15000, title: 'Contributor', reward: 'Digital certificate' },
    { amount: 50000, title: 'Patron', reward: 'Umwero learning kit' },
    { amount: 100000, title: 'Champion', reward: 'Personal thank you call' }
  ]

  return (
    <div className="container mx-auto px-4 py-8 bg-[#FFFFFF]">
      <h1 className="text-4xl font-bold mb-6 text-center text-[#8B4513]">
        {t("supportUmwero")}
      </h1>
      
      <p className="text-xl text-center mb-8 text-[#D2691E] max-w-3xl mx-auto">
        Help us preserve and promote the Umwero alphabet - a vital part of Kinyarwanda culture and heritage.
      </p>

      {/* Progress Overview */}
      {stats && (
        <Card className="mb-8 bg-[#F3E5AB] border-[#8B4513]">
          <CardHeader>
            <CardTitle className="text-[#8B4513] text-center text-2xl">
              Funding Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-[#8B4513] font-semibold">
                  {formatAmount(stats.totalRaised)} raised
                </span>
                <span className="text-[#D2691E]">
                  Goal: {formatAmount(stats.goalAmount)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-[#8B4513] h-4 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
              <p className="text-center mt-2 text-[#D2691E]">
                {getProgressPercentage().toFixed(1)}% of goal reached
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#8B4513]" />
                <div>
                  <div className="text-2xl font-bold text-[#8B4513]">
                    {formatAmount(stats.totalRaised)}
                  </div>
                  <div className="text-[#D2691E]">Total Raised</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Users className="h-5 w-5 text-[#8B4513]" />
                <div>
                  <div className="text-2xl font-bold text-[#8B4513]">
                    {stats.totalDonors}
                  </div>
                  <div className="text-[#D2691E]">Donors</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Heart className="h-5 w-5 text-[#8B4513]" />
                <div>
                  <div className="text-2xl font-bold text-[#8B4513]">
                    {formatAmount(stats.averageDonation)}
                  </div>
                  <div className="text-[#D2691E]">Average</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Donation Form */}
        <Card className="bg-[#F3E5AB] border-[#8B4513]">
          <CardHeader>
            <CardTitle className="text-[#8B4513] flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Make a Donation
            </CardTitle>
            <CardDescription className="text-[#D2691E]">
              Every contribution helps preserve Umwero culture
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <form onSubmit={submitDonation} className="space-y-4">
                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {donationTiers.map((tier) => (
                    <Button
                      key={tier.amount}
                      type="button"
                      variant={donationForm.amount === tier.amount.toString() ? 'default' : 'outline'}
                      className={`text-sm ${donationForm.amount === tier.amount.toString() 
                        ? 'bg-[#8B4513] text-[#F3E5AB]' 
                        : 'border-[#8B4513] text-[#8B4513]'
                      }`}
                      onClick={() => setDonationForm({ ...donationForm, amount: tier.amount.toString() })}
                    >
                      {formatAmount(tier.amount)}
                    </Button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#8B4513] mb-2">
                    Custom Amount (RWF)
                  </label>
                  <Input
                    type="number"
                    min="1000"
                    value={donationForm.amount}
                    onChange={(e) => setDonationForm({ ...donationForm, amount: e.target.value })}
                    placeholder="Enter amount"
                    required
                    className="border-[#8B4513]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#8B4513] mb-2">
                    Message (Optional)
                  </label>
                  <Textarea
                    value={donationForm.message}
                    onChange={(e) => setDonationForm({ ...donationForm, message: e.target.value })}
                    placeholder="Share why you support Umwero..."
                    rows={3}
                    className="border-[#8B4513]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={donationForm.anonymous}
                    onChange={(e) => setDonationForm({ ...donationForm, anonymous: e.target.checked })}
                    className="rounded border-[#8B4513]"
                  />
                  <label htmlFor="anonymous" className="text-sm text-[#8B4513]">
                    Make this donation anonymous
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]"
                >
                  {loading ? 'Processing...' : 'Donate Now'}
                </Button>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Mobile Money:</strong> Dial *182*1*1*0786375052# and follow prompts
                  </p>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <p className="text-[#D2691E] mb-4">Please log in to make a donation</p>
                <Button asChild className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]">
                  <a href="/login">Log In</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Donations */}
        <Card className="bg-[#F3E5AB] border-[#8B4513]">
          <CardHeader>
            <CardTitle className="text-[#8B4513] flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Recent Supporters
            </CardTitle>
            <CardDescription className="text-[#D2691E]">
              Thank you to our amazing community!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {donations.slice(0, 10).map((donation) => (
                <div key={donation.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#8B4513]">
                        {donation.anonymous ? 'Anonymous' : donation.donor?.fullName || 'Anonymous'}
                      </span>
                      <span className="text-sm text-[#D2691E]">
                        {formatDate(donation.createdAt)}
                      </span>
                    </div>
                    {donation.message && (
                      <p className="text-sm text-[#D2691E] mt-1 italic">
                        "{donation.message}"
                      </p>
                    )}
                  </div>
                  <Badge className="bg-[#8B4513] text-[#F3E5AB]">
                    {formatAmount(donation.amount)}
                  </Badge>
                </div>
              ))}
              
              {donations.length === 0 && (
                <div className="text-center py-8 text-[#D2691E]">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-[#D2691E]" />
                  <p>Be the first to support our mission!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Donation Tiers */}
      <Card className="mt-8 bg-[#F3E5AB] border-[#8B4513]">
        <CardHeader>
          <CardTitle className="text-[#8B4513] text-center">Supporter Tiers</CardTitle>
          <CardDescription className="text-center text-[#D2691E]">
            Recognition for different donation levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {donationTiers.map((tier) => (
              <div key={tier.amount} className="text-center p-4 bg-white rounded-lg">
                <h3 className="font-bold text-[#8B4513] mb-2">{tier.title}</h3>
                <p className="text-xl font-bold text-[#D2691E] mb-2">
                  {formatAmount(tier.amount)}+
                </p>
                <p className="text-sm text-[#8B4513]">{tier.reward}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}