import Link from 'next/link'

export const instant = false

const features = [
  {
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    title: 'Gestion des Leads',
    description: 'Centralisez tous vos prospects avec scoring automatique et suivi personnalise.',
  },
  {
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    title: 'Base Entreprises',
    description: 'Enrichissement automatique des donnees entreprises via SIRET et APIs France.',
  },
  {
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    title: 'Tableaux de Bord',
    description: 'Visualisez vos KPIs en temps reel: leads, conversions, performances.',
  },
  {
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    title: 'Gestion des Taches',
    description: 'Organisez vos suivis avec un Kanban integre et des rappels automatiques.',
  },
  {
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    title: 'Multi-tenant Securise',
    description: 'Isolation complete des donnees par organisation avec RLS PostgreSQL.',
  },
  {
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    title: 'API & Integrations',
    description: 'Connectez vos outils existants: Zapier, n8n, webhooks personnalises.',
  },
]

const plans = [
  {
    name: 'Free',
    price: '0',
    description: 'Pour demarrer et tester',
    features: ['50 leads/mois', '1 utilisateur', 'Dashboard basique', 'Export CSV'],
    cta: 'Commencer gratuitement',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '29',
    description: 'Pour les equipes en croissance',
    features: ['1,000 leads/mois', '5 utilisateurs', 'Enrichissement auto', 'Integrations API', 'Support prioritaire'],
    cta: 'Essai gratuit 14 jours',
    highlighted: true,
  },
  {
    name: 'Business',
    price: '79',
    description: 'Pour les entreprises etablies',
    features: ['Leads illimites', 'Utilisateurs illimites', 'SSO & SAML', 'API dedicee', 'Account manager'],
    cta: 'Contacter les ventes',
    highlighted: false,
  },
]

const testimonials = [
  {
    quote: 'ProspectHub nous a permis de tripler notre taux de conversion en 3 mois. Interface intuitive et enrichissement automatique top.',
    author: 'Marie Dupont',
    role: 'Directrice Commerciale',
    company: 'TechStartup SAS',
  },
  {
    quote: 'Enfin un CRM adapte aux PME francaises. Les donnees SIRET et Pappers integrees nous font gagner un temps fou.',
    author: 'Pierre Martin',
    role: 'CEO',
    company: 'ConseilPro',
  },
  {
    quote: 'Migration depuis HubSpot en 2 jours. Prix divise par 5 pour les memes fonctionnalites essentielles.',
    author: 'Sophie Leroy',
    role: 'Growth Manager',
    company: 'AgenceDigitale',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 h-[72px] border-b border-[#E2E4E6] bg-white/98 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#17191F] rounded-[10px] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#fff" />
                <path d="M2 17l10 5 10-5" stroke="#fff" strokeWidth="2" />
                <path d="M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-[#0D0F14]">ProspectHub</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <a href="#features" className="px-3 py-2 text-[#4E525A] font-medium hover:text-[#0D0F14] hover:bg-[#F5F7F9] rounded-[10px] transition-colors">
              Fonctionnalites
            </a>
            <a href="#pricing" className="px-3 py-2 text-[#4E525A] font-medium hover:text-[#0D0F14] hover:bg-[#F5F7F9] rounded-[10px] transition-colors">
              Tarifs
            </a>
            <a href="#testimonials" className="px-3 py-2 text-[#4E525A] font-medium hover:text-[#0D0F14] hover:bg-[#F5F7F9] rounded-[10px] transition-colors">
              Temoignages
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/demo"
              className="hidden sm:flex px-4 py-2 text-sm font-medium text-[#4E525A] hover:text-[#0D0F14] transition-colors"
            >
              Demo
            </Link>
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-medium text-[#4E525A] hover:text-[#0D0F14] transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 text-sm font-medium text-white bg-[#17191F] rounded-[10px] hover:bg-[#2D3039] transition-colors"
            >
              Commencer
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 text-sm font-medium text-[#1565C0] bg-[#E3F2FD] rounded-full">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Nouveau: Enrichissement PME France integre
          </div>

          <h1 className="text-[48px] md:text-[56px] font-bold text-[#0D0F14] leading-[1.1] tracking-[-0.02em] mb-6">
            Le CRM concu pour les
            <span className="text-[#1565C0]"> PME B2B France</span>
          </h1>

          <p className="text-xl text-[#4E525A] mb-10 max-w-2xl mx-auto leading-relaxed">
            Centralisez vos leads, enrichissez automatiquement vos donnees entreprises,
            et convertissez plus avec un outil simple et puissant.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-[#17191F] rounded-[12px] hover:bg-[#2D3039] transition-colors"
            >
              Demarrer gratuitement
            </Link>
            <Link
              href="/demo"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-[#0D0F14] bg-white border-2 border-[#E2E4E6] rounded-[12px] hover:border-[#17191F] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
              </svg>
              Voir la demo
            </Link>
          </div>

          <p className="mt-6 text-sm text-[#9BA0A6]">
            Gratuit pour toujours. Pas de carte bancaire requise.
          </p>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-8 border-y border-[#E2E4E6] bg-[#F5F7F9]">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-[#9BA0A6] mb-6">
            Ils nous font confiance
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60">
            {['TechStartup', 'ConseilPro', 'AgenceDigitale', 'InnovCorp', 'StartupLab'].map((company) => (
              <span key={company} className="text-lg font-semibold text-[#4E525A]">
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[36px] font-bold text-[#0D0F14] mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg text-[#4E525A] max-w-2xl mx-auto">
              Un CRM complet, sans la complexite. Concentrez-vous sur vos ventes, pas sur votre outil.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="p-6 bg-white border border-[#E2E4E6] rounded-[16px] hover:border-[#17191F] hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 mb-4 rounded-[12px] bg-[#F5F7F9] flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#17191F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#0D0F14] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#4E525A] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-[#F5F7F9]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[36px] font-bold text-[#0D0F14] mb-4">
              Tarifs simples et transparents
            </h2>
            <p className="text-lg text-[#4E525A]">
              Commencez gratuitement, evoluez selon vos besoins.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`p-8 rounded-[20px] ${
                  plan.highlighted
                    ? 'bg-[#17191F] text-white ring-4 ring-[#17191F]/20'
                    : 'bg-white border border-[#E2E4E6]'
                }`}
              >
                <h3 className={`text-xl font-semibold mb-2 ${plan.highlighted ? 'text-white' : 'text-[#0D0F14]'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.highlighted ? 'text-white/70' : 'text-[#4E525A]'}`}>
                  {plan.description}
                </p>
                <div className="mb-6">
                  <span className={`text-[48px] font-bold ${plan.highlighted ? 'text-white' : 'text-[#0D0F14]'}`}>
                    {plan.price}
                  </span>
                  <span className={plan.highlighted ? 'text-white/70' : 'text-[#4E525A]'}>
                    EUR/mois
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={plan.highlighted ? '#22C55E' : '#147A3A'}
                        strokeWidth="2"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className={plan.highlighted ? 'text-white/90' : 'text-[#4E525A]'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.name === 'Business' ? '/contact' : '/auth/register'}
                  className={`block w-full py-3 text-center font-semibold rounded-[10px] transition-colors ${
                    plan.highlighted
                      ? 'bg-white text-[#17191F] hover:bg-[#F5F7F9]'
                      : 'bg-[#17191F] text-white hover:bg-[#2D3039]'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[36px] font-bold text-[#0D0F14] mb-4">
              Ce que disent nos clients
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="p-6 bg-white border border-[#E2E4E6] rounded-[16px]"
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} width="20" height="20" viewBox="0 0 24 24" fill="#FBBF24">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p className="text-[#4E525A] mb-6 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-[#0D0F14]">{testimonial.author}</p>
                  <p className="text-sm text-[#9BA0A6]">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[#17191F]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[36px] font-bold text-white mb-4">
            Pret a booster vos ventes ?
          </h2>
          <p className="text-lg text-white/70 mb-10">
            Rejoignez des centaines de PME qui utilisent ProspectHub pour convertir plus de prospects.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-[#17191F] bg-white rounded-[12px] hover:bg-[#F5F7F9] transition-colors"
            >
              Commencer gratuitement
            </Link>
            <Link
              href="/demo"
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white border-2 border-white/30 rounded-[12px] hover:border-white transition-colors"
            >
              Voir la demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#E2E4E6]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#17191F] rounded-[8px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#fff" />
                  <path d="M2 17l10 5 10-5" stroke="#fff" strokeWidth="2" />
                  <path d="M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" />
                </svg>
              </div>
              <span className="font-semibold text-[#0D0F14]">ProspectHub</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-[#4E525A]">
              <Link href="/privacy" className="hover:text-[#0D0F14]">Confidentialite</Link>
              <Link href="/terms" className="hover:text-[#0D0F14]">CGU</Link>
              <Link href="/contact" className="hover:text-[#0D0F14]">Contact</Link>
            </div>

            <p className="text-sm text-[#9BA0A6]">
              2026 ProspectHub. Tous droits reserves.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
