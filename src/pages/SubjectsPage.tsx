import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSubjects, useTasks } from '../hooks/useApi'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Plus, BookOpen, Trash2, Edit } from 'lucide-react'
import { CreateSubjectDialog } from '../components/CreateSubjectDialog'
import { EditSubjectDialog } from '../components/EditSubjectDialog'

export function SubjectsPage() {
  const { subjects, loading, deleteSubject } = useSubjects()
  const { tasks } = useTasks()
  const navigate = useNavigate()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<any>(null)

  const getSubjectTaskCount = (subjectId: string) => {
    return tasks.filter(task => task.subject_id === subjectId).length
  }

  const getSubjectCompletedCount = (subjectId: string) => {
    return tasks.filter(task => task.subject_id === subjectId && task.status === 'done').length
  }

  const handleDelete = async (subjectId: string, subjectName: string) => {
    if (confirm(`Are you sure you want to delete "${subjectName}"? This will also delete all associated tasks.`)) {
      await deleteSubject(subjectId)
    }
  }

  // Show loading only if we have no data at all
  const isInitialLoading = loading && subjects.length === 0
  
  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <div className="text-gray-500 font-medium">Loading subjects...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-600 mt-1">Manage your courses and subjects</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Subject
        </Button>
      </div>

      {/* Loading indicator for background updates */}
      {loading && subjects.length > 0 && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Updating...</span>
          </div>
        </div>
      )}

      {/* Subjects Grid */}
      {subjects.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-gray-900 mb-2">No subjects yet</h2>
          <p className="text-gray-600 mb-6">
            Start by creating your first subject to organize your tasks
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Subject
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subject => {
            const totalTasks = getSubjectTaskCount(subject.id)
            const completedTasks = getSubjectCompletedCount(subject.id)
            const completionRate = totalTasks > 0 
              ? Math.round((completedTasks / totalTasks) * 100) 
              : 0

            return (
              <Card 
                key={subject.id} 
                className="p-6 cursor-pointer hover:shadow-lg transition-shadow group"
                onClick={() => navigate(`/app/kanban/${subject.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${subject.color_tag}20` }}
                  >
                    <BookOpen 
                      className="w-6 h-6" 
                      style={{ color: subject.color_tag }}
                    />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingSubject(subject)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(subject.id, subject.name)
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                <h3 className="text-gray-900 mb-1">{subject.name}</h3>
                
                <div className="flex items-center justify-between text-gray-600 mb-4">
                  <span>{totalTasks} tasks</span>
                  <span>{completionRate}% complete</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all"
                    style={{ 
                      width: `${completionRate}%`,
                      backgroundColor: subject.color_tag
                    }}
                  />
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <CreateSubjectDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {editingSubject && (
        <EditSubjectDialog
          subject={editingSubject}
          open={!!editingSubject}
          onOpenChange={(open) => !open && setEditingSubject(null)}
        />
      )}
    </div>
  )
}
