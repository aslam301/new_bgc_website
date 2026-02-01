// BGG XML Response Parser
import { XMLParser } from 'fast-xml-parser'
import type { BGGCollectionItem, BGGGameDetails } from '@/types/games'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseAttributeValue: true,
})

// Parse BGG collection XML response
export function parseCollection(xml: string): BGGCollectionItem[] {
  try {
    const result = parser.parse(xml)

    if (!result.items || !result.items.item) {
      return []
    }

    // Ensure items.item is always an array
    const items = Array.isArray(result.items.item)
      ? result.items.item
      : [result.items.item]

    return items.map((item: any) => ({
      objectid: item['@_objectid'],
      name: item.name?.['#text'] || item.name || '',
      yearpublished: item.yearpublished?.['#text'] || item.yearpublished || 0,
      thumbnail: item.thumbnail?.['#text'] || item.thumbnail || '',
      image: item.image?.['#text'] || item.image || '',
      status: {
        own: item.status?.['@_own'] === '1',
        prevowned: item.status?.['@_prevowned'] === '1',
        fortrade: item.status?.['@_fortrade'] === '1',
        want: item.status?.['@_want'] === '1',
        wanttoplay: item.status?.['@_wanttoplay'] === '1',
        wanttobuy: item.status?.['@_wanttobuy'] === '1',
        wishlist: item.status?.['@_wishlist'] === '1',
        preordered: item.status?.['@_preordered'] === '1',
      },
      numplays: item.numplays?.['#text'] || item.numplays || 0,
    }))
  } catch (error) {
    console.error('Error parsing BGG collection XML:', error)
    throw new Error('Failed to parse BGG collection response')
  }
}

// Parse BGG game details XML response
export function parseGameDetails(xml: string): BGGGameDetails {
  try {
    const result = parser.parse(xml)

    if (!result.items || !result.items.item) {
      throw new Error('Invalid game details response')
    }

    const item = Array.isArray(result.items.item)
      ? result.items.item[0]
      : result.items.item

    // Helper to get value from array or single object
    const getValue = (field: any) => {
      if (!field) return ''
      if (Array.isArray(field)) {
        return field[0]?.['@_value'] || field[0]?.['#text'] || ''
      }
      return field['@_value'] || field['#text'] || ''
    }

    // Helper to get array of values
    const getArray = (field: any) => {
      if (!field) return []
      const arr = Array.isArray(field) ? field : [field]
      return arr.map((item: any) => ({
        id: item['@_id'] || 0,
        value: item['@_value'] || item['#text'] || '',
      }))
    }

    // Parse statistics
    const stats = item.statistics?.ratings
    const ranks = stats?.ranks?.rank
    const rankArray = ranks ? (Array.isArray(ranks) ? ranks : [ranks]) : []

    return {
      id: item['@_id'],
      name: getValue(item.name),
      description: getValue(item.description),
      image: getValue(item.image),
      thumbnail: getValue(item.thumbnail),
      yearpublished: parseInt(getValue(item.yearpublished)) || 0,
      minplayers: parseInt(getValue(item.minplayers)) || 0,
      maxplayers: parseInt(getValue(item.maxplayers)) || 0,
      playingtime: parseInt(getValue(item.playingtime)) || 0,
      minplaytime: parseInt(getValue(item.minplaytime)) || 0,
      maxplaytime: parseInt(getValue(item.maxplaytime)) || 0,
      minage: parseInt(getValue(item.minage)) || 0,

      // Statistics
      ratings: stats
        ? {
            average: parseFloat(stats.average?.['@_value'] || '0'),
            bayesaverage: parseFloat(stats.bayesaverage?.['@_value'] || '0'),
            usersrated: parseInt(stats.usersrated?.['@_value'] || '0'),
            averageweight: parseFloat(stats.averageweight?.['@_value'] || '0'),
          }
        : undefined,

      ranks: rankArray.map((rank: any) => ({
        type: rank['@_type'] || '',
        id: rank['@_id'] || 0,
        name: rank['@_name'] || '',
        friendlyname: rank['@_friendlyname'] || '',
        value: rank['@_value'] === 'Not Ranked' ? 'Not Ranked' : parseInt(rank['@_value'] || '0'),
      })),

      // Categorization
      categories: getArray(item.link?.filter((l: any) => l['@_type'] === 'boardgamecategory')),
      mechanics: getArray(item.link?.filter((l: any) => l['@_type'] === 'boardgamemechanic')),
      designers: getArray(item.link?.filter((l: any) => l['@_type'] === 'boardgamedesigner')),
      publishers: getArray(item.link?.filter((l: any) => l['@_type'] === 'boardgamepublisher')),
    }
  } catch (error) {
    console.error('Error parsing BGG game details XML:', error)
    throw new Error('Failed to parse BGG game details response')
  }
}

// Check if BGG API returned an error
export function checkBGGError(xml: string): string | null {
  try {
    const result = parser.parse(xml)

    if (result.error) {
      return result.error.message?.['#text'] || result.error.message || 'BGG API error'
    }

    if (result.items && result.items['@_termsofuse']) {
      // Valid response
      return null
    }

    return null
  } catch (error) {
    return 'Failed to parse BGG response'
  }
}
