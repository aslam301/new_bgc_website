'use client'

import { useState } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import type { FormField, CustomFormSchema } from '@/types/events'

interface SimpleFormBuilderProps {
  schema: CustomFormSchema
  onChange: (schema: CustomFormSchema) => void
}

export function SimpleFormBuilder({ schema, onChange }: SimpleFormBuilderProps) {
  const [fields, setFields] = useState<FormField[]>(schema.fields || [])

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type,
      label: '',
      required: false,
      options: type === 'select' || type === 'radio' || type === 'checkbox' ? [''] : undefined,
    }

    const updatedFields = [...fields, newField]
    setFields(updatedFields)
    onChange({ fields: updatedFields })
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    const updatedFields = fields.map((field) =>
      field.id === id ? { ...field, ...updates } : field
    )
    setFields(updatedFields)
    onChange({ fields: updatedFields })
  }

  const removeField = (id: string) => {
    const updatedFields = fields.filter((field) => field.id !== id)
    setFields(updatedFields)
    onChange({ fields: updatedFields })
  }

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const updatedFields = fields.map((field) => {
      if (field.id === fieldId && field.options) {
        const newOptions = [...field.options]
        newOptions[optionIndex] = value
        return { ...field, options: newOptions }
      }
      return field
    })
    setFields(updatedFields)
    onChange({ fields: updatedFields })
  }

  const addOption = (fieldId: string) => {
    const updatedFields = fields.map((field) => {
      if (field.id === fieldId && field.options) {
        return { ...field, options: [...field.options, ''] }
      }
      return field
    })
    setFields(updatedFields)
    onChange({ fields: updatedFields })
  }

  const removeOption = (fieldId: string, optionIndex: number) => {
    const updatedFields = fields.map((field) => {
      if (field.id === fieldId && field.options) {
        const newOptions = field.options.filter((_, i) => i !== optionIndex)
        return { ...field, options: newOptions }
      }
      return field
    })
    setFields(updatedFields)
    onChange({ fields: updatedFields })
  }

  return (
    <div className="space-y-6">
      {/* Field Type Buttons */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider text-foreground mb-3">
          Add Custom Fields
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => addField('text')}
            className="px-3 py-2 bg-mint text-ink text-xs font-bold border-2 border-ink shadow-[2px_2px_0_0_hsl(var(--ink))] hover:shadow-[3px_3px_0_0_hsl(var(--ink))] transition-all"
          >
            + Text Field
          </button>
          <button
            type="button"
            onClick={() => addField('select')}
            className="px-3 py-2 bg-sunny text-ink text-xs font-bold border-2 border-ink shadow-[2px_2px_0_0_hsl(var(--ink))] hover:shadow-[3px_3px_0_0_hsl(var(--ink))] transition-all"
          >
            + Dropdown
          </button>
          <button
            type="button"
            onClick={() => addField('checkbox')}
            className="px-3 py-2 bg-grape text-white text-xs font-bold border-2 border-ink shadow-[2px_2px_0_0_hsl(var(--ink))] hover:shadow-[3px_3px_0_0_hsl(var(--ink))] transition-all"
          >
            + Checkbox
          </button>
          <button
            type="button"
            onClick={() => addField('textarea')}
            className="px-3 py-2 bg-coral text-white text-xs font-bold border-2 border-ink shadow-[2px_2px_0_0_hsl(var(--ink))] hover:shadow-[3px_3px_0_0_hsl(var(--ink))] transition-all"
          >
            + Text Area
          </button>
        </div>
      </div>

      {/* Field List */}
      {fields.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
            Custom Fields ({fields.length})
          </h4>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="bg-card border-2 border-ink p-4 shadow-[3px_3px_0_0_hsl(var(--ink))]"
            >
              <div className="flex items-start gap-3 mb-3">
                <GripVertical size={16} className="text-muted-foreground mt-2 flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  {/* Field Label */}
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                      Field Label
                    </label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      placeholder="e.g., Dietary Preferences"
                      className="w-full px-3 py-2 bg-background border-2 border-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral"
                    />
                  </div>

                  {/* Field Type Badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-background border border-ink">
                      {field.type}
                    </span>
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                        className="w-4 h-4 border-2 border-ink"
                      />
                      <span className="font-bold">Required</span>
                    </label>
                  </div>

                  {/* Options for select/radio/checkbox */}
                  {field.options && (
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground mb-2">
                        Options
                      </label>
                      <div className="space-y-2">
                        {field.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) =>
                                updateOption(field.id, optionIndex, e.target.value)
                              }
                              placeholder={`Option ${optionIndex + 1}`}
                              className="flex-1 px-3 py-1.5 bg-background border-2 border-ink text-xs font-mono focus:outline-none focus:ring-2 focus:ring-coral"
                            />
                            <button
                              type="button"
                              onClick={() => removeOption(field.id, optionIndex)}
                              className="px-2 py-1.5 bg-background border-2 border-ink hover:bg-coral hover:text-white transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addOption(field.id)}
                          className="text-xs font-bold text-coral hover:text-coral/80"
                        >
                          + Add Option
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeField(field.id)}
                  className="p-2 bg-coral text-white border-2 border-ink hover:bg-coral/90 transition-colors flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {fields.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-xs">
          No custom fields added yet. Use the buttons above to add fields.
        </div>
      )}
    </div>
  )
}
