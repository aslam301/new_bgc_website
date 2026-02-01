'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import type { BGGSyncJob } from '@/types/games'

interface BGGSyncButtonProps {
  communitySlug: string
  onSyncComplete?: () => void
}

export default function BGGSyncButton({
  communitySlug,
  onSyncComplete,
}: BGGSyncButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [syncJob, setSyncJob] = useState<BGGSyncJob | null>(null)
  const [polling, setPolling] = useState(false)

  const startSync = async () => {
    if (!username.trim()) {
      setError('Please enter a BGG username')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/communities/${communitySlug}/games/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bgg_username: username }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to start sync')
      }

      const { syncJob: job } = await res.json()
      setSyncJob(job)
      setPolling(true)

      // Start polling for status
      pollSyncStatus(job.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start sync')
    } finally {
      setLoading(false)
    }
  }

  const pollSyncStatus = async (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/communities/${communitySlug}/games/sync?job_id=${jobId}`
        )

        if (!res.ok) {
          clearInterval(interval)
          setPolling(false)
          return
        }

        const { job } = await res.json()
        setSyncJob(job)

        if (job.status === 'completed' || job.status === 'failed') {
          clearInterval(interval)
          setPolling(false)

          if (job.status === 'completed') {
            setTimeout(() => {
              setShowModal(false)
              onSyncComplete?.()
            }, 2000)
          }
        }
      } catch (err) {
        console.error('Error polling sync status:', err)
      }
    }, 2000) // Poll every 2 seconds
  }

  const getProgressPercentage = () => {
    if (!syncJob || syncJob.total_games === 0) return 0
    return Math.round((syncJob.processed_games / syncJob.total_games) * 100)
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Download className="w-4 h-4" />
        Sync from BGG
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              Sync from BoardGameGeek
            </h3>

            {!syncJob ? (
              <>
                <p className="text-gray-600 mb-4">
                  Enter your BGG username to import your collection. This will
                  fetch all games marked as owned in your BGG profile.
                </p>

                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="BGG Username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />

                {error && (
                  <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={startSync}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Start Sync
                  </button>
                </div>
              </>
            ) : (
              <>
                {syncJob.status === 'pending' && (
                  <div className="text-center py-4">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
                    <p className="text-gray-600">Preparing to sync...</p>
                  </div>
                )}

                {syncJob.status === 'processing' && (
                  <div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">
                          {syncJob.processed_games} / {syncJob.total_games}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressPercentage()}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                      <p className="text-sm text-gray-600">
                        Syncing games from BGG... This may take a few minutes.
                      </p>
                      {syncJob.new_games_added > 0 && (
                        <p className="text-sm text-green-600 mt-2">
                          Added {syncJob.new_games_added} new games
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {syncJob.status === 'completed' && (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Sync Complete!
                    </h4>
                    <p className="text-gray-600">
                      Successfully synced {syncJob.total_games} games
                      {syncJob.new_games_added > 0 &&
                        ` (${syncJob.new_games_added} new)`}
                    </p>
                  </div>
                )}

                {syncJob.status === 'failed' && (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg
                        className="w-6 h-6 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Sync Failed
                    </h4>
                    <p className="text-red-600 text-sm">
                      {syncJob.error_message || 'An error occurred'}
                    </p>
                    <button
                      onClick={() => {
                        setSyncJob(null)
                        setUsername('')
                      }}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {!polling && syncJob.status === 'completed' && (
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Close
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
