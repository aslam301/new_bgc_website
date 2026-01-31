import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <h1 className="text-4xl font-bold mb-6">Terms & Conditions</h1>
          <p className="text-gray-600 mb-8">Last updated: February 2026</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using BoardGameCulture ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
              <p className="text-gray-700 mb-4">
                Permission is granted to temporarily use the Platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. Community Accounts</h2>
              <p className="text-gray-700 mb-4">
                When you create a community on our platform, you are responsible for maintaining the security of your account and you are fully responsible for all activities that occur under the account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. User Conduct</h2>
              <p className="text-gray-700 mb-4">
                You agree not to use the Platform to:
              </p>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>Violate any laws or regulations</li>
                <li>Post harmful, offensive, or inappropriate content</li>
                <li>Impersonate others or provide misleading information</li>
                <li>Spam or harass other users</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Content Ownership</h2>
              <p className="text-gray-700 mb-4">
                You retain ownership of content you post on the Platform. By posting content, you grant us a license to use, display, and distribute your content on the Platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                BoardGameCulture shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of or inability to use the Platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Contact</h2>
              <p className="text-gray-700 mb-4">
                For questions about these Terms, please contact us at: <a href="mailto:legal@boardgameculture.com" className="text-coral font-bold">legal@boardgameculture.com</a>
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
