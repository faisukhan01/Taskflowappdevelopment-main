import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useAuth } from '../contexts/AuthContext'
import { MessageCircle, ArrowLeft } from 'lucide-react'

interface WhatsAppAuthProps {
  mode: 'signin' | 'signup'
  onBack: () => void
  onSuccess: () => void
}

export function WhatsAppAuth({ mode, onBack, onSuccess }: WhatsAppAuthProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signInWithWhatsApp, signUpWithWhatsApp, verifyWhatsAppOTP } = useAuth()

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Add Pakistan country code (+92) if not present
    if (digits.length > 0 && !digits.startsWith('92')) {
      return '+92' + digits
    } else if (digits.length > 0) {
      return '+' + digits
    }
    return value
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formattedPhone = formatPhoneNumber(phone)
    
    // Pakistan phone numbers are typically 10 digits after country code (+92)
    if (formattedPhone.length < 13 || !formattedPhone.startsWith('+92')) {
      setError('Please enter a valid Pakistani phone number (e.g., 3001234567)')
      setLoading(false)
      return
    }

    try {
      let result
      if (mode === 'signup') {
        if (!name.trim()) {
          setError('Please enter your name')
          setLoading(false)
          return
        }
        result = await signUpWithWhatsApp(formattedPhone, name)
      } else {
        result = await signInWithWhatsApp(formattedPhone)
      }

      if (result.error) {
        setError(result.error)
      } else {
        setStep('otp')
      }
    } catch (error) {
      setError('Failed to send OTP')
    }
    
    setLoading(false)
  }

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      setLoading(false)
      return
    }

    const formattedPhone = formatPhoneNumber(phone)
    const { error } = await verifyWhatsAppOTP(formattedPhone, otp)
    
    if (error) {
      setError(error)
      setLoading(false)
    } else {
      onSuccess()
    }
  }

  const handleResendOTP = async () => {
    setError('')
    setLoading(true)
    
    const formattedPhone = formatPhoneNumber(phone)
    
    try {
      let result
      if (mode === 'signup') {
        result = await signUpWithWhatsApp(formattedPhone, name)
      } else {
        result = await signInWithWhatsApp(formattedPhone)
      }

      if (result.error) {
        setError(result.error)
      } else {
        setError('')
        // Show success message briefly
        setError('OTP sent successfully!')
        setTimeout(() => setError(''), 3000)
      }
    } catch (error) {
      setError('Failed to resend OTP')
    }
    
    setLoading(false)
  }

  if (step === 'phone') {
    return (
      <div className="space-y-4">
        <div className="flex items-center mb-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mr-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center">
            <MessageCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="font-medium">
              {mode === 'signup' ? 'Sign up with WhatsApp' : 'Sign in with WhatsApp'}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="mt-1"
              />
            </div>
          )}

          <div>
            <Label htmlFor="phone">WhatsApp Number</Label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500 text-sm">+92</span>
              </div>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  // Only allow digits and limit to 10 characters
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                  setPhone(value)
                }}
                placeholder="3001234567"
                required
                className="pl-12"
                maxLength={10}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Enter your Pakistani mobile number (10 digits). We'll send you a verification code via WhatsApp
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setStep('phone')}
          className="mr-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center">
          <MessageCircle className="w-5 h-5 text-green-600 mr-2" />
          <span className="font-medium">Enter verification code</span>
        </div>
      </div>

      <div className="text-center mb-4">
        <p className="text-gray-600">
          We sent a 6-digit code to your WhatsApp
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {formatPhoneNumber(phone)}
        </p>
      </div>

      {error && (
        <div className={`border px-4 py-3 rounded-lg ${
          error.includes('successfully') 
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {error}
        </div>
      )}

      <form onSubmit={handleOTPSubmit} className="space-y-4">
        <div>
          <Label htmlFor="otp">Verification Code</Label>
          <Input
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            maxLength={6}
            required
            className="mt-1 text-center text-lg tracking-widest"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify Code'}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Didn't receive the code?{' '}
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={loading}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Resend OTP
          </button>
        </p>
      </div>
    </div>
  )
}