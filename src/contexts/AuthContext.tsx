import React, { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '../utils/supabase/client'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { clearDataCache } from '../hooks/useApi'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<{ error?: string }>
  signInWithWhatsApp: (phone: string) => Promise<{ error?: string }>
  verifyWhatsAppOTP: (phone: string, otp: string) => Promise<{ error?: string }>
  signUpWithWhatsApp: (phone: string, name: string) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch((error) => {
      console.error('Error getting session:', error)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false) // Ensure loading is false on any auth change
      
      // Clear cache when user signs out
      if (event === 'SIGNED_OUT') {
        clearDataCache()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch(`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID || projectId}.supabase.co/functions/v1/make-server-faf41fa2/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || publicAnonKey}`
        },
        body: JSON.stringify({ email, password, name })
      })

      const data = await response.json()
      
      if (!response.ok) {
        return { error: data.error || 'Failed to sign up' }
      }

      // Sign in after signup
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        return { error: signInError.message }
      }

      return {}
    } catch (error) {
      console.error('Signup error:', error)
      return { error: 'Failed to sign up' }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: 'Failed to sign in' }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/app/dashboard`
        }
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      console.error('Google sign in error:', error)
      return { error: 'Failed to sign in with Google' }
    }
  }

  const signInWithWhatsApp = async (phone: string) => {
    try {
      // First try with WhatsApp channel, fallback to SMS if not available
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: phone,
        options: {
          channel: 'whatsapp',
          // Add additional options for better delivery
          shouldCreateUser: true
        }
      })

      if (error) {
        // If WhatsApp fails, try SMS as fallback
        console.warn('WhatsApp OTP failed, trying SMS:', error.message)
        const smsResult = await supabase.auth.signInWithOtp({
          phone: phone,
          options: {
            channel: 'sms',
            shouldCreateUser: true
          }
        })
        
        if (smsResult.error) {
          return { error: `Failed to send OTP: ${smsResult.error.message}` }
        }
        
        return {}
      }

      return {}
    } catch (error) {
      console.error('WhatsApp sign in error:', error)
      return { error: 'Failed to send OTP. Please check your phone number and try again.' }
    }
  }

  const signUpWithWhatsApp = async (phone: string, name: string) => {
    try {
      // First try with WhatsApp channel, fallback to SMS if not available
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: phone,
        options: {
          channel: 'whatsapp',
          data: {
            name: name,
            full_name: name
          },
          shouldCreateUser: true
        }
      })

      if (error) {
        // If WhatsApp fails, try SMS as fallback
        console.warn('WhatsApp OTP failed, trying SMS:', error.message)
        const smsResult = await supabase.auth.signInWithOtp({
          phone: phone,
          options: {
            channel: 'sms',
            data: {
              name: name,
              full_name: name
            },
            shouldCreateUser: true
          }
        })
        
        if (smsResult.error) {
          return { error: `Failed to send OTP: ${smsResult.error.message}` }
        }
        
        return {}
      }

      return {}
    } catch (error) {
      console.error('WhatsApp sign up error:', error)
      return { error: 'Failed to send OTP. Please check your phone number and try again.' }
    }
  }

  const verifyWhatsAppOTP = async (phone: string, otp: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: otp,
        type: 'sms'
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      console.error('OTP verification error:', error)
      return { error: 'Failed to verify OTP' }
    }
  }

  const signOut = async () => {
    clearDataCache()
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signIn, 
      signUp, 
      signOut, 
      signInWithGoogle, 
      signInWithWhatsApp, 
      verifyWhatsAppOTP, 
      signUpWithWhatsApp 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
