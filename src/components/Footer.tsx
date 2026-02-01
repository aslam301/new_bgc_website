import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-ink text-white border-t-brutal">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold mb-3">BoardGameCulture</h3>
            <p className="text-gray-300 text-sm">
              India's community-first platform for board gaming communities.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-bold mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/discover" className="text-gray-300 hover:text-coral transition-colors">
                  Discover Communities
                </Link>
              </li>
              <li>
                <Link href="/platform" className="text-gray-300 hover:text-coral transition-colors">
                  For Communities
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-coral transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-coral transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal/terms" className="text-gray-300 hover:text-coral transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-gray-300 hover:text-coral transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/refund" className="text-gray-300 hover:text-coral transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="text-gray-300 hover:text-coral transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/guidelines" className="text-gray-300 hover:text-coral transition-colors">
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-bold mb-3">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-coral transition-colors"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-coral transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-coral transition-colors"
                >
                  Discord
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@boardgameculture.com"
                  className="text-gray-300 hover:text-coral transition-colors"
                >
                  Email Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t-2 border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-300">
          <p>© {currentYear} BoardGameCulture. All rights reserved.</p>
          <p className="mt-2 md:mt-0">
            Made with 🎲 for the board gaming community in India
          </p>
        </div>
      </div>
    </footer>
  )
}
