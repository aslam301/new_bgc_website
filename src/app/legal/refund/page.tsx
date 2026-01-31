import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export default function RefundPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <h1 className="text-4xl font-bold mb-6">Refund Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: February 2026</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. General Policy</h2>
              <p className="text-gray-700 mb-4">
                All event registrations and transactions on BoardGameCulture are generally non-refundable except in cases of technical failures or event cancellations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Event Cancellations</h2>
              <p className="text-gray-700 mb-4">
                If an event is cancelled by the organizer, attendees will receive a full refund within 7-10 business days.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. Technical Failures</h2>
              <p className="text-gray-700 mb-4">
                If you were charged multiple times due to a technical error, please contact us with proof, and we'll issue a refund for the duplicate charges.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Refund Process</h2>
              <p className="text-gray-700 mb-4">
                To request a refund, email us at: <a href="mailto:support@boardgameculture.com" className="text-coral font-bold">support@boardgameculture.com</a> with your order details.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
