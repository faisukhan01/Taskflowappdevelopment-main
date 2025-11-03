import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', cors())
app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Helper function to verify user
async function verifyUser(authHeader: string | null) {
  if (!authHeader) return null
  const accessToken = authHeader.split(' ')[1]
  const { data: { user }, error } = await supabase.auth.getUser(accessToken)
  if (error || !user) return null
  return user
}

// ============================================
// AUTH ROUTES
// ============================================

// Signup route
app.post('/make-server-faf41fa2/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json()
    
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400)
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })

    if (error) {
      console.log('Signup error:', error)
      return c.json({ error: error.message }, 400)
    }

    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email: data.user.email,
      name,
      avatar: null,
      created_at: new Date().toISOString()
    })

    return c.json({ user: data.user })
  } catch (error) {
    console.log('Signup error:', error)
    return c.json({ error: 'Failed to create user' }, 500)
  }
})

// ============================================
// USER PROFILE ROUTES
// ============================================

app.get('/make-server-faf41fa2/user/profile', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await kv.get(`user:${user.id}`)
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404)
    }

    return c.json({ profile })
  } catch (error) {
    console.log('Get profile error:', error)
    return c.json({ error: 'Failed to get profile' }, 500)
  }
})

app.put('/make-server-faf41fa2/user/profile', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { name, avatar } = await c.req.json()
    const profile = await kv.get(`user:${user.id}`)
    
    const updatedProfile = {
      ...profile,
      name: name || profile.name,
      avatar: avatar !== undefined ? avatar : profile.avatar
    }

    await kv.set(`user:${user.id}`, updatedProfile)
    return c.json({ profile: updatedProfile })
  } catch (error) {
    console.log('Update profile error:', error)
    return c.json({ error: 'Failed to update profile' }, 500)
  }
})

// ============================================
// SUBJECT ROUTES
// ============================================

app.get('/make-server-faf41fa2/subjects', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const subjects = await kv.getByPrefix(`subject:${user.id}:`)
    return c.json({ subjects: subjects || [] })
  } catch (error) {
    console.log('Get subjects error:', error)
    return c.json({ error: 'Failed to get subjects' }, 500)
  }
})

app.post('/make-server-faf41fa2/subjects', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { name, color_tag, shared_users } = await c.req.json()
    
    if (!name || !color_tag) {
      return c.json({ error: 'Name and color are required' }, 400)
    }

    const subjectId = crypto.randomUUID()
    const subject = {
      id: subjectId,
      user_id: user.id,
      name,
      color_tag,
      shared_users: shared_users || [],
      created_at: new Date().toISOString()
    }

    await kv.set(`subject:${user.id}:${subjectId}`, subject)
    return c.json({ subject })
  } catch (error) {
    console.log('Create subject error:', error)
    return c.json({ error: 'Failed to create subject' }, 500)
  }
})

app.put('/make-server-faf41fa2/subjects/:id', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const subjectId = c.req.param('id')
    const subject = await kv.get(`subject:${user.id}:${subjectId}`)
    
    if (!subject) {
      return c.json({ error: 'Subject not found' }, 404)
    }

    const { name, color_tag, shared_users } = await c.req.json()
    
    const updatedSubject = {
      ...subject,
      name: name || subject.name,
      color_tag: color_tag || subject.color_tag,
      shared_users: shared_users !== undefined ? shared_users : subject.shared_users
    }

    await kv.set(`subject:${user.id}:${subjectId}`, updatedSubject)
    return c.json({ subject: updatedSubject })
  } catch (error) {
    console.log('Update subject error:', error)
    return c.json({ error: 'Failed to update subject' }, 500)
  }
})

app.delete('/make-server-faf41fa2/subjects/:id', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const subjectId = c.req.param('id')
    
    // Delete all tasks associated with this subject
    const tasks = await kv.getByPrefix(`task:${user.id}:`)
    const tasksToDelete = tasks.filter((task: any) => task.subject_id === subjectId)
    
    for (const task of tasksToDelete) {
      await kv.del(`task:${user.id}:${task.id}`)
    }

    // Delete the subject
    await kv.del(`subject:${user.id}:${subjectId}`)
    return c.json({ success: true })
  } catch (error) {
    console.log('Delete subject error:', error)
    return c.json({ error: 'Failed to delete subject' }, 500)
  }
})

// ============================================
// TASK ROUTES
// ============================================

app.get('/make-server-faf41fa2/tasks', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const tasks = await kv.getByPrefix(`task:${user.id}:`)
    return c.json({ tasks: tasks || [] })
  } catch (error) {
    console.log('Get tasks error:', error)
    return c.json({ error: 'Failed to get tasks' }, 500)
  }
})

app.post('/make-server-faf41fa2/tasks', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { subject_id, title, type, priority, due_date, status, description } = await c.req.json()
    
    if (!title || !type || !priority || !due_date) {
      return c.json({ error: 'Title, type, priority, and due_date are required' }, 400)
    }

    const taskId = crypto.randomUUID()
    const task = {
      id: taskId,
      subject_id,
      user_id: user.id,
      title,
      type,
      priority,
      due_date,
      status: status || 'to-do',
      description: description || '',
      created_at: new Date().toISOString()
    }

    await kv.set(`task:${user.id}:${taskId}`, task)
    return c.json({ task })
  } catch (error) {
    console.log('Create task error:', error)
    return c.json({ error: 'Failed to create task' }, 500)
  }
})

app.put('/make-server-faf41fa2/tasks/:id', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const taskId = c.req.param('id')
    const task = await kv.get(`task:${user.id}:${taskId}`)
    
    if (!task) {
      return c.json({ error: 'Task not found' }, 404)
    }

    const updates = await c.req.json()
    
    const updatedTask = {
      ...task,
      ...updates,
      id: task.id,
      user_id: task.user_id,
      created_at: task.created_at
    }

    await kv.set(`task:${user.id}:${taskId}`, updatedTask)
    return c.json({ task: updatedTask })
  } catch (error) {
    console.log('Update task error:', error)
    return c.json({ error: 'Failed to update task' }, 500)
  }
})

app.delete('/make-server-faf41fa2/tasks/:id', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const taskId = c.req.param('id')
    await kv.del(`task:${user.id}:${taskId}`)
    return c.json({ success: true })
  } catch (error) {
    console.log('Delete task error:', error)
    return c.json({ error: 'Failed to delete task' }, 500)
  }
})

// ============================================
// ANALYTICS ROUTES
// ============================================

app.get('/make-server-faf41fa2/analytics', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const tasks = await kv.getByPrefix(`task:${user.id}:`)
    const subjects = await kv.getByPrefix(`subject:${user.id}:`)

    // Calculate completion rate per subject
    const subjectStats = subjects.map((subject: any) => {
      const subjectTasks = tasks.filter((task: any) => task.subject_id === subject.id)
      const completedTasks = subjectTasks.filter((task: any) => task.status === 'done')
      
      return {
        subject_id: subject.id,
        subject_name: subject.name,
        color_tag: subject.color_tag,
        total_tasks: subjectTasks.length,
        completed_tasks: completedTasks.length,
        completion_rate: subjectTasks.length > 0 
          ? (completedTasks.length / subjectTasks.length) * 100 
          : 0
      }
    })

    // Calculate tasks completed over time (last 7 days)
    const today = new Date()
    const weekData = []
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const completedOnDate = tasks.filter((task: any) => {
        if (task.status !== 'done') return false
        const taskDate = new Date(task.created_at).toISOString().split('T')[0]
        return taskDate === dateStr
      }).length

      weekData.push({
        date: dateStr,
        completed: completedOnDate
      })
    }

    // Overall stats
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((task: any) => task.status === 'done').length
    const inProgressTasks = tasks.filter((task: any) => task.status === 'in-progress').length
    const todoTasks = tasks.filter((task: any) => task.status === 'to-do').length

    return c.json({
      subjectStats,
      weekData,
      overall: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        todo: todoTasks
      }
    })
  } catch (error) {
    console.log('Get analytics error:', error)
    return c.json({ error: 'Failed to get analytics' }, 500)
  }
})

Deno.serve(app.fetch)
