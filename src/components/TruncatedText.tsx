'use client'

import { useState } from 'react'

interface TruncatedTextProps {
  text: string
  maxLength?: number
}

export function TruncatedText({ text, maxLength = 150 }: TruncatedTextProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const needsTruncation = text.length > maxLength

  if (!needsTruncation) {
    return <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {isExpanded ? text : `${text.substring(0, maxLength)}...`}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 text-xs font-bold text-coral hover:text-grape transition-colors uppercase tracking-wide"
      >
        {isExpanded ? 'Show Less' : 'Show More'}
      </button>
    </div>
  )
}
