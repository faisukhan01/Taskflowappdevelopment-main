import React, { useState } from 'react'
import { useTasks, useSubjects } from '../hooks/useApi'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { TaskCard } from '../components/TaskCard'
import { CreateTaskDialog } from '../components/CreateTaskDialog'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function CalendarPage() {
  const { tasks } = useTasks()
  const { subjects } = useSubjects()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return tasks.filter(task => task.due_date === dateStr)
  }

  const getSubjectById = (id: string) => subjects.find(s => s.id === id)

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const renderCalendarDays = () => {
    const days = []
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="min-h-[100px] bg-gray-50 border border-gray-200" />
      )
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = date.toISOString().split('T')[0]
      const dayTasks = getTasksForDate(date)
      const isToday = new Date().toDateString() === date.toDateString()
      const isSelected = selectedDate?.toDateString() === date.toDateString()

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`min-h-[100px] border border-gray-200 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
            isToday ? 'bg-blue-50 border-blue-300' : ''
          } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        >
          <div className={`text-right mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayTasks.slice(0, 3).map(task => {
              const subject = getSubjectById(task.subject_id)
              return (
                <div
                  key={task.id}
                  className="text-white px-2 py-1 rounded truncate"
                  style={{ backgroundColor: subject?.color_tag || '#6B7280' }}
                  title={task.title}
                >
                  {task.title}
                </div>
              )
            })}
            {dayTasks.length > 3 && (
              <div className="text-gray-600 px-2">
                +{dayTasks.length - 3} more
              </div>
            )}
          </div>
        </div>
      )
    }

    return days
  }

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-1">View your tasks by date</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <Button variant="outline" size="sm" onClick={previousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-gray-900">
                {MONTHS[month]} {year}
              </h2>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map(day => (
                <div key={day} className="text-center text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {renderCalendarDays()}
            </div>
          </Card>
        </div>

        {/* Selected Date Tasks */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-6">
            <h3 className="text-gray-900 mb-4">
              {selectedDate 
                ? selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })
                : 'Select a date'
              }
            </h3>

            {selectedDate ? (
              selectedDateTasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No tasks for this day</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {selectedDateTasks.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      subject={getSubjectById(task.subject_id)}
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Click on a date to view tasks</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      <CreateTaskDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  )
}
