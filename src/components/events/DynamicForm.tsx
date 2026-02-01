'use client'

import type { FormField, CustomFormSchema } from '@/types/events'

interface DynamicFormProps {
  schema: CustomFormSchema
  data: Record<string, any>
  onChange: (data: Record<string, any>) => void
}

export function DynamicForm({ schema, data, onChange }: DynamicFormProps) {
  const handleFieldChange = (fieldId: string, value: any) => {
    onChange({
      ...data,
      [fieldId]: value,
    })
  }

  const renderField = (field: FormField) => {
    const value = data[field.id] || ''

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full px-4 py-3 bg-background border-2 border-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral shadow-[2px_2px_0_0_hsl(var(--ink))]"
          />
        )

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className="w-full px-4 py-3 bg-background border-2 border-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral shadow-[2px_2px_0_0_hsl(var(--ink))] resize-none"
          />
        )

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            className="w-full px-4 py-3 bg-background border-2 border-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral shadow-[2px_2px_0_0_hsl(var(--ink))]"
          >
            <option value="">Select an option</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  required={field.required}
                  className="w-5 h-5 border-2 border-ink text-coral focus:ring-2 focus:ring-coral"
                />
                <span className="text-sm font-mono">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => {
              const checked = Array.isArray(value) ? value.includes(option) : false
              return (
                <label key={index} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    value={option}
                    checked={checked}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : []
                      const newValues = e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter((v) => v !== option)
                      handleFieldChange(field.id, newValues)
                    }}
                    className="w-5 h-5 border-2 border-ink text-coral focus:ring-2 focus:ring-coral"
                  />
                  <span className="text-sm font-mono">{option}</span>
                </label>
              )
            })}
          </div>
        )

      default:
        return null
    }
  }

  if (!schema.fields || schema.fields.length === 0) {
    return null
  }

  return (
    <div className="space-y-5">
      {schema.fields.map((field) => (
        <div key={field.id}>
          <label className="block text-sm font-bold text-foreground mb-2">
            {field.label}
            {field.required && <span className="text-coral ml-1">*</span>}
          </label>
          {renderField(field)}
        </div>
      ))}
    </div>
  )
}
