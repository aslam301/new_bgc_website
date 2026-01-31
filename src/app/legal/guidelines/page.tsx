import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export default function GuidelinesPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <h1 className="text-4xl font-bold mb-6">Community Guidelines</h1>
          <p className="text-gray-600 mb-8">Last updated: February 2026</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Be Respectful</h2>
              <p className="text-gray-700 mb-4">
                Treat everyone with respect. No harassment, hate speech, or discrimination of any kind will be tolerated.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Keep It Relevant</h2>
              <p className="text-gray-700 mb-4">
                Content should be related to board gaming, community building, or relevant topics. No spam or off-topic posts.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. No Illegal Activity</h2>
              <p className="text-gray-700 mb-4">
                Do not use the platform for any illegal activities or to promote illegal content.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Protect Privacy</h2>
              <p className="text-gray-700 mb-4">
                Do not share personal information of others without their consent. Respect people's privacy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Authentic Content</h2>
              <p className="text-gray-700 mb-4">
                Do not impersonate others or create fake communities. Be honest and transparent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Report Violations</h2>
              <p className="text-gray-700 mb-4">
                If you see content that violates these guidelines, please report it to us at: <a href="mailto:support@boardgameculture.com" className="text-coral font-bold">support@boardgameculture.com</a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Consequences</h2>
              <p className="text-gray-700 mb-4">
                Violations may result in content removal, account suspension, or permanent ban depending on severity.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
