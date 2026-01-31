import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export default function CookiesPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <h1 className="text-4xl font-bold mb-6">Cookie Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: February 2026</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. What Are Cookies</h2>
              <p className="text-gray-700 mb-4">
                Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience and allow certain features to work.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Types of Cookies We Use</h2>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for the website to function (authentication, security)</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. Managing Cookies</h2>
              <p className="text-gray-700 mb-4">
                You can control and/or delete cookies as you wish. You can delete all cookies that are already on your device and you can set most browsers to prevent them from being placed.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Contact</h2>
              <p className="text-gray-700 mb-4">
                For questions about cookies, contact: <a href="mailto:privacy@boardgameculture.com" className="text-coral font-bold">privacy@boardgameculture.com</a>
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
