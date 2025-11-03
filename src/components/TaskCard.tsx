import React, { useState } from 'react'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { MoreVertical, Trash2, Edit, Calendar } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { useTasks } from '../hooks/useApi'
import { EditTaskDialog } from './EditTaskDialog'

interface TaskCardProps {
  task: any
  subject?: any
}

export function TaskCard({ task, subject }: TaskCardProps) {
  const { deleteTask, updateTask } = useTasks()
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700'
  }

  const statusColors = {
    'to-do': 'bg-blue-100 text-blue-700',
    'in-progress': 'bg-purple-100 text-purple-700',
    'done': 'bg-green-100 text-green-700'
  }

  const typeIcons = {
    assignment: '📝',
    quiz: '📊',
    project: '🚀'
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    return `in ${diffDays} days`
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task.id)
    }
  }

  const toggleStatus = async () => {
    const statusOrder = ['to-do', 'in-progress', 'done']
    const currentIndex = statusOrder.indexOf(task.status)
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length]
    await updateTask(task.id, { status: nextStatus })
  }

  const isOverdue = new Date(task.due_date) < new Date() && task.status !== 'done'

  return (
    <>
      <Card className={`p-4 hover:shadow-md transition-shadow ${isOverdue ? 'border-red-300' : ''}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{typeIcons[task.type as keyof typeof typeIcons]}</span>
              {subject && (
                <div 
                  className="px-2 py-1 rounded text-white"
                  style={{ backgroundColor: subject.color_tag }}
                >
                  {subject.name}
                </div>
              )}
              <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
                {task.priority}
              </Badge>
            </div>
            
            <h3 className="text-gray-900 mb-1">{task.title}</h3>
            
            {task.description && (
              <p className="text-gray-600 mb-2 line-clamp-2">{task.description}</p>
            )}
            
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span className={isOverdue ? 'text-red-600' : ''}>
                  {formatDate(task.due_date)}
                </span>
              </div>
              <Badge 
                className={`${statusColors[task.status as keyof typeof statusColors]} cursor-pointer`}
                onClick={toggleStatus}
              >
                {task.status.replace('-', ' ')}
              </Badge>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      <EditTaskDialog
        task={task}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </>
  )
}
