// BGG API Client
// Handles communication with BoardGameGeek XML API v2

import { parseCollection, parseGameDetails, checkBGGError } from './parser'
import { requestQueue } from './queue'
import type { BGGCollectionItem, BGGGameDetails } from '@/types/games'

const BGG_API_BASE = 'https://boardgamegeek.com/xmlapi2'
const MAX_RETRIES = 3
const RETRY_DELAY = 2000 // 2 seconds

// In-memory cache for game details (prevents duplicate requests)
const gameDetailsCache = new Map<number, { data: BGGGameDetails; timestamp: number }>()
const CACHE_TTL = 1000 * 60 * 60 * 24 // 24 hours

// Fetch with retry logic and exponential backoff
async function fetchWithRetry(
  url: string,
  retries = MAX_RETRIES
): Promise<string> {
  let lastError: Error | null = null

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'BoardGameCulture/1.0',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const text = await response.text()

      // Check for BGG API errors
      const error = checkBGGError(text)
      if (error) {
        throw new Error(error)
      }

      // BGG sometimes returns 202 with a "please retry" message
      if (text.includes('queued') || text.includes('try again')) {
        if (i < retries - 1) {
          const delay = RETRY_DELAY * Math.pow(2, i)
          await new Promise((resolve) => setTimeout(resolve, delay))
          continue
        }
        throw new Error('BGG API request timeout - collection not ready')
      }

      return text
    } catch (error) {
      lastError = error as Error
      console.error(`BGG API request failed (attempt ${i + 1}/${retries}):`, error)

      if (i < retries - 1) {
        const delay = RETRY_DELAY * Math.pow(2, i)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error('BGG API request failed')
}

// Fetch user's BGG collection
export async function fetchCollection(
  username: string
): Promise<BGGCollectionItem[]> {
  const url = `${BGG_API_BASE}/collection?username=${encodeURIComponent(username)}&stats=1&excludesubtype=boardgameexpansion`

  try {
    const xml = await requestQueue.add(() => fetchWithRetry(url))
    const items = parseCollection(xml)
    return items
  } catch (error) {
    console.error('Error fetching BGG collection:', error)
    throw error
  }
}

// Fetch game details by BGG ID
export async function fetchGameDetails(
  bggId: number,
  useCache = true
): Promise<BGGGameDetails> {
  // Check cache first
  if (useCache) {
    const cached = gameDetailsCache.get(bggId)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data
    }
  }

  const url = `${BGG_API_BASE}/thing?id=${bggId}&stats=1`

  try {
    const xml = await requestQueue.add(() => fetchWithRetry(url))
    const details = parseGameDetails(xml)

    // Cache the result
    gameDetailsCache.set(bggId, {
      data: details,
      timestamp: Date.now(),
    })

    return details
  } catch (error) {
    console.error(`Error fetching game details for BGG ID ${bggId}:`, error)
    throw error
  }
}

// Search BGG for games by name
export async function searchGames(query: string): Promise<Array<{
  id: number
  name: string
  yearpublished: number
}>> {
  const url = `${BGG_API_BASE}/search?query=${encodeURIComponent(query)}&type=boardgame`

  try {
    const xml = await requestQueue.add(() => fetchWithRetry(url))

    // Simple parsing for search results
    const matches = xml.matchAll(/<item[^>]*id="(\d+)"[^>]*>[\s\S]*?<name[^>]*value="([^"]*)"[^>]*\/>[\s\S]*?(?:<yearpublished[^>]*value="(\d+)"[^>]*\/>)?/g)

    const results: Array<{ id: number; name: string; yearpublished: number }> = []
    for (const match of matches) {
      results.push({
        id: parseInt(match[1]),
        name: match[2],
        yearpublished: parseInt(match[3] || '0'),
      })
    }

    return results
  } catch (error) {
    console.error('Error searching BGG:', error)
    throw error
  }
}

// Clear cache (useful for testing or forced refresh)
export function clearCache() {
  gameDetailsCache.clear()
}

// Get cache statistics
export function getCacheStats() {
  return {
    size: gameDetailsCache.size,
    entries: Array.from(gameDetailsCache.keys()),
  }
}
