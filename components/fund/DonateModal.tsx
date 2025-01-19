import { useState } from 'react'
import { Modal } from '../ui/modal'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Label } from '../ui/label'
import { CreditCard, ShoppingCart } from 'lucide-react'

interface DonateModalProps {
  isOpen: boolean
  onClose: () => void
  selectedAmount: number
  selectedReward: string
}

export function DonateModal({ isOpen, onClose, selectedAmount, selectedReward }: DonateModalProps) {
  const [amount, setAmount] = useState(selectedAmount.toString())
  const [paymentMethod, setPaymentMethod] = useState('stripe')

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically integrate with Stripe or PayPal
    console.log(`Processing ${paymentMethod} donation of $${amount} for reward: ${selectedReward}`)
    alert(`Thank you for your donation of $${amount}! You will be redirected to complete your ${paymentMethod === 'stripe' ? 'card' : 'PayPal'} payment. Your reward: ${selectedReward}`)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Your Donation">
      <form onSubmit={handleDonate} className="space-y-6">
        <div>
          <Label htmlFor="amount" className="block text-sm font-medium text-[#8B4513]">
            Donation Amount ($)
          </Label>
          <Input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            required
            min="1"
            step="0.01"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="block text-sm font-medium text-[#8B4513] mb-2">
            Selected Reward
          </Label>
          <p className="text-[#D2691E]">{selectedReward}</p>
        </div>
        <div>
          <Label className="block text-sm font-medium text-[#8B4513] mb-2">
            Payment Method
          </Label>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="stripe" id="stripe" />
              <Label htmlFor="stripe" className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span>Credit Card</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="paypal" id="paypal" />
              <Label htmlFor="paypal" className="flex items-center space-x-2">
                <ShoppingCart className="h-4 w-4" />
                <span>PayPal</span>
              </Label>
            </div>
          </RadioGroup>
        </div>
        <p className="text-sm text-[#D2691E]">
          You will be redirected to a secure {paymentMethod === 'stripe' ? 'Stripe' : 'PayPal'} page to complete your donation.
        </p>
        <Button type="submit" className="w-full">
          Proceed to Donate
        </Button>
      </form>
    </Modal>
  )
}

