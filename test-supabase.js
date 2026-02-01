// Quick Supabase connection test
const https = require('https')

const SUPABASE_URL = 'https://isqevkxpkdkvloimbntl.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzcWV2a3hwa2RrdmxvaW1ibnRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODU3ODAsImV4cCI6MjA4NTQ2MTc4MH0.vVqVrKZlMYMit-7jjJoKB97QtBVQv9nFmIYmurmmwEY'

console.log('Testing Supabase connection...')
console.log('URL:', SUPABASE_URL)
console.time('Connection Time')

const options = {
  hostname: 'isqevkxpkdkvloimbntl.supabase.co',
  path: '/rest/v1/',
  method: 'GET',
  headers: {
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${ANON_KEY}`
  }
}

const req = https.request(options, (res) => {
  console.timeEnd('Connection Time')
  console.log('Status Code:', res.statusCode)
  console.log('Headers:', res.headers)

  let data = ''
  res.on('data', (chunk) => {
    data += chunk
  })

  res.on('end', () => {
    console.log('\nResponse:', data.substring(0, 200))
    console.log('\n✅ Connection successful!')
  })
})

req.on('error', (error) => {
  console.timeEnd('Connection Time')
  console.error('\n❌ Connection failed:', error.message)
  console.error('Error details:', error)
})

req.setTimeout(10000, () => {
  console.timeEnd('Connection Time')
  console.error('\n❌ Request timeout after 10 seconds')
  req.destroy()
})

req.end()
