"use client"

import { useState } from "react"
import { useTranslation } from "../../hooks/useTranslation"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Checkbox } from "../../components/ui/checkbox"
import { Label } from "../../components/ui/label"
import { EyeIcon, EyeOffIcon, Facebook, Github } from "lucide-react"
import Link from "next/link"
import { useAuth } from "../contexts/AuthContext"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const { t } = useTranslation()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState("")
  const { register } = useAuth()
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password !== confirmPassword) {
      setError(t("passwordsDontMatch"))
      return
    }
    if (!agreeTerms) {
      setError(t("pleaseAgreeTerms"))
      return
    }
    try {
      await register(email, password, fullName)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || t("signupError"))
    }
  }

  const getPasswordStrength = () => {
    const strength = {
      0: t("weak"),
      1: t("medium"),
      2: t("strong"),
    }
    const passwordTracker = {
      uppercase: /[A-Z]/,
      lowercase: /[a-z]/,
      number: /[0-9]/,
      special: /[!@#$%^&*]/,
    }
    let strengthScore = 0
    for (const check in passwordTracker) {
      if (passwordTracker[check as keyof typeof passwordTracker].test(password)) {
        strengthScore++
      }
    }
    return strength[strengthScore as keyof typeof strength] || strength[0]
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("createAccount")}</CardTitle>
          <CardDescription>{t("signupDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">{t("fullName")}</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t("enterFullName")}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("enterEmail")}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">{t("password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("enterPassword")}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("passwordStrength")}: {getPasswordStrength()}
                </p>
              </div>
              <div>
                <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("reenterPassword")}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                />
                <Label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t("agreeToTerms")}{" "}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    {t("termsAndConditions")}
                  </Link>
                </Label>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full">
                {t("signup")}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">{t("orSignupWith")}</span>
            </div>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" className="w-full">
              <Github className="mr-2 h-4 w-4" /> Github
            </Button>
            <Button variant="outline" className="w-full">
              <Facebook className="mr-2 h-4 w-4" /> Facebook
            </Button>
          </div>
          <p className="text-center text-sm">
            {t("alreadyHaveAccount")}{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              {t("login")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

