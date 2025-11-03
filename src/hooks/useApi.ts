import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { projectId, publicAnonKey } from '../utils/supabase/info'

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-faf41fa2`

// Global cache to prevent unnecessary API calls
const dataCache = {
  subjects: null as any,
  tasks: null as any,
  profile: null as any,
  analytics: null as any,
  lastFetch: {
    subjects: 0,
    tasks: 0,
    profile: 0,
    analytics: 0
  }
}

const CACHE_DURATION = 30000 // 30 seconds

// Function to clear cache (useful when user signs out)
export const clearDataCache = () => {
  dataCache.subjects = null
  dataCache.tasks = null
  dataCache.profile = null
  dataCache.analytics = null
  dataCache.lastFetch = {
    subjects: 0,
    tasks: 0,
    profile: 0,
    analytics: 0
  }
}

export function useApi() {
  const { session } = useAuth()

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token || publicAnonKey}`
  })

  const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'API request failed')
    }

    return data
  }

  return { fetchApi }
}

// Subject hooks
export function useSubjects() {
  const [subjects, setSubjects] = useState<any[]>(dataCache.subjects || [])
  const [loading, setLoading] = useState(!dataCache.subjects)
  const [error, setError] = useState<string | null>(null)
  const { fetchApi } = useApi()
  const { session } = useAuth()
  const hasFetched = useRef(false)

  const fetchSubjects = async (showLoading = true, forceRefresh = false) => {
    const now = Date.now()
    const isCacheValid = dataCache.subjects && (now - dataCache.lastFetch.subjects) < CACHE_DURATION
    
    if (isCacheValid && !forceRefresh) {
      setSubjects(dataCache.subjects)
      setLoading(false)
      return
    }

    try {
      if (showLoading) setLoading(true)
      const data = await fetchApi('/subjects')
      dataCache.subjects = data.subjects
      dataCache.lastFetch.subjects = now
      setSubjects(data.subjects)
      setError(null)
    } catch (err: any) {
      setError(err.message)
      console.error('Failed to fetch subjects:', err)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  useEffect(() => {
    if (session && !hasFetched.current) {
      hasFetched.current = true
      fetchSubjects()
    }
  }, [session])

  const createSubject = async (subject: { name: string; color_tag: string; shared_users?: string[] }) => {
    try {
      const data = await fetchApi('/subjects', {
        method: 'POST',
        body: JSON.stringify(subject)
      })
      // Optimistically update both state and cache
      const newSubjects = [...subjects, data.subject]
      setSubjects(newSubjects)
      dataCache.subjects = newSubjects
      return data.subject
    } catch (error) {
      // Refetch on error
      await fetchSubjects(false, true)
      throw error
    }
  }

  const updateSubject = async (id: string, updates: any) => {
    try {
      const data = await fetchApi(`/subjects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      })
      // Optimistically update both state and cache
      const newSubjects = subjects.map(s => s.id === id ? data.subject : s)
      setSubjects(newSubjects)
      dataCache.subjects = newSubjects
      return data.subject
    } catch (error) {
      // Refetch on error
      await fetchSubjects(false, true)
      throw error
    }
  }

  const deleteSubject = async (id: string) => {
    try {
      await fetchApi(`/subjects/${id}`, { method: 'DELETE' })
      // Optimistically update both state and cache
      const newSubjects = subjects.filter(s => s.id !== id)
      setSubjects(newSubjects)
      dataCache.subjects = newSubjects
    } catch (error) {
      // Refetch on error
      await fetchSubjects(false, true)
      throw error
    }
  }

  return { subjects, loading, error, createSubject, updateSubject, deleteSubject, refetch: () => fetchSubjects(true, true) }
}

// Task hooks
export function useTasks() {
  const [tasks, setTasks] = useState<any[]>(dataCache.tasks || [])
  const [loading, setLoading] = useState(!dataCache.tasks)
  const [error, setError] = useState<string | null>(null)
  const { fetchApi } = useApi()
  const { session } = useAuth()
  const hasFetched = useRef(false)

  const fetchTasks = async (showLoading = true, forceRefresh = false) => {
    const now = Date.now()
    const isCacheValid = dataCache.tasks && (now - dataCache.lastFetch.tasks) < CACHE_DURATION
    
    if (isCacheValid && !forceRefresh) {
      setTasks(dataCache.tasks)
      setLoading(false)
      return
    }

    try {
      if (showLoading) setLoading(true)
      const data = await fetchApi('/tasks')
      dataCache.tasks = data.tasks
      dataCache.lastFetch.tasks = now
      setTasks(data.tasks)
      setError(null)
    } catch (err: any) {
      setError(err.message)
      console.error('Failed to fetch tasks:', err)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  useEffect(() => {
    if (session && !hasFetched.current) {
      hasFetched.current = true
      fetchTasks()
    }
  }, [session])

  const createTask = async (task: {
    subject_id?: string
    title: string
    type: string
    priority: string
    due_date: string
    status?: string
    description?: string
  }) => {
    try {
      const data = await fetchApi('/tasks', {
        method: 'POST',
        body: JSON.stringify(task)
      })
      // Optimistically update both state and cache
      const newTasks = [...tasks, data.task]
      setTasks(newTasks)
      dataCache.tasks = newTasks
      return data.task
    } catch (error) {
      // Refetch on error
      await fetchTasks(false, true)
      throw error
    }
  }

  const updateTask = async (id: string, updates: any) => {
    try {
      const data = await fetchApi(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      })
      // Optimistically update both state and cache
      const newTasks = tasks.map(t => t.id === id ? data.task : t)
      setTasks(newTasks)
      dataCache.tasks = newTasks
      return data.task
    } catch (error) {
      // Refetch on error
      await fetchTasks(false, true)
      throw error
    }
  }

  const deleteTask = async (id: string) => {
    try {
      await fetchApi(`/tasks/${id}`, { method: 'DELETE' })
      // Optimistically update both state and cache
      const newTasks = tasks.filter(t => t.id !== id)
      setTasks(newTasks)
      dataCache.tasks = newTasks
    } catch (error) {
      // Refetch on error
      await fetchTasks(false, true)
      throw error
    }
  }

  return { tasks, loading, error, createTask, updateTask, deleteTask, refetch: () => fetchTasks(true, true) }
}

// Analytics hook
export function useAnalytics() {
  const [analytics, setAnalytics] = useState<any>(dataCache.analytics)
  const [loading, setLoading] = useState(!dataCache.analytics)
  const [error, setError] = useState<string | null>(null)
  const { fetchApi } = useApi()
  const { session } = useAuth()
  const hasFetched = useRef(false)

  const fetchAnalytics = async (forceRefresh = false) => {
    const now = Date.now()
    const isCacheValid = dataCache.analytics && (now - dataCache.lastFetch.analytics) < CACHE_DURATION
    
    if (isCacheValid && !forceRefresh) {
      setAnalytics(dataCache.analytics)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await fetchApi('/analytics')
      dataCache.analytics = data
      dataCache.lastFetch.analytics = now
      setAnalytics(data)
      setError(null)
    } catch (err: any) {
      setError(err.message)
      console.error('Failed to fetch analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session && !hasFetched.current) {
      hasFetched.current = true
      fetchAnalytics()
    }
  }, [session])

  return { analytics, loading, error, refetch: () => fetchAnalytics(true) }
}

// User profile hook
export function useProfile() {
  const [profile, setProfile] = useState<any>(dataCache.profile)
  const [loading, setLoading] = useState(!dataCache.profile)
  const [error, setError] = useState<string | null>(null)
  const { fetchApi } = useApi()
  const { session } = useAuth()
  const hasFetched = useRef(false)

  const fetchProfile = async (forceRefresh = false) => {
    const now = Date.now()
    const isCacheValid = dataCache.profile && (now - dataCache.lastFetch.profile) < CACHE_DURATION
    
    if (isCacheValid && !forceRefresh) {
      setProfile(dataCache.profile)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await fetchApi('/user/profile')
      dataCache.profile = data.profile
      dataCache.lastFetch.profile = now
      setProfile(data.profile)
      setError(null)
    } catch (err: any) {
      setError(err.message)
      console.error('Failed to fetch profile:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session && !hasFetched.current) {
      hasFetched.current = true
      fetchProfile()
    }
  }, [session])

  const updateProfile = async (updates: { name?: string; avatar?: string }) => {
    try {
      const data = await fetchApi('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(updates)
      })
      // Update both state and cache
      dataCache.profile = data.profile
      setProfile(data.profile)
      return data.profile
    } catch (error) {
      // Refetch on error
      await fetchProfile(true)
      throw error
    }
  }

  return { profile, loading, error, updateProfile, refetch: () => fetchProfile(true) }
}
