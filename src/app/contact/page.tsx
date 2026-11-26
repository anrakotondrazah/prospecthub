import Link from 'next/link'

export const metadata = {
  title: 'Contact | ProspectHub',
  description: 'Contactez l\'équipe ProspectHub pour toute question, demande de support ou suggestion.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0F14]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 h-[72px] border-b border-[#E2E4E6] dark:border-[#2D3039] bg-white/98 dark:bg-[#0D0F14]/98 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#17191F] dark:bg-white rounded-[10px] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" className="text-white dark:text-[#17191F]" />
                <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" className="text-white dark:text-[#17191F]" />
                <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" className="text-white dark:text-[#17191F]" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-[#0D0F14] dark:text-white">ProspectHub</span>
          </Link>

          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-medium text-[#4E525A] dark:text-[#9BA0A6] hover:text-[#0D0F14] dark:hover:text-white transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 text-sm font-medium text-white bg-[#17191F] dark:bg-white dark:text-[#17191F] rounded-[10px] hover:bg-[#2D3039] dark:hover:bg-[#E2E4E6] transition-colors"
            >
              Commencer
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-[48px] md:text-[56px] font-bold text-[#0D0F14] dark:text-white leading-[1.1] tracking-[-0.02em] mb-6">
            Contactez-nous
          </h1>
          <p className="text-xl text-[#4E525A] dark:text-[#9BA0A6] max-w-2xl mx-auto leading-relaxed">
            Notre équipe est là pour répondre à toutes vos questions
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Support */}
            <div className="group relative overflow-hidden rounded-[16px] border border-[#E2E4E6] dark:border-[#2D3039] bg-white/80 dark:bg-[#17191F]/80 backdrop-blur-sm p-8 hover:border-[#0066FF] dark:hover:border-[#0066FF] transition-all hover:shadow-lg hover:shadow-[#0066FF]/10">
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="relative">
                <div className="mb-6 text-[#0066FF]">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                </div>

                <h3 className="text-2xl font-semibold text-[#0D0F14] dark:text-white mb-4">
                  Support technique
                </h3>

                <p className="text-[#4E525A] dark:text-[#9BA0A6] mb-6">
                  Besoin d&apos;aide avec ProspectHub ? Notre équipe support vous répond sous 24h.
                </p>

                <a
                  href="mailto:support@prospecthub.fr"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#0066FF] hover:underline"
                >
                  support@prospecthub.fr
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Commercial */}
            <div className="group relative overflow-hidden rounded-[16px] border border-[#E2E4E6] dark:border-[#2D3039] bg-white/80 dark:bg-[#17191F]/80 backdrop-blur-sm p-8 hover:border-[#0066FF] dark:hover:border-[#0066FF] transition-all hover:shadow-lg hover:shadow-[#0066FF]/10">
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="relative">
                <div className="mb-6 text-[#0066FF]">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87" />
                    <path d="M16 3.13a4 4 0 010 7.75" />
                  </svg>
                </div>

                <h3 className="text-2xl font-semibold text-[#0D0F14] dark:text-white mb-4">
                  Contact commercial
                </h3>

                <p className="text-[#4E525A] dark:text-[#9BA0A6] mb-6">
                  Vous souhaitez en savoir plus sur nos offres ? Parlons de votre projet.
                </p>

                <a
                  href="mailto:contact@prospecthub.fr"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#0066FF] hover:underline"
                >
                  contact@prospecthub.fr
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>
              </div>
            </div>

            {/* DPO */}
            <div className="group relative overflow-hidden rounded-[16px] border border-[#E2E4E6] dark:border-[#2D3039] bg-white/80 dark:bg-[#17191F]/80 backdrop-blur-sm p-8 hover:border-[#0066FF] dark:hover:border-[#0066FF] transition-all hover:shadow-lg hover:shadow-[#0066FF]/10">
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="relative">
                <div className="mb-6 text-[#0066FF]">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>

                <h3 className="text-2xl font-semibold text-[#0D0F14] dark:text-white mb-4">
                  Protection des données
                </h3>

                <p className="text-[#4E525A] dark:text-[#9BA0A6] mb-6">
                  Questions sur vos données personnelles ou exercice de vos droits RGPD.
                </p>

                <a
                  href="mailto:dpo@prospecthub.fr"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#0066FF] hover:underline"
                >
                  dpo@prospecthub.fr
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="max-w-3xl mx-auto">
            <div className="rounded-[16px] border border-[#E2E4E6] dark:border-[#2D3039] bg-white/80 dark:bg-[#17191F]/80 backdrop-blur-sm p-8">
              <h2 className="text-2xl font-semibold text-[#0D0F14] dark:text-white mb-6 text-center">
                Informations pratiques
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-1 text-[#0066FF]">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-[#0D0F14] dark:text-white mb-2">
                      Délai de réponse
                    </h3>
                    <p className="text-[#4E525A] dark:text-[#9BA0A6]">
                      Nous nous engageons à répondre à toutes les demandes sous 24h ouvrées maximum.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-1 text-[#0066FF]">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-[#0D0F14] dark:text-white mb-2">
                      Localisation
                    </h3>
                    <p className="text-[#4E525A] dark:text-[#9BA0A6]">
                      ProspectHub SAS<br />
                      Antananarivo, Madagascar<br />
                      Service clients basé en France
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-1 text-[#0066FF]">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-[#0D0F14] dark:text-white mb-2">
                      Données sécurisées
                    </h3>
                    <p className="text-[#4E525A] dark:text-[#9BA0A6]">
                      Toutes vos communications sont chiffrées. Vos données personnelles sont protégées conformément au RGPD.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-[20px] border border-[#E2E4E6] dark:border-[#2D3039] bg-gradient-to-br from-[#0066FF] to-[#0052CC] p-12 text-center">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Prêt à transformer votre prospection ?
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Essayez ProspectHub gratuitement pendant 14 jours. Aucune carte bancaire requise.
              </p>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-[#0066FF] bg-white rounded-[12px] hover:bg-[#F5F7F9] transition-all shadow-lg"
              >
                Commencer gratuitement
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E2E4E6] dark:border-[#2D3039] py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-sm font-semibold text-[#0D0F14] dark:text-white mb-4">Produit</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/#features" className="text-sm text-[#4E525A] dark:text-[#9BA0A6] hover:text-[#0D0F14] dark:hover:text-white transition-colors">
                    Fonctionnalités
                  </Link>
                </li>
                <li>
                  <Link href="/#pricing" className="text-sm text-[#4E525A] dark:text-[#9BA0A6] hover:text-[#0D0F14] dark:hover:text-white transition-colors">
                    Tarifs
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#0D0F14] dark:text-white mb-4">Légal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms" className="text-sm text-[#4E525A] dark:text-[#9BA0A6] hover:text-[#0D0F14] dark:hover:text-white transition-colors">
                    CGU
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm text-[#4E525A] dark:text-[#9BA0A6] hover:text-[#0D0F14] dark:hover:text-white transition-colors">
                    Confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="/securite" className="text-sm text-[#4E525A] dark:text-[#9BA0A6] hover:text-[#0D0F14] dark:hover:text-white transition-colors">
                    Sécurité
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#0D0F14] dark:text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/contact" className="text-sm text-[#0066FF] font-medium">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#0D0F14] dark:text-white mb-4">ProspectHub</h4>
              <p className="text-sm text-[#4E525A] dark:text-[#9BA0A6]">
                La solution de prospection commerciale B2B pour PME françaises.
              </p>
            </div>
          </div>
          <div className="pt-8 border-t border-[#E2E4E6] dark:border-[#2D3039]">
            <p className="text-sm text-[#9BA0A6] dark:text-[#4E525A] text-center">
              © 2026 ProspectHub. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
