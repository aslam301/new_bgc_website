import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold text-ink">
            India's Platform for
            <br />
            <span className="text-coral">Board Gaming Communities</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Create your community page, manage events, showcase games, and grow your following
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/signup">
              <button className="px-8 py-4 bg-coral text-white font-bold rounded-lg border-brutal shadow-brutal hover:shadow-brutal-lg btn-lift text-lg">
                Get Started
              </button>
            </Link>
            <Link href="/communities">
              <button className="px-8 py-4 bg-white text-ink font-bold rounded-lg border-brutal shadow-brutal hover:shadow-brutal-lg btn-lift text-lg">
                Explore Communities
              </button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white border-brutal shadow-brutal rounded-lg hover:shadow-brutal-lg btn-lift"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-ink">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
    <Footer />
    </>
  );
}

const features = [
  {
    icon: "🏘️",
    title: "Community Profiles",
    description: "Your link-in-bio for board gaming. Create a shareable profile in minutes.",
  },
  {
    icon: "🎪",
    title: "Event Management",
    description: "Registrations, custom forms, QR tickets. Everything you need.",
  },
  {
    icon: "🎲",
    title: "Game Collections",
    description: "Sync from BGG, showcase your library, connect with players.",
  },
  {
    icon: "🛒",
    title: "Marketplace",
    description: "Buy, sell, trade with community trust and intermediaries.",
  },
  {
    icon: "📊",
    title: "Analytics",
    description: "Track followers, engagement, and community growth.",
  },
  {
    icon: "💰",
    title: "Zero Cost Start",
    description: "Start free, scale affordably. Built for Indian communities.",
  },
];
