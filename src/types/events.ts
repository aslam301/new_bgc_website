// Event Management Types for Phase 2

export interface FormField {
  id: string
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio'
  label: string
  required: boolean
  options?: string[] // For select, radio, checkbox
  placeholder?: string
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    message?: string
  }
}

export interface CustomFormSchema {
  fields: FormField[]
}

export interface EventType {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
}

export interface Event {
  id: string
  community_id: string

  // Basic info
  title: string
  slug: string
  description: string | null
  cover_image_url: string | null

  // Date/time
  start_date: string
  end_date: string
  timezone: string

  // Location
  venue_name: string
  venue_address: string
  city: string
  state: string | null
  country: string

  // Event settings
  event_type_id: string | null
  max_attendees: number | null
  is_free: boolean
  ticket_price: number
  currency: string

  // Custom form schema
  custom_form_schema: CustomFormSchema

  // Status
  status: 'draft' | 'published' | 'cancelled' | 'completed'

  // Statistics
  registration_count: number
  checked_in_count: number

  // Metadata
  created_by: string | null
  created_at: string
  updated_at: string

  // Joined data (optional)
  event_type?: EventType
  community?: {
    id: string
    name: string
    slug: string
    logo_url: string | null
  }
}

export interface EventRegistration {
  id: string
  event_id: string
  user_id: string | null

  // Basic info (always required)
  full_name: string
  email: string
  phone: string

  // Custom form data
  custom_form_data: Record<string, any>

  // Payment (if paid event)
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_id: string | null
  amount_paid: number | null

  // Ticket
  ticket_code: string
  qr_code_url: string | null

  // Check-in
  is_checked_in: boolean
  checked_in_at: string | null
  checked_in_by: string | null

  // Metadata
  created_at: string

  // Joined data (optional)
  event?: Event
}

export interface CreateEventInput {
  community_id: string
  title: string
  slug: string
  description?: string
  start_date: string
  end_date: string
  venue_name: string
  venue_address: string
  city: string
  state?: string
  event_type_id?: string
  max_attendees?: number
  is_free: boolean
  ticket_price?: number
  custom_form_schema?: CustomFormSchema
  status?: 'draft' | 'published' | 'cancelled' | 'completed'
}

export interface UpdateEventInput {
  title?: string
  slug?: string
  description?: string
  start_date?: string
  end_date?: string
  venue_name?: string
  venue_address?: string
  city?: string
  state?: string
  event_type_id?: string
  max_attendees?: number
  is_free?: boolean
  ticket_price?: number
  custom_form_schema?: CustomFormSchema
  status?: 'draft' | 'published' | 'cancelled' | 'completed'
}

export interface CreateRegistrationInput {
  event_id: string
  full_name: string
  email: string
  phone: string
  custom_form_data?: Record<string, any>
}

export interface EventFilters {
  search?: string
  city?: string
  event_type?: string
  date_from?: string
  date_to?: string
  is_free?: boolean
  community_id?: string
  status?: string
}
