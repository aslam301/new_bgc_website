// Game Management Types for Phase 3

export interface Game {
  id: string
  bgg_id: number | null

  // Basic info
  name: string
  year_published: number | null
  image_url: string | null
  thumbnail_url: string | null
  description: string | null

  // Gameplay
  min_players: number | null
  max_players: number | null
  playtime_min: number | null
  playtime_max: number | null
  recommended_age: number | null

  // Complexity
  complexity: number | null
  avg_weight: number | null

  // BGG stats
  bgg_rating: number | null
  bgg_num_ratings: number | null
  bgg_rank: number | null

  // Categorization
  categories: string[] | null
  mechanics: string[] | null
  designers: string[] | null
  publishers: string[] | null

  // BGG sync
  synced_from_bgg: boolean
  synced_at: string | null
  raw_bgg_data: any | null

  // Approval workflow
  is_approved: boolean
  created_by: string | null
  approved_by: string | null
  approved_at: string | null

  // Metadata
  created_at: string
  updated_at: string
}

export interface CommunityGame {
  id: string
  community_id: string
  game_id: string

  // Status
  status: 'own' | 'wishlist' | 'played' | 'want_to_play'

  // Details
  notes: string | null
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor' | null
  times_played: number
  acquisition_date: string | null

  // Metadata
  added_by: string | null
  created_at: string
  updated_at: string

  // Joined data (optional)
  game?: Game
  community?: {
    id: string
    name: string
    slug: string
    logo_url: string | null
    city?: string
    state?: string | null
    country?: string
  }
}

export interface BGGSyncJob {
  id: string
  community_id: string
  bgg_username: string

  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed'

  // Progress
  total_games: number
  processed_games: number
  new_games_added: number

  // Error handling
  error_message: string | null

  // Metadata
  started_by: string | null
  started_at: string
  completed_at: string | null
  created_at: string
}

// BGG API Response Types
export interface BGGCollectionItem {
  objectid: number
  name: string
  yearpublished: number
  thumbnail: string
  image: string
  status: {
    own?: boolean
    prevowned?: boolean
    fortrade?: boolean
    want?: boolean
    wanttoplay?: boolean
    wanttobuy?: boolean
    wishlist?: boolean
    preordered?: boolean
  }
  numplays: number
}

export interface BGGGameDetails {
  id: number
  name: string
  description: string
  image: string
  thumbnail: string
  yearpublished: number
  minplayers: number
  maxplayers: number
  playingtime: number
  minplaytime: number
  maxplaytime: number
  minage: number

  // Statistics
  ratings?: {
    average: number
    bayesaverage: number
    usersrated: number
    averageweight: number
  }
  ranks?: Array<{
    type: string
    id: number
    name: string
    friendlyname: string
    value: number | string
  }>

  // Categorization
  categories: Array<{ id: number; value: string }>
  mechanics: Array<{ id: number; value: string }>
  designers: Array<{ id: number; value: string }>
  publishers: Array<{ id: number; value: string }>
}

// Input Types
export interface CreateGameInput {
  bgg_id?: number
  name: string
  year_published?: number
  image_url?: string
  thumbnail_url?: string
  description?: string
  min_players?: number
  max_players?: number
  playtime_min?: number
  playtime_max?: number
  recommended_age?: number
  complexity?: number
  avg_weight?: number
  bgg_rating?: number
  bgg_num_ratings?: number
  bgg_rank?: number
  categories?: string[]
  mechanics?: string[]
  designers?: string[]
  publishers?: string[]
  synced_from_bgg?: boolean
  raw_bgg_data?: any
}

export interface UpdateGameInput {
  name?: string
  year_published?: number
  image_url?: string
  thumbnail_url?: string
  description?: string
  min_players?: number
  max_players?: number
  playtime_min?: number
  playtime_max?: number
  recommended_age?: number
  complexity?: number
  avg_weight?: number
  bgg_rating?: number
  bgg_num_ratings?: number
  bgg_rank?: number
  categories?: string[]
  mechanics?: string[]
  designers?: string[]
  publishers?: string[]
}

export interface AddCommunityGameInput {
  game_id: string
  status?: 'own' | 'wishlist' | 'played' | 'want_to_play'
  notes?: string
  condition?: 'new' | 'like-new' | 'good' | 'fair' | 'poor'
  times_played?: number
  acquisition_date?: string
}

export interface UpdateCommunityGameInput {
  status?: 'own' | 'wishlist' | 'played' | 'want_to_play'
  notes?: string
  condition?: 'new' | 'like-new' | 'good' | 'fair' | 'poor'
  times_played?: number
  acquisition_date?: string
}

export interface GameFilters {
  search?: string
  min_players?: number
  max_players?: number
  playtime_min?: number
  playtime_max?: number
  categories?: string[]
  mechanics?: string[]
  complexity_min?: number
  complexity_max?: number
  status?: 'own' | 'wishlist' | 'played' | 'want_to_play'
}

export interface StartBGGSyncInput {
  bgg_username: string
  community_id: string
}
