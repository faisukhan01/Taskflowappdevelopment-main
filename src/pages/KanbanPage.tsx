import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useTasks, useSubjects } from '../hooks/useApi'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { ArrowLeft, Plus } from 'lucide-react'
import { CreateTaskDialog } from '../components/CreateTaskDialog'
import { TaskCard } from '../components/TaskCard'

const COLUMNS = [
  { id: 'to-do', title: 'To Do', color: 'bg-blue-100' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-purple-100' },
  { id: 'done', title: 'Done', color: 'bg-green-100' }
]

interface DraggableTaskProps {
  task: any
  subject: any
}

function DraggableTask({ task, subject }: DraggableTaskProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <TaskCard task={task} subject={subject} />
    </div>
  )
}

interface DropZoneProps {
  status: string
  children: React.ReactNode
  onDrop: (taskId: string, newStatus: string) => void
}

function DropZone({ status, children, onDrop }: DropZoneProps) {
  const [{ isOver }, drop] = useDrop({
    accept: 'TASK',
    drop: (item: { id: string; status: string }) => {
      if (item.status !== status) {
        onDrop(item.id, status)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  })

  return (
    <div
      ref={drop}
      className={`min-h-[400px] p-4 rounded-lg transition-colors ${
        isOver ? 'bg-blue-50 ring-2 ring-blue-400' : ''
      }`}
    >
      {children}
    </div>
  )
}

export function KanbanPage() {
  const { subjectId } = useParams()
  const navigate = useNavigate()
  const { tasks, updateTask } = useTasks()
  const { subjects } = useSubjects()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const subject = subjects.find(s => s.id === subjectId)
  const subjectTasks = subjectId 
    ? tasks.filter(t => t.subject_id === subjectId)
    : tasks

  const handleDrop = async (taskId: string, newStatus: string) => {
    await updateTask(taskId, { status: newStatus })
  }

  if (!subject && subjectId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-900 mb-4">Subject not found</p>
          <Button onClick={() => navigate('/app/subjects')}>
            Back to Subjects
          </Button>
        </div>
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/subjects')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                {subject && (
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: subject.color_tag }}
                  />
                )}
                <h1 className="text-gray-900">{subject?.name || 'All Tasks'}</h1>
              </div>
              <p className="text-gray-600 mt-1">
                {subjectTasks.length} tasks • Drag and drop to update status
              </p>
            </div>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map(column => {
            const columnTasks = subjectTasks.filter(t => t.status === column.id)
            
            return (
              <div key={column.id}>
                <div className={`${column.color} rounded-lg p-3 mb-4`}>
                  <h2 className="text-gray-900">{column.title}</h2>
                  <p className="text-gray-600 mt-1">{columnTasks.length} tasks</p>
                </div>

                <DropZone status={column.id} onDrop={handleDrop}>
                  <div className="space-y-3">
                    {columnTasks.length === 0 ? (
                      <Card className="p-8 text-center border-dashed">
                        <p className="text-gray-500">No tasks</p>
                      </Card>
                    ) : (
                      columnTasks.map(task => (
                        <DraggableTask 
                          key={task.id} 
                          task={task} 
                          subject={subject}
                        />
                      ))
                    )}
                  </div>
                </DropZone>
              </div>
            )
          })}
        </div>

        <CreateTaskDialog 
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          defaultSubjectId={subjectId}
        />
      </div>
    </DndProvider>
  )
}
