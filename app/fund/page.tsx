"use client"
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Badge } from "../../components/ui/badge"
import { useTranslation } from "../../hooks/useTranslation"
import { Heart, Users, Target, TrendingUp, Gift, Star, Award, Globe, Shield, CheckCircle, ArrowRight, CreditCard, Smartphone, Building, Calendar, Mail, Phone } from 'lucide-react'

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
    { 
      amount: 5000, 
      title: 'Supporter', 
      reward: 'Digital thank you card + social media recognition',
      color: 'from-blue-500 to-cyan-500',
      icon: <Heart className="h-6 w-6" />
    },
    { 
      amount: 15000, 
      title: 'Contributor', 
      reward: 'Digital certificate + exclusive content access',
      color: 'from-purple-500 to-pink-500',
      icon: <Star className="h-6 w-6" />
    },
    { 
      amount: 50000, 
      title: 'Patron', 
      reward: 'Umwero learning kit + workshop invitation',
      color: 'from-orange-500 to-red-500',
      icon: <Award className="h-6 w-6" />
    },
    { 
      amount: 100000, 
      title: 'Champion', 
      reward: 'Personal thank you call + lifetime premium access',
      color: 'from-yellow-500 to-amber-500',
      icon: <Target className="h-6 w-6" />
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">
              {t("supportUmwero")}
            </h1>
            <p className="text-xl mb-8 opacity-95">
              Join us in preserving and promoting the Umwero alphabet - a vital part of Kinyarwanda culture and heritage. 
              Your contribution helps us create educational content, preserve cultural artifacts, and reach more learners worldwide.
            </p>
            
            {/* Trust Badges */}
            <div className="flex justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Shield className="h-4 w-4" />
                <span className="text-sm">Secure Payment</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Tax Deductible</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <ArrowRight className="h-4 w-4" />
                <span className="text-sm">Instant Receipt</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Progress Overview */}
        {stats && (
          <Card className="mb-12 bg-white shadow-xl border-0">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Campaign Progress</h2>
                <p className="text-gray-600">Together we're making a difference</p>
              </div>
              
              <div className="mb-8">
                <div className="flex justify-between mb-4">
                  <span className="text-2xl font-bold text-amber-600">
                    {formatAmount(stats.totalRaised)}
                  </span>
                  <span className="text-xl text-gray-600">
                    Goal: {formatAmount(stats.goalAmount)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-6 rounded-full transition-all duration-1000 flex items-center justify-center"
                    style={{ width: `${getProgressPercentage()}%` }}
                  >
                    <span className="text-white text-sm font-semibold">
                      {getProgressPercentage().toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600 mb-1">
                    {formatAmount(stats.totalRaised)}
                  </div>
                  <div className="text-gray-600">Total Raised</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600 mb-1">
                    {stats.totalDonors}
                  </div>
                  <div className="text-gray-600">Donors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600 mb-1">
                    {formatAmount(stats.averageDonation)}
                  </div>
                  <div className="text-gray-600">Average Gift</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Impact Metrics */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Students Reached', value: '2,500+', icon: <Users className="h-5 w-5" /> },
              { label: 'Lessons Created', value: '150+', icon: <Target className="h-5 w-5" /> },
              { label: 'Countries', value: '12', icon: <Globe className="h-5 w-5" /> },
              { label: 'Cultural Artifacts Preserved', value: '85+', icon: <Shield className="h-5 w-5" /> }
            ].map((metric, index) => (
              <Card key={index} className="bg-white shadow-lg border-0">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-4">
                    {metric.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">{metric.value}</div>
                  <div className="text-gray-600">{metric.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Donation Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-800 flex items-center gap-2">
                  <Gift className="h-6 w-6 text-amber-600" />
                  Make Your Contribution
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Choose your donation amount and payment method
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {user ? (
                  <>
                    {/* Donation Amount */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-4">Select Amount</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {donationTiers.map((tier) => (
                          <Button
                            key={tier.amount}
                            variant={donationForm.amount === tier.amount.toString() ? "default" : "outline"}
                            className={`relative overflow-hidden ${donationForm.amount === tier.amount.toString() 
                              ? 'bg-gradient-to-r ' + tier.color + ' text-white border-0' 
                              : 'border-gray-300 hover:border-amber-600'
                            }`}
                            onClick={() => setDonationForm({ ...donationForm, amount: tier.amount.toString() })}
                          >
                            <div className="text-center">
                              <div className="font-bold">{formatAmount(tier.amount)}</div>
                              <div className="text-xs opacity-80">{tier.title}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                      
                      <div className="relative">
                        <Input
                          type="number"
                          min="1000"
                          value={donationForm.amount}
                          onChange={(e) => setDonationForm({ ...donationForm, amount: e.target.value })}
                          placeholder="Enter custom amount (RWF)"
                          className="border-gray-300 text-lg"
                        />
                        {donationForm.amount && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                            {formatAmount(parseFloat(donationForm.amount) || 0)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Methods */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-4">Payment Method</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          { id: 'card', name: 'Credit/Debit Card', icon: <CreditCard className="h-5 w-5" />, popular: true },
                          { id: 'paypal', name: 'PayPal', icon: <Building className="h-5 w-5" /> },
                          { id: 'mobile', name: 'Mobile Money', icon: <Smartphone className="h-5 w-5" /> }
                        ].map((method) => (
                          <div
                            key={method.id}
                            className="border rounded-lg p-4 cursor-pointer transition-all border-gray-300 hover:border-amber-400"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded bg-gray-100">
                                {method.icon}
                              </div>
                              <div>
                                <div className="font-medium text-gray-800 flex items-center gap-2">
                                  {method.name}
                                  {method.popular && (
                                    <Badge className="bg-amber-600 text-white text-xs">Popular</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Personal Message (Optional)
                      </label>
                      <Textarea
                        value={donationForm.message}
                        onChange={(e) => setDonationForm({ ...donationForm, message: e.target.value })}
                        placeholder="Share why you support Umwero preservation..."
                        rows={3}
                        className="border-gray-300"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="anonymous"
                        checked={donationForm.anonymous}
                        onChange={(e) => setDonationForm({ ...donationForm, anonymous: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="anonymous" className="text-sm text-gray-700">
                        Make this donation anonymous
                      </label>
                    </div>

                    <Button
                      onClick={submitDonation}
                      disabled={loading || !donationForm.amount}
                      className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 text-lg py-3"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          Donate {donationForm.amount ? formatAmount(parseFloat(donationForm.amount)) : ''}
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      )}
                    </Button>

                    {/* Security Note */}
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <Shield className="h-4 w-4" />
                      <span>Secured by 256-bit SSL encryption</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 mx-auto mb-4 text-amber-600" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Login to Donate</h3>
                    <p className="text-gray-600 mb-6">Join our community of supporters</p>
                    <Button asChild className="bg-amber-600 hover:bg-amber-700">
                      <a href="/login">Log In to Continue</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Donations & Tiers */}
          <div className="space-y-8">
            {/* Recent Donations */}
            <Card className="bg-white shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-amber-600" />
                  Recent Supporters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {donations.slice(0, 8).map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">
                            {donation.anonymous ? 'Anonymous' : donation.donor?.fullName || 'Anonymous'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(donation.createdAt)}
                        </div>
                        {donation.message && (
                          <p className="text-sm text-gray-700 mt-1 italic">
                            "{donation.message}"
                          </p>
                        )}
                      </div>
                      <Badge className="bg-amber-600 text-white">
                        {formatAmount(donation.amount)}
                      </Badge>
                    </div>
                  ))}
                  
                  {donations.length === 0 && (
                    <div className="text-center py-8 text-gray-600">
                      <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Be the first to support our mission!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Supporter Tiers */}
            <Card className="bg-white shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Supporter Benefits</CardTitle>
                <CardDescription className="text-gray-600">
                  Recognition for different contribution levels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {donationTiers.map((tier) => (
                  <div key={tier.amount} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded bg-gradient-to-r ${tier.color} text-white`}>
                        {tier.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{tier.title}</h3>
                        <p className="text-lg font-bold text-amber-600">
                          {formatAmount(tier.amount)}+
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{tier.reward}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Why Support Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Why Your Support Matters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                <Target className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Cultural Preservation</h3>
              <p className="text-gray-600">
                Help us digitize and preserve ancient Umwero manuscripts and cultural artifacts for future generations.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                <Users className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Education Access</h3>
              <p className="text-gray-600">
                Provide free educational resources to schools and communities across Rwanda and beyond.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                <Globe className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Global Reach</h3>
              <p className="text-gray-600">
                Expand our platform to reach Rwandan diaspora and interested learners worldwide.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}