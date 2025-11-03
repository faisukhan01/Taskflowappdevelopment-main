import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useSubjects } from '../hooks/useApi'

const PRESET_COLORS = [
  { color: '#3B82F6', name: 'Blue' },
  { color: '#10B981', name: 'Green' },
  { color: '#F59E0B', name: 'Amber' },
  { color: '#EF4444', name: 'Red' },
  { color: '#8B5CF6', name: 'Purple' },
  { color: '#EC4899', name: 'Pink' },
  { color: '#06B6D4', name: 'Cyan' },
  { color: '#F97316', name: 'Orange' },
]

interface CreateSubjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateSubjectDialog({ open, onOpenChange }: CreateSubjectDialogProps) {
  const { createSubject } = useSubjects()
  const [name, setName] = useState('')
  const [colorTag, setColorTag] = useState(PRESET_COLORS[0].color)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createSubject({
        name,
        color_tag: colorTag,
        shared_users: []
      })

      setName('')
      setColorTag(PRESET_COLORS[0].color)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to create subject:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Subject</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="name">Subject Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Mathematics, Object-Oriented Programming, Database Systems"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label>Color Theme *</Label>
            <div className="grid grid-cols-4 gap-3 mt-2">
              {PRESET_COLORS.map(({ color, name: colorName }) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setColorTag(color)}
                  className={`w-full aspect-square rounded-lg border-2 transition-all hover:scale-105 ${
                    colorTag === color 
                      ? 'border-gray-900 scale-105 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={colorName}
                >
                  {colorTag === color && (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !name.trim()} 
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Create Subject'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
