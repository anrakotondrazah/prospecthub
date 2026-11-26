import Link from 'next/link'

export const metadata = {
  title: 'Sécurité et Confidentialité | ProspectHub',
  description: 'Comment nous protégeons vos données et celles de vos prospects. Hébergement France, chiffrement, conformité RGPD.',
}

const securitySections = [
  {
    id: 'hebergement',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="20" height="8" rx="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    ),
    title: 'Hébergement en France',
    features: [
      'Datacenters certifiés ISO 27001',
      'Sauvegardes quotidiennes chiffrées',
      'Redondance géographique assurée',
    ],
  },
  {
    id: 'chiffrement',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
    title: 'Chiffrement des données',
    features: [
      'Chiffrement TLS 1.3 en transit',
      'Chiffrement AES-256 au repos',
      'Mots de passe hashés (bcrypt)',
    ],
  },
  {
    id: 'acces',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Contrôle des accès',
    features: [
      'Authentification sécurisée (Supabase Auth)',
      'Sessions avec expiration automatique',
      'Journalisation des accès',
    ],
  },
  {
    id: 'conformite',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: 'Conformité RGPD',
    features: [
      'RGPD : vos obligations, notre accompagnement',
      'Bloctel vérifié avant appels',
      'Désinscription intégrée aux emails',
    ],
    link: { text: 'En savoir plus sur la conformité', href: '/conformite' },
  },
  {
    id: 'droits',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    title: 'Vos droits',
    features: [
      'Accès, rectification, effacement',
      'Export de vos données à tout moment',
      'Suppression sur demande',
    ],
    contact: '[dpo@prospecthub.fr]',
  },
  {
    id: 'incidents',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    title: 'Gestion des incidents',
    features: [
      'Notification sous 72h en cas d\'incident',
      'Procédure de réponse documentée',
      'Page statut : [status.prospecthub.fr]',
    ],
  },
]

export default function SecurityPage() {
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

          <div className="flex items-center gap-3">
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
            Sécurité et confidentialité
          </h1>

          <p className="text-xl text-[#4E525A] dark:text-[#9BA0A6] max-w-2xl mx-auto leading-relaxed">
            Comment nous protégeons vos données et celles de vos prospects
          </p>
        </div>
      </section>

      {/* Security Sections */}
      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {securitySections.map((section) => (
              <div
                key={section.id}
                className="group relative overflow-hidden rounded-[16px] border border-[#E2E4E6] dark:border-[#2D3039] bg-white/80 dark:bg-[#17191F]/80 backdrop-blur-sm p-8 hover:border-[#0066FF] dark:hover:border-[#0066FF] transition-all hover:shadow-lg hover:shadow-[#0066FF]/10"
              >
                {/* Glass effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="relative">
                  {/* Icon */}
                  <div className="mb-6 text-[#0066FF] dark:text-[#0066FF]">
                    {section.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-semibold text-[#0D0F14] dark:text-white mb-4">
                    {section.title}
                  </h3>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {section.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="flex-shrink-0 mt-0.5 text-[#0066FF]"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span className="text-[#4E525A] dark:text-[#9BA0A6]">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Contact or Link */}
                  {section.contact && (
                    <p className="text-sm text-[#9BA0A6] dark:text-[#4E525A]">
                      Contact DPO : <span className="text-[#0066FF] font-medium">{section.contact}</span>
                    </p>
                  )}

                  {section.link && (
                    <Link
                      href={section.link.href}
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#0066FF] hover:underline"
                    >
                      {section.link.text}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-[20px] border border-[#E2E4E6] dark:border-[#2D3039] bg-gradient-to-br from-[#0066FF] to-[#0052CC] p-12 text-center">
            {/* Glass overlay */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />

            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Des questions sur la sécurité ?
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Notre équipe est disponible pour répondre à toutes vos questions sur la protection des données.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-[#0066FF] bg-white rounded-[12px] hover:bg-[#F5F7F9] transition-all shadow-lg"
              >
                Contactez-nous
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
              <h4 className="text-sm font-semibold text-[#0D0F14] dark:text-white mb-4">Entreprise</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/securite" className="text-sm text-[#0066FF] font-medium">
                    Sécurité
                  </Link>
                </li>
                <li>
                  <Link href="/conformite" className="text-sm text-[#4E525A] dark:text-[#9BA0A6] hover:text-[#0D0F14] dark:hover:text-white transition-colors">
                    Conformité
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#0D0F14] dark:text-white mb-4">Ressources</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/aide" className="text-sm text-[#4E525A] dark:text-[#9BA0A6] hover:text-[#0D0F14] dark:hover:text-white transition-colors">
                    Centre d&apos;aide
                  </Link>
                </li>
                <li>
                  <a href="[status.prospecthub.fr]" className="text-sm text-[#4E525A] dark:text-[#9BA0A6] hover:text-[#0D0F14] dark:hover:text-white transition-colors">
                    Statut
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#0D0F14] dark:text-white mb-4">Badges</h4>
              <div className="flex flex-col gap-2">
                <span className="inline-flex items-center gap-2 text-sm text-[#4E525A] dark:text-[#9BA0A6]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="8" rx="2" />
                    <rect x="2" y="14" width="20" height="8" rx="2" />
                  </svg>
                  Hébergement France
                </span>
                <span className="inline-flex items-center gap-2 text-sm text-[#4E525A] dark:text-[#9BA0A6]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Données françaises, règles françaises
                </span>
              </div>
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
