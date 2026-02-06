# BGG API Authentication Issue

## Status: ❌ BLOCKED

**Issue:** BGG XML API v2 now requires Bearer token authentication (as of 2026).

**Error:** `HTTP 401 Unauthorized` with `WWW-Authenticate: Bearer realm="xml api"`

## Investigation Needed:

1. **Check BGG Developer Program**:
   - Visit https://boardgamegeek.com/wiki/page/BGG_XML_API2
   - Check if they offer API keys
   - Apply for developer access

2. **Try XML API v1** (deprecated):
   - Endpoint: `https://boardgamegeek.com/xmlapi/collection/{username}`
   - Might still work without auth

3. **Contact BGG**:
   - Ask about API access for BoardGameCulture
   - Explain the platform use case

## Current Workaround:

✅ **Manual Game Addition** works perfectly:
- `/dashboard/communities/[slug]/games/add`
- Search existing games
- Request new games (admin approval)
- No BGG auth needed

## Future Solutions:

1. **Get BGG API Credentials** (when available)
2. **Web Scraping** (not recommended, against ToS)
3. **User Manual Entry** (current approach)
4. **Partner with BGG** (ideal long-term)

## Impact:

- **Low** - Manual game addition works fine
- Communities can still build collections
- BGG sync is nice-to-have, not critical
- Can add later when API access is available

## Recommendation:

**Launch without BGG auto-sync.** It's a premium feature that can be added later. The platform is fully functional without it!
