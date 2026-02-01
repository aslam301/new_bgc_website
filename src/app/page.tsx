import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Users, Calendar, Gamepad2, TrendingUp, Zap, IndianRupee } from 'lucide-react'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen art-bg relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-40 right-10 w-40 h-40 bg-sunny/15 -rotate-12 -z-10 animate-float" />
        <div className="absolute top-[60%] -left-16 w-32 h-32 bg-grape/10 rotate-45 -z-10 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-coral/15 rotate-12 -z-10 animate-float" style={{ animationDelay: '4s' }} />

        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center space-y-8 mb-20">
            <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
              <h1 className="text-5xl md:text-7xl font-black text-ink tracking-tight leading-none mb-6">
                India's Platform for
                <br />
                <span className="text-coral">Board Gaming Communities</span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Create your community page, manage events, showcase games, and grow your following
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: '100ms' }}>
              <Link href="/auth/signup">
                <button className="px-8 py-4 bg-coral text-white font-bold rounded-lg border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))] btn-lift text-lg uppercase tracking-wider">
                  Get Started
                </button>
              </Link>
              <Link href="/communities">
                <button className="px-8 py-4 bg-white text-ink font-bold rounded-lg border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))] btn-lift text-lg uppercase tracking-wider">
                  Explore
                </button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="max-w-6xl mx-auto mb-20">
            <div className="text-center mb-12 animate-slide-up" style={{ animationDelay: '150ms' }}>
              <h2 className="text-3xl md:text-4xl font-black text-ink mb-3 uppercase tracking-tight">
                Everything You Need
              </h2>
              <p className="text-muted-foreground">Built for Indian board gaming communities</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-6 bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))] btn-lift animate-slide-up"
                  style={{ animationDelay: `${200 + index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 ${feature.bgColor} border-2 border-ink`}>
                      <feature.icon size={24} strokeWidth={2.5} className={feature.iconColor} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-black mb-2 text-ink uppercase tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="max-w-3xl mx-auto text-center animate-slide-up" style={{ animationDelay: '500ms' }}>
            <div className="bg-coral border-2 border-ink shadow-[6px_6px_0_0_hsl(var(--ink))] p-12">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4 uppercase tracking-tight">
                Ready to Build Your Community?
              </h2>
              <p className="text-white/90 mb-8 text-lg">
                Get your shareable profile page in under 5 minutes
              </p>
              <Link href="/auth/signup">
                <button className="px-8 py-4 bg-white text-coral font-bold rounded-lg border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))] btn-lift text-lg uppercase tracking-wider">
                  Create Your Community
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

const features = [
  {
    icon: Users,
    bgColor: 'bg-coral/20',
    iconColor: 'text-coral',
    title: 'Community Profiles',
    description: 'Your link-in-bio for board gaming. Create a shareable profile in minutes.',
  },
  {
    icon: Calendar,
    bgColor: 'bg-sunny/20',
    iconColor: 'text-ink',
    title: 'Event Management',
    description: 'Registrations, custom forms, QR tickets. Everything you need.',
  },
  {
    icon: Gamepad2,
    bgColor: 'bg-grape/20',
    iconColor: 'text-grape',
    title: 'Game Collections',
    description: 'Sync from BGG, showcase your library, connect with players.',
  },
  {
    icon: TrendingUp,
    bgColor: 'bg-mint/20',
    iconColor: 'text-mint',
    title: 'Marketplace',
    description: 'Buy, sell, trade with community trust and intermediaries.',
  },
  {
    icon: Zap,
    bgColor: 'bg-sky/20',
    iconColor: 'text-sky',
    title: 'Analytics',
    description: 'Track followers, engagement, and community growth.',
  },
  {
    icon: IndianRupee,
    bgColor: 'bg-sunny/20',
    iconColor: 'text-ink',
    title: 'Zero Cost Start',
    description: 'Start free, scale affordably. Built for Indian communities.',
  },
]
