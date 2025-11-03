import React, { useState } from 'react'
import { useTasks, useSubjects } from '../hooks/useApi'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Plus, Calendar, AlertCircle, CheckCircle2, Clock, BookOpen } from 'lucide-react'
import { TaskCard } from '../components/TaskCard'
import { CreateTaskDialog } from '../components/CreateTaskDialog'
import { CreateSubjectDialog } from '../components/CreateSubjectDialog'

export function DashboardPage() {
  const { tasks, loading: tasksLoading } = useTasks()
  const { subjects, loading: subjectsLoading } = useSubjects()
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false)
  const [createSubjectDialogOpen, setCreateSubjectDialogOpen] = useState(false)

  // Calculate statistics
  const now = new Date()
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  const upcomingTasks = tasks.filter(task => {
    const dueDate = new Date(task.due_date)
    return task.status !== 'done' && dueDate >= now && dueDate <= sevenDaysFromNow
  }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

  const overdueTasks = tasks.filter(task => {
    const dueDate = new Date(task.due_date)
    return task.status !== 'done' && dueDate < now
  })

  const completedTasks = tasks.filter(task => task.status === 'done')
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress')

  const getSubjectById = (id: string) => subjects.find(s => s.id === id)

  const handleCreateTask = () => {
    if (subjects.length === 0) {
      alert('Please add at least one subject before creating tasks!')
      return
    }
    setCreateTaskDialogOpen(true)
  }

  // Show loading only if we have no data at all
  const isInitialLoading = (tasksLoading && tasks.length === 0) || (subjectsLoading && subjects.length === 0)
  
  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <div className="text-gray-500 font-medium">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your overview</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setCreateSubjectDialogOpen(true)}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Add Subject
          </Button>
          <Button onClick={handleCreateTask}>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Loading indicator for background updates */}
      {(tasksLoading || subjectsLoading) && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Updating...</span>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Upcoming</p>
              <p className="text-gray-900 mt-1">{upcomingTasks.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Overdue</p>
              <p className="text-gray-900 mt-1">{overdueTasks.length}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">In Progress</p>
              <p className="text-gray-900 mt-1">{inProgressTasks.length}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Completed</p>
              <p className="text-gray-900 mt-1">{completedTasks.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <div>
          <h2 className="text-gray-900 mb-4">Overdue Tasks</h2>
          <div className="space-y-3">
            {overdueTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                subject={getSubjectById(task.subject_id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Subjects Warning */}
      {subjects.length === 0 && (
        <Card className="p-8 text-center border-amber-200 bg-amber-50">
          <BookOpen className="w-16 h-16 text-amber-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-amber-900 mb-2">No Subjects Added</h2>
          <p className="text-amber-700 mb-6">
            You need to add at least one subject before you can create tasks. 
            Subjects help organize your work and track progress.
          </p>
          <Button 
            onClick={() => setCreateSubjectDialogOpen(true)}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Add Your First Subject
          </Button>
        </Card>
      )}

      {/* Upcoming This Week */}
      {subjects.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Due This Week</h2>
          {upcomingTasks.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-900">All caught up!</p>
              <p className="text-gray-600 mt-1">No tasks due in the next 7 days</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  subject={getSubjectById(task.subject_id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <CreateTaskDialog 
        open={createTaskDialogOpen}
        onOpenChange={setCreateTaskDialogOpen}
      />

      <CreateSubjectDialog 
        open={createSubjectDialogOpen}
        onOpenChange={setCreateSubjectDialogOpen}
      />
    </div>
  )
}
