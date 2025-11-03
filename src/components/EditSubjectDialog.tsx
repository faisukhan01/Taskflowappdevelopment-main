import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useSubjects } from '../hooks/useApi'

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
]

interface EditSubjectDialogProps {
  subject: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditSubjectDialog({ subject, open, onOpenChange }: EditSubjectDialogProps) {
  const { updateSubject } = useSubjects()
  const [name, setName] = useState(subject.name)
  const [colorTag, setColorTag] = useState(subject.color_tag)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setName(subject.name)
    setColorTag(subject.color_tag)
  }, [subject])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateSubject(subject.id, {
        name,
        color_tag: colorTag
      })

      onOpenChange(false)
    } catch (error) {
      console.error('Failed to update subject:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit Subject</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="name">Subject Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label>Color Tag *</Label>
            <div className="grid grid-cols-4 gap-3 mt-2">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setColorTag(color)}
                  className={`w-full aspect-square rounded-lg border-2 transition-all ${
                    colorTag === color ? 'border-gray-900 scale-110' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
