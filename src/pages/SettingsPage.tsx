import React, { useState, useEffect } from 'react'
import { useProfile } from '../hooks/useApi'
import { useAuth } from '../contexts/AuthContext'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { User, Mail, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function SettingsPage() {
  const { profile, loading: profileLoading, updateProfile } = useProfile()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      await updateProfile({ name })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  // Show loading only if we have no profile data at all
  if (profileLoading && !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <div className="text-gray-500 font-medium">Loading settings...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* Loading indicator for background updates */}
      {profileLoading && profile && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Updating...</span>
          </div>
        </div>
      )}

      {/* Profile Settings */}
      <Card className="p-6">
        <h2 className="text-gray-900 mb-6">Profile Information</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center gap-2 mt-1">
              <Mail className="w-5 h-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="flex-1"
              />
            </div>
            <p className="text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <Label htmlFor="name">Full Name</Label>
            <div className="flex items-center gap-2 mt-1">
              <User className="w-5 h-5 text-gray-400" />
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="flex-1"
              />
            </div>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              Profile updated successfully!
            </div>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Card>

      {/* Account Information */}
      <Card className="p-6">
        <h2 className="text-gray-900 mb-6">Account Information</h2>
        
        <div className="space-y-3 text-gray-600">
          <div className="flex justify-between">
            <span>Account created:</span>
            <span>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>User ID:</span>
            <span className="text-gray-500 truncate max-w-[200px]">{user?.id}</span>
          </div>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card className="p-6">
        <h2 className="text-gray-900 mb-4">Notification Preferences</h2>
        <p className="text-gray-600">
          TaskFlow will send browser notifications 1 day before task deadlines when enabled in your browser settings.
        </p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => {
            if ('Notification' in window) {
              Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                  alert('Notifications enabled! You will receive reminders for upcoming tasks.')
                }
              })
            } else {
              alert('Your browser does not support notifications.')
            }
          }}
        >
          Enable Browser Notifications
        </Button>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-red-200">
        <h2 className="text-red-600 mb-4">Danger Zone</h2>
        <p className="text-gray-600 mb-4">
          Sign out of your account. Your data will be saved and available when you sign back in.
        </p>
        <Button variant="destructive" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </Card>
    </div>
  )
}
